export type MemoryCategory =
  | 'fact'
  | 'decision'
  | 'preference'
  | 'pattern'
  | 'insight'
  | 'reasoning';

export type MemoryTier = 'warm' | 'long';

export interface PersistentMemory {
  id: string;
  agentId: string;
  category: MemoryCategory;
  tier: MemoryTier;
  content: string;
  embedding: number[];
  reinforcementScore: number;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessedAt: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface MemoryCreateInput {
  agentId: string;
  category: MemoryCategory;
  content: string;
  tier?: MemoryTier;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemoryUpdateInput {
  category?: MemoryCategory;
  tier?: MemoryTier;
  content?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemorySearchOptions {
  agentId?: string;
  category?: MemoryCategory;
  tier?: MemoryTier;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface MemorySearchResult {
  memory: PersistentMemory;
  score: number;
}

export interface MemoryLink {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'related' | 'derived' | 'contradicts' | 'supports';
  strength: number;
  createdAt: string;
}

export interface MemoryStats {
  totalMemories: number;
  byCategory: Record<MemoryCategory, number>;
  byTier: Record<MemoryTier, number>;
  avgReinforcementScore: number;
  oldestMemory: string | null;
  newestMemory: string | null;
}

export interface TierPromotionConfig {
  accessCountThreshold: number;
  reinforcementScoreThreshold: number;
  ageThresholdDays: number;
}

export const DEFAULT_TIER_PROMOTION_CONFIG: TierPromotionConfig = {
  accessCountThreshold: 5,
  reinforcementScoreThreshold: 0.7,
  ageThresholdDays: 7,
};

export interface MemoryDatabaseConfig {
  dbPath: string;
  embeddingDimension: number;
  maxConnections: number;
}

export const DEFAULT_EMBEDDING_DIMENSION = 384;
