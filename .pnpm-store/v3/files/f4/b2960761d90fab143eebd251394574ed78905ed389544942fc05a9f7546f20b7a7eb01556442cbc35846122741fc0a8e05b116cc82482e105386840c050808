import { type RenderContext } from "../types";
import { SyntaxStyle } from "../syntax-style";
import { TreeSitterClient } from "../lib/tree-sitter";
import { TextBufferRenderable, type TextBufferOptions } from "./TextBufferRenderable";
import type { OptimizedBuffer } from "../buffer";
import type { SimpleHighlight } from "../lib/tree-sitter/types";
export interface HighlightContext {
    content: string;
    filetype: string;
    syntaxStyle: SyntaxStyle;
}
export type OnHighlightCallback = (highlights: SimpleHighlight[], context: HighlightContext) => SimpleHighlight[] | undefined | Promise<SimpleHighlight[] | undefined>;
export interface CodeOptions extends TextBufferOptions {
    content?: string;
    filetype?: string;
    syntaxStyle: SyntaxStyle;
    treeSitterClient?: TreeSitterClient;
    conceal?: boolean;
    drawUnstyledText?: boolean;
    streaming?: boolean;
    onHighlight?: OnHighlightCallback;
}
export declare class CodeRenderable extends TextBufferRenderable {
    private _content;
    private _filetype?;
    private _syntaxStyle;
    private _isHighlighting;
    private _treeSitterClient;
    private _highlightsDirty;
    private _highlightSnapshotId;
    private _conceal;
    private _drawUnstyledText;
    private _shouldRenderTextBuffer;
    private _streaming;
    private _hadInitialContent;
    private _lastHighlights;
    private _onHighlight?;
    protected _contentDefaultOptions: {
        content: string;
        conceal: true;
        drawUnstyledText: true;
        streaming: false;
    };
    constructor(ctx: RenderContext, options: CodeOptions);
    get content(): string;
    set content(value: string);
    get filetype(): string | undefined;
    set filetype(value: string);
    get syntaxStyle(): SyntaxStyle;
    set syntaxStyle(value: SyntaxStyle);
    get conceal(): boolean;
    set conceal(value: boolean);
    get drawUnstyledText(): boolean;
    set drawUnstyledText(value: boolean);
    get streaming(): boolean;
    set streaming(value: boolean);
    get treeSitterClient(): TreeSitterClient;
    set treeSitterClient(value: TreeSitterClient);
    get onHighlight(): OnHighlightCallback | undefined;
    set onHighlight(value: OnHighlightCallback | undefined);
    get isHighlighting(): boolean;
    private ensureVisibleTextBeforeHighlight;
    private startHighlight;
    getLineHighlights(lineIdx: number): import("..").Highlight[];
    protected renderSelf(buffer: OptimizedBuffer): void;
}
