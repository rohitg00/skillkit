import type { AgentType } from '../types.js';

export type ObservationType =
  | 'tool_use'
  | 'decision'
  | 'error'
  | 'solution'
  | 'pattern'
  | 'file_change'
  | 'checkpoint';

export interface ObservationContent {
  action: string;
  context: string;
  result?: string;
  files?: string[];
  tags?: string[];
  error?: string;
  solution?: string;
}

export interface Observation {
  id: string;
  timestamp: string;
  sessionId: string;
  agent: AgentType;
  type: ObservationType;
  content: ObservationContent;
  relevance: number;
}

export interface Learning {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: 'session' | 'manual' | 'imported';
  sourceObservations?: string[];

  title: string;
  content: string;

  scope: 'project' | 'global';
  project?: string;

  tags: string[];
  frameworks?: string[];
  patterns?: string[];

  useCount: number;
  lastUsed?: string;
  effectiveness?: number;
}

export interface MemoryIndex {
  version: 1;
  lastUpdated: string;
  entries: Record<string, string[]>;
  tags: Record<string, string[]>;
}

export interface MemorySummary {
  id: string;
  title: string;
  tags: string[];
  relevance: number;
}

export interface MemoryPreview extends MemorySummary {
  excerpt: string;
  lastUsed?: string;
}

export interface MemoryFull extends MemoryPreview {
  content: string;
  sourceObservations?: Observation[];
}

export interface ObservationStoreData {
  version: 1;
  sessionId: string;
  observations: Observation[];
}

export interface LearningStoreData {
  version: 1;
  learnings: Learning[];
}

export interface MemoryConfig {
  autoCompress: boolean;
  compressionThreshold: number;
  compressionModel?: string;
  maxObservations: number;
  maxLearnings: number;
}

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  autoCompress: true,
  compressionThreshold: 50,
  maxObservations: 1000,
  maxLearnings: 500,
};

export interface MemorySearchOptions {
  query?: string;
  tags?: string[];
  scope?: 'project' | 'global' | 'all';
  limit?: number;
  minRelevance?: number;
}

export interface MemorySearchResult {
  learning: Learning;
  score: number;
  matchedKeywords: string[];
  matchedTags: string[];
}
