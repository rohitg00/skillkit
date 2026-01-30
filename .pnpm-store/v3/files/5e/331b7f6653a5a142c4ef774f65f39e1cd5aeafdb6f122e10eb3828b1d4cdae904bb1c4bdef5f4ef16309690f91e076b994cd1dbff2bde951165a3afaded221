/**
 * StdinBuffer buffers input and emits complete sequences.
 *
 * This is necessary because stdin data events can arrive in partial chunks,
 * especially for escape sequences like mouse events. Without buffering,
 * partial sequences can be misinterpreted as regular keypresses.
 *
 * For example, the mouse SGR sequence `\x1b[<35;20;5m` might arrive as:
 * - Event 1: `\x1b`
 * - Event 2: `[<35`
 * - Event 3: `;20;5m`
 *
 * The buffer accumulates these until a complete sequence is detected.
 * Call the `process()` method to feed input data.
 */
import { EventEmitter } from "events";
export type StdinBufferOptions = {
    /**
     * Maximum time to wait for sequence completion (default: 10ms)
     * After this time, the buffer is flushed even if incomplete
     */
    timeout?: number;
};
export type StdinBufferEventMap = {
    data: [string];
    paste: [string];
};
/**
 * Buffers stdin input and emits complete sequences via the 'data' event.
 * Handles partial escape sequences that arrive across multiple chunks.
 */
export declare class StdinBuffer extends EventEmitter<StdinBufferEventMap> {
    private buffer;
    private timeout;
    private readonly timeoutMs;
    private pasteMode;
    private pasteBuffer;
    constructor(options?: StdinBufferOptions);
    process(data: string | Buffer): void;
    flush(): string[];
    clear(): void;
    getBuffer(): string;
    destroy(): void;
}
