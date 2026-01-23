import { useState, useCallback, useEffect } from 'react';
import { detectProvider, loadConfig, extractFrontmatter } from '@skillkit/core';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { SkillItem } from '../components/SkillList.js';

export interface RepoInfo {
  source: string;
  name: string;
}

// Default popular repos - can be extended via config.marketplaceSources
const DEFAULT_REPOS: RepoInfo[] = [
  { source: 'anthropics/skills', name: 'Anthropic Official' },
  { source: 'vercel-labs/agent-skills', name: 'Vercel Labs' },
  { source: 'expo/skills', name: 'Expo / React Native' },
  { source: 'remotion-dev/skills', name: 'Remotion Video' },
  { source: 'ComposioHQ/awesome-claude-skills', name: 'Composio Awesome' },
  { source: 'travisvn/awesome-claude-skills', name: 'Travis Awesome' },
  { source: 'mhattingpete/claude-skills-marketplace', name: 'Skills Marketplace' },
  { source: 'coreyhaines31/marketingskills', name: 'Marketing Skills' },
  { source: 'obra/superpowers', name: 'Superpowers TDD' },
  { source: 'softaworks/agent-toolkit', name: 'Softaworks Toolkit' },
  { source: 'wshobson/agents', name: 'Dev Patterns' },
  { source: 'langgenius/dify', name: 'Dify Frontend' },
  { source: 'trailofbits/skills', name: 'Trail of Bits Security' },
  { source: 'better-auth/skills', name: 'Better Auth' },
  { source: 'onmax/nuxt-skills', name: 'Nuxt / Vue' },
  { source: 'hyf0/vue-skills', name: 'Vue Best Practices' },
  { source: 'jezweb/claude-skills', name: 'Cloudflare / TanStack' },
  { source: 'elysiajs/skills', name: 'ElysiaJS / Bun' },
  { source: 'kadajett/agent-nestjs-skills', name: 'NestJS' },
  { source: 'callstackincubator/agent-skills', name: 'React Native' },
  { source: 'cloudai-x/threejs-skills', name: 'Three.js' },
  { source: 'emalorenzo/three-agent-skills', name: 'Three.js Advanced' },
  { source: 'dimillian/skills', name: 'SwiftUI iOS' },
  { source: 'stripe/ai', name: 'Stripe Payments' },
  { source: 'waynesutton/convexskills', name: 'Convex Backend' },
  { source: 'kepano/obsidian-skills', name: 'Obsidian Notes' },
  { source: 'jimliu/baoyu-skills', name: 'Baoyu Tools' },
  { source: 'giuseppe-trisciuoglio/developer-kit', name: 'Shadcn / Radix' },
  { source: 'openrouterteam/agent-skills', name: 'OpenRouter SDK' },
  { source: 'intellectronica/agent-skills', name: 'Context7' },
];

/**
 * Get marketplace repos from config or use defaults
 */
function getMarketplaceRepos(): RepoInfo[] {
  try {
    const config = loadConfig();
    if (config.marketplaceSources?.length) {
      // Merge config sources with defaults, config takes priority
      const configRepos: RepoInfo[] = config.marketplaceSources.map(source => ({
        source,
        name: source.split('/').pop() || source,
      }));
      // Add defaults that aren't in config
      const existingSources = new Set(configRepos.map(r => r.source));
      for (const repo of DEFAULT_REPOS) {
        if (!existingSources.has(repo.source)) {
          configRepos.push(repo);
        }
      }
      return configRepos;
    }
  } catch {
    // Config load failed, use defaults
  }
  return DEFAULT_REPOS;
}

/**
 * Try to read skill description from frontmatter
 */
function readSkillDescription(skillPath: string): string | undefined {
  const skillMdPath = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    return undefined;
  }
  try {
    const content = readFileSync(skillMdPath, 'utf-8');
    const frontmatter = extractFrontmatter(content);
    if (frontmatter && typeof frontmatter.description === 'string') {
      return frontmatter.description;
    }
  } catch {
    // Failed to read, return undefined
  }
  return undefined;
}

interface FetchedSkill {
  name: string;
  source: string;
  repoName: string;
  description?: string;
}

interface UseMarketplaceResult {
  skills: SkillItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  repos: RepoInfo[];
  currentRepo: string | null;
  failedRepos: string[];
  refresh: () => void;
  search: (query: string) => void;
  fetchRepo: (source: string) => Promise<void>;
  fetchAllRepos: () => Promise<void>;
}

export function useMarketplace(): UseMarketplaceResult {
  const [allSkills, setAllSkills] = useState<FetchedSkill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<FetchedSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [fetchedRepos, setFetchedRepos] = useState<Set<string>>(new Set());
  const [failedRepos, setFailedRepos] = useState<string[]>([]);
  const [repos] = useState<RepoInfo[]>(() => getMarketplaceRepos());

  const fetchRepo = useCallback(async (source: string) => {
    if (fetchedRepos.has(source)) return;

    setLoading(true);
    setError(null);
    setCurrentRepo(source);

    try {
      const provider = detectProvider(source);
      if (!provider) {
        throw new Error(`Could not detect provider for: ${source}`);
      }

      const result = await provider.clone(source, '', { depth: 1 });

      if (!result.success || !result.discoveredSkills) {
        throw new Error(result.error || 'Failed to fetch skills');
      }

      const repoName = repos.find(r => r.source === source)?.name || source;
      const newSkills: FetchedSkill[] = result.discoveredSkills.map(skill => ({
        name: skill.name,
        source: source,
        repoName: repoName,
        // Try to read description from skill frontmatter
        description: readSkillDescription(skill.path),
      }));

      setAllSkills(prev => {
        const updated = [...prev, ...newSkills];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });

      setFetchedRepos(prev => new Set([...prev, source]));

      if (result.tempRoot) {
        const { rmSync } = await import('node:fs');
        rmSync(result.tempRoot, { recursive: true, force: true });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch repository';
      setError(errorMsg);
      // Track failed repos for display
      setFailedRepos(prev => prev.includes(source) ? prev : [...prev, source]);
    } finally {
      setLoading(false);
      setCurrentRepo(null);
    }
  }, [fetchedRepos, repos]);

  const fetchAllRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const failures: string[] = [];

    for (const repo of repos) {
      if (!fetchedRepos.has(repo.source)) {
        setCurrentRepo(repo.source);
        try {
          await fetchRepo(repo.source);
        } catch (err) {
          // Track which repos failed
          failures.push(repo.source);
        }
      }
    }

    // Update failed repos list
    if (failures.length > 0) {
      setFailedRepos(prev => {
        const combined = [...prev, ...failures];
        return [...new Set(combined)]; // deduplicate
      });
    }

    setLoading(false);
    setCurrentRepo(null);
  }, [fetchRepo, fetchedRepos, repos]);

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredSkills(allSkills);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredSkills(
        allSkills.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.source.toLowerCase().includes(lowerQuery) ||
            s.repoName.toLowerCase().includes(lowerQuery) ||
            s.description?.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [allSkills]);

  const refresh = useCallback(() => {
    setFetchedRepos(new Set());
    setAllSkills([]);
    setFilteredSkills([]);
    setFailedRepos([]);
    setError(null);
  }, []);

  useEffect(() => {
    setFilteredSkills(allSkills);
  }, [allSkills]);

  const skills: SkillItem[] = filteredSkills.map((s) => ({
    name: s.name,
    description: s.description || s.repoName,
    source: s.source,
  }));

  return {
    skills,
    loading,
    error,
    totalCount: allSkills.length,
    repos,
    currentRepo,
    failedRepos,
    refresh,
    search,
    fetchRepo,
    fetchAllRepos,
  };
}
