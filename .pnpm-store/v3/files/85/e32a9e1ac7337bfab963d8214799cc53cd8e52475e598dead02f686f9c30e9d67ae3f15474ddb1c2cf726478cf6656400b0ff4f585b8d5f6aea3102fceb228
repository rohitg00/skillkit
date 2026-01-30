import type { Timings } from './utils/timer.js';
import type { RequestError } from './errors.js';
export type RequestId = string;
/**
Message for the `got:request:create` diagnostic channel.

Emitted when a request is created.
*/
export type DiagnosticRequestCreate = {
    requestId: RequestId;
    url: string;
    method: string;
};
/**
Message for the `got:request:start` diagnostic channel.

Emitted before the native HTTP request is sent.
*/
export type DiagnosticRequestStart = {
    requestId: RequestId;
    url: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
};
/**
Message for the `got:response:start` diagnostic channel.

Emitted when response headers are received.
*/
export type DiagnosticResponseStart = {
    requestId: RequestId;
    url: string;
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    isFromCache: boolean;
};
/**
Message for the `got:response:end` diagnostic channel.

Emitted when the response completes.
*/
export type DiagnosticResponseEnd = {
    requestId: RequestId;
    url: string;
    statusCode: number;
    bodySize?: number;
    timings?: Timings;
};
/**
Message for the `got:request:retry` diagnostic channel.

Emitted when retrying a request.
*/
export type DiagnosticRequestRetry = {
    requestId: RequestId;
    retryCount: number;
    error: RequestError;
    delay: number;
};
/**
Message for the `got:request:error` diagnostic channel.

Emitted when a request fails.
*/
export type DiagnosticRequestError = {
    requestId: RequestId;
    url: string;
    error: RequestError;
    timings?: Timings;
};
/**
Message for the `got:response:redirect` diagnostic channel.

Emitted when following a redirect.
*/
export type DiagnosticResponseRedirect = {
    requestId: RequestId;
    fromUrl: string;
    toUrl: string;
    statusCode: number;
};
export declare function generateRequestId(): RequestId;
export declare function publishRequestCreate(message: DiagnosticRequestCreate): void;
export declare function publishRequestStart(message: DiagnosticRequestStart): void;
export declare function publishResponseStart(message: DiagnosticResponseStart): void;
export declare function publishResponseEnd(message: DiagnosticResponseEnd): void;
export declare function publishRetry(message: DiagnosticRequestRetry): void;
export declare function publishError(message: DiagnosticRequestError): void;
export declare function publishRedirect(message: DiagnosticResponseRedirect): void;
