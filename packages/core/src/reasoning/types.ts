import { z } from 'zod';
import type { SkillSummary, ProjectProfile } from '../recommend/types.js';
import type { TreeNode } from '../tree/types.js';

export const ReasoningProviderSchema = z.enum(['openai', 'anthropic', 'ollama', 'mock']);
export type ReasoningProvider = z.infer<typeof ReasoningProviderSchema>;

export interface ReasoningConfig {
  provider: ReasoningProvider;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseUrl?: string;
}

export interface TreeSearchQuery {
  query: string;
  context?: ProjectProfile;
  maxResults?: number;
  minConfidence?: number;
  searchDepth?: number;
}

export interface TreeTraversalStep {
  node: TreeNode;
  reasoning: string;
  confidence: number;
  action: 'explore' | 'skip' | 'select';
  selectedSkills: string[];
}

export interface TreeSearchResult {
  skill: SkillSummary;
  path: string[];
  reasoning: string;
  confidence: number;
  relevantSections: string[];
  matchedKeywords: string[];
}

export interface TreeReasoningResult {
  query: string;
  results: TreeSearchResult[];
  exploredPaths: string[][];
  reasoning: string;
  totalNodesVisited: number;
  processingTimeMs: number;
}

export interface ExplainedMatch {
  matchedBecause: string[];
  relevantFor: string[];
  differentFrom: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ExplainedRecommendation {
  skill: SkillSummary;
  score: number;
  reasoning: ExplainedMatch;
  treePath: string[];
}

export interface ReasoningPrompt {
  name: string;
  template: string;
  variables: string[];
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export interface ReasoningCacheEntry {
  query: string;
  results: TreeSearchResult[];
  timestamp: number;
  ttl: number;
}

export const DEFAULT_REASONING_CONFIG: ReasoningConfig = {
  provider: 'mock',
  model: 'gpt-4o-mini',
  maxTokens: 1000,
  temperature: 0.3,
};

export interface CategoryScore {
  category: string;
  score: number;
  reasoning: string;
}

export interface SearchPlan {
  primaryCategories: string[];
  secondaryCategories: string[];
  keywords: string[];
  filters: {
    tags?: string[];
    frameworks?: string[];
    languages?: string[];
  };
  strategy: 'breadth-first' | 'depth-first' | 'targeted';
}

export interface ReasoningEngineStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  averageProcessingTimeMs: number;
  averageResultsPerQuery: number;
}
