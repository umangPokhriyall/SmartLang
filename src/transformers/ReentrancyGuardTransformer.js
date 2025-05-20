const nodes = require("../ast/nodes");

/**
 * Transformer for @reentrancy_guard decorator
 * Adds a boolean state variable to track reentrancy lock
 * Adds a nonReentrant modifier to check and toggle the lock
 * Applies the modifier to the decorated function
 */
class ReentrancyGuardTransformer {
  /**
   * Transform the AST for a function decorated with @reentrancy_guard
   * @param {Object} ast - The full AST
   * @param {Object} contract - The contract node
   * @param {Object} func - The function node to transform
   * @returns {Object} - The modified AST
   */
  static transform(ast, contract, func) {
    console.log(`Applying reentrancy guard to function '${func.name}'`);

    // Create a unique lock variable name based on function name
    const lockVarName = `_reentrancyLock_${func.name}`;
    const modifierName = `nonReentrant_${func.name}`;

    // Check if lock variable already exists in state
    if (!contract.state) {
      contract.state = { type: "StateDeclaration", variables: [] };
    }

    // If state is not an object with variables (just in case), initialize it properly
    if (!contract.state.variables) {
      contract.state.variables = [];
    }

    // Check if lock variable already exists
    const lockVarExists = contract.state.variables.some(
      (v) => v.name === lockVarName
    );

    // Add lock variable if it doesn't exist
    if (!lockVarExists) {
      const boolType = new nodes.Type("bool");
      const falseLiteral = new nodes.Literal("false", "boolean");
      const lockVar = {
        type: "StateVariable",
        name: lockVarName,
        type: boolType,
        initialValue: falseLiteral,
      };

      contract.state.variables.push(lockVar);
    }

    // Initialize modifiers array if it doesn't exist
    if (!contract.modifiers) {
      contract.modifiers = [];
    }

    // Check if the modifier already exists
    const modifierExists = contract.modifiers.some(
      (m) => m.name === modifierName
    );

    // Add nonReentrant modifier if it doesn't exist
    if (!modifierExists) {
      const lockCheckCondition = {
        type: "BinaryExpression",
        left: { type: "Identifier", name: lockVarName },
        operator: "==",
        right: { type: "Literal", value: "false", valueType: "boolean" },
      };

      const requireStmt = {
        type: "RequireStatement",
        condition: lockCheckCondition,
        message: {
          type: "Literal",
          value: '"ReentrancyGuard: reentrant call"',
          valueType: "string",
        },
      };

      const setLockTrueStmt = {
        type: "AssignmentStatement",
        target: { type: "Identifier", name: lockVarName },
        operator: "=",
        value: { type: "Literal", value: "true", valueType: "boolean" },
      };

      const setLockFalseStmt = {
        type: "AssignmentStatement",
        target: { type: "Identifier", name: lockVarName },
        operator: "=",
        value: { type: "Literal", value: "false", valueType: "boolean" },
      };

      const modifier = {
        type: "Modifier",
        name: modifierName,
        parameters: [],
        body: [
          requireStmt,
          setLockTrueStmt,
          { type: "PlaceholderStatement" },
          setLockFalseStmt,
        ],
      };

      contract.modifiers.push(modifier);
    }

    // Initialize the function's modifiers array if it doesn't exist
    if (!func.modifiers) {
      func.modifiers = [];
    }

    // Add the modifier to the function if it doesn't already have it
    if (!func.modifiers.includes(modifierName)) {
      func.modifiers.push(modifierName);
    }

    return ast;
  }
}

module.exports = ReentrancyGuardTransformer;
