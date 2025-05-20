const nodes = require("../ast/nodes");

/**
 * Transformer for @only_owner decorator
 * Ensures an owner state variable exists
 * Adds an onlyOwner modifier to check if msg.sender is the owner
 * Applies the modifier to the decorated function
 */
class OnlyOwnerTransformer {
  /**
   * Transform the AST for a function decorated with @only_owner
   * @param {Object} ast - The full AST
   * @param {Object} contract - The contract node
   * @param {Object} func - The function node to transform
   * @returns {Object} - The modified AST
   */
  static transform(ast, contract, func) {
    console.log(`Applying owner restriction to function '${func.name}'`);

    const ownerVarName = "owner";
    const modifierName = "onlyOwner";

    // Ensure contract has a state section
    if (!contract.state) {
      contract.state = { type: "StateDeclaration", variables: [] };
    }

    // If state is not an object with variables, initialize it properly
    if (!contract.state.variables) {
      contract.state.variables = [];
    }

    // Check if owner variable already exists
    const ownerVarExists = contract.state.variables.some(
      (v) => v.name === ownerVarName
    );

    // Add owner variable if it doesn't exist
    if (!ownerVarExists) {
      const addressType = new nodes.Type("address");
      const msgSender = new nodes.Identifier("msg.sender");
      const ownerVar = {
        type: "StateVariable",
        name: ownerVarName,
        type: addressType,
        initialValue: msgSender,
      };

      contract.state.variables.push(ownerVar);
    }

    // Initialize modifiers array if it doesn't exist
    if (!contract.modifiers) {
      contract.modifiers = [];
    }

    // Check if the modifier already exists
    const modifierExists = contract.modifiers.some(
      (m) => m.name === modifierName
    );

    // Add onlyOwner modifier if it doesn't exist
    if (!modifierExists) {
      const ownerCheckCondition = {
        type: "BinaryExpression",
        left: { type: "Identifier", name: "msg.sender" },
        operator: "==",
        right: { type: "Identifier", name: ownerVarName },
      };

      const requireStmt = {
        type: "RequireStatement",
        condition: ownerCheckCondition,
        message: {
          type: "Literal",
          value: '"Caller is not the owner"',
          valueType: "string",
        },
      };

      const modifier = {
        type: "Modifier",
        name: modifierName,
        parameters: [],
        body: [requireStmt, { type: "PlaceholderStatement" }],
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

module.exports = OnlyOwnerTransformer;
