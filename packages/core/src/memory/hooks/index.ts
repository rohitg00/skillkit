/**
 * Memory Hooks Module
 *
 * Provides Claude Code lifecycle hooks for automatic memory capture
 * and injection at key session lifecycle events.
 */

export * from './types.js';
export {
  SessionStartHook,
  createSessionStartHook,
  executeSessionStartHook,
} from './session-start.js';
export {
  PostToolUseHook,
  createPostToolUseHook,
  executePostToolUseHook,
} from './post-tool-use.js';
export {
  SessionEndHook,
  createSessionEndHook,
  executeSessionEndHook,
} from './session-end.js';
export {
  MemoryHookManager,
  createMemoryHookManager,
} from './manager.js';
