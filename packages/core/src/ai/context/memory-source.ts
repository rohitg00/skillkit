import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ContextChunk, MemoryPattern } from '../providers/types.js';
import type { ContextSource, ContextFetchOptions } from './index.js';
import { ObservationStore } from '../../memory/observation-store.js';

interface LearnedEntry {
  category: string;
  pattern: string;
  source?: string;
}

export class MemorySource implements ContextSource {
  readonly name = 'memory' as const;
  readonly displayName = 'Memory & Learnings';

  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async fetch(query: string, options: ContextFetchOptions = {}): Promise<ContextChunk[]> {
    const { maxChunks = 5, projectPath } = options;
    const basePath = projectPath || this.projectPath;

    const chunks: ContextChunk[] = [];
    const keywords = this.extractKeywords(query);

    const learnedEntries = await this.getLearnedEntries(basePath);
    const relevantLearned = this.filterRelevant(learnedEntries, keywords);

    for (const entry of relevantLearned.slice(0, Math.ceil(maxChunks / 2))) {
      chunks.push({
        source: 'memory',
        content: `## Learned Pattern: ${entry.category}\n\n${entry.pattern}`,
        relevance: 0.8,
        metadata: {
          type: 'learned',
          category: entry.category,
        },
      });
    }

    const observations = await this.getRelevantObservations(basePath, keywords);
    for (const obs of observations.slice(0, maxChunks - chunks.length)) {
      chunks.push({
        source: 'memory',
        content: this.formatObservation(obs),
        relevance: obs.relevance / 100,
        metadata: {
          type: 'observation',
          observationType: obs.type,
        },
      });
    }

    return chunks.slice(0, maxChunks);
  }

  async isAvailable(): Promise<boolean> {
    const claudeMdPath = this.findClaudeMd(this.projectPath);
    const memoryPath = join(this.projectPath, '.skillkit', 'memory', 'observations.yaml');

    return existsSync(claudeMdPath) || existsSync(memoryPath);
  }

  async getMemoryPatterns(keywords: string[]): Promise<MemoryPattern[]> {
    const patterns: MemoryPattern[] = [];

    const learnedEntries = await this.getLearnedEntries(this.projectPath);
    const relevant = this.filterRelevant(learnedEntries, keywords);

    for (const entry of relevant) {
      patterns.push({
        category: entry.category,
        pattern: entry.pattern,
        confidence: 0.8,
      });
    }

    return patterns;
  }

  private async getLearnedEntries(basePath: string): Promise<LearnedEntry[]> {
    const claudeMdPath = this.findClaudeMd(basePath);

    if (!existsSync(claudeMdPath)) {
      return [];
    }

    try {
      const content = readFileSync(claudeMdPath, 'utf-8');
      return this.parseLearnedSection(content);
    } catch {
      return [];
    }
  }

  private parseLearnedSection(content: string): LearnedEntry[] {
    const entries: LearnedEntry[] = [];

    const learnedMatch = content.match(/## LEARNED\s*\n([\s\S]*?)(?=\n## |$)/i);
    if (!learnedMatch) {
      return entries;
    }

    const learnedContent = learnedMatch[1];

    const categoryRegex = /### ([^\n]+)\n([\s\S]*?)(?=\n### |$)/g;
    let match;

    while ((match = categoryRegex.exec(learnedContent)) !== null) {
      const category = match[1].trim();
      const pattern = match[2].trim();

      if (category && pattern) {
        entries.push({ category, pattern });
      }
    }

    const lineRegex = /^[-*]\s+(.+)$/gm;
    if (entries.length === 0) {
      while ((match = lineRegex.exec(learnedContent)) !== null) {
        entries.push({
          category: 'General',
          pattern: match[1].trim(),
        });
      }
    }

    return entries;
  }

  private async getRelevantObservations(
    basePath: string,
    keywords: string[]
  ): Promise<Array<{ type: string; content: string; relevance: number }>> {
    try {
      const store = new ObservationStore(basePath);

      if (!store.exists()) {
        return [];
      }

      const observations = store.getAll();

      return observations
        .map((obs) => {
          const contentStr = typeof obs.content === 'string'
            ? obs.content
            : JSON.stringify(obs.content);

          const relevance = this.calculateRelevance(contentStr, keywords);

          return {
            type: obs.type,
            content: contentStr,
            relevance: Math.max(obs.relevance, relevance * 100),
          };
        })
        .filter((obs) => obs.relevance > 30)
        .sort((a, b) => b.relevance - a.relevance);
    } catch {
      return [];
    }
  }

  private filterRelevant(entries: LearnedEntry[], keywords: string[]): LearnedEntry[] {
    return entries.filter((entry) => {
      const text = `${entry.category} ${entry.pattern}`.toLowerCase();

      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return true;
        }
      }

      return keywords.length === 0;
    });
  }

  private calculateRelevance(content: string, keywords: string[]): number {
    if (keywords.length === 0) return 0.5;

    const contentLower = content.toLowerCase();
    let matches = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    return matches / keywords.length;
  }

  private extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private formatObservation(obs: { type: string; content: string; relevance: number }): string {
    return `## Memory Observation (${obs.type})

${obs.content}

Relevance: ${obs.relevance}%`;
  }

  private findClaudeMd(basePath: string): string {
    const localPath = join(basePath, 'CLAUDE.md');
    if (existsSync(localPath)) {
      return localPath;
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const globalPath = join(homeDir, '.claude', 'CLAUDE.md');
    if (existsSync(globalPath)) {
      return globalPath;
    }

    const projectKey = basePath.replace(/[\\/]/g, '-');
    const projectMemoryPath = join(homeDir, '.claude', 'projects', projectKey, 'memory', 'MEMORY.md');
    if (existsSync(projectMemoryPath)) {
      return projectMemoryPath;
    }

    return localPath;
  }
}
