"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayGlslLib = void 0;
const glsl_definitions_1 = require("./glsl-definitions");
/**
 * This library produces routines needed for non-constant access to uniform arrays
 */
class ArrayGlslLib extends glsl_definitions_1.GlslLib {
    getFunctions() {
        return this.generate();
    }
    getCustomTypes() {
        return {};
    }
    constructor(context) {
        super(context);
    }
    generate() {
        const result = {};
        for (let i = 1; i <= 16; i++) {
            result[`setItem${i}`] = new glsl_definitions_1.GlslLibRoutine(this.generateSetItem(i));
            result[`getItem${i}`] = new glsl_definitions_1.GlslLibRoutine(this.generateGetItem(i));
        }
        return result;
    }
    generateSetItem(length) {
        let block = `
       if(index < 0)
           index = ${length} + index;
       if (index == 0)
           a[0] = value;
       `;
        for (let i = 1; i < length - 1; ++i) {
            block += `
       else if (index == ${i})
           a[${i}] = value;
           `;
        }
        block += `
       else
           a[${length - 1}] = value;
       `;
        const body = `
     void setItem${length}(out float a[${length}], int index, float value) {
       ${block}
     }
       `;
        return body;
    }
    generateGetItem(length) {
        let block = `
       if(index < 0)
           index = ${length} + index;
       if (index == 0)
           return a[0];
     `;
        for (let i = 1; i < length - 1; ++i) {
            block += `
       else if (index == ${i})
           return a[${i}];
     `;
        }
        block += `
       else
           return a[${length - 1}];
       `;
        const body = `
     float getItem${length}(float a[${length}], int index) {
       ${block}
     }
   `;
        return body;
    }
}
exports.ArrayGlslLib = ArrayGlslLib;
//# sourceMappingURL=glsl-array-lib.js.map