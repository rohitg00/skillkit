// Memory Module - Cross-Agent Session Memory System
// Provides persistent memory across all AI coding agents

export * from './types.js';
export { ObservationStore } from './observation-store.js';
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
