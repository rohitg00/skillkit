/**
 * Marketplace Aggregator
 *
 * Fetches and indexes skills from multiple GitHub repositories.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type {
  SkillSource,
  MarketplaceSkill,
  MarketplaceIndex,
  MarketplaceSearchOptions,
  MarketplaceSearchResult,
  MarketplaceConfig,
} from './types.js';
import {
  DEFAULT_SKILL_SOURCES,
  MARKETPLACE_CACHE_FILE,
  DEFAULT_CACHE_TTL,
} from './types.js';

/**
 * Marketplace Aggregator
 */
export class MarketplaceAggregator {
  private config: MarketplaceConfig;
  private cacheDir: string;
  private cachePath: string;
  private index: MarketplaceIndex | null = null;

  constructor(config: MarketplaceConfig = {}) {
    this.config = config;
    this.cacheDir = config.cacheDir || join(homedir(), '.skillkit', 'marketplace');
    this.cachePath = join(this.cacheDir, MARKETPLACE_CACHE_FILE);

    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get all sources (default + custom)
   */
  getSources(): SkillSource[] {
    return [...DEFAULT_SKILL_SOURCES, ...(this.config.sources || [])];
  }

  /**
   * Load cached index
   */
  loadCache(): MarketplaceIndex | null {
    if (!existsSync(this.cachePath)) {
      return null;
    }

    try {
      const content = readFileSync(this.cachePath, 'utf-8');
      const index = JSON.parse(content) as MarketplaceIndex;

      // Check if cache is expired
      const cacheAge = Date.now() - new Date(index.updatedAt).getTime();
      const ttl = this.config.cacheTTL || DEFAULT_CACHE_TTL;

      if (cacheAge > ttl) {
        return null; // Cache expired
      }

      this.index = index;
      return index;
    } catch {
      return null;
    }
  }

  /**
   * Save index to cache
   */
  saveCache(index: MarketplaceIndex): void {
    writeFileSync(this.cachePath, JSON.stringify(index, null, 2));
    this.index = index;
  }

  /**
   * Fetch skills from a single source
   */
  async fetchSource(source: SkillSource): Promise<MarketplaceSkill[]> {
    const skills: MarketplaceSkill[] = [];
    const branch = source.branch || 'main';

    try {
      // Try to fetch skills index file
      const indexPaths = [
        source.indexPath,
        'skills.json',
        'index.json',
        '.skillkit/skills.json',
      ].filter(Boolean) as string[];

      for (const indexPath of indexPaths) {
        try {
          const url = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${branch}/${indexPath}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = (await response.json()) as unknown;

            if (Array.isArray(data)) {
              for (const item of data) {
                skills.push(this.parseSkillEntry(item as Record<string, unknown>, source));
              }
              return skills;
            }

            const dataObj = data as Record<string, unknown>;
            if (dataObj.skills && Array.isArray(dataObj.skills)) {
              for (const item of dataObj.skills) {
                skills.push(this.parseSkillEntry(item as Record<string, unknown>, source));
              }
              return skills;
            }
          }
        } catch {
          // Try next path
        }
      }

      // Fallback: Try to parse README for skill links
      const readmeUrl = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${branch}/README.md`;
      const readmeResponse = await fetch(readmeUrl);

      if (readmeResponse.ok) {
        const readme = await readmeResponse.text();
        const parsedSkills = this.parseReadmeForSkills(readme, source);
        skills.push(...parsedSkills);
      }

      // If still no skills, add the repo itself as a skill source
      if (skills.length === 0) {
        skills.push({
          id: `${source.owner}/${source.repo}`,
          name: source.repo,
          description: source.description || `Skills from ${source.name}`,
          source,
          path: '/',
          tags: ['repository'],
          rawUrl: `https://github.com/${source.owner}/${source.repo}`,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch skills from ${source.owner}/${source.repo}:`, error);
    }

    return skills;
  }

  /**
   * Check if a path is an absolute URL
   */
  private isAbsoluteUrl(path: string): boolean {
    return /^https?:\/\//i.test(path);
  }

  /**
   * Convert a GitHub URL to raw content URL
   */
  private toRawUrl(url: string): string {
    return url
      .replace('://github.com/', '://raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }

  /**
   * Parse a skill entry from JSON
   */
  private parseSkillEntry(
    item: Record<string, unknown>,
    source: SkillSource
  ): MarketplaceSkill {
    const name = String(item.name || item.title || 'Unknown');
    const path = String(item.path || item.file || item.url || '/');

    // Handle absolute URLs - use them directly instead of building from source
    const rawUrl = this.isAbsoluteUrl(path)
      ? this.toRawUrl(path)
      : this.buildRawUrl(source, path);

    return {
      id: `${source.owner}/${source.repo}/${path}`,
      name,
      description: String(item.description || item.desc || ''),
      source,
      path,
      version: item.version as string | undefined,
      author: item.author as string | undefined,
      tags: Array.isArray(item.tags) ? item.tags : [],
      agents: Array.isArray(item.agents) ? item.agents : undefined,
      stars: typeof item.stars === 'number' ? item.stars : undefined,
      updatedAt: item.updatedAt as string | undefined,
      downloads: typeof item.downloads === 'number' ? item.downloads : undefined,
      rawUrl,
    };
  }

  /**
   * Parse README for skill links
   */
  private parseReadmeForSkills(
    readme: string,
    source: SkillSource
  ): MarketplaceSkill[] {
    const skills: MarketplaceSkill[] = [];
    const branch = source.branch || 'main';

    // Look for markdown links to skill files
    const linkPattern = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
    let match;

    while ((match = linkPattern.exec(readme)) !== null) {
      const name = match[1];
      const path = match[2];

      // Skip external links and non-skill files
      if (path.startsWith('http') && !path.includes(source.repo)) {
        continue;
      }

      // Extract description from surrounding text
      const contextStart = Math.max(0, match.index - 200);
      const contextEnd = Math.min(readme.length, match.index + 200);
      const context = readme.slice(contextStart, contextEnd);

      // Try to find description in list item or paragraph
      const descMatch = context.match(/[-*]\s*\[.*?\]\(.*?\)\s*[-:]\s*(.+?)(?:\n|$)/);
      const description = descMatch ? descMatch[1].trim() : '';

      // Handle absolute URLs in README links
      const isAbsolute = this.isAbsoluteUrl(path);
      const normalizedPath = isAbsolute ? path : (path.startsWith('/') ? path : `/${path}`);
      const rawUrl = isAbsolute
        ? this.toRawUrl(path)
        : `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${branch}/${path}`;

      skills.push({
        id: `${source.owner}/${source.repo}/${path}`,
        name,
        description,
        source,
        path: normalizedPath,
        tags: this.inferTags(name, description),
        rawUrl,
      });
    }

    return skills;
  }

  /**
   * Build raw URL for a skill
   */
  private buildRawUrl(source: SkillSource, path: string): string {
    const branch = source.branch || 'main';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${branch}/${cleanPath}`;
  }

  /**
   * Infer tags from name and description
   */
  private inferTags(name: string, description: string): string[] {
    const tags: string[] = [];
    const text = `${name} ${description}`.toLowerCase();

    const tagKeywords: Record<string, string[]> = {
      typescript: ['typescript', 'ts', 'tsc'],
      javascript: ['javascript', 'js', 'node'],
      react: ['react', 'jsx', 'tsx'],
      nextjs: ['next', 'nextjs', 'next.js'],
      testing: ['test', 'jest', 'vitest', 'mocha'],
      linting: ['lint', 'eslint', 'prettier'],
      auth: ['auth', 'authentication', 'login', 'oauth'],
      database: ['database', 'db', 'postgres', 'mysql', 'mongo'],
      api: ['api', 'rest', 'graphql'],
      devops: ['ci', 'cd', 'docker', 'kubernetes'],
      git: ['git', 'github', 'commit'],
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Refresh the marketplace index
   */
  async refresh(): Promise<MarketplaceIndex> {
    const sources = this.getSources();
    const allSkills: MarketplaceSkill[] = [];

    // Fetch from all sources in parallel
    const results = await Promise.all(
      sources.map((source) => this.fetchSource(source))
    );

    for (const skills of results) {
      allSkills.push(...skills);
    }

    // Create index
    const index: MarketplaceIndex = {
      version: 1,
      updatedAt: new Date().toISOString(),
      sources,
      skills: allSkills,
      totalCount: allSkills.length,
    };

    // Save to cache
    this.saveCache(index);

    return index;
  }

  /**
   * Get the marketplace index (from cache or refresh)
   */
  async getIndex(forceRefresh = false): Promise<MarketplaceIndex> {
    // Check in-memory cache first
    if (!forceRefresh && this.index) {
      return this.index;
    }

    // Check file cache
    if (!forceRefresh) {
      const cached = this.loadCache();
      if (cached) {
        return cached;
      }
    }

    return this.refresh();
  }

  /**
   * Search the marketplace
   */
  async search(options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchResult> {
    const index = await this.getIndex();
    let skills = [...index.skills];

    // Filter by query
    if (options.query) {
      const query = options.query.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      skills = skills.filter((s) =>
        options.tags!.some((t) => s.tags.includes(t))
      );
    }

    // Filter by source
    if (options.source) {
      skills = skills.filter(
        (s) =>
          s.source.name === options.source ||
          `${s.source.owner}/${s.source.repo}` === options.source
      );
    }

    // Filter by agent
    if (options.agent) {
      skills = skills.filter(
        (s) => !s.agents || s.agents.includes(options.agent!)
      );
    }

    // Sort
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'asc';

    skills.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stars':
          comparison = (a.stars || 0) - (b.stars || 0);
          break;
        case 'downloads':
          comparison = (a.downloads || 0) - (b.downloads || 0);
          break;
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt || 0).getTime() -
            new Date(b.updatedAt || 0).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = skills.length;

    // Apply pagination
    if (options.offset) {
      skills = skills.slice(options.offset);
    }

    if (options.limit) {
      skills = skills.slice(0, options.limit);
    }

    return {
      skills,
      total,
      query: options.query,
    };
  }

  /**
   * Get a skill by ID
   */
  async getSkill(id: string): Promise<MarketplaceSkill | null> {
    const index = await this.getIndex();
    return index.skills.find((s) => s.id === id) || null;
  }

  /**
   * Get skill content
   */
  async getSkillContent(skill: MarketplaceSkill): Promise<string | null> {
    if (!skill.rawUrl) {
      return null;
    }

    try {
      const response = await fetch(skill.rawUrl);
      if (response.ok) {
        return response.text();
      }
    } catch {
      // Fetch failed
    }

    return null;
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit = 20): Promise<{ tag: string; count: number }[]> {
    const index = await this.getIndex();
    const tagCounts = new Map<string, number>();

    for (const skill of index.skills) {
      for (const tag of skill.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return tags;
  }

  /**
   * Add a custom source
   */
  addSource(source: SkillSource): void {
    if (!this.config.sources) {
      this.config.sources = [];
    }
    this.config.sources.push(source);
    this.clearCache();
  }

  /**
   * Remove a custom source
   */
  removeSource(owner: string, repo: string): void {
    if (this.config.sources) {
      this.config.sources = this.config.sources.filter(
        (s) => s.owner !== owner || s.repo !== repo
      );
    }
    this.clearCache();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    if (existsSync(this.cachePath)) {
      unlinkSync(this.cachePath);
    }
    this.index = null;
  }
}

/**
 * Create a marketplace aggregator
 */
export function createMarketplaceAggregator(
  config?: MarketplaceConfig
): MarketplaceAggregator {
  return new MarketplaceAggregator(config);
}
