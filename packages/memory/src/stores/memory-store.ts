import { randomUUID } from 'node:crypto';
import { CozoAdapter } from '../database/cozo-adapter.js';
import { encode } from '../embeddings/encoder.js';
import type {
  PersistentMemory,
  MemoryCreateInput,
  MemoryUpdateInput,
  MemoryCategory,
  MemoryTier,
  MemoryLink,
  MemoryStats,
  MemorySearchResult,
  MemorySearchOptions,
} from '../types.js';
import { SemanticSearch } from '../embeddings/search.js';

export class MemoryStore {
  private adapter: CozoAdapter;
  private search: SemanticSearch;

  constructor(agentId: string, dbPath?: string) {
    this.adapter = new CozoAdapter({ agentId, dbPath });
    this.search = new SemanticSearch(this.adapter);
  }

  async initialize(): Promise<void> {
    await this.adapter.initialize();
  }

  async close(): Promise<void> {
    await this.adapter.close();
  }

  async create(input: MemoryCreateInput): Promise<PersistentMemory> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const embedding = await encode(input.content);

    await this.adapter.insertMemory(
      id,
      input.agentId,
      input.category,
      input.tier ?? 'warm',
      input.content,
      1.0,
      now,
      now,
      0,
      now,
      input.tags ?? [],
      input.metadata ?? {}
    );

    await this.adapter.insertEmbedding(id, embedding);

    return {
      id,
      agentId: input.agentId,
      category: input.category,
      tier: input.tier ?? 'warm',
      content: input.content,
      embedding,
      reinforcementScore: 1.0,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      lastAccessedAt: now,
      tags: input.tags ?? [],
      metadata: input.metadata ?? {},
    };
  }

  async get(id: string): Promise<PersistentMemory | null> {
    const row = await this.adapter.getMemory(id);
    if (!row) return null;

    await this.adapter.updateMemory(id, {
      accessCount: row.accessCount + 1,
      lastAccessedAt: new Date().toISOString(),
    });

    return {
      id: row.id,
      agentId: row.agentId,
      category: row.category as MemoryCategory,
      tier: row.tier as MemoryTier,
      content: row.content,
      embedding: [],
      reinforcementScore: row.reinforcementScore,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      accessCount: row.accessCount + 1,
      lastAccessedAt: new Date().toISOString(),
      tags: row.tags,
      metadata: row.metadata,
    };
  }

  async update(id: string, input: MemoryUpdateInput): Promise<PersistentMemory> {
    const existing = await this.adapter.getMemory(id);
    if (!existing) {
      throw new Error(`Memory ${id} not found`);
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.category) updates.category = input.category;
    if (input.tier) updates.tier = input.tier;
    if (input.tags) updates.tags = input.tags;
    if (input.metadata) updates.metadata = input.metadata;

    if (input.content && input.content !== existing.content) {
      updates.content = input.content;
      const embedding = await encode(input.content);
      await this.adapter.insertEmbedding(id, embedding);
    }

    await this.adapter.updateMemory(id, updates as any);

    const updated = await this.adapter.getMemory(id);
    if (!updated) {
      throw new Error(`Failed to update memory ${id}`);
    }

    return {
      id: updated.id,
      agentId: updated.agentId,
      category: updated.category as MemoryCategory,
      tier: updated.tier as MemoryTier,
      content: updated.content,
      embedding: [],
      reinforcementScore: updated.reinforcementScore,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      accessCount: updated.accessCount,
      lastAccessedAt: updated.lastAccessedAt,
      tags: updated.tags,
      metadata: updated.metadata,
    };
  }

  async delete(id: string): Promise<void> {
    await this.adapter.deleteMemory(id);
  }

  async list(agentId: string, limit = 100): Promise<PersistentMemory[]> {
    const rows = await this.adapter.getMemoriesByAgent(agentId, limit);

    return rows.map(row => ({
      id: row.id,
      agentId: row.agentId,
      category: row.category as MemoryCategory,
      tier: row.tier as MemoryTier,
      content: row.content,
      embedding: [],
      reinforcementScore: row.reinforcementScore,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      accessCount: row.accessCount,
      lastAccessedAt: row.lastAccessedAt,
      tags: row.tags,
      metadata: row.metadata,
    }));
  }

  async semanticSearch(
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    return this.search.search(query, options);
  }

  async findSimilar(memoryId: string, limit = 5): Promise<MemorySearchResult[]> {
    return this.search.findSimilar(memoryId, limit);
  }

  async reinforce(id: string, amount = 0.1): Promise<PersistentMemory> {
    const existing = await this.adapter.getMemory(id);
    if (!existing) {
      throw new Error(`Memory ${id} not found`);
    }

    const newScore = Math.min(1, existing.reinforcementScore + amount);

    await this.adapter.updateMemory(id, {
      reinforcementScore: newScore,
      updatedAt: new Date().toISOString(),
    });

    return this.get(id) as Promise<PersistentMemory>;
  }

  async weaken(id: string, amount = 0.1): Promise<PersistentMemory> {
    const existing = await this.adapter.getMemory(id);
    if (!existing) {
      throw new Error(`Memory ${id} not found`);
    }

    const newScore = Math.max(0, existing.reinforcementScore - amount);

    await this.adapter.updateMemory(id, {
      reinforcementScore: newScore,
      updatedAt: new Date().toISOString(),
    });

    return this.get(id) as Promise<PersistentMemory>;
  }

  async link(
    sourceId: string,
    targetId: string,
    relationshipType: MemoryLink['relationshipType'],
    strength = 1.0
  ): Promise<MemoryLink> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await this.adapter.insertLink(id, sourceId, targetId, relationshipType, strength, now);

    return {
      id,
      sourceId,
      targetId,
      relationshipType,
      strength,
      createdAt: now,
    };
  }

  async getLinks(memoryId: string): Promise<MemoryLink[]> {
    const rows = await this.adapter.getLinks(memoryId);

    return rows.map(row => ({
      id: row.id,
      sourceId: row.sourceId,
      targetId: row.targetId,
      relationshipType: row.relationshipType as MemoryLink['relationshipType'],
      strength: row.strength,
      createdAt: row.createdAt,
    }));
  }

  async getStats(agentId?: string): Promise<MemoryStats> {
    const stats = await this.adapter.getStats(agentId);

    const byCategory: Record<MemoryCategory, number> = {
      fact: stats.byCategory.fact ?? 0,
      decision: stats.byCategory.decision ?? 0,
      preference: stats.byCategory.preference ?? 0,
      pattern: stats.byCategory.pattern ?? 0,
      insight: stats.byCategory.insight ?? 0,
      reasoning: stats.byCategory.reasoning ?? 0,
    };

    const byTier: Record<MemoryTier, number> = {
      warm: stats.byTier.warm ?? 0,
      long: stats.byTier.long ?? 0,
    };

    return {
      totalMemories: stats.total,
      byCategory,
      byTier,
      avgReinforcementScore: 0,
      oldestMemory: null,
      newestMemory: null,
    };
  }

  async promoteToLongTerm(id: string): Promise<PersistentMemory> {
    return this.update(id, { tier: 'long' });
  }

  async demoteToWarm(id: string): Promise<PersistentMemory> {
    return this.update(id, { tier: 'warm' });
  }

  get isInitialized(): boolean {
    return this.adapter.isInitialized;
  }

  get dbPath(): string {
    return this.adapter.path;
  }
}
