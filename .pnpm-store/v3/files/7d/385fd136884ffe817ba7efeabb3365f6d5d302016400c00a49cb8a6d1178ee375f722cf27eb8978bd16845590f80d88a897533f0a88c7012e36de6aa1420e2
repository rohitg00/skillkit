import { type Pointer } from "bun:ffi";
import { type FFISymbols } from "./ffi";
export declare class GPUComputePassEncoderImpl implements GPUComputePassEncoder {
    ptr: Pointer;
    __brand: "GPUComputePassEncoder";
    private lib;
    label: string;
    constructor(ptr: Pointer, lib: FFISymbols);
    setPipeline(pipeline: GPUComputePipeline): undefined;
    setBindGroup(groupIndex: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Uint32Array | number[]): undefined;
    dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): undefined;
    dispatchWorkgroupsIndirect(indirectBuffer: GPUBuffer, indirectOffset: number | bigint): undefined;
    end(): undefined;
    pushDebugGroup(message: string): undefined;
    popDebugGroup(): undefined;
    insertDebugMarker(markerLabel: string): undefined;
    destroy(): undefined;
}
