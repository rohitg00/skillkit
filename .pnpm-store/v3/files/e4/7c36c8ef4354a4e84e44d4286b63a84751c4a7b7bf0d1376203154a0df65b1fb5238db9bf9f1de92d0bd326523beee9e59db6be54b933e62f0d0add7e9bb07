import { Renderable, RootRenderable } from "./Renderable";
import { type CursorStyle, DebugOverlayCorner, type RenderContext, type WidthMethod } from "./types";
import { RGBA, type ColorInput } from "./lib/RGBA";
import type { Pointer } from "bun:ffi";
import { OptimizedBuffer } from "./buffer";
import { type RenderLib } from "./zig";
import { TerminalConsole, type ConsoleOptions } from "./console";
import { type MouseEventType, type RawMouseEvent, type ScrollInfo } from "./lib/parse.mouse";
import { Selection } from "./lib/selection";
import { EventEmitter } from "events";
import { KeyHandler, InternalKeyHandler } from "./lib/KeyHandler";
import { type TerminalColors, type GetPaletteOptions } from "./lib/terminal-palette";
export interface CliRendererConfig {
    stdin?: NodeJS.ReadStream;
    stdout?: NodeJS.WriteStream;
    exitOnCtrlC?: boolean;
    exitSignals?: NodeJS.Signals[];
    debounceDelay?: number;
    targetFps?: number;
    maxFps?: number;
    memorySnapshotInterval?: number;
    useThread?: boolean;
    gatherStats?: boolean;
    maxStatSamples?: number;
    consoleOptions?: ConsoleOptions;
    postProcessFns?: ((buffer: OptimizedBuffer, deltaTime: number) => void)[];
    enableMouseMovement?: boolean;
    useMouse?: boolean;
    useAlternateScreen?: boolean;
    useConsole?: boolean;
    experimental_splitHeight?: number;
    useKittyKeyboard?: KittyKeyboardOptions | null;
    backgroundColor?: ColorInput;
    openConsoleOnError?: boolean;
    prependInputHandlers?: ((sequence: string) => boolean)[];
    onDestroy?: () => void;
}
export type PixelResolution = {
    width: number;
    height: number;
};
/**
 * Kitty Keyboard Protocol configuration options
 * See: https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement
 */
export interface KittyKeyboardOptions {
    /** Disambiguate escape codes (fixes ESC timing, alt+key ambiguity, ctrl+c as event). Default: true */
    disambiguate?: boolean;
    /** Report alternate keys (numpad, shifted, base layout) for cross-keyboard shortcuts. Default: true */
    alternateKeys?: boolean;
    /** Report event types (press/repeat/release). Default: false */
    events?: boolean;
    /** Report all keys as escape codes. Default: false */
    allKeysAsEscapes?: boolean;
    /** Report text associated with key events. Default: false */
    reportText?: boolean;
}
/**
 * Build kitty keyboard protocol flags based on configuration
 * @param config Kitty keyboard configuration object (null/undefined = disabled)
 * @returns The combined flags value (0 = disabled, >0 = enabled)
 * @internal Exported for testing
 */
export declare function buildKittyKeyboardFlags(config: KittyKeyboardOptions | null | undefined): number;
export declare class MouseEvent {
    readonly type: MouseEventType;
    readonly button: number;
    readonly x: number;
    readonly y: number;
    readonly source?: Renderable;
    readonly modifiers: {
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    };
    readonly scroll?: ScrollInfo;
    readonly target: Renderable | null;
    readonly isSelecting?: boolean;
    private _propagationStopped;
    private _defaultPrevented;
    get propagationStopped(): boolean;
    get defaultPrevented(): boolean;
    constructor(target: Renderable | null, attributes: RawMouseEvent & {
        source?: Renderable;
        isSelecting?: boolean;
    });
    stopPropagation(): void;
    preventDefault(): void;
}
export declare enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    WHEEL_UP = 4,
    WHEEL_DOWN = 5
}
export declare function createCliRenderer(config?: CliRendererConfig): Promise<CliRenderer>;
export declare enum CliRenderEvents {
    DEBUG_OVERLAY_TOGGLE = "debugOverlay:toggle",
    DESTROY = "destroy"
}
export declare enum RendererControlState {
    IDLE = "idle",
    AUTO_STARTED = "auto_started",
    EXPLICIT_STARTED = "explicit_started",
    EXPLICIT_PAUSED = "explicit_paused",
    EXPLICIT_SUSPENDED = "explicit_suspended",
    EXPLICIT_STOPPED = "explicit_stopped"
}
export declare class CliRenderer extends EventEmitter implements RenderContext {
    private static animationFrameId;
    private lib;
    rendererPtr: Pointer;
    stdin: NodeJS.ReadStream;
    private stdout;
    private exitOnCtrlC;
    private exitSignals;
    private _exitListenersAdded;
    private _isDestroyed;
    private _destroyPending;
    private _destroyFinalized;
    nextRenderBuffer: OptimizedBuffer;
    currentRenderBuffer: OptimizedBuffer;
    private _isRunning;
    private targetFps;
    private maxFps;
    private automaticMemorySnapshot;
    private memorySnapshotInterval;
    private memorySnapshotTimer;
    private lastMemorySnapshot;
    readonly root: RootRenderable;
    width: number;
    height: number;
    private _useThread;
    private gatherStats;
    private frameTimes;
    private maxStatSamples;
    private postProcessFns;
    private backgroundColor;
    private waitingForPixelResolution;
    private rendering;
    private renderingNative;
    private renderTimeout;
    private lastTime;
    private frameCount;
    private lastFpsTime;
    private currentFps;
    private targetFrameTime;
    private minTargetFrameTime;
    private immediateRerenderRequested;
    private updateScheduled;
    private liveRequestCounter;
    private _controlState;
    private frameCallbacks;
    private renderStats;
    debugOverlay: {
        enabled: any;
        corner: DebugOverlayCorner;
    };
    private _console;
    private _resolution;
    private _keyHandler;
    private _stdinBuffer;
    private animationRequest;
    private resizeTimeoutId;
    private capabilityTimeoutId;
    private resizeDebounceDelay;
    private enableMouseMovement;
    private _useMouse;
    private _useAlternateScreen;
    private _suspendedMouseEnabled;
    private _previousControlState;
    private capturedRenderable?;
    private lastOverRenderableNum;
    private lastOverRenderable?;
    private currentSelection;
    private selectionContainers;
    private _splitHeight;
    private renderOffset;
    private _terminalWidth;
    private _terminalHeight;
    private _terminalIsSetup;
    private realStdoutWrite;
    private captureCallback;
    private _useConsole;
    private mouseParser;
    private sigwinchHandler;
    private _capabilities;
    private _latestPointer;
    private _hasPointer;
    private _lastPointerModifiers;
    private _currentFocusedRenderable;
    private lifecyclePasses;
    private _openConsoleOnError;
    private _paletteDetector;
    private _cachedPalette;
    private _paletteDetectionPromise;
    private _onDestroy?;
    private inputHandlers;
    private prependedInputHandlers;
    private idleResolvers;
    private _debugInputs;
    private _debugModeEnabled;
    private handleError;
    private dumpOutputCache;
    private exitHandler;
    private warningHandler;
    get controlState(): RendererControlState;
    constructor(lib: RenderLib, rendererPtr: Pointer, stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream, width: number, height: number, config?: CliRendererConfig);
    private addExitListeners;
    private removeExitListeners;
    get isDestroyed(): boolean;
    registerLifecyclePass(renderable: Renderable): void;
    unregisterLifecyclePass(renderable: Renderable): void;
    getLifecyclePasses(): Set<Renderable>;
    get currentFocusedRenderable(): Renderable | null;
    focusRenderable(renderable: Renderable): void;
    private setCapturedRenderable;
    addToHitGrid(x: number, y: number, width: number, height: number, id: number): void;
    pushHitGridScissorRect(x: number, y: number, width: number, height: number): void;
    popHitGridScissorRect(): void;
    clearHitGridScissorRects(): void;
    get widthMethod(): WidthMethod;
    private writeOut;
    requestRender(): void;
    private activateFrame;
    get useConsole(): boolean;
    set useConsole(value: boolean);
    get isRunning(): boolean;
    private isIdleNow;
    private resolveIdleIfNeeded;
    idle(): Promise<void>;
    get resolution(): PixelResolution | null;
    get console(): TerminalConsole;
    get keyInput(): KeyHandler;
    get _internalKeyInput(): InternalKeyHandler;
    get terminalWidth(): number;
    get terminalHeight(): number;
    get useThread(): boolean;
    get useMouse(): boolean;
    set useMouse(useMouse: boolean);
    get experimental_splitHeight(): number;
    get liveRequestCount(): number;
    get currentControlState(): string;
    get capabilities(): any | null;
    getDebugInputs(): Array<{
        timestamp: string;
        sequence: string;
    }>;
    get useKittyKeyboard(): boolean;
    set useKittyKeyboard(use: boolean);
    set experimental_splitHeight(splitHeight: number);
    private interceptStdoutWrite;
    disableStdoutInterception(): void;
    private flushStdoutCache;
    private enableMouse;
    private disableMouse;
    enableKittyKeyboard(flags?: number): void;
    disableKittyKeyboard(): void;
    set useThread(useThread: boolean);
    setupTerminal(): Promise<void>;
    private stdinListener;
    addInputHandler(handler: (sequence: string) => boolean): void;
    prependInputHandler(handler: (sequence: string) => boolean): void;
    removeInputHandler(handler: (sequence: string) => boolean): void;
    private capabilityHandler;
    private focusHandler;
    private setupInput;
    private handleMouseData;
    /**
     * Recheck hover state after hit grid changes.
     * Called after render when native code detects the hit grid changed.
     * Fires out/over events if the element under the cursor changed.
     */
    private recheckHoverState;
    hitTest(x: number, y: number): number;
    private takeMemorySnapshot;
    private startMemorySnapshotTimer;
    private stopMemorySnapshotTimer;
    setMemorySnapshotInterval(interval: number): void;
    private handleResize;
    private queryPixelResolution;
    private processResize;
    setBackgroundColor(color: ColorInput): void;
    toggleDebugOverlay(): void;
    configureDebugOverlay(options: {
        enabled?: boolean;
        corner?: DebugOverlayCorner;
    }): void;
    setTerminalTitle(title: string): void;
    dumpHitGrid(): void;
    dumpBuffers(timestamp?: number): void;
    dumpStdoutBuffer(timestamp?: number): void;
    static setCursorPosition(renderer: CliRenderer, x: number, y: number, visible?: boolean): void;
    static setCursorStyle(renderer: CliRenderer, style: CursorStyle, blinking?: boolean, color?: RGBA): void;
    static setCursorColor(renderer: CliRenderer, color: RGBA): void;
    setCursorPosition(x: number, y: number, visible?: boolean): void;
    setCursorStyle(style: CursorStyle, blinking?: boolean, color?: RGBA): void;
    setCursorColor(color: RGBA): void;
    getCursorState(): import("./zig").CursorState;
    addPostProcessFn(processFn: (buffer: OptimizedBuffer, deltaTime: number) => void): void;
    removePostProcessFn(processFn: (buffer: OptimizedBuffer, deltaTime: number) => void): void;
    clearPostProcessFns(): void;
    setFrameCallback(callback: (deltaTime: number) => Promise<void>): void;
    removeFrameCallback(callback: (deltaTime: number) => Promise<void>): void;
    clearFrameCallbacks(): void;
    requestLive(): void;
    dropLive(): void;
    start(): void;
    auto(): void;
    private internalStart;
    pause(): void;
    suspend(): void;
    resume(): void;
    private internalPause;
    stop(): void;
    private internalStop;
    destroy(): void;
    private finalizeDestroy;
    private startRenderLoop;
    private loop;
    intermediateRender(): void;
    private renderNative;
    private collectStatSample;
    getStats(): {
        fps: number;
        frameCount: number;
        frameTimes: number[];
        averageFrameTime: number;
        minFrameTime: number;
        maxFrameTime: number;
    };
    resetStats(): void;
    setGatherStats(enabled: boolean): void;
    getSelection(): Selection | null;
    get hasSelection(): boolean;
    getSelectionContainer(): Renderable | null;
    clearSelection(): void;
    /**
     * Start a new selection at the given coordinates.
     * Used by both mouse and keyboard selection.
     */
    startSelection(renderable: Renderable, x: number, y: number): void;
    updateSelection(currentRenderable: Renderable | undefined, x: number, y: number): void;
    requestSelectionUpdate(): void;
    private isWithinContainer;
    private finishSelection;
    private notifySelectablesOfSelectionChange;
    private walkSelectableRenderables;
    get paletteDetectionStatus(): "idle" | "detecting" | "cached";
    clearPaletteCache(): void;
    /**
     * Detects the terminal's color palette
     *
     * @returns Promise resolving to TerminalColors object containing palette and special colors
     * @throws Error if renderer is suspended
     */
    getPalette(options?: GetPaletteOptions): Promise<TerminalColors>;
}
