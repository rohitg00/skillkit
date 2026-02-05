/**
 * Memory Hooks Types
 *
 * Types for Claude Code lifecycle hooks that integrate with SkillKit memory.
 */

import type { AgentType } from '../../types.js';
import type { Learning, Observation } from '../types.js';

/**
 * Claude Code hook event types
 */
export type ClaudeCodeHookEvent =
  | 'SessionStart'
  | 'SessionResume'
  | 'SessionEnd'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'PreCompact'
  | 'Notification'
  | 'Stop';

/**
 * Tool use event for PostToolUse hook
 */
export interface ToolUseEvent {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_result?: string;
  is_error?: boolean;
  duration_ms?: number;
}

/**
 * Session start event context
 */
export interface SessionStartContext {
  session_id: string;
  project_path: string;
  agent: AgentType;
  timestamp: string;
  working_directory?: string;
}

/**
 * Session end event context
 */
export interface SessionEndContext {
  session_id: string;
  project_path: string;
  agent: AgentType;
  timestamp: string;
  duration_ms?: number;
  tool_calls_count?: number;
}

/**
 * Memory hook configuration
 */
export interface MemoryHookConfig {
  enabled: boolean;
  autoInjectOnSessionStart: boolean;
  autoCaptureToolUse: boolean;
  autoCompressOnSessionEnd: boolean;
  minRelevanceForCapture: number;
  maxTokensForInjection: number;
  compressionThreshold: number;
  capturePatterns?: string[];
  excludeTools?: string[];
}

/**
 * Default memory hook configuration
 */
export const DEFAULT_MEMORY_HOOK_CONFIG: MemoryHookConfig = {
  enabled: true,
  autoInjectOnSessionStart: true,
  autoCaptureToolUse: true,
  autoCompressOnSessionEnd: true,
  minRelevanceForCapture: 30,
  maxTokensForInjection: 2000,
  compressionThreshold: 50,
  capturePatterns: ['*'],
  excludeTools: ['Read', 'Glob', 'Grep'],
};

/**
 * Session start hook result
 */
export interface SessionStartResult {
  injected: boolean;
  learnings: Learning[];
  tokenCount: number;
  formattedContent: string;
}

/**
 * Tool use capture result
 */
export interface ToolUseCaptureResult {
  captured: boolean;
  observation?: Observation;
  reason?: string;
}

/**
 * Session end hook result
 */
export interface SessionEndResult {
  compressed: boolean;
  observationCount: number;
  learningCount: number;
  learnings: Learning[];
}

/**
 * Hook script output format for Claude Code
 */
export interface ClaudeCodeHookOutput {
  continue: boolean;
  message?: string;
  inject?: string;
  suppress?: boolean;
}

/**
 * Memory hook statistics
 */
export interface MemoryHookStats {
  sessionId: string;
  startedAt: string;
  observationsCaptured: number;
  learningsInjected: number;
  tokensUsed: number;
  toolCallsCaptured: number;
  errorsRecorded: number;
  solutionsRecorded: number;
}
