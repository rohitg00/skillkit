import { randomUUID } from 'node:crypto';
import diagnosticsChannel from 'node:diagnostics_channel';
const channels = {
    requestCreate: diagnosticsChannel.channel('got:request:create'),
    requestStart: diagnosticsChannel.channel('got:request:start'),
    responseStart: diagnosticsChannel.channel('got:response:start'),
    responseEnd: diagnosticsChannel.channel('got:response:end'),
    retry: diagnosticsChannel.channel('got:request:retry'),
    error: diagnosticsChannel.channel('got:request:error'),
    redirect: diagnosticsChannel.channel('got:response:redirect'),
};
export function generateRequestId() {
    return randomUUID();
}
export function publishRequestCreate(message) {
    if (channels.requestCreate.hasSubscribers) {
        channels.requestCreate.publish(message);
    }
}
export function publishRequestStart(message) {
    if (channels.requestStart.hasSubscribers) {
        channels.requestStart.publish(message);
    }
}
export function publishResponseStart(message) {
    if (channels.responseStart.hasSubscribers) {
        channels.responseStart.publish(message);
    }
}
export function publishResponseEnd(message) {
    if (channels.responseEnd.hasSubscribers) {
        channels.responseEnd.publish(message);
    }
}
export function publishRetry(message) {
    if (channels.retry.hasSubscribers) {
        channels.retry.publish(message);
    }
}
export function publishError(message) {
    if (channels.error.hasSubscribers) {
        channels.error.publish(message);
    }
}
export function publishRedirect(message) {
    if (channels.redirect.hasSubscribers) {
        channels.redirect.publish(message);
    }
}
