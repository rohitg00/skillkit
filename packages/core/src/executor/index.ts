/**
 * Skill Execution Engine Module
 *
 * Provides skill execution with task-based orchestration,
 * verification, and session state management.
 */

export * from './types.js';
export * from './engine.js';
export { SkillExecutionEngine, createExecutionEngine } from './engine.js';

// Agent Execution (Real CLI integration)
export * from './agents.js';
export {
  executeWithAgent,
  isAgentCLIAvailable,
  getAvailableCLIAgents,
  getAgentCLIConfig,
  formatSkillAsPrompt,
  getExecutionStrategy,
  getManualExecutionInstructions,
  AGENT_CLI_CONFIGS,
  type AgentCLIConfig,
  type AgentExecutionResult,
  type ExecutionStrategy,
} from './agents.js';

// Skill Executor for Workflows
export {
  createSkillExecutor,
  createSimulatedSkillExecutor,
  type SkillExecutorOptions,
  type SkillExecutionEvent,
} from './skill-executor.js';
