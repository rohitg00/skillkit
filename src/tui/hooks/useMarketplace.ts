import { useState, useCallback, useEffect } from 'react';
import { detectProvider } from '../../providers/index.js';
import type { SkillItem } from '../components/SkillList.js';

export interface RepoInfo {
  source: string;
  name: string;
}

const POPULAR_REPOS: RepoInfo[] = [
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

      const repoName = POPULAR_REPOS.find(r => r.source === source)?.name || source;
      const newSkills: FetchedSkill[] = result.discoveredSkills.map(skill => ({
        name: skill.name,
        source: source,
        repoName: repoName,
        description: undefined,
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
      setError(err instanceof Error ? err.message : 'Failed to fetch repository');
    } finally {
      setLoading(false);
      setCurrentRepo(null);
    }
  }, [fetchedRepos]);

  const fetchAllRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    for (const repo of POPULAR_REPOS) {
      if (!fetchedRepos.has(repo.source)) {
        setCurrentRepo(repo.source);
        try {
          await fetchRepo(repo.source);
        } catch {
        }
      }
    }

    setLoading(false);
    setCurrentRepo(null);
  }, [fetchRepo, fetchedRepos]);

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
    repos: POPULAR_REPOS,
    currentRepo,
    refresh,
    search,
    fetchRepo,
    fetchAllRepos,
  };
}
