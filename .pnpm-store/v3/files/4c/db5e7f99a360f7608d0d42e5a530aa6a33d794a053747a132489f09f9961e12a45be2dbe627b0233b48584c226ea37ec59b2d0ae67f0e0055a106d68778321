import { AnyStrictValidator, InferType, LooseTest, LooseValidator, StrictTest, StrictValidator, Trait } from './types';
export declare function makeTrait<U>(value: U): <V>() => U & Trait<V>;
export declare function makeValidator<U, V extends U>({ test }: {
    test: StrictTest<U, V>;
}): StrictValidator<U, V>;
export declare function makeValidator<U, V extends U = U>({ test }: {
    test: LooseTest<U>;
}): LooseValidator<U, V>;
export declare class TypeAssertionError extends Error {
    constructor({ errors }?: {
        errors?: string[];
    });
}
/**
 * Check that the specified value matches the given validator, and throws an
 * exception if it doesn't. Refine the type if it passes.
 */
export declare function assert<T extends AnyStrictValidator>(val: unknown, validator: T): asserts val is InferType<T>;
/**
 * Check that the specified value matches the given validator, and throws an
 * exception if it doesn't. Refine the type if it passes.
 *
 * Thrown exceptions include details about what exactly looks invalid in the
 * tested value.
 */
export declare function assertWithErrors<T extends AnyStrictValidator>(val: unknown, validator: T): asserts val is InferType<T>;
/**
 * Compile-time only. Refine the type as if the validator was matching the
 * tested value, but doesn't actually run it. Similar to the classic `as`
 * operator in TypeScript.
 */
export declare function softAssert<T extends AnyStrictValidator>(val: unknown, validator: T): asserts val is InferType<T>;
/**
 * Check that the value matches the given validator. Returns a tuple where the
 * first element is the validated value, and the second the reported errors.
 *
 * If the `errors` field is set to `false` (the default), the error reporting
 * will be a single boolean. If set to `true`, it'll be an array of strings.
 */
export declare function as<T extends AnyStrictValidator>(value: unknown, validator: T, opts: {
    coerce?: boolean;
    errors?: boolean;
    throw: true;
}): InferType<T>;
export declare function as<T extends AnyStrictValidator>(value: unknown, validator: T, opts: {
    coerce?: boolean;
    errors: false;
    throw?: false;
}): {
    value: InferType<T>;
    errors: undefined;
} | {
    value: unknown;
    errors: true;
};
export declare function as<T extends AnyStrictValidator>(value: unknown, validator: T, opts: {
    coerce?: boolean;
    errors: true;
    throw?: false;
}): {
    value: InferType<T>;
    errors: undefined;
} | {
    value: unknown;
    errors: Array<string>;
};
export declare function as<T extends AnyStrictValidator>(value: unknown, validator: T, opts?: {
    coerce?: boolean;
    errors?: boolean;
    throw?: false;
}): {
    value: InferType<T>;
    errors: undefined;
} | {
    value: unknown;
    errors: Array<string> | true;
};
declare type FnValidatedArgument<T extends [] | [AnyStrictValidator, ...AnyStrictValidator[]]> = T extends [AnyStrictValidator, ...AnyStrictValidator[]] ? {
    [K in keyof T]: InferType<T[K]>;
} : [];
interface FnValidatedFunction<T extends [] | [AnyStrictValidator, ...AnyStrictValidator[]], Ret> {
    (...args: FnValidatedArgument<T>): Ret;
}
/**
 * Create and return a new function that apply the given validators to each
 * corresponding argument passed to the function and throws an exception in
 * case of a mismatch.
 */
export declare function fn<T extends [] | [AnyStrictValidator, ...AnyStrictValidator[]], Ret>(validators: T, fn: (...args: FnValidatedArgument<T>) => Ret): FnValidatedFunction<T, Ret>;
export {};
