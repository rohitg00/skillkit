import { InferenceSession, SessionHandler } from 'onnxruntime-common';
import { Session } from './session';
export declare class OnnxjsSessionHandler implements SessionHandler {
    private session;
    constructor(session: Session);
    dispose(): Promise<void>;
    inputNames: readonly string[];
    outputNames: readonly string[];
    run(feeds: SessionHandler.FeedsType, _fetches: SessionHandler.FetchesType, _options: InferenceSession.RunOptions): Promise<SessionHandler.ReturnType>;
    startProfiling(): void;
    endProfiling(): void;
}
