import { TextNodeRenderable, type RenderContext, type TextNodeOptions } from "@opentui/core";
export declare const textNodeKeys: readonly ["span", "b", "strong", "i", "em", "u", "br", "a"];
export type TextNodeKey = (typeof textNodeKeys)[number];
export declare class SpanRenderable extends TextNodeRenderable {
    private readonly ctx;
    constructor(ctx: RenderContext | null, options: TextNodeOptions);
}
declare class TextModifierRenderable extends SpanRenderable {
    constructor(options: TextNodeOptions, modifier?: TextNodeKey);
}
export declare class BoldSpanRenderable extends TextModifierRenderable {
    constructor(_ctx: RenderContext | null, options: TextNodeOptions);
}
export declare class ItalicSpanRenderable extends TextModifierRenderable {
    constructor(_ctx: RenderContext | null, options: TextNodeOptions);
}
export declare class UnderlineSpanRenderable extends TextModifierRenderable {
    constructor(_ctx: RenderContext | null, options: TextNodeOptions);
}
export declare class LineBreakRenderable extends SpanRenderable {
    constructor(_ctx: RenderContext | null, options: TextNodeOptions);
    add(): number;
}
export interface LinkOptions extends TextNodeOptions {
    href: string;
}
export declare class LinkRenderable extends SpanRenderable {
    constructor(_ctx: RenderContext | null, options: LinkOptions);
}
export {};
