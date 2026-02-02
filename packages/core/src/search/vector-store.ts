import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type {
  SkillEmbedding,
  VectorSearchResult,
  VectorStoreConfig,
  EmbeddingServiceStats,
  IndexBuildCallback,
} from './types.js';
import { EmbeddingService } from './embeddings.js';

const DEFAULT_DB_PATH = path.join(os.homedir(), '.skillkit', 'search.db');
const DEFAULT_TABLE_NAME = 'skill_embeddings';
const DEFAULT_DIMENSIONS = 768;

export class VectorStore {
  private config: Required<VectorStoreConfig>;
  private db: unknown = null;
  private initialized = false;
  private usingSqliteVec = false;
  private embeddings: Map<string, SkillEmbedding> = new Map();
  private embeddingService: EmbeddingService;

  constructor(config: Partial<VectorStoreConfig> = {}, embeddingService?: EmbeddingService) {
    this.config = {
      dbPath: config.dbPath ?? DEFAULT_DB_PATH,
      tableName: config.tableName ?? DEFAULT_TABLE_NAME,
      dimensions: config.dimensions ?? DEFAULT_DIMENSIONS,
    };
    this.embeddingService = embeddingService ?? new EmbeddingService();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const dbDir = path.dirname(this.config.dbPath);
    if (!fs.existsSync(dbDir)) {
      await fs.promises.mkdir(dbDir, { recursive: true });
    }

    try {
      // @ts-expect-error - better-sqlite3 is an optional dependency
      const BetterSqlite3Module = await import('better-sqlite3');
      const BetterSqlite3 = BetterSqlite3Module.default || BetterSqlite3Module;
      this.db = new BetterSqlite3(this.config.dbPath);

      try {
        // @ts-expect-error - sqlite-vec is an optional dependency
        const sqliteVec = await import('sqlite-vec');
        sqliteVec.load(this.db);
        this.usingSqliteVec = true;
        await this.initializeSqliteVecTables();
      } catch {
        this.usingSqliteVec = false;
        await this.initializeFallbackTables();
      }

      await this.loadEmbeddingsFromDb();
      this.initialized = true;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Cannot find package 'better-sqlite3'") ||
          error.message.includes("Cannot find module 'better-sqlite3'"))
      ) {
        this.initialized = true;
        this.usingSqliteVec = false;
        return;
      }
      throw error;
    }
  }

  private async initializeSqliteVecTables(): Promise<void> {
    const db = this.db as {
      exec(sql: string): void;
      prepare(sql: string): { run(...args: unknown[]): void };
    };

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName}_meta (
        skill_name TEXT PRIMARY KEY,
        text_content TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        chunk_count INTEGER DEFAULT 0
      )
    `);

    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS ${this.config.tableName}_vec USING vec0(
        skill_name TEXT PRIMARY KEY,
        embedding float[${this.config.dimensions}]
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName}_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL,
        content TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        FOREIGN KEY (skill_name) REFERENCES ${this.config.tableName}_meta(skill_name)
      )
    `);

    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS ${this.config.tableName}_chunks_vec USING vec0(
        chunk_id INTEGER PRIMARY KEY,
        embedding float[${this.config.dimensions}]
      )
    `);
  }

  private async initializeFallbackTables(): Promise<void> {
    const db = this.db as { exec(sql: string): void };

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        skill_name TEXT PRIMARY KEY,
        text_content TEXT NOT NULL,
        vector BLOB NOT NULL,
        generated_at TEXT NOT NULL
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.config.tableName}_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL,
        content TEXT NOT NULL,
        vector BLOB NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_skill
      ON ${this.config.tableName}_chunks(skill_name)
    `);
  }

  private async loadEmbeddingsFromDb(): Promise<void> {
    if (!this.db) return;

    const db = this.db as {
      prepare(sql: string): { all(): Array<{
        skill_name: string;
        text_content: string;
        vector?: Buffer;
        generated_at: string;
      }> };
    };

    try {
      if (this.usingSqliteVec) {
        const rows = db.prepare(`
          SELECT skill_name, text_content, generated_at
          FROM ${this.config.tableName}_meta
        `).all();

        for (const row of rows) {
          this.embeddings.set(row.skill_name, {
            skillName: row.skill_name,
            textContent: row.text_content,
            vector: new Float32Array(this.config.dimensions),
            generatedAt: row.generated_at,
          });
        }
      } else {
        const rows = db.prepare(`
          SELECT skill_name, text_content, vector, generated_at
          FROM ${this.config.tableName}
        `).all();

        for (const row of rows) {
          if (row.vector) {
            this.embeddings.set(row.skill_name, {
              skillName: row.skill_name,
              textContent: row.text_content,
              vector: new Float32Array(row.vector.buffer),
              generatedAt: row.generated_at,
            });
          }
        }
      }
    } catch {
    }
  }

  async store(embedding: SkillEmbedding): Promise<void> {
    await this.initialize();
    this.embeddings.set(embedding.skillName, embedding);

    if (!this.db) return;

    const db = this.db as {
      prepare(sql: string): {
        run(...args: unknown[]): { lastInsertRowid?: number };
      };
    };

    if (this.usingSqliteVec) {
      db.prepare(`
        INSERT OR REPLACE INTO ${this.config.tableName}_meta
        (skill_name, text_content, generated_at, chunk_count)
        VALUES (?, ?, ?, ?)
      `).run(
        embedding.skillName,
        embedding.textContent,
        embedding.generatedAt,
        embedding.chunks?.length ?? 0
      );

      db.prepare(`
        INSERT OR REPLACE INTO ${this.config.tableName}_vec
        (skill_name, embedding)
        VALUES (?, ?)
      `).run(embedding.skillName, Buffer.from(embedding.vector.buffer));

      if (embedding.chunks) {
        db.prepare(`
          DELETE FROM ${this.config.tableName}_chunks WHERE skill_name = ?
        `).run(embedding.skillName);

        for (const chunk of embedding.chunks) {
          const result = db.prepare(`
            INSERT INTO ${this.config.tableName}_chunks
            (skill_name, content, start_line, end_line)
            VALUES (?, ?, ?, ?)
          `).run(embedding.skillName, chunk.content, chunk.startLine, chunk.endLine);

          const rowId = result.lastInsertRowid ?? 0;
          db.prepare(`
            INSERT INTO ${this.config.tableName}_chunks_vec
            (chunk_id, embedding)
            VALUES (?, ?)
          `).run(rowId, Buffer.from(chunk.vector.buffer));
        }
      }
    } else {
      db.prepare(`
        INSERT OR REPLACE INTO ${this.config.tableName}
        (skill_name, text_content, vector, generated_at)
        VALUES (?, ?, ?, ?)
      `).run(
        embedding.skillName,
        embedding.textContent,
        Buffer.from(embedding.vector.buffer),
        embedding.generatedAt
      );

      if (embedding.chunks) {
        db.prepare(`
          DELETE FROM ${this.config.tableName}_chunks WHERE skill_name = ?
        `).run(embedding.skillName);

        for (const chunk of embedding.chunks) {
          db.prepare(`
            INSERT INTO ${this.config.tableName}_chunks
            (skill_name, content, vector, start_line, end_line)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            embedding.skillName,
            chunk.content,
            Buffer.from(chunk.vector.buffer),
            chunk.startLine,
            chunk.endLine
          );
        }
      }
    }
  }

  async storeBatch(
    embeddings: SkillEmbedding[],
    onProgress?: IndexBuildCallback
  ): Promise<void> {
    await this.initialize();

    const total = embeddings.length;
    for (let i = 0; i < embeddings.length; i++) {
      const embedding = embeddings[i];

      onProgress?.({
        phase: 'storing',
        current: i + 1,
        total,
        skillName: embedding.skillName,
        message: `Storing embedding ${i + 1}/${total}: ${embedding.skillName}`,
      });

      await this.store(embedding);
    }

    onProgress?.({
      phase: 'complete',
      current: total,
      total,
      message: `Stored ${total} embeddings`,
    });
  }

  async search(
    queryVector: Float32Array,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    await this.initialize();

    if (this.usingSqliteVec && this.db) {
      return this.searchWithSqliteVec(queryVector, limit);
    }

    return this.searchInMemory(queryVector, limit);
  }

  private async searchWithSqliteVec(
    queryVector: Float32Array,
    limit: number
  ): Promise<VectorSearchResult[]> {
    const db = this.db as {
      prepare(sql: string): {
        all(...args: unknown[]): Array<{ skill_name: string; distance: number }>;
      };
    };

    const rows = db.prepare(`
      SELECT skill_name, distance
      FROM ${this.config.tableName}_vec
      WHERE embedding MATCH ?
      ORDER BY distance
      LIMIT ?
    `).all(Buffer.from(queryVector.buffer), limit);

    return rows.map((row) => ({
      skillName: row.skill_name,
      similarity: 1 - row.distance,
    }));
  }

  private searchInMemory(
    queryVector: Float32Array,
    limit: number
  ): VectorSearchResult[] {
    const results: VectorSearchResult[] = [];

    for (const [skillName, embedding] of this.embeddings) {
      const similarity = this.embeddingService.cosineSimilarity(queryVector, embedding.vector);
      results.push({ skillName, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  async searchChunks(
    queryVector: Float32Array,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    await this.initialize();

    const results: VectorSearchResult[] = [];

    for (const [skillName, embedding] of this.embeddings) {
      if (!embedding.chunks || embedding.chunks.length === 0) {
        const similarity = this.embeddingService.cosineSimilarity(queryVector, embedding.vector);
        results.push({ skillName, similarity });
        continue;
      }

      let bestChunk: { similarity: number; content: string; startLine: number } | null = null;

      for (const chunk of embedding.chunks) {
        const similarity = this.embeddingService.cosineSimilarity(queryVector, chunk.vector);
        if (!bestChunk || similarity > bestChunk.similarity) {
          bestChunk = {
            similarity,
            content: chunk.content,
            startLine: chunk.startLine,
          };
        }
      }

      if (bestChunk) {
        results.push({
          skillName,
          similarity: bestChunk.similarity,
          matchedChunk: {
            content: bestChunk.content,
            startLine: bestChunk.startLine,
          },
        });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  has(skillName: string): boolean {
    return this.embeddings.has(skillName);
  }

  get(skillName: string): SkillEmbedding | undefined {
    return this.embeddings.get(skillName);
  }

  async delete(skillName: string): Promise<void> {
    await this.initialize();
    this.embeddings.delete(skillName);

    if (!this.db) return;

    const db = this.db as {
      prepare(sql: string): { run(...args: unknown[]): void };
    };

    if (this.usingSqliteVec) {
      db.prepare(`DELETE FROM ${this.config.tableName}_meta WHERE skill_name = ?`).run(skillName);
      db.prepare(`DELETE FROM ${this.config.tableName}_vec WHERE skill_name = ?`).run(skillName);
    } else {
      db.prepare(`DELETE FROM ${this.config.tableName} WHERE skill_name = ?`).run(skillName);
    }

    db.prepare(`DELETE FROM ${this.config.tableName}_chunks WHERE skill_name = ?`).run(skillName);
  }

  async clear(): Promise<void> {
    await this.initialize();
    this.embeddings.clear();

    if (!this.db) return;

    const db = this.db as { exec(sql: string): void };

    if (this.usingSqliteVec) {
      db.exec(`DELETE FROM ${this.config.tableName}_meta`);
      db.exec(`DELETE FROM ${this.config.tableName}_vec`);
    } else {
      db.exec(`DELETE FROM ${this.config.tableName}`);
    }

    db.exec(`DELETE FROM ${this.config.tableName}_chunks`);
  }

  getStats(): EmbeddingServiceStats {
    let indexSizeBytes = 0;
    let totalChunks = 0;

    for (const embedding of this.embeddings.values()) {
      indexSizeBytes += embedding.vector.byteLength;
      indexSizeBytes += embedding.textContent.length * 2;
      if (embedding.chunks) {
        totalChunks += embedding.chunks.length;
        for (const chunk of embedding.chunks) {
          indexSizeBytes += chunk.vector.byteLength;
          indexSizeBytes += chunk.content.length * 2;
        }
      }
    }

    return {
      totalSkillsIndexed: this.embeddings.size,
      totalChunks,
      indexSizeBytes,
      lastIndexedAt: new Date().toISOString(),
      modelName: 'nomic-embed-text-v1.5',
      embeddingDimensions: this.config.dimensions,
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isUsingSqliteVec(): boolean {
    return this.usingSqliteVec;
  }

  getEmbeddingCount(): number {
    return this.embeddings.size;
  }

  async close(): Promise<void> {
    if (this.db && typeof (this.db as { close?: () => void }).close === 'function') {
      (this.db as { close: () => void }).close();
    }
    this.db = null;
    this.initialized = false;
  }
}

export function createVectorStore(
  config?: Partial<VectorStoreConfig>,
  embeddingService?: EmbeddingService
): VectorStore {
  return new VectorStore(config, embeddingService);
}
