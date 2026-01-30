import type { Socket } from 'node:net';
import type { TLSSocket } from 'node:tls';
type Listeners = {
    connect?: () => void;
    secureConnect?: () => void;
    close?: (hadError: boolean) => void;
};
declare const deferToConnect: (socket: TLSSocket | Socket, fn: Listeners | (() => void)) => void;
export default deferToConnect;
