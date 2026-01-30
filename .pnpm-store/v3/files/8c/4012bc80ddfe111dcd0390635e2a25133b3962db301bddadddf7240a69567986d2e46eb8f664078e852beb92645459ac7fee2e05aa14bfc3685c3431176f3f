"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateExtraOptions = void 0;
const iterateExtraOptions = (options, prefix, seen, handler) => {
    if (typeof options == 'object' && options !== null) {
        if (seen.has(options)) {
            throw new Error('Circular reference in options');
        }
        else {
            seen.add(options);
        }
    }
    Object.entries(options).forEach(([key, value]) => {
        const name = (prefix) ? prefix + key : key;
        if (typeof value === 'object') {
            (0, exports.iterateExtraOptions)(value, name + '.', seen, handler);
        }
        else if (typeof value === 'string' || typeof value === 'number') {
            handler(name, value.toString());
        }
        else if (typeof value === 'boolean') {
            handler(name, (value) ? '1' : '0');
        }
        else {
            throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
    });
};
exports.iterateExtraOptions = iterateExtraOptions;
//# sourceMappingURL=options-utils.js.map