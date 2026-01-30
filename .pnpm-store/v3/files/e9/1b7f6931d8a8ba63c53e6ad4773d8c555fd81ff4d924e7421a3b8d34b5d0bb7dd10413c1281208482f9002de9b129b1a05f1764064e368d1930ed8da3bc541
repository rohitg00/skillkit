"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocWasmString = void 0;
const wasm_factory_1 = require("./wasm-factory");
const allocWasmString = (data, allocs) => {
    const wasm = (0, wasm_factory_1.getInstance)();
    const dataLength = wasm.lengthBytesUTF8(data) + 1;
    const dataOffset = wasm._malloc(dataLength);
    wasm.stringToUTF8(data, dataOffset, dataLength);
    allocs.push(dataOffset);
    return dataOffset;
};
exports.allocWasmString = allocWasmString;
//# sourceMappingURL=string-utils.js.map