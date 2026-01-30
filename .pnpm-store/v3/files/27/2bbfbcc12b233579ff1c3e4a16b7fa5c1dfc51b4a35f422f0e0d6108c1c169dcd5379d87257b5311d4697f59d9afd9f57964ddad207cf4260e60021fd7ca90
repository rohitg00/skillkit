export type RestFlags = {
    name?: string;
    required?: number;
};
/**
 * Used to annotate that the command supports any number of positional
 * arguments.
 *
 * Be careful: this function is order-dependent! Make sure to define it
 * after any positional argument you want to declare.
 *
 * This function is mutually exclusive with Option.Proxy.
 *
 * @example
 * yarn add hello world
 *     ► rest = ["hello", "world"]
 */
export declare function Rest(opts?: RestFlags): string[];
