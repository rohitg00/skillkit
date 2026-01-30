import { AnyStrictValidator, InferType, StrictValidator } from '../types';
/**
 * Create a validator that always returns true and never refines the type.
 */
export declare function isUnknown(): StrictValidator<unknown, unknown>;
/**
 * Create a validator that only returns true when the tested value is exactly
 * the same as the expected one.
 *
 * Refines the type to the provided literal, as much as possible. For example,
 * if you provide a literal string as parameter, the resulting type will be
 * whatever this literal string is, not a generic `string` type. The same is
 * true for `null`, `true`, `false`, and literal numbers.
 */
export declare function isLiteral(expected: null): StrictValidator<unknown, null>;
export declare function isLiteral(expected: true): StrictValidator<unknown, true>;
export declare function isLiteral(expected: false): StrictValidator<unknown, false>;
export declare function isLiteral<T extends number>(expected: T): StrictValidator<unknown, T>;
export declare function isLiteral<T extends string>(expected: T): StrictValidator<unknown, T>;
export declare function isLiteral<T>(expected: T): StrictValidator<unknown, T>;
/**
 * Create a validator that only returns true when the tested value is a string.
 * Refines the type to `string`.
 */
export declare function isString(): StrictValidator<unknown, string>;
/**
 * Create a validator that only returns true when the tested value is amongst
 * the expected set of values. Accepts both value arrays (['foo', 'bar']) and
 * dictionaries ({foo: 'foo', bar: 'bar'}), which makes them compatible with
 * regular TypeScript enumerations (as long as they're not declared as `const
 * enum`).
 *
 * Refines the type to the enumeration values as much as possible. For example,
 * if you pass a TypeScript enumeration as expected set of values, the
 * resulting type will be the union of all values in this enumeration.
 */
export declare function isEnum<T extends boolean | string | number | null>(values: ReadonlyArray<T>): StrictValidator<unknown, T>;
export declare function isEnum<T>(enumSpec: Record<string, T>): StrictValidator<unknown, T>;
/**
 * Create a validator that only returns true when the tested value is a
 * boolean. Refines the type to `boolean`.
 *
 * Supports coercion:
 * - 'true' / 'True' / '1' / 1 will turn to `true`
 * - 'false' / 'False' / '0' / 0 will turn to `false`
 */
export declare function isBoolean(): StrictValidator<unknown, boolean>;
/**
 * Create a validator that only returns true when the tested value is a
 * number (including floating numbers; use `cascade` and `isInteger` to
 * restrict the range further). Refines the type to `number`.
 *
 * Supports coercion.
 */
export declare function isNumber(): StrictValidator<unknown, number>;
/**
 * Important: This validator only makes sense when used in conjunction with
 * coercion! It will always error when used without.
 *
 * Create a validator that only returns true when the tested value is a
 * JSON representation of the expected type. Refines the type to the
 * expected type, and casts the value into its inner value.
 */
export declare function isPayload<T extends AnyStrictValidator>(spec: T): StrictValidator<unknown, InferType<T>>;
/**
 * Create a validator that only returns true when the tested value is a
 * valid date. Refines the type to `Date`.
 *
 * Supports coercion via one of the following formats:
 * - ISO86001 strings
 * - Unix timestamps
 */
export declare function isDate(): StrictValidator<unknown, Date>;
/**
 * Create a validator that only returns true when the tested value is an
 * array whose all values match the provided subspec. Refines the type to
 * `Array<T>`, with `T` being the subspec inferred type.
 *
 * Supports coercion if the `delimiter` option is set, in which case strings
 * will be split accordingly.
 */
export declare function isArray<T extends AnyStrictValidator>(spec: T, { delimiter }?: {
    delimiter?: string | RegExp;
}): StrictValidator<unknown, InferType<T>[]>;
/**
 * Create a validator that only returns true when the tested value is an
 * set whose all values match the provided subspec. Refines the type to
 * `Set<T>`, with `T` being the subspec inferred type.
 *
 * Supports coercion from arrays (or anything that can be coerced into an
 * array).
 */
export declare function isSet<T extends AnyStrictValidator>(spec: T, { delimiter }?: {
    delimiter?: string | RegExp;
}): StrictValidator<unknown, Set<InferType<T>>>;
/**
 * Create a validator that only returns true when the tested value is an
 * map whose all values match the provided subspecs. Refines the type to
 * `Map<U, V>`, with `U` being the key subspec inferred type and `V` being
 * the value subspec inferred type.
 *
 * Supports coercion from array of tuples (or anything that can be coerced into
 * an array of tuples).
 */
export declare function isMap<TKey extends AnyStrictValidator, TValue extends AnyStrictValidator>(keySpec: TKey, valueSpec: TValue): StrictValidator<unknown, Map<InferType<TKey>, InferType<TValue>>>;
declare type AnyStrictValidatorTuple = AnyStrictValidator[] | [];
declare type InferTypeFromTuple<T extends AnyStrictValidatorTuple> = {
    [K in keyof T]: InferType<T[K]>;
};
/**
 * Create a validator that only returns true when the tested value is a
 * tuple whose each value matches the corresponding subspec. Refines the type
 * into a tuple whose each item has the type inferred by the corresponding
 * tuple.
 *
 * Supports coercion if the `delimiter` option is set, in which case strings
 * will be split accordingly.
 */
export declare function isTuple<T extends AnyStrictValidatorTuple>(spec: T, { delimiter }?: {
    delimiter?: string | RegExp;
}): StrictValidator<unknown, InferTypeFromTuple<T>>;
/**
 * Create a validator that only returns true when the tested value is an
 * object with any amount of properties that must all match the provided
 * subspec. Refines the type to `Record<string, T>`, with `T` being the
 * subspec inferred type.
 *
 * Keys can be optionally validated as well by using the `keys` optional
 * subspec parameter.
 */
export declare function isRecord<T extends AnyStrictValidator>(spec: T, { keys: keySpec, }?: {
    keys?: StrictValidator<unknown, string> | null;
}): StrictValidator<unknown, Record<string, InferType<T>>>;
/**
 * @deprecated Replace `isDict` by `isRecord`
 */
export declare function isDict<T extends AnyStrictValidator>(spec: T, opts?: {
    keys?: StrictValidator<unknown, string> | null;
}): StrictValidator<unknown, Record<string, InferType<T>>>;
declare type ExtractIndex<T> = {
    [K in keyof T as {} extends Record<K, 1> ? K : never]: T[K];
};
declare type RemoveIndex<T> = {
    [K in keyof T as {} extends Record<K, 1> ? never : K]: T[K];
};
declare type UndefinedProperties<T> = {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];
declare type UndefinedToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;
declare type ObjectType<T> = UndefinedToOptional<RemoveIndex<T>> & ExtractIndex<T>;
/**
 * Create a validator that only returns true when the tested value is an
 * object whose all properties match their corresponding subspec. Refines
 * the type into an object whose each property has the type inferred by the
 * corresponding subspec.
 *
 * Unlike `t.isPartial`, `t.isObject` doesn't allow extraneous properties by
 * default. This behaviour can be altered by using the `extra` optional
 * subspec parameter, which will be called to validate an object only
 * containing the extraneous properties.
 *
 * Calling `t.isObject(..., {extra: t.isRecord(t.isUnknown())})` is
 * essentially the same as calling `t.isPartial(...)`.
 */
export declare function isObject<T extends {
    [P in keyof T]: AnyStrictValidator;
}, UnknownValidator extends AnyStrictValidator = StrictValidator<unknown, unknown>>(props: T, { extra: extraSpec, }?: {
    extra?: UnknownValidator | null;
}): import("../types").StrictTest<unknown, ObjectType<{ [P in keyof T]: InferType<T[P]>; } & InferType<UnknownValidator>>> & import("../types").Trait<ObjectType<{ [P in keyof T]: InferType<T[P]>; } & InferType<UnknownValidator>>> & {
    properties: T;
};
/**
 * Create a validator that only returns true when the tested value is an
 * object whose all properties match their corresponding subspec. Refines
 * the type into an object whose each property has the type inferred by the
 * corresponding subspec.
 *
 * Unlike `t.isObject`, `t.isPartial` allows extraneous properties. The
 * resulting type will reflect this behaviour by including an index
 * signature (each extraneous property being typed `unknown`).
 *
 * Calling `t.isPartial(...)` is essentially the same as calling
 * `t.isObject(..., {extra: t.isRecord(t.isUnknown())})`.
 */
export declare function isPartial<T extends {
    [P in keyof T]: AnyStrictValidator;
}>(props: T): import("../types").StrictTest<unknown, ObjectType<{ [P in keyof T]: InferType<T[P]>; } & Record<string, unknown>>> & import("../types").Trait<ObjectType<{ [P in keyof T]: InferType<T[P]>; } & Record<string, unknown>>> & {
    properties: T;
};
/**
 * Create a validator that only returns true when the tested value is an
 * object whose prototype is derived from the given class. Refines the type
 * into a class instance.
 */
export declare const isInstanceOf: <T extends new (...args: any) => InstanceType<T>>(constructor: T) => StrictValidator<unknown, InstanceType<T>>;
/**
 * Create a validator that only returns true when the tested value is an
 * object matching any of the provided subspecs. If the optional `exclusive`
 * parameter is set to `true`, the behaviour changes so that the validator
 * only returns true when exactly one subspec matches.
 */
export declare const isOneOf: <T extends AnyStrictValidator>(specs: readonly T[], { exclusive, }?: {
    exclusive?: boolean | undefined;
}) => StrictValidator<unknown, InferType<T>>;
export {};
