import { StrictValidator } from 'typanion';
import { CommandBuilder, RunState } from '../../core';
import { UsageError } from '../../errors';
import { BaseContext, CliContext } from '../Cli';
export declare const isOptionSymbol: unique symbol;
export type GeneralOptionFlags = {
    description?: string;
    hidden?: boolean;
    required?: boolean;
};
export type TupleOf<Type, Arity extends number, Accumulator extends Array<Type>> = Accumulator['length'] extends Arity ? Accumulator : TupleOf<Type, Arity, [Type, ...Accumulator]>;
export type Tuple<Type, Arity extends number> = Arity extends Arity ? number extends Arity ? Array<Type> : TupleOf<Type, Arity, []> : never;
export type WithArity<Type extends {
    length?: number;
}, Arity extends number> = number extends Type['length'] ? Arity extends 0 ? boolean : Arity extends 1 ? Type : number extends Arity ? boolean | Type | Tuple<Type, Arity> : Tuple<Type, Arity> : Type;
export type CommandOption<T> = {
    [isOptionSymbol]: true;
    definition: <Context extends BaseContext>(builder: CommandBuilder<CliContext<Context>>, key: string) => void;
    transformer: <Context extends BaseContext>(builder: CommandBuilder<CliContext<Context>>, key: string, state: RunState, context: Context) => T;
};
export type CommandOptionReturn<T> = T;
export declare function makeCommandOption<T>(spec: Omit<CommandOption<T>, typeof isOptionSymbol>): T;
export declare function rerouteArguments<A, B>(a: A | B, b: B): [Exclude<A, B>, B];
export declare function rerouteArguments<A, B>(a: A | B | undefined, b: B): [Exclude<A, B> | undefined, B];
export declare function cleanValidationError(message: string, { mergeName }?: {
    mergeName?: boolean;
}): string;
export declare function formatError(message: string, errors: Array<string>): UsageError;
export declare function applyValidator<U, V>(name: string, value: U, validator?: StrictValidator<unknown, V>): U;
