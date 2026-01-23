/**
 * Skill Execution Engine
 *
 * Executes skills with task-based orchestration, verification, and state management.
 */

import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type {
  ExecutableSkill,
  ExecutableTask,
  ExecutionOptions,
  TaskExecutionResult,
  SkillExecutionResult,
  CheckpointHandler,
  CheckpointResponse,
  ExecutionTaskStatus,
} from './types.js';
import { SessionManager } from '../session/manager.js';
import type { SessionTask } from '../session/types.js';

/**
 * Progress event for execution
 */
export interface ExecutionProgressEvent {
  type: 'task_start' | 'task_complete' | 'checkpoint' | 'verification' | 'complete';
  taskId?: string;
  taskName?: string;
  taskIndex?: number;
  totalTasks?: number;
  status?: ExecutionTaskStatus | 'paused' | 'cancelled';
  message?: string;
  error?: string;
}

/**
 * Progress callback type
 */
export type ExecutionProgressCallback = (event: ExecutionProgressEvent) => void;

/**
 * Skill Execution Engine
 */
export class SkillExecutionEngine {
  private projectPath: string;
  private sessionManager: SessionManager;
  private checkpointHandler?: CheckpointHandler;
  private onProgress?: ExecutionProgressCallback;

  constructor(
    projectPath: string,
    options?: {
      checkpointHandler?: CheckpointHandler;
      onProgress?: ExecutionProgressCallback;
    }
  ) {
    this.projectPath = projectPath;
    this.sessionManager = new SessionManager(projectPath);
    this.checkpointHandler = options?.checkpointHandler;
    this.onProgress = options?.onProgress;
  }

  /**
   * Execute a skill
   */
  async execute(
    skill: ExecutableSkill,
    options: ExecutionOptions = {}
  ): Promise<SkillExecutionResult> {
    const startTime = new Date();
    const tasks = skill.tasks || [];

    // Handle dry run
    if (options.dryRun) {
      return this.createDryRunResult(skill);
    }

    // Check if there's an existing paused execution for this skill
    const existingState = this.sessionManager.get();
    if (existingState?.currentExecution?.skillName === skill.name) {
      if (existingState.currentExecution.status === 'paused') {
        // Resume from paused state
        return this.resumeExecution(skill, options);
      }
    }

    // Start new execution
    const sessionTasks: Omit<SessionTask, 'status'>[] = tasks.map((task, index) => ({
      id: task.id || `task-${index}`,
      name: task.name,
      type: task.type === 'auto' ? 'auto' : task.type,
    }));

    this.sessionManager.startExecution(skill.name, skill.source, sessionTasks);

    const taskResults: TaskExecutionResult[] = [];
    let overallStatus: 'completed' | 'failed' | 'cancelled' | 'paused' = 'completed';
    let overallError: string | undefined;

    // Execute tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      this.onProgress?.({
        type: 'task_start',
        taskId: task.id,
        taskName: task.name,
        taskIndex: i,
        totalTasks: tasks.length,
      });

      // Handle checkpoints
      if (task.type !== 'auto') {
        const checkpointResult = await this.handleCheckpoint(task, {
          skillName: skill.name,
          taskIndex: i,
          totalTasks: tasks.length,
        });

        if (!checkpointResult.continue) {
          overallStatus = 'paused';
          this.sessionManager.pause();
          break;
        }

        // For decision checkpoints, record the decision
        if (task.type === 'checkpoint:decision' && checkpointResult.selectedOption) {
          this.sessionManager.recordDecision(
            `${skill.name}:${task.id}`,
            checkpointResult.selectedOption,
            skill.name
          );
        }
      }

      // Execute the task
      const taskResult = await this.executeTask(task, skill, options);
      taskResults.push(taskResult);

      this.sessionManager.updateTask(task.id || `task-${i}`, {
        status: taskResult.status === 'completed' ? 'completed' : 'failed',
        output: taskResult.output,
        error: taskResult.error,
        filesModified: taskResult.filesModified,
        commitSha: taskResult.commitSha,
      });

      this.onProgress?.({
        type: 'task_complete',
        taskId: task.id,
        taskName: task.name,
        taskIndex: i,
        totalTasks: tasks.length,
        status: taskResult.status,
        error: taskResult.error,
      });

      // Handle task failure
      if (taskResult.status === 'failed') {
        if (!options.continueOnError) {
          overallStatus = 'failed';
          overallError = taskResult.error;
          break;
        }
      }

      // Run verification if enabled
      if (options.verify && task.verify) {
        const verificationPassed = await this.runVerification(task, taskResult);
        if (!verificationPassed && !options.continueOnError) {
          overallStatus = 'failed';
          overallError = 'Verification failed';
          break;
        }
      }
    }

    const endTime = new Date();

    // Complete the execution
    if (overallStatus !== 'paused') {
      this.sessionManager.completeExecution(overallStatus, overallError);
    }

    const result: SkillExecutionResult = {
      skillName: skill.name,
      skillSource: skill.source,
      status: overallStatus,
      startedAt: startTime.toISOString(),
      completedAt: endTime.toISOString(),
      durationMs: endTime.getTime() - startTime.getTime(),
      tasks: taskResults,
      filesModified: Array.from(new Set(taskResults.flatMap((t) => t.filesModified || []))),
      commits: taskResults.map((t) => t.commitSha).filter((sha): sha is string => !!sha),
      error: overallError,
    };

    const statusMessages: Record<'completed' | 'failed' | 'cancelled' | 'paused', string> = {
      completed: 'Skill execution completed',
      paused: 'Skill execution paused',
      failed: overallError || 'Skill execution failed',
      cancelled: 'Skill execution cancelled',
    };

    this.onProgress?.({
      type: 'complete',
      status: overallStatus,
      message: statusMessages[overallStatus],
    });

    return result;
  }

  /**
   * Resume a paused execution
   */
  private async resumeExecution(
    skill: ExecutableSkill,
    options: ExecutionOptions
  ): Promise<SkillExecutionResult> {
    const state = this.sessionManager.get();
    if (!state?.currentExecution) {
      throw new Error('No execution to resume');
    }

    this.sessionManager.resume();
    const execution = state.currentExecution;
    const tasks = skill.tasks || [];

    const taskResults: TaskExecutionResult[] = [];
    let overallStatus: 'completed' | 'failed' | 'cancelled' | 'paused' = 'completed';
    let overallError: string | undefined;

    // Find where to resume from
    const startIndex = execution.currentStep;

    for (let i = startIndex; i < tasks.length; i++) {
      const task = tasks[i];

      this.onProgress?.({
        type: 'task_start',
        taskId: task.id,
        taskName: task.name,
        taskIndex: i,
        totalTasks: tasks.length,
      });

      // Handle checkpoints (same as in execute)
      if (task.type !== 'auto') {
        const checkpointResult = await this.handleCheckpoint(task, {
          skillName: skill.name,
          taskIndex: i,
          totalTasks: tasks.length,
        });

        if (!checkpointResult.continue) {
          overallStatus = 'paused';
          this.sessionManager.pause();
          break;
        }

        // For decision checkpoints, record the decision
        if (task.type === 'checkpoint:decision' && checkpointResult.selectedOption) {
          this.sessionManager.recordDecision(
            `${skill.name}:${task.id}`,
            checkpointResult.selectedOption,
            skill.name
          );
        }
      }

      const taskResult = await this.executeTask(task, skill, options);
      taskResults.push(taskResult);

      this.sessionManager.updateTask(task.id || `task-${i}`, {
        status: taskResult.status === 'completed' ? 'completed' : 'failed',
        output: taskResult.output,
        error: taskResult.error,
        filesModified: taskResult.filesModified,
        commitSha: taskResult.commitSha,
      });

      // Emit task_complete progress event (matching execute behavior)
      this.onProgress?.({
        type: 'task_complete',
        taskId: task.id,
        taskName: task.name,
        taskIndex: i,
        totalTasks: tasks.length,
        status: taskResult.status,
        error: taskResult.error,
      });

      // Handle task failure
      if (taskResult.status === 'failed') {
        if (!options.continueOnError) {
          overallStatus = 'failed';
          overallError = taskResult.error;
          break;
        }
      }

      // Run verification if enabled (matching execute behavior)
      if (options.verify && task.verify) {
        const verificationPassed = await this.runVerification(task, taskResult);
        if (!verificationPassed && !options.continueOnError) {
          overallStatus = 'failed';
          overallError = 'Verification failed';
          break;
        }
      }
    }

    // Only complete execution if not paused
    if (overallStatus !== 'paused') {
      this.sessionManager.completeExecution(overallStatus, overallError);
    }

    return {
      skillName: skill.name,
      skillSource: skill.source,
      status: overallStatus,
      startedAt: execution.startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(execution.startedAt).getTime(),
      tasks: taskResults,
      filesModified: Array.from(new Set(taskResults.flatMap((t) => t.filesModified || []))),
      commits: taskResults.map((t) => t.commitSha).filter((sha): sha is string => !!sha),
      error: overallError,
    };
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: ExecutableTask,
    _skill: ExecutableSkill,
    _options: ExecutionOptions
  ): Promise<TaskExecutionResult> {
    const startTime = new Date();
    const taskId = task.id || randomUUID();

    try {
      // For now, we simulate task execution
      // In a real implementation, this would integrate with the AI agent
      // to execute the task action based on the skill content

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 100));

      const endTime = new Date();

      return {
        taskId,
        taskName: task.name,
        status: 'completed',
        startedAt: startTime.toISOString(),
        completedAt: endTime.toISOString(),
        durationMs: endTime.getTime() - startTime.getTime(),
        output: `Task "${task.name}" completed successfully`,
        filesModified: task.files,
      };
    } catch (error) {
      const endTime = new Date();

      return {
        taskId,
        taskName: task.name,
        status: 'failed',
        startedAt: startTime.toISOString(),
        completedAt: endTime.toISOString(),
        durationMs: endTime.getTime() - startTime.getTime(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle a checkpoint
   */
  private async handleCheckpoint(
    task: ExecutableTask,
    context: { skillName: string; taskIndex: number; totalTasks: number }
  ): Promise<CheckpointResponse> {
    this.onProgress?.({
      type: 'checkpoint',
      taskId: task.id,
      taskName: task.name,
      taskIndex: context.taskIndex,
      totalTasks: context.totalTasks,
      message: `Checkpoint: ${task.type}`,
    });

    if (this.checkpointHandler) {
      return this.checkpointHandler(task, context);
    }

    // Default: auto-continue for non-decision checkpoints
    if (task.type === 'checkpoint:decision') {
      // Use first option if no handler
      return {
        continue: true,
        selectedOption: task.options?.[0],
      };
    }

    return { continue: true };
  }

  /**
   * Check if a regex pattern is potentially dangerous (ReDoS-vulnerable)
   * Rejects patterns with nested quantifiers and other known problematic constructs
   */
  private isUnsafeRegexPattern(pattern: string): boolean {
    // Detect nested quantifiers like (a+)+, (a*)+, (a+)*, (a*)*
    // These are the primary cause of catastrophic backtracking
    const nestedQuantifierPattern = /\([^)]*[+*][^)]*\)[+*?]/;
    if (nestedQuantifierPattern.test(pattern)) {
      return true;
    }

    // Detect overlapping alternations with quantifiers like (a|a)+
    const overlappingAlternation = /\([^|)]*\|[^|)]*\)[+*]/;
    if (overlappingAlternation.test(pattern)) {
      return true;
    }

    // Detect excessive quantifiers (more than 3 quantifiers in a row-ish)
    const quantifierCount = (pattern.match(/[+*?]|\{\d+/g) || []).length;
    if (quantifierCount > 10) {
      return true;
    }

    // Detect very long character classes which can be slow
    const longCharClass = /\[[^\]]{50,}\]/;
    if (longCharClass.test(pattern)) {
      return true;
    }

    return false;
  }

  /**
   * Safely test a regex pattern with ReDoS prevention
   *
   * This method validates patterns before execution to prevent catastrophic backtracking.
   * Note: This cannot guarantee protection against all ReDoS patterns, but catches common ones.
   */
  private safeRegexTest(pattern: string, input: string, _timeoutMs = 1000): boolean {
    // Strict length limits to prevent excessive processing
    if (pattern.length > 200 || input.length > 50000) {
      console.warn(`Regex test skipped: pattern or input too long`);
      return false;
    }

    // Reject patterns known to cause ReDoS
    if (this.isUnsafeRegexPattern(pattern)) {
      console.warn(`Regex pattern rejected as potentially unsafe: ${pattern.slice(0, 50)}...`);
      return false;
    }

    try {
      const regex = new RegExp(pattern);
      return regex.test(input);
    } catch {
      // Invalid regex pattern
      return false;
    }
  }

  /**
   * Run verification for a task
   *
   * SECURITY NOTE: Verification commands are executed from skill configuration.
   * Only run skills from trusted sources. Commands run with the same privileges
   * as the skillkit process.
   */
  private async runVerification(
    task: ExecutableTask,
    result: TaskExecutionResult
  ): Promise<boolean> {
    if (!task.verify) {
      return true;
    }

    const verificationResults = {
      automated: [] as { rule: string; passed: boolean; output?: string }[],
      human: [] as { description: string; passed: boolean }[],
    };

    // Run automated verification
    if (task.verify.automated) {
      for (const rule of task.verify.automated) {
        if (rule.command) {
          try {
            // SECURITY: Commands are from skill config - only run trusted skills
            const output = execSync(rule.command, {
              cwd: this.projectPath,
              encoding: 'utf-8',
              timeout: 30000,
            });

            let passed = true;
            if (rule.expect) {
              if (rule.expect === 'success') {
                passed = true;
              } else if (rule.expect.startsWith('contains:')) {
                const expected = rule.expect.slice(9);
                passed = output.includes(expected);
              } else if (rule.expect.startsWith('matches:')) {
                const pattern = rule.expect.slice(8);
                // Use safe regex test to prevent ReDoS
                passed = this.safeRegexTest(pattern, output);
              }
            }

            verificationResults.automated.push({
              rule: rule.command,
              passed,
              output,
            });

            this.onProgress?.({
              type: 'verification',
              taskId: task.id,
              taskName: task.name,
              message: `Verification ${passed ? 'passed' : 'failed'}: ${rule.command}`,
            });

            if (!passed) {
              return false;
            }
          } catch (error) {
            verificationResults.automated.push({
              rule: rule.command,
              passed: false,
              output: error instanceof Error ? error.message : String(error),
            });
            return false;
          }
        }
      }
    }

    // Human verification would be handled by checkpoint handler
    result.verificationResults = verificationResults;
    return true;
  }

  /**
   * Create a dry run result
   */
  private createDryRunResult(skill: ExecutableSkill): SkillExecutionResult {
    const tasks = skill.tasks || [];

    return {
      skillName: skill.name,
      skillSource: skill.source,
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 0,
      tasks: tasks.map((task) => ({
        taskId: task.id || randomUUID(),
        taskName: task.name,
        status: 'skipped' as ExecutionTaskStatus,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 0,
        output: '[Dry run - not executed]',
      })),
      filesModified: [],
      commits: [],
    };
  }

  /**
   * Pause current execution
   */
  pause(): boolean {
    return this.sessionManager.pause();
  }

  /**
   * Check if execution is paused
   */
  isPaused(): boolean {
    return this.sessionManager.isPaused();
  }

  /**
   * Get session manager
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}

/**
 * Create a new skill execution engine
 */
export function createExecutionEngine(
  projectPath: string,
  options?: {
    checkpointHandler?: CheckpointHandler;
    onProgress?: ExecutionProgressCallback;
  }
): SkillExecutionEngine {
  return new SkillExecutionEngine(projectPath, options);
}
