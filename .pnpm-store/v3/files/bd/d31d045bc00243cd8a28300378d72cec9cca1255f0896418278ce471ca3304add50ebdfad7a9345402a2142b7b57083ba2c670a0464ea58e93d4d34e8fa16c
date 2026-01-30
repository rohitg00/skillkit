import { RawNarrowPhase, RawContactManifold } from "../raw";
import { ColliderHandle } from "./collider";
import { Vector } from "../math";
/**
 * The narrow-phase used for precise collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `narrowPhase.free()`
 * once you are done using it.
 */
export declare class NarrowPhase {
    raw: RawNarrowPhase;
    tempManifold: TempContactManifold;
    /**
     * Release the WASM memory occupied by this narrow-phase.
     */
    free(): void;
    constructor(raw?: RawNarrowPhase);
    /**
     * Enumerates all the colliders potentially in contact with the given collider.
     *
     * @param collider1 - The second collider involved in the contact.
     * @param f - Closure that will be called on each collider that is in contact with `collider1`.
     */
    contactPairsWith(collider1: ColliderHandle, f: (collider2: ColliderHandle) => void): void;
    /**
     * Enumerates all the colliders intersecting the given colliders, assuming one of them
     * is a sensor.
     */
    intersectionPairsWith(collider1: ColliderHandle, f: (collider2: ColliderHandle) => void): void;
    /**
     * Iterates through all the contact manifolds between the given pair of colliders.
     *
     * @param collider1 - The first collider involved in the contact.
     * @param collider2 - The second collider involved in the contact.
     * @param f - Closure that will be called on each contact manifold between the two colliders. If the second argument
     *            passed to this closure is `true`, then the contact manifold data is flipped, i.e., methods like `localNormal1`
     *            actually apply to the `collider2` and fields like `localNormal2` apply to the `collider1`.
     */
    contactPair(collider1: ColliderHandle, collider2: ColliderHandle, f: (manifold: TempContactManifold, flipped: boolean) => void): void;
    /**
     * Returns `true` if `collider1` and `collider2` intersect and at least one of them is a sensor.
     * @param collider1 − The first collider involved in the intersection.
     * @param collider2 − The second collider involved in the intersection.
     */
    intersectionPair(collider1: ColliderHandle, collider2: ColliderHandle): boolean;
}
export declare class TempContactManifold {
    raw: RawContactManifold;
    free(): void;
    constructor(raw: RawContactManifold);
    normal(): Vector;
    localNormal1(): Vector;
    localNormal2(): Vector;
    subshape1(): number;
    subshape2(): number;
    numContacts(): number;
    localContactPoint1(i: number): Vector | null;
    localContactPoint2(i: number): Vector | null;
    contactDist(i: number): number;
    contactFid1(i: number): number;
    contactFid2(i: number): number;
    contactImpulse(i: number): number;
    contactTangentImpulse(i: number): number;
    numSolverContacts(): number;
    solverContactPoint(i: number): Vector;
    solverContactDist(i: number): number;
    solverContactFriction(i: number): number;
    solverContactRestitution(i: number): number;
    solverContactTangentVelocity(i: number): Vector;
}
