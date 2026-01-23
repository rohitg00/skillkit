/**
 * Session State Types
 *
 * Types for managing skill execution sessions with pause/resume support.
 */

/**
 * Status of a task in execution
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';

/**
 * A single task within a skill execution
 */
export interface SessionTask {
  /** Task identifier */
  id: string;
  /** Task name/description */
  name: string;
  /** Task type (auto, checkpoint:human-verify, checkpoint:decision, checkpoint:human-action) */
  type: 'auto' | 'checkpoint:human-verify' | 'checkpoint:decision' | 'checkpoint:human-action';
  /** Current status */
  status: TaskStatus;
  /** Start time */
  startedAt?: string;
  /** Completion time */
  completedAt?: string;
  /** Error message if failed */
  error?: string;
  /** Output/result of the task */
  output?: string;
  /** Files modified by this task */
  filesModified?: string[];
  /** Git commit SHA if committed */
  commitSha?: string;
}

/**
 * Current skill execution state
 */
export interface CurrentExecution {
  /** Skill being executed */
  skillName: string;
  /** Skill source (repo) */
  skillSource: string;
  /** Current step/task index */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Execution status */
  status: 'running' | 'paused' | 'completed' | 'failed';
  /** When execution started */
  startedAt: string;
  /** When execution was paused (if paused) */
  pausedAt?: string;
  /** Tasks in this execution */
  tasks: SessionTask[];
}

/**
 * Historical execution record
 */
export interface ExecutionHistory {
  /** Skill name */
  skillName: string;
  /** Skill source */
  skillSource: string;
  /** When execution completed */
  completedAt: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Final status */
  status: 'completed' | 'failed' | 'cancelled';
  /** Git commits created */
  commits: string[];
  /** Files modified */
  filesModified: string[];
  /** Error if failed */
  error?: string;
}

/**
 * User decisions made during skill execution
 */
export interface SessionDecision {
  /** Decision key/identifier */
  key: string;
  /** Decision value */
  value: string;
  /** When decision was made */
  madeAt: string;
  /** Skill that prompted the decision */
  skillName?: string;
}

/**
 * Full session state
 */
export interface SessionState {
  /** Schema version */
  version: 1;
  /** Last activity timestamp */
  lastActivity: string;
  /** Project path this session is for */
  projectPath: string;
  /** Current execution (if any) */
  currentExecution?: CurrentExecution;
  /** Execution history */
  history: ExecutionHistory[];
  /** User decisions */
  decisions: SessionDecision[];
}

/**
 * Session state file path within .skillkit directory
 */
export const SESSION_FILE = 'session.yaml';
