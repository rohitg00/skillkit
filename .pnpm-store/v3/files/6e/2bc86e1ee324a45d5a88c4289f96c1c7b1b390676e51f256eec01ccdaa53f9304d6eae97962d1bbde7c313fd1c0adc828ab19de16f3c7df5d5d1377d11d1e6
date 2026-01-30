import { Keyv } from "keyv";
import { type CacheableOptions, type CacheResponse, type CacheValue, type Emitter, type RequestFn } from "./types.js";
type Function_ = (...arguments_: any[]) => any;
declare class CacheableRequest {
    cache: Keyv;
    cacheRequest: RequestFn;
    hooks: Map<string, Function_>;
    constructor(cacheRequest: RequestFn, cacheAdapter?: any);
    request: () => (options: CacheableOptions, callback?: (response: CacheResponse) => void) => Emitter;
    addHook: (name: string, function_: Function_) => void;
    removeHook: (name: string) => boolean;
    getHook: (name: string) => Function_;
    runHook: (name: string, ...arguments_: any[]) => Promise<CacheValue>;
}
export declare const parseWithWhatwg: (raw: string) => {
    protocol: string;
    slashes: boolean;
    auth: string;
    host: string;
    port: string;
    hostname: string;
    hash: string;
    search: string;
    query: {
        [k: string]: string;
    };
    pathname: string;
    path: string;
    href: string;
};
export default CacheableRequest;
export * from "./types.js";
export declare const onResponse = "onResponse";
//# sourceMappingURL=index.d.ts.map