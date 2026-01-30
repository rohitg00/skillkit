import { RGBA } from "./lib";
import { type RenderLib } from "./zig";
import { type Pointer } from "bun:ffi";
import { type BorderStyle, type BorderSides } from "./lib";
import { type WidthMethod, type CapturedLine } from "./types";
import type { TextBufferView } from "./text-buffer-view";
import type { EditorView } from "./editor-view";
export declare class OptimizedBuffer {
    private static fbIdCounter;
    id: string;
    lib: RenderLib;
    private bufferPtr;
    private _width;
    private _height;
    private _widthMethod;
    respectAlpha: boolean;
    private _rawBuffers;
    private _destroyed;
    get ptr(): Pointer;
    private guard;
    get buffers(): {
        char: Uint32Array;
        fg: Float32Array;
        bg: Float32Array;
        attributes: Uint32Array;
    };
    constructor(lib: RenderLib, ptr: Pointer, width: number, height: number, options: {
        respectAlpha?: boolean;
        id?: string;
        widthMethod?: WidthMethod;
    });
    static create(width: number, height: number, widthMethod: WidthMethod, options?: {
        respectAlpha?: boolean;
        id?: string;
    }): OptimizedBuffer;
    get widthMethod(): WidthMethod;
    get width(): number;
    get height(): number;
    setRespectAlpha(respectAlpha: boolean): void;
    getNativeId(): string;
    getRealCharBytes(addLineBreaks?: boolean): Uint8Array;
    getSpanLines(): CapturedLine[];
    clear(bg?: RGBA): void;
    setCell(x: number, y: number, char: string, fg: RGBA, bg: RGBA, attributes?: number): void;
    setCellWithAlphaBlending(x: number, y: number, char: string, fg: RGBA, bg: RGBA, attributes?: number): void;
    drawText(text: string, x: number, y: number, fg: RGBA, bg?: RGBA, attributes?: number, selection?: {
        start: number;
        end: number;
        bgColor?: RGBA;
        fgColor?: RGBA;
    } | null): void;
    fillRect(x: number, y: number, width: number, height: number, bg: RGBA): void;
    drawFrameBuffer(destX: number, destY: number, frameBuffer: OptimizedBuffer, sourceX?: number, sourceY?: number, sourceWidth?: number, sourceHeight?: number): void;
    destroy(): void;
    drawTextBuffer(textBufferView: TextBufferView, x: number, y: number): void;
    drawEditorView(editorView: EditorView, x: number, y: number): void;
    drawSuperSampleBuffer(x: number, y: number, pixelDataPtr: Pointer, pixelDataLength: number, format: "bgra8unorm" | "rgba8unorm", alignedBytesPerRow: number): void;
    drawPackedBuffer(dataPtr: Pointer, dataLen: number, posX: number, posY: number, terminalWidthCells: number, terminalHeightCells: number): void;
    drawGrayscaleBuffer(posX: number, posY: number, intensities: Float32Array, srcWidth: number, srcHeight: number, fg?: RGBA | null, bg?: RGBA | null): void;
    drawGrayscaleBufferSupersampled(posX: number, posY: number, intensities: Float32Array, srcWidth: number, srcHeight: number, fg?: RGBA | null, bg?: RGBA | null): void;
    resize(width: number, height: number): void;
    drawBox(options: {
        x: number;
        y: number;
        width: number;
        height: number;
        borderStyle?: BorderStyle;
        customBorderChars?: Uint32Array;
        border: boolean | BorderSides[];
        borderColor: RGBA;
        backgroundColor: RGBA;
        shouldFill?: boolean;
        title?: string;
        titleAlignment?: "left" | "center" | "right";
    }): void;
    pushScissorRect(x: number, y: number, width: number, height: number): void;
    popScissorRect(): void;
    clearScissorRects(): void;
    pushOpacity(opacity: number): void;
    popOpacity(): void;
    getCurrentOpacity(): number;
    clearOpacity(): void;
    encodeUnicode(text: string): {
        ptr: Pointer;
        data: Array<{
            width: number;
            char: number;
        }>;
    } | null;
    freeUnicode(encoded: {
        ptr: Pointer;
        data: Array<{
            width: number;
            char: number;
        }>;
    }): void;
    drawChar(char: number, x: number, y: number, fg: RGBA, bg: RGBA, attributes?: number): void;
}
