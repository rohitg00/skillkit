import { Vector } from "../math";
import { RawShapeContact } from "../raw";
/**
 * The contact info between two shapes.
 */
export declare class ShapeContact {
    /**
     * Distance between the two contact points.
     * If this is negative, this contact represents a penetration.
     */
    distance: number;
    /**
     * Position of the contact on the first shape.
     */
    point1: Vector;
    /**
     * Position of the contact on the second shape.
     */
    point2: Vector;
    /**
     * Contact normal, pointing towards the exterior of the first shape.
     */
    normal1: Vector;
    /**
     * Contact normal, pointing towards the exterior of the second shape.
     * If these contact data are expressed in world-space, this normal is equal to -normal1.
     */
    normal2: Vector;
    constructor(dist: number, point1: Vector, point2: Vector, normal1: Vector, normal2: Vector);
    static fromRaw(raw: RawShapeContact): ShapeContact;
}
