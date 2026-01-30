import { AnyStrictValidator } from '../types';
/**
 * Create a validator that checks that the tested array or string has at least
 * the specified length.
 */
export declare function hasMinLength<T extends {
    length: number;
}>(length: number): import("../types").LooseValidator<T, T>;
/**
 * Create a validator that checks that the tested array or string has at most
 * the specified length.
 */
export declare function hasMaxLength<T extends {
    length: number;
}>(length: number): import("../types").LooseValidator<T, T>;
/**
 * Create a validator that checks that the tested array or string has exactly
 * the specified length.
 */
export declare function hasExactLength<T extends {
    length: number;
}>(length: number): import("../types").LooseValidator<T, T>;
/**
 * Create a validator that checks that the tested array only contains unique
 * elements. The optional `map` parameter lets you define a transform to
 * apply before making the check (the result of this transform will be
 * discarded afterwards).
 */
export declare function hasUniqueItems<T>({ map, }?: {
    map?: (value: T) => unknown;
}): import("../types").LooseValidator<T[], T[]>;
/**
 * Create a validator that checks that the tested number is strictly less than 0.
 */
export declare function isNegative(): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is equal or greater
 * than 0.
 */
export declare function isPositive(): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is equal or greater
 * than the specified reference.
 */
export declare function isAtLeast(n: number): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is equal or smaller
 * than the specified reference.
 */
export declare function isAtMost(n: number): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is between the
 * specified references (including the upper boundary).
 */
export declare function isInInclusiveRange(a: number, b: number): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is between the
 * specified references (excluding the upper boundary).
 */
export declare function isInExclusiveRange(a: number, b: number): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested number is an integer.
 *
 * By default Typanion will also check that it's a *safe* integer. For example,
 * 2^53 wouldn't be a safe integer because 2^53+1 would be rounded to 2^53,
 * which could put your applications at risk when used in loops.
 */
export declare function isInteger({ unsafe, }?: {
    unsafe?: boolean;
}): import("../types").LooseValidator<number, number>;
/**
 * Create a validator that checks that the tested string matches the given
 * regular expression.
 */
export declare function matchesRegExp(regExp: RegExp): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string only contain lowercase
 * characters.
 */
export declare function isLowerCase(): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string only contain uppercase
 * characters.
 */
export declare function isUpperCase(): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string is a valid UUID v4.
 */
export declare function isUUID4(): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string is a valid ISO8601
 * date.
 */
export declare function isISO8601(): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string is a valid hexadecimal
 * color. Setting the optional `alpha` parameter to `true` allows an additional
 * transparency channel to be included.
 */
export declare function isHexColor({ alpha, }: {
    alpha?: boolean;
}): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string is valid base64.
 */
export declare function isBase64(): import("../types").LooseValidator<string, string>;
/**
 * Create a validator that checks that the tested string is valid JSON. A
 * optional spec can be passed as parameter, in which case the data will be
 * deserialized and validated against the spec (coercion will be disabled
 * for this check, and even if successful the returned value will still be
 * the original string).
 */
export declare function isJSON(spec?: AnyStrictValidator): import("../types").LooseValidator<string, string>;
