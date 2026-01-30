import { RawSerializationPipeline } from "../raw";
import { Vector } from "../math";
import { IntegrationParameters, IslandManager, ImpulseJointSet, MultibodyJointSet, RigidBodySet } from "../dynamics";
import { BroadPhase, ColliderSet, NarrowPhase } from "../geometry";
import { World } from "./world";
/**
 * A pipeline for serializing the physics scene.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `queryPipeline.free()`
 * once you are done using it (and all the rigid-bodies it created).
 */
export declare class SerializationPipeline {
    raw: RawSerializationPipeline;
    /**
     * Release the WASM memory occupied by this serialization pipeline.
     */
    free(): void;
    constructor(raw?: RawSerializationPipeline);
    /**
     * Serialize a complete physics state into a single byte array.
     * @param gravity - The current gravity affecting the simulation.
     * @param integrationParameters - The integration parameters of the simulation.
     * @param broadPhase - The broad-phase of the simulation.
     * @param narrowPhase - The narrow-phase of the simulation.
     * @param bodies - The rigid-bodies taking part into the simulation.
     * @param colliders - The colliders taking part into the simulation.
     * @param impulseJoints - The impulse joints taking part into the simulation.
     * @param multibodyJoints - The multibody joints taking part into the simulation.
     */
    serializeAll(gravity: Vector, integrationParameters: IntegrationParameters, islands: IslandManager, broadPhase: BroadPhase, narrowPhase: NarrowPhase, bodies: RigidBodySet, colliders: ColliderSet, impulseJoints: ImpulseJointSet, multibodyJoints: MultibodyJointSet): Uint8Array;
    /**
     * Deserialize the complete physics state from a single byte array.
     *
     * @param data - The byte array to deserialize.
     */
    deserializeAll(data: Uint8Array): World;
}
