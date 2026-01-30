import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
/**
 * GLSL Library responsible for data types and routines for manipulating
 * coordinates and mapping to/from tensor indices
 */
export declare class ShapeUtilsGlslLib extends GlslLib {
    constructor(context: GlslContext);
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    getCustomTypes(): {};
    protected bcastIndex(): {
        [name: string]: GlslLibRoutine;
    };
    protected bcastMatmulIndex(): {
        [name: string]: GlslLibRoutine;
    };
    protected indicesToOffset(): {
        [name: string]: GlslLibRoutine;
    };
    static indexToOffsetSingle(name: string, rank: number, strides: readonly number[]): string;
    protected offsetToIndices(): {
        [name: string]: GlslLibRoutine;
    };
    static offsetToIndicesSingle(name: string, rank: number, strides: readonly number[]): string;
    protected incrementIndices(): {
        [name: string]: GlslLibRoutine;
    };
}
