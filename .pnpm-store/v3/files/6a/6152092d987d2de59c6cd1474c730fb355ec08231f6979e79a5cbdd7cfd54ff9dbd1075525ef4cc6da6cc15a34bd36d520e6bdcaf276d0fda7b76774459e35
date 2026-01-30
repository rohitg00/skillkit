import { StrictValidator } from "typanion";
import { GeneralOptionFlags, CommandOptionReturn, WithArity } from "./utils";
export type ArrayFlags<T, Arity extends number = 1> = GeneralOptionFlags & {
    arity?: Arity;
    validator?: StrictValidator<unknown, Array<T>>;
};
/**
 * Used to annotate array options. Such options will be strings unless they
 * are provided a schema, which will then be used for coercion.
 *
 * @example
 * --foo hello --foo bar
 *     ► {"foo": ["hello", "world"]}
 */
export declare function Array<T extends {} = string, Arity extends number = 1>(descriptor: string, opts: ArrayFlags<T, Arity> & {
    required: true;
}): CommandOptionReturn<Array<WithArity<T, Arity>>>;
export declare function Array<T extends {} = string, Arity extends number = 1>(descriptor: string, opts?: ArrayFlags<T, Arity>): CommandOptionReturn<Array<WithArity<T, Arity>> | undefined>;
export declare function Array<T extends {} = string, Arity extends number = 1>(descriptor: string, initialValue: Array<WithArity<string, Arity>>, opts?: Omit<ArrayFlags<T, Arity>, 'required'>): CommandOptionReturn<Array<WithArity<T, Arity>>>;
