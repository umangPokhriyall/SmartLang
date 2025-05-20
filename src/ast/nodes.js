// AST Node definitions for Smartra DSL

class Node {
  constructor(type) {
    this.type = type;
  }
}

class Program extends Node {
  constructor(contracts) {
    super("Program");
    this.contracts = contracts || [];
  }
}

class Contract extends Node {
  constructor(name, decorators, state, functions, events) {
    super("Contract");
    this.name = name;
    this.decorators = decorators || [];
    this.state = state || [];
    this.functions = functions || [];
    this.events = events || [];
  }
}

class Decorator extends Node {
  constructor(name) {
    super("Decorator");
    this.name = name;
  }
}

class StateDeclaration extends Node {
  constructor(variables) {
    super("StateDeclaration");
    this.variables = variables || [];
  }
}

class StateVariable extends Node {
  constructor(name, type, initialValue) {
    super("StateVariable");
    this.name = name;
    this.type = type;
    this.initialValue = initialValue || null;
  }
}

class Function extends Node {
  constructor(name, parameters, returnType, decorators, body) {
    super("Function");
    this.name = name;
    this.parameters = parameters || [];
    this.returnType = returnType;
    this.decorators = decorators || [];
    this.body = body || [];
  }
}

class Parameter extends Node {
  constructor(name, type) {
    super("Parameter");
    this.name = name;
    this.type = type;
  }
}

class Type extends Node {
  constructor(name, keyType, valueType) {
    super("Type");
    this.name = name;
    this.keyType = keyType; // For mappings
    this.valueType = valueType; // For mappings and arrays
  }
}

class Event extends Node {
  constructor(name, parameters) {
    super("Event");
    this.name = name;
    this.parameters = parameters || [];
  }
}

// Statement types
class RequireStatement extends Node {
  constructor(condition, message) {
    super("RequireStatement");
    this.condition = condition;
    this.message = message;
  }
}

class AssignmentStatement extends Node {
  constructor(target, operator, value) {
    super("AssignmentStatement");
    this.target = target;
    this.operator = operator;
    this.value = value;
  }
}

class EmitStatement extends Node {
  constructor(event, args) {
    super("EmitStatement");
    this.event = event;
    this.args = args || [];
  }
}

class ReturnStatement extends Node {
  constructor(value) {
    super("ReturnStatement");
    this.value = value;
  }
}

// Expression types
class Identifier extends Node {
  constructor(name) {
    super("Identifier");
    this.name = name;
  }
}

class LValue extends Node {
  constructor(name, indices) {
    super("LValue");
    this.name = name;
    this.indices = indices || [];
  }
}

class BinaryExpression extends Node {
  constructor(left, operator, right) {
    super("BinaryExpression");
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class UnaryExpression extends Node {
  constructor(operator, operand) {
    super("UnaryExpression");
    this.operator = operator;
    this.operand = operand;
  }
}

class FunctionCall extends Node {
  constructor(name, args) {
    super("FunctionCall");
    this.name = name;
    this.args = args || [];
  }
}

class Literal extends Node {
  constructor(value, valueType) {
    super("Literal");
    this.value = value;
    this.valueType = valueType; // 'number', 'string', 'boolean', 'address'
  }
}

module.exports = {
  Node,
  Program,
  Contract,
  Decorator,
  StateDeclaration,
  StateVariable,
  Function,
  Parameter,
  Type,
  Event,
  RequireStatement,
  AssignmentStatement,
  EmitStatement,
  ReturnStatement,
  Identifier,
  LValue,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Literal,
};
