import type { KeyEvent } from "@opentui/core";
export interface UseKeyboardOptions {
    /** Include release events - callback receives events with eventType: "release" */
    release?: boolean;
}
/**
 * Subscribe to keyboard events.
 *
 * By default, only receives press events (including key repeats with `repeated: true`).
 * Use `options.release` to also receive release events.
 *
 * @example
 * // Basic press handling (includes repeats)
 * useKeyboard((e) => console.log(e.name, e.repeated ? "(repeat)" : ""))
 *
 * // With release events
 * useKeyboard((e) => {
 *   if (e.eventType === "release") keys.delete(e.name)
 *   else keys.add(e.name)
 * }, { release: true })
 */
export declare const useKeyboard: (handler: (key: KeyEvent) => void, options?: UseKeyboardOptions) => void;
