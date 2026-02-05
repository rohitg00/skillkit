/**
 * Session Start Hook
 *
 * Injects relevant memories when a Claude Code session starts.
 * This hook runs at the beginning of each session to provide context
 * from previous sessions.
 */

import type { AgentType } from '../../types.js';
import type {
  SessionStartContext,
  SessionStartResult,
  MemoryHookConfig,
  ClaudeCodeHookOutput,
} from './types.js';
import { DEFAULT_MEMORY_HOOK_CONFIG } from './types.js';
import { MemoryInjector } from '../injector.js';
import { getMemoryStatus } from '../initializer.js';

/**
 * Session Start Hook Handler
 *
 * Retrieves and formats relevant memories for injection at session start.
 */
export class SessionStartHook {
  private config: MemoryHookConfig;
  private projectPath: string;
  private agent: AgentType;

  constructor(
    projectPath: string,
    agent: AgentType = 'claude-code',
    config: Partial<MemoryHookConfig> = {}
  ) {
    this.projectPath = projectPath;
    this.agent = agent;
    this.config = { ...DEFAULT_MEMORY_HOOK_CONFIG, ...config };
  }

  /**
   * Execute the session start hook
   */
  async execute(context: SessionStartContext): Promise<SessionStartResult> {
    if (!this.config.enabled || !this.config.autoInjectOnSessionStart) {
      return {
        injected: false,
        learnings: [],
        tokenCount: 0,
        formattedContent: '',
      };
    }

    const status = getMemoryStatus(this.projectPath);
    if (!status.projectMemoryExists && !status.globalMemoryExists) {
      return {
        injected: false,
        learnings: [],
        tokenCount: 0,
        formattedContent: '',
      };
    }

    const injector = new MemoryInjector(
      this.projectPath,
      context.project_path?.split('/').pop()
    );

    const result = await injector.injectForAgent(this.agent, {
      maxTokens: this.config.maxTokensForInjection,
      minRelevance: 30,
      maxLearnings: 10,
      includeGlobal: true,
      disclosureLevel: 'preview',
    });

    const learnings = result.memories.map((m) => m.learning);

    return {
      injected: result.memories.length > 0,
      learnings,
      tokenCount: result.totalTokens,
      formattedContent: result.formattedContent,
    };
  }

  /**
   * Generate Claude Code hook output format
   */
  async generateHookOutput(context: SessionStartContext): Promise<ClaudeCodeHookOutput> {
    const result = await this.execute(context);

    if (!result.injected || result.learnings.length === 0) {
      return { continue: true };
    }

    return {
      continue: true,
      inject: this.formatInjection(result),
    };
  }

  /**
   * Format learnings for injection into Claude Code context
   */
  private formatInjection(result: SessionStartResult): string {
    if (result.learnings.length === 0) {
      return '';
    }

    const lines: string[] = [
      '<skillkit-memories>',
      `<!-- ${result.learnings.length} relevant learnings from previous sessions (${result.tokenCount} tokens) -->`,
      '',
    ];

    for (const learning of result.learnings) {
      lines.push(`## ${learning.title}`);
      lines.push(`Tags: ${learning.tags.join(', ')}`);
      if (learning.frameworks && learning.frameworks.length > 0) {
        lines.push(`Frameworks: ${learning.frameworks.join(', ')}`);
      }
      lines.push('');
      const preview = learning.content.slice(0, 200);
      lines.push(preview + (learning.content.length > 200 ? '...' : ''));
      lines.push('');
    }

    lines.push('</skillkit-memories>');

    return lines.join('\n');
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
  }
}

/**
 * Create a session start hook handler
 */
export function createSessionStartHook(
  projectPath: string,
  agent: AgentType = 'claude-code',
  config: Partial<MemoryHookConfig> = {}
): SessionStartHook {
  return new SessionStartHook(projectPath, agent, config);
}

/**
 * Execute session start hook (standalone function for scripts)
 */
export async function executeSessionStartHook(
  projectPath: string,
  context: SessionStartContext,
  config: Partial<MemoryHookConfig> = {}
): Promise<SessionStartResult> {
  const hook = new SessionStartHook(projectPath, context.agent || 'claude-code', config);
  return hook.execute(context);
}
