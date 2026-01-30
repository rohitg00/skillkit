import { Profiler } from '../../instrument';
import { Tensor } from '../../tensor';
import { Encoder } from './texture-data-encoder';
import { TextureLayoutStrategy } from './texture-layout-strategy';
import { TextureData, TextureLayout } from './types';
import { WebGLContext } from './webgl-context';
export interface TextureManagerConfig {
    reuseTextures?: boolean;
}
/**
 * TextureManager is the mainly responsible for caching Textures
 * Textures are cached in 2 levels:
 *   1. the texures which are associated with a dataId (from Tensor)
 *    Caching these is crucial to performance. These are In-use Textures
 *   2. textures which are not in use by any current ProgramInfo/Tensor
 *     These are called Free Textures
 * TextureManager is also used to help creating textures. For this it
 * uses WebGLContext and TextureLayoutStrategy
 */
export declare class TextureManager {
    glContext: WebGLContext;
    layoutStrategy: TextureLayoutStrategy;
    profiler: Readonly<Profiler>;
    private config;
    private readonly inUseTextures;
    private readonly idleTextures;
    private readonly textureLookup;
    private readonly pendingRead;
    constructor(glContext: WebGLContext, layoutStrategy: TextureLayoutStrategy, profiler: Readonly<Profiler>, config: TextureManagerConfig);
    createTextureFromLayout(dataType: Tensor.DataType, layout: TextureLayout, data?: Tensor.NumberType, usage?: Encoder.Usage): WebGLTexture;
    readTexture(td: TextureData, dataType: Tensor.DataType, channels?: number): Tensor.NumberType;
    readTextureAsync(td: TextureData, dataType: Tensor.DataType, channels?: number): Promise<Tensor.NumberType>;
    readUint8TextureAsFloat(td: TextureData): Float32Array;
    releaseTexture(textureData: TextureData, deleteTexture?: boolean): void;
    toTensorData(dataType: Tensor.DataType, data: Encoder.DataArrayType): Tensor.NumberType;
    toTextureData(dataType: Tensor.DataType, data: Tensor.NumberType | undefined): Encoder.DataArrayType | undefined;
    toEncoderType(_dataType: Tensor.DataType): Encoder.DataType;
    clearActiveTextures(): void;
}
