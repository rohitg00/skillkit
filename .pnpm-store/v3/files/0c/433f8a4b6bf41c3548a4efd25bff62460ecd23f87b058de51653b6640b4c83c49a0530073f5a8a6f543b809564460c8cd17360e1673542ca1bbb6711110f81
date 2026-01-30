export declare namespace Encoder {
    interface DataTypeMap {
        float: Float32Array;
        byte: Uint8Array;
        int: Uint32Array;
    }
    type DataType = keyof DataTypeMap;
    type DataArrayType = DataTypeMap[DataType];
    const enum Usage {
        Default = 0,
        UploadOnly = 1,
        Download4BytesAsFloat32 = 2
    }
}
/**
 * Abstraction for mapping data types to texture texlets
 * Encoding means how a Float32 is mapped to 1 or 4 channels for each texlet
 * Decoding means how a texlet's channels are mapped to a resulting Float32
 */
export interface DataEncoder {
    internalFormat: number;
    format: number;
    textureType: number;
    channelSize: number;
    encode(src: Encoder.DataArrayType, textureSize: number): Encoder.DataArrayType;
    allocate(size: number): Encoder.DataArrayType;
    decode(buffer: Encoder.DataArrayType, dataSize: number): Encoder.DataArrayType;
}
/**
 * WebGL2 data encoder
 * Uses R32F as the format for texlet
 */
export declare class RedFloat32DataEncoder implements DataEncoder {
    internalFormat: number;
    format: number;
    textureType: number;
    channelSize: number;
    constructor(gl: WebGL2RenderingContext, channels?: number);
    encode(src: Encoder.DataArrayType, textureSize: number): Encoder.DataArrayType;
    allocate(size: number): Encoder.DataArrayType;
    decode(buffer: Encoder.DataArrayType, dataSize: number): Float32Array;
}
/**
 * Data encoder for WebGL 1 with support for floating point texture
 */
export declare class RGBAFloatDataEncoder implements DataEncoder {
    internalFormat: number;
    format: number;
    textureType: number;
    channelSize: number;
    constructor(gl: WebGLRenderingContext, channels?: number, textureType?: number);
    encode(src: Float32Array, textureSize: number): Encoder.DataArrayType;
    allocate(size: number): Encoder.DataArrayType;
    decode(buffer: Encoder.DataArrayType, dataSize: number): Float32Array;
}
export declare class Uint8DataEncoder implements DataEncoder {
    internalFormat: number;
    format: number;
    textureType: number;
    channelSize: number;
    constructor(gl: WebGLRenderingContext, channels?: number);
    encode(src: Uint8Array, _textureSize: number): Encoder.DataArrayType;
    allocate(size: number): Encoder.DataArrayType;
    decode(buffer: Encoder.DataArrayType, dataSize: number): Uint8Array;
}
