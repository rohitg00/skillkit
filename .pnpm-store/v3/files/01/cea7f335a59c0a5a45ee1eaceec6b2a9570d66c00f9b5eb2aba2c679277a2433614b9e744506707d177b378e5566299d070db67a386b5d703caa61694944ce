import { type Pointer } from "bun:ffi";
import type { FFISymbols } from "./ffi";
export declare class GPUCommandEncoderImpl implements GPUCommandEncoder {
    readonly encoderPtr: Pointer;
    private lib;
    __brand: "GPUCommandEncoder";
    label: string;
    readonly ptr: Pointer;
    private _destroyed;
    constructor(encoderPtr: Pointer, lib: FFISymbols);
    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
    beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder;
    copyBufferToBuffer(source: GPUBuffer, destination: GPUBuffer, size?: number): undefined;
    copyBufferToBuffer(source: GPUBuffer, sourceOffset: number, destination: GPUBuffer, destinationOffset: number, size: number): undefined;
    copyBufferToTexture(source: GPUTexelCopyBufferInfo, destination: GPUTexelCopyTextureInfo, copySize: GPUExtent3DStrict): undefined;
    copyTextureToBuffer(source: GPUTexelCopyTextureInfo, destination: GPUTexelCopyBufferInfo, copySize: GPUExtent3DStrict): undefined;
    copyTextureToTexture(source: GPUTexelCopyTextureInfo, destination: GPUTexelCopyTextureInfo, copySize: GPUExtent3DStrict): undefined;
    clearBuffer(buffer: GPUBuffer, offset?: GPUSize64, size?: GPUSize64): undefined;
    resolveQuerySet(querySet: GPUQuerySet, firstQuery: GPUSize32, queryCount: GPUSize32, destination: GPUBuffer, destinationOffset: GPUSize64): undefined;
    finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer;
    pushDebugGroup(message: string): undefined;
    popDebugGroup(): undefined;
    insertDebugMarker(markerLabel: string): undefined;
    /**
     * Note: Command encoders are destroyed automatically when finished.
     */
    _destroy(): undefined;
}
