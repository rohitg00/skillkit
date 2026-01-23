import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { randomUUID } from 'node:crypto';
import type {
  Observation,
  ObservationContent,
  ObservationStoreData,
  ObservationType,
} from './types.js';
import type { AgentType } from '../types.js';

export class ObservationStore {
  private readonly filePath: string;
  private data: ObservationStoreData | null = null;
  private sessionId: string;

  constructor(projectPath: string, sessionId?: string) {
    this.filePath = join(projectPath, '.skillkit', 'memory', 'observations.yaml');
    this.sessionId = sessionId || randomUUID();
  }

  private ensureDir(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private load(): ObservationStoreData {
    if (this.data) return this.data;

    if (existsSync(this.filePath)) {
      try {
        const content = readFileSync(this.filePath, 'utf-8');
        this.data = parseYaml(content) as ObservationStoreData;
        if (this.data.sessionId !== this.sessionId) {
          this.data.sessionId = this.sessionId;
          this.data.observations = [];
        }
      } catch {
        this.data = this.createEmpty();
      }
    } else {
      this.data = this.createEmpty();
    }

    return this.data;
  }

  private createEmpty(): ObservationStoreData {
    return {
      version: 1,
      sessionId: this.sessionId,
      observations: [],
    };
  }

  private save(): void {
    this.ensureDir();
    const content = stringifyYaml(this.data, { lineWidth: 0 });
    writeFileSync(this.filePath, content, 'utf-8');
  }

  add(
    type: ObservationType,
    content: ObservationContent,
    agent: AgentType,
    relevance = 50
  ): Observation {
    const data = this.load();

    const observation: Observation = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      agent,
      type,
      content,
      relevance,
    };

    data.observations.push(observation);
    this.save();

    return observation;
  }

  getAll(): Observation[] {
    return this.load().observations;
  }

  getByType(type: ObservationType): Observation[] {
    return this.load().observations.filter((o) => o.type === type);
  }

  getByRelevance(minRelevance: number): Observation[] {
    return this.load().observations.filter((o) => o.relevance >= minRelevance);
  }

  getRecent(count: number): Observation[] {
    const observations = this.load().observations;
    return observations.slice(-count);
  }

  getUncompressed(compressedIds: string[]): Observation[] {
    const compressedSet = new Set(compressedIds);
    return this.load().observations.filter((o) => !compressedSet.has(o.id));
  }

  count(): number {
    return this.load().observations.length;
  }

  clear(): void {
    this.data = this.createEmpty();
    this.save();
  }

  getById(id: string): Observation | undefined {
    return this.load().observations.find((o) => o.id === id);
  }

  getByIds(ids: string[]): Observation[] {
    const idSet = new Set(ids);
    return this.load().observations.filter((o) => idSet.has(o.id));
  }

  getSessionId(): string {
    return this.sessionId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    if (this.data) {
      this.data.sessionId = sessionId;
    }
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }

  delete(id: string): boolean {
    const data = this.load();
    const index = data.observations.findIndex((o) => o.id === id);

    if (index === -1) return false;

    data.observations.splice(index, 1);
    this.save();
    return true;
  }

  deleteMany(ids: string[]): number {
    const idSet = new Set(ids);
    const data = this.load();
    const initialLength = data.observations.length;

    data.observations = data.observations.filter((o) => !idSet.has(o.id));

    if (data.observations.length !== initialLength) {
      this.save();
    }

    return initialLength - data.observations.length;
  }
}
