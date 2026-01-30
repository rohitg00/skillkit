import { Renderable, type RenderableOptions } from "../../Renderable";
import type { OptimizedBuffer } from "../../buffer";
import type { RenderContext } from "../../types";
export interface VRenderableOptions extends RenderableOptions<VRenderable> {
    render?: (this: VRenderable | VRenderableOptions, buffer: OptimizedBuffer, deltaTime: number, renderable: VRenderable) => void;
}
/**
 * A generic renderable that accepts a custom render function as a prop.
 * This allows functional constructs to specify custom rendering behavior
 * without needing to subclass Renderable.
 */
export declare class VRenderable extends Renderable {
    private options;
    constructor(ctx: RenderContext, options: VRenderableOptions);
    protected renderSelf(buffer: OptimizedBuffer, deltaTime: number): void;
}
