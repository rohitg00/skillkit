/**
 * Represents tokens that our language understands in parsing.
 */
declare const TOKEN_TYPES: Readonly<{
    Text: "Text";
    NumericLiteral: "NumericLiteral";
    BooleanLiteral: "BooleanLiteral";
    StringLiteral: "StringLiteral";
    Identifier: "Identifier";
    Equals: "Equals";
    OpenParen: "OpenParen";
    CloseParen: "CloseParen";
    OpenStatement: "OpenStatement";
    CloseStatement: "CloseStatement";
    OpenExpression: "OpenExpression";
    CloseExpression: "CloseExpression";
    OpenSquareBracket: "OpenSquareBracket";
    CloseSquareBracket: "CloseSquareBracket";
    OpenCurlyBracket: "OpenCurlyBracket";
    CloseCurlyBracket: "CloseCurlyBracket";
    Comma: "Comma";
    Dot: "Dot";
    Colon: "Colon";
    Pipe: "Pipe";
    CallOperator: "CallOperator";
    AdditiveBinaryOperator: "AdditiveBinaryOperator";
    MultiplicativeBinaryOperator: "MultiplicativeBinaryOperator";
    ComparisonBinaryOperator: "ComparisonBinaryOperator";
    UnaryOperator: "UnaryOperator";
    Set: "Set";
    If: "If";
    For: "For";
    In: "In";
    Is: "Is";
    NotIn: "NotIn";
    Else: "Else";
    EndIf: "EndIf";
    ElseIf: "ElseIf";
    EndFor: "EndFor";
    And: "And";
    Or: "Or";
    Not: "UnaryOperator";
}>;
type TokenType = keyof typeof TOKEN_TYPES;
/**
 * Represents a single token in the template.
 */
declare class Token {
    value: string;
    type: TokenType;
    /**
     * Constructs a new Token.
     * @param {string} value The raw value as seen inside the source code.
     * @param {TokenType} type The type of token.
     */
    constructor(value: string, type: TokenType);
}
interface PreprocessOptions {
    trim_blocks?: boolean;
    lstrip_blocks?: boolean;
}
/**
 * Generate a list of tokens from a source string.
 */
declare function tokenize(source: string, options?: PreprocessOptions): Token[];

/**
 * Statements do not result in a value at runtime. They contain one or more expressions internally.
 */
declare class Statement {
    type: string;
}
/**
 * Defines a block which contains many statements. Each chat template corresponds to one Program.
 */
declare class Program extends Statement {
    body: Statement[];
    type: string;
    constructor(body: Statement[]);
}

/**
 * Generate the Abstract Syntax Tree (AST) from a list of tokens.
 * Operator precedence can be found here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#table
 */
declare function parse(tokens: Token[]): Program;

type AnyRuntimeValue = NumericValue | StringValue | BooleanValue | ObjectValue | ArrayValue | FunctionValue | NullValue | UndefinedValue;
/**
 * Abstract base class for all Runtime values.
 * Should not be instantiated directly.
 */
declare abstract class RuntimeValue<T> {
    type: string;
    value: T;
    /**
     * A collection of built-in functions for this type.
     */
    builtins: Map<string, AnyRuntimeValue>;
    /**
     * Creates a new RuntimeValue.
     */
    constructor(value?: T);
    /**
     * Determines truthiness or falsiness of the runtime value.
     * This function should be overridden by subclasses if it has custom truthiness criteria.
     * @returns {BooleanValue} BooleanValue(true) if the value is truthy, BooleanValue(false) otherwise.
     */
    __bool__(): BooleanValue;
}
/**
 * Represents a numeric value at runtime.
 */
declare class NumericValue extends RuntimeValue<number> {
    type: string;
}
/**
 * Represents a string value at runtime.
 */
declare class StringValue extends RuntimeValue<string> {
    type: string;
    builtins: Map<string, AnyRuntimeValue>;
}
/**
 * Represents a boolean value at runtime.
 */
declare class BooleanValue extends RuntimeValue<boolean> {
    type: string;
}
/**
 * Represents an Object value at runtime.
 */
declare class ObjectValue extends RuntimeValue<Map<string, AnyRuntimeValue>> {
    type: string;
    /**
     * NOTE: necessary to override since all JavaScript arrays are considered truthy,
     * while only non-empty Python arrays are consider truthy.
     *
     * e.g.,
     *  - JavaScript:  {} && 5 -> 5
     *  - Python:      {} and 5 -> {}
     */
    __bool__(): BooleanValue;
    builtins: Map<string, AnyRuntimeValue>;
}
/**
 * Represents an Array value at runtime.
 */
declare class ArrayValue extends RuntimeValue<AnyRuntimeValue[]> {
    type: string;
    builtins: Map<string, AnyRuntimeValue>;
    /**
     * NOTE: necessary to override since all JavaScript arrays are considered truthy,
     * while only non-empty Python arrays are consider truthy.
     *
     * e.g.,
     *  - JavaScript:  [] && 5 -> 5
     *  - Python:      [] and 5 -> []
     */
    __bool__(): BooleanValue;
}
/**
 * Represents a Function value at runtime.
 */
declare class FunctionValue extends RuntimeValue<(args: AnyRuntimeValue[], scope: Environment) => AnyRuntimeValue> {
    type: string;
}
/**
 * Represents a Null value at runtime.
 */
declare class NullValue extends RuntimeValue<null> {
    type: string;
}
/**
 * Represents an Undefined value at runtime.
 */
declare class UndefinedValue extends RuntimeValue<undefined> {
    type: string;
}
/**
 * Represents the current environment (scope) at runtime.
 */
declare class Environment {
    parent?: Environment | undefined;
    /**
     * The variables declared in this environment.
     */
    variables: Map<string, AnyRuntimeValue>;
    /**
     * The tests available in this environment.
     */
    tests: Map<string, (...value: AnyRuntimeValue[]) => boolean>;
    constructor(parent?: Environment | undefined);
    /**
     * Set the value of a variable in the current environment.
     */
    set(name: string, value: unknown): AnyRuntimeValue;
    private declareVariable;
    /**
     * Set variable in the current scope.
     * See https://jinja.palletsprojects.com/en/3.0.x/templates/#assignments for more information.
     */
    setVariable(name: string, value: AnyRuntimeValue): AnyRuntimeValue;
    /**
     * Resolve the environment in which the variable is declared.
     * @param {string} name The name of the variable.
     * @returns {Environment} The environment in which the variable is declared.
     */
    private resolve;
    lookupVariable(name: string): AnyRuntimeValue;
}
declare class Interpreter {
    global: Environment;
    constructor(env?: Environment);
    /**
     * Run the program.
     */
    run(program: Program): AnyRuntimeValue;
    /**
     * Evaluates expressions following the binary operation type.
     */
    private evaluateBinaryExpression;
    /**
     * Evaluates expressions following the filter operation type.
     */
    private evaluateFilterExpression;
    /**
     * Evaluates expressions following the test operation type.
     */
    private evaluateTestExpression;
    /**
     * Evaluates expressions following the unary operation type.
     */
    private evaluateUnaryExpression;
    private evalProgram;
    private evaluateBlock;
    private evaluateIdentifier;
    private evaluateCallExpression;
    private evaluateSliceExpression;
    private evaluateMemberExpression;
    private evaluateSet;
    private evaluateIf;
    private evaluateFor;
    evaluate(statement: Statement | undefined, environment: Environment): AnyRuntimeValue;
}

/**
 * @file Jinja templating engine
 *
 * A minimalistic JavaScript reimplementation of the [Jinja](https://github.com/pallets/jinja) templating engine,
 * to support the chat templates. Special thanks to [Tyler Laceby](https://github.com/tlaceby) for his amazing
 * ["Guide to Interpreters"](https://github.com/tlaceby/guide-to-interpreters-series) tutorial series,
 * which provided the basis for this implementation.
 *
 * See the [Transformers documentation](https://huggingface.co/docs/transformers/main/en/chat_templating) for more information.
 *
 * @module index
 */

declare class Template {
    parsed: Program;
    /**
     * @param {string} template The template string
     */
    constructor(template: string);
    render(items: Record<string, unknown>): string;
}

export { Environment, Interpreter, Template, parse, tokenize };
