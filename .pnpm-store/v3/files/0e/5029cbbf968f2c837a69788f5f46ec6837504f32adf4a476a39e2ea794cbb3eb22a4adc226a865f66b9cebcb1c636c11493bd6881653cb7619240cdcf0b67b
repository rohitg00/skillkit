import { InferenceHandler } from '../../backend';
import { Tensor } from '../../tensor';
import { WebGLSessionHandler } from './session-handler';
import { ProgramInfo, ProgramInfoLoader, TextureData, TextureLayout, TextureType } from './types';
export declare class WebGLInferenceHandler implements InferenceHandler {
    session: WebGLSessionHandler;
    private packedTextureDataCache;
    private unpackedTextureDataCache;
    constructor(session: WebGLSessionHandler);
    /**
     * @returns [width, height]
     */
    calculateTextureWidthAndHeight(shape: readonly number[], textureType: TextureType): [number, number];
    executeProgram(program: ProgramInfo | ProgramInfoLoader, inputs: readonly Tensor[]): TextureData;
    run(program: ProgramInfoLoader, inputs: readonly Tensor[]): Tensor;
    private runProgram;
    /**
     * Create a TextureData object from a tensor.
     * Usage = Encoder.Usage.UploadOnly.
     * If a related texture data is found in cache, returns it;
     * Otherwise:
     *   Creates a new texture layout if not provided;
     *   Creates WebGLTexture with the layout;
     *   Upload tensor data to the texture;
     *   Creates a texture data object associated with the given tensor.
     * @param tensor the tensor with data to upload
     */
    private getOrCreateTextureData;
    /**
     * Create a TextureData object using the given data and bind to the given tensor.
     * Usage = Encoder.Usage.UploadOnly.
     * NOTE: this function is a hack for Conv implementation. should remove this function, after rewriting Conv
     * implementation by Graph.Transformer
     * @param dataType the tensor data type
     * @param data the actual data to upload
     * @param tensor the tensor to bind. tensor's data is ignored.
     */
    createTextureDataFromLayoutBindTensor(layout: TextureLayout, dataType: Tensor.DataType, data: Tensor.NumberType, tensor: Tensor): TextureData;
    private createTextureData;
    reshapeUnpacked(input: Tensor, reshapedDims: readonly number[]): Tensor;
    reshapePacked(input: Tensor, reshapedDims: readonly number[]): Tensor;
    cast(input: Tensor, type: Tensor.DataType): Tensor;
    private createTextureDataFromTexture;
    private getTextureData;
    setTextureData(tensorId: Tensor.Id, td: TextureData, isPacked?: boolean): void;
    isTextureLayoutCached(tensor: Tensor, isPacked?: boolean): boolean;
    dispose(): void;
    readTexture(textureData: TextureData): Tensor.NumberType;
    readTextureAsync(textureData: TextureData): Promise<Tensor.NumberType>;
    pack(input: TextureData): TextureData;
    unpack(input: TextureData): TextureData;
}
