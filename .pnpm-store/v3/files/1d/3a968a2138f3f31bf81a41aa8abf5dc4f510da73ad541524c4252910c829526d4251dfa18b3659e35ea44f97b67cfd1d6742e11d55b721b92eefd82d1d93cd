import { makeCommandOption, applyValidator, rerouteArguments } from './utils.mjs';

function Array(descriptor, initialValueBase, optsBase) {
    const [initialValue, opts] = rerouteArguments(initialValueBase, optsBase !== null && optsBase !== void 0 ? optsBase : {});
    const { arity = 1 } = opts;
    const optNames = descriptor.split(`,`);
    const nameSet = new Set(optNames);
    return makeCommandOption({
        definition(builder) {
            builder.addOption({
                names: optNames,
                arity,
                hidden: opts === null || opts === void 0 ? void 0 : opts.hidden,
                description: opts === null || opts === void 0 ? void 0 : opts.description,
                required: opts.required,
            });
        },
        transformer(builder, key, state) {
            let usedName;
            let currentValue = typeof initialValue !== `undefined`
                ? [...initialValue]
                : undefined;
            for (const { name, value } of state.options) {
                if (!nameSet.has(name))
                    continue;
                usedName = name;
                currentValue = currentValue !== null && currentValue !== void 0 ? currentValue : [];
                currentValue.push(value);
            }
            if (typeof currentValue !== `undefined`) {
                return applyValidator(usedName !== null && usedName !== void 0 ? usedName : key, currentValue, opts.validator);
            }
            else {
                return currentValue;
            }
        },
    });
}

export { Array };
