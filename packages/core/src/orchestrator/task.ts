/**
 * Task Manager
 *
 * Manages tasks within a team with status tracking and assignment.
 */

import { randomUUID } from 'node:crypto';
import type {
  Task,
  OrchestratorTaskStatus,
  TaskFiles,
  TaskPlan,
  TaskResult,
  TaskFilter,
  TaskEvent,
  TaskEventListener,
} from './types.js';

/**
 * TaskManager - Manages team tasks
 */
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private listeners: Set<TaskEventListener> = new Set();

  /**
   * Create a new task
   */
  createTask(
    name: string,
    description: string,
    spec: string,
    options?: {
      files?: TaskFiles;
      priority?: number;
      dependencies?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Task {
    const now = new Date();
    const task: Task = {
      id: randomUUID(),
      name,
      description,
      spec,
      files: options?.files || {},
      status: 'pending',
      priority: options?.priority ?? 0,
      dependencies: options?.dependencies || [],
      createdAt: now,
      updatedAt: now,
      metadata: options?.metadata,
    };

    this.tasks.set(task.id, task);
    this.emit('task:created', task);
    return task;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * List tasks with optional filter
   */
  listTasks(filter?: TaskFilter): Task[] {
    let tasks = this.getAllTasks();

    if (filter) {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        tasks = tasks.filter((t) => statuses.includes(t.status));
      }

      if (filter.assignee) {
        tasks = tasks.filter((t) => t.assignee === filter.assignee);
      }

      if (filter.minPriority !== undefined) {
        tasks = tasks.filter((t) => (t.priority || 0) >= filter.minPriority!);
      }

      if (!filter.includeCompleted) {
        tasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'failed');
      }
    }

    // Sort by priority (descending) then by creation time
    return tasks.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Assign a task to an agent
   */
  assignTask(taskId: string, agentId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const unfinished = task.dependencies.filter((depId) => {
        const dep = this.tasks.get(depId);
        return dep && dep.status !== 'completed';
      });

      if (unfinished.length > 0) {
        throw new Error(`Task has unfinished dependencies: ${unfinished.join(', ')}`);
      }
    }

    task.assignee = agentId;
    task.status = 'assigned';
    task.updatedAt = new Date();

    this.emit('task:assigned', task);
    return task;
  }

  /**
   * Unassign a task
   */
  unassignTask(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.assignee = undefined;
    task.status = 'pending';
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Submit a plan for a task
   */
  submitPlan(taskId: string, plan: Omit<TaskPlan, 'submittedAt'>): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.plan = {
      ...plan,
      submittedAt: new Date(),
    };
    task.status = 'plan_pending';
    task.updatedAt = new Date();

    this.emit('task:plan_submitted', task);
    return task;
  }

  /**
   * Approve a task plan
   */
  approvePlan(taskId: string, approverId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task || !task.plan) return undefined;

    task.plan.approvedAt = new Date();
    task.plan.approvedBy = approverId;
    task.status = 'approved';
    task.updatedAt = new Date();

    this.emit('task:plan_approved', task);
    return task;
  }

  /**
   * Reject a task plan
   */
  rejectPlan(taskId: string, reason: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task || !task.plan) return undefined;

    task.plan.rejectionReason = reason;
    task.status = 'planning';
    task.updatedAt = new Date();

    this.emit('task:plan_rejected', task);
    return task;
  }

  /**
   * Start a task (mark as in progress)
   */
  startTask(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = 'in_progress';
    task.updatedAt = new Date();

    this.emit('task:started', task);
    return task;
  }

  /**
   * Mark task as under review
   */
  markForReview(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = 'review';
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, result: TaskResult): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.result = result;
    task.status = result.success ? 'completed' : 'failed';
    task.updatedAt = new Date();

    this.emit(result.success ? 'task:completed' : 'task:failed', task);
    return task;
  }

  /**
   * Fail a task
   */
  failTask(taskId: string, errors: string[]): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.result = {
      success: false,
      output: 'Task failed',
      errors,
      completedAt: new Date(),
    };
    task.status = 'failed';
    task.updatedAt = new Date();

    this.emit('task:failed', task);
    return task;
  }

  /**
   * Update task status
   */
  updateStatus(taskId: string, status: OrchestratorTaskStatus): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = status;
    task.updatedAt = new Date();

    return task;
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: OrchestratorTaskStatus): Task[] {
    return this.getAllTasks().filter((t) => t.status === status);
  }

  /**
   * Get tasks for an agent
   */
  getTasksForAgent(agentId: string): Task[] {
    return this.getAllTasks().filter((t) => t.assignee === agentId);
  }

  /**
   * Get pending tasks (unassigned)
   */
  getPendingTasks(): Task[] {
    return this.getTasksByStatus('pending').sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get next available task for assignment
   */
  getNextTask(): Task | undefined {
    const pending = this.getPendingTasks();

    // Find first task with no unfinished dependencies
    for (const task of pending) {
      if (!task.dependencies || task.dependencies.length === 0) {
        return task;
      }

      const allDepsComplete = task.dependencies.every((depId) => {
        const dep = this.tasks.get(depId);
        return dep && dep.status === 'completed';
      });

      if (allDepsComplete) {
        return task;
      }
    }

    return undefined;
  }

  /**
   * Check if all tasks are complete
   */
  allTasksComplete(): boolean {
    const tasks = this.getAllTasks();
    return tasks.length > 0 && tasks.every((t) => t.status === 'completed' || t.status === 'failed');
  }

  /**
   * Get completion stats
   */
  getStats(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
    const tasks = this.getAllTasks();
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length,
      inProgress: tasks.filter((t) =>
        ['planning', 'plan_pending', 'approved', 'in_progress', 'review'].includes(t.status)
      ).length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };
  }

  /**
   * Add event listener
   */
  addListener(listener: TaskEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: TaskEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit task event
   */
  private emit(event: TaskEvent, task: Task): void {
    for (const listener of this.listeners) {
      try {
        listener(event, task);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Export tasks to JSON
   */
  toJSON(): Task[] {
    return this.getAllTasks();
  }

  /**
   * Import tasks from JSON
   */
  fromJSON(tasks: Task[]): void {
    this.clear();
    for (const task of tasks) {
      this.tasks.set(task.id, task);
    }
  }
}

/**
 * Create a TaskManager instance
 */
export function createTaskManager(): TaskManager {
  return new TaskManager();
}
