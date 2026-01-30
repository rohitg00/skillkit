"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnnxjsSessionHandler = void 0;
const onnxruntime_common_1 = require("onnxruntime-common");
const tensor_1 = require("./tensor");
class OnnxjsSessionHandler {
    constructor(session) {
        this.session = session;
        this.inputNames = this.session.inputNames;
        this.outputNames = this.session.outputNames;
    }
    async dispose() { }
    async run(feeds, _fetches, _options) {
        const inputMap = new Map();
        for (const name in feeds) {
            if (Object.hasOwnProperty.call(feeds, name)) {
                const feed = feeds[name];
                inputMap.set(name, new tensor_1.Tensor(feed.dims, feed.type, undefined, undefined, feed.data));
            }
        }
        const outputMap = await this.session.run(inputMap);
        const output = {};
        outputMap.forEach((tensor, name) => {
            output[name] = new onnxruntime_common_1.Tensor(tensor.type, tensor.data, tensor.dims);
        });
        return output;
    }
    startProfiling() {
        this.session.startProfiling();
    }
    endProfiling() {
        this.session.endProfiling();
    }
}
exports.OnnxjsSessionHandler = OnnxjsSessionHandler;
//# sourceMappingURL=session-handler.js.map