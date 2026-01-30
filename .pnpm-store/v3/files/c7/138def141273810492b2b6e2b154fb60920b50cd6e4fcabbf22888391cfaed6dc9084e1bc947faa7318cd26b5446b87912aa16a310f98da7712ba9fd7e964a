import { RawRigidBodySet } from "../raw";
import { RigidBody, RigidBodyDesc, RigidBodyHandle } from "./rigid_body";
import { ColliderSet } from "../geometry";
import { ImpulseJointSet } from "./impulse_joint_set";
import { MultibodyJointSet } from "./multibody_joint_set";
import { IslandManager } from "./island_manager";
/**
 * A set of rigid bodies that can be handled by a physics pipeline.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `rigidBodySet.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export declare class RigidBodySet {
    raw: RawRigidBodySet;
    private map;
    /**
     * Release the WASM memory occupied by this rigid-body set.
     */
    free(): void;
    constructor(raw?: RawRigidBodySet);
    /**
     * Internal method, do not call this explicitly.
     */
    finalizeDeserialization(colliderSet: ColliderSet): void;
    /**
     * Creates a new rigid-body and return its integer handle.
     *
     * @param desc - The description of the rigid-body to create.
     */
    createRigidBody(colliderSet: ColliderSet, desc: RigidBodyDesc): RigidBody;
    /**
     * Removes a rigid-body from this set.
     *
     * This will also remove all the colliders and joints attached to the rigid-body.
     *
     * @param handle - The integer handle of the rigid-body to remove.
     * @param colliders - The set of colliders that may contain colliders attached to the removed rigid-body.
     * @param impulseJoints - The set of impulse joints that may contain joints attached to the removed rigid-body.
     * @param multibodyJoints - The set of multibody joints that may contain joints attached to the removed rigid-body.
     */
    remove(handle: RigidBodyHandle, islands: IslandManager, colliders: ColliderSet, impulseJoints: ImpulseJointSet, multibodyJoints: MultibodyJointSet): void;
    /**
     * The number of rigid-bodies on this set.
     */
    len(): number;
    /**
     * Does this set contain a rigid-body with the given handle?
     *
     * @param handle - The rigid-body handle to check.
     */
    contains(handle: RigidBodyHandle): boolean;
    /**
     * Gets the rigid-body with the given handle.
     *
     * @param handle - The handle of the rigid-body to retrieve.
     */
    get(handle: RigidBodyHandle): RigidBody | null;
    /**
     * Applies the given closure to each rigid-body contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f: (body: RigidBody) => void): void;
    /**
     * Applies the given closure to each active rigid-bodies contained by this set.
     *
     * A rigid-body is active if it is not sleeping, i.e., if it moved recently.
     *
     * @param f - The closure to apply.
     */
    forEachActiveRigidBody(islands: IslandManager, f: (body: RigidBody) => void): void;
    /**
     * Gets all rigid-bodies in the list.
     *
     * @returns rigid-bodies list.
     */
    getAll(): RigidBody[];
}
