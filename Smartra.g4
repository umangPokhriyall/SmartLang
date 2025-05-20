/**
 * Simplified Smartra DSL Grammar for prototype
 */
grammar Smartra;

// Parser Rules
program
    : contract EOF
    ;

contract
    : 'contract' ID ':' NEWLINE INDENT
      decorators?
      stateBlock?
      function*
      DEDENT
    ;

decorators
    : decorator+
    ;

decorator
    : '@' ID NEWLINE
    ;

stateBlock
    : 'state' ':' NEWLINE INDENT
      stateItem+
      DEDENT
    ;

stateItem
    : ID ':' type ('=' expr)? NEWLINE
    ;

function
    : decorators?
      'function' ID '(' paramList? ')' ('->' type)? ':' NEWLINE INDENT
      statement+
      DEDENT
    ;

paramList
    : param (',' param)*
    ;

param
    : ID ':' type
    ;

type
    : 'uint256'
    | 'address'
    | 'bool'
    | 'string'
    | 'mapping' '(' type '=>' type ')'
    ;

statement
    : 'require' '(' expr (',' STRING)? ')' NEWLINE                           #requireStmt
    | ID '[' expr ']' ('+=' | '-=' | '=') expr NEWLINE                       #mapAssignStmt
    | ID ('+=' | '-=' | '=') expr NEWLINE                                    #assignStmt
    | 'emit' ID '(' exprList? ')' NEWLINE                                    #emitStmt
    | 'return' expr NEWLINE                                                  #returnStmt
    ;

expr
    : ID '[' expr ']'                                    #mapAccess
    | ID                                                 #varAccess
    | 'msg.sender'                                       #msgSender
    | 'address(0)'                                       #zeroAddress
    | NUMBER                                             #number
    | STRING                                             #string
    | 'true'                                             #trueExpr
    | 'false'                                            #falseExpr
    | expr ('==' | '!=' | '>' | '>=' | '<' | '<=') expr #comparison
    | expr ('+' | '-') expr                              #addSub
    | expr ('*' | '/' | '%') expr                        #mulDivMod
    | '(' expr ')'                                       #parens
    ;

exprList
    : expr (',' expr)*
    ;

// Lexer Rules
ID : [a-zA-Z_][a-zA-Z0-9_]*;
NUMBER : [0-9]+;
STRING : '"' ~["\r\n]* '"';
NEWLINE : '\r'? '\n';
WS : [ \t]+ -> skip;
COMMENT : '//' ~[\r\n]* -> skip;
INDENT : '{INDENT}';   // Special token for increased indentation
DEDENT : '{DEDENT}';   // Special token for decreased indentation 