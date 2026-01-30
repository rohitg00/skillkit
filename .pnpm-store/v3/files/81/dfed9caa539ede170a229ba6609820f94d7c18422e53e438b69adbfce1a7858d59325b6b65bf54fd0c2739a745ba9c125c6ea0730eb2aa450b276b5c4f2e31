export declare class GPUCanvasContextMock implements GPUCanvasContext {
    readonly canvas: HTMLCanvasElement | OffscreenCanvas;
    readonly __brand: "GPUCanvasContext";
    private _configuration;
    private _currentTexture;
    private _nextTexture;
    private width;
    private height;
    private _device;
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number);
    configure(descriptor: GPUCanvasConfiguration): undefined;
    unconfigure(): undefined;
    getConfiguration(): GPUCanvasConfigurationOut | null;
    setSize(width: number, height: number): undefined;
    private createTextures;
    private createRenderTexture;
    getCurrentTexture(): GPUTexture;
    switchTextures(): GPUTexture;
}
