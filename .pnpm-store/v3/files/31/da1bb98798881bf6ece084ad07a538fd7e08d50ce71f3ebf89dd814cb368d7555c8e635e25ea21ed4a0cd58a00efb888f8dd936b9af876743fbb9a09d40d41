import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
import { TextureLayout } from './types';
/**
 * GLSL Library responsible for data types and routines for manipulating
 * coordinates and mapping to/from tensor indices
 */
export declare class CoordsGlslLib extends GlslLib {
    returnType: string;
    constructor(context: GlslContext);
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    getCustomTypes(): {};
    /**
     * Produces a function that can map from
     * 2D normalzied coordinates (s,t) to a flat offset
     */
    protected offsetToCoords(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Produces a function that can map from
     * 2D normalzied coordinates (s,t) to a flat offset
     */
    protected coordsToOffset(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Generates code for output sampler.
     */
    protected getOutputSamplingSnippet(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Generates code for packed output sampler.
     */
    protected getPackedOutputSamplingSnippet(outputLayout: TextureLayout): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Generates code for unpacked output sampler.
     */
    protected getUnpackedOutputSamplingSnippet(outputLayout: TextureLayout): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Scalar output coordinates.
     */
    protected getOutputScalarCoords(): GlslLibRoutine;
    /**
     * 1D packed output coordinates.
     */
    protected getOutputPacked1DCoords(shape: [number], texShape: [number, number]): GlslLibRoutine;
    /**
     * 2D packed output coordinates.
     */
    protected getOutputPacked2DCoords(shape: [number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * 3D packed output coordinates.
     */
    protected getOutputPacked3DCoords(shape: [number, number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * ND packed output coordinates.
     */
    protected getOutputPackedNDCoords(shape: readonly number[], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 1D output coordinates.
     */
    protected getOutputUnpacked1DCoords(shape: [number], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 2D output coordinates.
     */
    protected getOutputUnpacked2DCoords(shape: [number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 3D output coordinates.
     */
    protected getOutputUnpacked3DCoords(shape: [number, number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 4D output coordinates.
     */
    protected getOutputUnpacked4DCoords(shape: [number, number, number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 5D output coordinates.
     */
    protected getOutputUnpacked5DCoords(shape: [number, number, number, number, number], texShape: [number, number]): GlslLibRoutine;
    /**
     * Unpacked 6D output coordinates.
     */
    protected getOutputUnpacked6DCoords(shape: [number, number, number, number, number, number], texShape: [
        number,
        number
    ]): GlslLibRoutine;
    /**
     * Generates code for common UV coords computation utility functions.
     */
    protected getCommonUtilFuncs(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Constructing snippets for inputs
     */
    protected getInputsSamplingSnippets(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Constructing snippets for output coordinates of samplers
     */
    protected getPackedSamplerAtOutputCoords(funcName: string, inputLayout: TextureLayout, outputLayout: TextureLayout, name: string): GlslLibRoutine;
    /**
     * Constructing snippets for unpacked output coordinates of samplers
     */
    protected getUnpackedSamplerAtOutputCoords(funcName: string, inputLayout: TextureLayout, outputLayout: TextureLayout, name: string): GlslLibRoutine;
    /**
     * Constructing snippets for packed operations.
     */
    protected getPackedSamplerFromInput(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Constructing snippets for unpacked operations.
     */
    protected getUnpackedSamplerFromInput(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Packed scalar snippet.
     */
    protected getPackedSamplerScalar(funcName: string, name: string): GlslLibRoutine;
    /**
     * Packed 1D snippet.
     */
    protected getPackedSampler1D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Packed 2D snippet.
     */
    protected getPackedSampler2D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Packed 3D snippet.
     */
    protected getPackedSampler3D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    protected getPackedSamplerND(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked scalar snippet.
     */
    protected getUnpackedSamplerScalar(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 1D snippet.
     */
    protected getUnpackedSampler1D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 2D snippet.
     */
    protected getUnpackedSampler2D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 3D snippet.
     */
    protected getUnpackedSampler3D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 4D snippet.
     */
    protected getUnpackedSampler4D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 5D snippet.
     */
    protected getUnpackedSampler5D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * Unpacked 6D snippet.
     */
    protected getUnpackedSampler6D(funcName: string, name: string, inputLayout: TextureLayout): GlslLibRoutine;
    /**
     * This is the main function to map from the given texture coordiantes (s,t)
     * to logical indices for the output
     * There will only be one single variation of this
     * Also see coordsToOffset and offsetToIndices for input-specific versions
     */
    protected toVec(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * These are value getter functions generated for each input
     * Each function is hardwired to the name and dimensions of the input
     * An '_T' variation is also produced which accesses values as if the
     * input was transposed
     */
    protected valueFrom(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Produces one value getter function for the name and rank given
     * If a transpose is set proper offsetToCoords mapping will be used
     * @param name name of the function
     * @param rank rank of the input
     * @param transpose whether or not should generate a transpose variation
     */
    protected getValueFromSingle(varName: string, rank: number, width: number, height: number, transpose: boolean): string;
    /**
     * Produces a packed value getter function for the name and rank given
     * If a transpose is set proper offsetToCoords mapping will be used
     * @param name name of the function
     * @param rank rank of the input
     * @param transpose whether or not should generate a transpose variation
     */
    protected getPackedValueFrom(varName: string, rank: number, width: number, height: number, transpose: boolean): string;
}
