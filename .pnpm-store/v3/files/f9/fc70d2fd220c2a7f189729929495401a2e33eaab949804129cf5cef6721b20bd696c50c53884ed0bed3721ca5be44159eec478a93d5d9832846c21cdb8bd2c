import { Graph } from './graph';
import { OpSet } from './opset';
export declare class Model {
    constructor();
    load(buf: Uint8Array, graphInitializer?: Graph.Initializer, isOrtFormat?: boolean): void;
    private loadFromOnnxFormat;
    private loadFromOrtFormat;
    private _graph;
    get graph(): Graph;
    private _opsets;
    get opsets(): readonly OpSet[];
}
