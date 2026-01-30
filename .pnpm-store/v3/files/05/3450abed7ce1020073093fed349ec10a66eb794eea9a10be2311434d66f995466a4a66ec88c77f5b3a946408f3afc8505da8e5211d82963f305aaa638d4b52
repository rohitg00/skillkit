import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
/**
 * This library produces routines needed for non-constant access to uniform arrays
 */
export declare class ArrayGlslLib extends GlslLib {
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    getCustomTypes(): {
        [name: string]: string;
    };
    constructor(context: GlslContext);
    protected generate(): {
        [name: string]: GlslLibRoutine;
    };
    protected generateSetItem(length: number): string;
    protected generateGetItem(length: number): string;
}
