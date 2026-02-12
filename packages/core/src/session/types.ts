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

export interface SkillActivity {
  commitSha: string;
  committedAt: string;
  activeSkills: string[];
  filesChanged: string[];
  message: string;
}

export interface ActivityLogData {
  version: 1;
  activities: SkillActivity[];
}

export interface SessionSnapshot {
  version: 1;
  name: string;
  createdAt: string;
  description?: string;
  sessionState: SessionState;
  observations: Array<{
    id: string;
    timestamp: string;
    sessionId: string;
    agent: string;
    type: string;
    content: Record<string, unknown>;
    relevance: number;
  }>;
}

// Timeline types
export type TimelineEventType = 'skill_start' | 'skill_complete' | 'task_progress' | 'git_commit' | 'observation' | 'decision' | 'snapshot';

export interface TimelineEvent {
  timestamp: string;
  type: TimelineEventType;
  source: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface TimelineData {
  projectPath: string;
  sessionDate: string;
  events: TimelineEvent[];
  totalCount: number;
}

export interface TimelineOptions {
  since?: string;
  types?: TimelineEventType[];
  limit?: number;
  skillFilter?: string;
  includeGit?: boolean;
}

// Handoff types
export interface HandoffDocument {
  generatedAt: string;
  fromAgent: string;
  projectPath: string;
  accomplished: HandoffSection;
  pending: HandoffSection;
  keyFiles: Array<{ path: string; changeType: string }>;
  observations: {
    errors: Array<{ action: string; error: string }>;
    solutions: Array<{ action: string; solution: string }>;
    patterns: Array<{ action: string; context: string }>;
  };
  recommendations: string[];
}

export interface HandoffSection {
  tasks: Array<{ name: string; duration?: string; commitSha?: string }>;
  commits: Array<{ sha: string; message: string; filesCount: number }>;
}

export interface HandoffOptions {
  targetAgent?: string;
  includeGit?: boolean;
  includeObservations?: boolean;
  maxObservations?: number;
}

// Lineage types
export interface SkillLineageEntry {
  skillName: string;
  executions: number;
  totalDurationMs: number;
  commits: string[];
  filesModified: string[];
  observationIds: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface FileLineage {
  path: string;
  skills: string[];
  commitCount: number;
  lastModified: string;
}

export interface LineageData {
  projectPath: string;
  skills: SkillLineageEntry[];
  files: FileLineage[];
  stats: {
    totalSkillExecutions: number;
    totalCommits: number;
    totalFilesChanged: number;
    mostImpactfulSkill: string | null;
    mostChangedFile: string | null;
    errorProneFiles: string[];
  };
}

export interface LineageOptions {
  skill?: string;
  file?: string;
  limit?: number;
  since?: string;
}

export interface SessionExplanation {
  date: string;
  agent: string;
  duration?: string;
  skillsUsed: Array<{ name: string; status: string }>;
  tasks: Array<{ name: string; status: string; duration?: string }>;
  filesModified: string[];
  decisions: Array<{ key: string; value: string }>;
  observationCounts: { errors: number; solutions: number; patterns: number; total: number };
  gitCommits: number;
}
