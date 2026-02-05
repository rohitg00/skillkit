export * from './types.js';
export {
  ObservationStore,
  type AutoCompressCallback,
  type ObservationStoreOptions,
} from './observation-store.js';
export { LearningStore } from './learning-store.js';
export { MemoryIndexStore } from './memory-index.js';
export {
  getMemoryPaths,
  initializeMemoryDirectory,
  memoryDirectoryExists,
  globalMemoryDirectoryExists,
  getMemoryStatus,
  type MemoryPaths,
  type MemoryStatus,
} from './initializer.js';
export {
  MemoryObserver,
  createMemoryObserver,
  type ObservableEvent,
  type ObservableEventType,
  type MemoryObserverConfig,
} from './observer.js';
export {
  MemoryEnabledEngine,
  createMemoryEnabledEngine,
  wrapProgressCallbackWithMemory,
  type MemoryEnabledEngineOptions,
} from './engine-integration.js';
export {
  RuleBasedCompressor,
  APIBasedCompressor,
  MemoryCompressor,
  LearningConsolidator,
  createRuleBasedCompressor,
  createAPIBasedCompressor,
  createMemoryCompressor,
  type CompressionEngine,
  type CompressedLearning,
  type CompressionResult,
  type CompressionOptions,
  type APICompressionConfig,
} from './compressor.js';
export {
  MemoryInjector,
  createMemoryInjector,
  type InjectionOptions,
  type InjectedMemory,
  type InjectionResult,
} from './injector.js';

export * from './hooks/index.js';

export {
  ClaudeMdUpdater,
  createClaudeMdUpdater,
  updateClaudeMd,
  syncGlobalClaudeMd,
  type ClaudeMdUpdateOptions,
  type ClaudeMdUpdateResult,
  type ParsedClaudeMd,
} from './claude-md-updater.js';

export {
  ProgressiveDisclosureManager,
  createProgressiveDisclosureManager,
  type IndexEntry,
  type TimelineEntry,
  type DetailsEntry,
  type ActivityPoint,
  type ProgressiveDisclosureOptions,
} from './progressive-disclosure.js';
