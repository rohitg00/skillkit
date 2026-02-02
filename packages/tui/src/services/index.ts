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

export type { TreeServiceState, TreeNodeDisplay } from './tree.service.js';
export {
  loadOrGenerateTree,
  navigateToPath,
  getNodeChildren,
  getNodeSkills,
  getTreeStats,
  searchInTree,
  formatTreePath,
} from './tree.service.js';
