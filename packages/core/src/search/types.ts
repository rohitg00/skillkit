import { z } from 'zod';
import type { SearchResult } from '../recommend/types.js';

export const LocalModelConfigSchema = z.object({
  embedModel: z.string().default('nomic-embed-text-v1.5.Q4_K_M.gguf'),
  llmModel: z.string().default('gemma-2b-it-Q4_K_M.gguf'),
  modelDir: z.string().optional(),
  autoDownload: z.boolean().default(true),
  gpuLayers: z.number().default(0),
});
export type LocalModelConfig = z.infer<typeof LocalModelConfigSchema>;

export const SkillChunkSchema = z.object({
  content: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  tokenCount: z.number(),
});
export type SkillChunk = z.infer<typeof SkillChunkSchema>;

export interface SkillEmbedding {
  skillName: string;
  vector: Float32Array;
  textContent: string;
  chunks?: {
    content: string;
    vector: Float32Array;
    startLine: number;
    endLine: number;
  }[];
  generatedAt: string;
}

export interface VectorSearchResult {
  skillName: string;
  similarity: number;
  matchedChunk?: {
    content: string;
    startLine: number;
  };
}

export interface ExpandedQuery {
  original: string;
  variations: string[];
  weights: number[];
}

export interface RRFRanking {
  skillName: string;
  rrfScore: number;
  ranks: {
    source: string;
    rank: number;
  }[];
}

export interface HybridSearchOptions {
  query: string;
  limit?: number;
  enableExpansion?: boolean;
  enableReranking?: boolean;
  semanticWeight?: number;
  keywordWeight?: number;
  rrfK?: number;
  positionAwareBlending?: boolean;
}

export interface HybridSearchResult extends SearchResult {
  hybridScore: number;
  vectorSimilarity?: number;
  keywordScore?: number;
  rrfScore?: number;
  rerankerScore?: number;
  expandedTerms?: string[];
  blendingWeights?: {
    retrieval: number;
    reranker: number;
  };
}

export interface HybridSearchResponse {
  results: HybridSearchResult[];
  query: {
    original: string;
    expanded?: ExpandedQuery;
  };
  timing: {
    totalMs: number;
    embeddingMs?: number;
    vectorSearchMs?: number;
    keywordSearchMs?: number;
    fusionMs?: number;
    rerankingMs?: number;
  };
  stats: {
    candidatesFromVector: number;
    candidatesFromKeyword: number;
    totalMerged: number;
    reranked: number;
  };
}

export interface EmbeddingServiceStats {
  totalSkillsIndexed: number;
  totalChunks: number;
  indexSizeBytes: number;
  lastIndexedAt: string;
  modelName: string;
  embeddingDimensions: number;
}

export interface VectorStoreConfig {
  dbPath: string;
  tableName?: string;
  dimensions?: number;
}

export interface IndexBuildProgress {
  phase: 'downloading' | 'loading' | 'embedding' | 'storing' | 'complete';
  current: number;
  total: number;
  skillName?: string;
  message?: string;
}

export type IndexBuildCallback = (progress: IndexBuildProgress) => void;

export const MODEL_REGISTRY = {
  embeddings: {
    'nomic-embed-text-v1.5.Q4_K_M.gguf': {
      url: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf',
      size: 547000000,
      dimensions: 768,
      description: 'Nomic Embed Text v1.5 - High quality embeddings',
    },
  },
  llm: {
    'gemma-2b-it-Q4_K_M.gguf': {
      url: 'https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf',
      size: 1500000000,
      description: 'Gemma 2B Instruct - Fast query expansion and reranking',
    },
  },
} as const;

export const DEFAULT_CHUNKING_CONFIG = {
  maxTokens: 800,
  overlapPercent: 15,
  minChunkSize: 100,
} as const;

export const DEFAULT_HYBRID_CONFIG = {
  rrfK: 60,
  semanticWeight: 0.5,
  keywordWeight: 0.5,
  rerankTopN: 30,
  positionBlending: {
    top3: { retrieval: 0.75, reranker: 0.25 },
    top10: { retrieval: 0.6, reranker: 0.4 },
    rest: { retrieval: 0.4, reranker: 0.6 },
  },
  expansionCacheTtlMs: 5 * 60 * 1000,
} as const;

export interface RerankerInput {
  query: string;
  skillName: string;
  skillDescription: string;
  skillTags: string[];
}

export interface RerankerOutput {
  skillName: string;
  score: number;
  reasoning?: string;
}
