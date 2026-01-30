/**
 * Returns a stable callback that always calls the latest version of the provided handler.
 * This prevents unnecessary re-renders and effect re-runs while ensuring the callback
 * always has access to the latest props and state.
 *
 * Useful for event handlers that need to be passed to effects with empty dependency arrays
 * or memoized child components.
 */
export declare function useEffectEvent<T extends (...args: any[]) => any>(handler: T): T;
