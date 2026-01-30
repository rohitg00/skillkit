import { CozoDb } from 'cozo-node';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { initializeSchema, dropSchema } from './schema.js';

export interface CozoAdapterOptions {
  agentId: string;
  dbPath?: string;
}

export class CozoAdapter {
  private db: CozoDb | null = null;
  private dbPath: string;
  private initialized = false;

  constructor(options: CozoAdapterOptions) {
    this.dbPath = options.dbPath ?? this.getDefaultDbPath(options.agentId);
  }

  private getDefaultDbPath(agentId: string): string {
    return join(homedir(), '.skillkit', 'agents', agentId, 'memory.db');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await mkdir(dirname(this.dbPath), { recursive: true });

    this.db = new CozoDb('rocksdb', this.dbPath);
    await initializeSchema(this.db);
    this.initialized = true;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  async reset(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await dropSchema(this.db);
    await initializeSchema(this.db);
  }

  async run(query: string, params?: Record<string, unknown>): Promise<CozoResult> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(query, params);
    return {
      headers: result.headers,
      rows: result.rows,
      ok: result.ok,
    };
  }

  async insertMemory(
    id: string,
    agentId: string,
    category: string,
    tier: string,
    content: string,
    reinforcementScore: number,
    createdAt: string,
    updatedAt: string,
    accessCount: number,
    lastAccessedAt: string,
    tags: string[],
    metadata: Record<string, unknown>
  ): Promise<void> {
    const query = `
      ?[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata] <- [[
        $id, $agent_id, $category, $tier, $content, $reinforcement_score, $created_at, $updated_at, $access_count, $last_accessed_at, $tags, $metadata
      ]]
      :put memories {
        id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata
      }
    `;

    await this.run(query, {
      id,
      agent_id: agentId,
      category,
      tier,
      content,
      reinforcement_score: reinforcementScore,
      created_at: createdAt,
      updated_at: updatedAt,
      access_count: accessCount,
      last_accessed_at: lastAccessedAt,
      tags,
      metadata: JSON.stringify(metadata),
    });
  }

  async insertEmbedding(id: string, embedding: number[]): Promise<void> {
    const query = `
      ?[id, embedding] <- [[$id, $embedding]]
      :put memory_vec { id, embedding }
    `;

    await this.run(query, { id, embedding });
  }

  async getMemory(id: string): Promise<MemoryRow | null> {
    const query = `
      ?[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata] :=
        *memories[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata],
        id == $id
    `;

    const result = await this.run(query, { id });
    if (result.rows.length === 0) return null;

    return this.rowToMemory(result.rows[0]);
  }

  async getMemoriesByAgent(agentId: string, limit = 100): Promise<MemoryRow[]> {
    const query = `
      ?[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata] :=
        *memories[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata],
        agent_id == $agent_id
      :limit $limit
    `;

    const result = await this.run(query, { agent_id: agentId, limit });
    return result.rows.map(row => this.rowToMemory(row));
  }

  async updateMemory(
    id: string,
    updates: Partial<{
      category: string;
      tier: string;
      content: string;
      reinforcementScore: number;
      updatedAt: string;
      accessCount: number;
      lastAccessedAt: string;
      tags: string[];
      metadata: Record<string, unknown>;
    }>
  ): Promise<void> {
    const existing = await this.getMemory(id);
    if (!existing) throw new Error(`Memory ${id} not found`);

    const query = `
      ?[id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata] <- [[
        $id, $agent_id, $category, $tier, $content, $reinforcement_score, $created_at, $updated_at, $access_count, $last_accessed_at, $tags, $metadata
      ]]
      :put memories {
        id, agent_id, category, tier, content, reinforcement_score, created_at, updated_at, access_count, last_accessed_at, tags, metadata
      }
    `;

    await this.run(query, {
      id,
      agent_id: existing.agentId,
      category: updates.category ?? existing.category,
      tier: updates.tier ?? existing.tier,
      content: updates.content ?? existing.content,
      reinforcement_score: updates.reinforcementScore ?? existing.reinforcementScore,
      created_at: existing.createdAt,
      updated_at: updates.updatedAt ?? new Date().toISOString(),
      access_count: updates.accessCount ?? existing.accessCount,
      last_accessed_at: updates.lastAccessedAt ?? existing.lastAccessedAt,
      tags: updates.tags ?? existing.tags,
      metadata: JSON.stringify(updates.metadata ?? existing.metadata),
    });
  }

  async deleteMemory(id: string): Promise<void> {
    const deleteMemory = `
      ?[id] <- [[$id]]
      :rm memories { id }
    `;
    const deleteEmbedding = `
      ?[id] <- [[$id]]
      :rm memory_vec { id }
    `;

    await this.run(deleteMemory, { id });
    await this.run(deleteEmbedding, { id });
  }

  async semanticSearch(
    embedding: number[],
    limit = 10,
    _agentId?: string,
    _category?: string,
    _tier?: string
  ): Promise<Array<{ id: string; score: number }>> {
    const params: Record<string, unknown> = { embedding, limit };

    const query = `
      ?[id, score] := ~memory_vec:embedding_idx{ id, embedding |
        query: $embedding,
        k: $limit,
        ef: 50
      }, score = cos_dist(embedding, $embedding)
      :order score
      :limit $limit
    `;

    const result = await this.run(query, params);
    return result.rows.map(row => ({
      id: row[0] as string,
      score: 1 - (row[1] as number),
    }));
  }

  async insertLink(
    id: string,
    sourceId: string,
    targetId: string,
    relationshipType: string,
    strength: number,
    createdAt: string
  ): Promise<void> {
    const query = `
      ?[id, source_id, target_id, relationship_type, strength, created_at] <- [[
        $id, $source_id, $target_id, $relationship_type, $strength, $created_at
      ]]
      :put memory_links { id, source_id, target_id, relationship_type, strength, created_at }
    `;

    await this.run(query, {
      id,
      source_id: sourceId,
      target_id: targetId,
      relationship_type: relationshipType,
      strength,
      created_at: createdAt,
    });
  }

  async getLinks(memoryId: string): Promise<LinkRow[]> {
    const query = `
      ?[id, source_id, target_id, relationship_type, strength, created_at] :=
        *memory_links[id, source_id, target_id, relationship_type, strength, created_at],
        or(source_id == $memory_id, target_id == $memory_id)
    `;

    const result = await this.run(query, { memory_id: memoryId });
    return result.rows.map(row => ({
      id: row[0] as string,
      sourceId: row[1] as string,
      targetId: row[2] as string,
      relationshipType: row[3] as string,
      strength: row[4] as number,
      createdAt: row[5] as string,
    }));
  }

  async getStats(agentId?: string): Promise<StatsRow> {
    let condition = '';
    const params: Record<string, unknown> = {};

    if (agentId) {
      condition = ', agent_id == $agent_id';
      params.agent_id = agentId;
    }

    const countQuery = `
      ?[count(id)] := *memories[id, agent_id, _, _, _, _, _, _, _, _, _, _]${condition}
    `;
    const countResult = await this.run(countQuery, params);
    const total = countResult.rows[0]?.[0] as number ?? 0;

    const categoryQuery = `
      ?[category, count(id)] := *memories[id, agent_id, category, _, _, _, _, _, _, _, _, _]${condition}
    `;
    const categoryResult = await this.run(categoryQuery, params);
    const byCategory: Record<string, number> = {};
    for (const row of categoryResult.rows) {
      byCategory[row[0] as string] = row[1] as number;
    }

    const tierQuery = `
      ?[tier, count(id)] := *memories[id, agent_id, _, tier, _, _, _, _, _, _, _, _]${condition}
    `;
    const tierResult = await this.run(tierQuery, params);
    const byTier: Record<string, number> = {};
    for (const row of tierResult.rows) {
      byTier[row[0] as string] = row[1] as number;
    }

    return {
      total,
      byCategory,
      byTier,
    };
  }

  private rowToMemory(row: unknown[]): MemoryRow {
    return {
      id: row[0] as string,
      agentId: row[1] as string,
      category: row[2] as string,
      tier: row[3] as string,
      content: row[4] as string,
      reinforcementScore: row[5] as number,
      createdAt: row[6] as string,
      updatedAt: row[7] as string,
      accessCount: row[8] as number,
      lastAccessedAt: row[9] as string,
      tags: row[10] as string[],
      metadata: JSON.parse(row[11] as string),
    };
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get path(): string {
    return this.dbPath;
  }
}

export interface CozoResult {
  headers: string[];
  rows: unknown[][];
  ok: boolean;
}

export interface MemoryRow {
  id: string;
  agentId: string;
  category: string;
  tier: string;
  content: string;
  reinforcementScore: number;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessedAt: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface LinkRow {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  createdAt: string;
}

export interface StatsRow {
  total: number;
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
}
