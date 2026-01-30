import { type Pointer } from "bun:ffi";
import type { FFISymbols } from "./ffi";
import { InstanceTicker } from "./GPU";
export type PtrSource = ArrayBuffer | ArrayBufferView;
export declare const QueueWorkDoneStatus: {
    readonly Success: 1;
    readonly CallbackCancelled: 2;
    readonly Error: 3;
    readonly Force32: 2147483647;
};
export declare class GPUQueueImpl implements GPUQueue {
    readonly ptr: Pointer;
    private lib;
    private instanceTicker;
    __brand: "GPUQueue";
    label: string;
    private _onSubmittedWorkDoneCallback;
    private _onSubmittedWorkDoneResolves;
    private _onSubmittedWorkDoneRejects;
    constructor(ptr: Pointer, lib: FFISymbols, instanceTicker: InstanceTicker);
    submit(commandBuffers: Iterable<GPUCommandBuffer>): undefined;
    onSubmittedWorkDone(): Promise<undefined>;
    writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: PtrSource, dataOffset?: number, size?: number): undefined;
    writeTexture(destination: GPUTexelCopyTextureInfo, data: PtrSource, dataLayout: GPUTexelCopyBufferLayout, writeSize: GPUExtent3DStrict): undefined;
    copyBufferToBuffer(source: GPUTexelCopyBufferInfo, destination: GPUTexelCopyBufferInfo, size: number): undefined;
    copyBufferToTexture(source: GPUTexelCopyBufferInfo, destination: GPUTexelCopyTextureInfo, size: GPUExtent3D): undefined;
    copyExternalImageToTexture(source: GPUCopyExternalImageSourceInfo, destination: GPUCopyExternalImageDestInfo, copySize: GPUExtent3DStrict): undefined;
    destroy(): undefined;
}
