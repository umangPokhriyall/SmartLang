# Smartra DSL - Phase 1 Prototype

A Domain-Specific Language for secure and gas-efficient smart contract development.

## Project Status (Phase 1)

This prototype demonstrates the progress made during Phase 1:

- ✅ Grammar definition using ANTLR4
- ✅ Lexer and parser implementation
- ✅ Basic AST (Abstract Syntax Tree) construction
- ✅ Example DSL programs

## Setup Instructions

1. Install prerequisites:

   ```
   npm install
   ```

2. Generate parser from grammar:

   ```
   npm run generate
   ```

3. Run the demo:
   ```
   npm start
   ```

This will parse the example DSL file (`examples/token.sl`) and output the AST structure.

## Project Structure

- `grammar/` - ANTLR4 grammar definition
- `src/` - Compiler implementation
  - `ast/` - AST node definitions
  - `compiler.js` - Main compiler entry point
  - `astBuilder.js` - Converts parse tree to AST
- `examples/` - Example DSL programs
- `dist/` - Generated parser code

## Next Steps (Phase 2+)

The following components will be implemented in upcoming phases:

1. Security pattern transformers for decorators
2. Static analysis for vulnerability detection
3. Gas optimization passes
4. Solidity code generation
5. Benchmarking and testing
