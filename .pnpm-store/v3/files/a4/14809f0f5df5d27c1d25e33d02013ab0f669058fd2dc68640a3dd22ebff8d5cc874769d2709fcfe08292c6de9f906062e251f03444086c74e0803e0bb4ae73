"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnnxruntimeWebAssemblySessionHandler = void 0;
const fs_1 = require("fs");
const onnxruntime_common_1 = require("onnxruntime-common");
const util_1 = require("util");
const proxy_wrapper_1 = require("./proxy-wrapper");
let ortInit;
const getLogLevel = (logLevel) => {
    switch (logLevel) {
        case 'verbose':
            return 0;
        case 'info':
            return 1;
        case 'warning':
            return 2;
        case 'error':
            return 3;
        case 'fatal':
            return 4;
        default:
            throw new Error(`unsupported logging level: ${logLevel}`);
    }
};
class OnnxruntimeWebAssemblySessionHandler {
    async createSessionAllocate(path) {
        // fetch model from url and move to wasm heap. The arraybufffer that held the http
        // response is freed once we return
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        return (0, proxy_wrapper_1.createSessionAllocate)(new Uint8Array(arrayBuffer));
    }
    async loadModel(pathOrBuffer, options) {
        if (!ortInit) {
            await (0, proxy_wrapper_1.initOrt)(onnxruntime_common_1.env.wasm.numThreads, getLogLevel(onnxruntime_common_1.env.logLevel));
            ortInit = true;
        }
        if (typeof pathOrBuffer === 'string') {
            if (typeof fetch === 'undefined') {
                // node
                const model = await (0, util_1.promisify)(fs_1.readFile)(pathOrBuffer);
                [this.sessionId, this.inputNames, this.outputNames] = await (0, proxy_wrapper_1.createSession)(model, options);
            }
            else {
                // browser
                // fetch model and move to wasm heap.
                const modelData = await this.createSessionAllocate(pathOrBuffer);
                // create the session
                [this.sessionId, this.inputNames, this.outputNames] = await (0, proxy_wrapper_1.createSessionFinalize)(modelData, options);
            }
        }
        else {
            [this.sessionId, this.inputNames, this.outputNames] = await (0, proxy_wrapper_1.createSession)(pathOrBuffer, options);
        }
    }
    async dispose() {
        return (0, proxy_wrapper_1.releaseSession)(this.sessionId);
    }
    async run(feeds, fetches, options) {
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach(kvp => {
            const name = kvp[0];
            const tensor = kvp[1];
            const index = this.inputNames.indexOf(name);
            if (index === -1) {
                throw new Error(`invalid input '${name}'`);
            }
            inputArray.push(tensor);
            inputIndices.push(index);
        });
        const outputIndices = [];
        Object.entries(fetches).forEach(kvp => {
            const name = kvp[0];
            // TODO: support pre-allocated output
            const index = this.outputNames.indexOf(name);
            if (index === -1) {
                throw new Error(`invalid output '${name}'`);
            }
            outputIndices.push(index);
        });
        const outputs = await (0, proxy_wrapper_1.run)(this.sessionId, inputIndices, inputArray.map(t => [t.type, t.dims, t.data]), outputIndices, options);
        const result = {};
        for (let i = 0; i < outputs.length; i++) {
            result[this.outputNames[outputIndices[i]]] = new onnxruntime_common_1.Tensor(outputs[i][0], outputs[i][2], outputs[i][1]);
        }
        return result;
    }
    startProfiling() {
        // TODO: implement profiling
    }
    endProfiling() {
        void (0, proxy_wrapper_1.endProfiling)(this.sessionId);
    }
}
exports.OnnxruntimeWebAssemblySessionHandler = OnnxruntimeWebAssemblySessionHandler;
//# sourceMappingURL=session-handler.js.map