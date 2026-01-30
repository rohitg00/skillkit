/** Layout preferences */
export interface WidthHeightPrefs {
    breakAxis?: number;
    isPacked?: boolean;
    reverseWH?: boolean;
}
/**
 * TextureLayoutStrategy is an abstraction for different plans
 * for mapping n-dimensional arrays to 2D textures (and back)
 */
export interface TextureLayoutStrategy {
    computeTextureWH(shape: readonly number[], prefs?: WidthHeightPrefs): [number, number];
}
/**
 * This strategy try to find the minimal max(W,H) that fulfills (W * H == totalSize)
 */
export declare class AlwaysKeepOriginalSizeStrategy implements TextureLayoutStrategy {
    maxTextureSize: number;
    constructor(maxTextureSize: number);
    computeTextureWH(shape: readonly number[], prefs?: WidthHeightPrefs): [number, number];
}
export declare class PreferLogicalStrategy implements TextureLayoutStrategy {
    maxTextureSize: number;
    constructor(maxTextureSize: number);
    computeTextureWH(shape: readonly number[], prefs?: WidthHeightPrefs): [number, number];
    computeTexture(shape: readonly number[], prefs?: WidthHeightPrefs): [number, number];
}
export declare function squeezeShape(shape: number[], axis?: number[]): {
    newShape: number[];
    keptDims: number[];
};
export declare function parseAxisParam(axis: number | number[], shape: number[]): number[];
export declare function isInt(a: number): boolean;
export declare function sizeFromShape(shape: number[]): number;
export declare function getRowsCols(shape: number[]): [number, number];
export declare function sizeToSquarishShape(size: number): [number, number];
export declare function getBatchDim(shape: number[], dimsToSkip?: number): number;
