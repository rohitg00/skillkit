import type { EventEmitter } from 'node:events';
type Origin = EventEmitter;
type Event = string | symbol;
type AnyFunction = (...arguments_: any[]) => void;
type Unhandler = {
    once: (origin: Origin, event: Event, function_: AnyFunction) => void;
    unhandleAll: () => void;
};
export default function unhandle(): Unhandler;
export {};
