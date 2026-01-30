import { type Pointer } from "bun:ffi";
import type { FFISymbols } from "./ffi";
export declare class GPURenderBundleEncoderImpl implements GPURenderBundleEncoder {
    __brand: "GPURenderBundleEncoder";
    private _lib;
    private _destroyed;
    label: string;
    ptr: Pointer;
    constructor(ptr: Pointer, lib: FFISymbols, descriptor: GPURenderBundleEncoderDescriptor);
    setBindGroup(groupIndex: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Uint32Array | number[]): undefined;
    setPipeline(pipeline: GPURenderPipeline): undefined;
    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: number, size?: number): undefined;
    setVertexBuffer(slot: number, buffer: GPUBuffer | null, offset?: number, size?: number): undefined;
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): undefined;
    drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): undefined;
    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): undefined;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): undefined;
    finish(descriptor?: GPURenderBundleDescriptor): GPURenderBundle;
    _destroy(): void;
    pushDebugGroup(groupLabel: string): undefined;
    popDebugGroup(): undefined;
    insertDebugMarker(markerLabel: string): undefined;
}
