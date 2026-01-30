import { Graph } from './graph';
import { Operator } from './operators';
import { OpSet } from './opset';
import { Session } from './session';
export interface InferenceHandler {
    /**
     * dispose the inference handler. it will be called as the last step in Session.run()
     */
    dispose(): void;
}
export interface SessionHandler {
    /**
     * transform the graph at initialization time
     * @param graphTransformer the graph transformer to manipulate the model graph
     */
    transformGraph?(graphTransformer: Graph.Transformer): void;
    /**
     * create an instance of InferenceHandler to use in a Session.run() call
     */
    createInferenceHandler(): InferenceHandler;
    /**
     * dispose the session handler. it will be called when a session is being disposed explicitly
     */
    dispose(): void;
    /**
     * Resolves the operator from the name and opset version; backend specific
     * @param node the node to resolve
     * @param opsets a list of opsets that exported from the model
     * @param graph the completely initialized graph
     */
    resolve(node: Graph.Node, opsets: readonly OpSet[], graph: Graph): Operator;
    /**
     * This method let's the sessionHandler know that the graph initialization is complete
     * @param graph the completely initialized graph
     */
    onGraphInitialized?(graph: Graph): void;
    /**
     * a reference to the corresponding backend
     */
    readonly backend: Backend;
    /**
     * a reference to the session context
     */
    readonly context: Session.Context;
}
export interface Backend {
    /**
     * initialize the backend. will be called only once, when the first time the
     * backend it to be used
     */
    initialize(): boolean | Promise<boolean>;
    /**
     * create an instance of SessionHandler to use in a Session object's lifecycle
     */
    createSessionHandler(context: Session.Context): SessionHandler;
    /**
     * dispose the backend. currently this will not be called
     */
    dispose(): void;
}
export declare const backend: {
    [name: string]: Backend;
};
/**
 * Resolve a reference to the backend. If a hint is specified, the corresponding
 * backend will be used.
 */
export declare function resolveBackend(hint?: string | readonly string[]): Promise<Backend>;
export type BackendType = Backend;
export type SessionHandlerType = ReturnType<BackendType['createSessionHandler']>;
export type InferenceHandlerType = ReturnType<SessionHandlerType['createInferenceHandler']>;
