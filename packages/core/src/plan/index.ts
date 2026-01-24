/**
 * Structured Plan System
 *
 * Provides plan parsing, validation, generation, and execution
 * for bite-sized task plans with structured steps.
 *
 * Key features:
 * - Parse markdown plans to structured format
 * - Validate plans for completeness and best practices
 * - Generate plans from task lists or templates
 * - Execute plans with progress tracking
 * - Event-driven architecture
 */

// Parser
export { PlanParser, createPlanParser } from './parser.js';

// Validator
export { PlanValidator, createPlanValidator, validatePlan } from './validator.js';
export type { ValidatorOptions } from './validator.js';

// Generator
export { PlanGenerator, createPlanGenerator, TASK_TEMPLATES } from './generator.js';
export type { TaskTemplate } from './generator.js';

// Executor
export { PlanExecutor, createPlanExecutor, dryRunExecutor, shellExecutor } from './executor.js';
export type { StepExecutor } from './executor.js';

// Types
export type {
  // Core types
  StructuredPlan,
  PlanTask,
  TaskStep,
  PlanTaskResult,
  PlanTaskFiles,
  StepType,
  PlanStatus,

  // Validation
  PlanValidationResult,
  ValidationIssue,

  // Options
  ParseOptions,
  GenerateOptions,
  PlanExecutionOptions,

  // Execution
  PlanExecutionResult,

  // Events
  PlanEvent,
  PlanEventListener,
} from './types.js';
