'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var advanced_options_utils = require('./utils.js');

function Counter(descriptor, initialValueBase, optsBase) {
    const [initialValue, opts] = advanced_options_utils.rerouteArguments(initialValueBase, optsBase !== null && optsBase !== void 0 ? optsBase : {});
    const optNames = descriptor.split(`,`);
    const nameSet = new Set(optNames);
    return advanced_options_utils.makeCommandOption({
        definition(builder) {
            builder.addOption({
                names: optNames,
                allowBinding: false,
                arity: 0,
                hidden: opts.hidden,
                description: opts.description,
                required: opts.required,
            });
        },
        transformer(builder, key, state) {
            let currentValue = initialValue;
            for (const { name, value } of state.options) {
                if (!nameSet.has(name))
                    continue;
                currentValue !== null && currentValue !== void 0 ? currentValue : (currentValue = 0);
                // Negated options reset the counter
                if (!value) {
                    currentValue = 0;
                }
                else {
                    currentValue += 1;
                }
            }
            return currentValue;
        },
    });
}

exports.Counter = Counter;
