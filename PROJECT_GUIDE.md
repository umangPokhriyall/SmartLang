# Smartra DSL Project Guide

**Complete Workflow & Architecture Guide for Teammates**

---

## 🎯 Project Overview

**What is Smartra DSL?**

- A Domain-Specific Language for writing secure smart contracts
- Automatically injects security patterns through decorators (`@reentrancy_guard`, `@only_owner`, `@safe_math`)
- Compiles clean DSL code to production-ready Solidity contracts

**Why did we build this?**

- Smart contracts are vulnerable to common attacks (reentrancy, access control, overflow)
- Manual security implementation is error-prone
- Our DSL makes security patterns automatic and transparent

---

## 🏗️ Complete Architecture

```
DSL Input (.sl files)
         ↓
    [PARSER MODULE]
         ↓
    [AST BUILDER]
         ↓
  [SECURITY TRANSFORMERS]
         ↓
  [SOLIDITY GENERATOR]
         ↓
    Solidity Output (.sol files)
```

### Component Breakdown

#### 1. **Parser Module** (`src/parser.js`)

- **Purpose**: Converts DSL text into structured data (Abstract Syntax Tree)
- **What it handles**:
  - Python-like indentation
  - Decorators (`@safe_math`, `@only_owner`, etc.)
  - Function definitions, state variables, events
  - Complex types like `mapping(address => uint256)`
- **Key Challenge Solved**: ANTLR integration was complex, so we built a custom parser that's more reliable

#### 2. **AST (Abstract Syntax Tree) Builder** (`src/ast/nodes.js`)

- **Purpose**: Defines the structure of our parsed code
- **Node Types**:
  - `Contract` - Main contract structure
  - `Function` - Function definitions with parameters and body
  - `StateVariable` - Contract state variables
  - `Decorator` - Security decorators like `@reentrancy_guard`
  - `Statement` - Individual code statements (assignments, require, emit, etc.)

#### 3. **Security Transformers** (`src/transformers/`)

- **Purpose**: Automatically inject security patterns based on decorators
- **Three Main Transformers**:

**a) ReentrancyGuardTransformer** (`ReentrancyGuardTransformer.js`)

- Detects `@reentrancy_guard` decorator
- Adds a boolean lock variable (e.g., `_reentrancyLock_functionName`)
- Creates a modifier that sets/unsets the lock
- Prevents functions from being called while already executing

**b) OnlyOwnerTransformer** (`OnlyOwnerTransformer.js`)

- Detects `@only_owner` decorator
- Adds `onlyOwner` modifier that checks `msg.sender == owner`
- Restricts function access to contract owner only

**c) SafeMathTransformer** (`SafeMathTransformer.js`)

- Detects `@safe_math` decorator
- Sets Solidity version to 0.8+ (has built-in overflow protection)
- Ensures all arithmetic operations are safe

#### 4. **Solidity Generator** (`src/SolidityGenerator.js`)

- **Purpose**: Converts the transformed AST into clean Solidity code
- **What it generates**:
  - Proper Solidity syntax with correct formatting
  - State variable declarations
  - Function definitions with modifiers
  - Event declarations
  - Security modifiers (automatically added by transformers)
  - Constructor with proper initialization

#### 5. **CLI Interface** (`src/compiler.js`)

- **Purpose**: Command-line interface for easy usage
- **Features**:
  - `npm start` - Compile default example
  - `node src/compiler.js file.sl output.sol` - Compile specific files
  - `--help` - Show usage information
  - `--version` - Show version info
  - Error handling for missing files

---

## 🔄 Complete Workflow

### Step-by-Step Execution Flow

1. **Input**: User provides a `.sl` file (e.g., `examples/token.sl`)

2. **File Reading**: Compiler reads the DSL source code

3. **Parsing**: Custom parser (`src/parser.js`) processes the text:

   ```
   contract SimpleToken:
       @safe_math
       state:
           owner: address = msg.sender
   ```

   ↓ Becomes structured AST nodes

4. **AST Building**: Creates tree structure representing the contract

5. **Security Analysis**: Transformer orchestrator (`src/transformers/index.js`) examines decorators:

   - Finds `@safe_math` → Applies SafeMathTransformer
   - Finds `@only_owner` → Applies OnlyOwnerTransformer
   - Finds `@reentrancy_guard` → Applies ReentrancyGuardTransformer

6. **AST Transformation**: Each transformer modifies the AST:

   - Adds new state variables (lock variables)
   - Adds modifiers to functions
   - Injects security checks

7. **Code Generation**: SolidityGenerator converts transformed AST to Solidity:

   ```solidity
   pragma solidity ^0.8.0;
   contract SimpleToken {
       address owner;
       modifier onlyOwner() { ... }
       constructor() { owner = msg.sender; }
       // ... rest of contract
   }
   ```

8. **Output**: Generated Solidity code is displayed/saved

---

## 📁 File Structure Explained

```
smartlang/
├── src/
│   ├── compiler.js              # 🎯 MAIN ENTRY POINT
│   ├── parser.js               # 📝 DSL → AST conversion
│   ├── SolidityGenerator.js    # 🔧 AST → Solidity conversion
│   ├── ast/
│   │   └── nodes.js           # 🌳 AST node definitions
│   └── transformers/
│       ├── index.js           # 🔄 Transformer orchestrator
│       ├── ReentrancyGuardTransformer.js  # 🔒 Reentrancy protection
│       ├── OnlyOwnerTransformer.js        # 👑 Access control
│       └── SafeMathTransformer.js         # ➕ Overflow protection
├── examples/
│   ├── token.sl               # 🪙 ERC20-like token example
│   ├── voting.sl             # 🗳️ Voting system example
│   └── marketplace.sl        # 🛒 Trading marketplace example
├── grammar/
│   └── Smartra.g4            # 📋 ANTLR grammar (reference)
└── Phase3_Final_Report.md     # 📊 Detailed project report
```

---

## 🚀 How to Use the Project

### Quick Start

```bash
# Compile default token example
npm start

# Compile specific file
node src/compiler.js examples/voting.sl

# Compile with output file
node src/compiler.js examples/marketplace.sl output.sol

# Show help
node src/compiler.js --help
```

### Understanding the Output

When you run the compiler, you'll see:

1. **Original DSL Code** - What you wrote
2. **Generated AST** - Internal tree structure
3. **Transformed AST** - After security patterns applied
4. **Final Solidity Code** - Ready to deploy

---

## 🔍 Example Walkthrough

**Input DSL** (`examples/token.sl`):

```smartra
contract SimpleToken:
    @safe_math
    state:
        owner: address = msg.sender
        balances: mapping(address => uint256)

    @only_owner
    function mint(to: address, amount: uint256):
        balances[to] += amount
```

**What Happens**:

1. Parser identifies: contract, decorators, state variables, function
2. SafeMathTransformer: Sets Solidity version to 0.8+
3. OnlyOwnerTransformer: Adds `onlyOwner` modifier to `mint` function
4. Generator produces:

```solidity
pragma solidity ^0.8.0;
contract SimpleToken {
    address owner;
    mapping(address => uint256) balances;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        balances[to] += amount;
    }
}
```

---

## 🛠️ Key Technical Decisions

### Why Custom Parser Instead of ANTLR?

- **Problem**: ANTLR generated ES6 modules, our project uses CommonJS
- **Problem**: Python-like indentation is complex to handle in ANTLR
- **Solution**: Custom parser is more reliable and easier to maintain

### Why Three Separate Transformers?

- **Modularity**: Each security pattern is independent
- **Extensibility**: Easy to add new security patterns
- **Testing**: Can test each pattern separately

### Why AST Transformation Approach?

- **Flexibility**: Can modify code structure before generation
- **Analysis**: Can understand the full context before making changes
- **Correctness**: Ensures security patterns are applied properly

---

## 🎯 Demonstration Points

### For Mentors/Evaluators:

1. **Show multiple examples compiling**: `token.sl`, `voting.sl`, `marketplace.sl`
2. **Highlight automatic security**: Point out how decorators become modifiers
3. **CLI functionality**: Show `--help`, file compilation, error handling
4. **Generated code quality**: Clean, readable Solidity output

### Key Success Metrics:

- ✅ Parses complex DSL syntax correctly
- ✅ Automatically injects all three security patterns
- ✅ Generates valid Solidity code
- ✅ Handles multiple different contract types
- ✅ Professional CLI interface

---

## 🔧 Troubleshooting

### Common Issues:

1. **"File not found"** → Check file path is correct
2. **Parsing errors** → Verify DSL syntax matches examples
3. **Missing decorators** → Ensure decorators are on separate lines

### Development Tips:

- Test with existing examples first
- Check the AST output to debug parsing issues
- Transformer logs show which security patterns were applied

---

## 📈 Project Status Summary

**Phase 1**: ✅ Grammar definition, project setup
**Phase 2**: ✅ AST transformers, code generation  
**Phase 3**: ✅ Complete compiler with multi-file support

**Overall Completion: 95%** - Fully functional compiler ready for demonstration.

The project successfully demonstrates automatic security pattern injection in smart contract development, making it easier and safer to write secure blockchain applications.
