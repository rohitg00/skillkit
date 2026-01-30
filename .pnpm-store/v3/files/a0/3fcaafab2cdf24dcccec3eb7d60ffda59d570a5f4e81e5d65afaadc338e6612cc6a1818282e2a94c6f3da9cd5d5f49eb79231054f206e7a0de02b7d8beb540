import { Renderable, type RenderableOptions } from "../Renderable";
import { Selection, type LocalSelectionBounds } from "../lib/selection";
import { EditBuffer, type LogicalCursor } from "../edit-buffer";
import { EditorView, type VisualCursor } from "../editor-view";
import { RGBA } from "../lib/RGBA";
import type { RenderContext, Highlight, CursorStyleOptions, LineInfoProvider, LineInfo } from "../types";
import type { OptimizedBuffer } from "../buffer";
import type { SyntaxStyle } from "../syntax-style";
export interface CursorChangeEvent {
    line: number;
    visualColumn: number;
}
export interface ContentChangeEvent {
}
export interface EditBufferOptions extends RenderableOptions<EditBufferRenderable> {
    textColor?: string | RGBA;
    backgroundColor?: string | RGBA;
    selectionBg?: string | RGBA;
    selectionFg?: string | RGBA;
    selectable?: boolean;
    attributes?: number;
    wrapMode?: "none" | "char" | "word";
    scrollMargin?: number;
    scrollSpeed?: number;
    showCursor?: boolean;
    cursorColor?: string | RGBA;
    cursorStyle?: CursorStyleOptions;
    syntaxStyle?: SyntaxStyle;
    tabIndicator?: string | number;
    tabIndicatorColor?: string | RGBA;
    onCursorChange?: (event: CursorChangeEvent) => void;
    onContentChange?: (event: ContentChangeEvent) => void;
}
export declare abstract class EditBufferRenderable extends Renderable implements LineInfoProvider {
    protected _focusable: boolean;
    selectable: boolean;
    protected _textColor: RGBA;
    protected _backgroundColor: RGBA;
    protected _defaultAttributes: number;
    protected _selectionBg: RGBA | undefined;
    protected _selectionFg: RGBA | undefined;
    protected _wrapMode: "none" | "char" | "word";
    protected _scrollMargin: number;
    protected _showCursor: boolean;
    protected _cursorColor: RGBA;
    protected _cursorStyle: CursorStyleOptions;
    protected lastLocalSelection: LocalSelectionBounds | null;
    protected _tabIndicator?: string | number;
    protected _tabIndicatorColor?: RGBA;
    private _cursorChangeListener;
    private _contentChangeListener;
    private _autoScrollVelocity;
    private _autoScrollAccumulator;
    private _scrollSpeed;
    private _keyboardSelectionActive;
    readonly editBuffer: EditBuffer;
    readonly editorView: EditorView;
    protected _defaultOptions: {
        textColor: RGBA;
        backgroundColor: string;
        selectionBg: undefined;
        selectionFg: undefined;
        selectable: true;
        attributes: number;
        wrapMode: "none" | "char" | "word";
        scrollMargin: number;
        scrollSpeed: number;
        showCursor: true;
        cursorColor: RGBA;
        cursorStyle: {
            style: "block";
            blinking: true;
        };
        tabIndicator: undefined;
        tabIndicatorColor: undefined;
    };
    constructor(ctx: RenderContext, options: EditBufferOptions);
    get lineInfo(): LineInfo;
    private setupEventListeners;
    get lineCount(): number;
    get virtualLineCount(): number;
    get scrollY(): number;
    get plainText(): string;
    get logicalCursor(): LogicalCursor;
    get visualCursor(): VisualCursor;
    get cursorOffset(): number;
    set cursorOffset(offset: number);
    get textColor(): RGBA;
    set textColor(value: RGBA | string | undefined);
    get selectionBg(): RGBA | undefined;
    set selectionBg(value: RGBA | string | undefined);
    get selectionFg(): RGBA | undefined;
    set selectionFg(value: RGBA | string | undefined);
    get backgroundColor(): RGBA;
    set backgroundColor(value: RGBA | string | undefined);
    get attributes(): number;
    set attributes(value: number);
    get wrapMode(): "none" | "char" | "word";
    set wrapMode(value: "none" | "char" | "word");
    get showCursor(): boolean;
    set showCursor(value: boolean);
    get cursorColor(): RGBA;
    set cursorColor(value: RGBA | string);
    get cursorStyle(): CursorStyleOptions;
    set cursorStyle(style: CursorStyleOptions);
    get tabIndicator(): string | number | undefined;
    set tabIndicator(value: string | number | undefined);
    get tabIndicatorColor(): RGBA | undefined;
    set tabIndicatorColor(value: RGBA | string | undefined);
    get scrollSpeed(): number;
    set scrollSpeed(value: number);
    protected onMouseEvent(event: any): void;
    protected handleScroll(event: any): void;
    protected onResize(width: number, height: number): void;
    protected refreshLocalSelection(): boolean;
    private updateLocalSelection;
    shouldStartSelection(x: number, y: number): boolean;
    onSelectionChanged(selection: Selection | null): boolean;
    protected onUpdate(deltaTime: number): void;
    getSelectedText(): string;
    hasSelection(): boolean;
    getSelection(): {
        start: number;
        end: number;
    } | null;
    private setupMeasureFunc;
    render(buffer: OptimizedBuffer, deltaTime: number): void;
    protected renderSelf(buffer: OptimizedBuffer): void;
    protected renderCursor(buffer: OptimizedBuffer): void;
    focus(): void;
    blur(): void;
    protected onRemove(): void;
    destroy(): void;
    set onCursorChange(handler: ((event: CursorChangeEvent) => void) | undefined);
    get onCursorChange(): ((event: CursorChangeEvent) => void) | undefined;
    set onContentChange(handler: ((event: ContentChangeEvent) => void) | undefined);
    get onContentChange(): ((event: ContentChangeEvent) => void) | undefined;
    get syntaxStyle(): SyntaxStyle | null;
    set syntaxStyle(style: SyntaxStyle | null);
    addHighlight(lineIdx: number, highlight: Highlight): void;
    addHighlightByCharRange(highlight: Highlight): void;
    removeHighlightsByRef(hlRef: number): void;
    clearLineHighlights(lineIdx: number): void;
    clearAllHighlights(): void;
    getLineHighlights(lineIdx: number): Array<Highlight>;
    /**
     * Set text and completely reset the buffer state (clears history, resets add_buffer).
     * Use this for initial text setting or when you want a clean slate.
     */
    setText(text: string): void;
    /**
     * Replace text while preserving undo history (creates an undo point).
     * Use this when you want the setText operation to be undoable.
     */
    replaceText(text: string): void;
    clear(): void;
    deleteRange(startLine: number, startCol: number, endLine: number, endCol: number): void;
    insertText(text: string): void;
    getTextRange(startOffset: number, endOffset: number): string;
    getTextRangeByCoords(startRow: number, startCol: number, endRow: number, endCol: number): string;
    protected updateSelectionForMovement(shiftPressed: boolean, isBeforeMovement: boolean): void;
}
