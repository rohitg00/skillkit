type Hex = string | null;
export type WriteFunction = (data: string | Buffer) => boolean;
export interface TerminalColors {
    palette: Hex[];
    defaultForeground: Hex;
    defaultBackground: Hex;
    cursorColor: Hex;
    mouseForeground: Hex;
    mouseBackground: Hex;
    tekForeground: Hex;
    tekBackground: Hex;
    highlightBackground: Hex;
    highlightForeground: Hex;
}
export interface GetPaletteOptions {
    timeout?: number;
    size?: number;
}
export interface TerminalPaletteDetector {
    detect(options?: GetPaletteOptions): Promise<TerminalColors>;
    detectOSCSupport(timeoutMs?: number): Promise<boolean>;
    cleanup(): void;
}
export declare class TerminalPalette implements TerminalPaletteDetector {
    private stdin;
    private stdout;
    private writeFn;
    private activeListeners;
    private activeTimers;
    private inLegacyTmux;
    constructor(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream, writeFn?: WriteFunction, isLegacyTmux?: boolean);
    /**
     * Write an OSC sequence, wrapping for tmux if needed
     */
    private writeOsc;
    cleanup(): void;
    detectOSCSupport(timeoutMs?: number): Promise<boolean>;
    private queryPalette;
    private querySpecialColors;
    detect(options?: GetPaletteOptions): Promise<TerminalColors>;
}
export declare function createTerminalPalette(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream, writeFn?: WriteFunction, isLegacyTmux?: boolean): TerminalPaletteDetector;
export {};
