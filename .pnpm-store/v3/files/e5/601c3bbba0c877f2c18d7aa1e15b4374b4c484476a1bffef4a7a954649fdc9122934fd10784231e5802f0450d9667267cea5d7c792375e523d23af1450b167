import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
/**
 * This GLSL library handles routines around reading a texlet and writing to it
 * Reading and writing could be more than just dealing with one channel
 * It may require encoding/decoding to/from 4 channels into one
 */
export declare class FragColorGlslLib extends GlslLib {
    constructor(context: GlslContext);
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    getCustomTypes(): {
        [name: string]: string;
    };
    protected setFragColor(): {
        [name: string]: GlslLibRoutine;
    };
    protected getColorAsFloat(): {
        [name: string]: GlslLibRoutine;
    };
}
