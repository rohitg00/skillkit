"use strict";
/**
 * Copyright (C) 2016-2020 Michael Kourlas
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = exports.isMap = exports.isSet = exports.isFunction = exports.isArray = exports.isObject = exports.isNull = exports.isUndefined = void 0;
function isUndefined(val) {
    return Object.prototype.toString.call(val) === "[object Undefined]";
}
exports.isUndefined = isUndefined;
function isNull(val) {
    return Object.prototype.toString.call(val) === "[object Null]";
}
exports.isNull = isNull;
function isObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
}
exports.isObject = isObject;
function isArray(val) {
    return Object.prototype.toString.call(val) === "[object Array]";
}
exports.isArray = isArray;
// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(val) {
    return Object.prototype.toString.call(val) === "[object Function]";
}
exports.isFunction = isFunction;
function isSet(val) {
    return Object.prototype.toString.call(val) === "[object Set]";
}
exports.isSet = isSet;
function isMap(val) {
    return Object.prototype.toString.call(val) === "[object Map]";
}
exports.isMap = isMap;
/**
 * Returns a string representation of the specified value, as given by the
 * value's toString() method (if it has one) or the global String() function
 * (if it does not).
 *
 * @param value The value to convert to a string.
 *
 * @returns A string representation of the specified value.
 */
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
function stringify(value) {
    if (!isUndefined(value) && !isNull(value)) {
        if (isFunction(value === null || value === void 0 ? void 0 : value.toString)) {
            value = value.toString();
        }
    }
    return String(value);
}
exports.stringify = stringify;
