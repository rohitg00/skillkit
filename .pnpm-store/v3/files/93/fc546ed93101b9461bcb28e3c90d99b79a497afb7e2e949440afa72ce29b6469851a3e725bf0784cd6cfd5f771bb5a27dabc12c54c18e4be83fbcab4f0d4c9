import { InferenceSession, SessionHandler } from 'onnxruntime-common';
import { SerializableModeldata } from './proxy-messages';
export declare class OnnxruntimeWebAssemblySessionHandler implements SessionHandler {
    private sessionId;
    inputNames: string[];
    outputNames: string[];
    createSessionAllocate(path: string): Promise<SerializableModeldata>;
    loadModel(pathOrBuffer: string | Uint8Array, options?: InferenceSession.SessionOptions): Promise<void>;
    dispose(): Promise<void>;
    run(feeds: SessionHandler.FeedsType, fetches: SessionHandler.FetchesType, options: InferenceSession.RunOptions): Promise<SessionHandler.ReturnType>;
    startProfiling(): void;
    endProfiling(): void;
}
