import { EventEmitter } from "events";
import { type KeyEventType, type ParsedKey } from "./parse.keypress";
export declare class KeyEvent implements ParsedKey {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    option: boolean;
    sequence: string;
    number: boolean;
    raw: string;
    eventType: KeyEventType;
    source: "raw" | "kitty";
    code?: string;
    super?: boolean;
    hyper?: boolean;
    capsLock?: boolean;
    numLock?: boolean;
    baseCode?: number;
    repeated?: boolean;
    private _defaultPrevented;
    private _propagationStopped;
    constructor(key: ParsedKey);
    get defaultPrevented(): boolean;
    get propagationStopped(): boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export declare class PasteEvent {
    text: string;
    private _defaultPrevented;
    private _propagationStopped;
    constructor(text: string);
    get defaultPrevented(): boolean;
    get propagationStopped(): boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export type KeyHandlerEventMap = {
    keypress: [KeyEvent];
    keyrelease: [KeyEvent];
    paste: [PasteEvent];
};
export declare class KeyHandler extends EventEmitter<KeyHandlerEventMap> {
    protected useKittyKeyboard: boolean;
    constructor(useKittyKeyboard?: boolean);
    processInput(data: string): boolean;
    processPaste(data: string): void;
}
/**
 * This class is used internally by the renderer to ensure global handlers
 * can preventDefault before renderable handlers process events.
 */
export declare class InternalKeyHandler extends KeyHandler {
    private renderableHandlers;
    constructor(useKittyKeyboard?: boolean);
    emit<K extends keyof KeyHandlerEventMap>(event: K, ...args: KeyHandlerEventMap[K]): boolean;
    private emitWithPriority;
    onInternal<K extends keyof KeyHandlerEventMap>(event: K, handler: (...args: KeyHandlerEventMap[K]) => void): void;
    offInternal<K extends keyof KeyHandlerEventMap>(event: K, handler: (...args: KeyHandlerEventMap[K]) => void): void;
}
