import { InferenceHandler } from './backend';
import { Graph } from './graph';
import { Tensor } from './tensor';
export type OperatorImplementation<T> = (inferenceHandler: InferenceHandler, inputs: Tensor[], context: T) => Tensor[];
export type OperatorInitialization<T> = (node: Graph.Node, graph: Graph) => T;
export interface Operator {
    readonly impl: OperatorImplementation<unknown>;
    readonly context: Graph.Node | unknown;
}
export declare const NUMBER_TYPES: readonly Tensor.DataType[];
export declare const INT_TYPES: readonly Tensor.DataType[];
export declare const FLOAT_TYPES: readonly Tensor.DataType[];
