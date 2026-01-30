import { Graph } from './graph';
import { OperatorImplementation, OperatorInitialization } from './operators';
export interface OpSet {
    domain: string;
    version: number;
}
export declare namespace OpSet {
    /**
     * Domain of an opset, it can be an empty string(default value, represent for ai.onnx), or 'ai.onnx.ml'
     */
    type Domain = '' | 'ai.onnx.ml' | 'com.microsoft';
    /**
     * A resolve rule consists of 4 or 5 items: opType, opSetDomain, versionSelector, operatorImplementation and
     * operatorInitialization (optional)
     */
    type ResolveRule = [
        string,
        Domain,
        string,
        OperatorImplementation<Graph.Node>
    ] | [string, Domain, string, OperatorImplementation<unknown>, OperatorInitialization<unknown>];
}
export declare function resolveOperator(node: Graph.Node, opsets: readonly OpSet[], rules: readonly OpSet.ResolveRule[]): {
    opImpl: OperatorImplementation<unknown> | OperatorImplementation<Graph.Node>;
    opInit: OperatorInitialization<unknown> | undefined;
};
