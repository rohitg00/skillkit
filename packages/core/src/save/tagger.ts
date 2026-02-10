import type { ExtractedContent } from './types.js';

const TECH_KEYWORDS = new Set([
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix',
  'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'ruby',
  'node', 'deno', 'bun', 'docker', 'kubernetes', 'terraform',
  'aws', 'gcp', 'azure', 'vercel', 'netlify', 'cloudflare',
  'graphql', 'rest', 'grpc', 'websocket', 'redis', 'postgres',
  'mongodb', 'sqlite', 'mysql', 'prisma', 'drizzle',
  'tailwind', 'css', 'html', 'sass', 'webpack', 'vite', 'esbuild',
  'git', 'ci', 'cd', 'testing', 'security', 'authentication',
  'api', 'cli', 'sdk', 'mcp', 'llm', 'ai', 'ml', 'openai', 'anthropic',
]);

const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class AutoTagger {
  detectTags(content: ExtractedContent): string[] {
    const tagCounts = new Map<string, number>();

    this.extractFromUrl(content.sourceUrl, tagCounts);
    this.extractFromHeadings(content.content, tagCounts);
    this.extractFromCodeBlocks(content.content, tagCounts);
    this.extractFromKeywords(content.content, tagCounts);

    if (content.language) {
      this.addTag(content.language.toLowerCase(), tagCounts, 3);
    }

    if (content.contentType !== 'text') {
      this.addTag(content.contentType, tagCounts, 1);
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private extractFromUrl(url: string | undefined, counts: Map<string, number>): void {
    if (!url) return;
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname
        .split('/')
        .filter(Boolean)
        .map((s) => s.toLowerCase().replace(/[^a-z0-9-]/g, ''));

      for (const seg of segments) {
        if (seg.length >= 2 && seg.length <= 30 && TAG_PATTERN.test(seg)) {
          this.addTag(seg, counts, 2);
        }
      }
    } catch {
      // not a valid URL, skip
    }
  }

  private extractFromHeadings(content: string, counts: Map<string, number>): void {
    const headingRe = /^#{1,2}\s+(.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = headingRe.exec(content)) !== null) {
      const words = match[1].toLowerCase().split(/\s+/);
      for (const word of words) {
        const cleaned = word.replace(/[^a-z0-9-]/g, '');
        if (cleaned.length >= 2 && TAG_PATTERN.test(cleaned)) {
          this.addTag(cleaned, counts, 2);
        }
      }
    }
  }

  private extractFromCodeBlocks(content: string, counts: Map<string, number>): void {
    const codeBlockRe = /^```(\w+)/gm;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRe.exec(content)) !== null) {
      const lang = match[1].toLowerCase();
      if (lang.length >= 2 && TAG_PATTERN.test(lang)) {
        this.addTag(lang, counts, 3);
      }
    }
  }

  private extractFromKeywords(content: string, counts: Map<string, number>): void {
    const lower = content.toLowerCase();
    for (const keyword of TECH_KEYWORDS) {
      const re = new RegExp(`\\b${keyword}\\b`, 'i');
      if (re.test(lower)) {
        this.addTag(keyword, counts, 1);
      }
    }
  }

  private addTag(tag: string, counts: Map<string, number>, weight: number): void {
    if (!TAG_PATTERN.test(tag)) return;
    counts.set(tag, (counts.get(tag) ?? 0) + weight);
  }
}
