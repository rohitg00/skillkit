export interface KeyBinding<Action extends string = string> {
    name: string;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
    super?: boolean;
    action: Action;
}
export type KeyAliasMap = Record<string, string>;
export declare const defaultKeyAliases: KeyAliasMap;
export declare function mergeKeyAliases(defaults: KeyAliasMap, custom: KeyAliasMap): KeyAliasMap;
export declare function mergeKeyBindings<Action extends string>(defaults: KeyBinding<Action>[], custom: KeyBinding<Action>[]): KeyBinding<Action>[];
export declare function getKeyBindingKey<Action extends string>(binding: KeyBinding<Action>): string;
export declare function buildKeyBindingsMap<Action extends string>(bindings: KeyBinding<Action>[], aliasMap?: KeyAliasMap): Map<string, Action>;
/**
 * Converts a key binding to a human-readable string representation
 * @param binding The key binding to stringify
 * @returns A string like "ctrl+shift+y" or just "escape"
 * @example
 * keyBindingToString({ name: "y", ctrl: true, shift: true }) // "ctrl+shift+y"
 * keyBindingToString({ name: "escape" }) // "escape"
 * keyBindingToString({ name: "c", ctrl: true }) // "ctrl+c"
 * keyBindingToString({ name: "s", super: true }) // "super+s"
 */
export declare function keyBindingToString<Action extends string>(binding: KeyBinding<Action>): string;
