import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { Learning, MemoryIndex } from './types.js';

export class MemoryIndexStore {
  private readonly filePath: string;
  private data: MemoryIndex | null = null;

  constructor(basePath: string, _isGlobal = false) {
    // Both global and project use .skillkit subdirectory
    // Global: ~/.skillkit/memory/index.yaml (basePath = homedir())
    // Project: <projectPath>/.skillkit/memory/index.yaml (basePath = projectPath)
    // Note: _isGlobal kept for API compatibility but basePath determines the actual path
    this.filePath = join(basePath, '.skillkit', 'memory', 'index.yaml');
  }

  private ensureDir(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private load(): MemoryIndex {
    if (this.data) return this.data;

    if (existsSync(this.filePath)) {
      try {
        const content = readFileSync(this.filePath, 'utf-8');
        this.data = parseYaml(content) as MemoryIndex;
      } catch {
        this.data = this.createEmpty();
      }
    } else {
      this.data = this.createEmpty();
    }

    return this.data;
  }

  private createEmpty(): MemoryIndex {
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      entries: {},
      tags: {},
    };
  }

  private save(): void {
    this.ensureDir();
    if (this.data) {
      this.data.lastUpdated = new Date().toISOString();
    }
    const content = stringifyYaml(this.data, { lineWidth: 0 });
    writeFileSync(this.filePath, content, 'utf-8');
  }

  private extractKeywords(text: string): string[] {
    // Extract meaningful keywords from text
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'it', 'its', 'i', 'you', 'we', 'they', 'he', 'she',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)];
  }

  indexLearning(learning: Learning): void {
    const data = this.load();

    // Extract keywords from title and content
    const titleKeywords = this.extractKeywords(learning.title);
    const contentKeywords = this.extractKeywords(learning.content);
    const allKeywords = [...new Set([...titleKeywords, ...contentKeywords])];

    // Index by keywords
    for (const keyword of allKeywords) {
      if (!data.entries[keyword]) {
        data.entries[keyword] = [];
      }
      if (!data.entries[keyword].includes(learning.id)) {
        data.entries[keyword].push(learning.id);
      }
    }

    // Index by tags
    for (const tag of learning.tags) {
      const normalizedTag = tag.toLowerCase();
      if (!data.tags[normalizedTag]) {
        data.tags[normalizedTag] = [];
      }
      if (!data.tags[normalizedTag].includes(learning.id)) {
        data.tags[normalizedTag].push(learning.id);
      }
    }

    // Index by frameworks if present
    if (learning.frameworks) {
      for (const framework of learning.frameworks) {
        const normalizedFw = framework.toLowerCase();
        if (!data.tags[normalizedFw]) {
          data.tags[normalizedFw] = [];
        }
        if (!data.tags[normalizedFw].includes(learning.id)) {
          data.tags[normalizedFw].push(learning.id);
        }
      }
    }

    this.save();
  }

  removeLearning(learningId: string): void {
    const data = this.load();

    // Remove from keyword entries
    for (const keyword of Object.keys(data.entries)) {
      data.entries[keyword] = data.entries[keyword].filter((id) => id !== learningId);
      if (data.entries[keyword].length === 0) {
        delete data.entries[keyword];
      }
    }

    // Remove from tags
    for (const tag of Object.keys(data.tags)) {
      data.tags[tag] = data.tags[tag].filter((id) => id !== learningId);
      if (data.tags[tag].length === 0) {
        delete data.tags[tag];
      }
    }

    this.save();
  }

  searchByKeywords(query: string): string[] {
    const data = this.load();
    const keywords = this.extractKeywords(query);

    if (keywords.length === 0) return [];

    // Find IDs that match any keyword
    const matchCounts = new Map<string, number>();

    for (const keyword of keywords) {
      // Exact match
      if (data.entries[keyword]) {
        for (const id of data.entries[keyword]) {
          matchCounts.set(id, (matchCounts.get(id) || 0) + 2);
        }
      }

      // Partial match (keyword is substring of indexed word, but not exact match)
      for (const [indexed, ids] of Object.entries(data.entries)) {
        // Skip exact matches - they're already counted above with higher weight
        if (indexed === keyword) continue;
        if (indexed.includes(keyword) || keyword.includes(indexed)) {
          for (const id of ids) {
            matchCounts.set(id, (matchCounts.get(id) || 0) + 1);
          }
        }
      }
    }

    // Sort by match count (most matches first)
    return [...matchCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  }

  searchByTags(tags: string[]): string[] {
    const data = this.load();
    const normalizedTags = tags.map((t) => t.toLowerCase());

    const matchCounts = new Map<string, number>();

    for (const tag of normalizedTags) {
      if (data.tags[tag]) {
        for (const id of data.tags[tag]) {
          matchCounts.set(id, (matchCounts.get(id) || 0) + 1);
        }
      }
    }

    // Sort by match count
    return [...matchCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  }

  search(query: string, tags?: string[]): string[] {
    const keywordResults = this.searchByKeywords(query);
    const tagResults = tags ? this.searchByTags(tags) : [];

    if (!tags || tags.length === 0) {
      return keywordResults;
    }

    if (!query || query.trim().length === 0) {
      return tagResults;
    }

    // Combine results, prioritizing items that match both
    const keywordSet = new Set(keywordResults);
    const tagSet = new Set(tagResults);

    const both: string[] = [];
    const keywordOnly: string[] = [];
    const tagOnly: string[] = [];

    for (const id of keywordResults) {
      if (tagSet.has(id)) {
        both.push(id);
      } else {
        keywordOnly.push(id);
      }
    }

    for (const id of tagResults) {
      if (!keywordSet.has(id)) {
        tagOnly.push(id);
      }
    }

    return [...both, ...keywordOnly, ...tagOnly];
  }

  getAllTags(): string[] {
    const data = this.load();
    return Object.keys(data.tags).sort();
  }

  getTagCounts(): Record<string, number> {
    const data = this.load();
    const counts: Record<string, number> = {};
    for (const [tag, ids] of Object.entries(data.tags)) {
      counts[tag] = ids.length;
    }
    return counts;
  }

  rebuildIndex(learnings: Learning[]): void {
    // Clear existing index
    this.data = this.createEmpty();

    // Re-index all learnings
    for (const learning of learnings) {
      this.indexLearning(learning);
    }

    this.save();
  }

  clear(): void {
    this.data = this.createEmpty();
    this.save();
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }

  getStats(): { keywords: number; tags: number; lastUpdated: string } {
    const data = this.load();
    return {
      keywords: Object.keys(data.entries).length,
      tags: Object.keys(data.tags).length,
      lastUpdated: data.lastUpdated,
    };
  }
}
