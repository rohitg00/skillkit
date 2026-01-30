import { RawBroadPhase } from "../raw";
/**
 * The broad-phase used for coarse collision-detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `broadPhase.free()`
 * once you are done using it.
 */
export declare class BroadPhase {
    raw: RawBroadPhase;
    /**
     * Release the WASM memory occupied by this broad-phase.
     */
    free(): void;
    constructor(raw?: RawBroadPhase);
}
