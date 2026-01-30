'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('../../core.js');
var advanced_options_utils = require('./utils.js');

function StringOption(descriptor, initialValueBase, optsBase) {
    const [initialValue, opts] = advanced_options_utils.rerouteArguments(initialValueBase, optsBase !== null && optsBase !== void 0 ? optsBase : {});
    const { arity = 1 } = opts;
    const optNames = descriptor.split(`,`);
    const nameSet = new Set(optNames);
    return advanced_options_utils.makeCommandOption({
        definition(builder) {
            builder.addOption({
                names: optNames,
                arity: opts.tolerateBoolean ? 0 : arity,
                hidden: opts.hidden,
                description: opts.description,
                required: opts.required,
            });
        },
        transformer(builder, key, state, context) {
            let usedName;
            let currentValue = initialValue;
            if (typeof opts.env !== `undefined` && context.env[opts.env]) {
                usedName = opts.env;
                currentValue = context.env[opts.env];
            }
            for (const { name, value } of state.options) {
                if (!nameSet.has(name))
                    continue;
                usedName = name;
                currentValue = value;
            }
            if (typeof currentValue === `string`) {
                return advanced_options_utils.applyValidator(usedName !== null && usedName !== void 0 ? usedName : key, currentValue, opts.validator);
            }
            else {
                return currentValue;
            }
        },
    });
}
function StringPositional(opts = {}) {
    const { required = true } = opts;
    return advanced_options_utils.makeCommandOption({
        definition(builder, key) {
            var _a;
            builder.addPositional({
                name: (_a = opts.name) !== null && _a !== void 0 ? _a : key,
                required: opts.required,
            });
        },
        transformer(builder, key, state) {
            var _a;
            for (let i = 0; i < state.positionals.length; ++i) {
                // We skip NoLimits extras. We only care about
                // required and optional finite positionals.
                if (state.positionals[i].extra === core.NoLimits)
                    continue;
                // We skip optional positionals when we only
                // care about required positionals.
                if (required && state.positionals[i].extra === true)
                    continue;
                // We skip required positionals when we only
                // care about optional positionals.
                if (!required && state.positionals[i].extra === false)
                    continue;
                // We remove the positional from the list
                const [positional] = state.positionals.splice(i, 1);
                return advanced_options_utils.applyValidator((_a = opts.name) !== null && _a !== void 0 ? _a : key, positional.value, opts.validator);
            }
            return undefined;
        },
    });
}
// This function is badly typed, but it doesn't matter because the overloads provide the true public typings
function String(descriptor, ...args) {
    if (typeof descriptor === `string`) {
        return StringOption(descriptor, ...args);
    }
    else {
        return StringPositional(descriptor);
    }
}

exports.String = String;
