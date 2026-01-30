import type { ClientRequest, IncomingMessage } from 'node:http';
export type Timings = {
    start: number;
    socket?: number;
    lookup?: number;
    connect?: number;
    secureConnect?: number;
    upload?: number;
    response?: number;
    end?: number;
    error?: number;
    abort?: number;
    phases: {
        wait?: number;
        dns?: number;
        tcp?: number;
        tls?: number;
        request?: number;
        firstByte?: number;
        download?: number;
        total?: number;
    };
};
export type ClientRequestWithTimings = ClientRequest & {
    timings?: Timings;
};
export type IncomingMessageWithTimings = IncomingMessage & {
    timings?: Timings;
};
declare const timer: (request: ClientRequestWithTimings) => Timings;
export default timer;
