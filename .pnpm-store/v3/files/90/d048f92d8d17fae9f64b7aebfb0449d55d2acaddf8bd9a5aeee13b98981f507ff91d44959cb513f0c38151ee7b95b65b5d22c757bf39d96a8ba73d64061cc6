// @bun
// src/ffi.ts
import { dlopen, FFIType } from "bun:ffi";
import { existsSync } from "fs";
var module = await import(`bun-webgpu-${process.platform}-${process.arch}/index.ts`);
var targetLibPath = module.default;
if (/\$bunfs/.test(targetLibPath)) {
  targetLibPath = targetLibPath.replace("../", "");
}
if (!existsSync(targetLibPath)) {
  throw new Error(`bun-webgpu is not supported on the current platform: ${process.platform}-${process.arch}`);
}
function findLibrary() {
  return targetLibPath;
}
function _loadLibrary(libPath) {
  const resolvedPath = libPath || findLibrary();
  const { symbols } = dlopen(resolvedPath, {
    zwgpuCreateInstance: {
      args: [FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuInstanceCreateSurface: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuInstanceProcessEvents: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuInstanceRequestAdapter: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuInstanceWaitAny: {
      args: [
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.u32
    },
    zwgpuInstanceGetWGSLLanguageFeatures: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u32
    },
    zwgpuInstanceRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuInstanceAddRef: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuAdapterCreateDevice: {
      args: [
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.pointer
    },
    zwgpuAdapterGetInfo: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u32
    },
    zwgpuAdapterRequestDevice: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuAdapterRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuAdapterGetFeatures: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuAdapterGetLimits: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u32
    },
    zwgpuDeviceGetAdapterInfo: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u32
    },
    zwgpuDeviceCreateBuffer: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateTexture: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateSampler: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateShaderModule: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateBindGroupLayout: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateBindGroup: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreatePipelineLayout: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateRenderPipeline: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateComputePipeline: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateRenderBundleEncoder: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateCommandEncoder: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceCreateQuerySet: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceGetQueue: {
      args: [FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuDeviceGetLimits: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u32
    },
    zwgpuDeviceHasFeature: {
      args: [FFIType.pointer, FFIType.u32],
      returns: FFIType.bool
    },
    zwgpuDeviceGetFeatures: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuDevicePushErrorScope: {
      args: [FFIType.pointer, FFIType.u32],
      returns: FFIType.void
    },
    zwgpuDevicePopErrorScope: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u64
    },
    zwgpuDeviceTick: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuDeviceInjectError: {
      args: [FFIType.pointer, FFIType.u32, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuDeviceCreateComputePipelineAsync: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuDeviceCreateRenderPipelineAsync: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuDeviceDestroy: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuDeviceRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuBufferGetMappedRange: {
      args: [FFIType.pointer, FFIType.u64, FFIType.u64],
      returns: FFIType.ptr
    },
    zwgpuBufferGetConstMappedRange: {
      args: [FFIType.pointer, FFIType.u64, FFIType.u64],
      returns: FFIType.ptr
    },
    zwgpuBufferUnmap: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuBufferMapAsync: {
      args: [
        FFIType.pointer,
        FFIType.u64,
        FFIType.u64,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuBufferDestroy: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuBufferRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuTextureCreateView: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuTextureDestroy: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuTextureRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuTextureViewRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSamplerRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuShaderModuleGetCompilationInfo: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.u64
    },
    zwgpuShaderModuleRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuBindGroupLayoutRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuBindGroupRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuPipelineLayoutRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuQuerySetDestroy: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuQuerySetRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPipelineRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPipelineGetBindGroupLayout: {
      args: [FFIType.pointer, FFIType.u32],
      returns: FFIType.pointer
    },
    zwgpuComputePipelineRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePipelineGetBindGroupLayout: {
      args: [FFIType.pointer, FFIType.u32],
      returns: FFIType.pointer
    },
    zwgpuCommandEncoderBeginRenderPass: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuCommandEncoderBeginComputePass: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuCommandEncoderClearBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderCopyBufferToBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderCopyBufferToTexture: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderCopyTextureToBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderCopyTextureToTexture: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderResolveQuerySet: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuCommandEncoderFinish: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuCommandEncoderRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuCommandEncoderPushDebugGroup: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuCommandEncoderPopDebugGroup: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuCommandEncoderInsertDebugMarker: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetScissorRect: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetViewport: {
      args: [
        FFIType.pointer,
        FFIType.f32,
        FFIType.f32,
        FFIType.f32,
        FFIType.f32,
        FFIType.f32,
        FFIType.f32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetBlendConstant: {
      args: [
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetStencilReference: {
      args: [
        FFIType.pointer,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetPipeline: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetBindGroup: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetVertexBuffer: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderSetIndexBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u32,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderDraw: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderDrawIndexed: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32,
        FFIType.i32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderDrawIndirect: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderDrawIndexedIndirect: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderExecuteBundles: {
      args: [
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderEnd: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderPushDebugGroup: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderPopDebugGroup: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderInsertDebugMarker: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderBeginOcclusionQuery: {
      args: [
        FFIType.pointer,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderPassEncoderEndOcclusionQuery: {
      args: [
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderSetPipeline: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderSetBindGroup: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderDispatchWorkgroups: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderDispatchWorkgroupsIndirect: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderEnd: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderPushDebugGroup: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderPopDebugGroup: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuComputePassEncoderInsertDebugMarker: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuCommandBufferRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuQueueSubmit: {
      args: [
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuQueueWriteBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64,
        FFIType.ptr,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuQueueWriteTexture: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.ptr,
        FFIType.u64,
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuQueueOnSubmittedWorkDone: {
      args: [
        FFIType.pointer,
        FFIType.pointer
      ],
      returns: FFIType.u64
    },
    zwgpuQueueRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfaceConfigure: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfaceUnconfigure: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfaceGetCurrentTexture: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfacePresent: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfaceRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuAdapterInfoFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSurfaceCapabilitiesFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSupportedFeaturesFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSharedBufferMemoryEndAccessStateFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSharedTextureMemoryEndAccessStateFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuSupportedWGSLLanguageFeaturesFreeMembers: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderDraw: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderDrawIndexed: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.u32,
        FFIType.u32,
        FFIType.i32,
        FFIType.u32
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderDrawIndirect: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderDrawIndexedIndirect: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderFinish: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.pointer
    },
    zwgpuRenderBundleEncoderSetBindGroup: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64,
        FFIType.pointer
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderSetIndexBuffer: {
      args: [
        FFIType.pointer,
        FFIType.pointer,
        FFIType.u32,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderSetPipeline: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderSetVertexBuffer: {
      args: [
        FFIType.pointer,
        FFIType.u32,
        FFIType.pointer,
        FFIType.u64,
        FFIType.u64
      ],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderRelease: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderPushDebugGroup: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderPopDebugGroup: {
      args: [FFIType.pointer],
      returns: FFIType.void
    },
    zwgpuRenderBundleEncoderInsertDebugMarker: {
      args: [FFIType.pointer, FFIType.pointer],
      returns: FFIType.void
    }
  });
  return symbols;
}
function loadLibrary(libPath) {
  const rawSymbols = _loadLibrary(libPath);
  const normalizedSymbols = Object.keys(rawSymbols).reduce((acc, key) => {
    const newKey = key.replace(/^zw/, "w");
    acc[newKey] = rawSymbols[key];
    return acc;
  }, {});
  const FFI_SYMBOLS = process.env.DEBUG === "true" || process.env.TRACE_WEBGPU === "true" ? convertToDebugSymbols(normalizedSymbols) : normalizedSymbols;
  return FFI_SYMBOLS;
}
function convertToDebugSymbols(symbols) {
  const debugSymbols = {};
  if (process.env.DEBUG === "true") {
    Object.entries(symbols).forEach(([key, value]) => {
      if (typeof value === "function") {
        debugSymbols[key] = (...args) => {
          console.log(`${key}(${args.map((arg) => String(arg)).join(", ")})`);
          const result = value(...args);
          console.log(`${key} returned:`, String(result));
          return result;
        };
      } else {
        debugSymbols[key] = value;
      }
    });
  }
  if (process.env.TRACE_WEBGPU === "true") {
    const traceSymbols = {};
    Object.entries(symbols).forEach(([key, value]) => {
      if (typeof value === "function") {
        traceSymbols[key] = [];
        debugSymbols[key] = (...args) => {
          const start = performance.now();
          const result = value(...args);
          const end = performance.now();
          traceSymbols[key].push(end - start);
          return result;
        };
      } else {
        debugSymbols[key] = value;
      }
    });
    process.on("exit", () => {
      const allStats = [];
      for (const [key, timings] of Object.entries(traceSymbols)) {
        if (!Array.isArray(timings) || timings.length === 0) {
          continue;
        }
        const sortedTimings = [...timings].sort((a, b) => a - b);
        const count = sortedTimings.length;
        const total = sortedTimings.reduce((acc, t) => acc + t, 0);
        const average = total / count;
        const min = sortedTimings[0];
        const max = sortedTimings[count - 1];
        const medianIndex = Math.floor(count / 2);
        const p90Index = Math.floor(count * 0.9);
        const p99Index = Math.floor(count * 0.99);
        const median = sortedTimings[medianIndex];
        const p90 = sortedTimings[Math.min(p90Index, count - 1)];
        const p99 = sortedTimings[Math.min(p99Index, count - 1)];
        allStats.push({
          name: key,
          count,
          total,
          average,
          min,
          max,
          median,
          p90,
          p99
        });
      }
      allStats.sort((a, b) => b.total - a.total);
      console.log(`
--- WebGPU FFI Call Performance ---`);
      console.log("Sorted by total time spent (descending)");
      console.log("-------------------------------------------------------------------------------------------------------------------------");
      if (allStats.length === 0) {
        console.log("No trace data collected or all symbols had zero calls.");
      } else {
        const nameHeader = "Symbol";
        const callsHeader = "Calls";
        const totalHeader = "Total (ms)";
        const avgHeader = "Avg (ms)";
        const minHeader = "Min (ms)";
        const maxHeader = "Max (ms)";
        const medHeader = "Med (ms)";
        const p90Header = "P90 (ms)";
        const p99Header = "P99 (ms)";
        const nameWidth = Math.max(nameHeader.length, ...allStats.map((s) => s.name.length));
        const countWidth = Math.max(callsHeader.length, ...allStats.map((s) => String(s.count).length));
        const totalWidth = Math.max(totalHeader.length, ...allStats.map((s) => s.total.toFixed(2).length));
        const avgWidth = Math.max(avgHeader.length, ...allStats.map((s) => s.average.toFixed(2).length));
        const minWidth = Math.max(minHeader.length, ...allStats.map((s) => s.min.toFixed(2).length));
        const maxWidth = Math.max(maxHeader.length, ...allStats.map((s) => s.max.toFixed(2).length));
        const medianWidth = Math.max(medHeader.length, ...allStats.map((s) => s.median.toFixed(2).length));
        const p90Width = Math.max(p90Header.length, ...allStats.map((s) => s.p90.toFixed(2).length));
        const p99Width = Math.max(p99Header.length, ...allStats.map((s) => s.p99.toFixed(2).length));
        console.log(`${nameHeader.padEnd(nameWidth)} | ${callsHeader.padStart(countWidth)} | ${totalHeader.padStart(totalWidth)} | ${avgHeader.padStart(avgWidth)} | ${minHeader.padStart(minWidth)} | ${maxHeader.padStart(maxWidth)} | ${medHeader.padStart(medianWidth)} | ${p90Header.padStart(p90Width)} | ${p99Header.padStart(p99Width)}`);
        console.log(`${"-".repeat(nameWidth)}-+-${"-".repeat(countWidth)}-+-${"-".repeat(totalWidth)}-+-${"-".repeat(avgWidth)}-+-${"-".repeat(minWidth)}-+-${"-".repeat(maxWidth)}-+-${"-".repeat(medianWidth)}-+-${"-".repeat(p90Width)}-+-${"-".repeat(p99Width)}`);
        allStats.forEach((stat) => {
          console.log(`${stat.name.padEnd(nameWidth)} | ${String(stat.count).padStart(countWidth)} | ${stat.total.toFixed(2).padStart(totalWidth)} | ${stat.average.toFixed(2).padStart(avgWidth)} | ${stat.min.toFixed(2).padStart(minWidth)} | ${stat.max.toFixed(2).padStart(maxWidth)} | ${stat.median.toFixed(2).padStart(medianWidth)} | ${stat.p90.toFixed(2).padStart(p90Width)} | ${stat.p99.toFixed(2).padStart(p99Width)}`);
        });
      }
      console.log("-------------------------------------------------------------------------------------------------------------------------");
    });
  }
  return debugSymbols;
}

// src/GPU.ts
import { JSCallback as JSCallback5, toArrayBuffer as toArrayBuffer6, ptr as ptr11, FFIType as FFIType6 } from "bun:ffi";

// src/GPUAdapter.ts
import { FFIType as FFIType5, JSCallback as JSCallback4, ptr as ptr10 } from "bun:ffi";

// src/GPUDevice.ts
import { FFIType as FFIType4, JSCallback as JSCallback3, ptr as ptr9 } from "bun:ffi";

// src/structs_def.ts
import { toArrayBuffer as toArrayBuffer3 } from "bun:ffi";

// src/shared.ts
import { toArrayBuffer } from "bun:ffi";

// src/buffer_pool.ts
class BufferPool {
  buffers;
  blockSize;
  freeBlocks = [];
  minBlocks;
  maxBlocks;
  currentBlocks;
  allocatedCount = 0;
  bufferToBlockIndex = new WeakMap;
  constructor(minBlocks, maxBlocks, blockSize) {
    if (minBlocks <= 0 || maxBlocks <= 0 || blockSize <= 0) {
      throw new Error("Min blocks, max blocks, and block size must be positive");
    }
    if (minBlocks > maxBlocks) {
      throw new Error("Min blocks cannot be greater than max blocks");
    }
    this.minBlocks = minBlocks;
    this.maxBlocks = maxBlocks;
    this.blockSize = blockSize;
    this.currentBlocks = minBlocks;
    this.buffers = [];
    this.initializePool();
  }
  initializePool() {
    this.freeBlocks = [];
    for (let i = 0;i < this.minBlocks; i++) {
      this.buffers.push(new ArrayBuffer(this.blockSize));
      this.freeBlocks.push(i);
    }
  }
  expandPool() {
    if (this.currentBlocks >= this.maxBlocks) {
      return false;
    }
    const oldBlocks = this.currentBlocks;
    const newBlocks = Math.min(this.maxBlocks, this.currentBlocks * 2);
    for (let i = oldBlocks;i < newBlocks; i++) {
      this.buffers.push(new ArrayBuffer(this.blockSize));
      this.freeBlocks.push(i);
    }
    this.currentBlocks = newBlocks;
    return true;
  }
  request() {
    if (this.freeBlocks.length === 0) {
      if (!this.expandPool()) {
        throw new Error("BufferPool out of memory: no free blocks available");
      }
    }
    const blockIndex = this.freeBlocks.pop();
    if (blockIndex < 0 || blockIndex >= this.buffers.length) {
      throw new Error("Invalid block index");
    }
    this.allocatedCount++;
    const buffer = this.buffers[blockIndex];
    this.bufferToBlockIndex.set(buffer, blockIndex);
    return { __type: "BlockBuffer", buffer, index: blockIndex };
  }
  release(buffer) {
    const blockIndex = this.bufferToBlockIndex.get(buffer);
    if (blockIndex === undefined) {
      throw new Error("ArrayBuffer was not allocated from this allocator or already freed");
    }
    this.bufferToBlockIndex.delete(buffer);
    this.freeBlocks.push(blockIndex);
    this.allocatedCount--;
  }
  releaseBlock(blockIndex) {
    if (blockIndex < 0 || blockIndex >= this.currentBlocks) {
      throw new Error("Block index out of range");
    }
    const buffer = this.buffers[blockIndex];
    if (!this.bufferToBlockIndex.has(buffer)) {
      throw new Error(`Block ${blockIndex} was not allocated or already freed`);
    }
    this.bufferToBlockIndex.delete(buffer);
    this.freeBlocks.push(blockIndex);
    this.allocatedCount--;
  }
  getBuffer(blockIndex) {
    if (blockIndex < 0 || blockIndex >= this.currentBlocks) {
      throw new Error("Block index out of range");
    }
    return this.buffers[blockIndex];
  }
  reset() {
    this.allocatedCount = 0;
    this.bufferToBlockIndex = new WeakMap;
    this.currentBlocks = this.minBlocks;
    this.buffers = [];
    this.initializePool();
  }
  get totalBlockCount() {
    return this.currentBlocks;
  }
  get maxBlockCount() {
    return this.maxBlocks;
  }
  get minBlockCount() {
    return this.minBlocks;
  }
  get allocatedBlockCount() {
    return this.allocatedCount;
  }
  get freeBlockCount() {
    return this.freeBlocks.length;
  }
  get hasAvailableBlocks() {
    return this.freeBlocks.length > 0 || this.currentBlocks < this.maxBlocks;
  }
  get utilizationRatio() {
    return this.currentBlocks > 0 ? this.allocatedCount / this.currentBlocks : 0;
  }
}

// src/shared.ts
var AsyncStatus = {
  Success: 1,
  CallbackCancelled: 2,
  Error: 3,
  Aborted: 4,
  Force32: 2147483647
};
var WGPUErrorType = {
  "no-error": 1,
  validation: 2,
  "out-of-memory": 3,
  internal: 4,
  unknown: 5,
  "force-32": 2147483647
};
var idBufferPool = new BufferPool(64, 1024, 8);
function packUserDataId(id) {
  const blockBuffer = idBufferPool.request();
  const userDataBuffer = new Uint32Array(blockBuffer.buffer);
  userDataBuffer[0] = id;
  userDataBuffer[1] = blockBuffer.index;
  return blockBuffer.buffer;
}
function unpackUserDataId(userDataPtr) {
  const userDataBuffer = toArrayBuffer(userDataPtr, 0, 8);
  const userDataView = new Uint32Array(userDataBuffer);
  const id = userDataView[0];
  const index = userDataView[1];
  idBufferPool.releaseBlock(index);
  return id;
}

class GPUAdapterInfoImpl {
  __brand = "GPUAdapterInfo";
  vendor = "";
  architecture = "";
  device = "";
  description = "";
  subgroupMinSize = 0;
  subgroupMaxSize = 0;
  isFallbackAdapter = false;
  constructor() {
    throw new TypeError("Illegal constructor");
  }
}
function normalizeIdentifier(input) {
  if (!input || input.trim() === "") {
    return "";
  }
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function decodeCallbackMessage(messagePtr, messageSize) {
  if (!messagePtr || messageSize === 0n || messageSize === 0) {
    return "[empty message]";
  }
  let arrayBuffer = null;
  arrayBuffer = messageSize ? toArrayBuffer(messagePtr, 0, Number(messageSize)) : toArrayBuffer(messagePtr);
  let message = "Could not decode error message";
  if (arrayBuffer instanceof Error) {
    message = arrayBuffer.message;
  } else {
    message = Buffer.from(arrayBuffer).toString();
  }
  return message;
}
var DEFAULT_SUPPORTED_LIMITS = Object.freeze({
  maxTextureDimension1D: 8192,
  maxTextureDimension2D: 8192,
  maxTextureDimension3D: 2048,
  maxTextureArrayLayers: 256,
  maxBindGroups: 4,
  maxBindGroupsPlusVertexBuffers: 24,
  maxBindingsPerBindGroup: 1000,
  maxStorageBuffersInFragmentStage: 8,
  maxStorageBuffersInVertexStage: 8,
  maxStorageTexturesInFragmentStage: 4,
  maxStorageTexturesInVertexStage: 4,
  maxDynamicUniformBuffersPerPipelineLayout: 8,
  maxDynamicStorageBuffersPerPipelineLayout: 4,
  maxSampledTexturesPerShaderStage: 16,
  maxSamplersPerShaderStage: 16,
  maxStorageBuffersPerShaderStage: 8,
  maxStorageTexturesPerShaderStage: 4,
  maxUniformBuffersPerShaderStage: 12,
  maxUniformBufferBindingSize: 65536,
  maxStorageBufferBindingSize: 134217728,
  minUniformBufferOffsetAlignment: 256,
  minStorageBufferOffsetAlignment: 256,
  maxVertexBuffers: 8,
  maxBufferSize: 268435456,
  maxVertexAttributes: 16,
  maxVertexBufferArrayStride: 2048,
  maxInterStageShaderComponents: 4294967295,
  maxInterStageShaderVariables: 16,
  maxColorAttachments: 8,
  maxColorAttachmentBytesPerSample: 32,
  maxComputeWorkgroupStorageSize: 16384,
  maxComputeInvocationsPerWorkgroup: 256,
  maxComputeWorkgroupSizeX: 256,
  maxComputeWorkgroupSizeY: 256,
  maxComputeWorkgroupSizeZ: 64,
  maxComputeWorkgroupsPerDimension: 65535,
  maxImmediateSize: 0
});

class GPUSupportedLimitsImpl {
  __brand = "GPUSupportedLimits";
  maxTextureDimension1D = 8192;
  maxTextureDimension2D = 8192;
  maxTextureDimension3D = 2048;
  maxTextureArrayLayers = 256;
  maxBindGroups = 4;
  maxBindGroupsPlusVertexBuffers = 24;
  maxBindingsPerBindGroup = 1000;
  maxStorageBuffersInFragmentStage = 8;
  maxStorageBuffersInVertexStage = 8;
  maxStorageTexturesInFragmentStage = 4;
  maxStorageTexturesInVertexStage = 4;
  maxDynamicUniformBuffersPerPipelineLayout = 8;
  maxDynamicStorageBuffersPerPipelineLayout = 4;
  maxSampledTexturesPerShaderStage = 16;
  maxSamplersPerShaderStage = 16;
  maxStorageBuffersPerShaderStage = 8;
  maxStorageTexturesPerShaderStage = 4;
  maxUniformBuffersPerShaderStage = 12;
  maxUniformBufferBindingSize = 65536;
  maxStorageBufferBindingSize = 134217728;
  minUniformBufferOffsetAlignment = 256;
  minStorageBufferOffsetAlignment = 256;
  maxVertexBuffers = 8;
  maxBufferSize = 268435456;
  maxVertexAttributes = 16;
  maxVertexBufferArrayStride = 2048;
  maxInterStageShaderComponents = 4294967295;
  maxInterStageShaderVariables = 16;
  maxColorAttachments = 8;
  maxColorAttachmentBytesPerSample = 32;
  maxComputeWorkgroupStorageSize = 16384;
  maxComputeInvocationsPerWorkgroup = 256;
  maxComputeWorkgroupSizeX = 256;
  maxComputeWorkgroupSizeY = 256;
  maxComputeWorkgroupSizeZ = 64;
  maxComputeWorkgroupsPerDimension = 65535;
  constructor() {
    throw new TypeError("Illegal constructor");
  }
}

// src/utils/error.ts
function fatalError(...args) {
  const message = args.join(" ");
  console.error("FATAL ERROR:", message);
  throw new Error(message);
}

class OperationError extends Error {
  constructor(message) {
    super(message);
    this.name = "OperationError";
  }
}

class GPUErrorImpl extends Error {
  constructor(message) {
    super(message);
    this.name = "GPUError";
  }
}

class GPUOutOfMemoryError extends Error {
  constructor(message) {
    super(message);
    this.name = "GPUOutOfMemoryError";
  }
}

class GPUInternalError extends Error {
  constructor(message) {
    super(message);
    this.name = "GPUInternalError";
  }
}

class GPUValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "GPUValidationError";
  }
}

class GPUPipelineErrorImpl extends DOMException {
  reason;
  __brand = "GPUPipelineError";
  constructor(message, options) {
    const parts = message.split(`
`);
    const errorMessage = parts[0];
    const stack = parts.slice(1).join(`
`);
    super(errorMessage, "GPUPipelineError");
    this.reason = options.reason;
    this.stack = stack;
  }
}

class AbortError2 extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
  }
}
function createWGPUError(type, message) {
  switch (type) {
    case WGPUErrorType["out-of-memory"]:
      return new GPUOutOfMemoryError(message);
    case WGPUErrorType.internal:
      return new GPUInternalError(message);
    case WGPUErrorType.validation:
      return new GPUValidationError(message);
    default:
      return new GPUErrorImpl(message);
  }
}

// src/structs_ffi.ts
import { ptr, toArrayBuffer as toArrayBuffer2 } from "bun:ffi";
var pointerSize = process.arch === "x64" || process.arch === "arm64" ? 8 : 4;
var typeSizes = {
  u8: 1,
  bool_u8: 1,
  bool_u32: 4,
  u16: 2,
  i16: 2,
  u32: 4,
  u64: 8,
  f32: 4,
  f64: 8,
  pointer: pointerSize,
  i32: 4
};
var primitiveKeys = Object.keys(typeSizes);
function isPrimitiveType(type) {
  return typeof type === "string" && primitiveKeys.includes(type);
}
var typeAlignments = { ...typeSizes };
var typeGetters = {
  u8: (view, offset) => view.getUint8(offset),
  bool_u8: (view, offset) => Boolean(view.getUint8(offset)),
  bool_u32: (view, offset) => Boolean(view.getUint32(offset, true)),
  u16: (view, offset) => view.getUint16(offset, true),
  i16: (view, offset) => view.getInt16(offset, true),
  u32: (view, offset) => view.getUint32(offset, true),
  u64: (view, offset) => view.getBigUint64(offset, true),
  f32: (view, offset) => view.getFloat32(offset, true),
  f64: (view, offset) => view.getFloat64(offset, true),
  i32: (view, offset) => view.getInt32(offset, true),
  pointer: (view, offset) => pointerSize === 8 ? view.getBigUint64(offset, true) : BigInt(view.getUint32(offset, true))
};
function objectPtr() {
  return {
    __type: "objectPointer"
  };
}
function isObjectPointerDef(type) {
  return typeof type === "object" && type !== null && type.__type === "objectPointer";
}
function allocStruct(structDef, options) {
  const buffer = new ArrayBuffer(structDef.size);
  const view = new DataView(buffer);
  const result = { buffer, view };
  const { pack: pointerPacker } = primitivePackers("pointer");
  if (options?.lengths) {
    const subBuffers = {};
    for (const [arrayFieldName, length] of Object.entries(options.lengths)) {
      const arrayMeta = structDef.arrayFields.get(arrayFieldName);
      if (!arrayMeta) {
        throw new Error(`Field '${arrayFieldName}' is not an array field with a lengthOf field`);
      }
      const subBuffer = new ArrayBuffer(length * arrayMeta.elementSize);
      subBuffers[arrayFieldName] = subBuffer;
      const pointer = length > 0 ? ptr(subBuffer) : null;
      pointerPacker(view, arrayMeta.arrayOffset, pointer);
      arrayMeta.lengthPack(view, arrayMeta.lengthOffset, length);
    }
    if (Object.keys(subBuffers).length > 0) {
      result.subBuffers = subBuffers;
    }
  }
  return result;
}
function alignOffset(offset, align) {
  return offset + (align - 1) & ~(align - 1);
}
function enumTypeError(value) {
  throw new TypeError(`Invalid enum value: ${value}`);
}
function defineEnum(mapping, base = "u32") {
  const reverse = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
  return {
    __type: "enum",
    type: base,
    to(value) {
      return typeof value === "number" ? value : mapping[value] ?? enumTypeError(String(value));
    },
    from(value) {
      return reverse[value] ?? enumTypeError(String(value));
    },
    enum: mapping
  };
}
function isEnum(type) {
  return typeof type === "object" && type.__type === "enum";
}
function isStruct(type) {
  return typeof type === "object" && type.__type === "struct";
}
function primitivePackers(type) {
  let pack;
  let unpack;
  switch (type) {
    case "u8":
      pack = (view, off, val) => view.setUint8(off, val);
      unpack = (view, off) => view.getUint8(off);
      break;
    case "bool_u8":
      pack = (view, off, val) => view.setUint8(off, val ? 1 : 0);
      unpack = (view, off) => Boolean(view.getUint8(off));
      break;
    case "bool_u32":
      pack = (view, off, val) => view.setUint32(off, val ? 1 : 0, true);
      unpack = (view, off) => Boolean(view.getUint32(off, true));
      break;
    case "u16":
      pack = (view, off, val) => view.setUint16(off, val, true);
      unpack = (view, off) => view.getUint16(off, true);
      break;
    case "i16":
      pack = (view, off, val) => view.setInt16(off, val, true);
      unpack = (view, off) => view.getInt16(off, true);
      break;
    case "u32":
      pack = (view, off, val) => view.setUint32(off, val, true);
      unpack = (view, off) => view.getUint32(off, true);
      break;
    case "i32":
      pack = (view, off, val) => view.setInt32(off, val, true);
      unpack = (view, off) => view.getInt32(off, true);
      break;
    case "u64":
      pack = (view, off, val) => view.setBigUint64(off, BigInt(val), true);
      unpack = (view, off) => view.getBigUint64(off, true);
      break;
    case "f32":
      pack = (view, off, val) => view.setFloat32(off, val, true);
      unpack = (view, off) => view.getFloat32(off, true);
      break;
    case "f64":
      pack = (view, off, val) => view.setFloat64(off, val, true);
      unpack = (view, off) => view.getFloat64(off, true);
      break;
    case "pointer":
      pack = (view, off, val) => {
        pointerSize === 8 ? view.setBigUint64(off, val ? BigInt(val) : 0n, true) : view.setUint32(off, val ? Number(val) : 0, true);
      };
      unpack = (view, off) => {
        const bint = pointerSize === 8 ? view.getBigUint64(off, true) : BigInt(view.getUint32(off, true));
        return Number(bint);
      };
      break;
    default:
      fatalError(`Unsupported primitive type: ${type}`);
  }
  return { pack, unpack };
}
var { pack: pointerPacker, unpack: pointerUnpacker } = primitivePackers("pointer");
function packObjectArray(val) {
  const buffer = new ArrayBuffer(val.length * pointerSize);
  const bufferView = new DataView(buffer);
  for (let i = 0;i < val.length; i++) {
    const instance = val[i];
    const ptrValue = instance?.ptr ?? null;
    pointerPacker(bufferView, i * pointerSize, ptrValue);
  }
  return bufferView;
}
var encoder = new TextEncoder;
function defineStruct(fields, structDefOptions) {
  let offset = 0;
  let maxAlign = 1;
  const layout = [];
  const lengthOfFields = {};
  const lengthOfRequested = [];
  const arrayFieldsMetadata = {};
  for (const [name, typeOrStruct, options = {}] of fields) {
    if (options.condition && !options.condition()) {
      continue;
    }
    let size = 0, align = 0;
    let pack;
    let unpack;
    let needsLengthOf = false;
    let lengthOfDef = null;
    if (isPrimitiveType(typeOrStruct)) {
      size = typeSizes[typeOrStruct];
      align = typeAlignments[typeOrStruct];
      ({ pack, unpack } = primitivePackers(typeOrStruct));
    } else if (typeof typeOrStruct === "string" && typeOrStruct === "cstring") {
      size = pointerSize;
      align = pointerSize;
      pack = (view, off, val) => {
        const bufPtr = val ? ptr(encoder.encode(val + "\x00")) : null;
        pointerPacker(view, off, bufPtr);
      };
      unpack = (view, off) => {
        const ptrVal = pointerUnpacker(view, off);
        return ptrVal;
      };
    } else if (typeof typeOrStruct === "string" && typeOrStruct === "char*") {
      size = pointerSize;
      align = pointerSize;
      pack = (view, off, val) => {
        const bufPtr = val ? ptr(encoder.encode(val)) : null;
        pointerPacker(view, off, bufPtr);
      };
      unpack = (view, off) => {
        const ptrVal = pointerUnpacker(view, off);
        return ptrVal;
      };
    } else if (isEnum(typeOrStruct)) {
      const base = typeOrStruct.type;
      size = typeSizes[base];
      align = typeAlignments[base];
      const { pack: packEnum } = primitivePackers(base);
      pack = (view, off, val) => {
        const num = typeOrStruct.to(val);
        packEnum(view, off, num);
      };
      unpack = (view, off) => {
        const raw = typeGetters[base](view, off);
        return typeOrStruct.from(raw);
      };
    } else if (isStruct(typeOrStruct)) {
      if (options.asPointer === true) {
        size = pointerSize;
        align = pointerSize;
        pack = (view, off, val, obj, options2) => {
          if (!val) {
            pointerPacker(view, off, null);
            return;
          }
          const nestedBuf = typeOrStruct.pack(val, options2);
          pointerPacker(view, off, ptr(nestedBuf));
        };
        unpack = (view, off) => {
          throw new Error("Not implemented yet");
        };
      } else {
        size = typeOrStruct.size;
        align = typeOrStruct.align;
        pack = (view, off, val, obj, options2) => {
          const nestedBuf = typeOrStruct.pack(val, options2);
          const nestedView = new Uint8Array(nestedBuf);
          const dView = new Uint8Array(view.buffer);
          dView.set(nestedView, off);
        };
        unpack = (view, off) => {
          const slice = view.buffer.slice(off, off + size);
          return typeOrStruct.unpack(slice);
        };
      }
    } else if (isObjectPointerDef(typeOrStruct)) {
      size = pointerSize;
      align = pointerSize;
      pack = (view, off, value) => {
        const ptrValue = value?.ptr ?? null;
        if (ptrValue === undefined) {
          console.warn(`Field '${name}' expected object with '.ptr' property, but got undefined pointer value from:`, value);
          pointerPacker(view, off, null);
        } else {
          pointerPacker(view, off, ptrValue);
        }
      };
      unpack = (view, off) => {
        return pointerUnpacker(view, off);
      };
    } else if (Array.isArray(typeOrStruct) && typeOrStruct.length === 1 && typeOrStruct[0] !== undefined) {
      const [def] = typeOrStruct;
      size = pointerSize;
      align = pointerSize;
      let arrayElementSize;
      if (isEnum(def)) {
        arrayElementSize = typeSizes[def.type];
        pack = (view, off, val, obj) => {
          if (!val || val.length === 0) {
            pointerPacker(view, off, null);
            return;
          }
          const buffer = new ArrayBuffer(val.length * arrayElementSize);
          const bufferView = new DataView(buffer);
          for (let i = 0;i < val.length; i++) {
            const num = def.to(val[i]);
            bufferView.setUint32(i * arrayElementSize, num, true);
          }
          pointerPacker(view, off, ptr(buffer));
        };
        unpack = null;
        needsLengthOf = true;
        lengthOfDef = def;
      } else if (isStruct(def)) {
        arrayElementSize = def.size;
        pack = (view, off, val, obj, options2) => {
          if (!val || val.length === 0) {
            pointerPacker(view, off, null);
            return;
          }
          const buffer = new ArrayBuffer(val.length * arrayElementSize);
          const bufferView = new DataView(buffer);
          for (let i = 0;i < val.length; i++) {
            def.packInto(val[i], bufferView, i * arrayElementSize, options2);
          }
          pointerPacker(view, off, ptr(buffer));
        };
        unpack = (view, off) => {
          throw new Error("Not implemented yet");
        };
      } else if (isPrimitiveType(def)) {
        arrayElementSize = typeSizes[def];
        const { pack: primitivePack } = primitivePackers(def);
        pack = (view, off, val) => {
          if (!val || val.length === 0) {
            pointerPacker(view, off, null);
            return;
          }
          const buffer = new ArrayBuffer(val.length * arrayElementSize);
          const bufferView = new DataView(buffer);
          for (let i = 0;i < val.length; i++) {
            primitivePack(bufferView, i * arrayElementSize, val[i]);
          }
          pointerPacker(view, off, ptr(buffer));
        };
        unpack = null;
      } else if (isObjectPointerDef(def)) {
        arrayElementSize = pointerSize;
        pack = (view, off, val) => {
          if (!val || val.length === 0) {
            pointerPacker(view, off, null);
            return;
          }
          const packedView = packObjectArray(val);
          pointerPacker(view, off, ptr(packedView.buffer));
        };
        unpack = () => {
          throw new Error("not implemented yet");
        };
      } else {
        throw new Error(`Unsupported array element type for ${name}: ${JSON.stringify(def)}`);
      }
      const lengthOfField = Object.values(lengthOfFields).find((f) => f.lengthOf === name);
      if (lengthOfField && isPrimitiveType(lengthOfField.type)) {
        const { pack: lengthPack } = primitivePackers(lengthOfField.type);
        arrayFieldsMetadata[name] = {
          elementSize: arrayElementSize,
          arrayOffset: offset,
          lengthOffset: lengthOfField.offset,
          lengthPack
        };
      }
    } else {
      throw new Error(`Unsupported field type for ${name}: ${JSON.stringify(typeOrStruct)}`);
    }
    offset = alignOffset(offset, align);
    if (options.unpackTransform) {
      const originalUnpack = unpack;
      unpack = (view, off) => options.unpackTransform(originalUnpack(view, off));
    }
    if (options.packTransform) {
      const originalPack = pack;
      pack = (view, off, val, obj, packOptions) => originalPack(view, off, options.packTransform(val), obj, packOptions);
    }
    if (options.optional) {
      const originalPack = pack;
      if (isStruct(typeOrStruct) && !options.asPointer) {
        pack = (view, off, val, obj, packOptions) => {
          if (val || options.mapOptionalInline) {
            originalPack(view, off, val, obj, packOptions);
          }
        };
      } else {
        pack = (view, off, val, obj, packOptions) => originalPack(view, off, val ?? 0, obj, packOptions);
      }
    }
    if (options.lengthOf) {
      const originalPack = pack;
      pack = (view, off, val, obj, packOptions) => originalPack(view, off, obj[options.lengthOf] ? obj[options.lengthOf].length : 0, obj, packOptions);
    }
    let validateFunctions;
    if (options.validate) {
      validateFunctions = Array.isArray(options.validate) ? options.validate : [options.validate];
    }
    const layoutField = {
      name,
      offset,
      size,
      align,
      validate: validateFunctions,
      optional: !!options.optional || !!options.lengthOf || options.default !== undefined,
      default: options.default,
      pack,
      unpack,
      type: typeOrStruct,
      lengthOf: options.lengthOf
    };
    layout.push(layoutField);
    if (options.lengthOf) {
      lengthOfFields[options.lengthOf] = layoutField;
    }
    if (needsLengthOf) {
      if (!lengthOfDef)
        fatalError(`Internal error: needsLengthOf=true but lengthOfDef is null for ${name}`);
      lengthOfRequested.push({ requester: layoutField, def: lengthOfDef });
    }
    offset += size;
    maxAlign = Math.max(maxAlign, align);
  }
  for (const { requester, def } of lengthOfRequested) {
    if (isPrimitiveType(def)) {
      continue;
    }
    const lengthOfField = lengthOfFields[requester.name];
    if (!lengthOfField) {
      throw new Error(`lengthOf field not found for array field ${requester.name}`);
    }
    const elemSize = def.type === "u32" ? 4 : 8;
    requester.unpack = (view, off) => {
      const result = [];
      const length = lengthOfField.unpack(view, lengthOfField.offset);
      const ptrAddress = pointerUnpacker(view, off);
      if (ptrAddress === 0n && length > 0) {
        throw new Error(`Array field ${requester.name} has null pointer but length ${length}.`);
      }
      if (ptrAddress === 0n || length === 0) {
        return [];
      }
      const buffer = toArrayBuffer2(ptrAddress, 0, length * elemSize);
      const bufferView = new DataView(buffer);
      for (let i = 0;i < length; i++) {
        result.push(def.from(bufferView.getUint32(i * elemSize, true)));
      }
      return result;
    };
  }
  const totalSize = alignOffset(offset, maxAlign);
  const description = layout.map((f) => ({
    name: f.name,
    offset: f.offset,
    size: f.size,
    align: f.align,
    optional: f.optional,
    type: f.type,
    lengthOf: f.lengthOf
  }));
  const layoutByName = new Map(description.map((f) => [f.name, f]));
  const arrayFields = new Map(Object.entries(arrayFieldsMetadata));
  return {
    __type: "struct",
    size: totalSize,
    align: maxAlign,
    hasMapValue: !!structDefOptions?.mapValue,
    layoutByName,
    arrayFields,
    pack(obj, options) {
      const buf = new ArrayBuffer(totalSize);
      const view = new DataView(buf);
      let mappedObj = obj;
      if (structDefOptions?.mapValue) {
        mappedObj = structDefOptions.mapValue(obj);
      }
      for (const field of layout) {
        const value = mappedObj[field.name] ?? field.default;
        if (!field.optional && value === undefined) {
          fatalError(`Packing non-optional field '${field.name}' but value is undefined (and no default provided)`);
        }
        if (field.validate) {
          for (const validateFn of field.validate) {
            validateFn(value, field.name, { hints: options?.validationHints, input: mappedObj });
          }
        }
        field.pack(view, field.offset, value, mappedObj, options);
      }
      return view.buffer;
    },
    packInto(obj, view, offset2, options) {
      let mappedObj = obj;
      if (structDefOptions?.mapValue) {
        mappedObj = structDefOptions.mapValue(obj);
      }
      for (const field of layout) {
        const value = mappedObj[field.name] ?? field.default;
        if (!field.optional && value === undefined) {
          console.warn(`packInto missing value for non-optional field '${field.name}' at offset ${offset2 + field.offset}. Writing default or zero.`);
        }
        if (field.validate) {
          for (const validateFn of field.validate) {
            validateFn(value, field.name, { hints: options?.validationHints, input: mappedObj });
          }
        }
        field.pack(view, offset2 + field.offset, value, mappedObj, options);
      }
    },
    unpack(buf) {
      if (buf.byteLength < totalSize) {
        fatalError(`Buffer size (${buf.byteLength}) is smaller than struct size (${totalSize}) for unpacking.`);
      }
      const view = new DataView(buf);
      const result = structDefOptions?.default ? { ...structDefOptions.default } : {};
      for (const field of layout) {
        if (!field.unpack) {
          continue;
        }
        try {
          result[field.name] = field.unpack(view, field.offset);
        } catch (e) {
          console.error(`Error unpacking field '${field.name}' at offset ${field.offset}:`, e);
          throw e;
        }
      }
      if (structDefOptions?.reduceValue) {
        return structDefOptions.reduceValue(result);
      }
      return result;
    },
    describe() {
      return description;
    }
  };
}

// src/structs_def.ts
var WGPUBool = "bool_u32";
var UINT64_MAX = 0xFFFFFFFFFFFFFFFFn;
var WGPU_WHOLE_SIZE = 0xFFFFFFFFFFFFFFFFn;
var WGPU_STRLEN = UINT64_MAX;
var WGPUCallbackMode = {
  WaitAnyOnly: 1,
  AllowProcessEvents: 2,
  AllowSpontaneous: 3,
  Force32: 2147483647
};
var WGPUCallbackModeDef = defineEnum(WGPUCallbackMode);
var WGPUErrorTypeDef = defineEnum(WGPUErrorType);
var WGPUDeviceLostReason = {
  unknown: 1,
  destroyed: 2,
  "callback-cancelled": 3,
  "failed-creation": 4,
  "force-32": 2147483647
};
var WGPUDeviceLostReasonDef = defineEnum(WGPUDeviceLostReason);
var WGPUSType = {
  ShaderSourceSPIRV: 1,
  ShaderSourceWGSL: 2,
  RenderPassMaxDrawCount: 3,
  SurfaceSourceMetalLayer: 4,
  SurfaceSourceWindowsHWND: 5,
  SurfaceSourceXlibWindow: 6,
  SurfaceSourceWaylandSurface: 7,
  SurfaceSourceAndroidNativeWindow: 8,
  SurfaceSourceXCBWindow: 9,
  SurfaceColorManagement: 10,
  RequestAdapterWebXROptions: 11,
  AdapterPropertiesSubgroups: 12,
  TextureBindingViewDimensionDescriptor: 131072,
  EmscriptenSurfaceSourceCanvasHTMLSelector: 262144,
  SurfaceDescriptorFromWindowsCoreWindow: 327680,
  ExternalTextureBindingEntry: 327681,
  ExternalTextureBindingLayout: 327682,
  SurfaceDescriptorFromWindowsUWPSwapChainPanel: 327683,
  DawnTextureInternalUsageDescriptor: 327684,
  DawnEncoderInternalUsageDescriptor: 327685,
  DawnInstanceDescriptor: 327686,
  DawnCacheDeviceDescriptor: 327687,
  DawnAdapterPropertiesPowerPreference: 327688,
  DawnBufferDescriptorErrorInfoFromWireClient: 327689,
  DawnTogglesDescriptor: 327690,
  DawnShaderModuleSPIRVOptionsDescriptor: 327691,
  RequestAdapterOptionsLUID: 327692,
  RequestAdapterOptionsGetGLProc: 327693,
  RequestAdapterOptionsD3D11Device: 327694,
  DawnRenderPassColorAttachmentRenderToSingleSampled: 327695,
  RenderPassPixelLocalStorage: 327696,
  PipelineLayoutPixelLocalStorage: 327697,
  BufferHostMappedPointer: 327698,
  AdapterPropertiesMemoryHeaps: 327699,
  AdapterPropertiesD3D: 327700,
  AdapterPropertiesVk: 327701,
  DawnWireWGSLControl: 327702,
  DawnWGSLBlocklist: 327703,
  DawnDrmFormatCapabilities: 327704,
  ShaderModuleCompilationOptions: 327705,
  ColorTargetStateExpandResolveTextureDawn: 327706,
  RenderPassDescriptorExpandResolveRect: 327707,
  SharedTextureMemoryVkDedicatedAllocationDescriptor: 327708,
  SharedTextureMemoryAHardwareBufferDescriptor: 327709,
  SharedTextureMemoryDmaBufDescriptor: 327710,
  SharedTextureMemoryOpaqueFDDescriptor: 327711,
  SharedTextureMemoryZirconHandleDescriptor: 327712,
  SharedTextureMemoryDXGISharedHandleDescriptor: 327713,
  SharedTextureMemoryD3D11Texture2DDescriptor: 327714,
  SharedTextureMemoryIOSurfaceDescriptor: 327715,
  SharedTextureMemoryEGLImageDescriptor: 327716,
  SharedTextureMemoryInitializedBeginState: 327717,
  SharedTextureMemoryInitializedEndState: 327718,
  SharedTextureMemoryVkImageLayoutBeginState: 327719,
  SharedTextureMemoryVkImageLayoutEndState: 327720,
  SharedTextureMemoryD3DSwapchainBeginState: 327721,
  SharedFenceVkSemaphoreOpaqueFDDescriptor: 327722,
  SharedFenceVkSemaphoreOpaqueFDExportInfo: 327723,
  SharedFenceSyncFDDescriptor: 327724,
  SharedFenceSyncFDExportInfo: 327725,
  SharedFenceVkSemaphoreZirconHandleDescriptor: 327726,
  SharedFenceVkSemaphoreZirconHandleExportInfo: 327727,
  SharedFenceDXGISharedHandleDescriptor: 327728,
  SharedFenceDXGISharedHandleExportInfo: 327729,
  SharedFenceMTLSharedEventDescriptor: 327730,
  SharedFenceMTLSharedEventExportInfo: 327731,
  SharedBufferMemoryD3D12ResourceDescriptor: 327732,
  StaticSamplerBindingLayout: 327733,
  YCbCrVkDescriptor: 327734,
  SharedTextureMemoryAHardwareBufferProperties: 327735,
  AHardwareBufferProperties: 327736,
  DawnExperimentalImmediateDataLimits: 327737,
  DawnTexelCopyBufferRowAlignmentLimits: 327738,
  AdapterPropertiesSubgroupMatrixConfigs: 327739,
  SharedFenceEGLSyncDescriptor: 327740,
  SharedFenceEGLSyncExportInfo: 327741,
  DawnInjectedInvalidSType: 327742,
  DawnCompilationMessageUtf16: 327743,
  DawnFakeBufferOOMForTesting: 327744,
  SurfaceDescriptorFromWindowsWinUISwapChainPanel: 327745,
  DawnDeviceAllocatorControl: 327746,
  Force32: 2147483647
};
var WGPUCompareFunction = defineEnum({
  undefined: 0,
  never: 1,
  less: 2,
  equal: 3,
  "less-equal": 4,
  greater: 5,
  "not-equal": 6,
  "greater-equal": 7,
  always: 8,
  "force-32": 2147483647
});
var WGPUErrorFilter = defineEnum({
  validation: 1,
  "out-of-memory": 2,
  internal: 3,
  "force-32": 2147483647
});
var WGPUStringView = defineStruct([
  ["data", "char*", { optional: true }],
  ["length", "u64"]
], {
  mapValue: (v) => {
    if (!v) {
      return {
        data: null,
        length: WGPU_STRLEN
      };
    }
    return {
      data: v,
      length: Buffer.byteLength(v)
    };
  },
  reduceValue: (v) => {
    if (v.data === null || v.length === 0n) {
      return "";
    }
    const buffer = toArrayBuffer3(v.data, 0, Number(v.length) || 0);
    return new TextDecoder().decode(buffer);
  }
});
var PowerPreference = defineEnum({
  undefined: 0,
  "low-power": 1,
  "high-performance": 2
});
var WGPUBackendType = defineEnum({
  Undefined: 0,
  Null: 1,
  WebGPU: 2,
  D3D11: 3,
  D3D12: 4,
  Metal: 5,
  Vulkan: 6,
  OpenGL: 7,
  OpenGLES: 8,
  Force32: 2147483647
});
var WGPUFeatureLevel = defineEnum({
  undefined: 0,
  compatibility: 1,
  core: 2,
  force32: 2147483647
});
var WGPURequestAdapterOptionsStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["featureLevel", WGPUFeatureLevel, { optional: true }],
  ["powerPreference", PowerPreference, { optional: true }],
  ["forceFallbackAdapter", WGPUBool, { optional: true }],
  ["backendType", WGPUBackendType, { optional: true }],
  ["compatibleSurface", "pointer", { optional: true }]
]);
var WGPUCallbackInfoStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["mode", WGPUCallbackModeDef],
  ["callback", "pointer"],
  ["userdata1", "pointer", { optional: true }],
  ["userdata2", "pointer", { optional: true }]
]);
var WGPUChainedStructStruct = defineStruct([
  ["next", "pointer", { optional: true }],
  ["sType", "u32"]
]);
var WGPUFeatureNameDef = defineEnum({
  "depth-clip-control": 1,
  "depth32float-stencil8": 2,
  "timestamp-query": 3,
  "texture-compression-bc": 4,
  "texture-compression-bc-sliced-3d": 5,
  "texture-compression-etc2": 6,
  "texture-compression-astc": 7,
  "texture-compression-astc-sliced-3d": 8,
  "indirect-first-instance": 9,
  "shader-f16": 10,
  "rg11b10ufloat-renderable": 11,
  "bgra8unorm-storage": 12,
  "float32-filterable": 13,
  "float32-blendable": 14,
  "clip-distances": 15,
  "dual-source-blending": 16,
  subgroups: 17,
  "core-features-and-limits": 18,
  "dawn-internal-usages": 327680,
  "dawn-multi-planar-formats": 327681,
  "dawn-native": 327682,
  "chromium-experimental-timestamp-query-inside-passes": 327683,
  "implicit-device-synchronization": 327684,
  "chromium-experimental-immediate-data": 327685,
  "transient-attachments": 327686,
  "msaa-render-to-single-sampled": 327687,
  "subgroups-f16": 327688,
  "d3d11-multithread-protected": 327689,
  "angle-texture-sharing": 327690,
  "pixel-local-storage-coherent": 327691,
  "pixel-local-storage-non-coherent": 327692,
  "unorm16-texture-formats": 327693,
  "snorm16-texture-formats": 327694,
  "multi-planar-format-extended-usages": 327695,
  "multi-planar-format-p010": 327696,
  "host-mapped-pointer": 327697,
  "multi-planar-render-targets": 327698,
  "multi-planar-format-nv12a": 327699,
  "framebuffer-fetch": 327700,
  "buffer-map-extended-usages": 327701,
  "adapter-properties-memory-heaps": 327702,
  "adapter-properties-d3d": 327703,
  "adapter-properties-vk": 327704,
  "r8-unorm-storage": 327705,
  "dawn-format-capabilities": 327706,
  "dawn-drm-format-capabilities": 327707,
  "norm16-texture-formats": 327708,
  "multi-planar-format-nv16": 327709,
  "multi-planar-format-nv24": 327710,
  "multi-planar-format-p210": 327711,
  "multi-planar-format-p410": 327712,
  "shared-texture-memory-vk-dedicated-allocation": 327713,
  "shared-texture-memory-a-hardware-buffer": 327714,
  "shared-texture-memory-dma-buf": 327715,
  "shared-texture-memory-opaque-fd": 327716,
  "shared-texture-memory-zircon-handle": 327717,
  "shared-texture-memory-dxgi-shared-handle": 327718,
  "shared-texture-memory-d3d11-texture2d": 327719,
  "shared-texture-memory-iosurface": 327720,
  "shared-texture-memory-egl-image": 327721,
  "shared-fence-vk-semaphore-opaque-fd": 327722,
  "shared-fence-sync-fd": 327723,
  "shared-fence-vk-semaphore-zircon-handle": 327724,
  "shared-fence-dxgi-shared-handle": 327725,
  "shared-fence-mtl-shared-event": 327726,
  "shared-buffer-memory-d3d12-resource": 327727,
  "static-samplers": 327728,
  "ycbcr-vulkan-samplers": 327729,
  "shader-module-compilation-options": 327730,
  "dawn-load-resolve-texture": 327731,
  "dawn-partial-load-resolve-texture": 327732,
  "multi-draw-indirect": 327733,
  "dawn-texel-copy-buffer-row-alignment": 327734,
  "flexible-texture-views": 327735,
  "chromium-experimental-subgroup-matrix": 327736,
  "shared-fence-egl-sync": 327737,
  "dawn-device-allocator-control": 327738,
  "force-32": 2147483647
}, "u32");
var WGPUTextureFormat = defineEnum({
  undefined: 0,
  r8unorm: 1,
  r8snorm: 2,
  r8uint: 3,
  r8sint: 4,
  r16uint: 5,
  r16sint: 6,
  r16float: 7,
  rg8unorm: 8,
  rg8snorm: 9,
  rg8uint: 10,
  rg8sint: 11,
  r32float: 12,
  r32uint: 13,
  r32sint: 14,
  rg16uint: 15,
  rg16sint: 16,
  rg16float: 17,
  rgba8unorm: 18,
  "rgba8unorm-srgb": 19,
  rgba8snorm: 20,
  rgba8uint: 21,
  rgba8sint: 22,
  bgra8unorm: 23,
  "bgra8unorm-srgb": 24,
  rgb10a2uint: 25,
  rgb10a2unorm: 26,
  rg11b10ufloat: 27,
  rgb9e5ufloat: 28,
  rg32float: 29,
  rg32uint: 30,
  rg32sint: 31,
  rgba16uint: 32,
  rgba16sint: 33,
  rgba16float: 34,
  rgba32float: 35,
  rgba32uint: 36,
  rgba32sint: 37,
  stencil8: 38,
  depth16unorm: 39,
  depth24plus: 40,
  "depth24plus-stencil8": 41,
  depth32float: 42,
  "depth32float-stencil8": 43,
  "bc1-rgba-unorm": 44,
  "bc1-rgba-unorm-srgb": 45,
  "bc2-rgba-unorm": 46,
  "bc2-rgba-unorm-srgb": 47,
  "bc3-rgba-unorm": 48,
  "bc3-rgba-unorm-srgb": 49,
  "bc4-r-unorm": 50,
  "bc4-r-snorm": 51,
  "bc5-rg-unorm": 52,
  "bc5-rg-snorm": 53,
  "bc6h-rgb-ufloat": 54,
  "bc6h-rgb-float": 55,
  "bc7-rgba-unorm": 56,
  "bc7-rgba-unorm-srgb": 57,
  "etc2-rgb8unorm": 58,
  "etc2-rgb8unorm-srgb": 59,
  "etc2-rgb8a1unorm": 60,
  "etc2-rgb8a1unorm-srgb": 61,
  "etc2-rgba8unorm": 62,
  "etc2-rgba8unorm-srgb": 63,
  "eac-r11unorm": 64,
  "eac-r11snorm": 65,
  "eac-rg11unorm": 66,
  "eac-rg11snorm": 67,
  "astc-4x4-unorm": 68,
  "astc-4x4-unorm-srgb": 69,
  "astc-5x4-unorm": 70,
  "astc-5x4-unorm-srgb": 71,
  "astc-5x5-unorm": 72,
  "astc-5x5-unorm-srgb": 73,
  "astc-6x5-unorm": 74,
  "astc-6x5-unorm-srgb": 75,
  "astc-6x6-unorm": 76,
  "astc-6x6-unorm-srgb": 77,
  "astc-8x5-unorm": 78,
  "astc-8x5-unorm-srgb": 79,
  "astc-8x6-unorm": 80,
  "astc-8x6-unorm-srgb": 81,
  "astc-8x8-unorm": 82,
  "astc-8x8-unorm-srgb": 83,
  "astc-10x5-unorm": 84,
  "astc-10x5-unorm-srgb": 85,
  "astc-10x6-unorm": 86,
  "astc-10x6-unorm-srgb": 87,
  "astc-10x8-unorm": 88,
  "astc-10x8-unorm-srgb": 89,
  "astc-10x10-unorm": 90,
  "astc-10x10-unorm-srgb": 91,
  "astc-12x10-unorm": 92,
  "astc-12x10-unorm-srgb": 93,
  "astc-12x12-unorm": 94,
  "astc-12x12-unorm-srgb": 95,
  r16unorm: 327680,
  rg16unorm: 327681,
  rgba16unorm: 327682,
  r16snorm: 327683,
  rg16snorm: 327684,
  rgba16snorm: 327685,
  "r8bg8-biplanar-420unorm": 327686,
  "r10x6bg10x6-biplanar-420unorm": 327687,
  "r8bg8a8-triplanar-420unorm": 327688,
  "r8bg8-biplanar-422unorm": 327689,
  "r8bg8-biplanar-444unorm": 327690,
  "r10x6bg10x6-biplanar-422unorm": 327691,
  "r10x6bg10x6-biplanar-444unorm": 327692,
  external: 327693
}, "u32");
var WGPUWGSLLanguageFeatureNameDef = defineEnum({
  readonly_and_readwrite_storage_textures: 1,
  packed_4x8_integer_dot_product: 2,
  unrestricted_pointer_parameters: 3,
  pointer_composite_access: 4,
  sized_binding_array: 5,
  chromium_testing_unimplemented: 327680,
  chromium_testing_unsafe_experimental: 327681,
  chromium_testing_experimental: 327682,
  chromium_testing_shipped_with_killswitch: 327683,
  chromium_testing_shipped: 327684,
  force_32: 2147483647
}, "u32");
var WGPUSupportedFeaturesStruct = defineStruct([
  ["featureCount", "u64", { unpackTransform: (val) => Number(val), lengthOf: "features" }],
  ["features", [WGPUFeatureNameDef]]
]);
var WGPUSupportedWGSLLanguageFeaturesStruct = defineStruct([
  ["featureCount", "u64", { unpackTransform: (val) => Number(val), lengthOf: "features" }],
  ["features", [WGPUWGSLLanguageFeatureNameDef]]
]);
function validateMutipleOf(val, multipleOf) {
  const mod = val % multipleOf;
  if (mod !== 0) {
    throw new OperationError(`Value must be a multiple of ${multipleOf}, got ${val}`);
  }
}
function validateRange(val, min, max) {
  if (val < 0 || val > Number.MAX_SAFE_INTEGER) {
    throw new TypeError(`Value must be between 0 and ${Number.MAX_SAFE_INTEGER}, got ${val}`);
  }
  if (val < min || val > max) {
    throw new OperationError(`Value must be between ${min} and ${max}, got ${val}`);
  }
}
function minValidator(val, fieldName, { hints } = {}) {
  if (val < 0 || val > Number.MAX_SAFE_INTEGER) {
    throw new TypeError(`Value must be between 0 and ${Number.MAX_SAFE_INTEGER}, got ${val}`);
  }
  if (hints && fieldName in hints.limits) {
    const minValue = hints.limits[fieldName];
    if (val < minValue) {
      throw new OperationError(`Value must be >= ${minValue}, got ${val}`);
    }
  }
}
function validateLimitField(val, fieldName, { hints } = {}) {
  if (hints && fieldName in hints.limits) {
    const maxValue = hints.limits[fieldName];
    validateRange(val, 0, maxValue);
  }
}
var WGPULimitsStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["maxTextureDimension1D", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxTextureDimension1D, validate: validateLimitField }],
  ["maxTextureDimension2D", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxTextureDimension2D, validate: validateLimitField }],
  ["maxTextureDimension3D", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxTextureDimension3D, validate: validateLimitField }],
  ["maxTextureArrayLayers", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxTextureArrayLayers, validate: validateLimitField }],
  ["maxBindGroups", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxBindGroups, validate: validateLimitField }],
  ["maxBindGroupsPlusVertexBuffers", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxBindGroupsPlusVertexBuffers, validate: validateLimitField }],
  ["maxBindingsPerBindGroup", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxBindingsPerBindGroup, validate: validateLimitField }],
  ["maxDynamicUniformBuffersPerPipelineLayout", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxDynamicUniformBuffersPerPipelineLayout, validate: validateLimitField }],
  ["maxDynamicStorageBuffersPerPipelineLayout", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxDynamicStorageBuffersPerPipelineLayout, validate: validateLimitField }],
  ["maxSampledTexturesPerShaderStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxSampledTexturesPerShaderStage, validate: validateLimitField }],
  ["maxSamplersPerShaderStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxSamplersPerShaderStage, validate: validateLimitField }],
  ["maxStorageBuffersPerShaderStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageBuffersPerShaderStage, validate: validateLimitField }],
  ["maxStorageTexturesPerShaderStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageTexturesPerShaderStage, validate: validateLimitField }],
  ["maxUniformBuffersPerShaderStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxUniformBuffersPerShaderStage, validate: validateLimitField }],
  ["maxUniformBufferBindingSize", "u64", { default: DEFAULT_SUPPORTED_LIMITS.maxUniformBufferBindingSize, validate: validateLimitField }],
  ["maxStorageBufferBindingSize", "u64", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageBufferBindingSize, validate: validateLimitField }],
  ["minUniformBufferOffsetAlignment", "u32", { default: DEFAULT_SUPPORTED_LIMITS.minUniformBufferOffsetAlignment, validate: [minValidator, (val) => validateMutipleOf(val, 2)] }],
  ["minStorageBufferOffsetAlignment", "u32", { default: DEFAULT_SUPPORTED_LIMITS.minStorageBufferOffsetAlignment, validate: [minValidator, (val) => validateMutipleOf(val, 2)] }],
  ["maxVertexBuffers", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxVertexBuffers, validate: validateLimitField }],
  ["maxBufferSize", "u64", { default: DEFAULT_SUPPORTED_LIMITS.maxBufferSize, validate: validateLimitField }],
  ["maxVertexAttributes", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxVertexAttributes, validate: validateLimitField }],
  ["maxVertexBufferArrayStride", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxVertexBufferArrayStride, validate: validateLimitField }],
  ["maxInterStageShaderVariables", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxInterStageShaderVariables, validate: validateLimitField }],
  ["maxColorAttachments", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxColorAttachments, validate: validateLimitField }],
  ["maxColorAttachmentBytesPerSample", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxColorAttachmentBytesPerSample, validate: validateLimitField }],
  ["maxComputeWorkgroupStorageSize", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeWorkgroupStorageSize, validate: validateLimitField }],
  ["maxComputeInvocationsPerWorkgroup", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeInvocationsPerWorkgroup, validate: validateLimitField }],
  ["maxComputeWorkgroupSizeX", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeWorkgroupSizeX, validate: validateLimitField }],
  ["maxComputeWorkgroupSizeY", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeWorkgroupSizeY, validate: validateLimitField }],
  ["maxComputeWorkgroupSizeZ", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeWorkgroupSizeZ, validate: validateLimitField }],
  ["maxComputeWorkgroupsPerDimension", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxComputeWorkgroupsPerDimension, validate: validateLimitField }],
  ["maxImmediateSize", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxImmediateSize, validate: validateLimitField }],
  ["maxStorageBuffersInVertexStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageBuffersInVertexStage, validate: validateLimitField }],
  ["maxStorageTexturesInVertexStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageTexturesInVertexStage, validate: validateLimitField }],
  ["maxStorageBuffersInFragmentStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageBuffersInFragmentStage, validate: validateLimitField }],
  ["maxStorageTexturesInFragmentStage", "u32", { default: DEFAULT_SUPPORTED_LIMITS.maxStorageTexturesInFragmentStage, validate: validateLimitField }]
], {
  default: {
    ...DEFAULT_SUPPORTED_LIMITS
  }
});
var WGPUQueueDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }]
]);
var WGPUUncapturedErrorCallbackInfoStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["callback", "pointer"],
  ["userdata1", "pointer", { optional: true }],
  ["userdata2", "pointer", { optional: true }]
]);
var WGPUAdapterInfoStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["vendor", WGPUStringView],
  ["architecture", WGPUStringView],
  ["device", WGPUStringView],
  ["description", WGPUStringView],
  ["backendType", "u32"],
  ["adapterType", "u32"],
  ["vendorID", "u32"],
  ["deviceID", "u32"],
  ["subgroupMinSize", "u32"],
  ["subgroupMaxSize", "u32"]
]);
var WGPUDeviceDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["requiredFeatureCount", "u64", { lengthOf: "requiredFeatures" }],
  ["requiredFeatures", [WGPUFeatureNameDef], { optional: true, validate: (val, fieldName, { hints } = {}) => {
    if (!val) {
      return;
    }
    for (const feature of val) {
      if (!hints?.features.has(feature)) {
        throw new TypeError(`Invalid feature required: ${feature}`);
      }
    }
  } }],
  ["requiredLimits", WGPULimitsStruct, { optional: true, asPointer: true, validate: (val, fieldName, { hints } = {}) => {
    if (!val) {
      return;
    }
    for (const key in val) {
      if (hints?.limits && !(key in hints?.limits) && val[key] !== undefined) {
        throw new OperationError(`Invalid limit required: ${key} ${val[key]}`);
      }
    }
  } }],
  ["defaultQueue", WGPUQueueDescriptorStruct],
  ["deviceLostCallbackInfo", WGPUCallbackInfoStruct, { optional: true }],
  ["uncapturedErrorCallbackInfo", WGPUUncapturedErrorCallbackInfoStruct]
]);
var WGPUBufferDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["usage", "u64"],
  ["size", "u64"],
  ["mappedAtCreation", WGPUBool, { default: false }]
]);
function normalizeGPUExtent3DStrict(size) {
  if (Symbol.iterator in size) {
    const arr = Array.from(size);
    return {
      width: arr[0] ?? 1,
      height: arr[1] ?? 1,
      depthOrArrayLayers: arr[2] ?? 1
    };
  }
  return size;
}
var WGPUExtent3DStruct = defineStruct([
  ["width", "u32"],
  ["height", "u32", { default: 1 }],
  ["depthOrArrayLayers", "u32", { default: 1 }]
], {
  mapValue: (v) => {
    return normalizeGPUExtent3DStrict(v);
  }
});
var WGPUTextureDimension = defineEnum({
  undefined: 0,
  "1d": 1,
  "2d": 2,
  "3d": 3,
  "force-32": 2147483647
});
var WGPUTextureDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["usage", "u64"],
  ["dimension", WGPUTextureDimension, { default: "2d" }],
  ["size", WGPUExtent3DStruct],
  ["format", WGPUTextureFormat, { default: "rgba8unorm" }],
  ["mipLevelCount", "u32", { default: 1 }],
  ["sampleCount", "u32", { default: 1 }],
  ["viewFormatCount", "u64", { lengthOf: "viewFormats" }],
  ["viewFormats", [WGPUTextureFormat], { optional: true }]
]);
var WGPUFilterMode = defineEnum({
  undefined: 0,
  nearest: 1,
  linear: 2,
  "force-32": 2147483647
});
var WGPUMipmapFilterMode = defineEnum({
  undefined: 0,
  nearest: 1,
  linear: 2,
  "force-32": 2147483647
});
var WGPUAddressMode = defineEnum({
  undefined: 0,
  "clamp-to-edge": 1,
  repeat: 2,
  "mirror-repeat": 3,
  "force-32": 2147483647
});
var WGPUSamplerDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["addressModeU", WGPUAddressMode, { default: "undefined" }],
  ["addressModeV", WGPUAddressMode, { default: "undefined" }],
  ["addressModeW", WGPUAddressMode, { default: "undefined" }],
  ["magFilter", WGPUFilterMode, { default: "undefined" }],
  ["minFilter", WGPUFilterMode, { default: "undefined" }],
  ["mipmapFilter", WGPUMipmapFilterMode, { default: "undefined" }],
  ["lodMinClamp", "f32", { default: 0 }],
  ["lodMaxClamp", "f32", { default: 32 }],
  ["compare", WGPUCompareFunction, { default: "undefined" }],
  ["maxAnisotropy", "u16", { default: 1, packTransform: (val) => val < 0 ? 0 : val }]
]);
var WGPUBufferBindingType = defineEnum({
  "binding-not-used": 0,
  undefined: 1,
  uniform: 2,
  storage: 3,
  "read-only-storage": 4
});
var WGPUSamplerBindingType = defineEnum({
  "binding-not-used": 0,
  undefined: 1,
  filtering: 2,
  "non-filtering": 3,
  comparison: 4
});
var WGPUTextureSampleType = defineEnum({
  "binding-not-used": 0,
  undefined: 1,
  float: 2,
  "unfilterable-float": 3,
  depth: 4,
  sint: 5,
  uint: 6
});
var WGPUTextureViewDimension = defineEnum({
  undefined: 0,
  "1d": 1,
  "2d": 2,
  "2d-array": 3,
  cube: 4,
  "cube-array": 5,
  "3d": 6
});
var WGPUStorageTextureAccess = defineEnum({
  "binding-not-used": 0,
  undefined: 1,
  "write-only": 2,
  "read-only": 3,
  "read-write": 4
});
var WGPUBufferBindingLayoutStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["type", WGPUBufferBindingType, { default: "uniform" }],
  ["hasDynamicOffset", WGPUBool, { default: false }],
  ["minBindingSize", "u64", { default: 0 }]
]);
var WGPUSamplerBindingLayoutStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["type", WGPUSamplerBindingType, { default: "filtering" }]
]);
var WGPUTextureBindingLayoutStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["sampleType", WGPUTextureSampleType, { default: "float" }],
  ["viewDimension", WGPUTextureViewDimension, { default: "2d" }],
  ["multisampled", WGPUBool, { default: false }]
]);
var WGPUStorageTextureBindingLayoutStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["access", WGPUStorageTextureAccess, { default: "write-only" }],
  ["format", WGPUTextureFormat, { default: "rgba8unorm" }],
  ["viewDimension", WGPUTextureViewDimension, { default: "2d" }]
]);
var WGPUTextureAspect = defineEnum({
  undefined: 0,
  all: 1,
  "stencil-only": 2,
  "depth-only": 3,
  "plane-0-only": 327680,
  "plane-1-only": 327681,
  "plane-2-only": 327682,
  "force-32": 2147483647
}, "u32");
var WGPUTextureViewDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["format", WGPUTextureFormat, { default: "undefined" }],
  ["dimension", WGPUTextureViewDimension, { default: "undefined" }],
  ["baseMipLevel", "u32", { default: 0 }],
  ["mipLevelCount", "u32", { default: 4294967295 }],
  ["baseArrayLayer", "u32", { default: 0 }],
  ["arrayLayerCount", "u32", { default: 4294967295 }],
  ["aspect", WGPUTextureAspect, { default: "all" }],
  ["usage", "u64", { default: 0n }]
]);
var WGPUExternalTextureBindingLayoutStruct = defineStruct([
  ["chain", WGPUChainedStructStruct]
]);
var WGPUBindGroupLayoutEntryStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["binding", "u32"],
  ["visibility", "u64"],
  ["_alignment0", "u32", { default: 0, condition: () => process.platform !== "win32" }],
  ["buffer", WGPUBufferBindingLayoutStruct, { optional: true }],
  ["sampler", WGPUSamplerBindingLayoutStruct, { optional: true }],
  ["texture", WGPUTextureBindingLayoutStruct, { optional: true }],
  ["storageTexture", WGPUStorageTextureBindingLayoutStruct, { optional: true }]
]);
var WGPUBindGroupLayoutDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["entryCount", "u64", { lengthOf: "entries" }],
  ["entries", [WGPUBindGroupLayoutEntryStruct]]
]);
var WGPUBindGroupEntryStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["binding", "u32"],
  ["buffer", objectPtr(), { optional: true }],
  ["offset", "u64", { optional: true }],
  ["size", "u64", { optional: true }],
  ["sampler", objectPtr(), { optional: true }],
  ["textureView", objectPtr(), { optional: true }]
]);
var WGPUBindGroupDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["layout", objectPtr()],
  ["entryCount", "u64", { lengthOf: "entries" }],
  ["entries", [WGPUBindGroupEntryStruct]]
]);
var WGPUPipelineLayoutDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["bindGroupLayoutCount", "u64", { lengthOf: "bindGroupLayouts" }],
  ["bindGroupLayouts", ["pointer"]],
  ["immediateSize", "u32", { default: 0 }]
]);
var WGPUShaderModuleDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }]
]);
var WGPUShaderSourceWGSLStruct = defineStruct([
  ["chain", WGPUChainedStructStruct],
  ["code", WGPUStringView]
]);
var WGPUVertexStepMode = defineEnum({
  undefined: 0,
  vertex: 1,
  instance: 2
});
var WGPUPrimitiveTopology = defineEnum({
  undefined: 0,
  "point-list": 1,
  "line-list": 2,
  "line-strip": 3,
  "triangle-list": 4,
  "triangle-strip": 5
});
var WGPUIndexFormat = defineEnum({
  undefined: 0,
  uint16: 1,
  uint32: 2
});
var WGPUFrontFace = defineEnum({
  undefined: 0,
  ccw: 1,
  cw: 2
});
var WGPUCullMode = defineEnum({
  undefined: 0,
  none: 1,
  front: 2,
  back: 3
});
var WGPUStencilOperation = defineEnum({
  undefined: 0,
  keep: 1,
  zero: 2,
  replace: 3,
  invert: 4,
  "increment-clamp": 5,
  "decrement-clamp": 6,
  "increment-wrap": 7,
  "decrement-wrap": 8
});
var WGPUBlendOperation = defineEnum({
  undefined: 0,
  add: 1,
  subtract: 2,
  "reverse-subtract": 3,
  min: 4,
  max: 5
});
var WGPUBlendFactor = defineEnum({
  undefined: 0,
  zero: 1,
  one: 2,
  src: 3,
  "one-minus-src": 4,
  "src-alpha": 5,
  "one-minus-src-alpha": 6,
  dst: 7,
  "one-minus-dst": 8,
  "dst-alpha": 9,
  "one-minus-dst-alpha": 10,
  "src-alpha-saturated": 11,
  constant: 12,
  "one-minus-constant": 13,
  src1: 14,
  "one-minus-src1": 15,
  "src1-alpha": 16,
  "one-minus-src1-alpha": 17
});
var WGPUColorWriteMask = {
  None: 0x0000000000000000n,
  Red: 0x0000000000000001n,
  Green: 0x0000000000000002n,
  Blue: 0x0000000000000004n,
  Alpha: 0x0000000000000008n,
  All: 0x000000000000000Fn
};
var WGPUOptionalBool = defineEnum({
  False: 0,
  True: 1,
  Undefined: 2
});
var WGPUVertexFormat = defineEnum({
  uint8: 1,
  uint8x2: 2,
  uint8x4: 3,
  sint8: 4,
  sint8x2: 5,
  sint8x4: 6,
  unorm8: 7,
  unorm8x2: 8,
  unorm8x4: 9,
  snorm8: 10,
  snorm8x2: 11,
  snorm8x4: 12,
  uint16: 13,
  uint16x2: 14,
  uint16x4: 15,
  sint16: 16,
  sint16x2: 17,
  sint16x4: 18,
  unorm16: 19,
  unorm16x2: 20,
  unorm16x4: 21,
  snorm16: 22,
  snorm16x2: 23,
  snorm16x4: 24,
  float16: 25,
  float16x2: 26,
  float16x4: 27,
  float32: 28,
  float32x2: 29,
  float32x3: 30,
  float32x4: 31,
  uint32: 32,
  uint32x2: 33,
  uint32x3: 34,
  uint32x4: 35,
  sint32: 36,
  sint32x2: 37,
  sint32x3: 38,
  sint32x4: 39,
  "unorm10-10-10-2": 40,
  "unorm8x4-bgra": 41,
  force32: 2147483647
}, "u32");
var WGPUConstantEntryStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["key", WGPUStringView],
  ["value", "f64", { validate: (val) => {
    if (!Number.isFinite(val)) {
      throw new TypeError(`Pipeline constant value must be finite, got ${val}`);
    }
  } }]
]);
var WGPUVertexAttributeStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["format", WGPUVertexFormat],
  ["offset", "u64"],
  ["shaderLocation", "u32"]
]);
var WGPUVertexBufferLayoutStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["stepMode", WGPUVertexStepMode, { default: "vertex" }],
  ["arrayStride", "u64"],
  ["attributeCount", "u64", { lengthOf: "attributes" }],
  ["attributes", [WGPUVertexAttributeStruct]]
]);
var WGPUVertexStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["module", objectPtr()],
  ["entryPoint", WGPUStringView, { optional: true, mapOptionalInline: true }],
  ["constantCount", "u64", { lengthOf: "constants" }],
  ["constants", [WGPUConstantEntryStruct], { optional: true }],
  ["bufferCount", "u64", { lengthOf: "buffers" }],
  ["buffers", [WGPUVertexBufferLayoutStruct], { optional: true }]
]);
var WGPUPrimitiveStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["topology", WGPUPrimitiveTopology, { default: "triangle-list" }],
  ["stripIndexFormat", WGPUIndexFormat, { default: "undefined" }],
  ["frontFace", WGPUFrontFace, { default: "ccw" }],
  ["cullMode", WGPUCullMode, { default: "none" }],
  ["unclippedDepth", WGPUBool, { optional: true }]
]);
var WGPUStencilFaceStateStruct = defineStruct([
  ["compare", WGPUCompareFunction, { default: "always" }],
  ["failOp", WGPUStencilOperation, { default: "keep" }],
  ["depthFailOp", WGPUStencilOperation, { default: "keep" }],
  ["passOp", WGPUStencilOperation, { default: "keep" }]
]);
var WGPUDepthStencilStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["format", WGPUTextureFormat],
  ["depthWriteEnabled", WGPUBool, { default: false }],
  ["depthCompare", WGPUCompareFunction, { default: "always" }],
  ["stencilFront", WGPUStencilFaceStateStruct, { default: {} }],
  ["stencilBack", WGPUStencilFaceStateStruct, { default: {} }],
  ["stencilReadMask", "u32", { default: 4294967295 }],
  ["stencilWriteMask", "u32", { default: 4294967295 }],
  ["depthBias", "i32", { default: 0 }],
  ["depthBiasSlopeScale", "f32", { default: 0 }],
  ["depthBiasClamp", "f32", { default: 0 }]
]);
var WGPUMultisampleStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["count", "u32", { default: 1 }],
  ["mask", "u32", { default: 4294967295 }],
  ["alphaToCoverageEnabled", WGPUBool, { default: false }]
]);
var WGPUBlendComponentStruct = defineStruct([
  ["operation", WGPUBlendOperation, { default: "add" }],
  ["srcFactor", WGPUBlendFactor, { default: "one" }],
  ["dstFactor", WGPUBlendFactor, { default: "zero" }]
]);
var WGPUBlendStateStruct = defineStruct([
  ["color", WGPUBlendComponentStruct],
  ["alpha", WGPUBlendComponentStruct]
]);
var WGPUColorTargetStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["format", WGPUTextureFormat],
  ["blend", WGPUBlendStateStruct, { optional: true, asPointer: true }],
  ["writeMask", "u64", { default: WGPUColorWriteMask.All }]
]);
var WGPUFragmentStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["module", objectPtr()],
  ["entryPoint", WGPUStringView, { optional: true, mapOptionalInline: true }],
  ["constantCount", "u64", { lengthOf: "constants" }],
  ["constants", [WGPUConstantEntryStruct], { optional: true }],
  ["targetCount", "u64", { lengthOf: "targets" }],
  ["targets", [WGPUColorTargetStateStruct]]
]);
var WGPURenderPipelineDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["layout", objectPtr(), { optional: true }],
  ["vertex", WGPUVertexStateStruct],
  ["primitive", WGPUPrimitiveStateStruct, { default: {} }],
  ["depthStencil", WGPUDepthStencilStateStruct, { optional: true, asPointer: true }],
  ["multisample", WGPUMultisampleStateStruct, { default: {} }],
  ["fragment", WGPUFragmentStateStruct, { optional: true, asPointer: true }]
]);
var WGPUComputeStateStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["module", objectPtr()],
  ["entryPoint", WGPUStringView, { optional: true, mapOptionalInline: true }],
  ["constantCount", "u64", { lengthOf: "constants" }],
  ["constants", [WGPUConstantEntryStruct], { optional: true }]
]);
var WGPUComputePipelineDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["layout", objectPtr(), { optional: true }],
  ["compute", WGPUComputeStateStruct]
]);
var WGPUCommandEncoderDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }]
]);
var WGPULoadOp = defineEnum({
  undefined: 0,
  load: 1,
  clear: 2,
  "expand-resolve-texture": 327683
}, "u32");
var WGPUStoreOp = defineEnum({
  undefined: 0,
  store: 1,
  discard: 2
}, "u32");
var WGPUColorStruct = defineStruct([
  ["r", "f64"],
  ["g", "f64"],
  ["b", "f64"],
  ["a", "f64"]
], {
  default: { r: 0, g: 0, b: 0, a: 0 },
  mapValue: (v) => {
    if (!v)
      return null;
    const clearValue = v ?? { r: 0, g: 0, b: 0, a: 0 };
    let mappedClearValue = { r: 0, g: 0, b: 0, a: 0 };
    if (typeof clearValue === "object" && "r" in clearValue) {
      mappedClearValue = clearValue;
    } else if (Array.isArray(clearValue)) {
      mappedClearValue = { r: clearValue[0], g: clearValue[1], b: clearValue[2], a: clearValue[3] };
    }
    return mappedClearValue;
  }
});
var WGPUOrigin3DStruct = defineStruct([
  ["x", "u32", { default: 0 }],
  ["y", "u32", { default: 0 }],
  ["z", "u32", { default: 0 }]
], {
  mapValue: (v) => {
    if (Symbol.iterator in v) {
      const arr = Array.from(v);
      return {
        x: arr[0] ?? 0,
        y: arr[1] ?? 0,
        z: arr[2] ?? 0
      };
    }
    return v;
  }
});
var WGPURenderPassColorAttachmentStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["view", objectPtr()],
  ["depthSlice", "u32", { default: 4294967295 }],
  ["resolveTarget", objectPtr(), { optional: true }],
  ["loadOp", WGPULoadOp],
  ["storeOp", WGPUStoreOp],
  ["clearValue", WGPUColorStruct, { default: { r: 0, g: 0, b: 0, a: 0 } }]
]);
var WGPURenderPassDepthStencilAttachmentStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["view", objectPtr()],
  ["depthLoadOp", WGPULoadOp, { optional: true }],
  ["depthStoreOp", WGPUStoreOp, { optional: true }],
  ["depthClearValue", "f32", { default: NaN }],
  ["depthReadOnly", WGPUBool, { default: false }],
  ["stencilLoadOp", WGPULoadOp, { optional: true }],
  ["stencilStoreOp", WGPUStoreOp, { optional: true }],
  ["stencilClearValue", "u32", { default: 0 }],
  ["stencilReadOnly", WGPUBool, { default: false }]
]);
var WGPUPassTimestampWritesStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["querySet", objectPtr()],
  ["beginningOfPassWriteIndex", "u32", { default: 4294967295 }],
  ["endOfPassWriteIndex", "u32", { default: 4294967295 }]
]);
var WGPURenderPassDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["colorAttachmentCount", "u64", { lengthOf: "colorAttachments" }],
  ["colorAttachments", [WGPURenderPassColorAttachmentStruct], { optional: true }],
  ["depthStencilAttachment", WGPURenderPassDepthStencilAttachmentStruct, { optional: true, asPointer: true }],
  ["occlusionQuerySet", objectPtr(), { optional: true }],
  ["timestampWrites", WGPUPassTimestampWritesStruct, { optional: true, asPointer: true }]
]);
var WGPUComputePassDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["timestampWrites", WGPUPassTimestampWritesStruct, { optional: true, asPointer: true }]
]);
var WGPUTexelCopyBufferLayoutStruct = defineStruct([
  ["offset", "u64", { default: 0 }],
  ["bytesPerRow", "u32", { default: 4294967295 }],
  ["rowsPerImage", "u32", { default: 4294967295 }]
]);
var WGPUTexelCopyBufferInfoStruct = defineStruct([
  ["layout", WGPUTexelCopyBufferLayoutStruct],
  ["buffer", objectPtr()]
], {
  mapValue: (v) => ({
    layout: {
      offset: v.offset ?? 0,
      bytesPerRow: v.bytesPerRow,
      rowsPerImage: v.rowsPerImage
    },
    buffer: v.buffer
  })
});
var WGPUTexelCopyTextureInfoStruct = defineStruct([
  ["texture", objectPtr()],
  ["mipLevel", "u32", { default: 0 }],
  ["origin", WGPUOrigin3DStruct, { default: { x: 0, y: 0, z: 0 } }],
  ["aspect", WGPUTextureAspect, { default: "all" }]
]);
var WGPUCommandBufferDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }]
]);
var WGPUQueryType = defineEnum({
  occlusion: 1,
  timestamp: 2
}, "u32");
var WGPUQuerySetDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["type", WGPUQueryType],
  ["count", "u32"]
]);
var ZWGPUWorkaroundCopyTextureAndMapStruct = defineStruct([
  ["device", "pointer"],
  ["queue", "pointer"],
  ["instance", "pointer"],
  ["render_texture", "pointer"],
  ["readback_buffer", "pointer"],
  ["bytes_per_row", "u32"],
  ["width", "u32"],
  ["height", "u32"],
  ["output_buffer", "pointer"],
  ["buffer_size", "u64"]
]);
var WGPURenderBundleDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }]
]);
var WGPURenderBundleEncoderDescriptorStruct = defineStruct([
  ["nextInChain", "pointer", { optional: true }],
  ["label", WGPUStringView, { optional: true }],
  ["colorFormatCount", "u64", { lengthOf: "colorFormats" }],
  ["colorFormats", [WGPUTextureFormat]],
  ["depthStencilFormat", WGPUTextureFormat, { default: "undefined" }],
  ["sampleCount", "u32", { default: 1 }],
  ["depthReadOnly", WGPUBool, { default: false }],
  ["stencilReadOnly", WGPUBool, { default: false }]
]);

// src/GPUQueue.ts
import { FFIType as FFIType2, JSCallback, ptr as ptr2 } from "bun:ffi";
var QueueWorkDoneStatus = {
  Success: 1,
  CallbackCancelled: 2,
  Error: 3,
  Force32: 2147483647
};

class GPUQueueImpl {
  ptr;
  lib;
  instanceTicker;
  __brand = "GPUQueue";
  label = "Main Device Queue";
  _onSubmittedWorkDoneCallback;
  _onSubmittedWorkDoneResolves = [];
  _onSubmittedWorkDoneRejects = [];
  constructor(ptr3, lib, instanceTicker) {
    this.ptr = ptr3;
    this.lib = lib;
    this.instanceTicker = instanceTicker;
    this._onSubmittedWorkDoneCallback = new JSCallback((status, _userdata1, _userdata2) => {
      this.instanceTicker.unregister();
      if (status === QueueWorkDoneStatus.Success) {
        this._onSubmittedWorkDoneResolves.forEach((r) => r(undefined));
      } else {
        const statusName = Object.keys(QueueWorkDoneStatus).find((key) => QueueWorkDoneStatus[key] === status) || "Unknown Status";
        const error = new Error(`Queue work done failed with status: ${statusName}(${status})`);
        this._onSubmittedWorkDoneRejects.forEach((r) => r(error));
      }
      this._onSubmittedWorkDoneResolves = [];
      this._onSubmittedWorkDoneRejects = [];
    }, {
      args: [FFIType2.u32, FFIType2.pointer, FFIType2.pointer],
      returns: FFIType2.void
    });
  }
  submit(commandBuffers) {
    const commandBuffersArray = Array.from(commandBuffers);
    if (!commandBuffersArray || commandBuffersArray.length === 0) {
      return;
    }
    const handleView = packObjectArray(commandBuffersArray);
    this.lib.wgpuQueueSubmit(this.ptr, commandBuffersArray.length, ptr2(handleView.buffer));
  }
  onSubmittedWorkDone() {
    return new Promise((resolve, reject) => {
      if (!this._onSubmittedWorkDoneCallback.ptr) {
        fatalError("Could not create queue done callback");
      }
      this._onSubmittedWorkDoneResolves.push(resolve);
      this._onSubmittedWorkDoneRejects.push(reject);
      const callbackInfo = WGPUCallbackInfoStruct.pack({
        mode: "AllowProcessEvents",
        callback: this._onSubmittedWorkDoneCallback.ptr
      });
      try {
        this.lib.wgpuQueueOnSubmittedWorkDone(this.ptr, ptr2(callbackInfo));
        this.instanceTicker.register();
      } catch (e) {
        reject(e);
      }
    });
  }
  writeBuffer(buffer, bufferOffset, data, dataOffset, size) {
    let arrayBuffer;
    let byteOffsetInData;
    let byteLengthInData;
    let bytesPerElement = 1;
    if (data instanceof ArrayBuffer) {
      arrayBuffer = data;
      byteOffsetInData = 0;
      byteLengthInData = data.byteLength;
      bytesPerElement = 1;
    } else if (ArrayBuffer.isView(data)) {
      if (!(data.buffer instanceof ArrayBuffer)) {
        fatalError("queueWriteBuffer: Data view's underlying buffer is not an ArrayBuffer.");
      }
      arrayBuffer = data.buffer;
      byteOffsetInData = data.byteOffset;
      byteLengthInData = data.byteLength;
      if ("BYTES_PER_ELEMENT" in data && typeof data.BYTES_PER_ELEMENT === "number") {
        bytesPerElement = data.BYTES_PER_ELEMENT;
      }
    } else {
      fatalError("queueWriteBuffer: Invalid data type. Must be ArrayBuffer or ArrayBufferView.");
    }
    const dataOffsetElements = dataOffset ?? 0;
    if (dataOffsetElements > Math.floor(byteLengthInData / bytesPerElement)) {
      fatalError("queueWriteBuffer: dataOffset is larger than data's element count.");
    }
    const dataOffsetBytes = dataOffsetElements * bytesPerElement;
    const finalDataOffset = byteOffsetInData + dataOffsetBytes;
    const remainingDataSize = byteLengthInData - dataOffsetBytes;
    let finalSize;
    if (size !== undefined) {
      if (size > Number.MAX_SAFE_INTEGER / bytesPerElement) {
        fatalError("queueWriteBuffer: size overflows.");
      }
      finalSize = size * bytesPerElement;
    } else {
      finalSize = remainingDataSize;
    }
    if (finalSize > remainingDataSize) {
      fatalError("queueWriteBuffer: size + dataOffset is larger than data's size.");
    }
    if (finalSize <= 0) {
      console.warn("queueWriteBuffer: Calculated dataSize is 0 or negative, nothing to write.");
      return;
    }
    if (finalSize % 4 !== 0) {
      fatalError("queueWriteBuffer: size is not a multiple of 4 bytes.");
    }
    const dataPtr = ptr2(arrayBuffer, finalDataOffset);
    try {
      this.lib.wgpuQueueWriteBuffer(this.ptr, buffer.ptr, BigInt(bufferOffset), dataPtr, BigInt(finalSize));
    } catch (e) {
      console.error("FFI Error: queueWriteBuffer", e);
    }
  }
  writeTexture(destination, data, dataLayout, writeSize) {
    if (!this.ptr) {
      fatalError("queueWriteTexture: Invalid queue pointer");
    }
    let arrayBuffer;
    let byteOffsetInData;
    let byteLengthInData;
    if (data instanceof ArrayBuffer) {
      arrayBuffer = data;
      byteOffsetInData = 0;
      byteLengthInData = data.byteLength;
    } else if (ArrayBuffer.isView(data)) {
      if (!(data.buffer instanceof ArrayBuffer)) {
        fatalError("queueWriteTexture: Data view's underlying buffer is not an ArrayBuffer.");
      }
      arrayBuffer = data.buffer;
      byteOffsetInData = data.byteOffset;
      byteLengthInData = data.byteLength;
    } else {
      fatalError("queueWriteTexture: Invalid data type. Must be ArrayBuffer or ArrayBufferView.");
    }
    if (byteLengthInData <= 0) {
      console.warn("queueWriteTexture: data size is 0 or negative, nothing to write.");
      return;
    }
    if (!dataLayout.bytesPerRow) {
      fatalError("queueWriteTexture: dataLayout.bytesPerRow is required.");
    }
    const normalizedWriteSize = normalizeGPUExtent3DStrict(writeSize);
    const packedDestination = WGPUTexelCopyTextureInfoStruct.pack(destination);
    const layoutForPacking = {
      offset: dataLayout.offset ?? 0,
      bytesPerRow: dataLayout.bytesPerRow,
      rowsPerImage: dataLayout.rowsPerImage ?? normalizedWriteSize.height
    };
    const packedLayout = WGPUTexelCopyBufferLayoutStruct.pack(layoutForPacking);
    const packedWriteSize = WGPUExtent3DStruct.pack(normalizedWriteSize);
    const dataPtr = ptr2(arrayBuffer, byteOffsetInData);
    try {
      this.lib.wgpuQueueWriteTexture(this.ptr, ptr2(packedDestination), dataPtr, BigInt(byteLengthInData), ptr2(packedLayout), ptr2(packedWriteSize));
    } catch (e) {
      console.error("FFI Error: queueWriteTexture", e);
    }
  }
  copyBufferToBuffer(source, destination, size) {
    fatalError("copyBufferToBuffer not implemented", this.ptr, source, destination, size);
  }
  copyBufferToTexture(source, destination, size) {
    fatalError("copyBufferToTexture not implemented", this.ptr, source, destination, size);
  }
  copyExternalImageToTexture(source, destination, copySize) {
    fatalError("copyExternalImageToTexture not implemented", this.ptr, source, destination, copySize);
  }
  destroy() {
    this._onSubmittedWorkDoneCallback.close();
    this.lib.wgpuQueueRelease(this.ptr);
  }
}

// src/GPUCommandEncoder.ts
import { ptr as ptr6 } from "bun:ffi";

// src/GPUComputePassEncoder.ts
import { ptr as ptr3 } from "bun:ffi";
class GPUComputePassEncoderImpl {
  ptr;
  __brand = "GPUComputePassEncoder";
  lib;
  label = "";
  constructor(ptr4, lib) {
    this.ptr = ptr4;
    this.lib = lib;
  }
  setPipeline(pipeline) {
    if (!pipeline || !pipeline.ptr) {
      console.warn("ComputePassEncoder.setPipeline: null pipeline pointer.");
      return;
    }
    this.lib.wgpuComputePassEncoderSetPipeline(this.ptr, pipeline.ptr);
  }
  setBindGroup(groupIndex, bindGroup, dynamicOffsets) {
    if (!bindGroup || !bindGroup.ptr) {
      console.warn("ComputePassEncoder.setBindGroup: null bindGroup pointer.");
      return;
    }
    let offsetsBuffer;
    let offsetCount = 0;
    let offsetPtr = null;
    if (dynamicOffsets) {
      if (dynamicOffsets instanceof Uint32Array) {
        offsetsBuffer = dynamicOffsets;
      } else {
        offsetsBuffer = new Uint32Array(dynamicOffsets);
      }
      offsetCount = offsetsBuffer.length;
      if (offsetCount > 0) {
        offsetPtr = ptr3(offsetsBuffer.buffer, offsetsBuffer.byteOffset);
      }
    }
    try {
      this.lib.wgpuComputePassEncoderSetBindGroup(this.ptr, groupIndex, bindGroup.ptr, BigInt(offsetCount), offsetPtr);
    } catch (e) {
      console.error("FFI Error: computePassEncoderSetBindGroup", e);
    }
  }
  dispatchWorkgroups(workgroupCountX, workgroupCountY = 1, workgroupCountZ = 1) {
    if (!this.ptr) {
      console.warn("ComputePassEncoder.dispatchWorkgroups: null encoder pointer.");
      return;
    }
    try {
      this.lib.wgpuComputePassEncoderDispatchWorkgroups(this.ptr, workgroupCountX, workgroupCountY, workgroupCountZ);
    } catch (e) {
      console.error("FFI Error: computePassEncoderDispatchWorkgroups", e);
    }
  }
  dispatchWorkgroupsIndirect(indirectBuffer, indirectOffset) {
    if (!indirectBuffer || !indirectBuffer.ptr) {
      console.warn("ComputePassEncoder.dispatchWorkgroupsIndirect: null buffer pointer.");
      return;
    }
    try {
      this.lib.wgpuComputePassEncoderDispatchWorkgroupsIndirect(this.ptr, indirectBuffer.ptr, BigInt(indirectOffset));
    } catch (e) {
      console.error("FFI Error: computePassEncoderDispatchWorkgroupsIndirect", e);
    }
  }
  end() {
    this.lib.wgpuComputePassEncoderEnd(this.ptr);
  }
  pushDebugGroup(message) {
    const packedMessage = WGPUStringView.pack(message);
    this.lib.wgpuComputePassEncoderPushDebugGroup(this.ptr, ptr3(packedMessage));
  }
  popDebugGroup() {
    this.lib.wgpuComputePassEncoderPopDebugGroup(this.ptr);
  }
  insertDebugMarker(markerLabel) {
    const packedMarker = WGPUStringView.pack(markerLabel);
    this.lib.wgpuComputePassEncoderInsertDebugMarker(this.ptr, ptr3(packedMarker));
  }
  destroy() {
    console.error("destroy", this.ptr);
    throw new Error("Not implemented");
  }
}

// src/GPURenderPassEncoder.ts
import { ptr as ptr4 } from "bun:ffi";
class GPURenderPassEncoderImpl {
  ptr;
  __brand = "GPURenderPassEncoder";
  label = "";
  lib;
  constructor(ptr5, lib) {
    this.ptr = ptr5;
    this.lib = lib;
  }
  setBlendConstant(color) {
    const packedColor = WGPUColorStruct.pack(color);
    this.lib.wgpuRenderPassEncoderSetBlendConstant(this.ptr, ptr4(packedColor));
    return;
  }
  setStencilReference(reference) {
    this.lib.wgpuRenderPassEncoderSetStencilReference(this.ptr, reference);
    return;
  }
  beginOcclusionQuery(queryIndex) {
    this.lib.wgpuRenderPassEncoderBeginOcclusionQuery(this.ptr, queryIndex);
    return;
  }
  endOcclusionQuery() {
    this.lib.wgpuRenderPassEncoderEndOcclusionQuery(this.ptr);
    return;
  }
  executeBundles(bundles) {
    const bundleArray = Array.from(bundles);
    const bundlePtrs = bundleArray.map((b) => b.ptr);
    const bundlesBuffer = new BigUint64Array(bundlePtrs.map((p) => BigInt(p)));
    this.lib.wgpuRenderPassEncoderExecuteBundles(this.ptr, BigInt(bundleArray.length), ptr4(bundlesBuffer));
    return;
  }
  setPipeline(pipeline) {
    this.lib.wgpuRenderPassEncoderSetPipeline(this.ptr, pipeline.ptr);
  }
  setBindGroup(index, bindGroup, dynamicOffsets) {
    if (!bindGroup) {
      console.warn("RenderPassEncoder.setBindGroup: null bindGroup pointer.");
      return;
    }
    let offsetsBuffer;
    let offsetCount = 0;
    let offsetPtr = null;
    if (dynamicOffsets) {
      if (dynamicOffsets instanceof Uint32Array) {
        offsetsBuffer = dynamicOffsets;
      } else {
        offsetsBuffer = new Uint32Array(dynamicOffsets);
      }
      offsetCount = offsetsBuffer.length;
      if (offsetCount > 0) {
        offsetPtr = ptr4(offsetsBuffer.buffer, offsetsBuffer.byteOffset);
      }
    }
    try {
      this.lib.wgpuRenderPassEncoderSetBindGroup(this.ptr, index, bindGroup.ptr, BigInt(offsetCount), offsetPtr);
    } catch (e) {
      console.error("FFI Error: renderPassEncoderSetBindGroup", e);
    }
  }
  setVertexBuffer(slot, buffer, offset = 0, size) {
    if (!buffer) {
      console.warn("RenderPassEncoder.setVertexBuffer: null buffer pointer.");
      return;
    }
    const bufferSize = size ?? WGPU_WHOLE_SIZE;
    this.lib.wgpuRenderPassEncoderSetVertexBuffer(this.ptr, slot, buffer.ptr, BigInt(offset), BigInt(bufferSize));
  }
  setIndexBuffer(buffer, format, offset = 0, size) {
    if (!buffer) {
      console.warn("RenderPassEncoder.setIndexBuffer: null buffer pointer.");
      return;
    }
    const formatValue = WGPUIndexFormat.to(format);
    const bufferSize = size ?? WGPU_WHOLE_SIZE;
    this.lib.wgpuRenderPassEncoderSetIndexBuffer(this.ptr, buffer.ptr, formatValue, BigInt(offset), BigInt(bufferSize));
  }
  setViewport(x, y, width, height, minDepth, maxDepth) {
    this.lib.wgpuRenderPassEncoderSetViewport(this.ptr, x, y, width, height, minDepth, maxDepth);
  }
  setScissorRect(x, y, width, height) {
    const ux = Math.max(0, Math.floor(x));
    const uy = Math.max(0, Math.floor(y));
    const uwidth = Math.max(0, Math.floor(width));
    const uheight = Math.max(0, Math.floor(height));
    this.lib.wgpuRenderPassEncoderSetScissorRect(this.ptr, ux, uy, uwidth, uheight);
  }
  draw(vertexCount, instanceCount = 1, firstVertex = 0, firstInstance = 0) {
    if (!this.ptr) {
      console.warn("RenderPassEncoder.draw: null encoder pointer.");
      return;
    }
    this.lib.wgpuRenderPassEncoderDraw(this.ptr, vertexCount, instanceCount, firstVertex, firstInstance);
  }
  drawIndexed(indexCount, instanceCount = 1, firstIndex = 0, baseVertex = 0, firstInstance = 0) {
    if (!this.ptr) {
      console.warn("RenderPassEncoder.drawIndexed: null encoder pointer.");
      return;
    }
    this.lib.wgpuRenderPassEncoderDrawIndexed(this.ptr, indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
  }
  drawIndirect(indirectBuffer, indirectOffset) {
    this.lib.wgpuRenderPassEncoderDrawIndirect(this.ptr, indirectBuffer.ptr, BigInt(indirectOffset));
  }
  drawIndexedIndirect(indirectBuffer, indirectOffset) {
    this.lib.wgpuRenderPassEncoderDrawIndexedIndirect(this.ptr, indirectBuffer.ptr, BigInt(indirectOffset));
    return;
  }
  end() {
    this.lib.wgpuRenderPassEncoderEnd(this.ptr);
  }
  pushDebugGroup(message) {
    const packedMessage = WGPUStringView.pack(message);
    this.lib.wgpuRenderPassEncoderPushDebugGroup(this.ptr, ptr4(packedMessage));
  }
  popDebugGroup() {
    this.lib.wgpuRenderPassEncoderPopDebugGroup(this.ptr);
  }
  insertDebugMarker(markerLabel) {
    const packedMarker = WGPUStringView.pack(markerLabel);
    this.lib.wgpuRenderPassEncoderInsertDebugMarker(this.ptr, ptr4(packedMarker));
  }
  destroy() {
    try {
      this.lib.wgpuRenderPassEncoderRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: renderPassEncoderRelease", e);
    }
  }
}

// src/GPUCommandBuffer.ts
class GPUCommandBufferImpl {
  bufferPtr;
  lib;
  __brand = "GPUCommandBuffer";
  label = "Unnamed Command Buffer";
  ptr;
  constructor(bufferPtr, lib, label) {
    this.bufferPtr = bufferPtr;
    this.lib = lib;
    this.ptr = bufferPtr;
    this.label = label || "Unnamed Command Buffer";
  }
  _destroy() {
    try {
      this.lib.wgpuCommandBufferRelease(this.bufferPtr);
    } catch (e) {
      console.error("FFI Error: commandBufferRelease", e);
    }
  }
}

// src/GPUBuffer.ts
import { FFIType as FFIType3, JSCallback as JSCallback2, ptr as ptr5, toArrayBuffer as toArrayBuffer4 } from "bun:ffi";

// src/common.ts
var TextureUsageFlags = {
  COPY_SRC: 1 << 0,
  COPY_DST: 1 << 1,
  TEXTURE_BINDING: 1 << 2,
  STORAGE_BINDING: 1 << 3,
  RENDER_ATTACHMENT: 1 << 4,
  TRANSIENT_ATTACHMENT: 1 << 5
};
var BufferUsageFlags = {
  MAP_READ: 1 << 0,
  MAP_WRITE: 1 << 1,
  COPY_SRC: 1 << 2,
  COPY_DST: 1 << 3,
  INDEX: 1 << 4,
  VERTEX: 1 << 5,
  UNIFORM: 1 << 6,
  STORAGE: 1 << 7,
  INDIRECT: 1 << 8,
  QUERY_RESOLVE: 1 << 9
};
var ShaderStageFlags = {
  VERTEX: 1 << 0,
  FRAGMENT: 1 << 1,
  COMPUTE: 1 << 2
};
var MapModeFlags = {
  READ: 1 << 0,
  WRITE: 1 << 1
};

// src/GPUBuffer.ts
import { EventEmitter } from "events";

class GPUBufferImpl extends EventEmitter {
  bufferPtr;
  device;
  lib;
  instanceTicker;
  _size;
  _descriptor;
  _mapState = "unmapped";
  _pendingMap = null;
  _mapCallback;
  _mapCallbackPromiseData = null;
  _destroyed = false;
  _mappedOffset = 0;
  _mappedSize = 0;
  _returnedRanges = [];
  _detachableArrayBuffers = [];
  __brand = "GPUBuffer";
  label = "";
  ptr;
  constructor(bufferPtr, device, lib, descriptor, instanceTicker) {
    super();
    this.bufferPtr = bufferPtr;
    this.device = device;
    this.lib = lib;
    this.instanceTicker = instanceTicker;
    this.ptr = bufferPtr;
    this._size = descriptor.size;
    this._descriptor = descriptor;
    this._mapState = descriptor.mappedAtCreation ? "mapped" : "unmapped";
    if (descriptor.mappedAtCreation) {
      this._mappedOffset = 0;
      this._mappedSize = this._size;
    }
    this._mapCallback = new JSCallback2((status, messagePtr, messageSize, userdata1, _userdata2) => {
      this.instanceTicker.unregister();
      this._pendingMap = null;
      const message = decodeCallbackMessage(messagePtr, process.platform === "win32" ? undefined : messageSize);
      let actualUserData;
      if (process.platform === "win32") {
        actualUserData = Number(messageSize);
      } else {
        actualUserData = userdata1;
      }
      const userData = unpackUserDataId(actualUserData);
      if (status === AsyncStatus.Success) {
        this._mapState = "mapped";
        this._returnedRanges = [];
        this._detachableArrayBuffers = [];
        this._mapCallbackPromiseData?.resolve(undefined);
      } else {
        const statusName = Object.keys(AsyncStatus).find((key) => AsyncStatus[key] === status) || "Unknown Map Error";
        const errorMessage = `WGPU Buffer Map Error (${statusName}): ${message}`;
        const wasAlreadyMapped = userData === 1;
        const wasPending = this._mapState === "pending";
        this._mapState = wasAlreadyMapped ? "mapped" : "unmapped";
        switch (status) {
          case AsyncStatus.Error:
            if (wasPending) {
              this._mapCallbackPromiseData?.reject(new OperationError(errorMessage));
            } else {
              this._mapCallbackPromiseData?.reject(new AbortError(errorMessage));
            }
            break;
          default:
            this._mapCallbackPromiseData?.reject(new AbortError(errorMessage));
        }
      }
      this._mapCallbackPromiseData = null;
      if (this._destroyed) {
        this._mapCallback.close();
      }
    }, {
      args: [FFIType3.u32, FFIType3.pointer, FFIType3.u64, FFIType3.pointer, FFIType3.pointer],
      returns: FFIType3.void
    });
  }
  _checkRangeOverlap(newOffset, newSize) {
    const newEnd = newOffset + newSize;
    for (const range of this._returnedRanges) {
      const rangeEnd = range.offset + range.size;
      const disjoint = newOffset >= rangeEnd || range.offset >= newEnd;
      if (!disjoint) {
        return true;
      }
    }
    return false;
  }
  _createDetachableArrayBuffer(actualArrayBuffer) {
    this._detachableArrayBuffers.push(actualArrayBuffer);
    return actualArrayBuffer;
  }
  get size() {
    return this._size;
  }
  get usage() {
    return this._descriptor.usage;
  }
  get mapState() {
    return this._mapState;
  }
  mapAsync(mode, offset, size) {
    if (this._destroyed) {
      this.device.injectError("validation", "Buffer is destroyed");
      return new Promise((_, reject) => {
        process.nextTick(() => {
          reject(new OperationError("Buffer is destroyed"));
        });
      });
    }
    if (this._pendingMap) {
      return Promise.reject(new OperationError("Buffer mapping is already pending"));
    }
    const originalMapState = this._mapState;
    this._mapState = "pending";
    this._pendingMap = new Promise((resolve, reject) => {
      const mapOffsetValue = offset ?? 0;
      const mapSizeValue = size ?? this._size - mapOffsetValue;
      const mapOffset = BigInt(mapOffsetValue);
      const mapSize = BigInt(mapSizeValue);
      const userDataBuffer = packUserDataId(originalMapState === "mapped" ? 1 : 0);
      const userDataPtr = ptr5(userDataBuffer);
      this._mapCallbackPromiseData = {
        resolve,
        reject
      };
      if (!this._mapCallback.ptr) {
        fatalError("Could not create buffer map callback");
      }
      const callbackInfo = WGPUCallbackInfoStruct.pack({
        mode: "AllowProcessEvents",
        callback: this._mapCallback.ptr,
        userdata1: userDataPtr
      });
      try {
        this.lib.wgpuBufferMapAsync(this.bufferPtr, mode, mapOffset, mapSize, ptr5(callbackInfo));
        this._mappedOffset = mapOffsetValue;
        this._mappedSize = mapSizeValue;
        this.instanceTicker.register();
      } catch (e) {
        this._pendingMap = null;
        this._mapState = "unmapped";
        this.instanceTicker.unregister();
        reject(e);
      }
    });
    return this._pendingMap;
  }
  _validateAlignment(offset, size) {
    const kOffsetAlignment = 8;
    const kSizeAlignment = 4;
    if (offset % kOffsetAlignment !== 0) {
      throw new OperationError(`offset (${offset}) is not aligned to ${kOffsetAlignment} bytes.`);
    }
    if (size % kSizeAlignment !== 0) {
      throw new OperationError(`size (${size}) is not aligned to ${kSizeAlignment} bytes.`);
    }
  }
  getMappedRangePtr(offset, size) {
    if (this._destroyed) {
      throw new OperationError("Buffer is destroyed");
    }
    const mappedOffset = offset ?? 0;
    const mappedSize = size ?? this._size - mappedOffset;
    this._validateAlignment(mappedOffset, mappedSize);
    if (this._checkRangeOverlap(mappedOffset, mappedSize)) {
      throw new OperationError("getMappedRangePtr: Requested range overlaps with an existing range.");
    }
    this._returnedRanges.push({ offset: mappedOffset, size: mappedSize });
    if (this._descriptor.usage & BufferUsageFlags.MAP_READ) {
      return this._getConstMappedRangePtr(mappedOffset, mappedSize);
    }
    const readOffset = BigInt(mappedOffset);
    const readSize = BigInt(mappedSize);
    const dataPtr = this.lib.wgpuBufferGetMappedRange(this.bufferPtr, readOffset, readSize);
    if (dataPtr === null || dataPtr.valueOf() === 0) {
      throw new OperationError("getMappedRangePtr: Received null pointer (buffer likely not mapped or range invalid).");
    }
    return dataPtr;
  }
  _getConstMappedRangePtr(offset, size) {
    const readOffset = BigInt(offset);
    const readSize = BigInt(size);
    const dataPtr = this.lib.wgpuBufferGetConstMappedRange(this.bufferPtr, readOffset, readSize);
    if (dataPtr === null || dataPtr.valueOf() === 0) {
      throw new OperationError("getConstMappedRangePtr: Received null pointer (buffer likely not mapped or range invalid).");
    }
    return dataPtr;
  }
  getMappedRange(offset, size) {
    if (this._destroyed) {
      throw new OperationError("Buffer is destroyed");
    }
    if (this._mapState !== "mapped") {
      throw new OperationError("getMappedRange: Buffer is not in mapped state.");
    }
    const requestedOffset = offset ?? 0;
    const requestedSize = size ?? this._size - requestedOffset;
    this._validateAlignment(requestedOffset, requestedSize);
    if (requestedOffset < this._mappedOffset || requestedOffset > this._size || requestedOffset + requestedSize > this._mappedOffset + this._mappedSize) {
      throw new OperationError("getMappedRange: Requested range is outside the mapped region.");
    }
    if (this._checkRangeOverlap(requestedOffset, requestedSize)) {
      throw new OperationError("getMappedRange: Requested range overlaps with an existing range.");
    }
    this._returnedRanges.push({ offset: requestedOffset, size: requestedSize });
    if (requestedSize === 0) {
      return new ArrayBuffer(0);
    }
    if (this._descriptor.usage & BufferUsageFlags.MAP_READ) {
      const actualArrayBuffer2 = this._getConstMappedRange(requestedOffset, requestedSize);
      return this._createDetachableArrayBuffer(actualArrayBuffer2);
    }
    const readOffset = BigInt(requestedOffset);
    const readSize = BigInt(requestedSize);
    const dataPtr = this.lib.wgpuBufferGetMappedRange(this.bufferPtr, readOffset, readSize);
    if (dataPtr === null || dataPtr.valueOf() === 0) {
      throw new OperationError("getMappedRange: Received null pointer (buffer likely not mapped or range invalid).");
    }
    const actualArrayBuffer = toArrayBuffer4(dataPtr, 0, Number(readSize));
    return this._createDetachableArrayBuffer(actualArrayBuffer);
  }
  _getConstMappedRange(offset, size) {
    const readOffset = BigInt(offset);
    const readSize = BigInt(size);
    const dataPtr = this.lib.wgpuBufferGetConstMappedRange(this.bufferPtr, readOffset, readSize);
    if (dataPtr === null || dataPtr.valueOf() === 0) {
      throw new OperationError("getConstMappedRange: Received null pointer (buffer likely not mapped or range invalid).");
    }
    return toArrayBuffer4(dataPtr, 0, Number(readSize));
  }
  _detachBuffers() {
    for (const buffer of this._detachableArrayBuffers) {
      structuredClone(buffer, { transfer: [buffer] });
    }
    this._detachableArrayBuffers = [];
  }
  unmap() {
    this._detachBuffers();
    this.lib.wgpuBufferUnmap(this.bufferPtr);
    this._mapState = "unmapped";
    this._mappedOffset = 0;
    this._mappedSize = 0;
    this._returnedRanges = [];
    this.instanceTicker.processEvents();
    return;
  }
  release() {
    if (this._destroyed) {
      throw new Error("Buffer is destroyed");
    }
    try {
      this.lib.wgpuBufferRelease(this.bufferPtr);
    } catch (e) {
      console.error("FFI Error: wgpuBufferRelease", e);
    }
  }
  destroy() {
    if (this._destroyed) {
      return;
    }
    this._detachBuffers();
    try {
      this.lib.wgpuBufferDestroy(this.bufferPtr);
      this._destroyed = true;
      this.emit("destroyed");
      this._mapState = "unmapped";
    } catch (e) {
      console.error("Error calling bufferDestroy FFI function:", e);
    }
  }
}

// src/GPUCommandEncoder.ts
class GPUCommandEncoderImpl {
  encoderPtr;
  lib;
  __brand = "GPUCommandEncoder";
  label = "Main Command Encoder";
  ptr;
  _destroyed = false;
  constructor(encoderPtr, lib) {
    this.encoderPtr = encoderPtr;
    this.lib = lib;
    this.ptr = encoderPtr;
  }
  beginRenderPass(descriptor) {
    if (this._destroyed) {
      fatalError("Cannot call beginRenderPass on destroyed command encoder");
    }
    const colorAttachments = Array.from(descriptor.colorAttachments ?? []).filter((ca) => !!ca);
    const packedDescriptorBuffer = WGPURenderPassDescriptorStruct.pack({
      ...descriptor,
      colorAttachments
    });
    const passEncoderPtr = this.lib.wgpuCommandEncoderBeginRenderPass(this.encoderPtr, ptr6(packedDescriptorBuffer));
    if (!passEncoderPtr) {
      fatalError("wgpuCommandEncoderBeginRenderPass returned null.");
    }
    return new GPURenderPassEncoderImpl(passEncoderPtr, this.lib);
  }
  beginComputePass(descriptor = {}) {
    if (this._destroyed) {
      fatalError("Cannot call beginComputePass on destroyed command encoder");
    }
    const packedDescriptorBuffer = WGPUComputePassDescriptorStruct.pack(descriptor);
    const passEncoderPtr = this.lib.wgpuCommandEncoderBeginComputePass(this.encoderPtr, ptr6(packedDescriptorBuffer));
    if (!passEncoderPtr) {
      fatalError("wgpuCommandEncoderBeginComputePass returned null.");
    }
    return new GPUComputePassEncoderImpl(passEncoderPtr, this.lib);
  }
  copyBufferToBuffer(source, arg2, arg3, arg4, arg5) {
    if (this._destroyed) {
      fatalError("Cannot call copyBufferToBuffer on destroyed command encoder");
    }
    let sourceOffset = 0;
    let destination;
    let destinationOffset = 0;
    let size;
    if (typeof arg2 === "number") {
      sourceOffset = arg2;
      destination = arg3;
      destinationOffset = arg4 ?? 0;
      size = BigInt(arg5 ?? UINT64_MAX);
    } else {
      if (!(arg2 instanceof GPUBufferImpl)) {
        fatalError("Invalid arguments for copyBufferToBuffer (expected destination buffer)");
      }
      destination = arg2;
      if (typeof arg3 !== "number") {
        fatalError("Invalid arguments for copyBufferToBuffer (expected size)");
      }
      size = BigInt(arg3);
    }
    try {
      this.lib.wgpuCommandEncoderCopyBufferToBuffer(this.encoderPtr, source.ptr, BigInt(sourceOffset), destination.ptr, BigInt(destinationOffset), BigInt(size));
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderCopyBufferToBuffer", e);
    }
    return;
  }
  copyBufferToTexture(source, destination, copySize) {
    if (this._destroyed) {
      fatalError("Cannot call copyBufferToTexture on destroyed command encoder");
    }
    const packedSourceBuffer = WGPUTexelCopyBufferInfoStruct.pack(source);
    const packedDestinationBuffer = WGPUTexelCopyTextureInfoStruct.pack(destination);
    const packedCopySizeBuffer = WGPUExtent3DStruct.pack(copySize);
    try {
      this.lib.wgpuCommandEncoderCopyBufferToTexture(this.encoderPtr, ptr6(packedSourceBuffer), ptr6(packedDestinationBuffer), ptr6(packedCopySizeBuffer));
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderCopyBufferToTexture", e);
    }
  }
  copyTextureToBuffer(source, destination, copySize) {
    if (this._destroyed) {
      fatalError("Cannot call copyTextureToBuffer on destroyed command encoder");
    }
    const packedSourceBuffer = WGPUTexelCopyTextureInfoStruct.pack(source);
    const packedDestinationBuffer = WGPUTexelCopyBufferInfoStruct.pack(destination);
    const packedCopySizeBuffer = WGPUExtent3DStruct.pack(copySize);
    try {
      this.lib.wgpuCommandEncoderCopyTextureToBuffer(this.encoderPtr, ptr6(packedSourceBuffer), ptr6(packedDestinationBuffer), ptr6(packedCopySizeBuffer));
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderCopyTextureToBuffer", e);
    }
  }
  copyTextureToTexture(source, destination, copySize) {
    if (this._destroyed) {
      fatalError("Cannot call copyTextureToTexture on destroyed command encoder");
    }
    const packedSourceBuffer = WGPUTexelCopyTextureInfoStruct.pack(source);
    const packedDestinationBuffer = WGPUTexelCopyTextureInfoStruct.pack(destination);
    const packedCopySizeBuffer = WGPUExtent3DStruct.pack(copySize);
    try {
      this.lib.wgpuCommandEncoderCopyTextureToTexture(this.encoderPtr, ptr6(packedSourceBuffer), ptr6(packedDestinationBuffer), ptr6(packedCopySizeBuffer));
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderCopyTextureToTexture", e);
    }
  }
  clearBuffer(buffer, offset, size) {
    if (this._destroyed) {
      fatalError("Cannot call clearBuffer on destroyed command encoder");
    }
    const offsetBigInt = offset !== undefined ? BigInt(offset) : 0n;
    const sizeBigInt = size !== undefined ? BigInt(size) : UINT64_MAX;
    try {
      this.lib.wgpuCommandEncoderClearBuffer(this.encoderPtr, buffer.ptr, offsetBigInt, sizeBigInt);
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderClearBuffer", e);
    }
  }
  resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset) {
    if (this._destroyed) {
      fatalError("Cannot call resolveQuerySet on destroyed command encoder");
    }
    this.lib.wgpuCommandEncoderResolveQuerySet(this.encoderPtr, querySet.ptr, firstQuery, queryCount, destination.ptr, BigInt(destinationOffset));
    return;
  }
  finish(descriptor) {
    if (this._destroyed) {
      fatalError("Cannot call finish on destroyed command encoder");
    }
    const packedDescriptorBuffer = WGPUCommandBufferDescriptorStruct.pack(descriptor ?? {});
    const commandBufferPtr = this.lib.wgpuCommandEncoderFinish(this.encoderPtr, ptr6(packedDescriptorBuffer));
    if (!commandBufferPtr) {
      fatalError("wgpuCommandEncoderFinish returned null.");
    }
    this._destroy();
    return new GPUCommandBufferImpl(commandBufferPtr, this.lib, descriptor?.label);
  }
  pushDebugGroup(message) {
    if (this._destroyed)
      return;
    const packedMessage = WGPUStringView.pack(message);
    this.lib.wgpuCommandEncoderPushDebugGroup(this.encoderPtr, ptr6(packedMessage));
  }
  popDebugGroup() {
    if (this._destroyed)
      return;
    this.lib.wgpuCommandEncoderPopDebugGroup(this.encoderPtr);
  }
  insertDebugMarker(markerLabel) {
    if (this._destroyed)
      return;
    const packedMarker = WGPUStringView.pack(markerLabel);
    this.lib.wgpuCommandEncoderInsertDebugMarker(this.encoderPtr, ptr6(packedMarker));
  }
  _destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    try {
      this.lib.wgpuCommandEncoderRelease(this.encoderPtr);
    } catch (e) {
      console.error("FFI Error: wgpuCommandEncoderRelease", e);
    }
  }
}

// src/GPUTexture.ts
import { ptr as ptr7 } from "bun:ffi";

// src/GPUTextureView.ts
class GPUTextureViewImpl {
  viewPtr;
  lib;
  __brand = "GPUTextureView";
  label = "";
  ptr;
  constructor(viewPtr, lib, label) {
    this.viewPtr = viewPtr;
    this.lib = lib;
    this.ptr = viewPtr;
    if (label)
      this.label = label;
  }
  destroy() {
    try {
      this.lib.wgpuTextureViewRelease(this.viewPtr);
    } catch (e) {
      console.error("FFI Error: textureViewRelease", e);
    }
    return;
  }
}

// src/GPUTexture.ts
class GPUTextureImpl {
  texturePtr;
  lib;
  _width;
  _height;
  _depthOrArrayLayers;
  _format;
  _dimension;
  _mipLevelCount;
  _sampleCount;
  _usage;
  __brand = "GPUTexture";
  label = "";
  ptr;
  constructor(texturePtr, lib, _width, _height, _depthOrArrayLayers, _format, _dimension, _mipLevelCount, _sampleCount, _usage) {
    this.texturePtr = texturePtr;
    this.lib = lib;
    this._width = _width;
    this._height = _height;
    this._depthOrArrayLayers = _depthOrArrayLayers;
    this._format = _format;
    this._dimension = _dimension;
    this._mipLevelCount = _mipLevelCount;
    this._sampleCount = _sampleCount;
    this._usage = _usage;
    this.ptr = texturePtr;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get depthOrArrayLayers() {
    return this._depthOrArrayLayers;
  }
  get format() {
    return this._format;
  }
  get dimension() {
    return this._dimension;
  }
  get mipLevelCount() {
    return this._mipLevelCount;
  }
  get sampleCount() {
    return this._sampleCount;
  }
  get usage() {
    return this._usage;
  }
  createView(descriptor) {
    const label = descriptor?.label || `View of ${this.label || "Texture_" + this.texturePtr}`;
    const mergedDescriptor = {
      ...descriptor,
      label
    };
    if (descriptor?.arrayLayerCount !== undefined) {
      mergedDescriptor.arrayLayerCount = descriptor.arrayLayerCount;
    } else if (this.dimension === "3d") {
      mergedDescriptor.arrayLayerCount = 1;
    }
    const packedDescriptorBuffer = WGPUTextureViewDescriptorStruct.pack(mergedDescriptor);
    const viewPtr = this.lib.wgpuTextureCreateView(this.texturePtr, ptr7(packedDescriptorBuffer));
    if (!viewPtr) {
      fatalError("Failed to create texture view");
    }
    return new GPUTextureViewImpl(viewPtr, this.lib, label);
  }
  destroy() {
    try {
      this.lib.wgpuTextureDestroy(this.texturePtr);
    } catch (e) {
      console.error("FFI Error: textureRelease", e);
    }
    return;
  }
}

// src/GPUSampler.ts
class GPUSamplerImpl {
  samplerPtr;
  lib;
  __brand = "GPUSampler";
  label = "";
  ptr;
  constructor(samplerPtr, lib, label) {
    this.samplerPtr = samplerPtr;
    this.lib = lib;
    this.ptr = samplerPtr;
    if (label)
      this.label = label;
  }
  destroy() {
    try {
      this.lib.wgpuSamplerRelease(this.samplerPtr);
    } catch (e) {
      console.error("FFI Error: samplerRelease", e);
    }
    return;
  }
}

// src/GPUBindGroup.ts
class GPUBindGroupImpl {
  __brand = "GPUBindGroup";
  label;
  ptr;
  lib;
  constructor(ptr8, lib, label) {
    this.ptr = ptr8;
    this.lib = lib;
    this.label = label || "";
  }
  destroy() {
    try {
      this.lib.wgpuBindGroupRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: bindGroupRelease", e);
    }
  }
}

// src/GPUBindGroupLayout.ts
class GPUBindGroupLayoutImpl {
  __brand = "GPUBindGroupLayout";
  label;
  ptr;
  lib;
  constructor(ptr8, lib, label) {
    this.ptr = ptr8;
    this.lib = lib;
    this.label = label || "";
  }
  destroy() {
    try {
      this.lib.wgpuBindGroupLayoutRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: bindGroupLayoutRelease", e);
    }
  }
}

// src/GPUQuerySet.ts
class GPUQuerySetImpl {
  ptr;
  lib;
  type;
  count;
  __brand = "GPUQuerySet";
  label;
  constructor(ptr8, lib, type, count, label) {
    this.ptr = ptr8;
    this.lib = lib;
    this.type = type;
    this.count = count;
    this.label = label || "";
  }
  destroy() {
    this.lib.wgpuQuerySetDestroy(this.ptr);
  }
}

// src/GPUShaderModule.ts
class GPUShaderModuleImpl {
  ptr;
  lib;
  label;
  __brand = "GPUShaderModule";
  constructor(ptr8, lib, label) {
    this.ptr = ptr8;
    this.lib = lib;
    this.label = label;
    this.label = label || "";
  }
  getCompilationInfo() {
    return fatalError("getCompilationInfo not implemented");
  }
  destroy() {
    try {
      this.lib.wgpuShaderModuleRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: shaderModuleRelease", e);
    }
  }
}

// src/GPUPipelineLayout.ts
class GPUPipelineLayoutImpl {
  lib;
  __brand = "GPUPipelineLayout";
  label;
  ptr;
  constructor(ptr8, lib, label) {
    this.lib = lib;
    this.ptr = ptr8;
    this.label = label || "";
  }
  destroy() {
    try {
      this.lib.wgpuPipelineLayoutRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: pipelineLayoutRelease", e);
    }
    return;
  }
}

// src/GPUComputePipeline.ts
class GPUComputePipelineImpl {
  lib;
  __brand = "GPUComputePipeline";
  label;
  ptr;
  constructor(ptr8, lib, label) {
    this.lib = lib;
    this.ptr = ptr8;
    this.label = label || "";
  }
  getBindGroupLayout(index) {
    const bindGroupLayoutPtr = this.lib.wgpuComputePipelineGetBindGroupLayout(this.ptr, index);
    if (!bindGroupLayoutPtr) {
      throw new Error(`Failed to get bind group layout for index ${index}. Pointer is null.`);
    }
    return new GPUBindGroupLayoutImpl(bindGroupLayoutPtr, this.lib);
  }
  destroy() {
    try {
      this.lib.wgpuComputePipelineRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: computePipelineRelease", e);
    }
    return;
  }
}

// src/GPURenderPipeline.ts
class GPURenderPipelineImpl {
  lib;
  __brand = "GPURenderPipeline";
  label;
  ptr;
  constructor(ptr8, lib, label) {
    this.lib = lib;
    this.ptr = ptr8;
    this.label = label || "";
  }
  getBindGroupLayout(index) {
    const layoutPtr = this.lib.wgpuRenderPipelineGetBindGroupLayout(this.ptr, index);
    if (!layoutPtr) {
      fatalError("wgpuRenderPipelineGetBindGroupLayout returned null");
    }
    return new GPUBindGroupLayoutImpl(layoutPtr, this.lib);
  }
  destroy() {
    try {
      this.lib.wgpuRenderPipelineRelease(this.ptr);
    } catch (e) {
      console.error("FFI Error: renderPipelineRelease", e);
    }
  }
}

// src/GPUDevice.ts
import { EventEmitter as EventEmitter2 } from "events";

// src/GPURenderBundleEncoder.ts
import { ptr as ptr8 } from "bun:ffi";

// src/GPURenderBundle.ts
class GPURenderBundleImpl {
  __brand = "GPURenderBundle";
  label = "";
  ptr;
  lib;
  _destroyed = false;
  constructor(ptr8, lib, label) {
    this.ptr = ptr8;
    this.lib = lib;
    if (label) {
      this.label = label;
    }
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this.lib.wgpuRenderBundleRelease(this.ptr);
  }
}

// src/GPURenderBundleEncoder.ts
class GPURenderBundleEncoderImpl {
  __brand = "GPURenderBundleEncoder";
  _lib;
  _destroyed = false;
  label;
  ptr;
  constructor(ptr9, lib, descriptor) {
    this.ptr = ptr9;
    this._lib = lib;
    this.label = descriptor.label ?? "";
  }
  setBindGroup(groupIndex, bindGroup, dynamicOffsets) {
    if (!bindGroup)
      return;
    let offsetsBuffer;
    let offsetCount = 0;
    let offsetPtr = null;
    if (dynamicOffsets) {
      if (dynamicOffsets instanceof Uint32Array) {
        offsetsBuffer = dynamicOffsets;
      } else {
        offsetsBuffer = new Uint32Array(dynamicOffsets);
      }
      offsetCount = offsetsBuffer.length;
      if (offsetCount > 0) {
        offsetPtr = ptr8(offsetsBuffer);
      }
    }
    this._lib.wgpuRenderBundleEncoderSetBindGroup(this.ptr, groupIndex, bindGroup.ptr, BigInt(offsetCount), offsetPtr);
    return;
  }
  setPipeline(pipeline) {
    this._lib.wgpuRenderBundleEncoderSetPipeline(this.ptr, pipeline.ptr);
    return;
  }
  setIndexBuffer(buffer, indexFormat, offset, size) {
    this._lib.wgpuRenderBundleEncoderSetIndexBuffer(this.ptr, buffer.ptr, WGPUIndexFormat.to(indexFormat), BigInt(offset ?? 0), BigInt(size ?? buffer.size));
    return;
  }
  setVertexBuffer(slot, buffer, offset, size) {
    if (!buffer)
      return;
    this._lib.wgpuRenderBundleEncoderSetVertexBuffer(this.ptr, slot, buffer.ptr, BigInt(offset ?? 0), BigInt(size ?? buffer.size));
    return;
  }
  draw(vertexCount, instanceCount, firstVertex, firstInstance) {
    if (this._destroyed) {
      fatalError("Cannot call draw on a destroyed GPURenderBundleEncoder");
    }
    this._lib.wgpuRenderBundleEncoderDraw(this.ptr, vertexCount, instanceCount ?? 1, firstVertex ?? 0, firstInstance ?? 0);
    return;
  }
  drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
    if (this._destroyed) {
      fatalError("Cannot call drawIndexed on a destroyed GPURenderBundleEncoder");
    }
    this._lib.wgpuRenderBundleEncoderDrawIndexed(this.ptr, indexCount, instanceCount ?? 1, firstIndex ?? 0, baseVertex ?? 0, firstInstance ?? 0);
    return;
  }
  drawIndirect(indirectBuffer, indirectOffset) {
    if (this._destroyed) {
      fatalError("Cannot call drawIndirect on a destroyed GPURenderBundleEncoder");
    }
    this._lib.wgpuRenderBundleEncoderDrawIndirect(this.ptr, indirectBuffer.ptr, BigInt(indirectOffset));
    return;
  }
  drawIndexedIndirect(indirectBuffer, indirectOffset) {
    if (this._destroyed) {
      fatalError("Cannot call drawIndexedIndirect on a destroyed GPURenderBundleEncoder");
    }
    this._lib.wgpuRenderBundleEncoderDrawIndexedIndirect(this.ptr, indirectBuffer.ptr, BigInt(indirectOffset));
    return;
  }
  finish(descriptor) {
    if (this._destroyed) {
      fatalError("Cannot call finish on a destroyed GPURenderBundleEncoder");
    }
    const packedDescriptor = WGPURenderBundleDescriptorStruct.pack(descriptor ?? {});
    const bundlePtr = this._lib.wgpuRenderBundleEncoderFinish(this.ptr, ptr8(packedDescriptor));
    if (!bundlePtr) {
      fatalError("wgpuRenderBundleEncoderFinish returned a null pointer");
    }
    return new GPURenderBundleImpl(bundlePtr, this._lib, descriptor?.label);
  }
  _destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this._lib.wgpuRenderBundleEncoderRelease(this.ptr);
  }
  pushDebugGroup(groupLabel) {
    const packedLabel = WGPUStringView.pack(groupLabel);
    this._lib.wgpuRenderBundleEncoderPushDebugGroup(this.ptr, ptr8(packedLabel));
  }
  popDebugGroup() {
    this._lib.wgpuRenderBundleEncoderPopDebugGroup(this.ptr);
  }
  insertDebugMarker(markerLabel) {
    const packedLabel = WGPUStringView.pack(markerLabel);
    this._lib.wgpuRenderBundleEncoderInsertDebugMarker(this.ptr, ptr8(packedLabel));
  }
}

// src/GPUDevice.ts
var PopErrorScopeStatus = {
  Success: 1,
  CallbackCancelled: 2,
  Error: 3
};
function isDepthTextureFormat(format) {
  return format === "depth16unorm" || format === "depth24plus" || format === "depth24plus-stencil8" || format === "depth32float" || format === "depth32float-stencil8";
}

class DeviceTicker {
  devicePtr;
  lib;
  _waiting = 0;
  _ticking = false;
  constructor(devicePtr, lib) {
    this.devicePtr = devicePtr;
    this.lib = lib;
  }
  register() {
    this._waiting++;
    this.scheduleTick();
  }
  unregister() {
    this._waiting--;
  }
  hasWaiting() {
    return this._waiting > 0;
  }
  scheduleTick() {
    if (this._ticking)
      return;
    this._ticking = true;
    queueMicrotask(() => {
      this.lib.wgpuDeviceTick(this.devicePtr);
      this._ticking = false;
      if (this.hasWaiting()) {
        this.scheduleTick();
      }
    });
  }
}
var EMPTY_ADAPTER_INFO = Object.create(GPUAdapterInfoImpl.prototype);
var DEFAULT_LIMITS = Object.assign(Object.create(GPUSupportedLimitsImpl.prototype), DEFAULT_SUPPORTED_LIMITS);
var createComputePipelineAsyncId = 0;
var createRenderPipelineAsyncId = 0;

class GPUDeviceImpl extends EventEmitter2 {
  devicePtr;
  lib;
  instanceTicker;
  ptr;
  queuePtr;
  _queue = null;
  _userUncapturedErrorCallback = null;
  _ticker;
  _lost;
  _lostPromiseResolve = null;
  _features = null;
  _limits = DEFAULT_LIMITS;
  _info = EMPTY_ADAPTER_INFO;
  _destroyed = false;
  _errorScopePopId = 0;
  _popErrorScopeCallback;
  _popErrorScopePromises = new Map;
  _createComputePipelineAsyncCallback;
  _createComputePipelineAsyncPromises = new Map;
  _createRenderPipelineAsyncCallback;
  _createRenderPipelineAsyncPromises = new Map;
  _buffers = new Set;
  __brand = "GPUDevice";
  label = "";
  constructor(devicePtr, lib, instanceTicker) {
    super();
    this.devicePtr = devicePtr;
    this.lib = lib;
    this.instanceTicker = instanceTicker;
    this.ptr = devicePtr;
    const queuePtr = this.lib.wgpuDeviceGetQueue(this.devicePtr);
    if (!queuePtr) {
      fatalError("Failed to get device queue");
    }
    this.queuePtr = queuePtr;
    this._ticker = new DeviceTicker(this.devicePtr, this.lib);
    this._queue = new GPUQueueImpl(this.queuePtr, this.lib, this.instanceTicker);
    this._lost = new Promise((resolve) => {
      this._lostPromiseResolve = resolve;
    });
    this._popErrorScopeCallback = new JSCallback3((status, errorType, messagePtr, messageSize, userdata1, userdata2) => {
      this.instanceTicker.unregister();
      const popId = unpackUserDataId(userdata1);
      const promiseData = this._popErrorScopePromises.get(popId);
      this._popErrorScopePromises.delete(popId);
      if (promiseData) {
        if (messageSize === 0n) {
          promiseData.resolve(null);
        } else if (status === PopErrorScopeStatus.Error) {
          const message = decodeCallbackMessage(messagePtr, messageSize);
          promiseData.reject(new OperationError(message));
        } else {
          const message = decodeCallbackMessage(messagePtr, messageSize);
          const error = createWGPUError(errorType, message);
          promiseData.resolve(error);
        }
      } else {
        console.error("[POP ERROR SCOPE CALLBACK] promise not found for ID:", popId, "Map size:", this._popErrorScopePromises.size);
      }
    }, {
      args: [FFIType4.u32, FFIType4.u32, FFIType4.pointer, FFIType4.u64, FFIType4.pointer, FFIType4.pointer]
    });
    this._createComputePipelineAsyncCallback = new JSCallback3((status, pipeline, messagePtr, messageSize, userdata1, userdata2) => {
      this.instanceTicker.unregister();
      const asyncId = unpackUserDataId(userdata1);
      const promiseData = this._createComputePipelineAsyncPromises.get(asyncId);
      this._createComputePipelineAsyncPromises.delete(asyncId);
      if (promiseData) {
        if (status === AsyncStatus.Success) {
          if (pipeline) {
            const computePipeline = new GPUComputePipelineImpl(pipeline, this.lib, "async-compute-pipeline");
            promiseData.resolve(computePipeline);
          } else {
            promiseData.reject(new Error("Pipeline creation succeeded but pipeline is null"));
          }
        } else {
          const message = messagePtr ? decodeCallbackMessage(messagePtr, messageSize) : "Unknown error";
          promiseData.reject(new GPUPipelineErrorImpl(message, { reason: "validation" }));
        }
      } else {
        console.error("[CREATE COMPUTE PIPELINE ASYNC CALLBACK] promise not found");
      }
    }, {
      args: [FFIType4.u32, FFIType4.pointer, FFIType4.pointer, FFIType4.u64, FFIType4.pointer, FFIType4.pointer]
    });
    this._createRenderPipelineAsyncCallback = new JSCallback3((status, pipeline, messagePtr, messageSize, userdata1, userdata2) => {
      this.instanceTicker.unregister();
      const asyncId = unpackUserDataId(userdata1);
      const promiseData = this._createRenderPipelineAsyncPromises.get(asyncId);
      this._createRenderPipelineAsyncPromises.delete(asyncId);
      if (promiseData) {
        if (status === AsyncStatus.Success) {
          if (pipeline) {
            const renderPipeline = new GPURenderPipelineImpl(pipeline, this.lib, "async-render-pipeline");
            promiseData.resolve(renderPipeline);
          } else {
            promiseData.reject(new Error("Pipeline creation succeeded but pipeline is null"));
          }
        } else {
          const message = messagePtr ? decodeCallbackMessage(messagePtr, messageSize) : "Unknown error";
          promiseData.reject(new GPUPipelineErrorImpl(message, { reason: "validation" }));
        }
      } else {
        console.error("[CREATE RENDER PIPELINE ASYNC CALLBACK] promise not found");
      }
    }, {
      args: [FFIType4.u32, FFIType4.pointer, FFIType4.pointer, FFIType4.u64, FFIType4.pointer, FFIType4.pointer]
    });
  }
  tick() {
    this.lib.wgpuDeviceTick(this.devicePtr);
    return;
  }
  addEventListener(type, listener, options) {
    if (typeof options === "object" && options !== null && options.once) {
      this.once(type, listener);
    } else {
      this.on(type, listener);
    }
  }
  removeEventListener(type, listener, options) {
    this.off(type, listener);
  }
  handleUncapturedError(event) {
    this.emit("uncapturederror", event);
    if (this._userUncapturedErrorCallback) {
      this._userUncapturedErrorCallback.call(this, event);
    } else {
      console.error(`>>> JS Device Error Callback <<< Type: ${event.error.message}`);
    }
  }
  handleDeviceLost(reason, message, override = false) {
    if (override) {
      this._lost = Promise.resolve({
        reason,
        message,
        __brand: "GPUDeviceLostInfo"
      });
      return;
    }
    if (this._lostPromiseResolve) {
      this._lostPromiseResolve({
        reason,
        message,
        __brand: "GPUDeviceLostInfo"
      });
    }
  }
  dispatchEvent(event) {
    this.emit(event.type, event);
    return true;
  }
  pushErrorScope(filter) {
    if (this._destroyed) {
      fatalError("pushErrorScope on destroyed GPUDevice");
    }
    this.lib.wgpuDevicePushErrorScope(this.devicePtr, WGPUErrorFilter.to(filter));
    return;
  }
  popErrorScope() {
    if (this._destroyed) {
      fatalError("popErrorScope on destroyed GPUDevice");
    }
    return new Promise((resolve, reject) => {
      const id = this._errorScopePopId++;
      const userDataBuffer = packUserDataId(id);
      const userDataPtr = ptr9(userDataBuffer);
      this._popErrorScopePromises.set(id, { resolve, reject });
      const callbackInfo = WGPUCallbackInfoStruct.pack({
        mode: "AllowProcessEvents",
        callback: this._popErrorScopeCallback.ptr,
        userdata1: userDataPtr
      });
      this.lib.wgpuDevicePopErrorScope(this.devicePtr, ptr9(callbackInfo));
      this.instanceTicker.register();
    });
  }
  injectError(type, message) {
    if (this._destroyed) {
      fatalError("injectError on destroyed GPUDevice");
    }
    const errorType = WGPUErrorType[type];
    if (errorType === undefined) {
      fatalError(`Invalid error type for injectError: ${type}`);
    }
    const messageView = WGPUStringView.pack(message);
    this.lib.wgpuDeviceInjectError(this.devicePtr, errorType, ptr9(messageView));
    return;
  }
  set onuncapturederror(listener) {
    this._userUncapturedErrorCallback = listener;
  }
  get lost() {
    return this._lost;
  }
  get features() {
    if (this._destroyed) {
      console.warn("Accessing features on destroyed GPUDevice");
      return Object.freeze(new Set);
    }
    if (this._features === null) {
      let supportedFeaturesStructPtr = null;
      try {
        const { buffer: featuresStructBuffer } = allocStruct(WGPUSupportedFeaturesStruct, {
          lengths: {
            features: 128
          }
        });
        this.lib.wgpuDeviceGetFeatures(this.devicePtr, ptr9(featuresStructBuffer));
        const supportedFeaturesData = WGPUSupportedFeaturesStruct.unpack(featuresStructBuffer);
        const features = supportedFeaturesData.features;
        const supportedFeatures = new Set(features);
        this._features = Object.freeze(supportedFeatures);
      } catch (e) {
        console.error("Error getting device features via wgpuDeviceGetFeatures:", e);
        this._features = Object.freeze(new Set);
      } finally {
        if (supportedFeaturesStructPtr) {
          try {
            this.lib.wgpuSupportedFeaturesFreeMembers(supportedFeaturesStructPtr);
          } catch (freeError) {
            console.error("Error calling wgpuSupportedFeaturesFreeMembers:", freeError);
          }
        }
      }
    }
    return this._features;
  }
  get limits() {
    if (this._destroyed) {
      console.warn("Accessing limits on destroyed GPUDevice");
      return this._limits;
    }
    if (this._limits === null) {
      let limitsStructPtr = null;
      try {
        const { buffer: structBuffer } = allocStruct(WGPULimitsStruct);
        limitsStructPtr = ptr9(structBuffer);
        const status = this.lib.wgpuDeviceGetLimits(this.devicePtr, limitsStructPtr);
        if (status !== 1) {
          console.error(`wgpuDeviceGetLimits failed with status: ${status}`);
          return this._limits;
        }
        const jsLimits = WGPULimitsStruct.unpack(structBuffer);
        this._limits = Object.freeze(Object.assign(Object.create(GPUSupportedLimitsImpl.prototype), {
          __brand: "GPUSupportedLimits",
          ...jsLimits,
          maxUniformBufferBindingSize: Number(jsLimits.maxUniformBufferBindingSize),
          maxStorageBufferBindingSize: Number(jsLimits.maxStorageBufferBindingSize),
          maxBufferSize: Number(jsLimits.maxBufferSize)
        }));
      } catch (e) {
        console.error("Error calling wgpuDeviceGetLimits or unpacking struct:", e);
        limitsStructPtr = null;
        return this._limits;
      }
    }
    return this._limits;
  }
  get adapterInfo() {
    if (this._destroyed) {
      return EMPTY_ADAPTER_INFO;
    }
    if (this._info === EMPTY_ADAPTER_INFO) {
      let infoStructPtr = null;
      try {
        const { buffer: structBuffer } = allocStruct(WGPUAdapterInfoStruct);
        infoStructPtr = ptr9(structBuffer);
        const status = this.lib.wgpuDeviceGetAdapterInfo(this.devicePtr, infoStructPtr);
        if (status !== 1) {
          console.error(`wgpuAdapterGetInfo failed with status: ${status}`);
          this._info = EMPTY_ADAPTER_INFO;
          return this._info;
        }
        const rawInfo = WGPUAdapterInfoStruct.unpack(structBuffer);
        this._info = Object.assign(Object.create(GPUAdapterInfoImpl.prototype), rawInfo, {
          vendor: rawInfo.vendor,
          architecture: rawInfo.architecture,
          description: rawInfo.description,
          device: normalizeIdentifier(rawInfo.device),
          subgroupMinSize: rawInfo.subgroupMinSize,
          subgroupMaxSize: rawInfo.subgroupMaxSize,
          isFallbackAdapter: false
        });
      } catch (e) {
        console.error("Error calling wgpuAdapterGetInfo or unpacking struct:", e);
        this._info = EMPTY_ADAPTER_INFO;
      } finally {
        if (infoStructPtr) {
          this.lib.wgpuAdapterInfoFreeMembers(infoStructPtr);
        }
      }
    }
    return this._info;
  }
  get queue() {
    if (!this._queue) {
      throw new Error("Queue not initialized");
    }
    return this._queue;
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this._features = null;
    this._queue?.destroy();
    this._queue = null;
    for (const buffer of this._buffers) {
      buffer.destroy();
    }
    this._buffers.clear();
    this.lib.wgpuDeviceDestroy(this.devicePtr);
    this.instanceTicker.processEvents();
    return;
  }
  createBuffer(descriptor) {
    if (descriptor.size < 0) {
      fatalError("Buffer size must be greater than or equal to 0");
    }
    if (descriptor.mappedAtCreation && descriptor.size % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 4");
    }
    if (descriptor.size > this.limits.maxBufferSize) {
      throw new RangeError(`Buffer size must be less than or equal to ${this.limits.maxBufferSize}`);
    }
    const packedDescriptor = WGPUBufferDescriptorStruct.pack(descriptor);
    const bufferPtr = this.lib.wgpuDeviceCreateBuffer(this.devicePtr, ptr9(packedDescriptor));
    if (!bufferPtr) {
      fatalError("Failed to create buffer");
    }
    const buffer = new GPUBufferImpl(bufferPtr, this, this.lib, descriptor, this.instanceTicker);
    this._buffers.add(buffer);
    buffer.on("destroyed", () => this._buffers.delete(buffer));
    return buffer;
  }
  createTexture(descriptor) {
    const packedDescriptor = WGPUTextureDescriptorStruct.pack(descriptor);
    try {
      const texturePtr = this.lib.wgpuDeviceCreateTexture(this.devicePtr, ptr9(packedDescriptor));
      if (!texturePtr) {
        fatalError("Failed to create texture");
      }
      const { width, height = 1, depthOrArrayLayers = 1 } = normalizeGPUExtent3DStrict(descriptor.size);
      const dimension = descriptor.dimension || "2d";
      const mipLevelCount = descriptor.mipLevelCount || 1;
      const sampleCount = descriptor.sampleCount || 1;
      return new GPUTextureImpl(texturePtr, this.lib, width, height, depthOrArrayLayers, descriptor.format, dimension, mipLevelCount, sampleCount, descriptor.usage);
    } catch (e) {
      fatalError("Error creating texture:", e);
    }
  }
  createSampler(descriptor) {
    const samplerDescriptor = descriptor || {};
    const packedDescriptor = WGPUSamplerDescriptorStruct.pack(samplerDescriptor);
    try {
      const samplerPtr = this.lib.wgpuDeviceCreateSampler(this.devicePtr, ptr9(packedDescriptor));
      if (!samplerPtr) {
        fatalError("Failed to create sampler");
      }
      return new GPUSamplerImpl(samplerPtr, this.lib, descriptor?.label);
    } catch (e) {
      fatalError("Error creating sampler:", e);
    }
  }
  importExternalTexture(descriptor) {
    fatalError("importExternalTexture not implemented", descriptor);
  }
  createBindGroupLayout(descriptor) {
    if (!descriptor.entries) {
      fatalError("createBindGroupLayout: descriptor.entries is missing");
    }
    const entries = Array.from(descriptor.entries).map((e) => {
      if (e.externalTexture) {
        const chainedStruct = WGPUExternalTextureBindingLayoutStruct.pack({
          chain: {
            next: null,
            sType: WGPUSType.ExternalTextureBindingLayout
          }
        });
        return {
          ...e,
          nextInChain: ptr9(chainedStruct)
        };
      }
      return e;
    });
    const packedDescriptorBuffer = WGPUBindGroupLayoutDescriptorStruct.pack({
      ...descriptor,
      entries
    });
    const packedDescriptorPtr = ptr9(packedDescriptorBuffer);
    const layoutPtr = this.lib.wgpuDeviceCreateBindGroupLayout(this.devicePtr, packedDescriptorPtr);
    if (!layoutPtr) {
      fatalError("Failed to create bind group layout (FFI returned null)");
    }
    return new GPUBindGroupLayoutImpl(layoutPtr, this.lib, descriptor.label);
  }
  createPipelineLayout(descriptor) {
    const bgls = Array.from(descriptor.bindGroupLayouts).map((bgl) => bgl?.ptr).filter((bgl) => bgl !== undefined);
    const descriptorBuffer = WGPUPipelineLayoutDescriptorStruct.pack({
      label: descriptor.label,
      bindGroupLayouts: bgls
    });
    const layoutPtr = this.lib.wgpuDeviceCreatePipelineLayout(this.devicePtr, ptr9(descriptorBuffer));
    if (!layoutPtr) {
      fatalError("Failed to create pipeline layout (FFI returned null)");
    }
    return new GPUPipelineLayoutImpl(layoutPtr, this.lib, descriptor.label);
  }
  createShaderModule(descriptor) {
    if (!descriptor.code) {
      fatalError("descriptor.code is missing");
    }
    const codeStruct = WGPUShaderSourceWGSLStruct.pack({
      chain: {
        next: null,
        sType: WGPUSType.ShaderSourceWGSL
      },
      code: descriptor.code
    });
    const packedDescriptor = WGPUShaderModuleDescriptorStruct.pack({
      nextInChain: ptr9(codeStruct),
      label: descriptor.label
    });
    const modulePtr = this.lib.wgpuDeviceCreateShaderModule(this.devicePtr, ptr9(packedDescriptor));
    if (!modulePtr) {
      fatalError("Failed to create shader module (FFI returned null)");
    }
    return new GPUShaderModuleImpl(modulePtr, this.lib, descriptor.label || "no-label");
  }
  createBindGroup(descriptor) {
    const entries = Array.from(descriptor.entries);
    for (let i = 0;i < entries.length; i++) {
      const e = entries[i];
      if (e.resource instanceof GPUBufferImpl) {
        entries[i] = {
          ...e,
          buffer: e.resource,
          offset: e.resource.offset ?? 0n,
          size: e.resource.size ?? UINT64_MAX
        };
      } else if (e.resource instanceof GPUTextureViewImpl) {
        entries[i] = {
          ...e,
          textureView: e.resource
        };
      } else if (isBufferBinding(e.resource)) {
        entries[i] = {
          ...e,
          buffer: e.resource.buffer,
          offset: e.resource.offset ?? 0n,
          size: e.resource.size ?? UINT64_MAX
        };
      } else if (isSampler(e.resource)) {
        entries[i] = {
          ...e,
          sampler: e.resource
        };
      } else if (isTextureView(e.resource)) {
        entries[i] = {
          ...e,
          textureView: e.resource
        };
      }
    }
    const descriptorBuffer = WGPUBindGroupDescriptorStruct.pack({ ...descriptor, entries });
    try {
      const groupPtr = this.lib.wgpuDeviceCreateBindGroup(this.devicePtr, ptr9(descriptorBuffer));
      if (!groupPtr) {
        fatalError("Failed to create bind group (FFI returned null)");
      }
      return new GPUBindGroupImpl(groupPtr, this.lib, descriptor.label);
    } catch (e) {
      fatalError("Error calling deviceCreateBindGroupFromBuffer FFI function:", e);
    }
  }
  _prepareComputePipelineDescriptor(descriptor) {
    let compute = undefined;
    if (descriptor.compute) {
      const constants = descriptor.compute.constants ? Object.entries(descriptor.compute.constants).map(([key, value]) => ({ key, value })) : [];
      compute = {
        ...descriptor.compute,
        constants
      };
    } else {
      fatalError("GPUComputePipelineDescriptor.compute is required.");
    }
    const layoutForPacking = descriptor.layout && descriptor.layout !== "auto" ? descriptor.layout : null;
    const packedPipelineDescriptor = WGPUComputePipelineDescriptorStruct.pack({
      ...descriptor,
      compute,
      layout: layoutForPacking
    });
    return packedPipelineDescriptor;
  }
  createComputePipeline(descriptor) {
    const packedPipelineDescriptor = this._prepareComputePipelineDescriptor(descriptor);
    let pipelinePtr = null;
    pipelinePtr = this.lib.wgpuDeviceCreateComputePipeline(this.devicePtr, ptr9(packedPipelineDescriptor));
    if (!pipelinePtr) {
      fatalError("Failed to create compute pipeline (FFI returned null)");
    }
    return new GPUComputePipelineImpl(pipelinePtr, this.lib, descriptor.label);
  }
  _prepareRenderPipelineDescriptor(descriptor) {
    let fragment = undefined;
    if (descriptor.fragment) {
      const constants = descriptor.fragment.constants ? Object.entries(descriptor.fragment.constants).map(([key, value]) => ({ key, value })) : [];
      fragment = {
        ...descriptor.fragment,
        constants,
        targets: Array.from(descriptor.fragment.targets ?? []).filter((t) => t !== null && t !== undefined)
      };
    }
    let vertex = undefined;
    if (descriptor.vertex) {
      const constants = descriptor.vertex.constants ? Object.entries(descriptor.vertex.constants).map(([key, value]) => ({ key, value })) : [];
      vertex = {
        ...descriptor.vertex,
        constants,
        buffers: Array.from(descriptor.vertex.buffers ?? []).filter((t) => t !== null && t !== undefined)
      };
    } else {
      fatalError("GPURenderPipelineDescriptor.vertex is required.");
    }
    const layoutForPacking = descriptor.layout && descriptor.layout !== "auto" ? descriptor.layout : null;
    const packedPipelineDescriptor = WGPURenderPipelineDescriptorStruct.pack({
      ...descriptor,
      fragment,
      vertex,
      layout: layoutForPacking
    });
    return packedPipelineDescriptor;
  }
  createRenderPipeline(descriptor) {
    if (descriptor.depthStencil) {
      const format = descriptor.depthStencil.format;
      const isDepthFormat = isDepthTextureFormat(format);
      if (isDepthFormat && descriptor.depthStencil.depthWriteEnabled === undefined) {
        this.injectError("validation", "depthWriteEnabled is required for depth formats");
      }
      if (isDepthFormat) {
        const depthWriteEnabled = descriptor.depthStencil.depthWriteEnabled;
        const stencilFront = descriptor.depthStencil.stencilFront;
        const stencilBack = descriptor.depthStencil.stencilBack;
        const frontDepthFailOp = stencilFront?.depthFailOp || "keep";
        const backDepthFailOp = stencilBack?.depthFailOp || "keep";
        const depthFailOpsAreKeep = frontDepthFailOp === "keep" && backDepthFailOp === "keep";
        if ((depthWriteEnabled || !depthFailOpsAreKeep) && descriptor.depthStencil.depthCompare === undefined) {
          this.injectError("validation", "depthCompare is required when depthWriteEnabled is true or stencil depth fail operations are not keep");
        }
      }
    }
    const packedPipelineDescriptor = this._prepareRenderPipelineDescriptor(descriptor);
    let pipelinePtr = null;
    pipelinePtr = this.lib.wgpuDeviceCreateRenderPipeline(this.devicePtr, ptr9(packedPipelineDescriptor));
    if (!pipelinePtr) {
      fatalError("Failed to create render pipeline (FFI returned null)");
    }
    return new GPURenderPipelineImpl(pipelinePtr, this.lib, descriptor.label);
  }
  createCommandEncoder(descriptor) {
    const packedDescriptor = WGPUCommandEncoderDescriptorStruct.pack(descriptor ?? {});
    const encoderPtr = this.lib.wgpuDeviceCreateCommandEncoder(this.devicePtr, ptr9(packedDescriptor));
    if (!encoderPtr) {
      fatalError("Failed to create command encoder");
    }
    return new GPUCommandEncoderImpl(encoderPtr, this.lib);
  }
  createComputePipelineAsync(descriptor) {
    if (this._destroyed) {
      return Promise.reject(new Error("createComputePipelineAsync on destroyed GPUDevice"));
    }
    return new Promise((resolve, reject) => {
      const id = createComputePipelineAsyncId++;
      const userDataBuffer = packUserDataId(id);
      this._createComputePipelineAsyncPromises.set(id, { resolve, reject });
      const userDataPtr = ptr9(userDataBuffer);
      const packedPipelineDescriptor = this._prepareComputePipelineDescriptor(descriptor);
      const callbackInfo = WGPUCallbackInfoStruct.pack({
        mode: "AllowProcessEvents",
        callback: this._createComputePipelineAsyncCallback.ptr,
        userdata1: userDataPtr
      });
      this.lib.wgpuDeviceCreateComputePipelineAsync(this.devicePtr, ptr9(packedPipelineDescriptor), ptr9(callbackInfo));
      this.instanceTicker.register();
    });
  }
  createRenderPipelineAsync(descriptor) {
    if (this._destroyed) {
      return Promise.reject(new Error("createRenderPipelineAsync on destroyed GPUDevice"));
    }
    if (descriptor.depthStencil) {
      const format = descriptor.depthStencil.format;
      const isDepthFormat = isDepthTextureFormat(format);
      if (isDepthFormat && descriptor.depthStencil.depthWriteEnabled === undefined) {
        return Promise.reject(new GPUPipelineErrorImpl("depthWriteEnabled is required for depth formats", { reason: "validation" }));
      }
      if (isDepthFormat) {
        const depthWriteEnabled = descriptor.depthStencil.depthWriteEnabled;
        const stencilFront = descriptor.depthStencil.stencilFront;
        const stencilBack = descriptor.depthStencil.stencilBack;
        const frontDepthFailOp = stencilFront?.depthFailOp || "keep";
        const backDepthFailOp = stencilBack?.depthFailOp || "keep";
        const depthFailOpsAreKeep = frontDepthFailOp === "keep" && backDepthFailOp === "keep";
        if ((depthWriteEnabled || !depthFailOpsAreKeep) && descriptor.depthStencil.depthCompare === undefined) {
          return Promise.reject(new GPUPipelineErrorImpl("depthCompare is required when depthWriteEnabled is true or stencil depth fail operations are not keep", { reason: "validation" }));
        }
      }
    }
    return new Promise((resolve, reject) => {
      const id = createRenderPipelineAsyncId++;
      const userDataBuffer = packUserDataId(id);
      this._createRenderPipelineAsyncPromises.set(id, { resolve, reject });
      const userDataPtr = ptr9(userDataBuffer);
      const packedPipelineDescriptor = this._prepareRenderPipelineDescriptor(descriptor);
      const callbackInfo = WGPUCallbackInfoStruct.pack({
        mode: "AllowProcessEvents",
        callback: this._createRenderPipelineAsyncCallback.ptr,
        userdata1: userDataPtr
      });
      this.lib.wgpuDeviceCreateRenderPipelineAsync(this.devicePtr, ptr9(packedPipelineDescriptor), ptr9(callbackInfo));
      this.instanceTicker.register();
    });
  }
  createRenderBundleEncoder(descriptor) {
    if (this._destroyed) {
      fatalError("Cannot call createRenderBundleEncoder on a destroyed GPUDevice");
    }
    const colorFormats = Array.from(descriptor.colorFormats).filter((f) => f !== null && f !== undefined);
    const packedDescriptor = WGPURenderBundleEncoderDescriptorStruct.pack({
      ...descriptor,
      colorFormats
    });
    const encoderPtr = this.lib.wgpuDeviceCreateRenderBundleEncoder(this.devicePtr, ptr9(packedDescriptor));
    if (!encoderPtr) {
      fatalError("Failed to create render bundle encoder");
    }
    return new GPURenderBundleEncoderImpl(encoderPtr, this.lib, descriptor);
  }
  createQuerySet(descriptor) {
    const packedDescriptor = WGPUQuerySetDescriptorStruct.pack(descriptor);
    let querySetPtr = null;
    querySetPtr = this.lib.wgpuDeviceCreateQuerySet(this.devicePtr, ptr9(packedDescriptor));
    if (!querySetPtr) {
      fatalError("Failed to create query set (FFI returned null)");
    }
    return new GPUQuerySetImpl(querySetPtr, this.lib, descriptor.type, descriptor.count, descriptor.label);
  }
}
function isBufferBinding(resource) {
  return "buffer" in resource;
}
function isSampler(resource) {
  return resource.__brand === "GPUSampler";
}
function isTextureView(resource) {
  return resource.__brand === "GPUTextureView";
}

// src/GPUAdapter.ts
var RequestDeviceStatus = {
  Success: 1,
  CallbackCancelled: 2,
  Error: 3,
  Unknown: 4
};
var ReverseDeviceStatus = Object.fromEntries(Object.entries(RequestDeviceStatus).map(([key, value]) => [value, key]));
var EMPTY_ADAPTER_INFO2 = Object.create(GPUAdapterInfoImpl.prototype);
var DEFAULT_LIMITS2 = Object.assign(Object.create(GPUSupportedLimitsImpl.prototype), DEFAULT_SUPPORTED_LIMITS);

class GPUUncapturedErrorEventImpl extends Event {
  __brand = "GPUUncapturedErrorEvent";
  error;
  constructor(error) {
    super("uncapturederror", { bubbles: true, cancelable: true });
    this.error = error;
  }
}

class GPUAdapterImpl {
  adapterPtr;
  instancePtr;
  lib;
  instanceTicker;
  __brand = "GPUAdapter";
  _features = null;
  _limits = DEFAULT_LIMITS2;
  _info = EMPTY_ADAPTER_INFO2;
  _destroyed = false;
  _device = null;
  _state = "valid";
  constructor(adapterPtr, instancePtr, lib, instanceTicker) {
    this.adapterPtr = adapterPtr;
    this.instancePtr = instancePtr;
    this.lib = lib;
    this.instanceTicker = instanceTicker;
  }
  get info() {
    if (this._destroyed) {
      return EMPTY_ADAPTER_INFO2;
    }
    if (this._info === EMPTY_ADAPTER_INFO2) {
      let infoStructPtr = null;
      try {
        const { buffer: structBuffer } = allocStruct(WGPUAdapterInfoStruct);
        infoStructPtr = ptr10(structBuffer);
        const status = this.lib.wgpuAdapterGetInfo(this.adapterPtr, infoStructPtr);
        if (status !== 1) {
          console.error(`wgpuAdapterGetInfo failed with status: ${status}`);
          this._info = EMPTY_ADAPTER_INFO2;
          return this._info;
        }
        const rawInfo = WGPUAdapterInfoStruct.unpack(structBuffer);
        this._info = Object.assign(Object.create(GPUAdapterInfoImpl.prototype), rawInfo, {
          vendor: rawInfo.vendor,
          architecture: rawInfo.architecture,
          description: rawInfo.description,
          device: normalizeIdentifier(rawInfo.device),
          subgroupMinSize: rawInfo.subgroupMinSize,
          subgroupMaxSize: rawInfo.subgroupMaxSize,
          isFallbackAdapter: false
        });
      } catch (e) {
        console.error("Error calling wgpuAdapterGetInfo or unpacking struct:", e);
        this._info = EMPTY_ADAPTER_INFO2;
      } finally {
        if (infoStructPtr) {
          this.lib.wgpuAdapterInfoFreeMembers(infoStructPtr);
        }
      }
    }
    return this._info;
  }
  get features() {
    if (this._destroyed) {
      console.warn("Accessing features on destroyed GPUAdapter");
      return Object.freeze(new Set);
    }
    if (this._features === null) {
      try {
        const { buffer: featuresStructBuffer, subBuffers } = allocStruct(WGPUSupportedFeaturesStruct, {
          lengths: {
            features: 128
          }
        });
        this.lib.wgpuAdapterGetFeatures(this.adapterPtr, ptr10(featuresStructBuffer));
        const supportedFeatures = new Set;
        const unpacked = WGPUSupportedFeaturesStruct.unpack(featuresStructBuffer);
        if (unpacked.features && unpacked.featureCount && unpacked.featureCount > 0) {
          for (const feature of unpacked.features) {
            supportedFeatures.add(feature);
          }
        }
        this._features = Object.freeze(supportedFeatures);
      } catch (e) {
        console.error("Error calling adapterGetFeatures FFI function:", e);
        return Object.freeze(new Set);
      }
    }
    return this._features;
  }
  get limits() {
    if (this._destroyed) {
      return this._limits;
    }
    if (this._limits === null) {
      let limitsStructPtr = null;
      try {
        const { buffer: structBuffer } = allocStruct(WGPULimitsStruct);
        limitsStructPtr = ptr10(structBuffer);
        const status = this.lib.wgpuAdapterGetLimits(this.adapterPtr, limitsStructPtr);
        if (status !== 1) {
          console.error(`wgpuAdapterGetLimits failed with status: ${status}`);
          return this._limits;
        }
        const jsLimits = WGPULimitsStruct.unpack(structBuffer);
        this._limits = Object.freeze(Object.assign(Object.create(GPUSupportedLimitsImpl.prototype), {
          __brand: "GPUSupportedLimits",
          ...jsLimits,
          maxUniformBufferBindingSize: Number(jsLimits.maxUniformBufferBindingSize),
          maxStorageBufferBindingSize: Number(jsLimits.maxStorageBufferBindingSize),
          maxBufferSize: Number(jsLimits.maxBufferSize)
        }));
      } catch (e) {
        console.error("Error calling wgpuAdapterGetLimits or unpacking struct:", e);
      }
    }
    return this._limits;
  }
  get isFallbackAdapter() {
    console.error("get isFallbackAdapter", this.adapterPtr);
    throw new Error("Not implemented");
  }
  handleUncapturedError(devicePtr, typeInt, messagePtr, messageSize, userdata1, userdata2) {
    const message = decodeCallbackMessage(messagePtr, messageSize);
    const error = createWGPUError(typeInt, message);
    if (this._device) {
      const event = new GPUUncapturedErrorEventImpl(error);
      this._device.handleUncapturedError(event);
      this._device.dispatchEvent(event);
    } else {
      console.error(`Device not found for uncaptured error`);
    }
  }
  handleDeviceLost(devicePtr, reason, messagePtr, messageSize, userdata1, userdata2) {
    const message = decodeCallbackMessage(messagePtr, messageSize);
    this._state = "invalid";
    if (this._device) {
      this._device.handleDeviceLost(WGPUDeviceLostReasonDef.from(reason), message);
    }
  }
  requestDevice(descriptor) {
    if (this._destroyed) {
      return Promise.reject(new Error("Adapter destroyed"));
    }
    if (this._state === "invalid") {
      this._device?.handleDeviceLost("unknown", "Adapter already invalid", true);
      return Promise.resolve(this._device);
    }
    if (this._state === "consumed") {
      return Promise.reject(new OperationError("Adapter already consumed"));
    }
    this._state = "consumed";
    return new Promise((resolve, reject) => {
      let packedDescriptorPtr = null;
      let jsCallback = null;
      try {
        const uncapturedErrorCallback = new JSCallback4((devicePtr, typeInt, messagePtr, messageSize, userdata1, userdata2) => {
          this.handleUncapturedError(devicePtr, typeInt, messagePtr, messageSize, userdata1, userdata2);
        }, {
          args: [FFIType5.pointer, FFIType5.u32, FFIType5.pointer, FFIType5.u64, FFIType5.pointer, FFIType5.pointer],
          returns: FFIType5.void
        });
        if (!uncapturedErrorCallback.ptr) {
          fatalError("Failed to create uncapturedErrorCallback");
        }
        const deviceLostCallback = new JSCallback4((devicePtr, reason, messagePtr, messageSize, userdata1, userdata2) => {
          this.handleDeviceLost(devicePtr, reason, messagePtr, messageSize, userdata1, userdata2);
        }, {
          args: [FFIType5.pointer, FFIType5.u32, FFIType5.pointer, FFIType5.u64, FFIType5.pointer, FFIType5.pointer],
          returns: FFIType5.void
        });
        if (!deviceLostCallback.ptr) {
          fatalError("Failed to create deviceLostCallback");
        }
        const fullDescriptor = {
          ...descriptor,
          uncapturedErrorCallbackInfo: {
            callback: uncapturedErrorCallback.ptr,
            userdata1: null,
            userdata2: null
          },
          deviceLostCallbackInfo: {
            nextInChain: null,
            mode: "AllowProcessEvents",
            callback: deviceLostCallback.ptr,
            userdata1: null,
            userdata2: null
          },
          defaultQueue: {
            label: "default queue"
          }
        };
        try {
          const limits = this.limits;
          const features = this.features;
          const descBuffer = WGPUDeviceDescriptorStruct.pack(fullDescriptor, {
            validationHints: {
              limits,
              features
            }
          });
          packedDescriptorPtr = ptr10(descBuffer);
        } catch (e) {
          this._state = "valid";
          reject(e);
          return;
        }
        const callbackFn = (status, devicePtr, messagePtr, messageSize, userdata1, userdata2) => {
          this.instanceTicker.unregister();
          const message = decodeCallbackMessage(messagePtr, messageSize);
          if (status === RequestDeviceStatus.Success) {
            if (devicePtr) {
              const device = new GPUDeviceImpl(devicePtr, this.lib, this.instanceTicker);
              this._device = device;
              resolve(device);
            } else {
              console.error("WGPU Error: requestDevice Success but device pointer is null.");
              reject(new Error(`WGPU Error (Success but null device): ${message || "No message."}`));
            }
          } else {
            this._state = "valid";
            let statusName = ReverseDeviceStatus[status] || "Unknown WGPU Error";
            reject(new OperationError(`WGPU Error (${statusName}): ${message || "No message provided."}`));
          }
          if (jsCallback) {
            jsCallback.close();
          }
        };
        jsCallback = new JSCallback4(callbackFn, {
          args: [FFIType5.u32, FFIType5.pointer, FFIType5.pointer, FFIType5.u64, FFIType5.pointer, FFIType5.pointer],
          returns: FFIType5.void
        });
        if (!jsCallback?.ptr) {
          fatalError("Failed to create JSCallback");
        }
        const buffer = WGPUCallbackInfoStruct.pack({
          nextInChain: null,
          mode: "AllowProcessEvents",
          callback: jsCallback?.ptr,
          userdata1: null,
          userdata2: null
        });
        const packedCallbackInfoPtr = ptr10(buffer);
        this.lib.wgpuAdapterRequestDevice(this.adapterPtr, packedDescriptorPtr, packedCallbackInfoPtr);
        this.instanceTicker.register();
      } catch (e) {
        console.error("Error during requestDevice:", e);
        this._state = "valid";
        if (jsCallback)
          jsCallback.close();
        reject(e);
      }
    });
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    this._features = null;
    try {
      this.lib.wgpuAdapterRelease(this.adapterPtr);
    } catch (e) {
      console.error("FFI Error: wgpuAdapterRelease", e);
    }
    return;
  }
}

// src/GPU.ts
var RequestAdapterStatus = {
  Success: 1,
  CallbackCancelled: 2,
  Unavailable: 3,
  Error: 4,
  Unknown: 5
};

class InstanceTicker {
  instancePtr;
  lib;
  _waiting = 0;
  _ticking = false;
  _accTime = 0;
  _lastTime = performance.now();
  constructor(instancePtr, lib) {
    this.instancePtr = instancePtr;
    this.lib = lib;
  }
  register() {
    this._lastTime = performance.now();
    this._accTime = 0;
    this._waiting++;
    this.scheduleTick();
  }
  unregister() {
    this._waiting--;
  }
  hasWaiting() {
    return this._waiting > 0;
  }
  processEvents() {
    this.lib.wgpuInstanceProcessEvents(this.instancePtr);
  }
  scheduleTick() {
    if (this._ticking)
      return;
    this._ticking = true;
    setImmediate(() => {
      const now = performance.now();
      this._accTime += now - this._lastTime;
      this._lastTime = now;
      if (this._accTime > 0.05) {
        this.lib.wgpuInstanceProcessEvents(this.instancePtr);
        this._accTime = 0;
      }
      this._ticking = false;
      if (this.hasWaiting()) {
        this.scheduleTick();
      }
    });
  }
}

class GPUImpl {
  instancePtr;
  lib;
  __brand = "GPU";
  _destroyed = false;
  _ticker;
  _wgslLanguageFeatures = null;
  constructor(instancePtr, lib) {
    this.instancePtr = instancePtr;
    this.lib = lib;
    this._ticker = new InstanceTicker(instancePtr, lib);
  }
  getPreferredCanvasFormat() {
    return "bgra8unorm";
  }
  get wgslLanguageFeatures() {
    if (this._destroyed) {
      console.warn("Accessing wgslLanguageFeatures on destroyed GPU instance");
      return Object.freeze(new Set);
    }
    if (this._wgslLanguageFeatures === null) {
      try {
        const { buffer: structBuffer } = allocStruct(WGPUSupportedWGSLLanguageFeaturesStruct, {
          lengths: {
            features: 32
          }
        });
        const status = this.lib.wgpuInstanceGetWGSLLanguageFeatures(this.instancePtr, ptr11(structBuffer));
        if (status !== 1) {
          console.error(`wgpuInstanceGetWGSLLanguageFeatures failed with status: ${status}`);
          this._wgslLanguageFeatures = Object.freeze(new Set);
          return this._wgslLanguageFeatures;
        }
        const unpacked = WGPUSupportedWGSLLanguageFeaturesStruct.unpack(structBuffer);
        const supportedFeatures = new Set;
        if (unpacked.features) {
          for (const featureName of unpacked.features) {
            supportedFeatures.add(featureName);
          }
        }
        this._wgslLanguageFeatures = Object.freeze(supportedFeatures);
      } catch (e) {
        console.error("Error in wgslLanguageFeatures getter:", e);
        this._wgslLanguageFeatures = Object.freeze(new Set);
      }
    }
    return this._wgslLanguageFeatures;
  }
  requestAdapter(options) {
    if (this._destroyed) {
      return Promise.reject(new Error("GPU instance has been destroyed"));
    }
    return new Promise((resolve, reject) => {
      let packedOptionsPtr = null;
      let jsCallback = null;
      try {
        if (options) {
          try {
            const buffer2 = WGPURequestAdapterOptionsStruct.pack(options);
            packedOptionsPtr = ptr11(buffer2);
          } catch (e) {
            resolve(null);
            return;
          }
        }
        const callbackFn = (status, adapterPtr, messagePtr, messageSize, userdata1, userdata2) => {
          this._ticker.unregister();
          const message = messagePtr ? Buffer.from(toArrayBuffer6(messagePtr)).toString() : null;
          if (status === RequestAdapterStatus.Success) {
            if (adapterPtr) {
              resolve(new GPUAdapterImpl(adapterPtr, this.instancePtr, this.lib, this._ticker));
            } else {
              reject(new Error(`WGPU Error (Success but null adapter): ${message || "No message."}`));
            }
          } else if (status === RequestAdapterStatus.Unavailable) {
            resolve(null);
          } else {
            let statusName = Object.keys(RequestAdapterStatus).find((key) => RequestAdapterStatus[key] === status) || "Unknown WGPU Error";
            reject(new Error(`WGPU Error (${statusName}): ${message || "No message provided."}`));
          }
          if (jsCallback) {
            jsCallback.close();
          }
        };
        jsCallback = new JSCallback5(callbackFn, {
          args: [FFIType6.u32, FFIType6.pointer, FFIType6.pointer, FFIType6.u64, FFIType6.pointer, FFIType6.pointer],
          returns: FFIType6.void
        });
        if (!jsCallback?.ptr) {
          fatalError("Failed to create JSCallback");
        }
        const buffer = WGPUCallbackInfoStruct.pack({
          nextInChain: null,
          mode: "AllowProcessEvents",
          callback: jsCallback?.ptr,
          userdata1: null,
          userdata2: null
        });
        const packedCallbackInfoPtr = ptr11(buffer);
        this.lib.wgpuInstanceRequestAdapter(this.instancePtr, packedOptionsPtr, packedCallbackInfoPtr);
        this._ticker.register();
      } catch (e) {
        if (jsCallback)
          jsCallback.close();
        reject(e);
      }
    });
  }
  destroy() {
    if (this._destroyed)
      return;
    this._destroyed = true;
    try {
      this.lib.wgpuInstanceRelease(this.instancePtr);
    } catch (e) {
      console.error("FFI Error: wgpuInstanceRelease", e);
    }
    return;
  }
}

// src/mocks/GPUCanvasContext.ts
class GPUCanvasContextMock {
  canvas;
  __brand = "GPUCanvasContext";
  _configuration = null;
  _currentTexture = null;
  _nextTexture = null;
  width;
  height;
  _device = null;
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
  }
  configure(descriptor) {
    if (!descriptor || !descriptor.device) {
      throw new Error("GPUCanvasContextMock.configure: Invalid descriptor or missing device.");
    }
    this._configuration = {
      ...descriptor,
      alphaMode: descriptor.alphaMode ?? "premultiplied",
      usage: descriptor.usage ? descriptor.usage | GPUTextureUsage.TEXTURE_BINDING : GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING,
      colorSpace: descriptor.colorSpace ?? "srgb"
    };
    this._device = descriptor.device;
    this._currentTexture?.destroy();
    this._currentTexture = null;
    return;
  }
  unconfigure() {
    this._configuration = null;
    this._currentTexture?.destroy();
    this._currentTexture = null;
    this._device = null;
    return;
  }
  getConfiguration() {
    if (!this._configuration) {
      return null;
    }
    const configOut = {
      device: this._configuration.device,
      format: this._configuration.format,
      usage: this._configuration.usage ?? GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      viewFormats: Array.from(this._configuration.viewFormats ?? []),
      colorSpace: this._configuration.colorSpace ?? "srgb",
      alphaMode: this._configuration.alphaMode ?? "premultiplied"
    };
    if (this._configuration.toneMapping) {
      configOut.toneMapping = this._configuration.toneMapping;
    }
    return configOut;
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this._configuration && this._device) {
      this.createTextures();
    }
    return;
  }
  createTextures() {
    const currentTexture = this._currentTexture;
    const nextTexture = this._nextTexture;
    setTimeout(() => {
      currentTexture?.destroy();
      nextTexture?.destroy();
    }, 1000);
    this._currentTexture = this.createRenderTexture(this.width, this.height);
    this._nextTexture = this.createRenderTexture(this.width, this.height);
  }
  createRenderTexture(width, height) {
    if (!this._configuration || !this._device) {
      throw new Error("GPUCanvasContextMock.getCurrentTexture: Context is not configured.");
    }
    return this._device.createTexture({
      label: "canvasCurrentTexture",
      size: {
        width,
        height,
        depthOrArrayLayers: 1
      },
      format: this._configuration.format,
      usage: this._configuration.usage ?? GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      dimension: "2d",
      mipLevelCount: 1,
      sampleCount: 1
    });
  }
  getCurrentTexture() {
    if (!this._configuration || !this._device) {
      throw new Error("GPUCanvasContextMock.getCurrentTexture: Context is not configured.");
    }
    if (!this._currentTexture) {
      this.createTextures();
    }
    return this._currentTexture;
  }
  switchTextures() {
    const temp = this._currentTexture;
    this._currentTexture = this._nextTexture;
    this._nextTexture = temp;
    return this._currentTexture;
  }
}

// src/index.ts
function createInstance(lib) {
  try {
    return lib.wgpuCreateInstance(null);
  } catch (e) {
    console.error("FFI Error: createInstance", e);
    return null;
  }
}
function createGPUInstance(libPath) {
  const lib = loadLibrary(libPath);
  const instancePtr = createInstance(lib);
  if (!instancePtr) {
    throw new Error("Failed to create GPU instance");
  }
  return new GPUImpl(instancePtr, lib);
}
var globals = {
  GPUPipelineError: GPUPipelineErrorImpl,
  AbortError: AbortError2,
  GPUError: GPUErrorImpl,
  GPUOutOfMemoryError,
  GPUInternalError,
  GPUValidationError,
  GPUTextureUsage: TextureUsageFlags,
  GPUBufferUsage: BufferUsageFlags,
  GPUShaderStage: ShaderStageFlags,
  GPUMapMode: MapModeFlags,
  GPUDevice: GPUDeviceImpl,
  GPUAdapterInfo: GPUAdapterInfoImpl,
  GPUSupportedLimits: GPUSupportedLimitsImpl
};
async function setupGlobals({ libPath } = {}) {
  if (!navigator.gpu) {
    const gpuInstance = createGPUInstance(libPath);
    global.navigator = {
      ...global.navigator ?? {},
      gpu: gpuInstance
    };
  }
  Object.assign(globalThis, globals);
}
async function createWebGPUDevice() {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    throw new Error("Failed to create WebGPU device");
  }
  return device;
}
export {
  setupGlobals,
  globals,
  createWebGPUDevice,
  createGPUInstance,
  GPUCanvasContextMock
};
