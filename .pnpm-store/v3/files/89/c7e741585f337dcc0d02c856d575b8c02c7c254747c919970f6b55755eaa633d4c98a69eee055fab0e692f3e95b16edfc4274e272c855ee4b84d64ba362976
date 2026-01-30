import { SessionHandler } from './backend';
import { Graph } from './graph';
import { Profiler } from './instrument';
import { Operator } from './operators';
import { Tensor } from './tensor';
declare class KernelOp {
    op: Operator;
    node: Graph.Node;
    constructor(op: Operator, node: Graph.Node);
}
export declare class ExecutionPlan {
    private graph;
    private profiler;
    constructor(graph: Graph, ops: Operator[], profiler: Readonly<Profiler>);
    initialize(ops: Operator[]): void;
    reset(): void;
    execute(sessionHandler: SessionHandler, modelInputs: Tensor[]): Promise<Tensor[]>;
    _values: Array<Tensor | undefined>;
    _ops: KernelOp[];
    _starter: number[];
}
export {};
