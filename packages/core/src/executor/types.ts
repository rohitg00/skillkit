/**
 * Executor Types
 *
 * Types for skill execution engine.
 */

import type { AgentType } from '../types.js';

/**
 * Task type within a skill
 */
export type ExecutableTaskType =
  | 'auto'
  | 'checkpoint:human-verify'
  | 'checkpoint:decision'
  | 'checkpoint:human-action';

/**
 * Task status
 */
export type ExecutionTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * Verification rule for a task
 */
export interface VerificationRule {
  /** Command to run for verification */
  command?: string;
  /** Expected result (success, contains:<text>, matches:<regex>) */
  expect?: string;
  /** Human verification prompt */
  description?: string;
  /** URL to show for verification */
  url?: string;
}

/**
 * An executable task within a skill
 */
export interface ExecutableTask {
  /** Task identifier */
  id: string;
  /** Task name/description */
  name: string;
  /** Task type */
  type: ExecutableTaskType;
  /** Action description for AI agent */
  action: string;
  /** Files expected to be modified */
  files?: string[];
  /** Verification rules */
  verify?: {
    automated?: VerificationRule[];
    human?: VerificationRule[];
  };
  /** Options for checkpoint:decision type */
  options?: string[];
  /** Dependencies (task IDs that must complete first) */
  dependsOn?: string[];
}

/**
 * Extended skill with execution metadata
 */
export interface ExecutableSkill {
  /** Skill name */
  name: string;
  /** Skill description */
  description?: string;
  /** Skill version */
  version?: string;
  /** Skill source (repo or path) */
  source: string;
  /** Skill content (instructions) */
  content: string;
  /** Executable tasks */
  tasks?: ExecutableTask[];
  /** Environment requirements */
  requirements?: {
    frameworks?: string[];
    languages?: string[];
    libraries?: string[];
  };
}

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  /** Task ID */
  taskId: string;
  /** Task name */
  taskName: string;
  /** Final status */
  status: ExecutionTaskStatus;
  /** Start time */
  startedAt: string;
  /** End time (only present for completed/failed/skipped tasks) */
  completedAt?: string;
  /** Duration in milliseconds (only present for completed/failed/skipped tasks) */
  durationMs?: number;
  /** Output/result */
  output?: string;
  /** Error message if failed */
  error?: string;
  /** Files modified */
  filesModified?: string[];
  /** Git commit SHA if committed */
  commitSha?: string;
  /** Verification results */
  verificationResults?: {
    automated: { rule: string; passed: boolean; output?: string }[];
    human: { description: string; passed: boolean }[];
  };
}

/**
 * Skill execution result
 */
export interface SkillExecutionResult {
  /** Skill name */
  skillName: string;
  /** Skill source */
  skillSource: string;
  /** Overall status */
  status: 'completed' | 'failed' | 'cancelled' | 'paused';
  /** Start time */
  startedAt: string;
  /** End time */
  completedAt?: string;
  /** Total duration in milliseconds */
  durationMs?: number;
  /** Task results */
  tasks: TaskExecutionResult[];
  /** All files modified */
  filesModified: string[];
  /** All commits created */
  commits: string[];
  /** Error if failed */
  error?: string;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  /** Target agent to use */
  agent?: AgentType;
  /** Whether to create commits per task */
  autoCommit?: boolean;
  /** Whether to run verification checks */
  verify?: boolean;
  /** Dry run (show what would be done) */
  dryRun?: boolean;
  /** Continue on task failure */
  continueOnError?: boolean;
  /** Environment variables to set */
  env?: Record<string, string>;
}

/**
 * Checkpoint response from user
 */
export interface CheckpointResponse {
  /** Whether to continue */
  continue: boolean;
  /** Selected option (for decision checkpoints) */
  selectedOption?: string;
  /** User notes */
  notes?: string;
}

/**
 * Checkpoint handler function type
 */
export type CheckpointHandler = (
  task: ExecutableTask,
  context: { skillName: string; taskIndex: number; totalTasks: number }
) => Promise<CheckpointResponse>;
