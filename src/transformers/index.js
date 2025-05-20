// Main transformer module that orchestrates all security transformations
const ReentrancyGuardTransformer = require("./ReentrancyGuardTransformer");
const OnlyOwnerTransformer = require("./OnlyOwnerTransformer");
const SafeMathTransformer = require("./SafeMathTransformer");

/**
 * Applies all security transformations to the AST
 * @param {Object} ast - The Abstract Syntax Tree
 * @returns {Object} - The transformed AST
 */
function applySecurityTransformations(ast) {
  console.log("Applying security transformations to the AST...");

  // Create a deep copy of the AST to avoid modifying the original
  let transformedAst = JSON.parse(JSON.stringify(ast));

  // Process each contract in the program
  for (const contract of transformedAst.contracts) {
    // Apply SafeMath transformer at contract level
    if (
      contract.decorators &&
      contract.decorators.some((d) => d.name === "safe_math")
    ) {
      transformedAst = SafeMathTransformer.transform(transformedAst, contract);
    }

    // Process each function in the contract
    if (contract.functions) {
      for (const func of contract.functions) {
        // Apply reentrancy guard transformer
        if (
          func.decorators &&
          func.decorators.some((d) => d.name === "reentrancy_guard")
        ) {
          transformedAst = ReentrancyGuardTransformer.transform(
            transformedAst,
            contract,
            func
          );
        }

        // Apply only owner transformer
        if (
          func.decorators &&
          func.decorators.some((d) => d.name === "only_owner")
        ) {
          transformedAst = OnlyOwnerTransformer.transform(
            transformedAst,
            contract,
            func
          );
        }
      }
    }
  }

  return transformedAst;
}

module.exports = {
  applySecurityTransformations,
};
