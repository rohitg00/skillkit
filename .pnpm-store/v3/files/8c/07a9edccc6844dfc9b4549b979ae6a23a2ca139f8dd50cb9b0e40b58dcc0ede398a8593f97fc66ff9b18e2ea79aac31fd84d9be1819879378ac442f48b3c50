export declare type BoundCoercionFn = () => BoundCoercionFn;
export declare type CoercionFn = (v: any) => BoundCoercionFn;
export declare type Coercion = [string, BoundCoercionFn];
/**
 * Given a Typanion validator, return the type the validator guarantees if it
 * matches.
 */
export declare type InferType<U> = U extends Trait<infer V> ? V : never;
export declare type Trait<Type> = {
    __trait: Type;
};
export declare type LooseTest<U> = (value: U, test?: ValidationState) => boolean;
export declare type StrictTest<U, V extends U> = (value: U, test?: ValidationState) => value is V;
export declare type LooseValidator<U, V> = LooseTest<U> & Trait<V>;
export declare type StrictValidator<U, V extends U> = StrictTest<U, V> & Trait<V>;
export declare type AnyStrictValidator = StrictValidator<any, any>;
export declare type ValidationState = {
    p?: string;
    errors?: string[];
    coercions?: Coercion[];
    coercion?: CoercionFn;
};
