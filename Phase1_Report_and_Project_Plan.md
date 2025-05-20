# Project Title: Smartra - A DSL for Secure and Gas-Efficient Smart Contract Development

## Team Information
Team Name: GasGuardians  
Team #: 7

Team Member 1 (Team Lead):  
Stark, Tony – 123456789 – tony.stark@avengers.com

Team Member 2:  
Banner, Bruce – 987654321 – bruce.banner@avengers.com

## 1. Motivation
Smart contracts are powerful but notoriously easy to get wrong. Developers often introduce vulnerabilities like reentrancy or integer overflows due to the complex and low-level nature of Solidity. Gas inefficiency is another major pain point, increasing the cost of deploying and interacting with contracts. Our motivation is to simplify smart contract creation by introducing a domain-specific language (DSL), Smartra, that enforces secure patterns and compiles into highly optimized Solidity code. By abstracting away unsafe constructs and automatically applying best practices, this DSL will enable developers to build robust contracts with less effort and lower gas costs.

## 2. State of the Art / Current Solution
Currently, most developers write smart contracts in Solidity or, less commonly, Vyper. These languages give great control but also expose developers to pitfalls. Tools like Slither and Mythril help detect issues post-development, and compilers like Solc optimize some patterns—but they do not enforce safe patterns at the language level. A purpose-built DSL can solve this by design, preventing vulnerabilities before they're written.

## 3. Overall Project Goals
1.  Design a minimal, intuitive DSL syntax for writing secure and gas-efficient smart contracts.
2.  Implement a compiler that translates the Smartra DSL to optimized Solidity code.
3.  Integrate static checks and AST transformations to prevent common vulnerabilities (e.g., reentrancy, integer overflows, access control issues).
4.  Provide usage examples and benchmark performance (gas usage, security) against traditional Solidity code.

## 4. Project Milestones (Overall Project - 4 Weeks)
*   **Week 1 (Phase 1):**
    *   Define the core Smartra DSL grammar using ANTLR4.
    *   Develop the lexer and parser from the grammar.
    *   Design the Abstract Syntax Tree (AST) structure.
    *   Set up the initial project structure and development environment.
    *   Create initial example DSL programs.
*   **Week 2 (Start of Phase 2):**
    *   Implement full AST generation from ANTLR parse trees.
    *   Begin implementation of security pattern transformers (e.g., for `@reentrancy_guard`, `@only_owner`).
*   **Week 3 (End of Phase 2 - Target 50% Completion):**
    *   Complete core security transformers.
    *   Implement basic Solidity code generation from the transformed AST.
    *   Ensure generated Solidity for core features is syntactically correct and reflects DSL logic including security patterns.
*   **Week 4 (Phase 3 - Target 100% Completion):**
    *   Implement gas optimization transformations.
    *   Develop comprehensive error reporting.
    *   Conduct thorough testing, including gas benchmarking.
    *   Finalize documentation and project deliverables.

## 5. Phase 1 Accomplishments (Completed)
During Phase 1, the GasGuardians team successfully laid the foundational groundwork for the Smartra DSL compiler. Key achievements include:

*   **DSL Grammar Definition:** A core grammar for Smartra was defined using ANTLR4 (`Smartra.g4`). This grammar specifies the syntax for contract declarations, state variables, function definitions (including parameters and return types), event declarations, and security decorators (`@decorator_name`).
*   **Lexer and Parser Generation:** Using ANTLR4, the defined grammar was processed to generate the JavaScript lexer and parser files necessary for processing Smartra source code.
*   **AST Node Design:** A comprehensive set of Abstract Syntax Tree (AST) node types was designed and implemented (`src/ast/nodes.js`). These nodes represent all essential constructs of the Smartra language, providing a structured in-memory representation of the code.
*   **Initial AST Builder Design:** The design for an `ASTBuilder` module, which will traverse the ANTLR parse tree and construct our custom AST, was completed. A simulated version was used in the Phase 1 prototype to demonstrate AST structure for a sample program.
*   **Example DSL Program:** A sample smart contract (`examples/token.sl`) was written in Smartra, showcasing various language features including state variables, functions, and decorators. This example serves as an initial test case.
*   **Project Setup & Environment:** The project development environment was configured with Node.js, `npm` for package management, and necessary dependencies like `antlr4`. A basic project structure (`README.md`, `package.json`, `.gitignore`) was established.
*   **Initial Prototype:** A command-line prototype was developed that can (conceptually for now, with full implementation in Phase 2) take a Smartra file, parse it, and display its AST structure. For the Phase 1 demo, the AST for `token.sl` is directly constructed to showcase the intended structure.

## 6. Project Approach & System Architecture

### 6.1. Compiler Workflow
```mermaid
graph TD
    A[Smartra DSL Code (*.sl file)] --> B{Lexical Analysis (ANTLR4 Lexer)};
    B -- Tokens --> C{Syntax Analysis (ANTLR4 Parser)};
    C -- Parse Tree --> D{AST Construction (ASTBuilder in JS)};
    D -- Abstract Syntax Tree (AST) --> E{Semantic Analysis & AST Transformations};
    E --> F[Security Pattern Enforcement (e.g., @reentrancy_guard)];
    E --> G[Gas Optimizations];
    F --> H{Solidity Code Generation (SolidityGenerator in JS)};
    G --> H;
    H -- Optimized Solidity Code (*.sol file) --> I[Solidity Compiler (solc)];
    I -- Bytecode --> J[Deployment & Testing (e.g., Hardhat)];

    subgraph SmartraCompiler [GasGuardians' Smartra Compiler]
        B
        C
        D
        E
        F
        G
        H
    end

    style SmartraCompiler fill:#f9f,stroke:#333,stroke-width:2px,color:#333
    style A fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px
    style I fill:#lightgrey,stroke:#333,stroke-width:2px
    style J fill:#lightgrey,stroke:#333,stroke-width:2px
```

### 6.2. Technical Details
We will design a custom DSL using ANTLR4 as our parsing framework. This DSL will resemble Python for readability while incorporating smart contract-specific constructs. Key features include:

1.  **Syntax Design**:
    *   Python-like indentation for blocks (handled by ANTLR grammar pre-processing if needed, or strict newline/indent/dedent tokens).
    *   Built-in decorators for security patterns (e.g., `@reentrancy_guard`, `@safe_math`, `@only_owner`).
    *   Clear type annotations.
2.  **Compiler Pipeline Stages** (as shown in the flowchart):
    *   ANTLR4-based lexer and parser.
    *   Custom AST construction with semantic analysis capabilities.
    *   AST transformations for security patterns and gas optimizations.
    *   Solidity code generation.
3.  **Security Mechanisms (via AST Transformation)**:
    *   `@reentrancy_guard`: Adds a reentrancy lock mechanism (state variable and modifier).
    *   `@only_owner`: Adds an owner state variable and an `onlyOwner` modifier.
    *   `@safe_math`: Intended to ensure arithmetic operations are safe from overflows/underflows (e.g., by using Solidity 0.8+ default checks or by transforming operations if targeting older versions).
    *   Potential for checks-effects-interactions pattern enforcement.
4.  **Gas Optimizations (via AST Transformation)**:
    *   Constant folding and propagation.
    *   Dead code elimination.
    *   Storage packing considerations (can be advisory or transformational).

### 6.3. Technologies Used:
*   **ANTLR4**: Parser Generator.
*   **Node.js & JavaScript**: For compiler implementation logic.
*   **Solidity Compiler (Solc)**: For verifying and compiling generated Solidity code.
*   **Hardhat (or similar)**: For smart contract deployment, testing, and gas benchmarking (later phases).

## 7. Expected Project Outcome / Deliverables (Overall)
1.  A working Smartra DSL with its ANTLR4 grammar.
2.  A compiler (Node.js application) that translates Smartra DSL to human-readable and optimized Solidity code.
3.  Example smart contracts (e.g., ERC20 token, simple voting system) written in Smartra.
4.  Benchmark comparisons demonstrating gas usage improvements and security vulnerability prevention against manually written Solidity contracts.
5.  Project documentation: DSL syntax guide, compiler usage instructions, and a final project report.

## 8. Assumptions
We assume developers will adopt the DSL if it demonstrably improves both security and gas efficiency without a steep learning curve. We will focus on common smart contract patterns first. Targeting Solidity as the output language is sufficient for broad EVM compatibility. Access to standard Solidity tooling (Solc, Hardhat) is assumed.

## 9. DSL Sample (Illustrative)
```
contract TokenContract:
    @safe_math
    state:
        owner: address = msg.sender
        balances: mapping(address => uint256)
        totalSupply: uint256 = 1000000

    event Transfer(from: address, to: address, value: uint256)

    @only_owner
    function mint(to: address, amount: uint256):
        balances[to] += amount
        totalSupply += amount
        emit Transfer(address(0), to, amount)

    @reentrancy_guard
    function transfer(to: address, amount: uint256) -> bool:
        require(balances[msg.sender] >= amount, "Insufficient balance")
        // Actual transfer logic assumes checks-effects-interactions if enforced
        balances[msg.sender] -= amount
        balances[to] += amount
        emit Transfer(msg.sender, to, amount)
        return true
```

## 10. References
*   Solidity Documentation
*   ANTLR4 Documentation
*   Consensys Smart Contract Best Practices
*   Ethereum Yellow Paper
*   Slither Static Analyzer 