const antlr4 = require('antlr4');
const nodes = require('./ast/nodes');

// Note: In actual implementation, these would be imported from the ANTLR-generated files
// For the prototype, we're simulating this
/*
const SmartraVisitor = require('../dist/SmartraVisitor').SmartraVisitor;
*/

// Mock visitor class for the prototype
class SmartraVisitor {
    visitProgram(ctx) {}
    visitContract(ctx) {}
    visitContractBody(ctx) {}
    visitStateDeclaration(ctx) {}
    visitStateItem(ctx) {}
    visitFunctionDeclaration(ctx) {}
    visitEventDeclaration(ctx) {}
    visitDecorators(ctx) {}
    visitDecorator(ctx) {}
    visitParameters(ctx) {}
    visitParameter(ctx) {}
    visitType(ctx) {}
    visitStatement(ctx) {}
    visitRequireStatement(ctx) {}
    visitAssignmentStatement(ctx) {}
    visitEmitStatement(ctx) {}
    visitReturnStatement(ctx) {}
    visitIfStatement(ctx) {}
    visitForStatement(ctx) {}
    visitLvalue(ctx) {}
    visitExpression(ctx) {}
    visitFunctionCall(ctx) {}
    visitLiteral(ctx) {}
}

class ASTBuilder extends SmartraVisitor {
    constructor() {
        super();
    }
    
    // Main entry point
    visitProgram(ctx) {
        // In a real implementation, this would process the ANTLR context
        // For the prototype, we'll build a hand-crafted AST that matches the example file
        
        // Create contract
        const contractNode = this.buildSimpleTokenContract();
        
        // Create program with the contract
        return new nodes.Program([contractNode]);
    }
    
    // Build a sample AST for the SimpleToken contract
    buildSimpleTokenContract() {
        // Create decorators
        const safeMathDecorator = new nodes.Decorator('safe_math');
        
        // Create state variables
        const ownerVar = new nodes.StateVariable(
            'owner',
            new nodes.Type('address'),
            new nodes.Identifier('msg.sender')
        );
        
        const balancesType = new nodes.Type(
            'mapping',
            new nodes.Type('address'),
            new nodes.Type('uint256')
        );
        const balancesVar = new nodes.StateVariable('balances', balancesType);
        
        const totalSupplyVar = new nodes.StateVariable(
            'totalSupply',
            new nodes.Type('uint256'),
            new nodes.Literal('1000000', 'number')
        );
        
        const stateDeclaration = new nodes.StateDeclaration([
            ownerVar, balancesVar, totalSupplyVar
        ]);
        
        // Create mint function
        const mintDecorator = new nodes.Decorator('only_owner');
        const mintParams = [
            new nodes.Parameter('to', new nodes.Type('address')),
            new nodes.Parameter('amount', new nodes.Type('uint256'))
        ];
        
        const mintBody = [
            new nodes.AssignmentStatement(
                new nodes.LValue('balances', [new nodes.Identifier('to')]),
                '+=',
                new nodes.Identifier('amount')
            ),
            new nodes.AssignmentStatement(
                new nodes.Identifier('totalSupply'),
                '+=',
                new nodes.Identifier('amount')
            ),
            new nodes.EmitStatement('Transfer', [
                new nodes.Literal('address(0)', 'address'),
                new nodes.Identifier('to'),
                new nodes.Identifier('amount')
            ])
        ];
        
        const mintFunction = new nodes.Function(
            'mint',
            mintParams,
            null,
            [mintDecorator],
            mintBody
        );
        
        // Create transfer function
        const transferDecorator = new nodes.Decorator('reentrancy_guard');
        const transferParams = [
            new nodes.Parameter('to', new nodes.Type('address')),
            new nodes.Parameter('amount', new nodes.Type('uint256'))
        ];
        
        const msgSenderBalance = new nodes.LValue('balances', [
            new nodes.Identifier('msg.sender')
        ]);
        
        const transferBody = [
            new nodes.RequireStatement(
                new nodes.BinaryExpression(
                    msgSenderBalance,
                    '>=',
                    new nodes.Identifier('amount')
                ),
                new nodes.Literal('"Insufficient balance"', 'string')
            ),
            new nodes.AssignmentStatement(
                msgSenderBalance,
                '-=',
                new nodes.Identifier('amount')
            ),
            new nodes.AssignmentStatement(
                new nodes.LValue('balances', [new nodes.Identifier('to')]),
                '+=',
                new nodes.Identifier('amount')
            ),
            new nodes.EmitStatement('Transfer', [
                new nodes.Identifier('msg.sender'),
                new nodes.Identifier('to'),
                new nodes.Identifier('amount')
            ]),
            new nodes.ReturnStatement(new nodes.Literal('true', 'boolean'))
        ];
        
        const transferFunction = new nodes.Function(
            'transfer',
            transferParams,
            new nodes.Type('bool'),
            [transferDecorator],
            transferBody
        );
        
        // Create Transfer event
        const transferEventParams = [
            new nodes.Parameter('from', new nodes.Type('address')),
            new nodes.Parameter('to', new nodes.Type('address')),
            new nodes.Parameter('amount', new nodes.Type('uint256'))
        ];
        
        const transferEvent = new nodes.Event('Transfer', transferEventParams);
        
        // Create the contract
        return new nodes.Contract(
            'SimpleToken',
            [safeMathDecorator],
            stateDeclaration,
            [mintFunction, transferFunction],
            [transferEvent]
        );
    }
}

module.exports = ASTBuilder; 