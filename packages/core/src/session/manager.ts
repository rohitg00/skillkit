/**
 * Session Manager
 *
 * Manages session state for skill execution with pause/resume support.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type {
  SessionState,
  CurrentExecution,
  ExecutionHistory,
  SessionTask,
  TaskStatus,
} from './types.js';
import { SESSION_FILE } from './types.js';

/**
 * Session Manager for tracking skill execution state
 */
export class SessionManager {
  private projectPath: string;
  private sessionPath: string;
  private state: SessionState | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.sessionPath = join(projectPath, '.skillkit', SESSION_FILE);
  }

  /**
   * Get session file path
   */
  getSessionPath(): string {
    return this.sessionPath;
  }

  /**
   * Load session state from disk
   */
  load(): SessionState | null {
    if (!existsSync(this.sessionPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.sessionPath, 'utf-8');
      this.state = parse(content) as SessionState;
      return this.state;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Save session state to disk
   */
  save(): void {
    if (!this.state) {
      return;
    }

    const dir = join(this.projectPath, '.skillkit');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.state.lastActivity = new Date().toISOString();
    writeFileSync(this.sessionPath, stringify(this.state));
  }

  /**
   * Initialize a new session
   */
  init(): SessionState {
    this.state = {
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: this.projectPath,
      history: [],
      decisions: [],
    };
    this.save();
    return this.state;
  }

  /**
   * Get current session state (load if needed)
   */
  get(): SessionState | null {
    if (!this.state) {
      this.state = this.load();
    }
    return this.state;
  }

  /**
   * Get or create session
   */
  getOrCreate(): SessionState {
    const state = this.get();
    if (state) {
      return state;
    }
    return this.init();
  }

  /**
   * Start a new skill execution
   */
  startExecution(skillName: string, skillSource: string, tasks: Omit<SessionTask, 'status'>[]): CurrentExecution {
    const state = this.getOrCreate();

    const execution: CurrentExecution = {
      skillName,
      skillSource,
      currentStep: 0,
      totalSteps: tasks.length,
      status: 'running',
      startedAt: new Date().toISOString(),
      tasks: tasks.map((t) => ({
        ...t,
        status: 'pending' as TaskStatus,
      })),
    };

    state.currentExecution = execution;
    this.save();
    return execution;
  }

  /**
   * Update task status
   */
  updateTask(
    taskId: string,
    updates: Partial<Pick<SessionTask, 'status' | 'output' | 'error' | 'filesModified' | 'commitSha'>>
  ): void {
    const state = this.get();
    if (!state?.currentExecution) {
      return;
    }

    const task = state.currentExecution.tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    Object.assign(task, updates);

    if (updates.status === 'in_progress' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }

    if (updates.status === 'completed' || updates.status === 'failed') {
      task.completedAt = new Date().toISOString();
    }

    // Update current step
    const completedCount = state.currentExecution.tasks.filter(
      (t) => t.status === 'completed' || t.status === 'failed'
    ).length;
    state.currentExecution.currentStep = completedCount;

    this.save();
  }

  /**
   * Advance to next task
   */
  advanceToNextTask(): SessionTask | null {
    const state = this.get();
    if (!state?.currentExecution) {
      return null;
    }

    const nextTask = state.currentExecution.tasks.find((t) => t.status === 'pending');
    if (nextTask) {
      nextTask.status = 'in_progress';
      nextTask.startedAt = new Date().toISOString();
      this.save();
    }

    return nextTask || null;
  }

  /**
   * Pause current execution
   */
  pause(): boolean {
    const state = this.get();
    if (!state?.currentExecution || state.currentExecution.status !== 'running') {
      return false;
    }

    state.currentExecution.status = 'paused';
    state.currentExecution.pausedAt = new Date().toISOString();

    // Mark any in-progress tasks as paused
    for (const task of state.currentExecution.tasks) {
      if (task.status === 'in_progress') {
        task.status = 'paused';
      }
    }

    this.save();
    return true;
  }

  /**
   * Resume paused execution
   */
  resume(): boolean {
    const state = this.get();
    if (!state?.currentExecution || state.currentExecution.status !== 'paused') {
      return false;
    }

    state.currentExecution.status = 'running';
    delete state.currentExecution.pausedAt;

    // Resume paused tasks
    for (const task of state.currentExecution.tasks) {
      if (task.status === 'paused') {
        task.status = 'in_progress';
      }
    }

    this.save();
    return true;
  }

  /**
   * Complete current execution
   */
  completeExecution(status: 'completed' | 'failed' | 'cancelled', error?: string): void {
    const state = this.get();
    if (!state?.currentExecution) {
      return;
    }

    const execution = state.currentExecution;
    const startTime = new Date(execution.startedAt).getTime();
    const endTime = Date.now();

    const historyEntry: ExecutionHistory = {
      skillName: execution.skillName,
      skillSource: execution.skillSource,
      completedAt: new Date().toISOString(),
      durationMs: endTime - startTime,
      status,
      commits: execution.tasks
        .map((t) => t.commitSha)
        .filter((sha): sha is string => !!sha),
      filesModified: Array.from(
        new Set(execution.tasks.flatMap((t) => t.filesModified || []))
      ),
      error,
    };

    state.history.unshift(historyEntry);
    delete state.currentExecution;

    // Keep only last 50 history entries
    if (state.history.length > 50) {
      state.history = state.history.slice(0, 50);
    }

    this.save();
  }

  /**
   * Record a user decision
   */
  recordDecision(key: string, value: string, skillName?: string): void {
    const state = this.getOrCreate();

    // Update existing decision or add new one
    const existing = state.decisions.find((d) => d.key === key);
    if (existing) {
      existing.value = value;
      existing.madeAt = new Date().toISOString();
      existing.skillName = skillName;
    } else {
      state.decisions.push({
        key,
        value,
        madeAt: new Date().toISOString(),
        skillName,
      });
    }

    this.save();
  }

  /**
   * Get a decision value
   */
  getDecision(key: string): string | undefined {
    const state = this.get();
    return state?.decisions.find((d) => d.key === key)?.value;
  }

  /**
   * Get execution history
   */
  getHistory(limit?: number): ExecutionHistory[] {
    const state = this.get();
    if (!state) {
      return [];
    }
    return limit ? state.history.slice(0, limit) : state.history;
  }

  /**
   * Check if there's an active execution
   */
  hasActiveExecution(): boolean {
    const state = this.get();
    return !!state?.currentExecution;
  }

  /**
   * Check if execution is paused
   */
  isPaused(): boolean {
    const state = this.get();
    return state?.currentExecution?.status === 'paused';
  }

  /**
   * Clear session (delete file)
   */
  clear(): void {
    if (existsSync(this.sessionPath)) {
      unlinkSync(this.sessionPath);
    }
    this.state = null;
  }
}

/**
 * Create a new session manager
 */
export function createSessionManager(projectPath: string): SessionManager {
  return new SessionManager(projectPath);
}
