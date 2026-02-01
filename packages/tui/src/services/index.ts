/**
 * Services Module
 * Provides service layer wrapping @skillkit/core APIs for TUI screens
 */

export * from './memory.service.js';
export * from './workflow.service.js';
export * from './plan.service.js';
export * from './plugin.service.js';
export * from './team.service.js';
export * from './methodology.service.js';
export * from './recommend.service.js';
export * from './context.service.js';

export type { ExecutorServiceState, AgentAvailability } from './executor.service.js';
export {
  getAgentAvailability,
  listAvailableAgents,
  executeSkill,
  executeSkillWithAgent,
  formatSkillPrompt,
  getExecutionInstructions,
  executorService,
} from './executor.service.js';

export type { AgentType } from './executor.service.js';

export type {
  TranslationDisplay,
  TranslationOptions,
  CanonicalSkill,
  TranslatorServiceState,
} from './translator.service.js';
export {
  getSupportedAgents,
  checkCanTranslate,
  translate,
  translateFromFile,
  parseSkill,
  detectFormat,
  previewTranslation,
  getAgentFormatInfo,
  translatorService,
} from './translator.service.js';

export { memoryService } from './memory.service.js';
export { workflowService } from './workflow.service.js';
export { planService } from './plan.service.js';
export { pluginService } from './plugin.service.js';
export { teamService } from './team.service.js';
export { methodologyService } from './methodology.service.js';
export { recommendService } from './recommend.service.js';
export { contextService } from './context.service.js';
