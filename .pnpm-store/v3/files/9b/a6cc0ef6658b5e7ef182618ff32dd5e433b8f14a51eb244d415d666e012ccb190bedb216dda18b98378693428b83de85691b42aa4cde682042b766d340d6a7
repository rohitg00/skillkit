import { RawVector, RawRotation } from "./raw";
export interface Vector {
    x: number;
    y: number;
}
/**
 * A 2D vector.
 */
export declare class Vector2 implements Vector {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
export declare class VectorOps {
    static new(x: number, y: number): Vector;
    static zeros(): Vector;
    static fromRaw(raw: RawVector): Vector;
    static intoRaw(v: Vector): RawVector;
    static copy(out: Vector, input: Vector): void;
}
/**
 * A rotation angle in radians.
 */
export declare type Rotation = number;
export declare class RotationOps {
    static identity(): number;
    static fromRaw(raw: RawRotation): Rotation;
    static intoRaw(angle: Rotation): RawRotation;
}
