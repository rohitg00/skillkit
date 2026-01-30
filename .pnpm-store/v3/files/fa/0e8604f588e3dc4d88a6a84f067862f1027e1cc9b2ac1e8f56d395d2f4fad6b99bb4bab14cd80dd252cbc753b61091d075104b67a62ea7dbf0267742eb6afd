import { Backend, InferenceSession, SessionHandler } from 'onnxruntime-common';
/**
 * This function initializes all flags for WebAssembly.
 *
 * Those flags are accessible from `ort.env.wasm`. Users are allow to set those flags before the first inference session
 * being created, to override default value.
 */
export declare const initializeFlags: () => void;
declare class OnnxruntimeWebAssemblyBackend implements Backend {
    init(): Promise<void>;
    createSessionHandler(path: string, options?: InferenceSession.SessionOptions): Promise<SessionHandler>;
    createSessionHandler(buffer: Uint8Array, options?: InferenceSession.SessionOptions): Promise<SessionHandler>;
}
export declare const wasmBackend: OnnxruntimeWebAssemblyBackend;
export {};
