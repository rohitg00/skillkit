/**
 * Skill Trigger Engine
 *
 * Monitors events and triggers skill activation based on configured hooks.
 */

import { watch, type FSWatcher } from 'node:fs';
import { join, relative } from 'node:path';
import type { AgentType } from '../types.js';
import type {
  HookEvent,
  HookContext,
  HookTriggerResult,
  TriggerEngineOptions,
  HookEventListener,
} from './types.js';
import { HookManager } from './manager.js';

/**
 * Debounce helper
 */
function debounce<T extends (...args: string[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * SkillTriggerEngine - Monitors events and triggers skill activation
 */
export class SkillTriggerEngine {
  private hookManager: HookManager;
  private options: Required<TriggerEngineOptions>;
  private watchers: Map<string, FSWatcher> = new Map();
  private listeners: Set<HookEventListener> = new Set();
  private isRunning = false;
  private currentAgent: AgentType = 'universal';

  constructor(hookManager: HookManager, options: TriggerEngineOptions) {
    this.hookManager = hookManager;
    this.options = {
      projectPath: options.projectPath,
      watchFiles: options.watchFiles ?? false,
      debounceMs: options.debounceMs ?? 100,
    };
  }

  /**
   * Start the trigger engine
   */
  start(agent?: AgentType): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentAgent = agent || 'universal';

    if (this.options.watchFiles) {
      this.startFileWatcher();
    }

    // Trigger session:start
    this.triggerEvent('session:start', 'engine_start');
  }

  /**
   * Stop the trigger engine
   */
  stop(): void {
    if (!this.isRunning) return;

    // Trigger session:end
    this.triggerEvent('session:end', 'engine_stop');

    this.stopFileWatcher();
    this.isRunning = false;
  }

  /**
   * Set the current agent
   */
  setAgent(agent: AgentType): void {
    this.currentAgent = agent;
  }

  /**
   * Manually trigger an event
   */
  async triggerEvent(
    event: HookEvent,
    trigger: string,
    metadata?: Record<string, unknown>
  ): Promise<HookTriggerResult> {
    const context: HookContext = {
      event,
      trigger,
      projectPath: this.options.projectPath,
      agent: this.currentAgent,
      metadata,
      timestamp: new Date(),
    };

    const result = await this.hookManager.trigger(event, context);

    // Notify local listeners
    for (const listener of this.listeners) {
      try {
        await listener(event, context, result);
      } catch {
        // Ignore listener errors
      }
    }

    return result;
  }

  /**
   * Trigger file:open event
   */
  async triggerFileOpen(filePath: string): Promise<HookTriggerResult> {
    return this.triggerEvent('file:open', filePath, { filePath });
  }

  /**
   * Trigger file:save event
   */
  async triggerFileSave(filePath: string): Promise<HookTriggerResult> {
    return this.triggerEvent('file:save', filePath, { filePath });
  }

  /**
   * Trigger file:create event
   */
  async triggerFileCreate(filePath: string): Promise<HookTriggerResult> {
    return this.triggerEvent('file:create', filePath, { filePath });
  }

  /**
   * Trigger file:delete event
   */
  async triggerFileDelete(filePath: string): Promise<HookTriggerResult> {
    return this.triggerEvent('file:delete', filePath, { filePath });
  }

  /**
   * Trigger task:start event
   */
  async triggerTaskStart(taskName: string, taskId?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('task:start', taskName, { taskName, taskId });
  }

  /**
   * Trigger task:complete event
   */
  async triggerTaskComplete(
    taskName: string,
    taskId?: string,
    success?: boolean
  ): Promise<HookTriggerResult> {
    return this.triggerEvent('task:complete', taskName, { taskName, taskId, success });
  }

  /**
   * Trigger commit:pre event
   */
  async triggerPreCommit(message?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('commit:pre', 'git_commit', { message });
  }

  /**
   * Trigger commit:post event
   */
  async triggerPostCommit(commitHash?: string, message?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('commit:post', 'git_commit', { commitHash, message });
  }

  /**
   * Trigger error:occur event
   */
  async triggerError(error: Error | string, context?: string): Promise<HookTriggerResult> {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    return this.triggerEvent('error:occur', errorMessage, { error: errorMessage, stack: errorStack, context });
  }

  /**
   * Trigger test:fail event
   */
  async triggerTestFail(testName: string, error?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('test:fail', testName, { testName, error });
  }

  /**
   * Trigger test:pass event
   */
  async triggerTestPass(testName: string): Promise<HookTriggerResult> {
    return this.triggerEvent('test:pass', testName, { testName });
  }

  /**
   * Trigger build:start event
   */
  async triggerBuildStart(command?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('build:start', 'build', { command });
  }

  /**
   * Trigger build:fail event
   */
  async triggerBuildFail(error?: string): Promise<HookTriggerResult> {
    return this.triggerEvent('build:fail', 'build', { error });
  }

  /**
   * Trigger build:success event
   */
  async triggerBuildSuccess(): Promise<HookTriggerResult> {
    return this.triggerEvent('build:success', 'build', {});
  }

  /**
   * Add event listener
   */
  addListener(listener: HookEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: HookEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Check if engine is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Start file watcher
   */
  private startFileWatcher(): void {
    try {
      const watcher = watch(
        this.options.projectPath,
        { recursive: true },
        debounce((eventType: string, filename: string | null) => {
          if (!filename) return;

          const relativePath = relative(this.options.projectPath, join(this.options.projectPath, filename));

          // Skip node_modules, .git, etc.
          if (this.shouldIgnore(relativePath)) return;

          if (eventType === 'rename') {
            // Could be create or delete
            this.triggerFileCreate(relativePath);
          } else if (eventType === 'change') {
            this.triggerFileSave(relativePath);
          }
        }, this.options.debounceMs)
      );

      this.watchers.set('main', watcher);
    } catch {
      // File watching not available
    }
  }

  /**
   * Stop file watcher
   */
  private stopFileWatcher(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }

  /**
   * Check if a path should be ignored
   */
  private shouldIgnore(filePath: string): boolean {
    const ignorePaths = [
      'node_modules',
      '.git',
      '.skillkit',
      'dist',
      'build',
      'coverage',
      '.next',
      '.nuxt',
    ];

    return ignorePaths.some((ignore) => filePath.includes(ignore));
  }
}

/**
 * Create a SkillTriggerEngine instance
 */
export function createTriggerEngine(
  hookManager: HookManager,
  options: TriggerEngineOptions
): SkillTriggerEngine {
  return new SkillTriggerEngine(hookManager, options);
}
