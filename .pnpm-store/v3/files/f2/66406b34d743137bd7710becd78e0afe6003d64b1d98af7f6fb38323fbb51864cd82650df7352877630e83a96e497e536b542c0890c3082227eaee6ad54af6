import { RawMultibodyJointSet } from "../raw";
import { MultibodyJoint, MultibodyJointHandle } from "./multibody_joint";
import { JointData } from "./impulse_joint";
import { RigidBodyHandle } from "./rigid_body";
/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
export declare class MultibodyJointSet {
    raw: RawMultibodyJointSet;
    private map;
    /**
     * Release the WASM memory occupied by this joint set.
     */
    free(): void;
    constructor(raw?: RawMultibodyJointSet);
    /**
     * Creates a new joint and return its integer handle.
     *
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    createJoint(desc: JointData, parent1: RigidBodyHandle, parent2: RigidBodyHandle, wakeUp: boolean): MultibodyJoint;
    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param wake_up - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    remove(handle: MultibodyJointHandle, wake_up: boolean): void;
    /**
     * Internal function, do not call directly.
     * @param handle
     */
    unmap(handle: MultibodyJointHandle): void;
    /**
     * The number of joints on this set.
     */
    len(): number;
    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    contains(handle: MultibodyJointHandle): boolean;
    /**
     * Gets the joint with the given handle.
     *
     * Returns `null` if no joint with the specified handle exists.
     *
     * @param handle - The integer handle of the joint to retrieve.
     */
    get(handle: MultibodyJointHandle): MultibodyJoint | null;
    /**
     * Applies the given closure to each joint contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f: (joint: MultibodyJoint) => void): void;
    /**
     * Calls the given closure with the integer handle of each multibody joint attached to this rigid-body.
     *
     * @param f - The closure called with the integer handle of each multibody joint attached to the rigid-body.
     */
    forEachJointHandleAttachedToRigidBody(handle: RigidBodyHandle, f: (handle: MultibodyJointHandle) => void): void;
    /**
     * Gets all joints in the list.
     *
     * @returns joint list.
     */
    getAll(): MultibodyJoint[];
}
