/**
 * Team Orchestration System
 *
 * Provides multi-agent team coordination with task assignment, plan approval,
 * and review workflows.
 *
 * Key features:
 * - Team lifecycle management (spawn, shutdown)
 * - Task creation and assignment
 * - Plan approval workflow
 * - Review stages (spec-compliance, code-quality)
 * - Inter-agent messaging (direct + broadcast)
 * - Universal agent support (32 agents)
 */

// Team Orchestrator
export { TeamOrchestrator, createTeamOrchestrator } from './team.js';

// Task Manager
export { TaskManager, createTaskManager } from './task.js';

// Message Bus
export { TeamMessageBus, createMessageBus } from './messages.js';

// Types
export type {
  // Team types
  Team,
  OrchestratorTeamConfig,
  TeamStatus,
  TeamEvent,
  TeamEventListener,

  // Agent types
  AgentInstance,
  AgentStatus,

  // Task types
  Task,
  OrchestratorTaskStatus,
  TaskFiles,
  TaskPlan,
  TaskResult,
  TaskFilter,
  TaskEvent,
  TaskEventListener,
  PlanStep,
  TestResult,

  // Review types
  ReviewStage,
  ReviewStageName,
  ReviewResult,
  ReviewIssue,
  IssueSeverity,

  // Message types
  TeamMessage,
  MessageType,
  MessageHandler,

  // Result types
  PlanResult,

  // Options
  OrchestratorOptions,
} from './types.js';
