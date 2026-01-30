import { type Pointer } from "bun:ffi";
import type { FFISymbols } from "./ffi";
export declare class GPUTextureImpl implements GPUTexture {
    readonly texturePtr: Pointer;
    private lib;
    private _width;
    private _height;
    private _depthOrArrayLayers;
    private _format;
    private _dimension;
    private _mipLevelCount;
    private _sampleCount;
    private _usage;
    __brand: "GPUTexture";
    label: string;
    ptr: Pointer;
    constructor(texturePtr: Pointer, lib: FFISymbols, _width: number, _height: number, _depthOrArrayLayers: number, _format: GPUTextureFormat, _dimension: GPUTextureDimension, _mipLevelCount: number, _sampleCount: number, _usage: GPUTextureUsageFlags);
    get width(): number;
    get height(): number;
    get depthOrArrayLayers(): number;
    get format(): GPUTextureFormat;
    get dimension(): GPUTextureDimension;
    get mipLevelCount(): number;
    get sampleCount(): number;
    get usage(): GPUFlagsConstant;
    createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
    destroy(): undefined;
}
