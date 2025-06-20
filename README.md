# Smartra DSL - Secure Smart Contract Language

A Domain-Specific Language for secure and gas-efficient smart contract development that compiles to Solidity.

## 🚀 Features

- **Automatic Security Patterns**: Decorators like `@reentrancy_guard`, `@only_owner`, and `@safe_math`
- **Clean Syntax**: Python-like indentation and intuitive contract structure
- **Full Compiler Pipeline**: Parsing, AST transformation, and Solidity generation
- **Multiple Examples**: Token, voting, and marketplace contracts included

## 📦 Installation

```bash
# Clone and setup
cd smartlang
npm install

# Ensure Java is installed for ANTLR (optional)
java --version
```

## 🔧 Usage

### Compile Default Example

```bash
npm start
# Compiles examples/token.sl
```

### Compile Specific Files

```bash
# Compile and display output
node src/compiler.js examples/voting.sl

# Compile to specific output file
node src/compiler.js examples/marketplace.sl marketplace.sol

# Show help
npm run help
```

### Example DSL Code

```smartra
contract SimpleToken:
    @safe_math
    state:
        owner: address = msg.sender
        balances: mapping(address => uint256)
        totalSupply: uint256 = 1000000

    @only_owner
    function mint(to: address, amount: uint256):
        balances[to] += amount
        totalSupply += amount
        emit Transfer(address(0), to, amount)

    @reentrancy_guard
    function transfer(to: address, amount: uint256) -> bool:
        require(balances[msg.sender] >= amount, "Insufficient balance")
        balances[msg.sender] -= amount
        balances[to] += amount
        emit Transfer(msg.sender, to, amount)
        return true

    event Transfer(from: address, to: address, amount: uint256)
```

## 🔒 Security Decorators

- **`@safe_math`**: Automatic overflow protection (Solidity 0.8+)
- **`@only_owner`**: Restricts function access to contract owner
- **`@reentrancy_guard`**: Prevents reentrancy attacks with lock mechanism

## 📁 Project Structure

```
smartlang/
├── src/
│   ├── compiler.js         # Main compiler entry point
│   ├── parser.js          # Custom DSL parser
│   ├── SolidityGenerator.js # Code generation
│   ├── transformers/      # Security pattern transformers
│   └── ast/              # AST node definitions
├── examples/
│   ├── token.sl          # ERC20-like token
│   ├── voting.sl         # Voting system
│   └── marketplace.sl    # NFT marketplace
└── grammar/
    └── Smartra.g4        # ANTLR grammar definition
```

## 🧪 Examples Included

1. **Token Contract** (`examples/token.sl`): Basic ERC20-like token with minting
2. **Voting System** (`examples/voting.sl`): Secure voting with voter management
3. **Marketplace** (`examples/marketplace.sl`): Item trading with balance management

## 🎯 Demo Commands

```bash
# Compile all examples
node src/compiler.js examples/token.sl examples/token.sol
node src/compiler.js examples/voting.sl examples/voting.sol
node src/compiler.js examples/marketplace.sl examples/marketplace.sol

# Show generated Solidity code
node src/compiler.js examples/voting.sl
```

## 📊 Project Status

- ✅ **Phase 1**: Project setup and grammar definition
- ✅ **Phase 2**: AST transformers and code generation
- ✅ **Phase 3**: Complete compiler with multi-file support

**Overall Completion: 95%** - Fully functional DSL compiler ready for demonstration.

## 👥 Team

**GasGuardians**

- Tony Stark - Architecture & Code Generation
- Bruce Banner - Parser & Security Transformers

---

_For detailed technical documentation, see `Phase3_Final_Report.md`_
