/**
 * Structured Plan Types
 *
 * Types for bite-sized task plans with structured execution.
 * Supports parsing, validation, and execution of development plans.
 */

/**
 * Step type in a task
 */
export type StepType = 'test' | 'verify' | 'implement' | 'commit' | 'review' | 'setup' | 'cleanup';

/**
 * Plan status
 */
export type PlanStatus = 'draft' | 'ready' | 'executing' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Task step within a plan task
 */
export interface TaskStep {
  /** Step number */
  number: number;
  /** Step description */
  description: string;
  /** Step type */
  type: StepType;
  /** Code snippet (optional) */
  code?: string;
  /** Programming language for code */
  language?: string;
  /** Command to run (optional) */
  command?: string;
  /** Expected output (optional) */
  expectedOutput?: string;
  /** Whether this step is critical (failure stops execution) */
  critical?: boolean;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Task files specification
 */
export interface PlanTaskFiles {
  /** Files to create */
  create?: string[];
  /** Files to modify */
  modify?: string[];
  /** Test files */
  test?: string[];
  /** Files to delete */
  delete?: string[];
}

/**
 * Task within a structured plan
 */
export interface PlanTask {
  /** Task ID */
  id: number;
  /** Task name */
  name: string;
  /** Task description */
  description?: string;
  /** Files involved */
  files: PlanTaskFiles;
  /** Steps to complete the task */
  steps: TaskStep[];
  /** Estimated time in minutes (target: 2-5 min) */
  estimatedMinutes?: number;
  /** Dependencies (task IDs that must complete first) */
  dependencies?: number[];
  /** Tags for categorization */
  tags?: string[];
  /** Priority (higher = more important) */
  priority?: number;
  /** Assigned agent type */
  assignee?: string;
  /** Task status */
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  /** Completion result */
  result?: PlanTaskResult;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Task result after execution
 */
export interface PlanTaskResult {
  /** Whether task succeeded */
  success: boolean;
  /** Output summary */
  output: string;
  /** Files created */
  filesCreated?: string[];
  /** Files modified */
  filesModified?: string[];
  /** Errors if any */
  errors?: string[];
  /** Duration in milliseconds */
  durationMs?: number;
  /** Completion timestamp */
  completedAt: Date;
}

/**
 * Structured plan
 */
export interface StructuredPlan {
  /** Plan name */
  name: string;
  /** Version */
  version?: string;
  /** Goal/objective */
  goal: string;
  /** Architecture description */
  architecture?: string;
  /** Tech stack */
  techStack?: string[];
  /** Tasks in the plan */
  tasks: PlanTask[];
  /** Plan status */
  status: PlanStatus;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Link to design document */
  designDoc?: string;
  /** Author */
  author?: string;
  /** Tags */
  tags?: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  /** Issue type */
  type: 'error' | 'warning' | 'info';
  /** Issue message */
  message: string;
  /** Related task ID */
  taskId?: number;
  /** Related step number */
  stepNumber?: number;
  /** Suggestion for fix */
  suggestion?: string;
}

/**
 * Validation result
 */
export interface PlanValidationResult {
  /** Whether the plan is valid */
  valid: boolean;
  /** Validation issues */
  issues: ValidationIssue[];
  /** Statistics */
  stats: {
    /** Total tasks */
    totalTasks: number;
    /** Total steps */
    totalSteps: number;
    /** Estimated total time in minutes */
    estimatedMinutes: number;
    /** Tasks with tests */
    tasksWithTests: number;
    /** Tasks with commits */
    tasksWithCommits: number;
    /** Average steps per task */
    avgStepsPerTask: number;
  };
}

/**
 * Plan parse options
 */
export interface ParseOptions {
  /** Strict mode (fail on warnings) */
  strict?: boolean;
  /** Validate after parsing */
  validate?: boolean;
  /** Default step type */
  defaultStepType?: StepType;
}

/**
 * Plan generation options
 */
export interface GenerateOptions {
  /** Target task size in minutes */
  targetTaskMinutes?: number;
  /** Include tests in every task */
  includeTests?: boolean;
  /** Include commits after each task */
  includeCommits?: boolean;
  /** Tech stack to use */
  techStack?: string[];
  /** Author name */
  author?: string;
}

/**
 * Plan execution options
 */
export interface PlanExecutionOptions {
  /** Dry run (don't actually execute) */
  dryRun?: boolean;
  /** Stop on first error */
  stopOnError?: boolean;
  /** Parallel execution (for independent tasks) */
  parallel?: boolean;
  /** Timeout per task in milliseconds */
  taskTimeout?: number;
  /** Progress callback */
  onProgress?: (taskId: number, step: number, status: string) => void;
  /** Task complete callback */
  onTaskComplete?: (task: PlanTask, result: PlanTaskResult) => void;
}

/**
 * Plan execution result
 */
export interface PlanExecutionResult {
  /** Whether the plan completed successfully */
  success: boolean;
  /** Tasks that completed */
  completedTasks: number[];
  /** Tasks that failed */
  failedTasks: number[];
  /** Tasks that were skipped */
  skippedTasks: number[];
  /** Total duration in milliseconds */
  durationMs: number;
  /** Task results */
  taskResults: Map<number, PlanTaskResult>;
  /** Errors */
  errors?: string[];
}

/**
 * Plan event types
 */
export type PlanEvent =
  | 'plan:created'
  | 'plan:updated'
  | 'plan:validated'
  | 'plan:execution_started'
  | 'plan:task_started'
  | 'plan:task_completed'
  | 'plan:task_failed'
  | 'plan:execution_completed'
  | 'plan:execution_failed'
  | 'plan:execution_cancelled'
  | 'plan:paused'
  | 'plan:resumed';

/**
 * Plan event listener
 */
export type PlanEventListener = (
  event: PlanEvent,
  plan: StructuredPlan,
  task?: PlanTask,
  result?: PlanTaskResult
) => void | Promise<void>;
