export * from './types.js';

export { CozoAdapter, type CozoAdapterOptions, type CozoResult, type MemoryRow, type LinkRow, type StatsRow } from './database/index.js';
export { initializeSchema, dropSchema } from './database/index.js';

export {
  initializeEncoder,
  encode,
  encodeBatch,
  cosineSimilarity,
  euclideanDistance,
  isEncoderReady,
  disposeEncoder,
  type EncoderOptions,
  SemanticSearch,
  quickSearch,
  type SemanticSearchOptions,
} from './embeddings/index.js';

export { MemoryStore } from './stores/index.js';

export { TierManager, createTierManager, type TierEvaluationResult } from './tiers/index.js';

export async function createMemoryStore(agentId: string, dbPath?: string): Promise<import('./stores/memory-store.js').MemoryStore> {
  const { MemoryStore } = await import('./stores/memory-store.js');
  const store = new MemoryStore(agentId, dbPath);
  await store.initialize();
  return store;
}
