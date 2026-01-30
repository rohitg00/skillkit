import { Backend, SessionHandler } from '../backend';
import { Session } from '../session';
import { WebGLContext } from './webgl/webgl-context';
/**
 * WebGLBackend is the entry point for all WebGL opeartions
 * When it starts it created the WebGLRenderingContext
 * and other main framework components such as Program and Texture Managers
 */
export declare class WebGLBackend implements Backend {
    glContext: WebGLContext;
    get contextId(): 'webgl' | 'webgl2' | undefined;
    set contextId(value: 'webgl' | 'webgl2' | undefined);
    get matmulMaxBatchSize(): number | undefined;
    set matmulMaxBatchSize(value: number | undefined);
    get textureCacheMode(): 'initializerOnly' | 'full' | undefined;
    set textureCacheMode(value: 'initializerOnly' | 'full' | undefined);
    get pack(): boolean | undefined;
    set pack(value: boolean | undefined);
    get async(): boolean | undefined;
    set async(value: boolean | undefined);
    initialize(): boolean;
    createSessionHandler(context: Session.Context): SessionHandler;
    dispose(): void;
}
