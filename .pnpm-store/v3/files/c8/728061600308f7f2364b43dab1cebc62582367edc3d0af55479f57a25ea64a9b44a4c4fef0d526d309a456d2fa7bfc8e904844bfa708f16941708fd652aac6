import { Backend, InferenceSession, SessionHandler } from 'onnxruntime-common';
declare class OnnxruntimeBackend implements Backend {
    init(): Promise<void>;
    createSessionHandler(pathOrBuffer: string | Uint8Array, options?: InferenceSession.SessionOptions): Promise<SessionHandler>;
}
export declare const onnxruntimeBackend: OnnxruntimeBackend;
export {};
