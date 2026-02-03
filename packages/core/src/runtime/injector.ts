import { MemoryCache } from '../cache/memory.js';
import { parseSkillMd } from '../parser/references.js';
import type { ParsedSkillContent } from '../parser/references.js';

export interface RuntimeSkillSource {
  owner: string;
  repo: string;
}

export interface FetchedSkill {
  source: RuntimeSkillSource;
  skillId: string;
  parsed: ParsedSkillContent;
  fetchedAt: number;
}

function parseSource(source: string): RuntimeSkillSource {
  const parts = source.replace(/^https?:\/\/github\.com\//, '').split('/');
  if (parts.length < 2) {
    throw new Error(`Invalid source format: "${source}". Expected "owner/repo".`);
  }
  return { owner: parts[0], repo: parts[1] };
}

export class SkillInjector {
  private cache: MemoryCache<FetchedSkill>;

  constructor(cacheTtlMs?: number) {
    this.cache = new MemoryCache<FetchedSkill>({
      maxSize: 200,
      ttlMs: cacheTtlMs ?? 24 * 60 * 60 * 1000,
    });
  }

  async fetch(source: string, skillId: string): Promise<FetchedSkill> {
    const cacheKey = `${source}:${skillId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { owner, repo } = parseSource(source);
    const raw = await this.fetchRawSkillMd(owner, repo, skillId);
    const parsed = parseSkillMd(raw);

    const result: FetchedSkill = {
      source: { owner, repo },
      skillId,
      parsed,
      fetchedAt: Date.now(),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async inject(source: string, skillId: string): Promise<string> {
    const fetched = await this.fetch(source, skillId);
    return fetched.parsed.body;
  }

  private async fetchRawSkillMd(owner: string, repo: string, skillId: string): Promise<string> {
    const paths = [
      `${skillId}/SKILL.md`,
      `skills/${skillId}/SKILL.md`,
      `SKILL.md`,
    ];

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3.raw',
      'User-Agent': 'skillkit-runtime',
    };

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    for (const path of paths) {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      try {
        const response = await fetch(url, { headers });
        if (response.ok) {
          return await response.text();
        }
      } catch {
        continue;
      }
    }

    throw new Error(`SKILL.md not found in ${owner}/${repo} for skill "${skillId}"`);
  }

  clearCache(): void {
    this.cache.clear();
  }

  cacheStats() {
    return this.cache.stats();
  }
}
