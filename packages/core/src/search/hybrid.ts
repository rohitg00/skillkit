import type { SkillSummary, SkillIndex } from '../recommend/types.js';
import type {
  HybridSearchOptions,
  HybridSearchResult,
  HybridSearchResponse,
  ExpandedQuery,
  IndexBuildCallback,
  RerankerInput,
  RerankerOutput,
  LocalModelConfig,
} from './types.js';
import { DEFAULT_HYBRID_CONFIG } from './types.js';
import { EmbeddingService, createEmbeddingService } from './embeddings.js';
import { VectorStore, createVectorStore } from './vector-store.js';
import { QueryExpander, createQueryExpander } from './expansion.js';
import { LocalModelManager } from './local-models.js';
import {
  fuseWithRRF,
  applyPositionAwareBlending,
  type RankerResult,
  type RRFInput,
} from './rrf.js';
import { RecommendationEngine } from '../recommend/engine.js';

export class HybridSearchPipeline {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private queryExpander: QueryExpander;
  private modelManager: LocalModelManager;
  private recommendationEngine: RecommendationEngine;
  private initialized = false;
  private skillsMap: Map<string, SkillSummary> = new Map();

  constructor(config: Partial<LocalModelConfig> = {}) {
    this.modelManager = new LocalModelManager(config);
    this.embeddingService = createEmbeddingService(this.modelManager);
    this.vectorStore = createVectorStore(undefined, this.embeddingService);
    this.queryExpander = createQueryExpander(this.modelManager);
    this.recommendationEngine = new RecommendationEngine();
  }

  async initialize(onProgress?: IndexBuildCallback): Promise<void> {
    if (this.initialized) return;

    await this.vectorStore.initialize();
    this.initialized = true;

    onProgress?.({
      phase: 'complete',
      current: 1,
      total: 1,
      message: 'Hybrid search pipeline initialized',
    });
  }

  async buildIndex(
    skills: SkillSummary[],
    onProgress?: IndexBuildCallback
  ): Promise<void> {
    await this.initialize(onProgress);

    this.skillsMap.clear();
    for (const skill of skills) {
      this.skillsMap.set(skill.name, skill);
    }

    const index: SkillIndex = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      skills,
      sources: [],
    };
    this.recommendationEngine.loadIndex(index);

    try {
      await this.embeddingService.initialize(onProgress);
      const embeddings = await this.embeddingService.embedSkills(skills, onProgress);
      await this.vectorStore.storeBatch(embeddings, onProgress);

      onProgress?.({
        phase: 'complete',
        current: skills.length,
        total: skills.length,
        message: `Indexed ${skills.length} skills with embeddings`,
      });
    } catch {
      // Embeddings not available - will use keyword-only search
      onProgress?.({
        phase: 'complete',
        current: skills.length,
        total: skills.length,
        message: `Indexed ${skills.length} skills (keyword-only, embeddings unavailable)`,
      });
    }
  }

  async search(options: HybridSearchOptions): Promise<HybridSearchResponse> {
    const startTime = Date.now();
    const timing: HybridSearchResponse['timing'] = { totalMs: 0 };
    const stats: HybridSearchResponse['stats'] = {
      candidatesFromVector: 0,
      candidatesFromKeyword: 0,
      totalMerged: 0,
      reranked: 0,
    };

    await this.initialize();

    const {
      query,
      limit = 10,
      enableExpansion = false,
      enableReranking = false,
      rrfK = DEFAULT_HYBRID_CONFIG.rrfK,
      positionAwareBlending = true,
    } = options;

    let expandedQuery: ExpandedQuery | undefined;
    const searchQueries: string[] = [query];

    if (enableExpansion) {
      try {
        expandedQuery = await this.queryExpander.expand(query);
        searchQueries.push(...expandedQuery.variations);
      } catch {
        expandedQuery = {
          original: query,
          variations: [],
          weights: [2.0],
        };
      }
    }

    const rankerInputs: RRFInput[] = [];

    const embeddingStart = Date.now();
    let queryVector: Float32Array | null = null;
    try {
      if (this.embeddingService.isInitialized()) {
        queryVector = await this.embeddingService.embed(query);
      }
    } catch {
    }
    timing.embeddingMs = Date.now() - embeddingStart;

    if (queryVector) {
      const vectorStart = Date.now();
      const vectorResults = await this.vectorStore.search(queryVector, limit * 3);
      timing.vectorSearchMs = Date.now() - vectorStart;

      const vectorRankerResults: RankerResult[] = vectorResults.map((r) => ({
        skillName: r.skillName,
        score: r.similarity,
      }));

      rankerInputs.push({
        source: 'vector',
        results: vectorRankerResults,
      });

      stats.candidatesFromVector = vectorResults.length;
    }

    const keywordStart = Date.now();
    const keywordResults: RankerResult[] = [];

    for (let i = 0; i < searchQueries.length; i++) {
      const searchQuery = searchQueries[i];
      const weight = expandedQuery?.weights[i] ?? 1;

      const results = this.recommendationEngine.search({
        query: searchQuery,
        limit: limit * 3,
        semantic: true,
      });

      for (const result of results) {
        const existing = keywordResults.find(
          (r) => r.skillName === result.skill.name
        );
        if (existing) {
          existing.score = Math.max(existing.score, result.relevance * weight);
        } else {
          keywordResults.push({
            skillName: result.skill.name,
            score: result.relevance * weight,
          });
        }
      }
    }

    timing.keywordSearchMs = Date.now() - keywordStart;

    rankerInputs.push({
      source: 'keyword',
      results: keywordResults,
    });

    stats.candidatesFromKeyword = keywordResults.length;

    const fusionStart = Date.now();
    const rrfRankings = fuseWithRRF(rankerInputs, rrfK);
    timing.fusionMs = Date.now() - fusionStart;

    stats.totalMerged = rrfRankings.length;

    let finalScores = new Map<string, number>();
    for (const ranking of rrfRankings) {
      finalScores.set(ranking.skillName, ranking.rrfScore);
    }

    if (enableReranking && rrfRankings.length > 0) {
      const rerankStart = Date.now();
      const topCandidates = rrfRankings.slice(0, DEFAULT_HYBRID_CONFIG.rerankTopN);

      const rerankerInputs: RerankerInput[] = topCandidates
        .map((r) => {
          const skill = this.skillsMap.get(r.skillName);
          if (!skill) return null;
          return {
            query,
            skillName: r.skillName,
            skillDescription: skill.description ?? '',
            skillTags: skill.tags ?? [],
          };
        })
        .filter((r): r is RerankerInput => r !== null);

      const rerankerOutputs = await this.rerank(rerankerInputs);
      timing.rerankingMs = Date.now() - rerankStart;
      stats.reranked = rerankerOutputs.length;

      if (positionAwareBlending && rerankerOutputs.length > 0) {
        const retrievalScores = new Map<string, number>();
        const maxRrfScore = Math.max(...rrfRankings.map((r) => r.rrfScore));
        for (const ranking of topCandidates) {
          retrievalScores.set(
            ranking.skillName,
            ranking.rrfScore / (maxRrfScore || 1)
          );
        }

        const rerankerScores = new Map<string, number>();
        const maxRerankerScore = Math.max(...rerankerOutputs.map((r) => r.score));
        for (const output of rerankerOutputs) {
          rerankerScores.set(
            output.skillName,
            output.score / (maxRerankerScore || 1)
          );
        }

        const sortedSkillNames = topCandidates.map((r) => r.skillName);
        const blendedScores = applyPositionAwareBlending(
          retrievalScores,
          rerankerScores,
          sortedSkillNames
        );

        for (const [skillName, score] of blendedScores) {
          finalScores.set(skillName, score);
        }
      }
    }

    const sortedResults = Array.from(finalScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const vectorInput = rankerInputs.find((r) => r.source === 'vector');
    const keywordInput = rankerInputs.find((r) => r.source === 'keyword');

    const hybridResults: HybridSearchResult[] = [];

    for (const [skillName, hybridScore] of sortedResults) {
      const skill = this.skillsMap.get(skillName);
      if (!skill) continue;

      hybridResults.push({
        skill,
        relevance: Math.round(hybridScore * 100),
        hybridScore,
        vectorSimilarity: vectorInput?.results.find((r) => r.skillName === skillName)?.score,
        keywordScore: keywordInput?.results.find((r) => r.skillName === skillName)?.score,
        rrfScore: rrfRankings.find((r) => r.skillName === skillName)?.rrfScore,
        matchedTerms: [],
        expandedTerms: expandedQuery?.variations,
      });
    }

    timing.totalMs = Date.now() - startTime;

    return {
      results: hybridResults,
      query: {
        original: query,
        expanded: expandedQuery,
      },
      timing,
      stats,
    };
  }

  private async rerank(inputs: RerankerInput[]): Promise<RerankerOutput[]> {
    const outputs: RerankerOutput[] = [];

    for (const input of inputs) {
      const baseScore =
        (input.skillDescription.toLowerCase().includes(input.query.toLowerCase())
          ? 0.5
          : 0) +
        (input.skillTags.some((t) =>
          t.toLowerCase().includes(input.query.toLowerCase())
        )
          ? 0.3
          : 0) +
        (input.skillName.toLowerCase().includes(input.query.toLowerCase())
          ? 0.2
          : 0);

      outputs.push({
        skillName: input.skillName,
        score: Math.min(1, baseScore + 0.3),
      });
    }

    return outputs;
  }

  loadSkillsIndex(index: SkillIndex): void {
    this.skillsMap.clear();
    for (const skill of index.skills) {
      this.skillsMap.set(skill.name, skill);
    }
    this.recommendationEngine.loadIndex(index);
  }

  getStats(): {
    vectorStore: ReturnType<VectorStore['getStats']>;
    initialized: boolean;
    skillCount: number;
  } {
    return {
      vectorStore: this.vectorStore.getStats(),
      initialized: this.initialized,
      skillCount: this.skillsMap.size,
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.embeddingService.dispose();
    await this.queryExpander.dispose();
    await this.vectorStore.close();
    this.initialized = false;
  }
}

export function createHybridSearchPipeline(
  config?: Partial<LocalModelConfig>
): HybridSearchPipeline {
  return new HybridSearchPipeline(config);
}

export async function hybridSearch(
  skills: SkillSummary[],
  query: string,
  options: Partial<HybridSearchOptions> = {}
): Promise<HybridSearchResponse> {
  const pipeline = createHybridSearchPipeline();

  try {
    await pipeline.buildIndex(skills);

    return await pipeline.search({
      query,
      ...options,
    });
  } finally {
    await pipeline.dispose();
  }
}
