import { Vector } from "../math";
import { Collider, ColliderSet, InteractionGroups } from "../geometry";
import { QueryFilterFlags, QueryPipeline } from "../pipeline";
import { IntegrationParameters, RigidBodySet } from "../dynamics";
/**
 * A collision between the character and an obstacle hit on its path.
 */
export declare class CharacterCollision {
    /** The collider involved in the collision. Null if the collider no longer exists in the physics world. */
    collider: Collider | null;
    /** The translation delta applied to the character before this collision took place. */
    translationDeltaApplied: Vector;
    /** The translation delta the character would move after this collision if there is no other obstacles. */
    translationDeltaRemaining: Vector;
    /** The time-of-impact between the character and the obstacles. */
    toi: number;
    /** The world-space contact point on the collider when the collision happens. */
    witness1: Vector;
    /** The local-space contact point on the character when the collision happens. */
    witness2: Vector;
    /** The world-space outward contact normal on the collider when the collision happens. */
    normal1: Vector;
    /** The local-space outward contact normal on the character when the collision happens. */
    normal2: Vector;
}
/**
 * A character controller for controlling kinematic bodies and parentless colliders by hitting
 * and sliding against obstacles.
 */
export declare class KinematicCharacterController {
    private raw;
    private rawCharacterCollision;
    private params;
    private bodies;
    private colliders;
    private queries;
    private _applyImpulsesToDynamicBodies;
    private _characterMass;
    constructor(offset: number, params: IntegrationParameters, bodies: RigidBodySet, colliders: ColliderSet, queries: QueryPipeline);
    /** @internal */
    free(): void;
    /**
     * The direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    up(): Vector;
    /**
     * Sets the direction that goes "up". Used to determine where the floor is, and the floor’s angle.
     */
    setUp(vector: Vector): void;
    applyImpulsesToDynamicBodies(): boolean;
    setApplyImpulsesToDynamicBodies(enabled: boolean): void;
    /**
     * Returns the custom value of the character mass, if it was set by `this.setCharacterMass`.
     */
    characterMass(): number | null;
    /**
     * Set the mass of the character to be used for impulse resolution if `self.applyImpulsesToDynamicBodies`
     * is set to `true`.
     *
     * If no character mass is set explicitly (or if it is set to `null`) it is automatically assumed to be equal
     * to the mass of the rigid-body the character collider is attached to; or equal to 0 if the character collider
     * isn’t attached to any rigid-body.
     *
     * @param mass - The mass to set.
     */
    setCharacterMass(mass: number | null): void;
    /**
     * A small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    offset(): number;
    /**
     * Sets a small gap to preserve between the character and its surroundings.
     *
     * This value should not be too large to avoid visual artifacts, but shouldn’t be too small
     * (must not be zero) to improve numerical stability of the character controller.
     */
    setOffset(value: number): void;
    normalNudgeFactor(): number;
    setNormalNudgeFactor(value: number): void;
    /**
     * Is sliding against obstacles enabled?
     */
    slideEnabled(): boolean;
    /**
     * Enable or disable sliding against obstacles.
     */
    setSlideEnabled(enabled: boolean): void;
    /**
     * The maximum step height a character can automatically step over.
     */
    autostepMaxHeight(): number | null;
    /**
     * The minimum width of free space that must be available after stepping on a stair.
     */
    autostepMinWidth(): number | null;
    /**
     * Can the character automatically step over dynamic bodies too?
     */
    autostepIncludesDynamicBodies(): boolean | null;
    /**
     * Is automatically stepping over small objects enabled?
     */
    autostepEnabled(): boolean;
    /**
     * Enabled automatically stepping over small objects.
     *
     * @param maxHeight - The maximum step height a character can automatically step over.
     * @param minWidth - The minimum width of free space that must be available after stepping on a stair.
     * @param includeDynamicBodies - Can the character automatically step over dynamic bodies too?
     */
    enableAutostep(maxHeight: number, minWidth: number, includeDynamicBodies: boolean): void;
    /**
     * Disable automatically stepping over small objects.
     */
    disableAutostep(): void;
    /**
     * The maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    maxSlopeClimbAngle(): number;
    /**
     * Sets the maximum angle (radians) between the floor’s normal and the `up` vector that the
     * character is able to climb.
     */
    setMaxSlopeClimbAngle(angle: number): void;
    /**
     * The minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    minSlopeSlideAngle(): number;
    /**
     * Sets the minimum angle (radians) between the floor’s normal and the `up` vector before the
     * character starts to slide down automatically.
     */
    setMinSlopeSlideAngle(angle: number): void;
    /**
     * If snap-to-ground is enabled, should the character be automatically snapped to the ground if
     * the distance between the ground and its feet are smaller than the specified threshold?
     */
    snapToGroundDistance(): number | null;
    /**
     * Enables automatically snapping the character to the ground if the distance between
     * the ground and its feet are smaller than the specified threshold.
     */
    enableSnapToGround(distance: number): void;
    /**
     * Disables automatically snapping the character to the ground.
     */
    disableSnapToGround(): void;
    /**
     * Is automatically snapping the character to the ground enabled?
     */
    snapToGroundEnabled(): boolean;
    /**
     * Computes the movement the given collider is able to execute after hitting and sliding on obstacles.
     *
     * @param collider - The collider to move.
     * @param desiredTranslationDelta - The desired collider movement.
     * @param filterFlags - Flags for excluding whole subsets of colliders from the obstacles taken into account.
     * @param filterGroups - Groups for excluding colliders with incompatible collision groups from the obstacles
     *                       taken into account.
     * @param filterPredicate - Any collider for which this closure returns `false` will be excluded from the
     *                          obstacles taken into account.
     */
    computeColliderMovement(collider: Collider, desiredTranslationDelta: Vector, filterFlags?: QueryFilterFlags, filterGroups?: InteractionGroups, filterPredicate?: (collider: Collider) => boolean): void;
    /**
     * The movement computed by the last call to `this.computeColliderMovement`.
     */
    computedMovement(): Vector;
    /**
     * The result of ground detection computed by the last call to `this.computeColliderMovement`.
     */
    computedGrounded(): boolean;
    /**
     * The number of collisions against obstacles detected along the path of the last call
     * to `this.computeColliderMovement`.
     */
    numComputedCollisions(): number;
    /**
     * Returns the collision against one of the obstacles detected along the path of the last
     * call to `this.computeColliderMovement`.
     *
     * @param i - The i-th collision will be returned.
     * @param out - If this argument is set, it will be filled with the collision information.
     */
    computedCollision(i: number, out?: CharacterCollision): CharacterCollision | null;
}
