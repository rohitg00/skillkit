/**
 * Session End Hook
 *
 * Compresses observations to learnings when a Claude Code session ends.
 * This enables automatic memory consolidation without manual intervention.
 */

import type { AgentType } from '../../types.js';
import type {
  SessionEndContext,
  SessionEndResult,
  MemoryHookConfig,
  ClaudeCodeHookOutput,
} from './types.js';
import { DEFAULT_MEMORY_HOOK_CONFIG } from './types.js';
import { ObservationStore } from '../observation-store.js';
import { MemoryCompressor } from '../compressor.js';

/**
 * Session End Hook Handler
 *
 * Compresses observations collected during the session into learnings.
 */
export class SessionEndHook {
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
   * Execute the session end hook
   */
  async execute(context: SessionEndContext): Promise<SessionEndResult> {
    if (!this.config.enabled || !this.config.autoCompressOnSessionEnd) {
      return {
        compressed: false,
        observationCount: 0,
        learningCount: 0,
        learnings: [],
      };
    }

    const store = new ObservationStore(this.projectPath, context.session_id);
    const observations = store.getAll();

    if (observations.length < 3) {
      return {
        compressed: false,
        observationCount: observations.length,
        learningCount: 0,
        learnings: [],
      };
    }

    const compressor = new MemoryCompressor(this.projectPath, {
      scope: 'project',
      projectName: context.project_path?.split('/').pop(),
    });

    const { learnings, result } = await compressor.compressAndStore(observations, {
      minObservations: 3,
      maxLearnings: 10,
      minImportance: 4,
      includeLowRelevance: false,
      additionalTags: ['session-end', this.agent],
    });

    if (result.processedObservationIds.length > 0) {
      store.deleteMany(result.processedObservationIds);
    }

    return {
      compressed: learnings.length > 0,
      observationCount: observations.length,
      learningCount: learnings.length,
      learnings,
    };
  }

  /**
   * Generate Claude Code hook output format
   */
  async generateHookOutput(context: SessionEndContext): Promise<ClaudeCodeHookOutput> {
    const result = await this.execute(context);

    let message: string | undefined;
    if (result.compressed) {
      message = `Session memory: ${result.observationCount} observations → ${result.learningCount} learnings`;
    }

    return {
      continue: true,
      message,
    };
  }

  /**
   * Force compression regardless of settings
   */
  async forceCompress(sessionId?: string): Promise<SessionEndResult> {
    const store = new ObservationStore(this.projectPath, sessionId);
    const observations = store.getAll();

    if (observations.length === 0) {
      return {
        compressed: false,
        observationCount: 0,
        learningCount: 0,
        learnings: [],
      };
    }

    const compressor = new MemoryCompressor(this.projectPath, {
      scope: 'project',
    });

    const { learnings, result } = await compressor.compressAndStore(observations, {
      minObservations: 1,
      maxLearnings: 20,
      minImportance: 3,
      includeLowRelevance: true,
    });

    if (result.processedObservationIds.length > 0) {
      store.deleteMany(result.processedObservationIds);
    }

    return {
      compressed: learnings.length > 0,
      observationCount: observations.length,
      learningCount: learnings.length,
      learnings,
    };
  }

  /**
   * Preview what would be compressed (dry-run)
   */
  async preview(sessionId?: string): Promise<{
    wouldCompress: boolean;
    observationCount: number;
    estimatedLearnings: number;
    observationTypes: Record<string, number>;
  }> {
    const store = new ObservationStore(this.projectPath, sessionId);
    const observations = store.getAll();

    const types: Record<string, number> = {};
    for (const obs of observations) {
      types[obs.type] = (types[obs.type] || 0) + 1;
    }

    const compressor = new MemoryCompressor(this.projectPath, {
      scope: 'project',
    });

    const result = await compressor.compress(observations, {
      minObservations: 3,
      maxLearnings: 10,
      minImportance: 4,
    });

    return {
      wouldCompress: result.learnings.length > 0,
      observationCount: observations.length,
      estimatedLearnings: result.learnings.length,
      observationTypes: types,
    };
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
 * Create a session end hook handler
 */
export function createSessionEndHook(
  projectPath: string,
  agent: AgentType = 'claude-code',
  config: Partial<MemoryHookConfig> = {}
): SessionEndHook {
  return new SessionEndHook(projectPath, agent, config);
}

/**
 * Execute session end hook (standalone function for scripts)
 */
export async function executeSessionEndHook(
  projectPath: string,
  context: SessionEndContext,
  config: Partial<MemoryHookConfig> = {}
): Promise<SessionEndResult> {
  const hook = new SessionEndHook(projectPath, context.agent || 'claude-code', config);
  return hook.execute(context);
}
