import { RawIntegrationParameters } from "../raw";
export declare class IntegrationParameters {
    raw: RawIntegrationParameters;
    constructor(raw?: RawIntegrationParameters);
    /**
     * Free the WASM memory used by these integration parameters.
     */
    free(): void;
    /**
     * The timestep length (default: `1.0 / 60.0`)
     */
    get dt(): number;
    /**
     * The Error Reduction Parameter in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get contact_erp(): number;
    get lengthUnit(): number;
    /**
     * Normalized amount of penetration the engine won’t attempt to correct (default: `0.001m`).
     *
     * This threshold considered by the physics engine is this value multiplied by the `lengthUnit`.
     */
    get normalizedAllowedLinearError(): number;
    /**
     * The maximal normalized distance separating two objects that will generate predictive contacts (default: `0.002`).
     *
     * This threshold considered by the physics engine is this value multiplied by the `lengthUnit`.
     */
    get normalizedPredictionDistance(): number;
    /**
     * The number of solver iterations run by the constraints solver for calculating forces (default: `4`).
     */
    get numSolverIterations(): number;
    /**
     * Number of addition friction resolution iteration run during the last solver sub-step (default: `4`).
     */
    get numAdditionalFrictionIterations(): number;
    /**
     * Number of internal Project Gauss Seidel (PGS) iterations run at each solver iteration (default: `1`).
     */
    get numInternalPgsIterations(): number;
    /**
     * Minimum number of dynamic bodies in each active island (default: `128`).
     */
    get minIslandSize(): number;
    /**
     * Maximum number of substeps performed by the  solver (default: `1`).
     */
    get maxCcdSubsteps(): number;
    set dt(value: number);
    set contact_natural_frequency(value: number);
    set lengthUnit(value: number);
    set normalizedAllowedLinearError(value: number);
    set normalizedPredictionDistance(value: number);
    /**
     * Sets the number of solver iterations run by the constraints solver for calculating forces (default: `4`).
     */
    set numSolverIterations(value: number);
    /**
     * Sets the number of addition friction resolution iteration run during the last solver sub-step (default: `4`).
     */
    set numAdditionalFrictionIterations(value: number);
    /**
     * Sets the number of internal Project Gauss Seidel (PGS) iterations run at each solver iteration (default: `1`).
     */
    set numInternalPgsIterations(value: number);
    set minIslandSize(value: number);
    set maxCcdSubsteps(value: number);
    switchToStandardPgsSolver(): void;
    switchToSmallStepsPgsSolver(): void;
    switchToSmallStepsPgsSolverWithoutWarmstart(): void;
}
