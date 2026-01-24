/**
 * Hooks & Automatic Triggering System Types
 *
 * Provides event-driven skill activation across all supported agents.
 */

import type { AgentType } from '../types.js';

/**
 * Hook events that can trigger skill activation
 */
export type HookEvent =
  | 'session:start'
  | 'session:resume'
  | 'session:end'
  | 'file:open'
  | 'file:save'
  | 'file:create'
  | 'file:delete'
  | 'task:start'
  | 'task:complete'
  | 'commit:pre'
  | 'commit:post'
  | 'error:occur'
  | 'test:fail'
  | 'test:pass'
  | 'build:start'
  | 'build:fail'
  | 'build:success';

/**
 * How to inject the skill when triggered
 */
export type InjectionMode = 'content' | 'reference' | 'prompt';

/**
 * Skill hook configuration
 */
export interface SkillHook {
  /** Unique identifier for this hook */
  id: string;
  /** Event that triggers this hook */
  event: HookEvent;
  /** Pattern to match (e.g., "*.test.ts", "src/**\/*.tsx") */
  matcher?: string | RegExp;
  /** Skills to activate when triggered */
  skills: string[];
  /** How to inject the skill */
  inject: InjectionMode;
  /** Priority (higher = earlier execution) */
  priority?: number;
  /** Condition expression (optional) */
  condition?: string;
  /** Whether hook is enabled */
  enabled: boolean;
  /** Agent-specific overrides */
  agentOverrides?: Partial<Record<AgentType, Partial<SkillHook>>>;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Context provided when a hook is triggered
 */
export interface HookContext {
  /** The event that was triggered */
  event: HookEvent;
  /** What triggered the event (filename, command, etc.) */
  trigger: string;
  /** Project path */
  projectPath: string;
  /** Target agent */
  agent: AgentType;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Result of activating a skill via hook
 */
export interface ActivatedSkill {
  /** Skill ID */
  skillId: string;
  /** Hook that activated it */
  hookId: string;
  /** Injection mode used */
  injectionMode: InjectionMode;
  /** The skill content (if injection mode is 'content') */
  content?: string;
  /** The skill reference (if injection mode is 'reference') */
  reference?: string;
  /** Activation timestamp */
  activatedAt: Date;
}

/**
 * Hook trigger result
 */
export interface HookTriggerResult {
  /** Event that was triggered */
  event: HookEvent;
  /** Hooks that matched */
  matchedHooks: SkillHook[];
  /** Skills that were activated */
  activatedSkills: ActivatedSkill[];
  /** Any errors that occurred */
  errors: HookError[];
  /** Total execution time in ms */
  executionTimeMs: number;
}

/**
 * Hook error
 */
export interface HookError {
  hookId: string;
  skillId?: string;
  message: string;
  stack?: string;
}

/**
 * Hook configuration file format
 */
export interface HookConfig {
  version: number;
  hooks: SkillHook[];
  defaults?: {
    inject?: InjectionMode;
    priority?: number;
    enabled?: boolean;
  };
}

/**
 * Agent-specific hook format generator
 */
export interface AgentHookFormat {
  /** Agent type */
  agent: AgentType;
  /** Generate hook configuration for this agent */
  generate(hooks: SkillHook[]): string | Record<string, unknown>;
  /** Parse agent-specific hook format */
  parse(content: string | Record<string, unknown>): SkillHook[];
  /** File path for hook configuration */
  configPath: string;
}

/**
 * Hook manager options
 */
export interface HookManagerOptions {
  /** Project path */
  projectPath: string;
  /** Path to hooks configuration file */
  configPath?: string;
  /** Whether to auto-load hooks on init */
  autoLoad?: boolean;
  /** Default injection mode */
  defaultInjectionMode?: InjectionMode;
}

/**
 * Trigger engine options
 */
export interface TriggerEngineOptions {
  /** Project path */
  projectPath: string;
  /** Whether to enable file watching */
  watchFiles?: boolean;
  /** Debounce time for file events (ms) */
  debounceMs?: number;
}

/**
 * Hook event listener
 */
export type HookEventListener = (
  event: HookEvent,
  context: HookContext,
  result: HookTriggerResult
) => void | Promise<void>;

/**
 * Matcher function type
 */
export type MatcherFunction = (trigger: string, context: HookContext) => boolean;
