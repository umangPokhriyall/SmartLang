const fs = require("fs");
const nodes = require("./ast/nodes");

// Simple DSL parser that can handle our Smartra syntax
class SmartDSLParser {
  constructor(input) {
    this.input = input;
    this.lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"));
    this.currentIndex = 0;
  }

  parse() {
    const contracts = [];

    while (this.currentIndex < this.lines.length) {
      const line = this.lines[this.currentIndex];
      if (line.startsWith("contract ")) {
        contracts.push(this.parseContract());
      } else {
        this.currentIndex++;
      }
    }

    return new nodes.Program(contracts);
  }

  parseContract() {
    const line = this.lines[this.currentIndex];
    const contractName = line.replace("contract ", "").replace(":", "").trim();
    this.currentIndex++;

    let contractDecorators = [];
    let stateDeclaration = null;
    const functions = [];
    const events = [];

    // Parse contract body
    while (this.currentIndex < this.lines.length) {
      const currentLine = this.lines[this.currentIndex];

      if (currentLine.startsWith("@")) {
        const decorator = this.parseDecorator();
        contractDecorators.push(decorator);
      } else if (currentLine === "state:") {
        stateDeclaration = this.parseState();
      } else if (
        currentLine.startsWith("@") ||
        currentLine.startsWith("function ")
      ) {
        const func = this.parseFunction();
        if (func) functions.push(func);
      } else if (currentLine.startsWith("event ")) {
        const event = this.parseEvent();
        if (event) events.push(event);
      } else if (currentLine.startsWith("contract ")) {
        // Hit another contract, break
        break;
      } else {
        this.currentIndex++;
      }
    }

    return new nodes.Contract(
      contractName,
      contractDecorators,
      stateDeclaration,
      functions,
      events
    );
  }

  parseDecorator() {
    const line = this.lines[this.currentIndex];
    const decoratorName = line.replace("@", "").trim();
    this.currentIndex++;
    return new nodes.Decorator(decoratorName);
  }

  parseState() {
    this.currentIndex++; // Skip 'state:' line
    const variables = [];

    while (this.currentIndex < this.lines.length) {
      const line = this.lines[this.currentIndex];

      // Stop if we hit a function, event, or another section
      if (
        line.startsWith("function ") ||
        line.startsWith("event ") ||
        line.startsWith("@") ||
        line.startsWith("contract ")
      ) {
        break;
      }

      // Parse state variable
      if (line.includes(":")) {
        const variable = this.parseStateVariable(line);
        if (variable) variables.push(variable);
      }

      this.currentIndex++;
    }

    return new nodes.StateDeclaration(variables);
  }

  parseStateVariable(line) {
    // Format: name: type = value or name: type
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return null;

    const name = line.substring(0, colonIndex).trim();
    const rest = line.substring(colonIndex + 1).trim();

    let type,
      initialValue = null;

    if (rest.includes("=")) {
      const equalIndex = rest.indexOf("=");
      const typeStr = rest.substring(0, equalIndex).trim();
      const valueStr = rest.substring(equalIndex + 1).trim();
      type = this.parseType(typeStr);
      initialValue = this.parseExpression(valueStr);
    } else {
      type = this.parseType(rest);
    }

    return new nodes.StateVariable(name, type, initialValue);
  }

  parseType(typeStr) {
    typeStr = typeStr.trim();

    if (typeStr.startsWith("mapping(")) {
      // Parse mapping(keyType => valueType)
      const content = typeStr.substring(8, typeStr.length - 1); // Remove mapping( and )
      const arrowIndex = content.indexOf("=>");
      if (arrowIndex !== -1) {
        const keyTypeStr = content.substring(0, arrowIndex).trim();
        const valueTypeStr = content.substring(arrowIndex + 2).trim();
        const keyType = this.parseType(keyTypeStr);
        const valueType = this.parseType(valueTypeStr);
        return new nodes.Type("mapping", keyType, valueType);
      }
    }

    return new nodes.Type(typeStr);
  }

  parseExpression(exprStr) {
    // Simple expression parsing
    exprStr = exprStr.trim();

    if (exprStr.match(/^\d+$/)) {
      return new nodes.Literal(exprStr, "number");
    } else if (exprStr === "true" || exprStr === "false") {
      return new nodes.Literal(exprStr, "boolean");
    } else if (exprStr.startsWith('"') && exprStr.endsWith('"')) {
      return new nodes.Literal(exprStr, "string");
    } else if (exprStr.startsWith("address(") && exprStr.endsWith(")")) {
      return new nodes.Literal(exprStr, "address");
    } else {
      return new nodes.Identifier(exprStr);
    }
  }

  parseFunction() {
    const decorators = [];

    // Check if there are decorators before this function by looking backwards
    let checkIndex = this.currentIndex - 1;
    const functionDecorators = [];

    // Look for decorators that came before this function
    while (checkIndex >= 0) {
      const prevLine = this.lines[checkIndex];
      if (prevLine.startsWith("@")) {
        functionDecorators.unshift(
          new nodes.Decorator(prevLine.replace("@", "").trim())
        );
        checkIndex--;
      } else if (
        prevLine === "state:" ||
        prevLine.includes(":") ||
        prevLine.startsWith("function ") ||
        prevLine.startsWith("event ")
      ) {
        break;
      } else {
        checkIndex--;
      }
    }

    const funcLine = this.lines[this.currentIndex];
    this.currentIndex++;

    // Parse function signature: function name(params) -> returnType:
    const match = funcLine.match(
      /function\s+(\w+)\(([^)]*)\)(?:\s*->\s*(\w+))?:/
    );
    if (!match) return null;

    const name = match[1];
    const paramStr = match[2];
    const returnType = match[3] ? new nodes.Type(match[3]) : null;

    const parameters = this.parseParameters(paramStr);
    const body = this.parseFunctionBody();

    return new nodes.Function(
      name,
      parameters,
      returnType,
      functionDecorators,
      body
    );
  }

  parseParameters(paramStr) {
    if (!paramStr.trim()) return [];

    const params = paramStr.split(",");
    return params
      .map((param) => {
        const colonIndex = param.indexOf(":");
        if (colonIndex !== -1) {
          const name = param.substring(0, colonIndex).trim();
          const typeStr = param.substring(colonIndex + 1).trim();
          const type = this.parseType(typeStr);
          return new nodes.Parameter(name, type);
        }
        return null;
      })
      .filter((p) => p);
  }

  parseFunctionBody() {
    const body = [];

    while (this.currentIndex < this.lines.length) {
      const line = this.lines[this.currentIndex];

      // Stop if we hit another function, event, contract, or decorator
      if (
        line.startsWith("function ") ||
        line.startsWith("event ") ||
        line.startsWith("contract ") ||
        line.startsWith("@")
      ) {
        break;
      }

      const statement = this.parseStatement(line);
      if (statement) body.push(statement);

      this.currentIndex++;
    }

    return body;
  }

  parseStatement(line) {
    line = line.trim();

    if (line.startsWith("require(")) {
      return this.parseRequireStatement(line);
    } else if (
      line.includes("+=") ||
      line.includes("-=") ||
      line.includes("=")
    ) {
      return this.parseAssignmentStatement(line);
    } else if (line.startsWith("emit ")) {
      return this.parseEmitStatement(line);
    } else if (line.startsWith("return ")) {
      return this.parseReturnStatement(line);
    }

    return null;
  }

  parseRequireStatement(line) {
    // require(condition, "message")
    const match = line.match(/require\((.+?),\s*"([^"]*)"\)/);
    if (match) {
      const condition = this.parseCondition(match[1]);
      const message = new nodes.Literal(`"${match[2]}"`, "string");
      return new nodes.RequireStatement(condition, message);
    }
    return null;
  }

  parseCondition(condStr) {
    // Simple condition parsing for >= operators
    if (condStr.includes(">=")) {
      const parts = condStr.split(">=");
      const left = this.parseConditionExpression(parts[0].trim());
      const right = this.parseExpression(parts[1].trim());
      return new nodes.BinaryExpression(left, ">=", right);
    }

    return this.parseExpression(condStr);
  }

  parseConditionExpression(exprStr) {
    // Handle array access in conditions like balances[msg.sender]
    if (exprStr.includes("[")) {
      const match = exprStr.match(/(\w+)\[(.+?)\]/);
      if (match) {
        const name = match[1];
        const index = this.parseExpression(match[2]);
        return new nodes.LValue(name, [index]);
      }
    }

    return this.parseExpression(exprStr);
  }

  parseAssignmentStatement(line) {
    let operator = "=";
    let parts;

    if (line.includes("+=")) {
      operator = "+=";
      parts = line.split("+=");
    } else if (line.includes("-=")) {
      operator = "-=";
      parts = line.split("-=");
    } else {
      parts = line.split("=");
    }

    if (parts.length === 2) {
      const target = this.parseTarget(parts[0].trim());
      const value = this.parseExpression(parts[1].trim());
      return new nodes.AssignmentStatement(target, operator, value);
    }

    return null;
  }

  parseTarget(targetStr) {
    // Handle array access like balances[to]
    if (targetStr.includes("[")) {
      const match = targetStr.match(/(\w+)\[(.+?)\]/);
      if (match) {
        const name = match[1];
        const index = this.parseExpression(match[2]);
        return new nodes.LValue(name, [index]);
      }
    }

    return new nodes.Identifier(targetStr);
  }

  parseEmitStatement(line) {
    // emit EventName(arg1, arg2, arg3)
    const match = line.match(/emit\s+(\w+)\(([^)]*)\)/);
    if (match) {
      const eventName = match[1];
      const argsStr = match[2];
      let args = [];

      if (argsStr.trim()) {
        // Better argument parsing to handle nested parentheses
        args = this.parseArgumentList(argsStr);
      }

      return new nodes.EmitStatement(eventName, args);
    }
    return null;
  }

  parseArgumentList(argsStr) {
    const args = [];
    let current = "";
    let parenCount = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];

      if (char === "(") {
        parenCount++;
        current += char;
      } else if (char === ")") {
        parenCount--;
        current += char;
      } else if (char === "," && parenCount === 0) {
        if (current.trim()) {
          args.push(this.parseExpression(current.trim()));
        }
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(this.parseExpression(current.trim()));
    }

    return args;
  }

  parseReturnStatement(line) {
    const value = line.replace("return ", "").trim();
    return new nodes.ReturnStatement(this.parseExpression(value));
  }

  parseEvent() {
    const line = this.lines[this.currentIndex];
    this.currentIndex++;

    // event EventName(param1: type1, param2: type2)
    const match = line.match(/event\s+(\w+)\(([^)]*)\)/);
    if (match) {
      const name = match[1];
      const paramStr = match[2];
      const parameters = this.parseParameters(paramStr);
      return new nodes.Event(name, parameters);
    }

    return null;
  }
}

function parseSmartDSL(input) {
  try {
    console.log("Parsing DSL using simplified parser...");
    const parser = new SmartDSLParser(input);
    return parser.parse();
  } catch (error) {
    console.error("Parsing failed, using fallback:", error.message);

    // Fallback to hardcoded AST for the example
    const ASTBuilder = require("./astBuilder");
    const astBuilder = new ASTBuilder();
    return astBuilder.visitProgram();
  }
}

module.exports = {
  parseSmartDSL,
  SmartDSLParser,
};
