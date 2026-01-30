"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.onnxjsBackend = void 0;
const session_1 = require("./onnxjs/session");
const session_handler_1 = require("./onnxjs/session-handler");
class OnnxjsBackend {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init() { }
    async createSessionHandler(pathOrBuffer, options) {
        // NOTE: Session.Config(from onnx.js) is not compatible with InferenceSession.SessionOptions(from
        // onnxruntime-common).
        //       In future we should remove Session.Config and use InferenceSession.SessionOptions.
        //       Currently we allow this to happen to make test runner work.
        const session = new session_1.Session(options);
        // typescript cannot merge method override correctly (so far in 4.2.3). need if-else to call the method.
        if (typeof pathOrBuffer === 'string') {
            await session.loadModel(pathOrBuffer);
        }
        else {
            await session.loadModel(pathOrBuffer);
        }
        return new session_handler_1.OnnxjsSessionHandler(session);
    }
}
exports.onnxjsBackend = new OnnxjsBackend();
//# sourceMappingURL=backend-onnxjs.js.map