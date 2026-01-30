"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispose = exports.getInstance = exports.initializeWebAssembly = void 0;
const path = __importStar(require("path"));
const ort_wasm_js_1 = __importDefault(require("./binding/ort-wasm.js"));
const ortWasmFactoryThreaded = 
// eslint-disable-next-line @typescript-eslint/no-require-imports
!BUILD_DEFS.DISABLE_WASM_THREAD ? require('./binding/ort-wasm-threaded.js') : ort_wasm_js_1.default;
let wasm;
let initialized = false;
let initializing = false;
let aborted = false;
const isMultiThreadSupported = () => {
    try {
        // If 'SharedArrayBuffer' is not available, WebAssembly threads will not work.
        if (typeof SharedArrayBuffer === 'undefined') {
            return false;
        }
        // Test for transferability of SABs (for browsers. needed for Firefox)
        // https://groups.google.com/forum/#!msg/mozilla.dev.platform/IHkBZlHETpA/dwsMNchWEQAJ
        if (typeof MessageChannel !== 'undefined') {
            new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        // Test for WebAssembly threads capability (for both browsers and Node.js)
        // This typed array is a WebAssembly program containing threaded instructions.
        return WebAssembly.validate(new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5,
            4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11
        ]));
    }
    catch (e) {
        return false;
    }
};
const isSimdSupported = () => {
    try {
        // Test for WebAssembly SIMD capability (for both browsers and Node.js)
        // This typed array is a WebAssembly program containing SIMD instructions.
        // The binary data is generated from the following code by wat2wasm:
        //
        // (module
        //   (type $t0 (func))
        //   (func $f0 (type $t0)
        //     (drop
        //       (i32x4.dot_i16x8_s
        //         (i8x16.splat
        //           (i32.const 0))
        //         (v128.const i32x4 0x00000000 0x00000000 0x00000000 0x00000000)))))
        return WebAssembly.validate(new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0,
            253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11
        ]));
    }
    catch (e) {
        return false;
    }
};
const getWasmFileName = (useSimd, useThreads) => {
    if (useThreads) {
        return useSimd ? 'ort-wasm-simd-threaded.wasm' : 'ort-wasm-threaded.wasm';
    }
    else {
        return useSimd ? 'ort-wasm-simd.wasm' : 'ort-wasm.wasm';
    }
};
const initializeWebAssembly = async (flags) => {
    if (initialized) {
        return Promise.resolve();
    }
    if (initializing) {
        throw new Error('multiple calls to \'initializeWebAssembly()\' detected.');
    }
    if (aborted) {
        throw new Error('previous call to \'initializeWebAssembly()\' failed.');
    }
    initializing = true;
    // wasm flags are already initialized
    const timeout = flags.initTimeout;
    const numThreads = flags.numThreads;
    const simd = flags.simd;
    const useThreads = numThreads > 1 && isMultiThreadSupported();
    const useSimd = simd && isSimdSupported();
    const wasmPrefixOverride = typeof flags.wasmPaths === 'string' ? flags.wasmPaths : undefined;
    const wasmFileName = getWasmFileName(false, useThreads);
    const wasmOverrideFileName = getWasmFileName(useSimd, useThreads);
    const wasmPathOverride = typeof flags.wasmPaths === 'object' ? flags.wasmPaths[wasmOverrideFileName] : undefined;
    let isTimeout = false;
    const tasks = [];
    // promise for timeout
    if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
            setTimeout(() => {
                isTimeout = true;
                resolve();
            }, timeout);
        }));
    }
    // promise for module initialization
    tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ort_wasm_js_1.default;
        const config = {
            locateFile: (fileName, scriptDirectory) => {
                if (!BUILD_DEFS.DISABLE_WASM_THREAD && useThreads && fileName.endsWith('.worker.js') &&
                    typeof Blob !== 'undefined') {
                    return URL.createObjectURL(new Blob([
                        // This require() function is handled by webpack to load file content of the corresponding .worker.js
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        require('./binding/ort-wasm-threaded.worker.js')
                    ], { type: 'text/javascript' }));
                }
                if (fileName === wasmFileName) {
                    const prefix = wasmPrefixOverride !== null && wasmPrefixOverride !== void 0 ? wasmPrefixOverride : scriptDirectory;
                    return wasmPathOverride !== null && wasmPathOverride !== void 0 ? wasmPathOverride : prefix + wasmOverrideFileName;
                }
                return scriptDirectory + fileName;
            }
        };
        if (!BUILD_DEFS.DISABLE_WASM_THREAD && useThreads) {
            if (typeof Blob === 'undefined') {
                config.mainScriptUrlOrBlob = path.join(__dirname, 'ort-wasm-threaded.js');
            }
            else {
                const scriptSourceCode = `var ortWasmThreaded=(function(){var _scriptDir;return ${factory.toString()}})();`;
                config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: 'text/javascript' });
            }
        }
        factory(config).then(
        // wasm module initialized successfully
        module => {
            initializing = false;
            initialized = true;
            wasm = module;
            resolve();
        }, 
        // wasm module failed to initialize
        (what) => {
            initializing = false;
            aborted = true;
            reject(what);
        });
    }));
    await Promise.race(tasks);
    if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
    }
};
exports.initializeWebAssembly = initializeWebAssembly;
const getInstance = () => {
    if (initialized && wasm) {
        return wasm;
    }
    throw new Error('WebAssembly is not initialized yet.');
};
exports.getInstance = getInstance;
const dispose = () => {
    var _a;
    if (initialized && !initializing && !aborted) {
        initializing = true;
        (_a = wasm.PThread) === null || _a === void 0 ? void 0 : _a.terminateAllThreads();
        wasm = undefined;
        initializing = false;
        initialized = false;
        aborted = true;
    }
};
exports.dispose = dispose;
//# sourceMappingURL=wasm-factory.js.map