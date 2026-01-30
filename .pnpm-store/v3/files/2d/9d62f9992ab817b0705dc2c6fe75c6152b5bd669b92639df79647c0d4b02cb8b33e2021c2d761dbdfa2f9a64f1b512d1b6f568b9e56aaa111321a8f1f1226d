import { Pointer } from "bun:ffi";

declare global {
    interface GPUAdapter {
        adapterPtr: Pointer;
        destroy(): undefined;
    }

    interface GPUDevice {
        readonly ptr: Pointer;
        readonly queuePtr: Pointer;
        tick(): undefined;
    }

    interface GPUQueue {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPURequestAdapterOptions {
       featureLevel?: 'core' | 'compatibility';
    }

    interface GPUBuffer {
        readonly ptr: Pointer;
        getMappedRangePtr(offset?: GPUSize64, size?: GPUSize64): Pointer;
        release(): undefined;
    }

    interface GPUCommandBuffer {
        readonly ptr: Pointer;
        _destroy(): undefined;
    }

    interface GPUCommandEncoder {
        readonly ptr: Pointer;
        _destroy(): undefined;
    }

    interface GPUSampler {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUTexture {
        readonly ptr: Pointer;
    }

    interface GPUTextureView {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUQuerySet {
        readonly ptr: Pointer;
    }

    interface GPUShaderModule {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUComputePipeline {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUBindGroup {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUBindGroupLayout {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUPipelineLayout {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPURenderPipeline {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUComputePassEncoder {
        readonly ptr: Pointer;
    }

    interface GPURenderPassEncoder {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPURenderBundleEncoder {
        readonly ptr: Pointer;
    }

    interface GPURenderBundle {
        readonly ptr: Pointer;
        destroy(): undefined;
    }

    interface GPUTexelCopyBufferInfo {
        bytesPerRow: number;
        rowsPerImage: number;
    }    

    interface GPUDeviceDescriptor {
        requiredLimits: Record<keyof GPUSupportedLimits, GPUSize64 | undefined>;
    }

    interface AbortError {
       message: string;
    }

    declare var AbortError: {
        prototype: AbortError;
        new (message: string): never;
    };
}



import { GPUImpl } from "./GPU";
export * from "./mocks/GPUCanvasContext";
export declare function createGPUInstance(libPath?: string): GPUImpl;
export declare const globals: {
    GPUPipelineError: any;
    AbortError: any;
    GPUError: any;
    GPUOutOfMemoryError: any;
    GPUInternalError: any;
    GPUValidationError: any;
    GPUTextureUsage: {
        readonly COPY_SRC: number;
        readonly COPY_DST: number;
        readonly TEXTURE_BINDING: number;
        readonly STORAGE_BINDING: number;
        readonly RENDER_ATTACHMENT: number;
        readonly TRANSIENT_ATTACHMENT: number;
    };
    GPUBufferUsage: {
        readonly MAP_READ: number;
        readonly MAP_WRITE: number;
        readonly COPY_SRC: number;
        readonly COPY_DST: number;
        readonly INDEX: number;
        readonly VERTEX: number;
        readonly UNIFORM: number;
        readonly STORAGE: number;
        readonly INDIRECT: number;
        readonly QUERY_RESOLVE: number;
    };
    GPUShaderStage: {
        readonly VERTEX: number;
        readonly FRAGMENT: number;
        readonly COMPUTE: number;
    };
    GPUMapMode: {
        readonly READ: number;
        readonly WRITE: number;
    };
    GPUDevice: any;
    GPUAdapterInfo: any;
    GPUSupportedLimits: any;
};
export declare function setupGlobals({ libPath }?: {
    libPath?: string;
}): Promise<void>;
export declare function createWebGPUDevice(): Promise<GPUDevice>;
