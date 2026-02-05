import type { ContextChunk, ContextSourceConfig } from '../providers/types.js';
import { DocsSource } from './docs-source.js';
import { CodebaseSource } from './codebase-source.js';
import { SkillsSource } from './skills-source.js';
import { MemorySource } from './memory-source.js';

export interface ContextSource {
  readonly name: 'docs' | 'codebase' | 'skills' | 'memory';
  readonly displayName: string;
  fetch(query: string, options?: ContextFetchOptions): Promise<ContextChunk[]>;
  isAvailable(): Promise<boolean>;
}

export interface ContextFetchOptions {
  maxChunks?: number;
  minRelevance?: number;
  projectPath?: string;
}

export interface AggregatedContext {
  chunks: ContextChunk[];
  sources: SourceSummary[];
  totalTokensEstimate: number;
}

export interface SourceSummary {
  name: string;
  chunkCount: number;
  status: 'success' | 'error' | 'unavailable';
  error?: string;
}

export interface ContextEngineOptions {
  projectPath?: string;
  maxTotalChunks?: number;
  defaultSources?: ContextSourceConfig[];
}

export class ContextEngine {
  private sources: Map<string, ContextSource>;
  private projectPath: string;
  private maxTotalChunks: number;

  constructor(options: ContextEngineOptions = {}) {
    this.projectPath = options.projectPath || process.cwd();
    this.maxTotalChunks = options.maxTotalChunks ?? 20;

    this.sources = new Map<string, ContextSource>();
    this.sources.set('docs', new DocsSource());
    this.sources.set('codebase', new CodebaseSource(this.projectPath));
    this.sources.set('skills', new SkillsSource());
    this.sources.set('memory', new MemorySource(this.projectPath));
  }

  async gather(
    expertise: string,
    sourceConfigs?: ContextSourceConfig[]
  ): Promise<AggregatedContext> {
    const configs = sourceConfigs || this.getDefaultSourceConfigs();
    const enabledSources = configs.filter((c) => c.enabled);

    const results: ContextChunk[] = [];
    const summaries: SourceSummary[] = [];

    const chunksPerSource = Math.floor(this.maxTotalChunks / enabledSources.length);

    const fetchPromises = enabledSources.map(async (config) => {
      const source = this.sources.get(config.name);
      if (!source) {
        return {
          name: config.name,
          chunks: [] as ContextChunk[],
          status: 'unavailable' as const,
          error: `Source not found: ${config.name}`,
        };
      }

      try {
        const available = await source.isAvailable();
        if (!available) {
          return {
            name: config.name,
            chunks: [] as ContextChunk[],
            status: 'unavailable' as const,
          };
        }

        const chunks = await source.fetch(expertise, {
          maxChunks: chunksPerSource,
          projectPath: this.projectPath,
        });

        const weightedChunks = chunks.map((chunk) => ({
          ...chunk,
          relevance: chunk.relevance * (config.weight ?? 1),
        }));

        return {
          name: config.name,
          chunks: weightedChunks,
          status: 'success' as const,
        };
      } catch (error) {
        return {
          name: config.name,
          chunks: [] as ContextChunk[],
          status: 'error' as const,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const sourceResults = await Promise.all(fetchPromises);

    for (const result of sourceResults) {
      results.push(...result.chunks);
      summaries.push({
        name: result.name,
        chunkCount: result.chunks.length,
        status: result.status,
        error: result.error,
      });
    }

    const sortedChunks = results.sort((a, b) => b.relevance - a.relevance);
    const finalChunks = sortedChunks.slice(0, this.maxTotalChunks);
    const totalTokensEstimate = this.estimateTokens(finalChunks);

    return {
      chunks: finalChunks,
      sources: summaries,
      totalTokensEstimate,
    };
  }

  async gatherFromSource(
    sourceName: string,
    query: string,
    options?: ContextFetchOptions
  ): Promise<ContextChunk[]> {
    const source = this.sources.get(sourceName);
    if (!source) {
      throw new Error(`Unknown source: ${sourceName}`);
    }

    const available = await source.isAvailable();
    if (!available) {
      return [];
    }

    return source.fetch(query, options);
  }

  getAvailableSources(): string[] {
    return Array.from(this.sources.keys());
  }

  async checkSourceAvailability(): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};

    for (const [name, source] of this.sources) {
      result[name] = await source.isAvailable();
    }

    return result;
  }

  private getDefaultSourceConfigs(): ContextSourceConfig[] {
    return [
      { name: 'docs', enabled: true, weight: 1.0 },
      { name: 'codebase', enabled: true, weight: 0.9 },
      { name: 'skills', enabled: true, weight: 0.8 },
      { name: 'memory', enabled: true, weight: 0.7 },
    ];
  }

  private estimateTokens(chunks: ContextChunk[]): number {
    let totalChars = 0;
    for (const chunk of chunks) {
      totalChars += chunk.content.length;
    }
    return Math.ceil(totalChars / 4);
  }
}

export { DocsSource } from './docs-source.js';
export { CodebaseSource } from './codebase-source.js';
export { SkillsSource } from './skills-source.js';
export { MemorySource } from './memory-source.js';
