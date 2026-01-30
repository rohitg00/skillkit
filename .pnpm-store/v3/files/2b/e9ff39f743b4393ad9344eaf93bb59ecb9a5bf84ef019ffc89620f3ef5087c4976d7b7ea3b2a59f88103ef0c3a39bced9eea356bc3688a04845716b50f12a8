import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
/**
 * This GLSL library handles routines converting
 * float32 to/from Unsigned byte or float 16
 */
export declare class EncodingGlslLib extends GlslLib {
    constructor(context: GlslContext);
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    getCustomTypes(): {
        [name: string]: string;
    };
    protected encodeFloat32(): {
        [name: string]: GlslLibRoutine;
    };
    protected decodeFloat32(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * returns the routine to encode encode a 32bit float to a vec4 (of unsigned bytes)
     * @credit: https://stackoverflow.com/questions/7059962/how-do-i-convert-a-vec4-rgba-value-to-a-float
     */
    protected encodeUint8(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * returns the routine to encode a vec4 of unsigned bytes to float32
     * @credit: https://stackoverflow.com/questions/7059962/how-do-i-convert-a-vec4-rgba-value-to-a-float
     */
    protected decodeUint8(): {
        [name: string]: GlslLibRoutine;
    };
    /**
     * Determines if the machine is little endian or not
     * @credit: https://gist.github.com/TooTallNate/4750953
     */
    static isLittleEndian(): boolean;
}
