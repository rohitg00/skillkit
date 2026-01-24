/**
 * Team Orchestration Types
 *
 * Types for multi-agent team coordination with task assignment and review workflows.
 */

import type { AgentType } from '../types.js';

/**
 * Team status
 */
export type TeamStatus = 'forming' | 'working' | 'reviewing' | 'completing' | 'shutdown';

/**
 * Agent instance status
 */
export type AgentStatus = 'idle' | 'planning' | 'executing' | 'reviewing' | 'shutdown_requested' | 'shutdown';

/**
 * Orchestrator task status
 */
export type OrchestratorTaskStatus =
  | 'pending'
  | 'assigned'
  | 'planning'
  | 'plan_pending'
  | 'approved'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'failed';

/**
 * Message type
 */
export type MessageType =
  | 'direct'
  | 'broadcast'
  | 'plan_submit'
  | 'plan_approve'
  | 'plan_reject'
  | 'shutdown_request'
  | 'shutdown_approve'
  | 'task_assign'
  | 'task_update'
  | 'review_request'
  | 'review_complete';

/**
 * Review stage name
 */
export type ReviewStageName = 'spec-compliance' | 'code-quality' | 'security' | 'testing' | 'custom';

/**
 * Issue severity
 */
export type IssueSeverity = 'critical' | 'important' | 'minor';

/**
 * Team orchestrator configuration
 */
export interface OrchestratorTeamConfig {
  /** Team name */
  name: string;
  /** Leader agent type */
  leaderAgent: AgentType;
  /** Teammate agent types */
  teammateAgents?: AgentType[];
  /** Auto-spawn teammates */
  autoSpawn?: boolean;
  /** Require plan approval before execution */
  requirePlanApproval?: boolean;
  /** Review stages to apply */
  reviewStages?: ReviewStageName[];
  /** Timeout for tasks (ms) */
  taskTimeout?: number;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Team instance
 */
export interface Team {
  /** Unique team ID */
  id: string;
  /** Team name */
  name: string;
  /** Leader agent */
  leader: AgentInstance;
  /** Teammate agents */
  teammates: AgentInstance[];
  /** Team tasks */
  tasks: Task[];
  /** Team status */
  status: TeamStatus;
  /** Creation time */
  createdAt: Date;
  /** Configuration */
  config: OrchestratorTeamConfig;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent instance
 */
export interface AgentInstance {
  /** Unique agent ID */
  id: string;
  /** Agent role */
  role: 'leader' | 'teammate';
  /** Agent type */
  agentType: AgentType;
  /** Agent status */
  status: AgentStatus;
  /** Current task ID */
  currentTask?: string;
  /** Spawn time */
  spawnedAt: Date;
  /** Last activity time */
  lastActivityAt: Date;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Task files specification
 */
export interface TaskFiles {
  /** Files to create */
  create?: string[];
  /** Files to modify */
  modify?: string[];
  /** Test files */
  test?: string[];
}

/**
 * Plan step
 */
export interface PlanStep {
  /** Step number */
  number: number;
  /** Step description */
  description: string;
  /** Step type */
  type: 'test' | 'verify' | 'implement' | 'commit' | 'review';
  /** Code snippet (optional) */
  code?: string;
  /** Command to run (optional) */
  command?: string;
  /** Expected output (optional) */
  expectedOutput?: string;
}

/**
 * Task plan
 */
export interface TaskPlan {
  /** Plan steps */
  steps: PlanStep[];
  /** Estimated time in minutes */
  estimatedMinutes?: number;
  /** Plan submission time */
  submittedAt: Date;
  /** Plan approval time */
  approvedAt?: Date;
  /** Rejection reason */
  rejectionReason?: string;
  /** Approver ID */
  approvedBy?: string;
}

/**
 * Task result
 */
export interface TaskResult {
  /** Whether task succeeded */
  success: boolean;
  /** Output/summary */
  output: string;
  /** Files created */
  filesCreated?: string[];
  /** Files modified */
  filesModified?: string[];
  /** Test results */
  testResults?: TestResult[];
  /** Completion time */
  completedAt: Date;
  /** Errors if any */
  errors?: string[];
}

/**
 * Test result
 */
export interface TestResult {
  /** Test name */
  name: string;
  /** Whether test passed */
  passed: boolean;
  /** Error message */
  error?: string;
  /** Duration in ms */
  durationMs?: number;
}

/**
 * Task
 */
export interface Task {
  /** Unique task ID */
  id: string;
  /** Task name */
  name: string;
  /** Task description */
  description: string;
  /** Full specification */
  spec: string;
  /** Files involved */
  files: TaskFiles;
  /** Assigned agent ID */
  assignee?: string;
  /** Task status */
  status: OrchestratorTaskStatus;
  /** Task plan */
  plan?: TaskPlan;
  /** Task result */
  result?: TaskResult;
  /** Priority (higher = more important) */
  priority?: number;
  /** Dependencies (task IDs) */
  dependencies?: string[];
  /** Creation time */
  createdAt: Date;
  /** Last update time */
  updatedAt: Date;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Review issue
 */
export interface ReviewIssue {
  /** Issue severity */
  severity: IssueSeverity;
  /** Issue description */
  description: string;
  /** File path */
  file?: string;
  /** Line number */
  line?: number;
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Review result
 */
export interface ReviewResult {
  /** Whether review passed */
  passed: boolean;
  /** Review issues */
  issues: ReviewIssue[];
  /** Summary */
  summary: string;
  /** Reviewer ID */
  reviewerId?: string;
  /** Review time */
  reviewedAt: Date;
}

/**
 * Review stage
 */
export interface ReviewStage {
  /** Stage name */
  name: ReviewStageName;
  /** Stage prompt */
  prompt: string;
  /** Required to pass */
  required: boolean;
  /** Reviewer (leader or specific agent) */
  reviewer?: 'leader' | string;
}

/**
 * Team message
 */
export interface TeamMessage {
  /** Message ID */
  id: string;
  /** Message type */
  type: MessageType;
  /** Sender agent ID */
  from: string;
  /** Recipient agent ID (for direct messages) */
  to?: string;
  /** Message content */
  content: string;
  /** Related task ID */
  taskId?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Task filter
 */
export interface TaskFilter {
  /** Filter by status */
  status?: OrchestratorTaskStatus | OrchestratorTaskStatus[];
  /** Filter by assignee */
  assignee?: string;
  /** Filter by priority */
  minPriority?: number;
  /** Include completed tasks */
  includeCompleted?: boolean;
}

/**
 * Team orchestrator options
 */
export interface OrchestratorOptions {
  /** Project path */
  projectPath: string;
  /** Default review stages */
  defaultReviewStages?: ReviewStage[];
  /** Require plan approval by default */
  requirePlanApproval?: boolean;
  /** Task timeout (ms) */
  taskTimeout?: number;
  /** Enable methodology integration */
  enableMethodology?: boolean;
  /** Verbose logging */
  verbose?: boolean;
}

/**
 * Plan result
 */
export interface PlanResult {
  /** Whether all tasks completed */
  success: boolean;
  /** Task results */
  taskResults: Map<string, TaskResult>;
  /** Failed tasks */
  failedTasks: string[];
  /** Total duration (ms) */
  durationMs: number;
}

/**
 * Message handler
 */
export type MessageHandler = (message: TeamMessage) => void | Promise<void>;

/**
 * Task event
 */
export type TaskEvent =
  | 'task:created'
  | 'task:assigned'
  | 'task:plan_submitted'
  | 'task:plan_approved'
  | 'task:plan_rejected'
  | 'task:started'
  | 'task:completed'
  | 'task:failed';

/**
 * Team event
 */
export type TeamEvent =
  | 'team:created'
  | 'team:teammate_spawned'
  | 'team:teammate_shutdown'
  | 'team:shutdown';

/**
 * Task event listener
 */
export type TaskEventListener = (event: TaskEvent, task: Task) => void | Promise<void>;

/**
 * Team event listener
 */
export type TeamEventListener = (event: TeamEvent, team: Team, agent?: AgentInstance) => void | Promise<void>;
