import { type Pointer } from "bun:ffi";
import { type FFISymbols } from "./ffi";
export declare class GPUQuerySetImpl implements GPUQuerySet {
    readonly ptr: Pointer;
    private lib;
    readonly type: GPUQueryType;
    readonly count: number;
    __brand: "GPUQuerySet";
    label: string;
    constructor(ptr: Pointer, lib: FFISymbols, type: GPUQueryType, count: number, label?: string);
    destroy(): undefined;
}
