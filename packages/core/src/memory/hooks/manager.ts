/**
 * Memory Hook Manager
 *
 * Unified manager for all memory lifecycle hooks.
 * Provides a single interface for session memory management.
 */

import type { AgentType } from '../../types.js';
import type { Learning, Observation } from '../types.js';
import type {
  MemoryHookConfig,
  MemoryHookStats,
  SessionStartContext,
  SessionEndContext,
  ToolUseEvent,
  ClaudeCodeHookOutput,
} from './types.js';
import { DEFAULT_MEMORY_HOOK_CONFIG } from './types.js';
import { SessionStartHook } from './session-start.js';
import { PostToolUseHook } from './post-tool-use.js';
import { SessionEndHook } from './session-end.js';
import { randomUUID } from 'node:crypto';

/**
 * Memory Hook Manager
 *
 * Coordinates all memory hooks for a session.
 */
export class MemoryHookManager {
  private config: MemoryHookConfig;
  private projectPath: string;
  private agent: AgentType;
  private sessionId: string;
  private startedAt: string;

  private sessionStartHook: SessionStartHook;
  private postToolUseHook: PostToolUseHook;
  private sessionEndHook: SessionEndHook;

  private stats: MemoryHookStats;

  constructor(
    projectPath: string,
    agent: AgentType = 'claude-code',
    config: Partial<MemoryHookConfig> = {},
    sessionId?: string
  ) {
    this.projectPath = projectPath;
    this.agent = agent;
    this.config = { ...DEFAULT_MEMORY_HOOK_CONFIG, ...config };
    this.sessionId = sessionId || randomUUID();
    this.startedAt = new Date().toISOString();

    this.sessionStartHook = new SessionStartHook(projectPath, agent, this.config);
    this.postToolUseHook = new PostToolUseHook(projectPath, agent, this.config, this.sessionId);
    this.sessionEndHook = new SessionEndHook(projectPath, agent, this.config);

    this.stats = {
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      observationsCaptured: 0,
      learningsInjected: 0,
      tokensUsed: 0,
      toolCallsCaptured: 0,
      errorsRecorded: 0,
      solutionsRecorded: 0,
    };
  }

  /**
   * Handle session start
   */
  async onSessionStart(workingDirectory?: string): Promise<ClaudeCodeHookOutput> {
    const context: SessionStartContext = {
      session_id: this.sessionId,
      project_path: this.projectPath,
      agent: this.agent,
      timestamp: new Date().toISOString(),
      working_directory: workingDirectory,
    };

    const result = await this.sessionStartHook.execute(context);

    this.stats.learningsInjected = result.learnings.length;
    this.stats.tokensUsed = result.tokenCount;

    return this.sessionStartHook.generateHookOutput(context);
  }

  /**
   * Handle tool use
   */
  async onToolUse(event: ToolUseEvent): Promise<ClaudeCodeHookOutput> {
    const result = await this.postToolUseHook.execute(event);

    if (result.captured) {
      this.stats.observationsCaptured++;
      this.stats.toolCallsCaptured++;

      if (result.observation?.type === 'error') {
        this.stats.errorsRecorded++;
      } else if (result.observation?.type === 'solution') {
        this.stats.solutionsRecorded++;
      }
    }

    await this.checkAutoCompression();

    return this.postToolUseHook.generateHookOutput(event);
  }

  /**
   * Handle session end
   */
  async onSessionEnd(toolCallsCount?: number): Promise<ClaudeCodeHookOutput> {
    const context: SessionEndContext = {
      session_id: this.sessionId,
      project_path: this.projectPath,
      agent: this.agent,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - new Date(this.startedAt).getTime(),
      tool_calls_count: toolCallsCount,
    };

    return this.sessionEndHook.generateHookOutput(context);
  }

  /**
   * Record an error manually
   */
  recordError(error: string, context: string): Observation {
    const obs = this.postToolUseHook.recordError(error, context);
    this.stats.observationsCaptured++;
    this.stats.errorsRecorded++;
    return obs;
  }

  /**
   * Record a solution manually
   */
  recordSolution(solution: string, context: string, relatedError?: string): Observation {
    const obs = this.postToolUseHook.recordSolution(solution, context, relatedError);
    this.stats.observationsCaptured++;
    this.stats.solutionsRecorded++;
    return obs;
  }

  /**
   * Record a decision manually
   */
  recordDecision(decision: string, options: string[], context: string): Observation {
    const obs = this.postToolUseHook.recordDecision(decision, options, context);
    this.stats.observationsCaptured++;
    return obs;
  }

  /**
   * Record file changes manually
   */
  recordFileChange(files: string[], action: string, context: string): Observation {
    const obs = this.postToolUseHook.recordFileChange(files, action, context);
    this.stats.observationsCaptured++;
    return obs;
  }

  /**
   * Force compression (regardless of threshold)
   */
  async forceCompress(): Promise<Learning[]> {
    const result = await this.sessionEndHook.forceCompress(this.sessionId);
    return result.learnings;
  }

  /**
   * Preview compression without executing
   */
  async previewCompression(): Promise<{
    wouldCompress: boolean;
    observationCount: number;
    estimatedLearnings: number;
    observationTypes: Record<string, number>;
  }> {
    return this.sessionEndHook.preview(this.sessionId);
  }

  /**
   * Get current stats
   */
  getStats(): MemoryHookStats {
    return { ...this.stats };
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get observation count
   */
  getObservationCount(): number {
    return this.postToolUseHook.getObservationCount();
  }

  /**
   * Get pending errors
   */
  getPendingErrors(): Array<{ error: string; timestamp: string }> {
    return this.postToolUseHook.getPendingErrors();
  }

  /**
   * Get configuration
   */
  getConfig(): MemoryHookConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<MemoryHookConfig>): void {
    this.config = { ...this.config, ...config };
    this.sessionStartHook.setConfig(this.config);
    this.sessionEndHook.setConfig(this.config);
  }

  /**
   * Check if auto-compression should trigger
   */
  private async checkAutoCompression(): Promise<void> {
    if (!this.config.enabled) return;

    const count = this.postToolUseHook.getObservationCount();
    if (count >= this.config.compressionThreshold) {
      await this.sessionEndHook.forceCompress(this.sessionId);
    }
  }

  /**
   * Generate Claude Code hooks.json configuration
   */
  generateClaudeCodeHooksConfig(): Record<string, unknown> {
    return {
      hooks: [
        {
          matcher: '.*',
          hooks: [
            {
              type: 'command',
              command: `npx skillkit memory hook session-start --project "${this.projectPath}"`,
              event: 'SessionStart',
            },
            {
              type: 'command',
              command: `npx skillkit memory hook post-tool-use --project "${this.projectPath}"`,
              event: 'PostToolUse',
            },
            {
              type: 'command',
              command: `npx skillkit memory hook session-end --project "${this.projectPath}"`,
              event: 'SessionEnd',
            },
          ],
        },
      ],
    };
  }
}

/**
 * Create a memory hook manager
 */
export function createMemoryHookManager(
  projectPath: string,
  agent: AgentType = 'claude-code',
  config: Partial<MemoryHookConfig> = {},
  sessionId?: string
): MemoryHookManager {
  return new MemoryHookManager(projectPath, agent, config, sessionId);
}
