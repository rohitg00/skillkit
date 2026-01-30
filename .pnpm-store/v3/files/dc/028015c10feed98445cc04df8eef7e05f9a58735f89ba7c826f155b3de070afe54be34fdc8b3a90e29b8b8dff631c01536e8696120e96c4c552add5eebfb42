import { OnnxValue } from './onnx-value';
export declare namespace InferenceSession {
    type OnnxValueMapType = {
        readonly [name: string]: OnnxValue;
    };
    type NullableOnnxValueMapType = {
        readonly [name: string]: OnnxValue | null;
    };
    /**
     * A feeds (model inputs) is an object that uses input names as keys and OnnxValue as corresponding values.
     */
    type FeedsType = OnnxValueMapType;
    /**
     * A fetches (model outputs) could be one of the following:
     *
     * - Omitted. Use model's output names definition.
     * - An array of string indicating the output names.
     * - An object that use output names as keys and OnnxValue or null as corresponding values.
     *
     * @remark
     * different from input argument, in output, OnnxValue is optional. If an OnnxValue is present it will be
     * used as a pre-allocated value by the inference engine; if omitted, inference engine will allocate buffer
     * internally.
     */
    type FetchesType = readonly string[] | NullableOnnxValueMapType;
    /**
     * A inferencing return type is an object that uses output names as keys and OnnxValue as corresponding values.
     */
    type ReturnType = OnnxValueMapType;
    /**
     * A set of configurations for session behavior.
     */
    interface SessionOptions {
        /**
         * An array of execution provider options.
         *
         * An execution provider option can be a string indicating the name of the execution provider,
         * or an object of corresponding type.
         */
        executionProviders?: readonly ExecutionProviderConfig[];
        /**
         * The intra OP threads number.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native).
         */
        intraOpNumThreads?: number;
        /**
         * The inter OP threads number.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native).
         */
        interOpNumThreads?: number;
        /**
         * The optimization level.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
        /**
         * Whether enable CPU memory arena.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        enableCpuMemArena?: boolean;
        /**
         * Whether enable memory pattern.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        enableMemPattern?: boolean;
        /**
         * Execution mode.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        executionMode?: 'sequential' | 'parallel';
        /**
         * Wether enable profiling.
         *
         * This setting is a placeholder for a future use.
         */
        enableProfiling?: boolean;
        /**
         * File prefix for profiling.
         *
         * This setting is a placeholder for a future use.
         */
        profileFilePrefix?: string;
        /**
         * Log ID.
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        logId?: string;
        /**
         * Log severity level. See
         * https://github.com/microsoft/onnxruntime/blob/main/include/onnxruntime/core/common/logging/severity.h
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
        /**
         * Log verbosity level.
         *
         * This setting is available only in WebAssembly backend. Will support Node.js binding and react-native later
         */
        logVerbosityLevel?: number;
        /**
         * Store configurations for a session. See
         * https://github.com/microsoft/onnxruntime/blob/main/include/onnxruntime/core/session/
         * onnxruntime_session_options_config_keys.h
         *
         * This setting is available only in WebAssembly backend. Will support Node.js binding and react-native later
         *
         * @example
         * ```js
         * extra: {
         *   session: {
         *     set_denormal_as_zero: "1",
         *     disable_prepacking: "1"
         *   },
         *   optimization: {
         *     enable_gelu_approximation: "1"
         *   }
         * }
         * ```
         */
        extra?: Record<string, unknown>;
    }
    interface ExecutionProviderOptionMap {
        cpu: CpuExecutionProviderOption;
        cuda: CudaExecutionProviderOption;
        wasm: WebAssemblyExecutionProviderOption;
        webgl: WebGLExecutionProviderOption;
        xnnpack: XnnpackExecutionProviderOption;
    }
    type ExecutionProviderName = keyof ExecutionProviderOptionMap;
    type ExecutionProviderConfig = ExecutionProviderOptionMap[ExecutionProviderName] | ExecutionProviderOption | ExecutionProviderName | string;
    interface ExecutionProviderOption {
        readonly name: string;
    }
    interface CpuExecutionProviderOption extends ExecutionProviderOption {
        readonly name: 'cpu';
        useArena?: boolean;
    }
    interface CudaExecutionProviderOption extends ExecutionProviderOption {
        readonly name: 'cuda';
        deviceId?: number;
    }
    interface WebAssemblyExecutionProviderOption extends ExecutionProviderOption {
        readonly name: 'wasm';
    }
    interface WebGLExecutionProviderOption extends ExecutionProviderOption {
        readonly name: 'webgl';
    }
    interface XnnpackExecutionProviderOption extends ExecutionProviderOption {
        readonly name: 'xnnpack';
    }
    /**
     * A set of configurations for inference run behavior
     */
    interface RunOptions {
        /**
         * Log severity level. See
         * https://github.com/microsoft/onnxruntime/blob/main/include/onnxruntime/core/common/logging/severity.h
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
        /**
         * Log verbosity level.
         *
         * This setting is available only in WebAssembly backend. Will support Node.js binding and react-native later
         */
        logVerbosityLevel?: number;
        /**
         * Terminate all incomplete OrtRun calls as soon as possible if true
         *
         * This setting is available only in WebAssembly backend. Will support Node.js binding and react-native later
         */
        terminate?: boolean;
        /**
         * A tag for the Run() calls using this
         *
         * This setting is available only in ONNXRuntime (Node.js binding and react-native) or WebAssembly backend
         */
        tag?: string;
        /**
         * Set a single run configuration entry. See
         * https://github.com/microsoft/onnxruntime/blob/main/include/onnxruntime/core/session/
         * onnxruntime_run_options_config_keys.h
         *
         * This setting is available only in WebAssembly backend. Will support Node.js binding and react-native later
         *
         * @example
         *
         * ```js
         * extra: {
         *   memory: {
         *     enable_memory_arena_shrinkage: "1",
         *   }
         * }
         * ```
         */
        extra?: Record<string, unknown>;
    }
    interface ValueMetadata {
    }
}
/**
 * Represent a runtime instance of an ONNX model.
 */
export interface InferenceSession {
    /**
     * Execute the model asynchronously with the given feeds and options.
     *
     * @param feeds - Representation of the model input. See type description of `InferenceSession.InputType` for detail.
     * @param options - Optional. A set of options that controls the behavior of model inference.
     * @returns A promise that resolves to a map, which uses output names as keys and OnnxValue as corresponding values.
     */
    run(feeds: InferenceSession.FeedsType, options?: InferenceSession.RunOptions): Promise<InferenceSession.ReturnType>;
    /**
     * Execute the model asynchronously with the given feeds, fetches and options.
     *
     * @param feeds - Representation of the model input. See type description of `InferenceSession.InputType` for detail.
     * @param fetches - Representation of the model output. See type description of `InferenceSession.OutputType` for
     * detail.
     * @param options - Optional. A set of options that controls the behavior of model inference.
     * @returns A promise that resolves to a map, which uses output names as keys and OnnxValue as corresponding values.
     */
    run(feeds: InferenceSession.FeedsType, fetches: InferenceSession.FetchesType, options?: InferenceSession.RunOptions): Promise<InferenceSession.ReturnType>;
    /**
     * Start profiling.
     */
    startProfiling(): void;
    /**
     * End profiling.
     */
    endProfiling(): void;
    /**
     * Get input names of the loaded model.
     */
    readonly inputNames: readonly string[];
    /**
     * Get output names of the loaded model.
     */
    readonly outputNames: readonly string[];
}
export interface InferenceSessionFactory {
    /**
     * Create a new inference session and load model asynchronously from an ONNX model file.
     *
     * @param uri - The URI or file path of the model to load.
     * @param options - specify configuration for creating a new inference session.
     * @returns A promise that resolves to an InferenceSession object.
     */
    create(uri: string, options?: InferenceSession.SessionOptions): Promise<InferenceSession>;
    /**
     * Create a new inference session and load model asynchronously from an array bufer.
     *
     * @param buffer - An ArrayBuffer representation of an ONNX model.
     * @param options - specify configuration for creating a new inference session.
     * @returns A promise that resolves to an InferenceSession object.
     */
    create(buffer: ArrayBufferLike, options?: InferenceSession.SessionOptions): Promise<InferenceSession>;
    /**
     * Create a new inference session and load model asynchronously from segment of an array bufer.
     *
     * @param buffer - An ArrayBuffer representation of an ONNX model.
     * @param byteOffset - The beginning of the specified portion of the array buffer.
     * @param byteLength - The length in bytes of the array buffer.
     * @param options - specify configuration for creating a new inference session.
     * @returns A promise that resolves to an InferenceSession object.
     */
    create(buffer: ArrayBufferLike, byteOffset: number, byteLength?: number, options?: InferenceSession.SessionOptions): Promise<InferenceSession>;
    /**
     * Create a new inference session and load model asynchronously from a Uint8Array.
     *
     * @param buffer - A Uint8Array representation of an ONNX model.
     * @param options - specify configuration for creating a new inference session.
     * @returns A promise that resolves to an InferenceSession object.
     */
    create(buffer: Uint8Array, options?: InferenceSession.SessionOptions): Promise<InferenceSession>;
}
export declare const InferenceSession: InferenceSessionFactory;
