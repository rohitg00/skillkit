import { CommandOptionReturn, GeneralOptionFlags } from "./utils";
export type BooleanFlags = GeneralOptionFlags;
/**
 * Used to annotate boolean options.
 *
 * @example
 * --foo --no-bar
 *     ► {"foo": true, "bar": false}
 */
export declare function Boolean(descriptor: string, opts: BooleanFlags & {
    required: true;
}): CommandOptionReturn<boolean>;
export declare function Boolean(descriptor: string, opts?: BooleanFlags): CommandOptionReturn<boolean | undefined>;
export declare function Boolean(descriptor: string, initialValue: boolean, opts?: Omit<BooleanFlags, 'required'>): CommandOptionReturn<boolean>;
