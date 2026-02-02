import { z } from 'zod';
import type { ProjectStack } from '../context/types.js';

/**
 * Skill summary for recommendation matching
 */
export const SkillSummary = z.object({
  name: z.string(),
  description: z.string().optional(),
  source: z.string().optional(), // Repository source
  tags: z.array(z.string()).default([]),
  compatibility: z
    .object({
      frameworks: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      libraries: z.array(z.string()).default([]),
      minVersion: z.record(z.string()).optional(), // { "react": "18.0.0" }
    })
    .optional(),
  popularity: z.number().default(0), // Downloads/stars
  quality: z.number().min(0).max(100).default(50), // Quality score
  lastUpdated: z.string().datetime().optional(),
  verified: z.boolean().default(false),
});
export type SkillSummary = z.infer<typeof SkillSummary>;

/**
 * Scored skill with match explanation
 */
export interface ScoredSkill {
  skill: SkillSummary;
  score: number; // 0-100
  reasons: MatchReason[];
  warnings: string[];
}

/**
 * Match reason with category and weight
 */
export interface MatchReason {
  category: MatchCategory;
  description: string;
  weight: number; // Points contributed
  matched: string[]; // What matched
}

/**
 * Categories of matching
 */
export type MatchCategory =
  | 'framework'
  | 'language'
  | 'library'
  | 'tag'
  | 'pattern'
  | 'popularity'
  | 'quality'
  | 'freshness';

/**
 * Weight configuration for scoring
 */
export interface ScoringWeights {
  framework: number; // Default: 40
  language: number; // Default: 20
  library: number; // Default: 15
  tag: number; // Default: 10
  popularity: number; // Default: 5
  quality: number; // Default: 5
  freshness: number; // Default: 5
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  framework: 40,
  language: 20,
  library: 15,
  tag: 10,
  popularity: 5,
  quality: 5,
  freshness: 5,
};

/**
 * Project profile for matching (derived from ProjectContext)
 */
export interface ProjectProfile {
  name: string;
  type?: string;
  stack: ProjectStack;
  patterns?: {
    components?: string;
    stateManagement?: string;
    apiStyle?: string;
    styling?: string;
    testing?: string;
  };
  installedSkills: string[];
  excludedSkills: string[];
}

/**
 * Skill index for efficient lookup
 */
export interface SkillIndex {
  version: number;
  lastUpdated: string;
  skills: SkillSummary[];
  sources: IndexSource[];
}

/**
 * Source repository in the index
 */
export interface IndexSource {
  name: string;
  url: string;
  lastFetched: string;
  skillCount: number;
}

/**
 * Recommendation options
 */
export interface RecommendOptions {
  limit?: number; // Max recommendations (default: 10)
  minScore?: number; // Minimum score threshold (default: 30)
  categories?: string[]; // Filter by categories
  excludeInstalled?: boolean; // Skip already installed (default: true)
  weights?: Partial<ScoringWeights>;
  includeReasons?: boolean; // Include detailed reasons (default: true)
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  recommendations: ScoredSkill[];
  profile: ProjectProfile;
  totalSkillsScanned: number;
  timestamp: string;
}

/**
 * Search options for task-based search
 */
export interface SearchOptions {
  query: string;
  limit?: number;
  semantic?: boolean; // Use semantic matching (default: true)
  filters?: {
    tags?: string[];
    minScore?: number;
    verified?: boolean;
  };
}

/**
 * Search result
 */
export interface SearchResult {
  skill: SkillSummary;
  relevance: number; // 0-100
  matchedTerms: string[];
  snippet?: string; // Relevant excerpt
}

/**
 * Freshness check result
 */
export interface FreshnessResult {
  skill: string;
  status: 'current' | 'outdated' | 'unknown';
  details?: {
    skillVersion?: string;
    projectVersion?: string;
    message: string;
  };
}

/**
 * Tag to technology mapping for smart inference
 */
export const TAG_TO_TECH: Record<string, string[]> = {
  // Frontend frameworks
  react: ['react', 'react-dom', '@types/react'],
  vue: ['vue', '@vue/core'],
  angular: ['@angular/core'],
  svelte: ['svelte'],
  solid: ['solid-js'],
  qwik: ['@builder.io/qwik'],

  // Meta-frameworks
  nextjs: ['next'],
  nuxt: ['nuxt'],
  remix: ['@remix-run/react'],
  astro: ['astro'],
  gatsby: ['gatsby'],
  sveltekit: ['@sveltejs/kit'],

  // Backend
  express: ['express'],
  fastify: ['fastify'],
  koa: ['koa'],
  hono: ['hono'],
  nestjs: ['@nestjs/core'],
  fastapi: ['fastapi'],
  django: ['django'],
  flask: ['flask'],

  // Languages
  typescript: ['typescript', '@types/node'],
  javascript: [], // Inferred from lack of typescript
  python: [],
  rust: [],
  go: [],

  // Styling
  tailwind: ['tailwindcss'],
  'styled-components': ['styled-components'],
  emotion: ['@emotion/react'],
  'css-modules': [],
  sass: ['sass', 'node-sass'],

  // State management
  redux: ['@reduxjs/toolkit', 'redux'],
  zustand: ['zustand'],
  mobx: ['mobx'],
  jotai: ['jotai'],
  recoil: ['recoil'],

  // Testing
  jest: ['jest'],
  vitest: ['vitest'],
  playwright: ['@playwright/test'],
  cypress: ['cypress'],
  testing: ['@testing-library/react'],

  // Databases
  postgres: ['pg', '@prisma/client'],
  mongodb: ['mongoose', 'mongodb'],
  supabase: ['@supabase/supabase-js'],
  firebase: ['firebase'],
  prisma: ['@prisma/client'],
  drizzle: ['drizzle-orm'],

  // Tools
  eslint: ['eslint'],
  prettier: ['prettier'],
  biome: ['@biomejs/biome'],
  turborepo: ['turbo'],
  monorepo: ['lerna', 'nx'],

  // API
  graphql: ['graphql', '@apollo/client'],
  trpc: ['@trpc/server'],
  rest: [],

  // Auth
  auth: ['next-auth', '@auth/core', 'passport'],
  'better-auth': ['better-auth'],

  // Deployment
  vercel: ['vercel'],
  docker: [],
  kubernetes: [],

  // Other
  ai: ['openai', '@anthropic-ai/sdk', 'ai'],
  shadcn: [],
  security: [],
  performance: [],
  accessibility: [],
};

/**
 * Reverse mapping: tech to tags
 */
export function getTechTags(techName: string): string[] {
  const tags: string[] = [];
  for (const [tag, techs] of Object.entries(TAG_TO_TECH)) {
    if (techs.includes(techName)) {
      tags.push(tag);
    }
  }
  return tags;
}

/**
 * Enhanced recommendation options with reasoning support
 */
export interface ReasoningRecommendOptions extends RecommendOptions {
  reasoning?: boolean;
  explainResults?: boolean;
  useTree?: boolean;
}

/**
 * Explained match details
 */
export interface ExplainedMatchDetails {
  matchedBecause: string[];
  relevantFor: string[];
  differentFrom: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Enhanced scored skill with reasoning
 */
export interface ExplainedScoredSkill extends ScoredSkill {
  explanation?: ExplainedMatchDetails;
  treePath?: string[];
  reasoningDetails?: string;
}

/**
 * Enhanced recommendation result with reasoning
 */
export interface ReasoningRecommendationResult extends RecommendationResult {
  recommendations: ExplainedScoredSkill[];
  reasoningSummary?: string;
  searchPlan?: {
    primaryCategories: string[];
    secondaryCategories: string[];
    keywords: string[];
    strategy: string;
  };
}

/**
 * Hybrid search options for RecommendationEngine
 */
export interface RecommendHybridSearchOptions extends SearchOptions {
  hybrid?: boolean;
  enableExpansion?: boolean;
  enableReranking?: boolean;
  semanticWeight?: number;
  keywordWeight?: number;
}

/**
 * Hybrid search result with additional metadata for RecommendationEngine
 */
export interface RecommendHybridSearchResult extends SearchResult {
  hybridScore?: number;
  vectorSimilarity?: number;
  keywordScore?: number;
  rrfScore?: number;
  expandedTerms?: string[];
}
