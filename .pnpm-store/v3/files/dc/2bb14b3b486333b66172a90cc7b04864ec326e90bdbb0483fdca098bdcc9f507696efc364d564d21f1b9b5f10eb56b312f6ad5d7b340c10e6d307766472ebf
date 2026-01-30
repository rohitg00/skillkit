/**
 * Given a non RGBA shape calculate the R version
 * It is assumed that the dimensions are multiples of given channels
 * NOTE: it is always the last dim that gets packed.
 * @param unpackedShape original shape to create a packed version from
 */
export declare function getPackedShape(unpackedShape: readonly number[]): readonly number[];
export declare function repeatedTry(checkFn: () => boolean, delayFn?: (_counter: number) => number, maxCounter?: number): Promise<void>;
/**
 * Generates the function name from an input sampler name.
 * @param samplerName Name of the sampler.
 */
export declare function generateShaderFuncNameFromInputSamplerName(samplerName: string): string;
/**
 * Generates the function name from an input sampler name at output coordinates.
 * @param samplerName Name of the sampler.
 */
export declare function generateShaderFuncNameFromInputSamplerNameAtOutCoords(samplerName: string): string;
/** Returns a new input shape (a copy) that has a squeezed logical shape. */
export declare function squeezeInputShape(inputShape: readonly number[], squeezedShape: number[]): number[];
/** Returns a list of squeezed parameters for shader functions */
export declare function getSqueezedParams(params: string[], keptDims: number[]): string;
/** Returns the data type for different ranks. */
export declare function getCoordsDataType(rank: number): string;
export declare function getGlChannels(rank?: number): string[];
