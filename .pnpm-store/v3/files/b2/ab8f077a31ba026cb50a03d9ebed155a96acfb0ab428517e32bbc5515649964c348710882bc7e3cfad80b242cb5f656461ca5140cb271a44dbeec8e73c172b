import { EventEmitter } from 'node:events';
import is from '@sindresorhus/is';
import PCancelable from 'p-cancelable';
import { HTTPError, RetryError, } from '../core/errors.js';
import Request from '../core/index.js';
import { parseBody, isResponseOk, ParseError, } from '../core/response.js';
import proxyEvents from '../core/utils/proxy-events.js';
import { CancelError } from './types.js';
const proxiedRequestEvents = [
    'request',
    'response',
    'redirect',
    'uploadProgress',
    'downloadProgress',
];
export default function asPromise(firstRequest) {
    let globalRequest;
    let globalResponse;
    let normalizedOptions;
    const emitter = new EventEmitter();
    let promiseSettled = false;
    const promise = new PCancelable((resolve, reject, onCancel) => {
        onCancel(() => {
            globalRequest.destroy();
        });
        onCancel.shouldReject = false;
        onCancel(() => {
            promiseSettled = true;
            reject(new CancelError(globalRequest));
        });
        const makeRequest = (retryCount) => {
            // Errors when a new request is made after the promise settles.
            // Used to detect a race condition.
            // See https://github.com/sindresorhus/got/issues/1489
            onCancel(() => { });
            const request = firstRequest ?? new Request(undefined, undefined, normalizedOptions);
            request.retryCount = retryCount;
            request._noPipe = true;
            globalRequest = request;
            request.once('response', async (response) => {
                // Parse body
                const contentEncoding = (response.headers['content-encoding'] ?? '').toLowerCase();
                const isCompressed = contentEncoding === 'gzip' || contentEncoding === 'deflate' || contentEncoding === 'br' || contentEncoding === 'zstd';
                const { options } = request;
                if (isCompressed && !options.decompress) {
                    response.body = response.rawBody;
                }
                else {
                    try {
                        response.body = parseBody(response, options.responseType, options.parseJson, options.encoding);
                    }
                    catch (error) {
                        // Fall back to `utf8`
                        try {
                            response.body = response.rawBody.toString();
                        }
                        catch (error) {
                            request._beforeError(new ParseError(error, response));
                            return;
                        }
                        if (isResponseOk(response)) {
                            request._beforeError(error);
                            return;
                        }
                    }
                }
                try {
                    const hooks = options.hooks.afterResponse;
                    for (const [index, hook] of hooks.entries()) {
                        // @ts-expect-error TS doesn't notice that CancelableRequest is a Promise
                        // eslint-disable-next-line no-await-in-loop
                        response = await hook(response, async (updatedOptions) => {
                            const preserveHooks = updatedOptions.preserveHooks ?? false;
                            options.merge(updatedOptions);
                            options.prefixUrl = '';
                            if (updatedOptions.url) {
                                options.url = updatedOptions.url;
                            }
                            // Remove any further hooks for that request, because we'll call them anyway.
                            // The loop continues. We don't want duplicates (asPromise recursion).
                            // Unless preserveHooks is true, in which case we keep the remaining hooks.
                            if (!preserveHooks) {
                                options.hooks.afterResponse = options.hooks.afterResponse.slice(0, index);
                            }
                            throw new RetryError(request);
                        });
                        if (!(is.object(response) && is.number(response.statusCode) && 'body' in response)) {
                            throw new TypeError('The `afterResponse` hook returned an invalid value');
                        }
                    }
                }
                catch (error) {
                    request._beforeError(error);
                    return;
                }
                globalResponse = response;
                if (!isResponseOk(response)) {
                    request._beforeError(new HTTPError(response));
                    return;
                }
                request.destroy();
                promiseSettled = true;
                resolve(request.options.resolveBodyOnly ? response.body : response);
            });
            let handledFinalError = false;
            const onError = (error) => {
                if (promise.isCanceled) {
                    return;
                }
                // Route errors emitted directly on the stream (e.g., EPIPE from Node.js)
                // through retry logic first, then handle them here after retries are exhausted.
                // See https://github.com/sindresorhus/got/issues/1995
                if (!request._stopReading) {
                    request._beforeError(error);
                    return;
                }
                // Allow the manual re-emission from Request to land only once.
                if (handledFinalError) {
                    return;
                }
                handledFinalError = true;
                promiseSettled = true;
                const { options } = request;
                if (error instanceof HTTPError && !options.throwHttpErrors) {
                    const { response } = error;
                    request.destroy();
                    resolve(request.options.resolveBodyOnly ? response.body : response);
                    return;
                }
                reject(error);
            };
            // Use .on() instead of .once() to keep the listener active across retries.
            // When _stopReading is false, we return early and the error gets re-emitted
            // after retry logic completes, so we need this listener to remain active.
            // See https://github.com/sindresorhus/got/issues/1995
            request.on('error', onError);
            const previousBody = request.options?.body;
            request.once('retry', (newRetryCount, error) => {
                firstRequest = undefined;
                // If promise already settled, don't retry
                // This prevents the race condition in #1489 where a late error
                // (e.g., ECONNRESET after successful response) triggers retry
                // after the promise has already resolved/rejected
                if (promiseSettled) {
                    return;
                }
                const newBody = request.options.body;
                if (previousBody === newBody && is.nodeStream(newBody)) {
                    error.message = 'Cannot retry with consumed body stream';
                    onError(error);
                    return;
                }
                // This is needed! We need to reuse `request.options` because they can get modified!
                // For example, by calling `promise.json()`.
                normalizedOptions = request.options;
                makeRequest(newRetryCount);
            });
            proxyEvents(request, emitter, proxiedRequestEvents);
            if (is.undefined(firstRequest)) {
                void request.flush();
            }
        };
        makeRequest(0);
    });
    promise.on = (event, function_) => {
        emitter.on(event, function_);
        return promise;
    };
    promise.off = (event, function_) => {
        emitter.off(event, function_);
        return promise;
    };
    const shortcut = (promiseToAwait, responseType) => {
        const newPromise = (async () => {
            // Wait until downloading has ended
            await promiseToAwait;
            const { options } = globalResponse.request;
            return parseBody(globalResponse, responseType, options.parseJson, options.encoding);
        })();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Object.defineProperties(newPromise, Object.getOwnPropertyDescriptors(promiseToAwait));
        return newPromise;
    };
    // Note: These use `function` syntax (not arrows) to access `this` context.
    // When custom handlers wrap the promise to transform errors, these methods
    // are copied to the handler's promise. Using `this` ensures we await the
    // handler's wrapped promise, not the original, so errors propagate correctly.
    promise.json = function () {
        if (globalRequest.options) {
            const { headers } = globalRequest.options;
            if (!globalRequest.writableFinished && !('accept' in headers)) {
                headers.accept = 'application/json';
            }
        }
        return shortcut(this, 'json');
    };
    promise.buffer = function () {
        return shortcut(this, 'buffer');
    };
    promise.text = function () {
        return shortcut(this, 'text');
    };
    return promise;
}
