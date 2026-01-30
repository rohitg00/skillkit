import { AnyStrictValidator, InferType, LooseTest, StrictTest, StrictValidator } from '../types';
/**
 * Create a validator that runs the provided spec before applying a series of
 * followup validation on the refined type. This is useful when you not only
 * wish to validate the data type itself, but also its format.
 *
 * For example, the following would validate that a value is a valid port:
 *   t.cascade(t.isNumber(), t.isInteger(), t.isInInclusiveRange(1, 655356))
 *
 * And the following would validate that a value is base64:
 *   t.cascade(t.isString(), t.isBase64())
 */
export declare function cascade<T extends AnyStrictValidator>(spec: T, followups: Array<StrictTest<InferType<T>, InferType<T>> | LooseTest<InferType<T>>>): StrictValidator<unknown, InferType<T>>;
export declare function cascade<T extends AnyStrictValidator>(spec: T, ...followups: Array<StrictTest<InferType<T>, InferType<T>> | LooseTest<InferType<T>>>): StrictValidator<unknown, InferType<T>>;
/**
 * @deprecated Replace `applyCascade` by `cascade`
 */
export declare function applyCascade<T extends AnyStrictValidator>(spec: T, followups: Array<StrictTest<InferType<T>, InferType<T>> | LooseTest<InferType<T>>>): StrictValidator<unknown, InferType<T>>;
export declare function applyCascade<T extends AnyStrictValidator>(spec: T, ...followups: Array<StrictTest<InferType<T>, InferType<T>> | LooseTest<InferType<T>>>): StrictValidator<unknown, InferType<T>>;
/**
 * Wraps the given spec to also allow `undefined`.
 */
export declare function isOptional<T extends AnyStrictValidator>(spec: T): StrictValidator<unknown, InferType<T> | undefined>;
/**
 * Wraps the given spec to also allow `null`.
 */
export declare function isNullable<T extends AnyStrictValidator>(spec: T): StrictValidator<unknown, InferType<T> | null>;
export declare type MissingType = 'missing' | 'undefined' | 'nil' | 'falsy';
/**
 * Create a validator that checks that the tested object contains the specified
 * keys.
*/
export declare function hasRequiredKeys(requiredKeys: string[], options?: {
    missingIf?: MissingType;
}): import("../types").LooseValidator<Record<string, unknown>, Record<string, unknown>>;
/**
* Create a validator that checks that the tested object contains at least one
* of the specified keys.
*/
export declare function hasAtLeastOneKey(requiredKeys: string[], options?: {
    missingIf?: MissingType;
}): import("../types").LooseValidator<Record<string, unknown>, Record<string, unknown>>;
/**
 * Create a validator that checks that the tested object contains none of the
 * specified keys.
*/
export declare function hasForbiddenKeys(forbiddenKeys: string[], options?: {
    missingIf?: MissingType;
}): import("../types").LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
/**
 * Create a validator that checks that the tested object contains at most one
 * of the specified keys.
 */
export declare function hasMutuallyExclusiveKeys(exclusiveKeys: string[], options?: {
    missingIf?: MissingType;
}): import("../types").LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
export declare enum KeyRelationship {
    Forbids = "Forbids",
    Requires = "Requires"
}
/**
 * Create a validator that checks that, when the specified subject property is
 * set, the relationship is satisfied.
 */
export declare function hasKeyRelationship(subject: string, relationship: KeyRelationship, others: string[], options?: {
    ignore?: any[];
    missingIf?: MissingType;
}): import("../types").LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
