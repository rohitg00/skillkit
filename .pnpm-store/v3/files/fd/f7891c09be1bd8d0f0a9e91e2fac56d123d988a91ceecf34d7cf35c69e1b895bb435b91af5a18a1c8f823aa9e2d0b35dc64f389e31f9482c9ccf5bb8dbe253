"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasmBackend = exports.initializeFlags = void 0;
const onnxruntime_common_1 = require("onnxruntime-common");
const os_1 = require("os");
const proxy_wrapper_1 = require("./wasm/proxy-wrapper");
const session_handler_1 = require("./wasm/session-handler");
/**
 * This function initializes all flags for WebAssembly.
 *
 * Those flags are accessible from `ort.env.wasm`. Users are allow to set those flags before the first inference session
 * being created, to override default value.
 */
const initializeFlags = () => {
    if (typeof onnxruntime_common_1.env.wasm.initTimeout !== 'number' || onnxruntime_common_1.env.wasm.initTimeout < 0) {
        onnxruntime_common_1.env.wasm.initTimeout = 0;
    }
    if (typeof onnxruntime_common_1.env.wasm.simd !== 'boolean') {
        onnxruntime_common_1.env.wasm.simd = true;
    }
    if (typeof onnxruntime_common_1.env.wasm.proxy !== 'boolean') {
        onnxruntime_common_1.env.wasm.proxy = false;
    }
    if (typeof onnxruntime_common_1.env.wasm.numThreads !== 'number' || !Number.isInteger(onnxruntime_common_1.env.wasm.numThreads) || onnxruntime_common_1.env.wasm.numThreads <= 0) {
        const numCpuLogicalCores = typeof navigator === 'undefined' ? (0, os_1.cpus)().length : navigator.hardwareConcurrency;
        onnxruntime_common_1.env.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
    }
};
exports.initializeFlags = initializeFlags;
class OnnxruntimeWebAssemblyBackend {
    async init() {
        // populate wasm flags
        (0, exports.initializeFlags)();
        // init wasm
        await (0, proxy_wrapper_1.initWasm)();
    }
    async createSessionHandler(pathOrBuffer, options) {
        const handler = new session_handler_1.OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
    }
}
exports.wasmBackend = new OnnxruntimeWebAssemblyBackend();
//# sourceMappingURL=backend-wasm.js.map