"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRunOptions = void 0;
const options_utils_1 = require("./options-utils");
const string_utils_1 = require("./string-utils");
const wasm_factory_1 = require("./wasm-factory");
const setRunOptions = (options) => {
    const wasm = (0, wasm_factory_1.getInstance)();
    let runOptionsHandle = 0;
    const allocs = [];
    const runOptions = options || {};
    try {
        if ((options === null || options === void 0 ? void 0 : options.logSeverityLevel) === undefined) {
            runOptions.logSeverityLevel = 2; // Default to warning
        }
        else if (typeof options.logSeverityLevel !== 'number' || !Number.isInteger(options.logSeverityLevel) ||
            options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
            throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if ((options === null || options === void 0 ? void 0 : options.logVerbosityLevel) === undefined) {
            runOptions.logVerbosityLevel = 0; // Default to 0
        }
        else if (typeof options.logVerbosityLevel !== 'number' || !Number.isInteger(options.logVerbosityLevel)) {
            throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if ((options === null || options === void 0 ? void 0 : options.terminate) === undefined) {
            runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if ((options === null || options === void 0 ? void 0 : options.tag) !== undefined) {
            tagDataOffset = (0, string_utils_1.allocWasmString)(options.tag, allocs);
        }
        runOptionsHandle = wasm._OrtCreateRunOptions(runOptions.logSeverityLevel, runOptions.logVerbosityLevel, !!runOptions.terminate, tagDataOffset);
        if (runOptionsHandle === 0) {
            throw new Error('Can\'t create run options');
        }
        if ((options === null || options === void 0 ? void 0 : options.extra) !== undefined) {
            (0, options_utils_1.iterateExtraOptions)(options.extra, '', new WeakSet(), (key, value) => {
                const keyDataOffset = (0, string_utils_1.allocWasmString)(key, allocs);
                const valueDataOffset = (0, string_utils_1.allocWasmString)(value, allocs);
                if (wasm._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                    throw new Error(`Can't set a run config entry: ${key} - ${value}`);
                }
            });
        }
        return [runOptionsHandle, allocs];
    }
    catch (e) {
        if (runOptionsHandle !== 0) {
            wasm._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach(wasm._free);
        throw e;
    }
};
exports.setRunOptions = setRunOptions;
//# sourceMappingURL=run-options.js.map