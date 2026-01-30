import { type Pointer } from "bun:ffi";
import type { FFISymbols } from "./ffi";
import type { InstanceTicker } from "./GPU";
export declare class GPUUncapturedErrorEventImpl extends Event implements GPUUncapturedErrorEvent {
    __brand: "GPUUncapturedErrorEvent";
    error: GPUError;
    constructor(error: GPUError);
}
export declare class GPUAdapterImpl implements GPUAdapter {
    readonly adapterPtr: Pointer;
    private instancePtr;
    private lib;
    private instanceTicker;
    __brand: "GPUAdapter";
    private _features;
    private _limits;
    private _info;
    private _destroyed;
    private _device;
    private _state;
    constructor(adapterPtr: Pointer, instancePtr: Pointer, lib: FFISymbols, instanceTicker: InstanceTicker);
    get info(): GPUAdapterInfo;
    get features(): GPUSupportedFeatures;
    get limits(): GPUSupportedLimits;
    get isFallbackAdapter(): boolean;
    private handleUncapturedError;
    private handleDeviceLost;
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
    destroy(): undefined;
}
