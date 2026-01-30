import { RawJointAxis, RawMultibodyJointSet } from "../raw";
/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export declare type MultibodyJointHandle = number;
export declare class MultibodyJoint {
    protected rawSet: RawMultibodyJointSet;
    handle: MultibodyJointHandle;
    constructor(rawSet: RawMultibodyJointSet, handle: MultibodyJointHandle);
    static newTyped(rawSet: RawMultibodyJointSet, handle: MultibodyJointHandle): MultibodyJoint;
    /**
     * Checks if this joint is still valid (i.e. that it has
     * not been deleted from the joint set yet).
     */
    isValid(): boolean;
    /**
     * Controls whether contacts are computed between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    setContactsEnabled(enabled: boolean): void;
    /**
     * Indicates if contacts are enabled between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    contactsEnabled(): boolean;
}
export declare class UnitMultibodyJoint extends MultibodyJoint {
    /**
     * The axis left free by this joint.
     */
    protected rawAxis?(): RawJointAxis;
}
export declare class FixedMultibodyJoint extends MultibodyJoint {
}
export declare class PrismaticMultibodyJoint extends UnitMultibodyJoint {
    rawAxis(): RawJointAxis;
}
export declare class RevoluteMultibodyJoint extends UnitMultibodyJoint {
    rawAxis(): RawJointAxis;
}
