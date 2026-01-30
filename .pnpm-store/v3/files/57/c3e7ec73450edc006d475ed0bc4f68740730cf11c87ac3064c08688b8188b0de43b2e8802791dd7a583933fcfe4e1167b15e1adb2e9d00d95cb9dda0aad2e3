import { type Pointer } from "bun:ffi";
import { type FFISymbols } from "./ffi";
export declare class InstanceTicker {
    readonly instancePtr: Pointer;
    private lib;
    private _waiting;
    private _ticking;
    private _accTime;
    private _lastTime;
    constructor(instancePtr: Pointer, lib: FFISymbols);
    register(): void;
    unregister(): void;
    hasWaiting(): boolean;
    processEvents(): void;
    private scheduleTick;
}
export declare class GPUImpl implements GPU {
    private instancePtr;
    private lib;
    __brand: "GPU";
    private _destroyed;
    private _ticker;
    private _wgslLanguageFeatures;
    constructor(instancePtr: Pointer, lib: FFISymbols);
    getPreferredCanvasFormat(): GPUTextureFormat;
    get wgslLanguageFeatures(): WGSLLanguageFeatures;
    requestAdapter(options?: GPURequestAdapterOptions & {
        featureLevel?: 'core' | 'compatibility';
    }): Promise<GPUAdapter | null>;
    destroy(): undefined;
}
