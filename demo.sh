#!/bin/bash

echo "🚀 Smartra DSL Compiler Demonstration"
echo "======================================"
echo ""

echo "📋 Project Information:"
echo "Team: GasGuardians"
echo "Language: Smartra DSL → Solidity"
echo "Features: Automatic security pattern injection"
echo ""

echo "🔧 Available Commands:"
echo "npm start                          # Compile default token example"
echo "node src/compiler.js --help        # Show help information"
echo "node src/compiler.js <file.sl>     # Compile specific DSL file"
echo ""

echo "📁 Example Contracts Available:"
echo "- examples/token.sl       (ERC20-like token with minting)"
echo "- examples/voting.sl      (Secure voting system)"
echo "- examples/marketplace.sl (Trading marketplace)"
echo ""

echo "🎯 Live Demonstration:"
echo ""

echo "1️⃣ Compiling Token Contract..."
echo "--------------------------------"
node src/compiler.js examples/token.sl examples/token.sol

echo ""
echo "2️⃣ Compiling Voting Contract..."
echo "--------------------------------"
node src/compiler.js examples/voting.sl examples/voting.sol

echo ""
echo "3️⃣ Compiling Marketplace Contract..."
echo "------------------------------------"
node src/compiler.js examples/marketplace.sl examples/marketplace.sol

echo ""
echo "✅ Demonstration Complete!"
echo ""
echo "🔍 Check the generated .sol files to see the compiled Solidity code"
echo "💡 Notice how security decorators automatically inject protective patterns"
echo ""
echo "Key Features Demonstrated:"
echo "- ✅ Multi-file compilation support"
echo "- ✅ Automatic security pattern injection" 
echo "- ✅ Clean DSL syntax compilation"
echo "- ✅ Working Solidity output generation" 