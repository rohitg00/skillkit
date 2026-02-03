export interface ExternalSkill {
  name: string;
  description: string;
  source: string;
  registry: string;
  path?: string;
  stars?: number;
  updatedAt?: string;
}

export interface ExternalRegistry {
  name: string;
  search(query: string, options?: { limit?: number; timeoutMs?: number }): Promise<ExternalSkill[]>;
}

export interface FederatedResult {
  skills: ExternalSkill[];
  registries: string[];
  total: number;
  query: string;
}

export class RateLimitError extends Error {
  constructor(registry: string) {
    super(`Rate limited by ${registry} API. Authenticate with a token or wait before retrying.`);
    this.name = 'RateLimitError';
  }
}

export class GitHubSkillRegistry implements ExternalRegistry {
  name = 'github';
  private baseUrl = 'https://api.github.com';

  async search(query: string, options?: { limit?: number; timeoutMs?: number }): Promise<ExternalSkill[]> {
    const limit = options?.limit ?? 20;
    const timeoutMs = options?.timeoutMs ?? 10_000;
    const searchQuery = `SKILL.md ${query} in:path,file`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${limit}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'skillkit-cli',
          },
          signal: controller.signal,
        },
      );
      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 403) {
          throw new RateLimitError(this.name);
        }
        return [];
      }

      const data = (await response.json()) as {
        items?: Array<{
          repository: {
            full_name: string;
            description?: string;
            html_url: string;
            stargazers_count?: number;
            updated_at?: string;
          };
          path: string;
          name: string;
        }>;
      };

      if (!data.items) return [];

      const seen = new Set<string>();
      const skills: ExternalSkill[] = [];

      for (const item of data.items) {
        const repo = item.repository.full_name;
        if (seen.has(repo)) continue;
        seen.add(repo);

        const pathParts = item.path.split('/');
        const skillName =
          pathParts.length > 1
            ? pathParts[pathParts.length - 2]
            : repo.split('/').pop() || repo;

        skills.push({
          name: skillName,
          description: item.repository.description || '',
          source: item.repository.html_url,
          registry: this.name,
          path: item.path,
          stars: item.repository.stargazers_count,
          updatedAt: item.repository.updated_at,
        });
      }

      return skills;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof RateLimitError) throw err;
      return [];
    }
  }
}

export class FederatedSearch {
  private registries: ExternalRegistry[] = [];

  addRegistry(registry: ExternalRegistry): void {
    this.registries.push(registry);
  }

  async search(query: string, options?: { limit?: number }): Promise<FederatedResult> {
    const limit = options?.limit ?? 20;
    const results = await Promise.allSettled(
      this.registries.map((r) => r.search(query, { limit })),
    );

    const allSkills: ExternalSkill[] = [];
    const activeRegistries: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allSkills.push(...result.value);
        activeRegistries.push(this.registries[i].name);
      } else if (result.status === 'rejected' && result.reason instanceof RateLimitError) {
        throw result.reason;
      }
    }

    const seen = new Set<string>();
    const deduplicated: ExternalSkill[] = [];
    for (const skill of allSkills) {
      const key = `${skill.source}:${skill.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(skill);
      }
    }

    deduplicated.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

    return {
      skills: deduplicated.slice(0, limit),
      registries: activeRegistries,
      total: deduplicated.length,
      query,
    };
  }
}
