/**
 * Plan Validator
 *
 * Validates structured plans for completeness, correctness, and best practices.
 */

import type { StructuredPlan, PlanTask, PlanValidationResult, ValidationIssue } from './types.js';

/**
 * Validation options
 */
export interface ValidatorOptions {
  /** Maximum task duration in minutes */
  maxTaskMinutes?: number;
  /** Minimum task duration in minutes */
  minTaskMinutes?: number;
  /** Require tests in each task */
  requireTests?: boolean;
  /** Require commits in each task */
  requireCommits?: boolean;
  /** Maximum steps per task */
  maxStepsPerTask?: number;
  /** Minimum steps per task */
  minStepsPerTask?: number;
  /** Require file specifications */
  requireFiles?: boolean;
  /** Strict mode (treat warnings as errors) */
  strict?: boolean;
}

const DEFAULT_OPTIONS: ValidatorOptions = {
  maxTaskMinutes: 10,
  minTaskMinutes: 1,
  requireTests: false,
  requireCommits: false,
  maxStepsPerTask: 15,
  minStepsPerTask: 1,
  requireFiles: false,
  strict: false,
};

/**
 * PlanValidator - Validate structured plans
 */
export class PlanValidator {
  private options: ValidatorOptions;

  constructor(options?: ValidatorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Validate a structured plan
   */
  validate(plan: StructuredPlan): PlanValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate plan-level fields
    this.validatePlanFields(plan, issues);

    // Validate tasks
    this.validateTasks(plan, issues);

    // Validate dependencies
    this.validateDependencies(plan, issues);

    // Calculate statistics
    const stats = this.calculateStats(plan);

    // Check if valid (no errors, or no errors/warnings in strict mode)
    const hasErrors = issues.some((i) => i.type === 'error');
    const hasWarnings = issues.some((i) => i.type === 'warning');
    const valid = !hasErrors && (!this.options.strict || !hasWarnings);

    return { valid, issues, stats };
  }

  /**
   * Validate plan-level fields
   */
  private validatePlanFields(plan: StructuredPlan, issues: ValidationIssue[]): void {
    // Name is required
    if (!plan.name || !plan.name.trim()) {
      issues.push({
        type: 'error',
        message: 'Plan must have a name',
        suggestion: 'Add a title to the plan using a # header',
      });
    }

    // Goal is required
    if (!plan.goal || !plan.goal.trim()) {
      issues.push({
        type: 'error',
        message: 'Plan must have a goal/objective',
        suggestion: 'Add a goal: field or Goal section to the plan',
      });
    }

    // Tasks are required
    if (!plan.tasks || plan.tasks.length === 0) {
      issues.push({
        type: 'error',
        message: 'Plan must have at least one task',
        suggestion: 'Add tasks using ## Task N: Task Name headers',
      });
    }

    // Architecture is recommended
    if (!plan.architecture) {
      issues.push({
        type: 'info',
        message: 'Plan has no architecture description',
        suggestion: 'Add an architecture section to describe the high-level design',
      });
    }

    // Tech stack is recommended
    if (!plan.techStack || plan.techStack.length === 0) {
      issues.push({
        type: 'info',
        message: 'Plan has no tech stack specified',
        suggestion: 'Add a tech stack section listing technologies used',
      });
    }
  }

  /**
   * Validate tasks
   */
  private validateTasks(plan: StructuredPlan, issues: ValidationIssue[]): void {
    const taskIds = new Set<number>();

    for (const task of plan.tasks) {
      // Check for duplicate task IDs
      if (taskIds.has(task.id)) {
        issues.push({
          type: 'error',
          message: `Duplicate task ID: ${task.id}`,
          taskId: task.id,
          suggestion: 'Ensure each task has a unique ID',
        });
      }
      taskIds.add(task.id);

      // Validate task fields
      this.validateTaskFields(task, issues);

      // Validate task steps
      this.validateTaskSteps(task, issues);

      // Check for tests
      if (this.options.requireTests) {
        const hasTestStep = task.steps.some((s) => s.type === 'test');
        const hasTestFiles = task.files.test && task.files.test.length > 0;

        if (!hasTestStep && !hasTestFiles) {
          issues.push({
            type: 'warning',
            message: `Task ${task.id} has no test step or test files`,
            taskId: task.id,
            suggestion: 'Add a test step or specify test files',
          });
        }
      }

      // Check for commits
      if (this.options.requireCommits) {
        const hasCommitStep = task.steps.some((s) => s.type === 'commit');

        if (!hasCommitStep) {
          issues.push({
            type: 'warning',
            message: `Task ${task.id} has no commit step`,
            taskId: task.id,
            suggestion: 'Add a commit step at the end of the task',
          });
        }
      }
    }
  }

  /**
   * Validate task fields
   */
  private validateTaskFields(task: PlanTask, issues: ValidationIssue[]): void {
    // Name is required
    if (!task.name || !task.name.trim()) {
      issues.push({
        type: 'error',
        message: `Task ${task.id} has no name`,
        taskId: task.id,
        suggestion: 'Add a descriptive name to the task',
      });
    }

    // Steps are required
    if (!task.steps || task.steps.length === 0) {
      issues.push({
        type: 'error',
        message: `Task ${task.id} has no steps`,
        taskId: task.id,
        suggestion: 'Add numbered steps to describe how to complete the task',
      });
    }

    // Check step count
    if (task.steps && task.steps.length > this.options.maxStepsPerTask!) {
      issues.push({
        type: 'warning',
        message: `Task ${task.id} has too many steps (${task.steps.length} > ${this.options.maxStepsPerTask})`,
        taskId: task.id,
        suggestion: 'Consider breaking this task into smaller tasks',
      });
    }

    if (task.steps && task.steps.length < this.options.minStepsPerTask!) {
      issues.push({
        type: 'warning',
        message: `Task ${task.id} has too few steps (${task.steps.length} < ${this.options.minStepsPerTask})`,
        taskId: task.id,
        suggestion: 'Add more detail to the task steps',
      });
    }

    // Check estimated time
    if (task.estimatedMinutes) {
      if (task.estimatedMinutes > this.options.maxTaskMinutes!) {
        issues.push({
          type: 'warning',
          message: `Task ${task.id} estimated time (${task.estimatedMinutes} min) exceeds maximum (${this.options.maxTaskMinutes} min)`,
          taskId: task.id,
          suggestion: 'Consider breaking this task into smaller tasks',
        });
      }

      if (task.estimatedMinutes < this.options.minTaskMinutes!) {
        issues.push({
          type: 'info',
          message: `Task ${task.id} estimated time (${task.estimatedMinutes} min) is below minimum (${this.options.minTaskMinutes} min)`,
          taskId: task.id,
          suggestion: 'Consider combining with related tasks',
        });
      }
    }

    // Check files
    if (this.options.requireFiles) {
      const hasFiles =
        (task.files.create && task.files.create.length > 0) ||
        (task.files.modify && task.files.modify.length > 0) ||
        (task.files.test && task.files.test.length > 0);

      if (!hasFiles) {
        issues.push({
          type: 'warning',
          message: `Task ${task.id} has no files specified`,
          taskId: task.id,
          suggestion: 'Specify which files will be created or modified',
        });
      }
    }
  }

  /**
   * Validate task steps
   */
  private validateTaskSteps(task: PlanTask, issues: ValidationIssue[]): void {
    const stepNumbers = new Set<number>();

    for (const step of task.steps) {
      // Check for duplicate step numbers
      if (stepNumbers.has(step.number)) {
        issues.push({
          type: 'warning',
          message: `Task ${task.id} has duplicate step number: ${step.number}`,
          taskId: task.id,
          stepNumber: step.number,
          suggestion: 'Ensure each step has a unique number',
        });
      }
      stepNumbers.add(step.number);

      // Description is required
      if (!step.description || !step.description.trim()) {
        issues.push({
          type: 'error',
          message: `Task ${task.id}, step ${step.number} has no description`,
          taskId: task.id,
          stepNumber: step.number,
          suggestion: 'Add a description to the step',
        });
      }

      // Verify steps should have expected output or command
      if (step.type === 'verify' && !step.expectedOutput && !step.command) {
        issues.push({
          type: 'info',
          message: `Task ${task.id}, step ${step.number} is a verify step without expected output or command`,
          taskId: task.id,
          stepNumber: step.number,
          suggestion: 'Add expected output or command to verify',
        });
      }

      // Test steps should have code or command
      if (step.type === 'test' && !step.code && !step.command) {
        issues.push({
          type: 'info',
          message: `Task ${task.id}, step ${step.number} is a test step without code or command`,
          taskId: task.id,
          stepNumber: step.number,
          suggestion: 'Add test code or test command',
        });
      }
    }

    // Check step number sequence
    const sortedNumbers = Array.from(stepNumbers).sort((a, b) => a - b);
    for (let i = 0; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] !== i + 1) {
        issues.push({
          type: 'info',
          message: `Task ${task.id} has non-sequential step numbers`,
          taskId: task.id,
          suggestion: 'Use sequential step numbers starting from 1',
        });
        break;
      }
    }
  }

  /**
   * Validate dependencies
   */
  private validateDependencies(plan: StructuredPlan, issues: ValidationIssue[]): void {
    const taskIds = new Set(plan.tasks.map((t) => t.id));

    for (const task of plan.tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          // Check dependency exists
          if (!taskIds.has(depId)) {
            issues.push({
              type: 'error',
              message: `Task ${task.id} depends on non-existent task ${depId}`,
              taskId: task.id,
              suggestion: `Remove dependency on task ${depId} or add the missing task`,
            });
          }

          // Check for self-dependency
          if (depId === task.id) {
            issues.push({
              type: 'error',
              message: `Task ${task.id} depends on itself`,
              taskId: task.id,
              suggestion: 'Remove self-dependency',
            });
          }
        }
      }
    }

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies(plan);
    for (const cycle of circularDeps) {
      issues.push({
        type: 'error',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        suggestion: 'Remove one of the dependencies to break the cycle',
      });
    }
  }

  /**
   * Find circular dependencies
   */
  private findCircularDependencies(plan: StructuredPlan): number[][] {
    const cycles: number[][] = [];
    const taskMap = new Map(plan.tasks.map((t) => [t.id, t]));
    const visited = new Set<number>();
    const recursionStack = new Set<number>();
    const path: number[] = [];

    const dfs = (taskId: number): void => {
      if (recursionStack.has(taskId)) {
        // Found a cycle
        const cycleStart = path.indexOf(taskId);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), taskId]);
        }
        return;
      }

      if (visited.has(taskId)) return;

      visited.add(taskId);
      recursionStack.add(taskId);
      path.push(taskId);

      const task = taskMap.get(taskId);
      if (task?.dependencies) {
        for (const depId of task.dependencies) {
          dfs(depId);
        }
      }

      path.pop();
      recursionStack.delete(taskId);
    };

    for (const task of plan.tasks) {
      if (!visited.has(task.id)) {
        dfs(task.id);
      }
    }

    return cycles;
  }

  /**
   * Calculate plan statistics
   */
  private calculateStats(plan: StructuredPlan): PlanValidationResult['stats'] {
    const totalTasks = plan.tasks.length;
    const totalSteps = plan.tasks.reduce((sum, t) => sum + t.steps.length, 0);
    const estimatedMinutes = plan.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 3), 0);
    const tasksWithTests = plan.tasks.filter(
      (t) => t.steps.some((s) => s.type === 'test') || (t.files.test && t.files.test.length > 0)
    ).length;
    const tasksWithCommits = plan.tasks.filter((t) => t.steps.some((s) => s.type === 'commit')).length;
    const avgStepsPerTask = totalTasks > 0 ? Math.round((totalSteps / totalTasks) * 10) / 10 : 0;

    return {
      totalTasks,
      totalSteps,
      estimatedMinutes,
      tasksWithTests,
      tasksWithCommits,
      avgStepsPerTask,
    };
  }

  /**
   * Quick validation check (just returns valid/invalid)
   */
  isValid(plan: StructuredPlan): boolean {
    return this.validate(plan).valid;
  }

  /**
   * Get errors only
   */
  getErrors(plan: StructuredPlan): ValidationIssue[] {
    return this.validate(plan).issues.filter((i) => i.type === 'error');
  }

  /**
   * Get warnings only
   */
  getWarnings(plan: StructuredPlan): ValidationIssue[] {
    return this.validate(plan).issues.filter((i) => i.type === 'warning');
  }
}

/**
 * Create a PlanValidator instance
 */
export function createPlanValidator(options?: ValidatorOptions): PlanValidator {
  return new PlanValidator(options);
}

/**
 * Quick validation helper
 */
export function validatePlan(plan: StructuredPlan, options?: ValidatorOptions): PlanValidationResult {
  return createPlanValidator(options).validate(plan);
}
