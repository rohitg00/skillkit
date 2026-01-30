import { onnx } from 'onnx-proto';
import { onnxruntime } from './ort-schema/ort-generated';
import { Tensor } from './tensor';
import ortFbs = onnxruntime.experimental.fbs;
export declare namespace Attribute {
    interface DataTypeMap {
        float: number;
        int: number;
        string: string;
        tensor: Tensor;
        floats: number[];
        ints: number[];
        strings: string[];
        tensors: Tensor[];
    }
    type DataType = keyof DataTypeMap;
}
type ValueTypes = Attribute.DataTypeMap[Attribute.DataType];
type Value = [ValueTypes, Attribute.DataType];
export declare class Attribute {
    constructor(attributes: onnx.IAttributeProto[] | ortFbs.Attribute[] | null | undefined);
    set(key: string, type: Attribute.DataType, value: ValueTypes): void;
    delete(key: string): void;
    getFloat(key: string, defaultValue?: Attribute.DataTypeMap['float']): number;
    getInt(key: string, defaultValue?: Attribute.DataTypeMap['int']): number;
    getString(key: string, defaultValue?: Attribute.DataTypeMap['string']): string;
    getTensor(key: string, defaultValue?: Attribute.DataTypeMap['tensor']): Tensor;
    getFloats(key: string, defaultValue?: Attribute.DataTypeMap['floats']): number[];
    getInts(key: string, defaultValue?: Attribute.DataTypeMap['ints']): number[];
    getStrings(key: string, defaultValue?: Attribute.DataTypeMap['strings']): string[];
    getTensors(key: string, defaultValue?: Attribute.DataTypeMap['tensors']): Tensor[];
    private get;
    private static getType;
    private static getValue;
    private static getValueNoCheck;
    private static getValueNoCheckFromOnnxFormat;
    private static getValueNoCheckFromOrtFormat;
    protected _attributes: Map<string, Value>;
}
export {};
