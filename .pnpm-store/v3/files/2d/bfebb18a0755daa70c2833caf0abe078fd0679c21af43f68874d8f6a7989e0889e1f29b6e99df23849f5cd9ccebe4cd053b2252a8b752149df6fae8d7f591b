import { Renderable, type RenderableOptions } from "../Renderable";
import { type RenderContext } from "../types";
import { SyntaxStyle } from "../syntax-style";
import { type MarkedToken, type Token } from "marked";
import type { TreeSitterClient } from "../lib/tree-sitter";
import { type ParseState } from "./markdown-parser";
import type { OptimizedBuffer } from "../buffer";
export interface MarkdownOptions extends RenderableOptions<MarkdownRenderable> {
    content?: string;
    syntaxStyle: SyntaxStyle;
    conceal?: boolean;
    treeSitterClient?: TreeSitterClient;
    /**
     * Enable streaming mode for incremental content updates.
     * When true, trailing tokens are kept unstable to handle incomplete content.
     */
    streaming?: boolean;
    /**
     * Custom node renderer. Return a Renderable to override default rendering,
     * or undefined/null to use default rendering.
     */
    renderNode?: (token: Token, context: RenderNodeContext) => Renderable | undefined | null;
}
export interface RenderNodeContext {
    syntaxStyle: SyntaxStyle;
    conceal: boolean;
    treeSitterClient?: TreeSitterClient;
    /** Creates default renderable for this token */
    defaultRender: () => Renderable | null;
}
export interface BlockState {
    token: MarkedToken;
    tokenRaw: string;
    renderable: Renderable;
}
export type { ParseState };
export declare class MarkdownRenderable extends Renderable {
    private _content;
    private _syntaxStyle;
    private _conceal;
    private _treeSitterClient?;
    private _renderNode?;
    _parseState: ParseState | null;
    private _streaming;
    _blockStates: BlockState[];
    private _styleDirty;
    protected _contentDefaultOptions: {
        content: string;
        conceal: true;
        streaming: false;
    };
    constructor(ctx: RenderContext, options: MarkdownOptions);
    get content(): string;
    set content(value: string);
    get syntaxStyle(): SyntaxStyle;
    set syntaxStyle(value: SyntaxStyle);
    get conceal(): boolean;
    set conceal(value: boolean);
    get streaming(): boolean;
    set streaming(value: boolean);
    private getStyle;
    private createChunk;
    private createDefaultChunk;
    private renderInlineContent;
    private renderInlineToken;
    private renderInlineTokenWithStyle;
    private renderHeadingChunks;
    private renderParagraphChunks;
    private renderBlockquoteChunks;
    private renderListChunks;
    private renderThematicBreakChunks;
    private renderTokenToChunks;
    private createTextRenderable;
    private createCodeRenderable;
    /**
     * Update an existing table renderable in-place for style/conceal changes.
     * Much faster than rebuilding the entire table structure.
     */
    private updateTableRenderable;
    private createTableRenderable;
    private createDefaultRenderable;
    private updateBlockRenderable;
    private updateBlocks;
    private clearBlockStates;
    /**
     * Re-render existing blocks without rebuilding the parse state or block structure.
     * Used when only style/conceal changes - much faster than full rebuild.
     */
    private rerenderBlocks;
    clearCache(): void;
    protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void;
}
