import { DataEncoder, Encoder } from './texture-data-encoder';
export interface FenceContext {
    query: WebGLSync | null;
    isFencePassed(): boolean;
}
export declare function linearSearchLastTrue(arr: Array<() => boolean>): number;
/**
 * Abstraction and wrapper around WebGLRenderingContext and its operations
 */
export declare class WebGLContext {
    gl: WebGLRenderingContext;
    version: 1 | 2;
    private vertexbuffer;
    private framebuffer;
    private isFloatTextureAttachableToFrameBuffer;
    isFloat32DownloadSupported: boolean;
    isRenderFloat32Supported: boolean;
    isBlendSupported: boolean;
    maxTextureSize: number;
    private maxTextureImageUnits;
    textureFloatExtension: OES_texture_float | null;
    textureHalfFloatExtension: OES_texture_half_float | null;
    colorBufferFloatExtension: unknown | null;
    disjointTimerQueryWebgl2Extension: {
        TIME_ELAPSED_EXT: GLenum;
        GPU_DISJOINT_EXT: GLenum;
    } | null;
    private disposed;
    private frameBufferBound;
    constructor(gl: WebGLRenderingContext, version: 1 | 2);
    allocateTexture(width: number, height: number, encoder: DataEncoder, data?: Encoder.DataArrayType): WebGLTexture;
    updateTexture(texture: WebGLTexture, width: number, height: number, encoder: DataEncoder, data: Encoder.DataArrayType): void;
    attachFramebuffer(texture: WebGLTexture, width: number, height: number): void;
    readTexture(texture: WebGLTexture, width: number, height: number, dataSize: number, dataType: Encoder.DataType, channels: number): Encoder.DataArrayType;
    isFramebufferReady(): boolean;
    getActiveTexture(): string;
    getTextureBinding(): WebGLTexture;
    getFramebufferBinding(): WebGLFramebuffer;
    setVertexAttributes(positionHandle: number, textureCoordHandle: number): void;
    createProgram(vertexShader: WebGLShader, fragShader: WebGLShader): WebGLProgram;
    compileShader(shaderSource: string, shaderType: number): WebGLShader;
    deleteShader(shader: WebGLShader): void;
    bindTextureToUniform(texture: WebGLTexture, position: number, uniformHandle: WebGLUniformLocation): void;
    draw(): void;
    checkError(): void;
    deleteTexture(texture: WebGLTexture): void;
    deleteProgram(program: WebGLProgram): void;
    getEncoder(dataType: Encoder.DataType, channels: number, usage?: Encoder.Usage): DataEncoder;
    clearActiveTextures(): void;
    dispose(): void;
    private createDefaultGeometry;
    private createVertexbuffer;
    private createFramebuffer;
    private queryVitalParameters;
    private getExtensions;
    private checkFloatTextureAttachableToFrameBuffer;
    private checkRenderFloat32;
    private checkFloat32Download;
    /**
     * Check whether GL_BLEND is supported
     */
    private checkFloat32Blend;
    beginTimer(): WebGLQuery;
    endTimer(): void;
    isTimerResultAvailable(query: WebGLQuery): boolean;
    getTimerResult(query: WebGLQuery): number;
    waitForQueryAndGetTime(query: WebGLQuery): Promise<number>;
    createAndWaitForFence(): Promise<void>;
    private createFence;
    pollFence(fenceContext: FenceContext): Promise<void>;
    private itemsToPoll;
    pollItems(): void;
    private addItemToPoll;
}
