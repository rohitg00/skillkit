import { type RenderContext } from "../types";
import { EditBufferRenderable, type EditBufferOptions } from "./EditBufferRenderable";
import type { KeyEvent, PasteEvent } from "../lib/KeyHandler";
import { RGBA, type ColorInput } from "../lib/RGBA";
import { type KeyBinding as BaseKeyBinding, type KeyAliasMap } from "../lib/keymapping";
import { type StyledText } from "../lib/styled-text";
import type { ExtmarksController } from "../lib/extmarks";
export type TextareaAction = "move-left" | "move-right" | "move-up" | "move-down" | "select-left" | "select-right" | "select-up" | "select-down" | "line-home" | "line-end" | "select-line-home" | "select-line-end" | "visual-line-home" | "visual-line-end" | "select-visual-line-home" | "select-visual-line-end" | "buffer-home" | "buffer-end" | "select-buffer-home" | "select-buffer-end" | "delete-line" | "delete-to-line-end" | "delete-to-line-start" | "backspace" | "delete" | "newline" | "undo" | "redo" | "word-forward" | "word-backward" | "select-word-forward" | "select-word-backward" | "delete-word-forward" | "delete-word-backward" | "submit";
export type KeyBinding = BaseKeyBinding<TextareaAction>;
export interface SubmitEvent {
}
export interface TextareaOptions extends EditBufferOptions {
    initialValue?: string;
    backgroundColor?: ColorInput;
    textColor?: ColorInput;
    focusedBackgroundColor?: ColorInput;
    focusedTextColor?: ColorInput;
    placeholder?: StyledText | string | null;
    placeholderColor?: ColorInput;
    keyBindings?: KeyBinding[];
    keyAliasMap?: KeyAliasMap;
    onSubmit?: (event: SubmitEvent) => void;
}
export declare class TextareaRenderable extends EditBufferRenderable {
    private _placeholder;
    private _placeholderColor;
    private _unfocusedBackgroundColor;
    private _unfocusedTextColor;
    private _focusedBackgroundColor;
    private _focusedTextColor;
    private _keyBindingsMap;
    private _keyAliasMap;
    private _keyBindings;
    private _actionHandlers;
    private _initialValueSet;
    private _submitListener;
    private static readonly defaults;
    constructor(ctx: RenderContext, options: TextareaOptions);
    private applyPlaceholder;
    private buildActionHandlers;
    handlePaste(event: PasteEvent): void;
    handleKeyPress(key: KeyEvent): boolean;
    private updateColors;
    insertChar(char: string): void;
    insertText(text: string): void;
    deleteChar(): boolean;
    deleteCharBackward(): boolean;
    private deleteSelectedText;
    newLine(): boolean;
    deleteLine(): boolean;
    moveCursorLeft(options?: {
        select?: boolean;
    }): boolean;
    moveCursorRight(options?: {
        select?: boolean;
    }): boolean;
    moveCursorUp(options?: {
        select?: boolean;
    }): boolean;
    moveCursorDown(options?: {
        select?: boolean;
    }): boolean;
    gotoLine(line: number): void;
    gotoLineHome(options?: {
        select?: boolean;
    }): boolean;
    gotoLineEnd(options?: {
        select?: boolean;
    }): boolean;
    gotoVisualLineHome(options?: {
        select?: boolean;
    }): boolean;
    gotoVisualLineEnd(options?: {
        select?: boolean;
    }): boolean;
    gotoBufferHome(options?: {
        select?: boolean;
    }): boolean;
    gotoBufferEnd(options?: {
        select?: boolean;
    }): boolean;
    deleteToLineEnd(): boolean;
    deleteToLineStart(): boolean;
    undo(): boolean;
    redo(): boolean;
    moveWordForward(options?: {
        select?: boolean;
    }): boolean;
    moveWordBackward(options?: {
        select?: boolean;
    }): boolean;
    deleteWordForward(): boolean;
    deleteWordBackward(): boolean;
    focus(): void;
    blur(): void;
    get placeholder(): StyledText | string | null;
    set placeholder(value: StyledText | string | null);
    get placeholderColor(): RGBA;
    set placeholderColor(value: ColorInput);
    get backgroundColor(): RGBA;
    set backgroundColor(value: RGBA | string | undefined);
    get textColor(): RGBA;
    set textColor(value: RGBA | string | undefined);
    set focusedBackgroundColor(value: ColorInput);
    set focusedTextColor(value: ColorInput);
    set initialValue(value: string);
    submit(): boolean;
    set onSubmit(handler: ((event: SubmitEvent) => void) | undefined);
    get onSubmit(): ((event: SubmitEvent) => void) | undefined;
    set keyBindings(bindings: KeyBinding[]);
    set keyAliasMap(aliases: KeyAliasMap);
    get extmarks(): ExtmarksController;
}
