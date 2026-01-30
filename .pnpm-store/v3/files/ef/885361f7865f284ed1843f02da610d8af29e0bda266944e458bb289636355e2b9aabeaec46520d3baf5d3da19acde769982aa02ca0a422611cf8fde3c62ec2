const simpleKeyRegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function getPrintable(value) {
    if (value === null)
        return `null`;
    if (value === undefined)
        return `undefined`;
    if (value === ``)
        return `an empty string`;
    if (typeof value === 'symbol')
        return `<${value.toString()}>`;
    if (Array.isArray(value))
        return `an array`;
    return JSON.stringify(value);
}
function getPrintableArray(value, conjunction) {
    if (value.length === 0)
        return `nothing`;
    if (value.length === 1)
        return getPrintable(value[0]);
    const rest = value.slice(0, -1);
    const trailing = value[value.length - 1];
    const separator = value.length > 2
        ? `, ${conjunction} `
        : ` ${conjunction} `;
    return `${rest.map(value => getPrintable(value)).join(`, `)}${separator}${getPrintable(trailing)}`;
}
function computeKey(state, key) {
    var _a, _b, _c;
    if (typeof key === `number`) {
        return `${(_a = state === null || state === void 0 ? void 0 : state.p) !== null && _a !== void 0 ? _a : `.`}[${key}]`;
    }
    else if (simpleKeyRegExp.test(key)) {
        return `${(_b = state === null || state === void 0 ? void 0 : state.p) !== null && _b !== void 0 ? _b : ``}.${key}`;
    }
    else {
        return `${(_c = state === null || state === void 0 ? void 0 : state.p) !== null && _c !== void 0 ? _c : `.`}[${JSON.stringify(key)}]`;
    }
}
function plural(n, singular, plural) {
    return n === 1 ? singular : plural;
}

const colorStringRegExp = /^#[0-9a-f]{6}$/i;
const colorStringAlphaRegExp = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
// https://stackoverflow.com/a/475217/880703
const base64RegExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
// https://stackoverflow.com/a/14166194/880703
const uuid4RegExp = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/i;
// https://stackoverflow.com/a/28022901/880703 + https://www.debuggex.com/r/bl8J35wMKk48a7u_
const iso8601RegExp = /^(?:[1-9]\d{3}(-?)(?:(?:0[1-9]|1[0-2])\1(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])\1(?:29|30)|(?:0[13578]|1[02])(?:\1)31|00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[0-5]))|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)(?:(-?)02(?:\2)29|-?366))T(?:[01]\d|2[0-3])(:?)[0-5]\d(?:\3[0-5]\d)?(?:Z|[+-][01]\d(?:\3[0-5]\d)?)$/;

function pushError({ errors, p } = {}, message) {
    errors === null || errors === void 0 ? void 0 : errors.push(`${p !== null && p !== void 0 ? p : `.`}: ${message}`);
    return false;
}
function makeSetter(target, key) {
    return (v) => {
        target[key] = v;
    };
}
function makeCoercionFn(target, key) {
    return (v) => {
        const previous = target[key];
        target[key] = v;
        return makeCoercionFn(target, key).bind(null, previous);
    };
}
function makeLazyCoercionFn(fn, orig, generator) {
    const commit = () => {
        fn(generator());
        return revert;
    };
    const revert = () => {
        fn(orig);
        return commit;
    };
    return commit;
}

/**
 * Create a validator that always returns true and never refines the type.
 */
function isUnknown() {
    return makeValidator({
        test: (value, state) => {
            return true;
        },
    });
}
function isLiteral(expected) {
    return makeValidator({
        test: (value, state) => {
            if (value !== expected)
                return pushError(state, `Expected ${getPrintable(expected)} (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is a string.
 * Refines the type to `string`.
 */
function isString() {
    return makeValidator({
        test: (value, state) => {
            if (typeof value !== `string`)
                return pushError(state, `Expected a string (got ${getPrintable(value)})`);
            return true;
        },
    });
}
function isEnum(enumSpec) {
    const valuesArray = Array.isArray(enumSpec) ? enumSpec : Object.values(enumSpec);
    const isAlphaNum = valuesArray.every(item => typeof item === 'string' || typeof item === 'number');
    const values = new Set(valuesArray);
    if (values.size === 1)
        return isLiteral([...values][0]);
    return makeValidator({
        test: (value, state) => {
            if (!values.has(value)) {
                if (isAlphaNum) {
                    return pushError(state, `Expected one of ${getPrintableArray(valuesArray, `or`)} (got ${getPrintable(value)})`);
                }
                else {
                    return pushError(state, `Expected a valid enumeration value (got ${getPrintable(value)})`);
                }
            }
            return true;
        },
    });
}
const BOOLEAN_COERCIONS = new Map([
    [`true`, true],
    [`True`, true],
    [`1`, true],
    [1, true],
    [`false`, false],
    [`False`, false],
    [`0`, false],
    [0, false],
]);
/**
 * Create a validator that only returns true when the tested value is a
 * boolean. Refines the type to `boolean`.
 *
 * Supports coercion:
 * - 'true' / 'True' / '1' / 1 will turn to `true`
 * - 'false' / 'False' / '0' / 0 will turn to `false`
 */
function isBoolean() {
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (typeof value !== `boolean`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    const coercion = BOOLEAN_COERCIONS.get(value);
                    if (typeof coercion !== `undefined`) {
                        state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                        return true;
                    }
                }
                return pushError(state, `Expected a boolean (got ${getPrintable(value)})`);
            }
            return true;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is a
 * number (including floating numbers; use `cascade` and `isInteger` to
 * restrict the range further). Refines the type to `number`.
 *
 * Supports coercion.
 */
function isNumber() {
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (typeof value !== `number`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    let coercion;
                    if (typeof value === `string`) {
                        let val;
                        try {
                            val = JSON.parse(value);
                        }
                        catch (_b) { }
                        // We check against JSON.stringify that the output is the same to ensure that the number can be safely represented in JS
                        if (typeof val === `number`) {
                            if (JSON.stringify(val) === value) {
                                coercion = val;
                            }
                            else {
                                return pushError(state, `Received a number that can't be safely represented by the runtime (${value})`);
                            }
                        }
                    }
                    if (typeof coercion !== `undefined`) {
                        state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                        return true;
                    }
                }
                return pushError(state, `Expected a number (got ${getPrintable(value)})`);
            }
            return true;
        },
    });
}
/**
 * Important: This validator only makes sense when used in conjunction with
 * coercion! It will always error when used without.
 *
 * Create a validator that only returns true when the tested value is a
 * JSON representation of the expected type. Refines the type to the
 * expected type, and casts the value into its inner value.
 */
function isPayload(spec) {
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) === `undefined`)
                return pushError(state, `The isPayload predicate can only be used with coercion enabled`);
            if (typeof state.coercion === `undefined`)
                return pushError(state, `Unbound coercion result`);
            if (typeof value !== `string`)
                return pushError(state, `Expected a string (got ${getPrintable(value)})`);
            let inner;
            try {
                inner = JSON.parse(value);
            }
            catch (_b) {
                return pushError(state, `Expected a JSON string (got ${getPrintable(value)})`);
            }
            const wrapper = { value: inner };
            if (!spec(inner, Object.assign(Object.assign({}, state), { coercion: makeCoercionFn(wrapper, `value`) })))
                return false;
            state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, wrapper.value)]);
            return true;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is a
 * valid date. Refines the type to `Date`.
 *
 * Supports coercion via one of the following formats:
 * - ISO86001 strings
 * - Unix timestamps
 */
function isDate() {
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (!(value instanceof Date)) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    let coercion;
                    if (typeof value === `string` && iso8601RegExp.test(value)) {
                        coercion = new Date(value);
                    }
                    else {
                        let timestamp;
                        if (typeof value === `string`) {
                            let val;
                            try {
                                val = JSON.parse(value);
                            }
                            catch (_b) { }
                            if (typeof val === `number`) {
                                timestamp = val;
                            }
                        }
                        else if (typeof value === `number`) {
                            timestamp = value;
                        }
                        if (typeof timestamp !== `undefined`) {
                            if (Number.isSafeInteger(timestamp) || !Number.isSafeInteger(timestamp * 1000)) {
                                coercion = new Date(timestamp * 1000);
                            }
                            else {
                                return pushError(state, `Received a timestamp that can't be safely represented by the runtime (${value})`);
                            }
                        }
                    }
                    if (typeof coercion !== `undefined`) {
                        state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, coercion)]);
                        return true;
                    }
                }
                return pushError(state, `Expected a date (got ${getPrintable(value)})`);
            }
            return true;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is an
 * array whose all values match the provided subspec. Refines the type to
 * `Array<T>`, with `T` being the subspec inferred type.
 *
 * Supports coercion if the `delimiter` option is set, in which case strings
 * will be split accordingly.
 */
function isArray(spec, { delimiter } = {}) {
    return makeValidator({
        test: (value, state) => {
            var _a;
            const originalValue = value;
            if (typeof value === `string` && typeof delimiter !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    value = value.split(delimiter);
                }
            }
            if (!Array.isArray(value))
                return pushError(state, `Expected an array (got ${getPrintable(value)})`);
            let valid = true;
            for (let t = 0, T = value.length; t < T; ++t) {
                valid = spec(value[t], Object.assign(Object.assign({}, state), { p: computeKey(state, t), coercion: makeCoercionFn(value, t) })) && valid;
                if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                    break;
                }
            }
            if (value !== originalValue)
                state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, value)]);
            return valid;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is an
 * set whose all values match the provided subspec. Refines the type to
 * `Set<T>`, with `T` being the subspec inferred type.
 *
 * Supports coercion from arrays (or anything that can be coerced into an
 * array).
 */
function isSet(spec, { delimiter } = {}) {
    const isArrayValidator = isArray(spec, { delimiter });
    return makeValidator({
        test: (value, state) => {
            var _a, _b;
            if (Object.getPrototypeOf(value).toString() === `[object Set]`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    const originalValues = [...value];
                    const coercedValues = [...value];
                    if (!isArrayValidator(coercedValues, Object.assign(Object.assign({}, state), { coercion: undefined })))
                        return false;
                    const updateValue = () => coercedValues.some((val, t) => val !== originalValues[t])
                        ? new Set(coercedValues)
                        : value;
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, makeLazyCoercionFn(state.coercion, value, updateValue)]);
                    return true;
                }
                else {
                    let valid = true;
                    for (const subValue of value) {
                        valid = spec(subValue, Object.assign({}, state)) && valid;
                        if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                            break;
                        }
                    }
                    return valid;
                }
            }
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                const store = { value };
                if (!isArrayValidator(value, Object.assign(Object.assign({}, state), { coercion: makeCoercionFn(store, `value`) })))
                    return false;
                state.coercions.push([(_b = state.p) !== null && _b !== void 0 ? _b : `.`, makeLazyCoercionFn(state.coercion, value, () => new Set(store.value))]);
                return true;
            }
            return pushError(state, `Expected a set (got ${getPrintable(value)})`);
        }
    });
}
/**
 * Create a validator that only returns true when the tested value is an
 * map whose all values match the provided subspecs. Refines the type to
 * `Map<U, V>`, with `U` being the key subspec inferred type and `V` being
 * the value subspec inferred type.
 *
 * Supports coercion from array of tuples (or anything that can be coerced into
 * an array of tuples).
 */
function isMap(keySpec, valueSpec) {
    const isArrayValidator = isArray(isTuple([keySpec, valueSpec]));
    const isRecordValidator = isRecord(valueSpec, { keys: keySpec });
    return makeValidator({
        test: (value, state) => {
            var _a, _b, _c;
            if (Object.getPrototypeOf(value).toString() === `[object Map]`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    const originalValues = [...value];
                    const coercedValues = [...value];
                    if (!isArrayValidator(coercedValues, Object.assign(Object.assign({}, state), { coercion: undefined })))
                        return false;
                    const updateValue = () => coercedValues.some((val, t) => val[0] !== originalValues[t][0] || val[1] !== originalValues[t][1])
                        ? new Map(coercedValues)
                        : value;
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, makeLazyCoercionFn(state.coercion, value, updateValue)]);
                    return true;
                }
                else {
                    let valid = true;
                    for (const [key, subValue] of value) {
                        valid = keySpec(key, Object.assign({}, state)) && valid;
                        if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                            break;
                        }
                        valid = valueSpec(subValue, Object.assign(Object.assign({}, state), { p: computeKey(state, key) })) && valid;
                        if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                            break;
                        }
                    }
                    return valid;
                }
            }
            if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                    return pushError(state, `Unbound coercion result`);
                const store = { value };
                if (Array.isArray(value)) {
                    if (!isArrayValidator(value, Object.assign(Object.assign({}, state), { coercion: undefined })))
                        return false;
                    state.coercions.push([(_b = state.p) !== null && _b !== void 0 ? _b : `.`, makeLazyCoercionFn(state.coercion, value, () => new Map(store.value))]);
                    return true;
                }
                else {
                    if (!isRecordValidator(value, Object.assign(Object.assign({}, state), { coercion: makeCoercionFn(store, `value`) })))
                        return false;
                    state.coercions.push([(_c = state.p) !== null && _c !== void 0 ? _c : `.`, makeLazyCoercionFn(state.coercion, value, () => new Map(Object.entries(store.value)))]);
                    return true;
                }
            }
            return pushError(state, `Expected a map (got ${getPrintable(value)})`);
        }
    });
}
/**
 * Create a validator that only returns true when the tested value is a
 * tuple whose each value matches the corresponding subspec. Refines the type
 * into a tuple whose each item has the type inferred by the corresponding
 * tuple.
 *
 * Supports coercion if the `delimiter` option is set, in which case strings
 * will be split accordingly.
 */
function isTuple(spec, { delimiter } = {}) {
    const lengthValidator = hasExactLength(spec.length);
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (typeof value === `string` && typeof delimiter !== `undefined`) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    value = value.split(delimiter);
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, value)]);
                }
            }
            if (!Array.isArray(value))
                return pushError(state, `Expected a tuple (got ${getPrintable(value)})`);
            let valid = lengthValidator(value, Object.assign({}, state));
            for (let t = 0, T = value.length; t < T && t < spec.length; ++t) {
                valid = spec[t](value[t], Object.assign(Object.assign({}, state), { p: computeKey(state, t), coercion: makeCoercionFn(value, t) })) && valid;
                if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                    break;
                }
            }
            return valid;
        },
    });
}
/**
 * Create a validator that only returns true when the tested value is an
 * object with any amount of properties that must all match the provided
 * subspec. Refines the type to `Record<string, T>`, with `T` being the
 * subspec inferred type.
 *
 * Keys can be optionally validated as well by using the `keys` optional
 * subspec parameter.
 */
function isRecord(spec, { keys: keySpec = null, } = {}) {
    const isArrayValidator = isArray(isTuple([keySpec !== null && keySpec !== void 0 ? keySpec : isString(), spec]));
    return makeValidator({
        test: (value, state) => {
            var _a;
            if (Array.isArray(value)) {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                        return pushError(state, `Unbound coercion result`);
                    if (!isArrayValidator(value, Object.assign(Object.assign({}, state), { coercion: undefined })))
                        return false;
                    value = Object.fromEntries(value);
                    state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, value)]);
                    return true;
                }
            }
            if (typeof value !== `object` || value === null)
                return pushError(state, `Expected an object (got ${getPrintable(value)})`);
            const keys = Object.keys(value);
            let valid = true;
            for (let t = 0, T = keys.length; t < T && (valid || (state === null || state === void 0 ? void 0 : state.errors) != null); ++t) {
                const key = keys[t];
                const sub = value[key];
                if (key === `__proto__` || key === `constructor`) {
                    valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Unsafe property name`);
                    continue;
                }
                if (keySpec !== null && !keySpec(key, state)) {
                    valid = false;
                    continue;
                }
                if (!spec(sub, Object.assign(Object.assign({}, state), { p: computeKey(state, key), coercion: makeCoercionFn(value, key) }))) {
                    valid = false;
                    continue;
                }
            }
            return valid;
        },
    });
}
/**
 * @deprecated Replace `isDict` by `isRecord`
 */
function isDict(spec, opts = {}) {
    return isRecord(spec, opts);
}
/**
 * Create a validator that only returns true when the tested value is an
 * object whose all properties match their corresponding subspec. Refines
 * the type into an object whose each property has the type inferred by the
 * corresponding subspec.
 *
 * Unlike `t.isPartial`, `t.isObject` doesn't allow extraneous properties by
 * default. This behaviour can be altered by using the `extra` optional
 * subspec parameter, which will be called to validate an object only
 * containing the extraneous properties.
 *
 * Calling `t.isObject(..., {extra: t.isRecord(t.isUnknown())})` is
 * essentially the same as calling `t.isPartial(...)`.
 */
function isObject(props, { extra: extraSpec = null, } = {}) {
    const specKeys = Object.keys(props);
    const validator = makeValidator({
        test: (value, state) => {
            if (typeof value !== `object` || value === null)
                return pushError(state, `Expected an object (got ${getPrintable(value)})`);
            const keys = new Set([...specKeys, ...Object.keys(value)]);
            const extra = {};
            let valid = true;
            for (const key of keys) {
                if (key === `constructor` || key === `__proto__`) {
                    valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Unsafe property name`);
                }
                else {
                    const spec = Object.prototype.hasOwnProperty.call(props, key)
                        ? props[key]
                        : undefined;
                    const sub = Object.prototype.hasOwnProperty.call(value, key)
                        ? value[key]
                        : undefined;
                    if (typeof spec !== `undefined`) {
                        valid = spec(sub, Object.assign(Object.assign({}, state), { p: computeKey(state, key), coercion: makeCoercionFn(value, key) })) && valid;
                    }
                    else if (extraSpec === null) {
                        valid = pushError(Object.assign(Object.assign({}, state), { p: computeKey(state, key) }), `Extraneous property (got ${getPrintable(sub)})`);
                    }
                    else {
                        Object.defineProperty(extra, key, {
                            enumerable: true,
                            get: () => sub,
                            set: makeSetter(value, key)
                        });
                    }
                }
                if (!valid && (state === null || state === void 0 ? void 0 : state.errors) == null) {
                    break;
                }
            }
            if (extraSpec !== null && (valid || (state === null || state === void 0 ? void 0 : state.errors) != null))
                valid = extraSpec(extra, state) && valid;
            return valid;
        },
    });
    return Object.assign(validator, {
        properties: props,
    });
}
/**
 * Create a validator that only returns true when the tested value is an
 * object whose all properties match their corresponding subspec. Refines
 * the type into an object whose each property has the type inferred by the
 * corresponding subspec.
 *
 * Unlike `t.isObject`, `t.isPartial` allows extraneous properties. The
 * resulting type will reflect this behaviour by including an index
 * signature (each extraneous property being typed `unknown`).
 *
 * Calling `t.isPartial(...)` is essentially the same as calling
 * `t.isObject(..., {extra: t.isRecord(t.isUnknown())})`.
 */
function isPartial(props) {
    return isObject(props, { extra: isRecord(isUnknown()) });
}
/**
 * Create a validator that only returns true when the tested value is an
 * object whose prototype is derived from the given class. Refines the type
 * into a class instance.
 */
const isInstanceOf = (constructor) => makeValidator({
    test: (value, state) => {
        if (!(value instanceof constructor))
            return pushError(state, `Expected an instance of ${constructor.name} (got ${getPrintable(value)})`);
        return true;
    },
});
/**
 * Create a validator that only returns true when the tested value is an
 * object matching any of the provided subspecs. If the optional `exclusive`
 * parameter is set to `true`, the behaviour changes so that the validator
 * only returns true when exactly one subspec matches.
 */
const isOneOf = (specs, { exclusive = false, } = {}) => makeValidator({
    test: (value, state) => {
        var _a, _b, _c;
        const matches = [];
        const errorBuffer = typeof (state === null || state === void 0 ? void 0 : state.errors) !== `undefined`
            ? [] : undefined;
        for (let t = 0, T = specs.length; t < T; ++t) {
            const subErrors = typeof (state === null || state === void 0 ? void 0 : state.errors) !== `undefined`
                ? [] : undefined;
            const subCoercions = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
                ? [] : undefined;
            if (specs[t](value, Object.assign(Object.assign({}, state), { errors: subErrors, coercions: subCoercions, p: `${(_a = state === null || state === void 0 ? void 0 : state.p) !== null && _a !== void 0 ? _a : `.`}#${t + 1}` }))) {
                matches.push([`#${t + 1}`, subCoercions]);
                if (!exclusive) {
                    break;
                }
            }
            else {
                errorBuffer === null || errorBuffer === void 0 ? void 0 : errorBuffer.push(subErrors[0]);
            }
        }
        if (matches.length === 1) {
            const [, subCoercions] = matches[0];
            if (typeof subCoercions !== `undefined`)
                (_b = state === null || state === void 0 ? void 0 : state.coercions) === null || _b === void 0 ? void 0 : _b.push(...subCoercions);
            return true;
        }
        if (matches.length > 1)
            pushError(state, `Expected to match exactly a single predicate (matched ${matches.join(`, `)})`);
        else
            (_c = state === null || state === void 0 ? void 0 : state.errors) === null || _c === void 0 ? void 0 : _c.push(...errorBuffer);
        return false;
    },
});

function makeTrait(value) {
    return () => {
        return value;
    };
}
function makeValidator({ test }) {
    return makeTrait(test)();
}
class TypeAssertionError extends Error {
    constructor({ errors } = {}) {
        let errorMessage = `Type mismatch`;
        if (errors && errors.length > 0) {
            errorMessage += `\n`;
            for (const error of errors) {
                errorMessage += `\n- ${error}`;
            }
        }
        super(errorMessage);
    }
}
/**
 * Check that the specified value matches the given validator, and throws an
 * exception if it doesn't. Refine the type if it passes.
 */
function assert(val, validator) {
    if (!validator(val)) {
        throw new TypeAssertionError();
    }
}
/**
 * Check that the specified value matches the given validator, and throws an
 * exception if it doesn't. Refine the type if it passes.
 *
 * Thrown exceptions include details about what exactly looks invalid in the
 * tested value.
 */
function assertWithErrors(val, validator) {
    const errors = [];
    if (!validator(val, { errors })) {
        throw new TypeAssertionError({ errors });
    }
}
/**
 * Compile-time only. Refine the type as if the validator was matching the
 * tested value, but doesn't actually run it. Similar to the classic `as`
 * operator in TypeScript.
 */
function softAssert(val, validator) {
    // It's a soft assert; we tell TypeScript about the type, but we don't need to check it
}
function as(value, validator, { coerce = false, errors: storeErrors, throw: throws } = {}) {
    const errors = storeErrors ? [] : undefined;
    if (!coerce) {
        if (validator(value, { errors })) {
            return throws ? value : { value, errors: undefined };
        }
        else if (!throws) {
            return { value: undefined, errors: errors !== null && errors !== void 0 ? errors : true };
        }
        else {
            throw new TypeAssertionError({ errors });
        }
    }
    const state = { value };
    const coercion = makeCoercionFn(state, `value`);
    const coercions = [];
    if (!validator(value, { errors, coercion, coercions })) {
        if (!throws) {
            return { value: undefined, errors: errors !== null && errors !== void 0 ? errors : true };
        }
        else {
            throw new TypeAssertionError({ errors });
        }
    }
    for (const [, apply] of coercions)
        apply();
    if (throws) {
        return state.value;
    }
    else {
        return { value: state.value, errors: undefined };
    }
}
/**
 * Create and return a new function that apply the given validators to each
 * corresponding argument passed to the function and throws an exception in
 * case of a mismatch.
 */
function fn(validators, fn) {
    const isValidArgList = isTuple(validators);
    return ((...args) => {
        const check = isValidArgList(args);
        if (!check)
            throw new TypeAssertionError();
        return fn(...args);
    });
}

/**
 * Create a validator that checks that the tested array or string has at least
 * the specified length.
 */
function hasMinLength(length) {
    return makeValidator({
        test: (value, state) => {
            if (!(value.length >= length))
                return pushError(state, `Expected to have a length of at least ${length} elements (got ${value.length})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested array or string has at most
 * the specified length.
 */
function hasMaxLength(length) {
    return makeValidator({
        test: (value, state) => {
            if (!(value.length <= length))
                return pushError(state, `Expected to have a length of at most ${length} elements (got ${value.length})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested array or string has exactly
 * the specified length.
 */
function hasExactLength(length) {
    return makeValidator({
        test: (value, state) => {
            if (!(value.length === length))
                return pushError(state, `Expected to have a length of exactly ${length} elements (got ${value.length})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested array only contains unique
 * elements. The optional `map` parameter lets you define a transform to
 * apply before making the check (the result of this transform will be
 * discarded afterwards).
 */
function hasUniqueItems({ map, } = {}) {
    return makeValidator({
        test: (value, state) => {
            const set = new Set();
            const dup = new Set();
            for (let t = 0, T = value.length; t < T; ++t) {
                const sub = value[t];
                const key = typeof map !== `undefined`
                    ? map(sub)
                    : sub;
                if (set.has(key)) {
                    if (dup.has(key))
                        continue;
                    pushError(state, `Expected to contain unique elements; got a duplicate with ${getPrintable(value)}`);
                    dup.add(key);
                }
                else {
                    set.add(key);
                }
            }
            return dup.size === 0;
        },
    });
}
/**
 * Create a validator that checks that the tested number is strictly less than 0.
 */
function isNegative() {
    return makeValidator({
        test: (value, state) => {
            if (!(value <= 0))
                return pushError(state, `Expected to be negative (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is equal or greater
 * than 0.
 */
function isPositive() {
    return makeValidator({
        test: (value, state) => {
            if (!(value >= 0))
                return pushError(state, `Expected to be positive (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is equal or greater
 * than the specified reference.
 */
function isAtLeast(n) {
    return makeValidator({
        test: (value, state) => {
            if (!(value >= n))
                return pushError(state, `Expected to be at least ${n} (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is equal or smaller
 * than the specified reference.
 */
function isAtMost(n) {
    return makeValidator({
        test: (value, state) => {
            if (!(value <= n))
                return pushError(state, `Expected to be at most ${n} (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is between the
 * specified references (including the upper boundary).
 */
function isInInclusiveRange(a, b) {
    return makeValidator({
        test: (value, state) => {
            if (!(value >= a && value <= b))
                return pushError(state, `Expected to be in the [${a}; ${b}] range (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is between the
 * specified references (excluding the upper boundary).
 */
function isInExclusiveRange(a, b) {
    return makeValidator({
        test: (value, state) => {
            if (!(value >= a && value < b))
                return pushError(state, `Expected to be in the [${a}; ${b}[ range (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested number is an integer.
 *
 * By default Typanion will also check that it's a *safe* integer. For example,
 * 2^53 wouldn't be a safe integer because 2^53+1 would be rounded to 2^53,
 * which could put your applications at risk when used in loops.
 */
function isInteger({ unsafe = false, } = {}) {
    return makeValidator({
        test: (value, state) => {
            if (value !== Math.round(value))
                return pushError(state, `Expected to be an integer (got ${value})`);
            if (!unsafe && !Number.isSafeInteger(value))
                return pushError(state, `Expected to be a safe integer (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string matches the given
 * regular expression.
 */
function matchesRegExp(regExp) {
    return makeValidator({
        test: (value, state) => {
            if (!regExp.test(value))
                return pushError(state, `Expected to match the pattern ${regExp.toString()} (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string only contain lowercase
 * characters.
 */
function isLowerCase() {
    return makeValidator({
        test: (value, state) => {
            if (value !== value.toLowerCase())
                return pushError(state, `Expected to be all-lowercase (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string only contain uppercase
 * characters.
 */
function isUpperCase() {
    return makeValidator({
        test: (value, state) => {
            if (value !== value.toUpperCase())
                return pushError(state, `Expected to be all-uppercase (got ${value})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string is a valid UUID v4.
 */
function isUUID4() {
    return makeValidator({
        test: (value, state) => {
            if (!uuid4RegExp.test(value))
                return pushError(state, `Expected to be a valid UUID v4 (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string is a valid ISO8601
 * date.
 */
function isISO8601() {
    return makeValidator({
        test: (value, state) => {
            if (!iso8601RegExp.test(value))
                return pushError(state, `Expected to be a valid ISO 8601 date string (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string is a valid hexadecimal
 * color. Setting the optional `alpha` parameter to `true` allows an additional
 * transparency channel to be included.
 */
function isHexColor({ alpha = false, }) {
    return makeValidator({
        test: (value, state) => {
            const res = alpha
                ? colorStringRegExp.test(value)
                : colorStringAlphaRegExp.test(value);
            if (!res)
                return pushError(state, `Expected to be a valid hexadecimal color string (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string is valid base64.
 */
function isBase64() {
    return makeValidator({
        test: (value, state) => {
            if (!base64RegExp.test(value))
                return pushError(state, `Expected to be a valid base 64 string (got ${getPrintable(value)})`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested string is valid JSON. A
 * optional spec can be passed as parameter, in which case the data will be
 * deserialized and validated against the spec (coercion will be disabled
 * for this check, and even if successful the returned value will still be
 * the original string).
 */
function isJSON(spec = isUnknown()) {
    return makeValidator({
        test: (value, state) => {
            let data;
            try {
                data = JSON.parse(value);
            }
            catch (_a) {
                return pushError(state, `Expected to be a valid JSON string (got ${getPrintable(value)})`);
            }
            return spec(data, state);
        },
    });
}

function cascade(spec, ...followups) {
    const resolvedFollowups = Array.isArray(followups[0])
        ? followups[0]
        : followups;
    return makeValidator({
        test: (value, state) => {
            var _a, _b;
            const context = { value: value };
            const subCoercion = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
                ? makeCoercionFn(context, `value`) : undefined;
            const subCoercions = typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`
                ? [] : undefined;
            if (!spec(value, Object.assign(Object.assign({}, state), { coercion: subCoercion, coercions: subCoercions })))
                return false;
            const reverts = [];
            if (typeof subCoercions !== `undefined`)
                for (const [, coercion] of subCoercions)
                    reverts.push(coercion());
            try {
                if (typeof (state === null || state === void 0 ? void 0 : state.coercions) !== `undefined`) {
                    if (context.value !== value) {
                        if (typeof (state === null || state === void 0 ? void 0 : state.coercion) === `undefined`)
                            return pushError(state, `Unbound coercion result`);
                        state.coercions.push([(_a = state.p) !== null && _a !== void 0 ? _a : `.`, state.coercion.bind(null, context.value)]);
                    }
                    (_b = state === null || state === void 0 ? void 0 : state.coercions) === null || _b === void 0 ? void 0 : _b.push(...subCoercions);
                }
                return resolvedFollowups.every(spec => {
                    return spec(context.value, state);
                });
            }
            finally {
                for (const revert of reverts) {
                    revert();
                }
            }
        },
    });
}
function applyCascade(spec, ...followups) {
    const resolvedFollowups = Array.isArray(followups[0])
        ? followups[0]
        : followups;
    return cascade(spec, resolvedFollowups);
}
/**
 * Wraps the given spec to also allow `undefined`.
 */
function isOptional(spec) {
    return makeValidator({
        test: (value, state) => {
            if (typeof value === `undefined`)
                return true;
            return spec(value, state);
        },
    });
}
/**
 * Wraps the given spec to also allow `null`.
 */
function isNullable(spec) {
    return makeValidator({
        test: (value, state) => {
            if (value === null)
                return true;
            return spec(value, state);
        },
    });
}
const checks = {
    missing: (keys, key) => keys.has(key),
    undefined: (keys, key, value) => keys.has(key) && typeof value[key] !== `undefined`,
    nil: (keys, key, value) => keys.has(key) && value[key] != null,
    falsy: (keys, key, value) => keys.has(key) && !!value[key],
};
/**
 * Create a validator that checks that the tested object contains the specified
 * keys.
*/
function hasRequiredKeys(requiredKeys, options) {
    var _a;
    const requiredSet = new Set(requiredKeys);
    const check = checks[(_a = options === null || options === void 0 ? void 0 : options.missingIf) !== null && _a !== void 0 ? _a : 'missing'];
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const problems = [];
            for (const key of requiredSet)
                if (!check(keys, key, value))
                    problems.push(key);
            if (problems.length > 0)
                return pushError(state, `Missing required ${plural(problems.length, `property`, `properties`)} ${getPrintableArray(problems, `and`)}`);
            return true;
        },
    });
}
/**
* Create a validator that checks that the tested object contains at least one
* of the specified keys.
*/
function hasAtLeastOneKey(requiredKeys, options) {
    var _a;
    const requiredSet = new Set(requiredKeys);
    const check = checks[(_a = options === null || options === void 0 ? void 0 : options.missingIf) !== null && _a !== void 0 ? _a : 'missing'];
    return makeValidator({
        test: (value, state) => {
            const keys = Object.keys(value);
            const valid = keys.some(key => check(requiredSet, key, value));
            if (!valid)
                return pushError(state, `Missing at least one property from ${getPrintableArray(Array.from(requiredSet), `or`)}`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested object contains none of the
 * specified keys.
*/
function hasForbiddenKeys(forbiddenKeys, options) {
    var _a;
    const forbiddenSet = new Set(forbiddenKeys);
    const check = checks[(_a = options === null || options === void 0 ? void 0 : options.missingIf) !== null && _a !== void 0 ? _a : 'missing'];
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const problems = [];
            for (const key of forbiddenSet)
                if (check(keys, key, value))
                    problems.push(key);
            if (problems.length > 0)
                return pushError(state, `Forbidden ${plural(problems.length, `property`, `properties`)} ${getPrintableArray(problems, `and`)}`);
            return true;
        },
    });
}
/**
 * Create a validator that checks that the tested object contains at most one
 * of the specified keys.
 */
function hasMutuallyExclusiveKeys(exclusiveKeys, options) {
    var _a;
    const exclusiveSet = new Set(exclusiveKeys);
    const check = checks[(_a = options === null || options === void 0 ? void 0 : options.missingIf) !== null && _a !== void 0 ? _a : 'missing'];
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            const used = [];
            for (const key of exclusiveSet)
                if (check(keys, key, value))
                    used.push(key);
            if (used.length > 1)
                return pushError(state, `Mutually exclusive properties ${getPrintableArray(used, `and`)}`);
            return true;
        },
    });
}
var KeyRelationship;
(function (KeyRelationship) {
    KeyRelationship["Forbids"] = "Forbids";
    KeyRelationship["Requires"] = "Requires";
})(KeyRelationship || (KeyRelationship = {}));
const keyRelationships = {
    [KeyRelationship.Forbids]: {
        expect: false,
        message: `forbids using`,
    },
    [KeyRelationship.Requires]: {
        expect: true,
        message: `requires using`,
    },
};
/**
 * Create a validator that checks that, when the specified subject property is
 * set, the relationship is satisfied.
 */
function hasKeyRelationship(subject, relationship, others, options) {
    var _a, _b;
    const skipped = new Set((_a = options === null || options === void 0 ? void 0 : options.ignore) !== null && _a !== void 0 ? _a : []);
    const check = checks[(_b = options === null || options === void 0 ? void 0 : options.missingIf) !== null && _b !== void 0 ? _b : 'missing'];
    const otherSet = new Set(others);
    const spec = keyRelationships[relationship];
    const conjunction = relationship === KeyRelationship.Forbids
        ? `or`
        : `and`;
    return makeValidator({
        test: (value, state) => {
            const keys = new Set(Object.keys(value));
            if (!check(keys, subject, value) || skipped.has(value[subject]))
                return true;
            const problems = [];
            for (const key of otherSet)
                if ((check(keys, key, value) && !skipped.has(value[key])) !== spec.expect)
                    problems.push(key);
            if (problems.length >= 1)
                return pushError(state, `Property "${subject}" ${spec.message} ${plural(problems.length, `property`, `properties`)} ${getPrintableArray(problems, conjunction)}`);
            return true;
        },
    });
}

export { KeyRelationship, TypeAssertionError, applyCascade, as, assert, assertWithErrors, cascade, fn, hasAtLeastOneKey, hasExactLength, hasForbiddenKeys, hasKeyRelationship, hasMaxLength, hasMinLength, hasMutuallyExclusiveKeys, hasRequiredKeys, hasUniqueItems, isArray, isAtLeast, isAtMost, isBase64, isBoolean, isDate, isDict, isEnum, isHexColor, isISO8601, isInExclusiveRange, isInInclusiveRange, isInstanceOf, isInteger, isJSON, isLiteral, isLowerCase, isMap, isNegative, isNullable, isNumber, isObject, isOneOf, isOptional, isPartial, isPayload, isPositive, isRecord, isSet, isString, isTuple, isUUID4, isUnknown, isUpperCase, makeTrait, makeValidator, matchesRegExp, softAssert };
