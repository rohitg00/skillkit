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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.endProfiling = exports.run = exports.releaseSession = exports.createSession = exports.createSessionFinalize = exports.createSessionAllocate = exports.initOrt = exports.initWasm = void 0;
const onnxruntime_common_1 = require("onnxruntime-common");
const core = __importStar(require("./wasm-core-impl"));
const wasm_factory_1 = require("./wasm-factory");
const isProxy = () => !!onnxruntime_common_1.env.wasm.proxy && typeof document !== 'undefined';
let proxyWorker;
let initializing = false;
let initialized = false;
let aborted = false;
let initWasmCallbacks;
let initOrtCallbacks;
const createSessionAllocateCallbacks = [];
const createSessionFinalizeCallbacks = [];
const createSessionCallbacks = [];
const releaseSessionCallbacks = [];
const runCallbacks = [];
const endProfilingCallbacks = [];
const ensureWorker = () => {
    if (initializing || !initialized || aborted || !proxyWorker) {
        throw new Error('worker not ready');
    }
};
const onProxyWorkerMessage = (ev) => {
    switch (ev.data.type) {
        case 'init-wasm':
            initializing = false;
            if (ev.data.err) {
                aborted = true;
                initWasmCallbacks[1](ev.data.err);
            }
            else {
                initialized = true;
                initWasmCallbacks[0]();
            }
            break;
        case 'init-ort':
            if (ev.data.err) {
                initOrtCallbacks[1](ev.data.err);
            }
            else {
                initOrtCallbacks[0]();
            }
            break;
        case 'create_allocate':
            if (ev.data.err) {
                createSessionAllocateCallbacks.shift()[1](ev.data.err);
            }
            else {
                createSessionAllocateCallbacks.shift()[0](ev.data.out);
            }
            break;
        case 'create_finalize':
            if (ev.data.err) {
                createSessionFinalizeCallbacks.shift()[1](ev.data.err);
            }
            else {
                createSessionFinalizeCallbacks.shift()[0](ev.data.out);
            }
            break;
        case 'create':
            if (ev.data.err) {
                createSessionCallbacks.shift()[1](ev.data.err);
            }
            else {
                createSessionCallbacks.shift()[0](ev.data.out);
            }
            break;
        case 'release':
            if (ev.data.err) {
                releaseSessionCallbacks.shift()[1](ev.data.err);
            }
            else {
                releaseSessionCallbacks.shift()[0]();
            }
            break;
        case 'run':
            if (ev.data.err) {
                runCallbacks.shift()[1](ev.data.err);
            }
            else {
                runCallbacks.shift()[0](ev.data.out);
            }
            break;
        case 'end-profiling':
            if (ev.data.err) {
                endProfilingCallbacks.shift()[1](ev.data.err);
            }
            else {
                endProfilingCallbacks.shift()[0]();
            }
            break;
        default:
    }
};
const scriptSrc = typeof document !== 'undefined' ? (_a = document === null || document === void 0 ? void 0 : document.currentScript) === null || _a === void 0 ? void 0 : _a.src : undefined;
const initWasm = async () => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        if (initialized) {
            return;
        }
        if (initializing) {
            throw new Error('multiple calls to \'initWasm()\' detected.');
        }
        if (aborted) {
            throw new Error('previous call to \'initWasm()\' failed.');
        }
        initializing = true;
        // overwrite wasm filepaths
        if (onnxruntime_common_1.env.wasm.wasmPaths === undefined) {
            if (scriptSrc && scriptSrc.indexOf('blob:') !== 0) {
                onnxruntime_common_1.env.wasm.wasmPaths = scriptSrc.substr(0, +(scriptSrc).lastIndexOf('/') + 1);
            }
        }
        return new Promise((resolve, reject) => {
            proxyWorker === null || proxyWorker === void 0 ? void 0 : proxyWorker.terminate();
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
            proxyWorker = require('worker-loader?inline=no-fallback!./proxy-worker/main').default();
            proxyWorker.onmessage = onProxyWorkerMessage;
            initWasmCallbacks = [resolve, reject];
            const message = { type: 'init-wasm', in: onnxruntime_common_1.env.wasm };
            proxyWorker.postMessage(message);
        });
    }
    else {
        return (0, wasm_factory_1.initializeWebAssembly)(onnxruntime_common_1.env.wasm);
    }
};
exports.initWasm = initWasm;
const initOrt = async (numThreads, loggingLevel) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            initOrtCallbacks = [resolve, reject];
            const message = { type: 'init-ort', in: { numThreads, loggingLevel } };
            proxyWorker.postMessage(message);
        });
    }
    else {
        core.initOrt(numThreads, loggingLevel);
    }
};
exports.initOrt = initOrt;
const createSessionAllocate = async (model) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            createSessionAllocateCallbacks.push([resolve, reject]);
            const message = { type: 'create_allocate', in: { model } };
            proxyWorker.postMessage(message, [model.buffer]);
        });
    }
    else {
        return core.createSessionAllocate(model);
    }
};
exports.createSessionAllocate = createSessionAllocate;
const createSessionFinalize = async (modeldata, options) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            createSessionFinalizeCallbacks.push([resolve, reject]);
            const message = { type: 'create_finalize', in: { modeldata, options } };
            proxyWorker.postMessage(message);
        });
    }
    else {
        return core.createSessionFinalize(modeldata, options);
    }
};
exports.createSessionFinalize = createSessionFinalize;
const createSession = async (model, options) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            createSessionCallbacks.push([resolve, reject]);
            const message = { type: 'create', in: { model, options } };
            proxyWorker.postMessage(message, [model.buffer]);
        });
    }
    else {
        return core.createSession(model, options);
    }
};
exports.createSession = createSession;
const releaseSession = async (sessionId) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            releaseSessionCallbacks.push([resolve, reject]);
            const message = { type: 'release', in: sessionId };
            proxyWorker.postMessage(message);
        });
    }
    else {
        core.releaseSession(sessionId);
    }
};
exports.releaseSession = releaseSession;
const run = async (sessionId, inputIndices, inputs, outputIndices, options) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            runCallbacks.push([resolve, reject]);
            const message = { type: 'run', in: { sessionId, inputIndices, inputs, outputIndices, options } };
            proxyWorker.postMessage(message, core.extractTransferableBuffers(inputs));
        });
    }
    else {
        return core.run(sessionId, inputIndices, inputs, outputIndices, options);
    }
};
exports.run = run;
const endProfiling = async (sessionId) => {
    if (!BUILD_DEFS.DISABLE_WASM_PROXY && isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
            endProfilingCallbacks.push([resolve, reject]);
            const message = { type: 'end-profiling', in: sessionId };
            proxyWorker.postMessage(message);
        });
    }
    else {
        core.endProfiling(sessionId);
    }
};
exports.endProfiling = endProfiling;
//# sourceMappingURL=proxy-wrapper.js.map