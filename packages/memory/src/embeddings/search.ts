import type { CozoAdapter } from '../database/cozo-adapter.js';
import type { PersistentMemory, MemorySearchOptions, MemorySearchResult } from '../types.js';
import { encode } from './encoder.js';

export interface SemanticSearchOptions extends MemorySearchOptions {
  minScore?: number;
  includeSimilar?: boolean;
  maxSimilarPerResult?: number;
}

export class SemanticSearch {
  constructor(private adapter: CozoAdapter) {}

  async search(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    const {
      agentId,
      category,
      tier,
      limit = 10,
      threshold = 0.5,
      minScore = 0,
    } = options;

    const queryEmbedding = await encode(query);

    const results = await this.adapter.semanticSearch(
      queryEmbedding,
      limit * 5,
      agentId,
      category,
      tier
    );

    const searchResults: MemorySearchResult[] = [];

    for (const { id, score } of results) {
      if (score < Math.max(threshold, minScore)) continue;
      if (searchResults.length >= limit) break;

      const memory = await this.adapter.getMemory(id);
      if (!memory) continue;

      if (agentId && memory.agentId !== agentId) continue;
      if (category && memory.category !== category) continue;
      if (tier && memory.tier !== tier) continue;

      searchResults.push({
        memory: this.rowToMemory(memory),
        score,
      });
    }

    return searchResults;
  }

  async findSimilar(
    memoryId: string,
    limit = 5,
    excludeSelf = true
  ): Promise<MemorySearchResult[]> {
    const memory = await this.adapter.getMemory(memoryId);
    if (!memory) {
      throw new Error(`Memory ${memoryId} not found`);
    }

    const embedding = await encode(memory.content);

    const results = await this.adapter.semanticSearch(
      embedding,
      limit + (excludeSelf ? 1 : 0),
      memory.agentId
    );

    const searchResults: MemorySearchResult[] = [];

    for (const { id, score } of results) {
      if (excludeSelf && id === memoryId) continue;
      if (searchResults.length >= limit) break;

      const similarMemory = await this.adapter.getMemory(id);
      if (!similarMemory) continue;

      searchResults.push({
        memory: this.rowToMemory(similarMemory),
        score,
      });
    }

    return searchResults;
  }

  async searchByCategory(
    query: string,
    category: string,
    limit = 10
  ): Promise<MemorySearchResult[]> {
    return this.search(query, { category: category as any, limit });
  }

  async searchByTier(
    query: string,
    tier: 'warm' | 'long',
    limit = 10
  ): Promise<MemorySearchResult[]> {
    return this.search(query, { tier, limit });
  }

  async hybridSearch(
    query: string,
    keywords: string[],
    options: SemanticSearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    const semanticResults = await this.search(query, {
      ...options,
      limit: (options.limit ?? 10) * 2,
    });

    const scoredResults = semanticResults.map(result => {
      let keywordBoost = 0;
      const contentLower = result.memory.content.toLowerCase();

      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          keywordBoost += 0.1;
        }
      }

      return {
        ...result,
        score: Math.min(1, result.score + keywordBoost),
      };
    });

    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.slice(0, options.limit ?? 10);
  }

  private rowToMemory(row: any): PersistentMemory {
    return {
      id: row.id,
      agentId: row.agentId,
      category: row.category as PersistentMemory['category'],
      tier: row.tier as PersistentMemory['tier'],
      content: row.content,
      embedding: row.embedding || [],
      reinforcementScore: row.reinforcementScore,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      accessCount: row.accessCount,
      lastAccessedAt: row.lastAccessedAt,
      tags: row.tags,
      metadata: row.metadata,
    };
  }
}

export async function quickSearch(
  adapter: CozoAdapter,
  query: string,
  options: SemanticSearchOptions = {}
): Promise<MemorySearchResult[]> {
  const search = new SemanticSearch(adapter);
  return search.search(query, options);
}
