/**
 * represent a version irrelevant abstraction of for GLSL source code
 */
export interface Glsl {
    readonly version: string;
    readonly attribute: string;
    readonly varyingVertex: string;
    readonly varyingFrag: string;
    readonly texture2D: string;
    readonly output: string;
    readonly outputDeclaration: string;
}
export declare function getGlsl(version: 1 | 2): Glsl;
export declare function getVertexShaderSource(version: 1 | 2): string;
export declare function getFragShaderPreamble(version: 1 | 2): string;
export declare function getDefaultFragShaderMain(version: 1 | 2, outputShapeLength: number): string;
