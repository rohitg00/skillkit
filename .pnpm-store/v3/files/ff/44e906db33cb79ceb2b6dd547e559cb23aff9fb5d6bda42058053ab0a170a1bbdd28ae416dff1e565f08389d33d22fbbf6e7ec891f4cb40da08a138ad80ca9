export interface BlockBuffer {
    __type: "BlockBuffer";
    buffer: ArrayBuffer;
    index: number;
}
/**
 * Buffer pool with minimal overhead.
 * To control when ArrayBuffers are allocated and freed
 * and to avoid some gc runs.
 */
export declare class BufferPool {
    private buffers;
    readonly blockSize: number;
    private freeBlocks;
    private readonly minBlocks;
    private readonly maxBlocks;
    private currentBlocks;
    private allocatedCount;
    private bufferToBlockIndex;
    constructor(minBlocks: number, maxBlocks: number, blockSize: number);
    private initializePool;
    private expandPool;
    /**
     * Request a block. Returns an object with the pre-allocated ArrayBuffer and its index, or throws if out of memory.
     */
    request(): BlockBuffer;
    /**
     * Release a block using the ArrayBuffer returned from request().
     */
    release(buffer: ArrayBuffer): void;
    /**
     * Release a block by its index.
     */
    releaseBlock(blockIndex: number): void;
    /**
     * Get the ArrayBuffer for a specific block index.
     */
    getBuffer(blockIndex: number): ArrayBuffer;
    reset(): void;
    get totalBlockCount(): number;
    get maxBlockCount(): number;
    get minBlockCount(): number;
    get allocatedBlockCount(): number;
    get freeBlockCount(): number;
    get hasAvailableBlocks(): boolean;
    get utilizationRatio(): number;
}
