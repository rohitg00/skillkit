/**
 * Workflow Orchestrator
 *
 * Executes workflows with wave-based orchestration.
 */

import { randomUUID } from 'node:crypto';
import type {
  Workflow,
  WorkflowWave,
  WorkflowSkill,
  WorkflowExecution,
  WorkflowExecutionStatus,
} from './types.js';

/**
 * Skill executor function type
 */
export type SkillExecutor = (
  skillName: string,
  config?: Record<string, unknown>
) => Promise<{ success: boolean; error?: string }>;

/**
 * Progress callback for workflow execution
 */
export type WorkflowProgressCallback = (event: {
  type: 'wave_start' | 'wave_complete' | 'skill_start' | 'skill_complete' | 'workflow_complete';
  waveIndex?: number;
  waveName?: string;
  skillName?: string;
  status?: WorkflowExecutionStatus;
  error?: string;
}) => void;

/**
 * Workflow Orchestrator
 *
 * Manages the execution of workflows with parallel/sequential waves.
 */
export class WorkflowOrchestrator {
  private execution: WorkflowExecution | null = null;
  private executor: SkillExecutor;
  private onProgress?: WorkflowProgressCallback;

  constructor(executor: SkillExecutor, onProgress?: WorkflowProgressCallback) {
    this.executor = executor;
    this.onProgress = onProgress;
  }

  /**
   * Get current execution state
   */
  getExecution(): WorkflowExecution | null {
    return this.execution;
  }

  /**
   * Execute a workflow
   */
  async execute(workflow: Workflow): Promise<WorkflowExecution> {
    // Initialize execution state
    this.execution = {
      workflow,
      executionId: randomUUID(),
      status: 'running',
      currentWave: 0,
      waves: workflow.waves.map((wave, index) => ({
        waveIndex: index,
        waveName: wave.name,
        status: 'pending',
        skills: wave.skills.map((s) => ({
          skill: typeof s === 'string' ? s : s.skill,
          status: 'pending' as WorkflowExecutionStatus,
        })),
      })),
      startedAt: new Date().toISOString(),
    };

    try {
      // Execute each wave
      for (let i = 0; i < workflow.waves.length; i++) {
        if (this.execution.status === 'cancelled' || this.execution.status === 'paused') {
          break;
        }

        this.execution.currentWave = i;
        await this.executeWave(workflow.waves[i], i);

        // Check if wave failed and should stop
        const waveStatus = this.execution.waves[i];
        if (waveStatus.status === 'failed' && !workflow.waves[i].continueOnError) {
          this.execution.status = 'failed';
          this.execution.error = `Wave ${i + 1} failed`;
          break;
        }
      }

      // Mark as completed if not already failed/cancelled/paused
      if (this.execution.status === 'running') {
        this.execution.status = 'completed';
      }

      this.execution.completedAt = new Date().toISOString();

      this.onProgress?.({
        type: 'workflow_complete',
        status: this.execution.status,
        error: this.execution.error,
      });

      return this.execution;
    } catch (error) {
      this.execution.status = 'failed';
      this.execution.error = error instanceof Error ? error.message : String(error);
      this.execution.completedAt = new Date().toISOString();
      return this.execution;
    }
  }

  /**
   * Execute a single wave
   */
  private async executeWave(wave: WorkflowWave, waveIndex: number): Promise<void> {
    const waveStatus = this.execution!.waves[waveIndex];
    waveStatus.status = 'running';
    waveStatus.startedAt = new Date().toISOString();

    this.onProgress?.({
      type: 'wave_start',
      waveIndex,
      waveName: wave.name,
    });

    const skills = wave.skills.map((s) => ({
      name: typeof s === 'string' ? s : s.skill,
      config: typeof s === 'string' ? undefined : (s as WorkflowSkill).config,
    }));

    if (wave.parallel) {
      // Execute skills in parallel
      await Promise.all(
        skills.map((skill, skillIndex) =>
          this.executeSkill(skill.name, skill.config, waveIndex, skillIndex)
        )
      );
    } else {
      // Execute skills sequentially
      for (let i = 0; i < skills.length; i++) {
        if (this.execution!.status === 'cancelled' || this.execution!.status === 'paused') {
          break;
        }

        await this.executeSkill(skills[i].name, skills[i].config, waveIndex, i);

        // Stop on first failure in sequential mode
        const skillStatus = waveStatus.skills[i];
        if (skillStatus.status === 'failed' && !wave.continueOnError) {
          break;
        }
      }
    }

    // Determine wave status based on skill statuses
    const hasFailures = waveStatus.skills.some((s) => s.status === 'failed');
    const allCompleted = waveStatus.skills.every(
      (s) => s.status === 'completed' || s.status === 'failed'
    );

    if (allCompleted) {
      waveStatus.status = hasFailures ? 'failed' : 'completed';
    }

    waveStatus.completedAt = new Date().toISOString();

    this.onProgress?.({
      type: 'wave_complete',
      waveIndex,
      waveName: wave.name,
      status: waveStatus.status,
    });
  }

  /**
   * Execute a single skill
   */
  private async executeSkill(
    skillName: string,
    config: Record<string, unknown> | undefined,
    waveIndex: number,
    skillIndex: number
  ): Promise<void> {
    const skillStatus = this.execution!.waves[waveIndex].skills[skillIndex];
    skillStatus.status = 'running';
    skillStatus.startedAt = new Date().toISOString();

    this.onProgress?.({
      type: 'skill_start',
      waveIndex,
      skillName,
    });

    try {
      const result = await this.executor(skillName, config);

      if (result.success) {
        skillStatus.status = 'completed';
      } else {
        skillStatus.status = 'failed';
        skillStatus.error = result.error;
      }
    } catch (error) {
      skillStatus.status = 'failed';
      skillStatus.error = error instanceof Error ? error.message : String(error);
    }

    skillStatus.completedAt = new Date().toISOString();

    this.onProgress?.({
      type: 'skill_complete',
      waveIndex,
      skillName,
      status: skillStatus.status,
      error: skillStatus.error,
    });
  }

  /**
   * Pause execution
   */
  pause(): boolean {
    if (!this.execution || this.execution.status !== 'running') {
      return false;
    }

    this.execution.status = 'paused';
    return true;
  }

  /**
   * Check if execution should continue
   */
  private shouldContinue(): boolean {
    if (!this.execution) return false;
    return this.execution.status === 'running';
  }

  /**
   * Resume execution
   */
  async resume(): Promise<WorkflowExecution | null> {
    if (!this.execution || this.execution.status !== 'paused') {
      return null;
    }

    this.execution.status = 'running';

    // Continue from current wave
    const workflow = this.execution.workflow;
    for (let i = this.execution.currentWave; i < workflow.waves.length; i++) {
      if (!this.shouldContinue()) {
        break;
      }

      this.execution.currentWave = i;

      // Skip already completed waves
      if (this.execution.waves[i].status === 'completed') {
        continue;
      }

      await this.executeWave(workflow.waves[i], i);

      const waveStatus = this.execution.waves[i];
      if (waveStatus.status === 'failed' && !workflow.waves[i].continueOnError) {
        this.execution.status = 'failed';
        this.execution.error = `Wave ${i + 1} failed`;
        break;
      }
    }

    if (this.execution.status === 'running') {
      this.execution.status = 'completed';
    }

    this.execution.completedAt = new Date().toISOString();
    return this.execution;
  }

  /**
   * Cancel execution
   */
  cancel(): boolean {
    if (!this.execution || this.execution.status === 'completed' || this.execution.status === 'failed') {
      return false;
    }

    this.execution.status = 'cancelled';
    this.execution.completedAt = new Date().toISOString();
    return true;
  }
}

/**
 * Create a new workflow orchestrator
 */
export function createWorkflowOrchestrator(
  executor: SkillExecutor,
  onProgress?: WorkflowProgressCallback
): WorkflowOrchestrator {
  return new WorkflowOrchestrator(executor, onProgress);
}
