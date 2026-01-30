import { type Pointer } from "bun:ffi";
import { type FFISymbols } from "./ffi";
export declare class GPUShaderModuleImpl implements GPUShaderModule {
    readonly ptr: Pointer;
    private lib;
    readonly label: string;
    __brand: "GPUShaderModule";
    constructor(ptr: Pointer, lib: FFISymbols, label: string);
    getCompilationInfo(): Promise<GPUCompilationInfo>;
    destroy(): undefined;
}
