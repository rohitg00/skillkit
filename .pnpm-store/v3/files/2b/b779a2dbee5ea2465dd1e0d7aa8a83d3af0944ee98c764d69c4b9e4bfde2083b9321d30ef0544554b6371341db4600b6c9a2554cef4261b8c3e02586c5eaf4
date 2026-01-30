import { type Pointer } from "bun:ffi";
export declare const AsyncStatus: {
    readonly Success: 1;
    readonly CallbackCancelled: 2;
    readonly Error: 3;
    readonly Aborted: 4;
    readonly Force32: 2147483647;
};
export declare const WGPUErrorType: {
    readonly "no-error": 1;
    readonly validation: 2;
    readonly "out-of-memory": 3;
    readonly internal: 4;
    readonly unknown: 5;
    readonly "force-32": 2147483647;
};
export declare function packUserDataId(id: number): ArrayBuffer;
export declare function unpackUserDataId(userDataPtr: Pointer): number;
export declare class GPUAdapterInfoImpl implements GPUAdapterInfo {
    __brand: "GPUAdapterInfo";
    vendor: string;
    architecture: string;
    device: string;
    description: string;
    subgroupMinSize: number;
    subgroupMaxSize: number;
    isFallbackAdapter: boolean;
    constructor();
}
export declare function normalizeIdentifier(input: string): string;
export declare function decodeCallbackMessage(messagePtr: Pointer | null, messageSize?: number | bigint): string;
export declare const DEFAULT_SUPPORTED_LIMITS: Omit<GPUSupportedLimits, '__brand'> & {
    maxImmediateSize: number;
};
export declare class GPUSupportedLimitsImpl implements GPUSupportedLimits {
    __brand: "GPUSupportedLimits";
    maxTextureDimension1D: number;
    maxTextureDimension2D: number;
    maxTextureDimension3D: number;
    maxTextureArrayLayers: number;
    maxBindGroups: number;
    maxBindGroupsPlusVertexBuffers: number;
    maxBindingsPerBindGroup: number;
    maxStorageBuffersInFragmentStage: number;
    maxStorageBuffersInVertexStage: number;
    maxStorageTexturesInFragmentStage: number;
    maxStorageTexturesInVertexStage: number;
    maxDynamicUniformBuffersPerPipelineLayout: number;
    maxDynamicStorageBuffersPerPipelineLayout: number;
    maxSampledTexturesPerShaderStage: number;
    maxSamplersPerShaderStage: number;
    maxStorageBuffersPerShaderStage: number;
    maxStorageTexturesPerShaderStage: number;
    maxUniformBuffersPerShaderStage: number;
    maxUniformBufferBindingSize: number;
    maxStorageBufferBindingSize: number;
    minUniformBufferOffsetAlignment: number;
    minStorageBufferOffsetAlignment: number;
    maxVertexBuffers: number;
    maxBufferSize: number;
    maxVertexAttributes: number;
    maxVertexBufferArrayStride: number;
    maxInterStageShaderComponents: number;
    maxInterStageShaderVariables: number;
    maxColorAttachments: number;
    maxColorAttachmentBytesPerSample: number;
    maxComputeWorkgroupStorageSize: number;
    maxComputeInvocationsPerWorkgroup: number;
    maxComputeWorkgroupSizeX: number;
    maxComputeWorkgroupSizeY: number;
    maxComputeWorkgroupSizeZ: number;
    maxComputeWorkgroupsPerDimension: number;
    constructor();
}
