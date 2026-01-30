import { Guid } from 'guid-typescript';
import { onnx } from 'onnx-proto';
import { onnxruntime } from './ort-schema/ort-generated';
import ortFbs = onnxruntime.experimental.fbs;
export declare namespace Tensor {
    interface DataTypeMap {
        bool: Uint8Array;
        float32: Float32Array;
        float64: Float64Array;
        string: string[];
        int8: Int8Array;
        uint8: Uint8Array;
        int16: Int16Array;
        uint16: Uint16Array;
        int32: Int32Array;
        uint32: Uint32Array;
    }
    type DataType = keyof DataTypeMap;
    type StringType = Tensor.DataTypeMap['string'];
    type BooleanType = Tensor.DataTypeMap['bool'];
    type IntegerType = Tensor.DataTypeMap['int8'] | Tensor.DataTypeMap['uint8'] | Tensor.DataTypeMap['int16'] | Tensor.DataTypeMap['uint16'] | Tensor.DataTypeMap['int32'] | Tensor.DataTypeMap['uint32'];
    type FloatType = Tensor.DataTypeMap['float32'] | Tensor.DataTypeMap['float64'];
    type NumberType = BooleanType | IntegerType | FloatType;
    type Id = Guid;
}
type TensorData = Tensor.DataTypeMap[Tensor.DataType];
type DataProvider = (id: Tensor.Id) => TensorData;
type AsyncDataProvider = (id: Tensor.Id) => Promise<TensorData>;
export declare class Tensor {
    /**
     * get the dimensions of the tensor
     */
    readonly dims: readonly number[];
    /**
     * get the type of the tensor
     */
    readonly type: Tensor.DataType;
    private dataProvider?;
    private asyncDataProvider?;
    private cache?;
    /**
     * get the data ID that used to map to a tensor data
     */
    readonly dataId: Guid;
    /**
     * get the underlying tensor data
     */
    get data(): TensorData;
    /**
     * get the underlying string tensor data. Should only use when type is STRING
     */
    get stringData(): string[];
    /**
     * get the underlying integer tensor data. Should only use when type is one of the following: (UINT8, INT8, UINT16,
     * INT16, INT32, UINT32, BOOL)
     */
    get integerData(): Tensor.IntegerType;
    /**
     * get the underlying float tensor data. Should only use when type is one of the following: (FLOAT, DOUBLE)
     */
    get floatData(): Tensor.FloatType;
    /**
     * get the underlying number tensor data. Should only use when type is one of the following: (UINT8, INT8, UINT16,
     * INT16, INT32, UINT32, BOOL, FLOAT, DOUBLE)
     */
    get numberData(): Tensor.NumberType;
    /**
     * get value of an element at the given indices
     */
    get(indices: readonly number[]): Tensor.DataTypeMap[Tensor.DataType][number];
    /**
     * set value of an element at the given indices
     */
    set(indices: readonly number[], value: Tensor.DataTypeMap[Tensor.DataType][number]): void;
    /**
     * get the underlying tensor data asynchronously
     */
    getData(): Promise<TensorData>;
    /**
     * get the number of elements in the tensor
     */
    readonly size: number;
    private _strides;
    /**
     * get the strides for each dimension
     */
    get strides(): readonly number[];
    constructor(
    /**
     * get the dimensions of the tensor
     */
    dims: readonly number[], 
    /**
     * get the type of the tensor
     */
    type: Tensor.DataType, dataProvider?: DataProvider | undefined, asyncDataProvider?: AsyncDataProvider | undefined, cache?: TensorData | undefined, 
    /**
     * get the data ID that used to map to a tensor data
     */
    dataId?: Guid);
    /**
     * Construct new Tensor from a ONNX Tensor object
     * @param tensorProto the ONNX Tensor
     */
    static fromProto(tensorProto: onnx.ITensorProto): Tensor;
    /**
     * Construct new Tensor from raw data
     * @param data the raw data object. Should be a string array for 'string' tensor, and the corresponding typed array
     * for other types of tensor.
     * @param dims the dimensions of the tensor
     * @param type the type of the tensor
     */
    static fromData(data: Tensor.DataTypeMap[Tensor.DataType], dims: readonly number[], type: Tensor.DataType): Tensor;
    static fromOrtTensor(ortTensor: ortFbs.Tensor): Tensor;
}
export {};
