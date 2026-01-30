import { RGBA } from "./lib/RGBA";
import { type LineInfo, type RenderLib } from "./zig";
import { type Pointer } from "bun:ffi";
import type { TextBuffer } from "./text-buffer";
export declare class TextBufferView {
    private lib;
    private viewPtr;
    private textBuffer;
    private _destroyed;
    constructor(lib: RenderLib, ptr: Pointer, textBuffer: TextBuffer);
    static create(textBuffer: TextBuffer): TextBufferView;
    private guard;
    get ptr(): Pointer;
    setSelection(start: number, end: number, bgColor?: RGBA, fgColor?: RGBA): void;
    updateSelection(end: number, bgColor?: RGBA, fgColor?: RGBA): void;
    resetSelection(): void;
    getSelection(): {
        start: number;
        end: number;
    } | null;
    hasSelection(): boolean;
    setLocalSelection(anchorX: number, anchorY: number, focusX: number, focusY: number, bgColor?: RGBA, fgColor?: RGBA): boolean;
    updateLocalSelection(anchorX: number, anchorY: number, focusX: number, focusY: number, bgColor?: RGBA, fgColor?: RGBA): boolean;
    resetLocalSelection(): void;
    setWrapWidth(width: number | null): void;
    setWrapMode(mode: "none" | "char" | "word"): void;
    setViewportSize(width: number, height: number): void;
    setViewport(x: number, y: number, width: number, height: number): void;
    get lineInfo(): LineInfo;
    get logicalLineInfo(): LineInfo;
    getSelectedText(): string;
    getPlainText(): string;
    setTabIndicator(indicator: string | number): void;
    setTabIndicatorColor(color: RGBA): void;
    setTruncate(truncate: boolean): void;
    measureForDimensions(width: number, height: number): {
        lineCount: number;
        maxWidth: number;
    } | null;
    getVirtualLineCount(): number;
    destroy(): void;
}
