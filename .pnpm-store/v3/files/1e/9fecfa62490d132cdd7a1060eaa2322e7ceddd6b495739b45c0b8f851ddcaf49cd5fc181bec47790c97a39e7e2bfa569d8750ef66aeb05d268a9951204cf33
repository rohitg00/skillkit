import { FFIType } from "bun:ffi";
type StripZWPrefix<KeyType extends string> = KeyType extends `zw${infer Rest}` ? `w${Rest}` : KeyType;
type TransformedSymbolKeys<T extends object> = {
    [K in keyof T as StripZWPrefix<K & string>]: T[K];
};
export declare function loadLibrary(libPath?: string): TransformedSymbolKeys<import("bun:ffi").ConvertFns<{
    zwgpuCreateInstance: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuInstanceCreateSurface: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuInstanceProcessEvents: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuInstanceRequestAdapter: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuInstanceWaitAny: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint32_t;
    };
    zwgpuInstanceGetWGSLLanguageFeatures: {
        args: FFIType.ptr[];
        returns: FFIType.uint32_t;
    };
    zwgpuInstanceRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuInstanceAddRef: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuAdapterCreateDevice: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuAdapterGetInfo: {
        args: FFIType.ptr[];
        returns: FFIType.uint32_t;
    };
    zwgpuAdapterRequestDevice: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuAdapterRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuAdapterGetFeatures: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuAdapterGetLimits: {
        args: FFIType.ptr[];
        returns: FFIType.uint32_t;
    };
    zwgpuDeviceGetAdapterInfo: {
        args: FFIType.ptr[];
        returns: FFIType.uint32_t;
    };
    zwgpuDeviceCreateBuffer: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateTexture: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateSampler: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateShaderModule: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateBindGroupLayout: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateBindGroup: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreatePipelineLayout: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateRenderPipeline: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateComputePipeline: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateRenderBundleEncoder: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateCommandEncoder: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceCreateQuerySet: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceGetQueue: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuDeviceGetLimits: {
        args: FFIType.ptr[];
        returns: FFIType.uint32_t;
    };
    zwgpuDeviceHasFeature: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    zwgpuDeviceGetFeatures: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuDevicePushErrorScope: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuDevicePopErrorScope: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuDeviceTick: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuDeviceInjectError: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuDeviceCreateComputePipelineAsync: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuDeviceCreateRenderPipelineAsync: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuDeviceDestroy: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuDeviceRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuBufferGetMappedRange: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    zwgpuBufferGetConstMappedRange: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    zwgpuBufferUnmap: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuBufferMapAsync: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint64_t;
    };
    zwgpuBufferDestroy: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuBufferRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuTextureCreateView: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuTextureDestroy: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuTextureRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuTextureViewRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSamplerRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuShaderModuleGetCompilationInfo: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuShaderModuleRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuBindGroupLayoutRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuBindGroupRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuPipelineLayoutRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuQuerySetDestroy: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuQuerySetRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPipelineRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPipelineGetBindGroupLayout: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    zwgpuComputePipelineRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePipelineGetBindGroupLayout: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    zwgpuCommandEncoderBeginRenderPass: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuCommandEncoderBeginComputePass: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuCommandEncoderClearBuffer: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderCopyBufferToBuffer: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderCopyBufferToTexture: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderCopyTextureToBuffer: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderCopyTextureToTexture: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderResolveQuerySet: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderFinish: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuCommandEncoderRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderPushDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderPopDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandEncoderInsertDebugMarker: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetScissorRect: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetViewport: {
        args: (FFIType.float | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetBlendConstant: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetStencilReference: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetPipeline: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetBindGroup: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetVertexBuffer: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderSetIndexBuffer: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderDraw: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderDrawIndexed: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderDrawIndirect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderDrawIndexedIndirect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderExecuteBundles: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderEnd: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderPushDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderPopDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderInsertDebugMarker: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderBeginOcclusionQuery: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderPassEncoderEndOcclusionQuery: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderSetPipeline: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderSetBindGroup: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderDispatchWorkgroups: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderDispatchWorkgroupsIndirect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderEnd: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderPushDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderPopDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuComputePassEncoderInsertDebugMarker: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuCommandBufferRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuQueueSubmit: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuQueueWriteBuffer: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuQueueWriteTexture: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuQueueOnSubmittedWorkDone: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    zwgpuQueueRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfaceConfigure: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfaceUnconfigure: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfaceGetCurrentTexture: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfacePresent: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfaceRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuAdapterInfoFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSurfaceCapabilitiesFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSupportedFeaturesFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSharedBufferMemoryEndAccessStateFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSharedTextureMemoryEndAccessStateFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuSupportedWGSLLanguageFeaturesFreeMembers: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderDraw: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderDrawIndexed: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderDrawIndirect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderDrawIndexedIndirect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderFinish: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    zwgpuRenderBundleEncoderSetBindGroup: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderSetIndexBuffer: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderSetPipeline: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderSetVertexBuffer: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderRelease: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderPushDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderPopDebugGroup: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
    zwgpuRenderBundleEncoderInsertDebugMarker: {
        args: FFIType.ptr[];
        returns: FFIType.void;
    };
}>>;
export type FFISymbols = ReturnType<typeof loadLibrary>;
export {};
