import { BaseRenderable } from "../Renderable";
import { StyledText } from "../lib/styled-text";
import { type TextChunk } from "../text-buffer";
import { RGBA } from "../lib/RGBA";
import { type RenderContext } from "../types";
import { RootTextNodeRenderable, TextNodeRenderable } from "./TextNode";
import { TextBufferRenderable, type TextBufferOptions } from "./TextBufferRenderable";
export interface TextOptions extends TextBufferOptions {
    content?: StyledText | string;
}
export declare class TextRenderable extends TextBufferRenderable {
    private _text;
    private _hasManualStyledText;
    protected rootTextNode: RootTextNodeRenderable;
    protected _contentDefaultOptions: {
        content: string;
    };
    constructor(ctx: RenderContext, options: TextOptions);
    private updateTextBuffer;
    private clearChunks;
    get content(): StyledText;
    get chunks(): TextChunk[];
    get textNode(): RootTextNodeRenderable;
    set content(value: StyledText | string);
    private updateTextFromNodes;
    add(obj: TextNodeRenderable | StyledText | string, index?: number): number;
    remove(id: string): void;
    insertBefore(obj: BaseRenderable | any, anchor?: TextNodeRenderable): number;
    getTextChildren(): BaseRenderable[];
    clear(): void;
    onLifecyclePass: () => void;
    protected onFgChanged(newColor: RGBA): void;
    protected onBgChanged(newColor: RGBA): void;
    protected onAttributesChanged(newAttributes: number): void;
    destroy(): void;
}
