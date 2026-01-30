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

/**
 * Pipeline stage - a step in an agent pipeline
 */
export interface PipelineStage {
  agent: string;
  name: string;
  description: string;
  condition?: string;
  timeout?: number;
}

/**
 * Agent Pipeline - sequential multi-agent workflow
 */
export interface AgentPipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
}

/**
 * Built-in pipelines for common workflows
 */
export const BUILTIN_PIPELINES: AgentPipeline[] = [
  {
    id: 'feature',
    name: 'Feature Development',
    description: 'Plan → TDD → Review → Security',
    stages: [
      { agent: 'planner', name: 'Planning', description: 'Design implementation approach' },
      { agent: 'tdd-guide', name: 'TDD', description: 'Write tests first, then implement' },
      { agent: 'code-reviewer', name: 'Review', description: 'Quality and best practices check' },
      { agent: 'security-reviewer', name: 'Security', description: 'Security audit' },
    ],
  },
  {
    id: 'bugfix',
    name: 'Bug Fix',
    description: 'TDD → Review',
    stages: [
      { agent: 'tdd-guide', name: 'Fix', description: 'Test-first bug fix' },
      { agent: 'code-reviewer', name: 'Review', description: 'Verify fix quality' },
    ],
  },
  {
    id: 'refactor',
    name: 'Refactoring',
    description: 'Architect → Review → TDD',
    stages: [
      { agent: 'architect', name: 'Design', description: 'Plan refactoring approach' },
      { agent: 'code-reviewer', name: 'Review', description: 'Review proposed changes' },
      { agent: 'tdd-guide', name: 'Verify', description: 'Ensure tests pass after refactor' },
    ],
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Security → Review → Fix',
    stages: [
      { agent: 'security-reviewer', name: 'Audit', description: 'Identify vulnerabilities' },
      { agent: 'code-reviewer', name: 'Review', description: 'Review security findings' },
      { agent: 'build-error-resolver', name: 'Fix', description: 'Apply security fixes' },
    ],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Planner → Doc Updater',
    stages: [
      { agent: 'planner', name: 'Plan', description: 'Identify documentation needs' },
      { agent: 'doc-updater', name: 'Update', description: 'Update documentation' },
    ],
  },
];

/**
 * Get a built-in pipeline by ID
 */
export function getBuiltinPipeline(id: string): AgentPipeline | null {
  return BUILTIN_PIPELINES.find(p => p.id === id) || null;
}

/**
 * Get all built-in pipelines
 */
export function getBuiltinPipelines(): AgentPipeline[] {
  return BUILTIN_PIPELINES;
}
