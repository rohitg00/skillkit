import type { ExpandedQuery, IndexBuildCallback } from './types.js';
import { DEFAULT_HYBRID_CONFIG } from './types.js';
import { LocalModelManager } from './local-models.js';

interface CacheEntry {
  query: ExpandedQuery;
  timestamp: number;
}

const expansionCache = new Map<string, CacheEntry>();

export class QueryExpander {
  private modelManager: LocalModelManager;
  private model: unknown = null;
  private context: unknown = null;
  private initialized = false;
  private cacheTtlMs: number;

  constructor(modelManager?: LocalModelManager, cacheTtlMs?: number) {
    this.modelManager = modelManager ?? new LocalModelManager();
    this.cacheTtlMs = cacheTtlMs ?? DEFAULT_HYBRID_CONFIG.expansionCacheTtlMs;
  }

  async initialize(onProgress?: IndexBuildCallback): Promise<void> {
    if (this.initialized) return;

    onProgress?.({
      phase: 'loading',
      current: 0,
      total: 1,
      message: 'Loading LLM model for query expansion...',
    });

    const modelPath = await this.modelManager.ensureLlmModel(onProgress);

    try {
      // @ts-expect-error - node-llama-cpp is an optional dependency
      const llamaModule = await import('node-llama-cpp');
      const { getLlama, LlamaChatSession } = llamaModule;

      const llama = await getLlama();
      this.model = await llama.loadModel({ modelPath });
      const contextOptions = {
        model: this.model as never,
        contextSize: 2048,
      };
      const ctx = await llama.createContext(contextOptions);
      this.context = new LlamaChatSession({ contextSequence: ctx.getSequence() });

      this.initialized = true;

      onProgress?.({
        phase: 'loading',
        current: 1,
        total: 1,
        message: 'LLM model loaded successfully',
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cannot find package 'node-llama-cpp'")
      ) {
        throw new Error(
          'node-llama-cpp is not installed. Install it with: pnpm add node-llama-cpp'
        );
      }
      throw error;
    }
  }

  async expand(query: string, maxVariations: number = 3): Promise<ExpandedQuery> {
    const cached = this.getFromCache(query);
    if (cached) {
      return cached;
    }

    if (!this.initialized) {
      return this.expandWithoutLLM(query);
    }

    try {
      const variations = await this.generateVariations(query, maxVariations);
      const weights = [2.0, ...variations.map(() => 1.0)];

      const expanded: ExpandedQuery = {
        original: query,
        variations,
        weights,
      };

      this.addToCache(query, expanded);
      return expanded;
    } catch {
      return this.expandWithoutLLM(query);
    }
  }

  private async generateVariations(query: string, maxVariations: number): Promise<string[]> {
    const session = this.context as {
      prompt(text: string): Promise<string>;
    };

    const prompt = `Generate ${maxVariations} alternative search queries for finding software development skills related to: "${query}"

Rules:
- Each alternative should use different terminology but capture the same intent
- Keep each alternative concise (2-5 words)
- Focus on technical terms and synonyms
- Output only the alternatives, one per line, no numbering

Example:
Query: "auth for react"
Alternatives:
authentication react
login react hooks
OAuth react integration

Query: "${query}"
Alternatives:`;

    const response = await session.prompt(prompt);

    const variations = response
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length < 100)
      .filter((line) => !line.startsWith('-') && !line.match(/^\d+\./))
      .slice(0, maxVariations);

    return variations;
  }

  private expandWithoutLLM(query: string): ExpandedQuery {
    const variations: string[] = [];
    const queryLower = query.toLowerCase();

    const synonyms: Record<string, string[]> = {
      auth: ['authentication', 'login', 'oauth', 'jwt'],
      authentication: ['auth', 'login', 'oauth'],
      login: ['auth', 'authentication', 'signin'],
      api: ['rest', 'endpoint', 'http', 'graphql'],
      rest: ['api', 'http', 'endpoint'],
      db: ['database', 'sql', 'storage'],
      database: ['db', 'sql', 'data storage'],
      test: ['testing', 'unit test', 'spec'],
      testing: ['test', 'unit test', 'e2e'],
      ui: ['user interface', 'frontend', 'component'],
      frontend: ['ui', 'client', 'browser'],
      backend: ['server', 'api', 'service'],
      form: ['input', 'validation', 'submit'],
      validation: ['form validation', 'input check', 'verify'],
      state: ['state management', 'store', 'data flow'],
      animation: ['motion', 'transition', 'animate'],
      style: ['styling', 'css', 'design'],
      css: ['style', 'styling', 'tailwind'],
    };

    const terms = queryLower.split(/\s+/);
    for (const term of terms) {
      const termSynonyms = synonyms[term];
      if (termSynonyms) {
        for (const syn of termSynonyms.slice(0, 2)) {
          const variation = query.replace(new RegExp(term, 'i'), syn);
          if (variation !== query && !variations.includes(variation)) {
            variations.push(variation);
          }
        }
      }
    }

    const weights = [2.0, ...variations.map(() => 1.0)];

    return {
      original: query,
      variations: variations.slice(0, 3),
      weights,
    };
  }

  private getFromCache(query: string): ExpandedQuery | null {
    const entry = expansionCache.get(query.toLowerCase());
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.cacheTtlMs) {
      expansionCache.delete(query.toLowerCase());
      return null;
    }

    return entry.query;
  }

  private addToCache(query: string, expanded: ExpandedQuery): void {
    const maxCacheSize = 100;
    if (expansionCache.size >= maxCacheSize) {
      const oldestKey = expansionCache.keys().next().value;
      if (oldestKey) {
        expansionCache.delete(oldestKey);
      }
    }

    expansionCache.set(query.toLowerCase(), {
      query: expanded,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    expansionCache.clear();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    if (this.context && typeof (this.context as { dispose?: () => void }).dispose === 'function') {
      (this.context as { dispose: () => void }).dispose();
    }
    if (this.model && typeof (this.model as { dispose?: () => void }).dispose === 'function') {
      (this.model as { dispose: () => void }).dispose();
    }
    this.context = null;
    this.model = null;
    this.initialized = false;
  }
}

export function createQueryExpander(
  modelManager?: LocalModelManager,
  cacheTtlMs?: number
): QueryExpander {
  return new QueryExpander(modelManager, cacheTtlMs);
}

export function expandQuerySimple(query: string): ExpandedQuery {
  const expander = new QueryExpander();
  return expander['expandWithoutLLM'](query);
}
