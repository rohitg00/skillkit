import { InferenceSession } from 'onnxruntime-common';
import { SerializableModeldata, SerializableSessionMetadata, SerializableTensor } from './proxy-messages';
/**
 * initialize ORT environment.
 * @param numThreads SetGlobalIntraOpNumThreads(numThreads)
 * @param loggingLevel CreateEnv(static_cast<OrtLoggingLevel>(logging_level))
 */
export declare const initOrt: (numThreads: number, loggingLevel: number) => void;
/**
 * create an instance of InferenceSession.
 * @returns the metadata of InferenceSession. 0-value handle for failure.
 */
export declare const createSessionAllocate: (model: Uint8Array) => [number, number];
export declare const createSessionFinalize: (modelData: SerializableModeldata, options?: InferenceSession.SessionOptions) => SerializableSessionMetadata;
/**
 * create an instance of InferenceSession.
 * @returns the metadata of InferenceSession. 0-value handle for failure.
 */
export declare const createSession: (model: Uint8Array, options?: InferenceSession.SessionOptions) => SerializableSessionMetadata;
export declare const releaseSession: (sessionId: number) => void;
/**
 * perform inference run
 */
export declare const run: (sessionId: number, inputIndices: number[], inputs: SerializableTensor[], outputIndices: number[], options: InferenceSession.RunOptions) => SerializableTensor[];
/**
 * end profiling
 */
export declare const endProfiling: (sessionId: number) => void;
export declare const extractTransferableBuffers: (tensors: readonly SerializableTensor[]) => ArrayBufferLike[];
