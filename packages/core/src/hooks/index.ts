/**
 * Hooks & Automatic Triggering System
 *
 * Provides event-driven skill activation across all supported agents.
 *
 * Key features:
 * - 17+ hook events (session, file, task, commit, error, test, build)
 * - Pattern matching with glob support
 * - Agent-specific hook generation
 * - File watching for automatic triggers
 * - Condition expressions for complex logic
 */

// Manager
export { HookManager, createHookManager } from './manager.js';

// Trigger Engine
export { SkillTriggerEngine, createTriggerEngine } from './triggers.js';

// Types
export type {
  HookEvent,
  InjectionMode,
  SkillHook,
  HookContext,
  ActivatedSkill,
  HookTriggerResult,
  HookError,
  HookConfig,
  AgentHookFormat,
  HookManagerOptions,
  TriggerEngineOptions,
  HookEventListener,
  MatcherFunction,
} from './types.js';
