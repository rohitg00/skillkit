import { CommandOptionReturn, GeneralOptionFlags } from "./utils";
export type CounterFlags = GeneralOptionFlags;
/**
 * Used to annotate options whose repeated values are aggregated into a
 * single number.
 *
 * @example
 * -vvvvv
 *     ► {"v": 5}
 */
export declare function Counter(descriptor: string, opts: CounterFlags & {
    required: true;
}): CommandOptionReturn<number>;
export declare function Counter(descriptor: string, opts?: CounterFlags): CommandOptionReturn<number | undefined>;
export declare function Counter(descriptor: string, initialValue: number, opts?: Omit<CounterFlags, 'required'>): CommandOptionReturn<number>;
