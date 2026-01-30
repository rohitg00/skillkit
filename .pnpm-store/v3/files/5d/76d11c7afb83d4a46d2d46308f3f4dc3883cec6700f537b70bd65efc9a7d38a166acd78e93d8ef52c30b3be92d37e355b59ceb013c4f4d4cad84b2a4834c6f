import { type Pointer } from "bun:ffi";
import { type FFISymbols } from "./ffi";
export declare class GPURenderPassEncoderImpl implements GPURenderPassEncoder {
    ptr: Pointer;
    __brand: "GPURenderPassEncoder";
    label: string;
    private lib;
    constructor(ptr: Pointer, lib: FFISymbols);
    setBlendConstant(color: GPUColor): undefined;
    setStencilReference(reference: GPUStencilValue): undefined;
    beginOcclusionQuery(queryIndex: GPUSize32): undefined;
    endOcclusionQuery(): undefined;
    executeBundles(bundles: Iterable<GPURenderBundle>): undefined;
    setPipeline(pipeline: GPURenderPipeline): undefined;
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup | null | undefined, dynamicOffsets?: Uint32Array | number[]): undefined;
    setVertexBuffer(slot: number, buffer: GPUBuffer | null | undefined, offset?: number | bigint, size?: number | bigint): undefined;
    setIndexBuffer(buffer: GPUBuffer | null | undefined, format: GPUIndexFormat, offset?: number | bigint, size?: number | bigint): undefined;
    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): undefined;
    setScissorRect(x: number, y: number, width: number, height: number): undefined;
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): undefined;
    drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): undefined;
    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: number | bigint): undefined;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): undefined;
    end(): undefined;
    pushDebugGroup(message: string): undefined;
    popDebugGroup(): undefined;
    insertDebugMarker(markerLabel: string): undefined;
    destroy(): undefined;
}
