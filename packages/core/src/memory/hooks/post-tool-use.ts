/**
 * Post Tool Use Hook
 *
 * Captures tool outcomes as observations after each tool use in Claude Code.
 * This enables automatic memory capture without manual intervention.
 */

import type { AgentType } from '../../types.js';
import type { Observation, ObservationType, ObservationContent } from '../types.js';
import type {
  ToolUseEvent,
  ToolUseCaptureResult,
  MemoryHookConfig,
  ClaudeCodeHookOutput,
} from './types.js';
import { DEFAULT_MEMORY_HOOK_CONFIG } from './types.js';
import { ObservationStore } from '../observation-store.js';

/**
 * Tool categories for classification
 */
const TOOL_CATEGORIES: Record<string, ObservationType> = {
  Read: 'tool_use',
  Write: 'file_change',
  Edit: 'file_change',
  Bash: 'tool_use',
  Glob: 'tool_use',
  Grep: 'tool_use',
  WebFetch: 'tool_use',
  WebSearch: 'tool_use',
  Task: 'checkpoint',
  AskUserQuestion: 'decision',
};

/**
 * Relevance scores by tool type
 */
const TOOL_RELEVANCE: Record<string, number> = {
  Write: 70,
  Edit: 70,
  Bash: 60,
  Task: 65,
  AskUserQuestion: 75,
  WebFetch: 50,
  WebSearch: 50,
  Read: 30,
  Glob: 25,
  Grep: 30,
};

/**
 * Post Tool Use Hook Handler
 *
 * Captures tool outcomes and stores them as observations.
 */
export class PostToolUseHook {
  private config: MemoryHookConfig;
  private agent: AgentType;
  private store: ObservationStore;
  private pendingErrors: Map<string, { error: string; timestamp: string }> = new Map();

  constructor(
    projectPath: string,
    agent: AgentType = 'claude-code',
    config: Partial<MemoryHookConfig> = {},
    sessionId?: string
  ) {
    this.agent = agent;
    this.config = { ...DEFAULT_MEMORY_HOOK_CONFIG, ...config };
    this.store = new ObservationStore(projectPath, sessionId);
  }

  /**
   * Execute the post tool use hook
   */
  async execute(event: ToolUseEvent): Promise<ToolUseCaptureResult> {
    if (!this.config.enabled || !this.config.autoCaptureToolUse) {
      return { captured: false, reason: 'Hook disabled' };
    }

    if (this.shouldExcludeTool(event.tool_name)) {
      return { captured: false, reason: `Tool ${event.tool_name} is excluded` };
    }

    const relevance = this.calculateRelevance(event);
    if (relevance < this.config.minRelevanceForCapture) {
      return { captured: false, reason: `Relevance ${relevance} below threshold` };
    }

    const observationType = this.getObservationType(event);
    const content = this.extractContent(event);

    if (event.is_error) {
      const errorId = this.generateErrorId(content.error || content.action);
      this.pendingErrors.set(errorId, {
        error: content.error || content.action,
        timestamp: new Date().toISOString(),
      });
    }

    const matchingSolution = event.is_error ? undefined : this.findMatchingSolution(content);
    if (matchingSolution) {
      content.solution = content.action;
      content.context = `Solution for: ${matchingSolution.error}`;
    }

    const observation = this.store.add(
      observationType,
      content,
      this.agent,
      matchingSolution ? 95 : relevance
    );

    return { captured: true, observation };
  }

  /**
   * Generate Claude Code hook output format
   */
  async generateHookOutput(event: ToolUseEvent): Promise<ClaudeCodeHookOutput> {
    const result = await this.execute(event);

    return {
      continue: true,
      message: result.captured
        ? `Observation captured: ${event.tool_name}`
        : undefined,
    };
  }

  /**
   * Record an error explicitly
   */
  recordError(error: string, context: string): Observation {
    const errorId = this.generateErrorId(error);
    this.pendingErrors.set(errorId, {
      error,
      timestamp: new Date().toISOString(),
    });

    return this.store.add(
      'error',
      {
        action: 'Error encountered',
        context,
        error,
        tags: ['error'],
      },
      this.agent,
      80
    );
  }

  /**
   * Record a solution explicitly
   */
  recordSolution(solution: string, context: string, relatedError?: string): Observation {
    let relevance = 70;
    let solutionContext = context;

    if (relatedError) {
      const errorId = this.generateErrorId(relatedError);
      if (this.pendingErrors.has(errorId)) {
        this.pendingErrors.delete(errorId);
        relevance = 95;
        solutionContext = `Solution for: ${relatedError}`;
      }
    }

    return this.store.add(
      'solution',
      {
        action: solution,
        context: solutionContext,
        solution,
        tags: ['solution'],
      },
      this.agent,
      relevance
    );
  }

  /**
   * Record a decision explicitly
   */
  recordDecision(decision: string, options: string[], context: string): Observation {
    return this.store.add(
      'decision',
      {
        action: decision,
        context: `Options: ${options.join(', ')}. Context: ${context}`,
        tags: ['decision', 'architecture'],
      },
      this.agent,
      75
    );
  }

  /**
   * Record file modifications
   */
  recordFileChange(files: string[], action: string, context: string): Observation {
    return this.store.add(
      'file_change',
      {
        action,
        context,
        files,
        tags: ['file-change'],
      },
      this.agent,
      files.length > 3 ? 75 : 60
    );
  }

  /**
   * Get pending errors that haven't been resolved
   */
  getPendingErrors(): Array<{ error: string; timestamp: string }> {
    return Array.from(this.pendingErrors.values());
  }

  /**
   * Clear old pending errors (older than 30 minutes)
   */
  clearOldPendingErrors(): number {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    let cleared = 0;

    for (const [id, { timestamp }] of this.pendingErrors) {
      if (new Date(timestamp).getTime() < thirtyMinutesAgo) {
        this.pendingErrors.delete(id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get observation store
   */
  getStore(): ObservationStore {
    return this.store;
  }

  /**
   * Get observation count
   */
  getObservationCount(): number {
    return this.store.count();
  }

  private shouldExcludeTool(toolName: string): boolean {
    return this.config.excludeTools?.includes(toolName) ?? false;
  }

  private calculateRelevance(event: ToolUseEvent): number {
    let relevance = TOOL_RELEVANCE[event.tool_name] || 50;

    if (event.is_error) {
      relevance = Math.max(relevance, 80);
    }

    if (event.duration_ms && event.duration_ms > 10000) {
      relevance = Math.min(relevance + 10, 100);
    }

    const result = event.tool_result || '';
    if (result.includes('error') || result.includes('Error') || result.includes('failed')) {
      relevance = Math.max(relevance, 75);
    }

    if (result.includes('success') || result.includes('created') || result.includes('updated')) {
      relevance = Math.min(relevance + 5, 100);
    }

    return relevance;
  }

  private getObservationType(event: ToolUseEvent): ObservationType {
    if (event.is_error) {
      return 'error';
    }

    return TOOL_CATEGORIES[event.tool_name] || 'tool_use';
  }

  private extractContent(event: ToolUseEvent): ObservationContent {
    const content: ObservationContent = {
      action: `${event.tool_name}: ${this.summarizeInput(event.tool_input)}`,
      context: this.extractContext(event),
      tags: [event.tool_name.toLowerCase()],
    };

    if (event.is_error && event.tool_result) {
      content.error = event.tool_result.slice(0, 500);
    }

    if (event.tool_result && !event.is_error) {
      content.result = event.tool_result.slice(0, 200);
    }

    const files = this.extractFiles(event);
    if (files.length > 0) {
      content.files = files;
    }

    return content;
  }

  private summarizeInput(input: Record<string, unknown>): string {
    if (input.file_path) return String(input.file_path);
    if (input.pattern) return String(input.pattern);
    if (input.command) {
      const cmd = String(input.command);
      return cmd.length > 100 ? cmd.slice(0, 100) + '...' : cmd;
    }
    if (input.query) return String(input.query).slice(0, 100);

    const keys = Object.keys(input);
    if (keys.length === 0) return '(no input)';
    return keys.slice(0, 3).join(', ');
  }

  private extractContext(event: ToolUseEvent): string {
    const parts: string[] = [];

    if (event.duration_ms) {
      parts.push(`Duration: ${event.duration_ms}ms`);
    }

    if (event.is_error) {
      parts.push('Result: Error');
    } else if (event.tool_result) {
      const resultPreview = event.tool_result.slice(0, 100);
      parts.push(`Result: ${resultPreview}${event.tool_result.length > 100 ? '...' : ''}`);
    }

    return parts.join('. ') || 'No additional context';
  }

  private extractFiles(event: ToolUseEvent): string[] {
    const files: string[] = [];

    if (event.tool_input.file_path) {
      files.push(String(event.tool_input.file_path));
    }

    if (event.tool_input.path) {
      files.push(String(event.tool_input.path));
    }

    return files;
  }

  private generateErrorId(error: string): string {
    const normalized = error
      .toLowerCase()
      .replace(/[0-9]+/g, 'N')
      .replace(/['"`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

    return normalized;
  }

  private findMatchingSolution(content: ObservationContent): { error: string } | undefined {
    const actionLower = content.action.toLowerCase();
    const contextLower = content.context.toLowerCase();

    for (const [errorId, errorData] of this.pendingErrors) {
      const hasKeywordMatch =
        actionLower.includes('fix') ||
        actionLower.includes('resolve') ||
        actionLower.includes('solution') ||
        contextLower.includes('fix') ||
        contextLower.includes('resolve');

      if (hasKeywordMatch) {
        const errorWords = errorId.split(' ').filter((w) => w.length > 3);
        const textWords = new Set((actionLower + ' ' + contextLower).split(/\s+/));
        const matchCount = errorWords.filter((w) => textWords.has(w)).length;

        if (matchCount >= 2 || (matchCount >= 1 && hasKeywordMatch)) {
          this.pendingErrors.delete(errorId);
          return errorData;
        }
      }
    }

    return undefined;
  }
}

/**
 * Create a post tool use hook handler
 */
export function createPostToolUseHook(
  projectPath: string,
  agent: AgentType = 'claude-code',
  config: Partial<MemoryHookConfig> = {},
  sessionId?: string
): PostToolUseHook {
  return new PostToolUseHook(projectPath, agent, config, sessionId);
}

/**
 * Execute post tool use hook (standalone function for scripts)
 */
export async function executePostToolUseHook(
  projectPath: string,
  event: ToolUseEvent,
  config: Partial<MemoryHookConfig> = {},
  sessionId?: string
): Promise<ToolUseCaptureResult> {
  const hook = new PostToolUseHook(projectPath, 'claude-code', config, sessionId);
  return hook.execute(event);
}
