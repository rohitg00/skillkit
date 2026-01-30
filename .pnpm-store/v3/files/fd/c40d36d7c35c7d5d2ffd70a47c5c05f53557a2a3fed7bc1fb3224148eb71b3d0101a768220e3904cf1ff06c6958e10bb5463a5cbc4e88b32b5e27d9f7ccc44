import { onnx } from 'onnx-proto';
import { Attribute } from './attribute';
import { onnxruntime } from './ort-schema/ort-generated';
import { Tensor } from './tensor';
import ortFbs = onnxruntime.experimental.fbs;
export declare namespace Graph {
    interface Shape {
        readonly dims: readonly number[];
    }
    interface ValueType {
        readonly tensorType: Tensor.DataType;
        readonly shape: Shape;
    }
    interface Value {
        readonly tensor?: Tensor;
        readonly from: number;
        readonly to: readonly number[];
        readonly type?: ValueType;
    }
    interface Node {
        readonly name: string;
        readonly opType: string;
        readonly inputs: readonly number[];
        readonly outputs: readonly number[];
        readonly attributes: Attribute;
    }
    /**
     * a Transformer is an instance that allows all possible transformation operations that applied to a graph
     */
    interface Transformer {
        removeAllIdentityNodes(): void;
        removeAllDropoutNodes(): void;
        fuseConvActivationNodes(): void;
    }
    interface Initializer {
        transformGraph(transformer: Transformer): void;
    }
}
export interface Graph {
    getInputIndices(): readonly number[];
    getInputNames(): readonly string[];
    getOutputIndices(): readonly number[];
    getOutputNames(): readonly string[];
    getValues(): readonly Graph.Value[];
    getNodes(): readonly Graph.Node[];
}
export declare const Graph: {
    /**
     * construct a graph from a graph protobuf type
     */
    from: (graphProto: onnx.IGraphProto | ortFbs.Graph, initializer?: Graph.Initializer) => GraphImpl;
};
declare class Node implements Graph.Node {
    constructor(_nodeProto: onnx.INodeProto | ortFbs.Node, name?: string);
    name: string;
    opType: string;
    inputs: number[];
    outputs: number[];
    attributes: Attribute;
    executeNode: boolean;
}
declare class GraphImpl implements Graph, Graph.Transformer {
    private _allData;
    private _allInputIndices;
    private _allInputNames;
    private _allOutputIndices;
    private _allOutputNames;
    private _nodes;
    constructor(graph: onnx.IGraphProto | ortFbs.Graph, graphInitializer?: Graph.Initializer);
    getInputIndices(): readonly number[];
    getInputNames(): readonly string[];
    getOutputIndices(): readonly number[];
    getOutputNames(): readonly string[];
    getValues(): readonly Graph.Value[];
    getNodes(): readonly Graph.Node[];
    private buildGraph;
    private buildGraphFromOnnxFormat;
    private buildGraphFromOrtFormat;
    private checkIsAcyclic;
    private transformGraph;
    /**
     * finalize the graph.
     *
     * this function should be called after all the transformation completed.
     * this function removes all unnecessary nodes and values from the graph
     */
    finalizeGraph(): void;
    /**
     * Delete the specifed node. Assume the node has one incoming input and the first output connected to other nodes.
     * An input validation must be done before calling this function.
     * @param nodeIndex The index of node to be deleted
     */
    private deleteNode;
    removeAllDropoutNodes(): void;
    removeAllIdentityNodes(): void;
    isActivation(n: Node): boolean;
    fuseConvActivationNodes(): void;
}
export {};
