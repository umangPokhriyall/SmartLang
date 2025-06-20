const fs = require("fs");
const path = require("path");
const { parseSmartDSL } = require("./parser");
const { applySecurityTransformations } = require("./transformers");
const SolidityGenerator = require("./SolidityGenerator");

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

    // Parse the DSL file to build AST
    console.log("Building Abstract Syntax Tree (AST)...");
    let ast = parseSmartDSL(input);

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
    throw error;
  }
}

// CLI functionality
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Default behavior - compile the example
    const exampleFile = path.join(__dirname, "..", "examples", "token.sl");
    compile(exampleFile, null);
  } else if (args[0] === "--help" || args[0] === "-h") {
    console.log(`
Smartra DSL Compiler
Usage: node src/compiler.js [options] [input.sl] [output.sol]

Options:
  --help, -h        Show this help message
  --version, -v     Show version information

Arguments:
  input.sl          Input DSL file to compile (default: examples/token.sl)
  output.sol        Output Solidity file (optional)

Examples:
  node src/compiler.js                           # Compile default example
  node src/compiler.js examples/voting.sl       # Compile specific file
  node src/compiler.js input.sl output.sol      # Compile with output file
`);
  } else if (args[0] === "--version" || args[0] === "-v") {
    const packageJson = require("../package.json");
    console.log(`Smartra DSL Compiler v${packageJson.version}`);
  } else {
    // Compile specified file
    const inputFile = args[0];
    const outputFile = args[1] || null;

    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file '${inputFile}' not found.`);
      process.exit(1);
    }

    compile(inputFile, outputFile);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  compile,
};
