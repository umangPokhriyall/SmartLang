/**
 * SolidityGenerator
 * Converts the AST into Solidity code
 */
class SolidityGenerator {
  /**
   * Generate Solidity code from an AST
   * @param {Object} ast - The AST (after transformations)
   * @returns {string} - The generated Solidity code
   */
  static generate(ast) {
    const solidityCode = [];

    // Add license and pragma
    solidityCode.push("// SPDX-License-Identifier: MIT");

    // Use the metadata from SafeMathTransformer if available
    const solidityVersion = ast.metadata?.solidityVersion || "^0.8.0";
    solidityCode.push(`pragma solidity ${solidityVersion};`);
    solidityCode.push("");

    // Generate code for each contract
    for (const contract of ast.contracts) {
      solidityCode.push(this.generateContract(contract));
    }

    return solidityCode.join("\n");
  }

  /**
   * Generate Solidity code for a contract
   * @param {Object} contract - The contract node
   * @returns {string} - The generated Solidity code
   */
  static generateContract(contract) {
    const lines = [];

    // Contract declaration
    lines.push(`contract ${contract.name} {`);

    // State variables
    if (
      contract.state &&
      contract.state.variables &&
      contract.state.variables.length > 0
    ) {
      lines.push("");
      lines.push("    // State variables");
      for (const variable of contract.state.variables) {
        lines.push(`    ${this.generateStateVariable(variable)}`);
      }
    }

    // Events
    if (contract.events && contract.events.length > 0) {
      lines.push("");
      lines.push("    // Events");
      for (const event of contract.events) {
        lines.push(`    ${this.generateEvent(event)}`);
      }
    }

    // Modifiers (added by transformers)
    if (contract.modifiers && contract.modifiers.length > 0) {
      lines.push("");
      lines.push("    // Modifiers");
      for (const modifier of contract.modifiers) {
        lines.push(this.generateModifier(modifier));
      }
    }

    // Constructor (if owner is defined without initializer)
    const needsConstructor = contract.state?.variables?.some(
      (v) =>
        v.name === "owner" &&
        (!v.initialValue || v.initialValue.name === "msg.sender")
    );

    if (needsConstructor) {
      lines.push("");
      lines.push("    // Constructor");
      lines.push("    constructor() {");
      lines.push("        owner = msg.sender;");
      lines.push("    }");
    }

    // Functions
    if (contract.functions && contract.functions.length > 0) {
      lines.push("");
      lines.push("    // Functions");
      for (const func of contract.functions) {
        lines.push(this.generateFunction(func));
      }
    }

    // Close contract
    lines.push("}");

    return lines.join("\n");
  }

  /**
   * Generate Solidity code for a state variable
   * @param {Object} variable - The state variable node
   * @returns {string} - The generated Solidity code
   */
  static generateStateVariable(variable) {
    let code = `${this.generateType(variable.type)} ${variable.name}`;

    if (variable.initialValue) {
      if (
        variable.initialValue.type === "Identifier" &&
        variable.initialValue.name === "msg.sender"
      ) {
        // Skip initializing owner with msg.sender as we'll do this in constructor
        return `${code};`;
      }
      code += ` = ${this.generateExpression(variable.initialValue)}`;
    }

    return `${code};`;
  }

  /**
   * Generate Solidity code for an event
   * @param {Object} event - The event node
   * @returns {string} - The generated Solidity code
   */
  static generateEvent(event) {
    const params = event.parameters
      .map((param) => `${this.generateType(param.type)} ${param.name}`)
      .join(", ");

    return `event ${event.name}(${params});`;
  }

  /**
   * Generate Solidity code for a modifier
   * @param {Object} modifier - The modifier node
   * @returns {string} - The generated Solidity code
   */
  static generateModifier(modifier) {
    const lines = [];
    const params = modifier.parameters
      ? modifier.parameters
          .map((param) => `${this.generateType(param.type)} ${param.name}`)
          .join(", ")
      : "";

    lines.push(`    modifier ${modifier.name}(${params}) {`);

    // Generate modifier body
    if (modifier.body) {
      for (const statement of modifier.body) {
        if (statement.type === "PlaceholderStatement") {
          lines.push("        _;");
        } else {
          lines.push(`        ${this.generateStatement(statement)}`);
        }
      }
    } else {
      lines.push("        _;");
    }

    lines.push("    }");
    return lines.join("\n");
  }

  /**
   * Generate Solidity code for a function
   * @param {Object} func - The function node
   * @returns {string} - The generated Solidity code
   */
  static generateFunction(func) {
    const lines = [];

    // Function parameters
    const params = func.parameters
      .map((param) => `${this.generateType(param.type)} ${param.name}`)
      .join(", ");

    // Function return type
    const returns = func.returnType
      ? ` returns (${this.generateType(func.returnType)})`
      : "";

    // Function modifiers
    const modifiers =
      func.modifiers && func.modifiers.length > 0
        ? " " + func.modifiers.join(" ")
        : "";

    // Function declaration
    lines.push(
      `    function ${func.name}(${params}) public${modifiers}${returns} {`
    );

    // Function body
    if (func.body) {
      for (const statement of func.body) {
        lines.push(`        ${this.generateStatement(statement)}`);
      }
    }

    lines.push("    }");
    lines.push("");
    return lines.join("\n");
  }

  /**
   * Generate Solidity code for a statement
   * @param {Object} statement - The statement node
   * @returns {string} - The generated Solidity code
   */
  static generateStatement(statement) {
    switch (statement.type) {
      case "RequireStatement":
        return this.generateRequireStatement(statement);
      case "AssignmentStatement":
        return this.generateAssignmentStatement(statement);
      case "EmitStatement":
        return this.generateEmitStatement(statement);
      case "ReturnStatement":
        return this.generateReturnStatement(statement);
      default:
        return `/* Unsupported statement type: ${statement.type} */`;
    }
  }

  /**
   * Generate Solidity code for a require statement
   * @param {Object} statement - The require statement node
   * @returns {string} - The generated Solidity code
   */
  static generateRequireStatement(statement) {
    const condition = this.generateExpression(statement.condition);

    if (statement.message) {
      const message = this.generateExpression(statement.message);
      return `require(${condition}, ${message});`;
    }

    return `require(${condition});`;
  }

  /**
   * Generate Solidity code for an assignment statement
   * @param {Object} statement - The assignment statement node
   * @returns {string} - The generated Solidity code
   */
  static generateAssignmentStatement(statement) {
    const target = this.generateExpression(statement.target);
    const value = this.generateExpression(statement.value);

    return `${target} ${statement.operator} ${value};`;
  }

  /**
   * Generate Solidity code for an emit statement
   * @param {Object} statement - The emit statement node
   * @returns {string} - The generated Solidity code
   */
  static generateEmitStatement(statement) {
    const args = statement.args
      .map((arg) => this.generateExpression(arg))
      .join(", ");

    return `emit ${statement.event}(${args});`;
  }

  /**
   * Generate Solidity code for a return statement
   * @param {Object} statement - The return statement node
   * @returns {string} - The generated Solidity code
   */
  static generateReturnStatement(statement) {
    if (!statement.value) {
      return "return;";
    }

    return `return ${this.generateExpression(statement.value)};`;
  }

  /**
   * Generate Solidity code for an expression
   * @param {Object} expression - The expression node
   * @returns {string} - The generated Solidity code
   */
  static generateExpression(expression) {
    if (!expression) return "";

    switch (expression.type) {
      case "Identifier":
        return expression.name;
      case "Literal":
        return expression.value;
      case "LValue":
        if (expression.indices && expression.indices.length > 0) {
          const indices = expression.indices
            .map((idx) => `[${this.generateExpression(idx)}]`)
            .join("");
          return `${expression.name}${indices}`;
        }
        return expression.name;
      case "BinaryExpression":
        return `${this.generateExpression(expression.left)} ${expression.operator} ${this.generateExpression(expression.right)}`;
      case "UnaryExpression":
        return `${expression.operator}${this.generateExpression(expression.operand)}`;
      case "FunctionCall":
        const args = expression.args
          ? expression.args
              .map((arg) => this.generateExpression(arg))
              .join(", ")
          : "";
        return `${expression.name}(${args})`;
      default:
        return `/* Unsupported expression type: ${expression.type} */`;
    }
  }

  /**
   * Generate Solidity code for a type
   * @param {Object} type - The type node
   * @returns {string} - The generated Solidity code
   */
  static generateType(type) {
    if (!type) return "unknown";

    if (type.name === "mapping") {
      const keyType = this.generateType(type.keyType);
      const valueType = this.generateType(type.valueType);
      return `mapping(${keyType} => ${valueType})`;
    }

    if (type.name === "array") {
      const elementType = this.generateType(type.valueType);
      return `${elementType}[]`;
    }

    return type.name;
  }
}

module.exports = SolidityGenerator;
