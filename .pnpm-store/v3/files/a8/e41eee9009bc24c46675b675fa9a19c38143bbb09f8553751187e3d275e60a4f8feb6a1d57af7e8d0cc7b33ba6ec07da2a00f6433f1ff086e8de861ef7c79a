import { CliRenderer } from "@opentui/core";
import { type ReactNode } from "react";
declare const flushSync: {
    (): void;
    <R>(fn: () => R): R;
};
declare const createPortal: (children: ReactNode, containerInfo: any, implementation: any, key?: string | null) => import("react-reconciler").ReactPortal;
export type Root = {
    render: (node: ReactNode) => void;
    unmount: () => void;
};
/**
 * Creates a root for rendering a React tree with the given CLI renderer.
 * @param renderer The CLI renderer to use
 * @returns A root object with a `render` method
 * @example
 * ```tsx
 * const renderer = await createCliRenderer()
 * createRoot(renderer).render(<App />)
 * ```
 */
export declare function createRoot(renderer: CliRenderer): Root;
export { createPortal, flushSync };
