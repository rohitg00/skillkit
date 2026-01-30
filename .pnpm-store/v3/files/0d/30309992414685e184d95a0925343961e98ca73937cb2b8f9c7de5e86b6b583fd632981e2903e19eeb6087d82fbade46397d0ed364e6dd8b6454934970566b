import { RawPhysicsPipeline } from "../raw";
import { Vector } from "../math";
import { IntegrationParameters, ImpulseJointSet, MultibodyJointSet, RigidBodySet, CCDSolver, IslandManager } from "../dynamics";
import { BroadPhase, ColliderSet, NarrowPhase } from "../geometry";
import { EventQueue } from "./event_queue";
import { PhysicsHooks } from "./physics_hooks";
export declare class PhysicsPipeline {
    raw: RawPhysicsPipeline;
    free(): void;
    constructor(raw?: RawPhysicsPipeline);
    step(gravity: Vector, integrationParameters: IntegrationParameters, islands: IslandManager, broadPhase: BroadPhase, narrowPhase: NarrowPhase, bodies: RigidBodySet, colliders: ColliderSet, impulseJoints: ImpulseJointSet, multibodyJoints: MultibodyJointSet, ccdSolver: CCDSolver, eventQueue?: EventQueue, hooks?: PhysicsHooks): void;
}
