grammar Smartra;

// Parser Rules
program
    : contract+ EOF
    ;

contract
    : CONTRACT ID ':' NEWLINE INDENT contractBody DEDENT
    ;

contractBody
    : decorators? stateDeclaration? (functionDeclaration | eventDeclaration)*
    ;

stateDeclaration
    : STATE ':' NEWLINE INDENT stateItem+ DEDENT
    ;

stateItem
    : ID ':' type ('=' expression)? NEWLINE
    ;

functionDeclaration
    : decorators? FUNCTION ID parameters ('->' type)? ':' NEWLINE INDENT statement+ DEDENT
    ;

eventDeclaration
    : EVENT ID parameters NEWLINE
    ;

decorators
    : decorator+
    ;

decorator
    : '@' ID NEWLINE
    ;

parameters
    : '(' (parameter (',' parameter)*)? ')'
    ;

parameter
    : ID ':' type
    ;

type
    : PRIMITIVE_TYPE
    | MAPPING '(' type '=>' type ')'
    | ARRAY '<' type '>'
    ;

statement
    : requireStatement
    | assignmentStatement
    | emitStatement
    | returnStatement
    | ifStatement
    | forStatement
    ;

requireStatement
    : REQUIRE '(' expression (',' STRING)? ')' NEWLINE
    ;

assignmentStatement
    : lvalue (ASSIGN | ADD_ASSIGN | SUB_ASSIGN | MUL_ASSIGN | DIV_ASSIGN) expression NEWLINE
    ;

emitStatement
    : EMIT ID '(' (expression (',' expression)*)? ')' NEWLINE
    ;

returnStatement
    : RETURN expression NEWLINE
    ;

ifStatement
    : IF expression ':' NEWLINE INDENT statement+ DEDENT
      (ELIF expression ':' NEWLINE INDENT statement+ DEDENT)*
      (ELSE ':' NEWLINE INDENT statement+ DEDENT)?
    ;

forStatement
    : FOR ID IN expression ':' NEWLINE INDENT statement+ DEDENT
    ;

lvalue
    : ID ('[' expression ']')*
    ;

expression
    : ID                                      # identifierExpr
    | literal                                 # literalExpr
    | lvalue                                  # lvalueExpr
    | expression BINARY_OP expression         # binaryExpr
    | UNARY_OP expression                     # unaryExpr
    | '(' expression ')'                      # parenExpr
    | functionCall                            # functionCallExpr
    ;

functionCall
    : ID '(' (expression (',' expression)*)? ')'
    ;

literal
    : NUMBER
    | STRING
    | BOOL_LITERAL
    | ADDRESS_LITERAL
    ;

// Lexer Rules
CONTRACT : 'contract';
STATE : 'state';
FUNCTION : 'function';
EVENT : 'event';
REQUIRE : 'require';
EMIT : 'emit';
RETURN : 'return';
IF : 'if';
ELIF : 'elif';
ELSE : 'else';
FOR : 'for';
IN : 'in';
MAPPING : 'mapping';
ARRAY : 'array';

PRIMITIVE_TYPE : 'uint256' | 'uint128' | 'uint64' | 'uint32' | 'uint16' | 'uint8' 
              | 'int256' | 'int128' | 'int64' | 'int32' | 'int16' | 'int8'
              | 'address' | 'bool' | 'string' | 'bytes' | 'bytes32';

ASSIGN : '=';
ADD_ASSIGN : '+=';
SUB_ASSIGN : '-=';
MUL_ASSIGN : '*=';
DIV_ASSIGN : '/=';

BINARY_OP : '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '&&' | '||';
UNARY_OP : '!' | '-';

NUMBER : [0-9]+;
BOOL_LITERAL : 'true' | 'false';
ADDRESS_LITERAL : 'address(' (ID | '0') ')';
ID : [a-zA-Z_][a-zA-Z0-9_]*;
STRING : '"' ~["\r\n]* '"';

// Indentation handling (simplified for prototype)
INDENT : '{INDENT}';  // Special token for increased indentation
DEDENT : '{DEDENT}';  // Special token for decreased indentation
NEWLINE : '\r'? '\n'; // Simplified - actual implementation would be more complex

// Whitespace and comments
WS : [ \t]+ -> skip;
COMMENT : '//' ~[\r\n]* -> skip;
BLOCK_COMMENT : '/*' .*? '*/' -> skip; 