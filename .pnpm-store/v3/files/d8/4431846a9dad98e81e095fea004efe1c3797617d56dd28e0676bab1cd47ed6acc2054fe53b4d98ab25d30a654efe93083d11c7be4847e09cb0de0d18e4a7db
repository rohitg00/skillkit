import { Vector } from "../math";
import { IntegrationParameters, RigidBody, RigidBodySet } from "../dynamics";
/**
 * An enum representing the possible joint axes controlled by a PidController.
 * They can be ORed together, like:
 * PidAxesMask.LinX || PidAxesMask.LinY
 * to get a pid controller that only constraints the translational X and Y axes.
 *
 * Possible axes are:
 *
 * - `X`: X translation axis
 * - `Y`: Y translation axis
 * - `Z`: Z translation axis
 * - `AngX`: X angular rotation axis (3D only)
 * - `AngY`: Y angular rotation axis (3D only)
 * - `AngZ`: Z angular rotation axis
 */
export declare enum PidAxesMask {
    None = 0,
    LinX = 1,
    LinY = 2,
    LinZ = 4,
    AngZ = 32,
    AllLin = 3,
    AllAng = 32,
    All = 35
}
/**
 * A controller for controlling dynamic bodies using the
 * Proportional-Integral-Derivative correction model.
 */
export declare class PidController {
    private raw;
    private params;
    private bodies;
    constructor(params: IntegrationParameters, bodies: RigidBodySet, kp: number, ki: number, kd: number, axes: PidAxesMask);
    /** @internal */
    free(): void;
    setKp(kp: number, axes: PidAxesMask): void;
    setKi(ki: number, axes: PidAxesMask): void;
    setKd(kd: number, axes: PidAxesMask): void;
    setAxes(axes: PidAxesMask): void;
    resetIntegrals(): void;
    applyLinearCorrection(body: RigidBody, targetPosition: Vector, targetLinvel: Vector): void;
    applyAngularCorrection(body: RigidBody, targetRotation: number, targetAngVel: number): void;
    linearCorrection(body: RigidBody, targetPosition: Vector, targetLinvel: Vector): Vector;
    angularCorrection(body: RigidBody, targetRotation: number, targetAngVel: number): number;
}
