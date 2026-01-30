'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var errors = require('../../errors.js');

const isOptionSymbol = Symbol(`clipanion/isOption`);
function makeCommandOption(spec) {
    // We lie! But it's for the good cause: the cli engine will turn the specs into proper values after instantiation.
    return { ...spec, [isOptionSymbol]: true };
}
function rerouteArguments(a, b) {
    if (typeof a === `undefined`)
        return [a, b];
    if (typeof a === `object` && a !== null && !Array.isArray(a)) {
        return [undefined, a];
    }
    else {
        return [a, b];
    }
}
function cleanValidationError(message, { mergeName = false } = {}) {
    const match = message.match(/^([^:]+): (.*)$/m);
    if (!match)
        return `validation failed`;
    let [, path, line] = match;
    if (mergeName)
        line = line[0].toLowerCase() + line.slice(1);
    line = path !== `.` || !mergeName
        ? `${path.replace(/^\.(\[|$)/, `$1`)}: ${line}`
        : `: ${line}`;
    return line;
}
function formatError(message, errors$1) {
    if (errors$1.length === 1) {
        return new errors.UsageError(`${message}${cleanValidationError(errors$1[0], { mergeName: true })}`);
    }
    else {
        return new errors.UsageError(`${message}:\n${errors$1.map(error => `\n- ${cleanValidationError(error)}`).join(``)}`);
    }
}
function applyValidator(name, value, validator) {
    if (typeof validator === `undefined`)
        return value;
    const errors = [];
    const coercions = [];
    const coercion = (v) => {
        const orig = value;
        value = v;
        return coercion.bind(null, orig);
    };
    const check = validator(value, { errors, coercions, coercion });
    if (!check)
        throw formatError(`Invalid value for ${name}`, errors);
    for (const [, op] of coercions)
        op();
    return value;
}

exports.applyValidator = applyValidator;
exports.cleanValidationError = cleanValidationError;
exports.formatError = formatError;
exports.isOptionSymbol = isOptionSymbol;
exports.makeCommandOption = makeCommandOption;
exports.rerouteArguments = rerouteArguments;
