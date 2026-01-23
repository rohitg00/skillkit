import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { randomUUID } from 'node:crypto';
import type { Learning, LearningStoreData } from './types.js';

export class LearningStore {
  private readonly filePath: string;
  private readonly scope: 'project' | 'global';
  private readonly projectName?: string;
  private data: LearningStoreData | null = null;

  constructor(
    scope: 'project' | 'global',
    projectPath?: string,
    projectName?: string
  ) {
    this.scope = scope;
    this.projectName = projectName;

    if (scope === 'project' && projectPath) {
      this.filePath = join(projectPath, '.skillkit', 'memory', 'learnings.yaml');
    } else {
      this.filePath = join(homedir(), '.skillkit', 'memory', 'global.yaml');
    }
  }

  private ensureDir(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private load(): LearningStoreData {
    if (this.data) return this.data;

    if (existsSync(this.filePath)) {
      try {
        const content = readFileSync(this.filePath, 'utf-8');
        this.data = parseYaml(content) as LearningStoreData;
      } catch {
        this.data = this.createEmpty();
      }
    } else {
      this.data = this.createEmpty();
    }

    return this.data;
  }

  private createEmpty(): LearningStoreData {
    return {
      version: 1,
      learnings: [],
    };
  }

  private save(): void {
    this.ensureDir();
    const content = stringifyYaml(this.data, { lineWidth: 0 });
    writeFileSync(this.filePath, content, 'utf-8');
  }

  add(learning: Omit<Learning, 'id' | 'createdAt' | 'updatedAt' | 'useCount' | 'scope' | 'project'>): Learning {
    const data = this.load();
    const now = new Date().toISOString();

    const newLearning: Learning = {
      ...learning,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      useCount: 0,
      scope: this.scope,
      project: this.projectName,
    };

    data.learnings.push(newLearning);
    this.save();

    return newLearning;
  }

  update(id: string, updates: Partial<Omit<Learning, 'id' | 'createdAt'>>): Learning | null {
    const data = this.load();
    const index = data.learnings.findIndex((l) => l.id === id);

    if (index === -1) return null;

    data.learnings[index] = {
      ...data.learnings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    return data.learnings[index];
  }

  delete(id: string): boolean {
    const data = this.load();
    const index = data.learnings.findIndex((l) => l.id === id);

    if (index === -1) return false;

    data.learnings.splice(index, 1);
    this.save();
    return true;
  }

  getAll(): Learning[] {
    return this.load().learnings;
  }

  getById(id: string): Learning | undefined {
    return this.load().learnings.find((l) => l.id === id);
  }

  getByTags(tags: string[]): Learning[] {
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));
    return this.load().learnings.filter((l) =>
      l.tags.some((t) => tagSet.has(t.toLowerCase()))
    );
  }

  getByFrameworks(frameworks: string[]): Learning[] {
    const fwSet = new Set(frameworks.map((f) => f.toLowerCase()));
    return this.load().learnings.filter((l) =>
      l.frameworks?.some((f) => fwSet.has(f.toLowerCase()))
    );
  }

  getRecent(count: number): Learning[] {
    const learnings = this.load().learnings;
    return [...learnings]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, count);
  }

  getMostUsed(count: number): Learning[] {
    const learnings = this.load().learnings;
    return [...learnings].sort((a, b) => b.useCount - a.useCount).slice(0, count);
  }

  getMostEffective(count: number): Learning[] {
    const learnings = this.load().learnings.filter((l) => l.effectiveness !== undefined);
    return [...learnings]
      .sort((a, b) => (b.effectiveness || 0) - (a.effectiveness || 0))
      .slice(0, count);
  }

  incrementUseCount(id: string): void {
    const data = this.load();
    const learning = data.learnings.find((l) => l.id === id);

    if (learning) {
      learning.useCount += 1;
      learning.lastUsed = new Date().toISOString();
      this.save();
    }
  }

  setEffectiveness(id: string, effectiveness: number): void {
    const data = this.load();
    const learning = data.learnings.find((l) => l.id === id);

    if (learning) {
      learning.effectiveness = Math.max(0, Math.min(100, effectiveness));
      learning.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  search(query: string): Learning[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

    return this.load().learnings.filter((l) => {
      const titleMatch = l.title.toLowerCase().includes(queryLower);
      const contentMatch = l.content.toLowerCase().includes(queryLower);
      const tagMatch = l.tags.some((t) => t.toLowerCase().includes(queryLower));
      const wordMatch = queryWords.some(
        (word) =>
          l.title.toLowerCase().includes(word) ||
          l.content.toLowerCase().includes(word)
      );

      return titleMatch || contentMatch || tagMatch || wordMatch;
    });
  }

  count(): number {
    return this.load().learnings.length;
  }

  clear(): void {
    this.data = this.createEmpty();
    this.save();
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }

  getScope(): 'project' | 'global' {
    return this.scope;
  }
}
