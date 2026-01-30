import type { Timings } from './utils/timer.js';
import type Options from './options.js';
import type { TimeoutError as TimedOutTimeoutError } from './timed-out.js';
import type { PlainResponse, Response } from './response.js';
import type Request from './index.js';
type Error = NodeJS.ErrnoException;
/**
An error to be thrown when a request fails.
Contains a `code` property with error class code, like `ECONNREFUSED`.
*/
export declare class RequestError<T = unknown> extends Error {
    name: string;
    code: string;
    input?: string;
    stack: string;
    readonly options: Options;
    readonly response?: Response<T>;
    readonly request?: Request;
    readonly timings?: Timings;
    constructor(message: string, error: Partial<Error & {
        code?: string;
    }>, self: Request | Options);
}
/**
An error to be thrown when the server redirects you more than ten times.
Includes a `response` property.
*/
export declare class MaxRedirectsError extends RequestError {
    name: string;
    code: string;
    readonly response: Response;
    readonly request: Request;
    readonly timings: Timings;
    constructor(request: Request);
}
/**
An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
Includes a `response` property.
*/
export declare class HTTPError<T = any> extends RequestError<T> {
    name: string;
    code: string;
    readonly response: Response<T>;
    readonly request: Request;
    readonly timings: Timings;
    constructor(response: PlainResponse);
}
/**
An error to be thrown when a cache method fails.
For example, if the database goes down or there's a filesystem error.
*/
export declare class CacheError extends RequestError {
    name: string;
    readonly request: Request;
    constructor(error: Error, request: Request);
}
/**
An error to be thrown when the request body is a stream and an error occurs while reading from that stream.
*/
export declare class UploadError extends RequestError {
    name: string;
    readonly request: Request;
    constructor(error: Error, request: Request);
}
/**
An error to be thrown when the request is aborted due to a timeout.
Includes an `event` and `timings` property.
*/
export declare class TimeoutError extends RequestError {
    name: string;
    readonly request: Request;
    readonly timings: Timings;
    readonly event: string;
    constructor(error: TimedOutTimeoutError, timings: Timings, request: Request);
}
/**
An error to be thrown when reading from response stream fails.
*/
export declare class ReadError extends RequestError {
    name: string;
    readonly request: Request;
    readonly response: Response;
    readonly timings: Timings;
    constructor(error: Error, request: Request);
}
/**
An error which always triggers a new retry when thrown.
*/
export declare class RetryError extends RequestError {
    name: string;
    code: string;
    constructor(request: Request);
}
/**
An error to be thrown when the request is aborted by AbortController.
*/
export declare class AbortError extends RequestError {
    name: string;
    code: string;
    constructor(request: Request);
}
export {};
