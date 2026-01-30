import { Profiler } from './instrument';
import { Tensor } from './tensor';
export declare namespace Session {
    interface Config {
        backendHint?: string;
        profiler?: Profiler.Config;
    }
    interface Context {
        profiler: Readonly<Profiler>;
        graphInputTypes?: Tensor.DataType[];
        graphInputDims?: Array<readonly number[]>;
    }
}
export declare class Session {
    constructor(config?: Session.Config);
    get inputNames(): readonly string[];
    get outputNames(): readonly string[];
    startProfiling(): void;
    endProfiling(): void;
    loadModel(uri: string): Promise<void>;
    loadModel(buffer: ArrayBuffer, byteOffset?: number, length?: number): Promise<void>;
    loadModel(buffer: Uint8Array): Promise<void>;
    private initialize;
    run(inputs: Map<string, Tensor> | Tensor[]): Promise<Map<string, Tensor>>;
    private normalizeAndValidateInputs;
    private validateInputTensorTypes;
    private validateInputTensorDims;
    private compareTensorDims;
    private createOutput;
    private initializeOps;
    private _model;
    private _initialized;
    private _ops;
    private _executionPlan;
    private backendHint?;
    private sessionHandler;
    private context;
    private profiler;
}
