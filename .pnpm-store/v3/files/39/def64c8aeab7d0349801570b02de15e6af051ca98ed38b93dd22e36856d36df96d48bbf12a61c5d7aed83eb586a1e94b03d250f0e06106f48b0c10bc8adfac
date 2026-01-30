import type { OptimizedBuffer } from "../buffer";
/**
 * Applies a scanline effect by darkening every nth row.
 */
export declare function applyScanlines(buffer: OptimizedBuffer, strength?: number, step?: number): void;
/**
 * Converts the buffer colors to grayscale.
 */
export declare function applyGrayscale(buffer: OptimizedBuffer): void;
/**
 * Applies a sepia tone to the buffer.
 */
export declare function applySepia(buffer: OptimizedBuffer): void;
/**
 * Inverts the colors in the buffer.
 */
export declare function applyInvert(buffer: OptimizedBuffer): void;
/**
 * Adds random noise to the buffer colors.
 */
export declare function applyNoise(buffer: OptimizedBuffer, strength?: number): void;
/**
 * Applies a simplified chromatic aberration effect.
 */
export declare function applyChromaticAberration(buffer: OptimizedBuffer, strength?: number): void;
/**
 * Converts the buffer to ASCII art based on background brightness.
 */
export declare function applyAsciiArt(buffer: OptimizedBuffer, ramp?: string): void;
export declare class DistortionEffect {
    glitchChancePerSecond: number;
    maxGlitchLines: number;
    minGlitchDuration: number;
    maxGlitchDuration: number;
    maxShiftAmount: number;
    shiftFlipRatio: number;
    colorGlitchChance: number;
    private lastGlitchTime;
    private glitchDuration;
    private activeGlitches;
    constructor(options?: Partial<DistortionEffect>);
    /**
     * Applies the animated distortion/glitch effect to the buffer.
     */
    apply(buffer: OptimizedBuffer, deltaTime: number): void;
}
/**
 * Applies a vignette effect by darkening the corners, optimized with precomputation.
 */
export declare class VignetteEffect {
    private _strength;
    private precomputedBaseAttenuation;
    private cachedWidth;
    private cachedHeight;
    constructor(strength?: number);
    set strength(newStrength: number);
    get strength(): number;
    private _computeFactors;
    /**
     * Applies the vignette effect using precomputed base attenuation and current strength.
     */
    apply(buffer: OptimizedBuffer): void;
}
/**
 * Adjusts the overall brightness of the buffer.
 */
export declare class BrightnessEffect {
    private _brightness;
    constructor(brightness?: number);
    set brightness(newBrightness: number);
    get brightness(): number;
    /**
     * Applies the brightness adjustment to the buffer.
     */
    apply(buffer: OptimizedBuffer): void;
}
/**
 * Applies a simple box blur. (Expensive and may look bad with text).
 */
export declare class BlurEffect {
    private _radius;
    constructor(radius?: number);
    set radius(newRadius: number);
    get radius(): number;
    /**
     * Applies an optimized separable box blur using a moving average (sliding window).
     */
    apply(buffer: OptimizedBuffer): void;
}
/**
 * Applies a bloom effect based on bright areas (Simplified).
 */
export declare class BloomEffect {
    private _threshold;
    private _strength;
    private _radius;
    constructor(threshold?: number, strength?: number, radius?: number);
    set threshold(newThreshold: number);
    get threshold(): number;
    set strength(newStrength: number);
    get strength(): number;
    set radius(newRadius: number);
    get radius(): number;
    apply(buffer: OptimizedBuffer): void;
}
