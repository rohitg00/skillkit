/**
 * Workflow Types
 *
 * Types for skill composition and workflow orchestration.
 */

/**
 * A skill reference within a workflow
 */
export interface WorkflowSkill {
  /** Skill name or source (e.g., "typescript-strict-mode" or "owner/repo/skill") */
  skill: string;
  /** Optional configuration overrides */
  config?: Record<string, unknown>;
  /** Optional condition to run this skill */
  condition?: string;
}

/**
 * A wave of skills to execute (parallel or sequential)
 */
export interface WorkflowWave {
  /** Wave name/description */
  name?: string;
  /** Whether skills in this wave run in parallel */
  parallel: boolean;
  /** Skills to execute in this wave */
  skills: (string | WorkflowSkill)[];
  /** Continue to next wave even if this wave has failures */
  continueOnError?: boolean;
}

/**
 * Workflow definition
 */
export interface Workflow {
  /** Workflow name (used as identifier) */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Workflow version */
  version?: string;
  /** Author information */
  author?: string;
  /** Tags for discovery */
  tags?: string[];
  /** Waves of skills to execute */
  waves: WorkflowWave[];
  /** Environment variables to set */
  env?: Record<string, string>;
  /** Pre-execution hooks */
  preHooks?: string[];
  /** Post-execution hooks */
  postHooks?: string[];
}

/**
 * Workflow execution status
 */
export type WorkflowExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Status of a wave execution
 */
export interface WaveExecutionStatus {
  /** Wave index */
  waveIndex: number;
  /** Wave name */
  waveName?: string;
  /** Status */
  status: WorkflowExecutionStatus;
  /** Skills statuses */
  skills: {
    skill: string;
    status: WorkflowExecutionStatus;
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }[];
  /** When wave started */
  startedAt?: string;
  /** When wave completed */
  completedAt?: string;
}

/**
 * Workflow execution state
 */
export interface WorkflowExecution {
  /** Workflow being executed */
  workflow: Workflow;
  /** Execution ID */
  executionId: string;
  /** Overall status */
  status: WorkflowExecutionStatus;
  /** Current wave index */
  currentWave: number;
  /** Wave statuses */
  waves: WaveExecutionStatus[];
  /** When execution started */
  startedAt: string;
  /** When execution completed */
  completedAt?: string;
  /** Error if failed */
  error?: string;
}

/**
 * Workflow file location
 */
export const WORKFLOWS_DIR = 'workflows';
export const WORKFLOW_EXTENSION = '.yaml';
