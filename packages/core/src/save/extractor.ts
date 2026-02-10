import { existsSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import TurndownService from 'turndown';
import type { ExtractedContent, ExtractionOptions } from './types.js';

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.json': 'json',
  '.toml': 'toml',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sql': 'sql',
  '.r': 'r',
  '.lua': 'lua',
  '.dart': 'dart',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.zig': 'zig',
  '.nim': 'nim',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

const GITHUB_URL_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
const GITHUB_RAW_PATTERN = /^https?:\/\/raw\.githubusercontent\.com\//;
const FETCH_TIMEOUT = 30_000;

export class ContentExtractor {
  private turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
  }

  async extractFromUrl(url: string, options?: ExtractionOptions): Promise<ExtractedContent> {
    if (this.isGitHubUrl(url)) {
      return this.fetchGitHubContent(url, options);
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const body = await response.text();

    if (contentType.includes('text/html')) {
      const { title, content } = this.htmlToMarkdown(body, url);
      const finalContent = options?.maxLength ? content.slice(0, options.maxLength) : content;

      return {
        title: options?.preferredTitle ?? title,
        content: finalContent,
        sourceUrl: url,
        tags: [],
        extractedAt: new Date().toISOString(),
        contentType: 'webpage',
        metadata: { url },
      };
    }

    const title = options?.preferredTitle ?? new URL(url).pathname.split('/').pop() ?? 'Untitled';
    const finalContent = options?.maxLength ? body.slice(0, options.maxLength) : body;

    return {
      title,
      content: finalContent,
      sourceUrl: url,
      tags: [],
      extractedAt: new Date().toISOString(),
      contentType: 'text',
      metadata: { url },
    };
  }

  extractFromText(text: string, options?: ExtractionOptions): ExtractedContent {
    const firstLine = text.split('\n')[0]?.trim() ?? '';
    const title = options?.preferredTitle ?? (firstLine.length > 0 && firstLine.length <= 100 ? firstLine : 'Untitled');
    const content = options?.maxLength ? text.slice(0, options.maxLength) : text;

    return {
      title,
      content,
      tags: [],
      extractedAt: new Date().toISOString(),
      contentType: 'text',
      metadata: {},
    };
  }

  extractFromFile(filePath: string, options?: ExtractionOptions): ExtractedContent {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const raw = readFileSync(filePath, 'utf-8');
    const name = basename(filePath);
    const language = this.detectLanguage(name);
    const isCode = language !== undefined && language !== 'markdown';
    const title = options?.preferredTitle ?? name;
    const content = options?.maxLength ? raw.slice(0, options.maxLength) : raw;

    return {
      title,
      content: isCode ? `\`\`\`${language}\n${content}\n\`\`\`` : content,
      sourcePath: filePath,
      tags: language ? [language] : [],
      extractedAt: new Date().toISOString(),
      contentType: isCode ? 'code' : 'file',
      language,
      metadata: { filename: name },
    };
  }

  private isGitHubUrl(url: string): boolean {
    return GITHUB_URL_PATTERN.test(url) || GITHUB_RAW_PATTERN.test(url);
  }

  private async fetchGitHubContent(url: string, options?: ExtractionOptions): Promise<ExtractedContent> {
    let rawUrl = url;
    const match = url.match(GITHUB_URL_PATTERN);
    if (match) {
      const [, owner, repo, branch, path] = match;
      rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    }

    const response = await fetch(rawUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub content: ${response.status} ${response.statusText}`);
    }

    const body = await response.text();
    const filename = rawUrl.split('/').pop() ?? 'file';
    const language = this.detectLanguage(filename);
    const isCode = language !== undefined && language !== 'markdown';
    const title = options?.preferredTitle ?? filename;
    const content = options?.maxLength ? body.slice(0, options.maxLength) : body;

    return {
      title,
      content: isCode ? `\`\`\`${language}\n${content}\n\`\`\`` : content,
      sourceUrl: url,
      tags: language ? ['github', language] : ['github'],
      extractedAt: new Date().toISOString(),
      contentType: 'github',
      language,
      metadata: {
        url,
        rawUrl,
        filename,
      },
    };
  }

  private htmlToMarkdown(html: string, url: string): { title: string; content: string } {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? new URL(url).hostname;

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyHtml = bodyMatch?.[1] ?? html;

    const content = this.turndown.turndown(bodyHtml);
    return { title, content };
  }

  private detectLanguage(filename: string): string | undefined {
    const ext = extname(filename).toLowerCase();
    return LANGUAGE_MAP[ext];
  }
}
