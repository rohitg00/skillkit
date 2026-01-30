import { StrictValidator } from "typanion";
import { CommandOptionReturn, GeneralOptionFlags, WithArity } from "./utils";
export type StringOptionNoBoolean<T, Arity extends number = 1> = GeneralOptionFlags & {
    env?: string;
    validator?: StrictValidator<unknown, T>;
    tolerateBoolean?: false;
    arity?: Arity;
};
export type StringOptionTolerateBoolean<T> = GeneralOptionFlags & {
    env?: string;
    validator?: StrictValidator<unknown, T>;
    tolerateBoolean: boolean;
    arity?: 0;
};
export type StringOption<T> = StringOptionNoBoolean<T> | StringOptionTolerateBoolean<T>;
export type StringPositionalFlags<T> = {
    validator?: StrictValidator<unknown, T>;
    name?: string;
    required?: boolean;
};
/**
 * Used to annotate positional options. Such options will be strings
 * unless they are provided a schema, which will then be used for coercion.
 *
 * Be careful: this function is order-dependent! Make sure to define your
 * positional options in the same order you expect to find them on the
 * command line.
 */
export declare function String(): CommandOptionReturn<string>;
export declare function String<T = string>(opts: StringPositionalFlags<T> & {
    required: false;
}): CommandOptionReturn<T | undefined>;
export declare function String<T = string>(opts: StringPositionalFlags<T>): CommandOptionReturn<T>;
/**
 * Used to annotate string options. Such options will be typed as strings
 * unless they are provided a schema, which will then be used for coercion.
 *
 * @example
 * --foo=hello --bar world
 *     ► {"foo": "hello", "bar": "world"}
 */
export declare function String<T extends {} = string, Arity extends number = 1>(descriptor: string, opts: StringOptionNoBoolean<T, Arity> & {
    required: true;
}): CommandOptionReturn<WithArity<T, Arity>>;
export declare function String<T extends {} = string, Arity extends number = 1>(descriptor: string, opts?: StringOptionNoBoolean<T, Arity>): CommandOptionReturn<WithArity<T, Arity> | undefined>;
export declare function String<T extends {} = string, Arity extends number = 1>(descriptor: string, initialValue: WithArity<string, Arity>, opts?: Omit<StringOptionNoBoolean<T, Arity>, 'required'>): CommandOptionReturn<WithArity<T, Arity>>;
export declare function String<T = string>(descriptor: string, opts: StringOptionTolerateBoolean<T> & {
    required: true;
}): CommandOptionReturn<T | boolean>;
export declare function String<T = string>(descriptor: string, opts: StringOptionTolerateBoolean<T>): CommandOptionReturn<T | boolean | undefined>;
export declare function String<T = string>(descriptor: string, initialValue: string | boolean, opts: Omit<StringOptionTolerateBoolean<T>, 'required'>): CommandOptionReturn<T | boolean>;
