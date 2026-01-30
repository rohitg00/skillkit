export declare function fatalError(...args: any[]): never;
export declare class OperationError extends Error {
    constructor(message: string);
}
export declare class GPUErrorImpl extends Error implements GPUError {
    constructor(message: string);
}
export declare class GPUOutOfMemoryError extends Error {
    constructor(message: string);
}
export declare class GPUInternalError extends Error {
    constructor(message: string);
}
export declare class GPUValidationError extends Error {
    constructor(message: string);
}
export declare class GPUPipelineErrorImpl extends DOMException implements GPUPipelineError {
    readonly reason: GPUPipelineErrorReason;
    readonly __brand: 'GPUPipelineError';
    constructor(message: string, options: GPUPipelineErrorInit);
}
export declare class AbortError extends Error {
    constructor(message: string);
}
export declare function createWGPUError(type: number, message: string): GPUErrorImpl | GPUOutOfMemoryError | GPUInternalError | GPUValidationError;
