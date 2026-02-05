/**
 * Memory-Enabled Execution Engine Integration
 *
 * Provides utilities to integrate MemoryObserver with SkillExecutionEngine.
 */

import type { AgentType } from '../types.js';
import {
  SkillExecutionEngine,
  createExecutionEngine,
  type ExecutionProgressCallback,
  type ExecutionProgressEvent,
} from '../executor/engine.js';
import type { CheckpointHandler, ExecutionOptions, ExecutableSkill } from '../executor/types.js';
import { MemoryObserver, type MemoryObserverConfig } from './observer.js';

/**
 * Options for creating a memory-enabled execution engine
 */
export interface MemoryEnabledEngineOptions {
  /** Checkpoint handler for interactive checkpoints */
  checkpointHandler?: CheckpointHandler;
  /** Additional progress callback (called alongside memory observer) */
  onProgress?: ExecutionProgressCallback;
  /** Memory observer configuration */
  memoryConfig?: MemoryObserverConfig;
  /** Session ID for the memory observer */
  sessionId?: string;
  /** Default agent type */
  defaultAgent?: AgentType;
}

/**
 * Memory-enabled execution engine wrapper
 */
export class MemoryEnabledEngine {
  private engine: SkillExecutionEngine;
  private observer: MemoryObserver;
  private userProgressCallback?: ExecutionProgressCallback;

  constructor(projectPath: string, options: MemoryEnabledEngineOptions = {}) {
    this.observer = new MemoryObserver(projectPath, options.sessionId, options.memoryConfig);

    if (options.defaultAgent) {
      this.observer.setAgent(options.defaultAgent);
    }

    this.userProgressCallback = options.onProgress;

    const combinedProgressCallback: ExecutionProgressCallback = (event: ExecutionProgressEvent) => {
      const observerCallback = this.observer.createProgressCallback();
      observerCallback(event);

      if (this.userProgressCallback) {
        this.userProgressCallback(event);
      }
    };

    this.engine = createExecutionEngine(projectPath, {
      checkpointHandler: options.checkpointHandler,
      onProgress: combinedProgressCallback,
    });
  }

  /**
   * Execute a skill with memory observation
   */
  async execute(
    skill: ExecutableSkill,
    options: ExecutionOptions = {}
  ): ReturnType<SkillExecutionEngine['execute']> {
    this.observer.setSkillName(skill.name);

    if (options.agent) {
      this.observer.setAgent(options.agent);
    }

    this.observer.recordExecutionStart(skill.name, options.agent || 'claude-code');

    try {
      const result = await this.engine.execute(skill, options);

      if (result.filesModified.length > 0) {
        this.observer.recordFileModification(
          result.filesModified,
          `Files modified during skill "${skill.name}" execution`
        );
      }

      if (result.error) {
        this.observer.recordError(result.error, `Skill "${skill.name}" failed`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.observer.recordError(errorMessage, `Unexpected error during skill "${skill.name}" execution`);
      throw error;
    }
  }

  /**
   * Record a manual error observation
   */
  recordError(error: string, context: string, taskId?: string): void {
    this.observer.recordError(error, context, taskId);
  }

  /**
   * Record a manual solution observation
   */
  recordSolution(solution: string, context: string, relatedError?: string): void {
    this.observer.recordSolution(solution, context, relatedError);
  }

  /**
   * Record a file modification observation
   */
  recordFileModification(files: string[], context: string): void {
    this.observer.recordFileModification(files, context);
  }

  /**
   * Record a decision observation
   */
  recordDecision(decision: string, options: string[], context: string): void {
    this.observer.recordDecision(decision, options, context);
  }

  /**
   * Pause execution
   */
  pause(): boolean {
    const paused = this.engine.pause();
    if (paused) {
      this.observer.recordExecutionPause();
    }
    return paused;
  }

  /**
   * Check if execution is paused
   */
  isPaused(): boolean {
    return this.engine.isPaused();
  }

  /**
   * Get the memory observer
   */
  getObserver(): MemoryObserver {
    return this.observer;
  }

  /**
   * Get the underlying execution engine
   */
  getEngine(): SkillExecutionEngine {
    return this.engine;
  }

  /**
   * Get the session manager
   */
  getSessionManager(): ReturnType<SkillExecutionEngine['getSessionManager']> {
    return this.engine.getSessionManager();
  }

  /**
   * Get observation count
   */
  getObservationCount(): number {
    return this.observer.getObservationCount();
  }

  /**
   * Get all observations
   */
  getObservations(): ReturnType<MemoryObserver['getObservations']> {
    return this.observer.getObservations();
  }

  /**
   * Clear observations
   */
  clearObservations(): void {
    this.observer.clear();
  }
}

/**
 * Create a memory-enabled execution engine
 */
export function createMemoryEnabledEngine(
  projectPath: string,
  options?: MemoryEnabledEngineOptions
): MemoryEnabledEngine {
  return new MemoryEnabledEngine(projectPath, options);
}

/**
 * Wrap an existing progress callback with memory observation
 */
export function wrapProgressCallbackWithMemory(
  projectPath: string,
  existingCallback?: ExecutionProgressCallback,
  memoryConfig?: MemoryObserverConfig,
  sessionId?: string
): { callback: ExecutionProgressCallback; observer: MemoryObserver } {
  const observer = new MemoryObserver(projectPath, sessionId, memoryConfig);
  const observerCallback = observer.createProgressCallback();

  const wrappedCallback: ExecutionProgressCallback = (event: ExecutionProgressEvent) => {
    observerCallback(event);
    if (existingCallback) {
      existingCallback(event);
    }
  };

  return { callback: wrappedCallback, observer };
}
