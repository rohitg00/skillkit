// Types
export {
  type DependencyInfo,
  type Detection,
  type ProjectStack,
  type ProjectPatterns,
  type SkillPreferences,
  type AgentConfig,
  type ProjectContext,
  type DetectionSource,
  type ContextSyncOptions,
  type ContextExportOptions,
  type ContextImportOptions,
  CONTEXT_FILE,
  CONTEXT_DIR,
  PROJECT_TYPE_HINTS,
} from './types.js';

// Detector
export {
  ProjectDetector,
  analyzeProject,
  getStackTags,
} from './detector.js';

// Manager
export {
  ContextManager,
  createContextManager,
  loadContext,
  initContext,
} from './manager.js';

// Sync
export {
  ContextSync,
  createContextSync,
  syncToAllAgents,
  syncToAgent,
  type SyncResult,
  type SyncReport,
} from './sync.js';
