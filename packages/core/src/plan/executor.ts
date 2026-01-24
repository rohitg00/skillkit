/**
 * Plan Executor
 *
 * Executes structured plans with progress tracking and event handling.
 */

import type {
  StructuredPlan,
  PlanTask,
  TaskStep,
  PlanTaskResult,
  PlanExecutionOptions,
  PlanExecutionResult,
  PlanEvent,
  PlanEventListener,
} from './types.js';

/**
 * Step executor function type
 */
export type StepExecutor = (
  step: TaskStep,
  task: PlanTask,
  plan: StructuredPlan
) => Promise<{ success: boolean; output: string; error?: string }>;

/**
 * PlanExecutor - Execute structured plans
 */
export class PlanExecutor {
  private listeners: Set<PlanEventListener> = new Set();
  private stepExecutor?: StepExecutor;
  private abortController?: AbortController;
  private isPaused = false;
  private resumePromise?: Promise<void>;
  private resumeResolve?: () => void;

  constructor(options?: { stepExecutor?: StepExecutor }) {
    this.stepExecutor = options?.stepExecutor;
  }

  /**
   * Set the step executor
   */
  setStepExecutor(executor: StepExecutor): void {
    this.stepExecutor = executor;
  }

  /**
   * Execute a plan
   */
  async execute(plan: StructuredPlan, options?: PlanExecutionOptions): Promise<PlanExecutionResult> {
    const startTime = Date.now();
    let aborted = false;
    const result: PlanExecutionResult = {
      success: true,
      completedTasks: [],
      failedTasks: [],
      skippedTasks: [],
      durationMs: 0,
      taskResults: new Map(),
    };

    // Initialize abort controller
    this.abortController = new AbortController();
    this.isPaused = false;

    // Update plan status
    plan.status = 'executing';
    this.emit('plan:execution_started', plan);

    try {
      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(plan);

      // Get execution order
      const executionOrder = this.getExecutionOrder(plan, dependencyGraph);

      // Execute tasks
      for (const taskId of executionOrder) {
        // Check if aborted
        if (this.abortController.signal.aborted) {
          aborted = true;
          result.success = false;
          result.errors = [...(result.errors ?? []), 'Execution cancelled'];
          break;
        }

        // Wait if paused
        await this.waitIfPaused();

        const task = plan.tasks.find((t) => t.id === taskId);
        if (!task) continue;

        // Check if dependencies completed
        const depsCompleted = this.checkDependencies(task, result);
        if (!depsCompleted) {
          task.status = 'skipped';
          result.skippedTasks.push(taskId);
          continue;
        }

        // Execute task
        const taskResult = await this.executeTask(task, plan, options);
        result.taskResults.set(taskId, taskResult);

        if (taskResult.success) {
          task.status = 'completed';
          task.result = taskResult;
          result.completedTasks.push(taskId);
          this.emit('plan:task_completed', plan, task, taskResult);
        } else {
          task.status = 'failed';
          task.result = taskResult;
          result.failedTasks.push(taskId);
          result.success = false;
          this.emit('plan:task_failed', plan, task, taskResult);

          if (options?.stopOnError) {
            // Mark remaining tasks as skipped
            for (const remainingId of executionOrder.slice(executionOrder.indexOf(taskId) + 1)) {
              const remainingTask = plan.tasks.find((t) => t.id === remainingId);
              if (remainingTask) {
                remainingTask.status = 'skipped';
                result.skippedTasks.push(remainingId);
              }
            }
            break;
          }
        }
      }

      // Update plan status
      plan.status = aborted ? 'cancelled' : result.success ? 'completed' : 'failed';
      plan.updatedAt = new Date();

      result.durationMs = Date.now() - startTime;

      // Emit appropriate event
      if (aborted) {
        this.emit('plan:execution_cancelled', plan);
      } else if (result.success) {
        this.emit('plan:execution_completed', plan);
      } else {
        this.emit('plan:execution_failed', plan);
      }

      return result;
    } catch (error) {
      plan.status = 'failed';
      result.success = false;
      result.durationMs = Date.now() - startTime;
      result.errors = [(error as Error).message];

      this.emit('plan:execution_failed', plan);
      return result;
    } finally {
      // Reset executor state
      this.abortController = undefined;
      this.isPaused = false;
      this.resumePromise = undefined;
      this.resumeResolve = undefined;
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: PlanTask,
    plan: StructuredPlan,
    options?: PlanExecutionOptions
  ): Promise<PlanTaskResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const filesCreated: string[] = [];
    const filesModified: string[] = [];

    task.status = 'in_progress';
    this.emit('plan:task_started', plan, task);

    // Report progress
    options?.onProgress?.(task.id, 0, 'starting');

    // Execute steps
    for (let i = 0; i < task.steps.length; i++) {
      const step = task.steps[i];

      // Check if aborted
      if (this.abortController?.signal.aborted) {
        errors.push('Execution aborted');
        break;
      }

      // Wait if paused
      await this.waitIfPaused();

      // Report progress
      options?.onProgress?.(task.id, step.number, `executing step ${step.number}`);

      // Execute step
      if (options?.dryRun) {
        // Dry run - just log
        console.log(`[DRY RUN] Task ${task.id}, Step ${step.number}: ${step.description}`);
        if (step.command) {
          console.log(`  Command: ${step.command}`);
        }
        if (step.code) {
          console.log(`  Code: ${step.code.substring(0, 100)}...`);
        }
      } else if (this.stepExecutor) {
        try {
          const stepResult = await this.executeWithTimeout(
            this.stepExecutor(step, task, plan),
            options?.taskTimeout || 60000
          );

          if (!stepResult.success) {
            errors.push(`Step ${step.number}: ${stepResult.error || 'Failed'}`);

            if (step.critical) {
              break;
            }
          }
        } catch (error) {
          errors.push(`Step ${step.number}: ${(error as Error).message}`);

          if (step.critical) {
            break;
          }
        }
      } else {
        // No step executor configured - fail fast
        errors.push('No step executor configured');
        break;
      }
    }

    // Collect file changes
    if (task.files.create) filesCreated.push(...task.files.create);
    if (task.files.modify) filesModified.push(...task.files.modify);

    const result: PlanTaskResult = {
      success: errors.length === 0,
      output: errors.length === 0 ? `Task ${task.id} completed successfully` : `Task ${task.id} failed`,
      filesCreated: filesCreated.length > 0 ? filesCreated : undefined,
      filesModified: filesModified.length > 0 ? filesModified : undefined,
      errors: errors.length > 0 ? errors : undefined,
      durationMs: Date.now() - startTime,
      completedAt: new Date(),
    };

    // Callback
    options?.onTaskComplete?.(task, result);

    return result;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
    ]);
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(plan: StructuredPlan): Map<number, number[]> {
    const graph = new Map<number, number[]>();

    for (const task of plan.tasks) {
      graph.set(task.id, task.dependencies || []);
    }

    return graph;
  }

  /**
   * Get execution order using topological sort
   */
  private getExecutionOrder(plan: StructuredPlan, graph: Map<number, number[]>): number[] {
    const order: number[] = [];
    const visited = new Set<number>();
    const temp = new Set<number>();

    const visit = (id: number): void => {
      if (temp.has(id)) {
        throw new Error(`Circular dependency detected at task ${id}`);
      }
      if (visited.has(id)) return;

      temp.add(id);

      const deps = graph.get(id) || [];
      for (const dep of deps) {
        visit(dep);
      }

      temp.delete(id);
      visited.add(id);
      order.push(id);
    };

    for (const task of plan.tasks) {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    }

    return order;
  }

  /**
   * Check if dependencies are completed
   */
  private checkDependencies(task: PlanTask, result: PlanExecutionResult): boolean {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every((depId) => result.completedTasks.includes(depId));
  }

  /**
   * Pause execution
   */
  pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.resumePromise = new Promise((resolve) => {
        this.resumeResolve = resolve;
      });
      this.emit('plan:paused', {} as StructuredPlan);
    }
  }

  /**
   * Resume execution
   */
  resume(): void {
    if (this.isPaused && this.resumeResolve) {
      this.isPaused = false;
      this.resumeResolve();
      this.resumeResolve = undefined;
      this.resumePromise = undefined;
      this.emit('plan:resumed', {} as StructuredPlan);
    }
  }

  /**
   * Cancel execution
   */
  cancel(): void {
    this.abortController?.abort();
  }

  /**
   * Wait if paused
   */
  private async waitIfPaused(): Promise<void> {
    if (this.isPaused && this.resumePromise) {
      await this.resumePromise;
    }
  }

  /**
   * Add event listener
   */
  addListener(listener: PlanEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: PlanEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit event
   */
  private emit(event: PlanEvent, plan: StructuredPlan, task?: PlanTask, result?: PlanTaskResult): void {
    for (const listener of this.listeners) {
      try {
        listener(event, plan, task, result);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Check if currently executing
   */
  isExecuting(): boolean {
    return this.abortController !== undefined && !this.abortController.signal.aborted;
  }

  /**
   * Check if paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }
}

/**
 * Create a PlanExecutor instance
 */
export function createPlanExecutor(options?: { stepExecutor?: StepExecutor }): PlanExecutor {
  return new PlanExecutor(options);
}

/**
 * Default step executor (dry run)
 */
export const dryRunExecutor: StepExecutor = async (step, task, _plan) => {
  console.log(`[DRY RUN] Task ${task.id}, Step ${step.number}: ${step.description}`);
  return { success: true, output: 'Dry run completed' };
};

/**
 * Shell step executor (runs commands)
 */
export const shellExecutor: StepExecutor = async (step, _task, _plan) => {
  if (!step.command) {
    return { success: true, output: 'No command to execute' };
  }

  try {
    const { execSync } = await import('node:child_process');
    const output = execSync(step.command, { encoding: 'utf-8', timeout: 60000 });

    // Check expected output if provided
    if (step.expectedOutput && !output.includes(step.expectedOutput)) {
      return {
        success: false,
        output,
        error: `Expected output "${step.expectedOutput}" not found`,
      };
    }

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: (error as Error).message,
    };
  }
};
