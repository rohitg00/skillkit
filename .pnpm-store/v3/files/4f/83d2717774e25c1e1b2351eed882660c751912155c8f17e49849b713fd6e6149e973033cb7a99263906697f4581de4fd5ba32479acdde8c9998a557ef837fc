import { RawImpulseJointSet } from "../raw";
import { RigidBodySet } from "./rigid_body_set";
import { ImpulseJoint, ImpulseJointHandle, JointData } from "./impulse_joint";
import { RigidBodyHandle } from "./rigid_body";
/**
 * A set of joints.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `jointSet.free()`
 * once you are done using it (and all the joints it created).
 */
export declare class ImpulseJointSet {
    raw: RawImpulseJointSet;
    private map;
    /**
     * Release the WASM memory occupied by this joint set.
     */
    free(): void;
    constructor(raw?: RawImpulseJointSet);
    /** @internal */
    finalizeDeserialization(bodies: RigidBodySet): void;
    /**
     * Creates a new joint and return its integer handle.
     *
     * @param bodies - The set of rigid-bodies containing the bodies the joint is attached to.
     * @param desc - The joint's parameters.
     * @param parent1 - The handle of the first rigid-body this joint is attached to.
     * @param parent2 - The handle of the second rigid-body this joint is attached to.
     * @param wakeUp - Should the attached rigid-bodies be awakened?
     */
    createJoint(bodies: RigidBodySet, desc: JointData, parent1: RigidBodyHandle, parent2: RigidBodyHandle, wakeUp: boolean): ImpulseJoint;
    /**
     * Remove a joint from this set.
     *
     * @param handle - The integer handle of the joint.
     * @param wakeUp - If `true`, the rigid-bodies attached by the removed joint will be woken-up automatically.
     */
    remove(handle: ImpulseJointHandle, wakeUp: boolean): void;
    /**
     * Calls the given closure with the integer handle of each impulse joint attached to this rigid-body.
     *
     * @param f - The closure called with the integer handle of each impulse joint attached to the rigid-body.
     */
    forEachJointHandleAttachedToRigidBody(handle: RigidBodyHandle, f: (handle: ImpulseJointHandle) => void): void;
    /**
     * Internal function, do not call directly.
     * @param handle
     */
    unmap(handle: ImpulseJointHandle): void;
    /**
     * The number of joints on this set.
     */
    len(): number;
    /**
     * Does this set contain a joint with the given handle?
     *
     * @param handle - The joint handle to check.
     */
    contains(handle: ImpulseJointHandle): boolean;
    /**
     * Gets the joint with the given handle.
     *
     * Returns `null` if no joint with the specified handle exists.
     *
     * @param handle - The integer handle of the joint to retrieve.
     */
    get(handle: ImpulseJointHandle): ImpulseJoint | null;
    /**
     * Applies the given closure to each joint contained by this set.
     *
     * @param f - The closure to apply.
     */
    forEach(f: (joint: ImpulseJoint) => void): void;
    /**
     * Gets all joints in the list.
     *
     * @returns joint list.
     */
    getAll(): ImpulseJoint[];
}
