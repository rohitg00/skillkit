import { RawContactForceEvent, RawEventQueue } from "../raw";
import { ColliderHandle } from "../geometry";
import { Vector } from "../math";
/**
 * Flags indicating what events are enabled for colliders.
 */
export declare enum ActiveEvents {
    NONE = 0,
    /**
     * Enable collision events.
     */
    COLLISION_EVENTS = 1,
    /**
     * Enable contact force events.
     */
    CONTACT_FORCE_EVENTS = 2
}
/**
 * Event occurring when the sum of the magnitudes of the
 * contact forces between two colliders exceed a threshold.
 *
 * This object should **not** be stored anywhere. Its properties can only be
 * read from within the closure given to `EventHandler.drainContactForceEvents`.
 */
export declare class TempContactForceEvent {
    raw: RawContactForceEvent;
    free(): void;
    /**
     * The first collider involved in the contact.
     */
    collider1(): ColliderHandle;
    /**
     * The second collider involved in the contact.
     */
    collider2(): ColliderHandle;
    /**
     * The sum of all the forces between the two colliders.
     */
    totalForce(): Vector;
    /**
     * The sum of the magnitudes of each force between the two colliders.
     *
     * Note that this is **not** the same as the magnitude of `self.total_force`.
     * Here we are summing the magnitude of all the forces, instead of taking
     * the magnitude of their sum.
     */
    totalForceMagnitude(): number;
    /**
     * The world-space (unit) direction of the force with strongest magnitude.
     */
    maxForceDirection(): Vector;
    /**
     * The magnitude of the largest force at a contact point of this contact pair.
     */
    maxForceMagnitude(): number;
}
/**
 * A structure responsible for collecting events generated
 * by the physics engine.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `eventQueue.free()`
 * once you are done using it.
 */
export declare class EventQueue {
    raw: RawEventQueue;
    /**
     * Creates a new event collector.
     *
     * @param autoDrain -setting this to `true` is strongly recommended. If true, the collector will
     * be automatically drained before each `world.step(collector)`. If false, the collector will
     * keep all events in memory unless it is manually drained/cleared; this may lead to unbounded use of
     * RAM if no drain is performed.
     */
    constructor(autoDrain: boolean, raw?: RawEventQueue);
    /**
     * Release the WASM memory occupied by this event-queue.
     */
    free(): void;
    /**
     * Applies the given javascript closure on each collision event of this collector, then clear
     * the internal collision event buffer.
     *
     * @param f - JavaScript closure applied to each collision event. The
     * closure must take three arguments: two integers representing the handles of the colliders
     * involved in the collision, and a boolean indicating if the collision started (true) or stopped
     * (false).
     */
    drainCollisionEvents(f: (handle1: ColliderHandle, handle2: ColliderHandle, started: boolean) => void): void;
    /**
     * Applies the given javascript closure on each contact force event of this collector, then clear
     * the internal collision event buffer.
     *
     * @param f - JavaScript closure applied to each collision event. The
     *            closure must take one `TempContactForceEvent` argument.
     */
    drainContactForceEvents(f: (event: TempContactForceEvent) => void): void;
    /**
     * Removes all events contained by this collector
     */
    clear(): void;
}
