import { Tensor } from '../../tensor';
/**
 * Layout info is used for mapping n-dimensional array to 2D textures
 * The layout is created by the TextureLayoutStrategy based on
 * the Tensor's dimensions and strides
 */
export interface TextureLayout {
    width: number;
    height: number;
    /**
     * specify the number of value that encoded in a single pixel
     */
    channels: 1 | 2 | 3 | 4;
    /**
     * whether in packed mode or not
     */
    isPacked?: boolean;
    /**
     * the normalized shape
     */
    shape: readonly number[];
    /**
     * the stride of each dimensions, calculated according to shape
     */
    strides: readonly number[];
    /**
     * the original shape(dims) of the corresponding tensor
     */
    unpackedShape: readonly number[];
    reversedWH?: boolean;
}
export interface TextureData extends TextureLayout {
    tensor: Tensor;
    texture: WebGLTexture;
}
export declare enum TextureType {
    unpacked = 0,
    unpackedReversed = 1,
    packed = 2,
    downloadUint8AsFloat = 3,
    packedLastDimension = 4
}
export interface TensorInfo {
    id?: Tensor.Id;
    dims: readonly number[];
    type: Tensor.DataType;
    textureType: TextureType;
}
export interface ProgramVariable {
    type: 'float' | 'int';
    name: string;
    arrayLength?: number;
    data: number | number[];
}
/**
 * A set of metadata of a shader program.
 */
export interface ProgramMetadata {
    /**
     * the name of the program. used for debugging and profiling
     */
    name: string;
    /**
     * texture types for each input
     */
    inputTypes: TextureType[];
    /**
     * names of each input
     */
    inputNames: string[];
    /**
     * an optional string as a cache hint in the artifact cache
     */
    cacheHint?: string;
}
/**
 * A ProgramInfoLoader allows
 */
export interface ProgramInfoLoader extends ProgramMetadata {
    /**
     * a function to get the program info
     */
    get(): ProgramInfo;
}
/**
 * A set of data that represent a shader program
 */
export interface ProgramInfo extends ProgramMetadata {
    /**
     * information of uniform variables
     */
    variables?: ProgramVariable[];
    /**
     * tensor info for output
     */
    output: TensorInfo;
    /**
     * the shader's processing source code
     */
    shaderSource: string;
    /**
     * whether the shader source contains a customized main function implementation
     */
    hasMain?: boolean;
}
export interface VariableInfo {
    type: 'float' | 'int';
    name: string;
    arrayLength?: number;
}
export interface ProgramVariable {
    type: 'float' | 'int';
    name: string;
    arrayLength?: number;
    data: number | number[];
}
/**
 * Information of uniforms that shader uses
 */
export interface UniformInfo {
    type: 'sampler2D' | VariableInfo['type'];
    name: string;
    arrayLength?: number;
}
export interface UniformLocation extends UniformInfo {
    location: WebGLUniformLocation;
}
/**
 * Artifact is the result of compilation
 * It does not contain input of output data
 * However anything that could be run as a "program"
 */
export interface Artifact {
    programInfo: ProgramInfo;
    program: WebGLProgram;
    uniformLocations: UniformLocation[];
    attribLocations: {
        position: number;
        textureCoord: number;
    };
}
export declare namespace Artifact {
    type UniformLocations = Artifact['uniformLocations'];
    type AttribLocations = Artifact['attribLocations'];
}
export interface UniformData {
    [name: string]: number | number[];
}
