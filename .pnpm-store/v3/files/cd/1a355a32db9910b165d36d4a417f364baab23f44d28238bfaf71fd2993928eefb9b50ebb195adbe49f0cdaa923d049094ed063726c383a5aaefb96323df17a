import { makeCommandOption } from './utils.mjs';

/**
 * Used to annotate that the command wants to retrieve all trailing
 * arguments that cannot be tied to a declared option.
 *
 * Be careful: this function is order-dependent! Make sure to define it
 * after any positional argument you want to declare.
 *
 * This function is mutually exclusive with Option.Rest.
 *
 * @example
 * yarn run foo hello --foo=bar world
 *     ► proxy = ["hello", "--foo=bar", "world"]
 */
function Proxy(opts = {}) {
    return makeCommandOption({
        definition(builder, key) {
            var _a;
            builder.addProxy({
                name: (_a = opts.name) !== null && _a !== void 0 ? _a : key,
                required: opts.required,
            });
        },
        transformer(builder, key, state) {
            return state.positionals.map(({ value }) => value);
        },
    });
}

export { Proxy };
