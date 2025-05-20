const fs = require("fs");
const path = require("path");
const antlr4 = require("antlr4");
const ASTBuilder = require("./astBuilder");
const { applySecurityTransformations } = require("./transformers");
const SolidityGenerator = require("./SolidityGenerator");

// Note: In a real implementation, these would be imported from ANTLR-generated files
// For the prototype, we're simulating this part
/*
const SmartraLexer = require('../dist/SmartraLexer').SmartraLexer;
const SmartraParser = require('../dist/SmartraParser').SmartraParser;
*/

// Main compiler function
async function compile(filePath, outputPath) {
  try {
    console.log(`Compiling ${filePath}...`);

    // Read the input file
    const input = fs.readFileSync(filePath, "utf8");
    console.log("\nDSL Source Code:");
    console.log("------------------------------");
    console.log(input);
    console.log("------------------------------\n");

    // In a real implementation, we would use ANTLR for parsing:
    /*
    const chars = new antlr4.InputStream(input);
    const lexer = new SmartraLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new SmartraParser(tokens);
    const tree = parser.program();
    */

    // For the prototype, we'll create an AST directly
    console.log("Building Abstract Syntax Tree (AST)...");
    const astBuilder = new ASTBuilder();
    let ast = astBuilder.visitProgram(/* would be tree in real impl */);

    // Print the AST
    console.log("\nGenerated AST:");
    console.log("------------------------------");
    console.log(JSON.stringify(ast, null, 2));
    console.log("------------------------------\n");

    // Apply security transformations for decorators
    console.log("Applying security transformations...");
    const transformedAst = applySecurityTransformations(ast);

    // Print the transformed AST
    console.log("\nTransformed AST:");
    console.log("------------------------------");
    console.log(JSON.stringify(transformedAst, null, 2));
    console.log("------------------------------\n");

    // Generate Solidity code
    console.log("Generating Solidity code...");
    const solidityCode = SolidityGenerator.generate(transformedAst);

    console.log("\nGenerated Solidity Code:");
    console.log("------------------------------");
    console.log(solidityCode);
    console.log("------------------------------\n");

    // Save to output file if a path is provided
    if (outputPath) {
      fs.writeFileSync(outputPath, solidityCode);
      console.log(`Solidity code written to ${outputPath}`);
    }

    console.log("Compilation successful!");

    return {
      ast,
      transformedAst,
      solidityCode,
    };
  } catch (error) {
    console.error("Compilation failed:", error);
    console.error(error.stack);
  }
}

// Run the compiler on the example file
const exampleFile = path.join(__dirname, "..", "examples", "token.sl");
// You can specify an output path as the second argument
const outputFile = process.argv[2] ? process.argv[2] : null;
compile(exampleFile, outputFile);

module.exports = {
  compile,
};
