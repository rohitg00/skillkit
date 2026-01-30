export type MouseEventType = "down" | "up" | "move" | "drag" | "drag-end" | "drop" | "over" | "out" | "scroll";
export interface ScrollInfo {
    direction: "up" | "down" | "left" | "right";
    delta: number;
}
export type RawMouseEvent = {
    type: MouseEventType;
    button: number;
    x: number;
    y: number;
    modifiers: {
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    };
    scroll?: ScrollInfo;
};
export declare class MouseParser {
    private mouseButtonsPressed;
    private static readonly SCROLL_DIRECTIONS;
    reset(): void;
    parseMouseEvent(data: Buffer): RawMouseEvent | null;
}
