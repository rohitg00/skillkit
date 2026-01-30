import { RawColliderSet } from "../raw";
import { Collider, ColliderDesc, ColliderHandle } from "./collider";
import { ImpulseJointHandle, IslandManager, RigidBodyHandle } from "../dynamics";
import { RigidBodySet } from "../dynamics";
/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `colliderSet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export declare class ColliderSet {
    raw: RawColliderSet;
    private map;
    /**
     * Release the WASM memory occupied by this collider set.
     */
    free(): void;
    constructor(raw?: RawColliderSet);
    /** @internal */
    castClosure<Res>(f?: (collider: Collider) => Res): (handle: ColliderHandle) => Res | undefined;
    /** @internal */
    finalizeDeserialization(bodies: RigidBodySet): void;
    /**
     * Creates a new collider and return its integer handle.
     *
     * @param bodies - The set of bodies where the collider's parent can be found.
     * @param desc - The collider's description.
     * @param parentHandle - The integer handle of the rigid-body this collider is attached to.
     */
    createCollider(bodies: RigidBodySet, desc: ColliderDesc, parentHandle: RigidBodyHandle): Collider;
    /**
     * Remove a collider from this set.
     *
     * @param handle - The integer handle of the collider to remove.
     * @param bodies - The set of rigid-body containing the rigid-body the collider is attached to.
     * @param wakeUp - If `true`, the rigid-body the removed collider is attached to will be woken-up automatically.
     */
    remove(handle: ColliderHandle, islands: IslandManager, bodies: RigidBodySet, wakeUp: boolean): void;
    /**
     * Internal function, do not call directly.
     * @param handle
     */
    unmap(handle: ImpulseJointHandle): void;
    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    get(handle: ColliderHandle): Collider | null;
    /**
     * The number of colliders on this set.
     */
    len(): number;
    /**
     * Does this set contain a collider with the given handle?
     *
     * @param handle - The collider handle to check.
     */
    contains(handle: ColliderHandle): boolean;
    /**
     * Applies the given closure to each collider contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f: (collider: Collider) => void): void;
    /**
     * Gets all colliders in the list.
     *
     * @returns collider list.
     */
    getAll(): Collider[];
}
