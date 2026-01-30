import { RawIslandManager } from "../raw";
import { RigidBodyHandle } from "./rigid_body";
/**
 * The CCD solver responsible for resolving Continuous Collision Detection.
 *
 * To avoid leaking WASM resources, this MUST be freed manually with `ccdSolver.free()`
 * once you are done using it.
 */
export declare class IslandManager {
    raw: RawIslandManager;
    /**
     * Release the WASM memory occupied by this narrow-phase.
     */
    free(): void;
    constructor(raw?: RawIslandManager);
    /**
     * Applies the given closure to the handle of each active rigid-bodies contained by this set.
     *
     * A rigid-body is active if it is not sleeping, i.e., if it moved recently.
     *
     * @param f - The closure to apply.
     */
    forEachActiveRigidBodyHandle(f: (handle: RigidBodyHandle) => void): void;
}
