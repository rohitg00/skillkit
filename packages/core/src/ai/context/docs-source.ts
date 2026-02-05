import type { ContextChunk } from '../providers/types.js';
import type { ContextSource, ContextFetchOptions } from './index.js';

interface Context7Library {
  name: string;
  id: string;
  description?: string;
}

interface Context7DocChunk {
  content: string;
  title?: string;
  url?: string;
}

export class DocsSource implements ContextSource {
  readonly name = 'docs' as const;
  readonly displayName = 'Documentation (Context7)';

  private libraryCache: Map<string, Context7Library[]> = new Map();

  async fetch(query: string, options: ContextFetchOptions = {}): Promise<ContextChunk[]> {
    const { maxChunks = 5 } = options;

    try {
      const libraries = await this.resolveLibraries(query);
      if (libraries.length === 0) {
        return this.fallbackSearch(query, maxChunks);
      }

      const chunks: ContextChunk[] = [];

      for (const library of libraries.slice(0, 3)) {
        const docs = await this.queryDocs(library.id, query);
        for (const doc of docs.slice(0, Math.ceil(maxChunks / libraries.length))) {
          chunks.push({
            source: 'docs',
            content: this.formatDocChunk(doc, library.name),
            relevance: 0.9,
            metadata: {
              library: library.name,
              libraryId: library.id,
              title: doc.title,
              url: doc.url,
            },
          });
        }
      }

      return chunks.slice(0, maxChunks);
    } catch (error) {
      console.warn('Context7 unavailable, using fallback:', error);
      return this.fallbackSearch(query, maxChunks);
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private async resolveLibraries(query: string): Promise<Context7Library[]> {
    const cacheKey = query.toLowerCase();
    if (this.libraryCache.has(cacheKey)) {
      return this.libraryCache.get(cacheKey)!;
    }

    try {
      const keywords = this.extractKeywords(query);

      const libraries: Context7Library[] = [];

      for (const keyword of keywords) {
        const knownLib = this.getKnownLibrary(keyword);
        if (knownLib) {
          libraries.push(knownLib);
        }
      }

      this.libraryCache.set(cacheKey, libraries);
      return libraries;
    } catch {
      return [];
    }
  }

  private async queryDocs(libraryId: string, query: string): Promise<Context7DocChunk[]> {
    const fallbackDocs = this.getFallbackDocs(libraryId, query);
    return fallbackDocs;
  }

  private getKnownLibrary(keyword: string): Context7Library | null {
    const knownLibraries: Record<string, Context7Library> = {
      react: { name: 'React', id: 'facebook/react' },
      vue: { name: 'Vue.js', id: 'vuejs/vue' },
      svelte: { name: 'Svelte', id: 'sveltejs/svelte' },
      typescript: { name: 'TypeScript', id: 'microsoft/typescript' },
      node: { name: 'Node.js', id: 'nodejs/node' },
      nodejs: { name: 'Node.js', id: 'nodejs/node' },
      vitest: { name: 'Vitest', id: 'vitest-dev/vitest' },
      jest: { name: 'Jest', id: 'jestjs/jest' },
      nextjs: { name: 'Next.js', id: 'vercel/next.js' },
      next: { name: 'Next.js', id: 'vercel/next.js' },
      express: { name: 'Express', id: 'expressjs/express' },
      fastify: { name: 'Fastify', id: 'fastify/fastify' },
      prisma: { name: 'Prisma', id: 'prisma/prisma' },
      drizzle: { name: 'Drizzle', id: 'drizzle-team/drizzle-orm' },
      tailwind: { name: 'Tailwind CSS', id: 'tailwindlabs/tailwindcss' },
      tailwindcss: { name: 'Tailwind CSS', id: 'tailwindlabs/tailwindcss' },
      python: { name: 'Python', id: 'python/cpython' },
      django: { name: 'Django', id: 'django/django' },
      flask: { name: 'Flask', id: 'pallets/flask' },
      fastapi: { name: 'FastAPI', id: 'tiangolo/fastapi' },
      rust: { name: 'Rust', id: 'rust-lang/rust' },
      go: { name: 'Go', id: 'golang/go' },
      golang: { name: 'Go', id: 'golang/go' },
    };

    return knownLibraries[keyword.toLowerCase()] || null;
  }

  private getFallbackDocs(libraryId: string, query: string): Context7DocChunk[] {
    const docs: Context7DocChunk[] = [
      {
        title: `${libraryId} Documentation`,
        content: `Documentation for ${libraryId}. Query: ${query}. For detailed information, please refer to the official documentation.`,
        url: `https://github.com/${libraryId}`,
      },
    ];

    return docs;
  }

  private async fallbackSearch(query: string, maxChunks: number): Promise<ContextChunk[]> {
    const keywords = this.extractKeywords(query);
    const chunks: ContextChunk[] = [];

    for (const keyword of keywords.slice(0, maxChunks)) {
      const library = this.getKnownLibrary(keyword);
      if (library) {
        chunks.push({
          source: 'docs',
          content: `## ${library.name}\n\nRefer to official ${library.name} documentation for best practices and patterns related to: ${query}`,
          relevance: 0.6,
          metadata: {
            library: library.name,
            fallback: true,
          },
        });
      }
    }

    if (chunks.length === 0) {
      chunks.push({
        source: 'docs',
        content: `## General Documentation\n\nFor "${query}", consult relevant library documentation and official guides.`,
        relevance: 0.4,
        metadata: { fallback: true },
      });
    }

    return chunks.slice(0, maxChunks);
  }

  private extractKeywords(query: string): string[] {
    const words = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const techKeywords = words.filter((w) => this.getKnownLibrary(w));
    const otherKeywords = words.filter((w) => !this.getKnownLibrary(w));

    return [...techKeywords, ...otherKeywords];
  }

  private formatDocChunk(doc: Context7DocChunk, libraryName: string): string {
    let content = `## ${libraryName}`;

    if (doc.title) {
      content += `: ${doc.title}`;
    }

    content += '\n\n' + doc.content;

    if (doc.url) {
      content += `\n\nSource: ${doc.url}`;
    }

    return content;
  }
}
