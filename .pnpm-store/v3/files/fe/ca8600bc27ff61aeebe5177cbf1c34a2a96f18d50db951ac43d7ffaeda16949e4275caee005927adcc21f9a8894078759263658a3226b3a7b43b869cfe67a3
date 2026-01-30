import { GlslContext, GlslLib, GlslLibRoutine } from './glsl-definitions';
/**
 * GLSL Library responsible for vec routines
 * Vec is an varible length int array. The length is fixed at the time of
 * generating the library functions from the dimensions of the output.
 */
export declare class VecGlslLib extends GlslLib {
    constructor(context: GlslContext);
    getCustomTypes(): {
        [name: string]: string;
    };
    getFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    protected binaryVecFunctions(): {
        [name: string]: GlslLibRoutine;
    };
    protected copyVec(): {
        [name: string]: GlslLibRoutine;
    };
    protected setVecItem(): {
        [name: string]: GlslLibRoutine;
    };
    protected getVecItem(): {
        [name: string]: GlslLibRoutine;
    };
}
