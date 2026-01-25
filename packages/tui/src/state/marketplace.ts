/**
 * Marketplace state management for SkillKit TUI
 */
import { detectProvider, loadConfig, extractFrontmatter } from '@skillkit/core';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { SkillItem, RepoInfo, FetchedSkill } from './types.js';

/**
 * Default popular repos - can be extended via config.marketplaceSources
 */
export const DEFAULT_REPOS: RepoInfo[] = [
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
 * Marketplace state
 */
export interface MarketplaceState {
  allSkills: FetchedSkill[];
  filteredSkills: FetchedSkill[];
  loading: boolean;
  error: string | null;
  currentRepo: string | null;
  fetchedRepos: Set<string>;
  failedRepos: string[];
  repos: RepoInfo[];
}

/**
 * Get marketplace repos from config or use defaults
 */
export function getMarketplaceRepos(): RepoInfo[] {
  try {
    const config = loadConfig();
    if (config.marketplaceSources?.length) {
      const configRepos: RepoInfo[] = config.marketplaceSources.map((source) => ({
        source,
        name: source.split('/').pop() || source,
      }));
      const existingSources = new Set(configRepos.map((r) => r.source));
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
 * Create initial marketplace state
 */
export function createMarketplaceState(): MarketplaceState {
  return {
    allSkills: [],
    filteredSkills: [],
    loading: false,
    error: null,
    currentRepo: null,
    fetchedRepos: new Set(),
    failedRepos: [],
    repos: getMarketplaceRepos(),
  };
}

/**
 * Try to read skill description from frontmatter
 */
export function readSkillDescription(skillPath: string): string | undefined {
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

/**
 * Fetch skills from a single repository
 */
export async function fetchRepoSkills(
  source: string,
  repos: RepoInfo[]
): Promise<{
  skills: FetchedSkill[];
  tempRoot?: string;
  error?: string;
}> {
  try {
    const provider = detectProvider(source);
    if (!provider) {
      return { skills: [], error: `Could not detect provider for: ${source}` };
    }

    const result = await provider.clone(source, '', { depth: 1 });

    if (!result.success || !result.discoveredSkills) {
      return { skills: [], error: result.error || 'Failed to fetch skills' };
    }

    const repoName = repos.find((r) => r.source === source)?.name || source;
    const skills: FetchedSkill[] = result.discoveredSkills.map((skill) => ({
      name: skill.name,
      source: source,
      repoName: repoName,
      description: readSkillDescription(skill.path),
    }));

    return { skills, tempRoot: result.tempRoot };
  } catch (err) {
    return {
      skills: [],
      error: err instanceof Error ? err.message : 'Failed to fetch repository',
    };
  }
}

/**
 * Clean up temp directory from fetch
 */
export function cleanupTempRoot(tempRoot: string): void {
  try {
    rmSync(tempRoot, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Filter skills by search query
 */
export function filterMarketplaceSkills(
  skills: FetchedSkill[],
  query: string
): FetchedSkill[] {
  if (!query.trim()) return skills;

  const lowerQuery = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.source.toLowerCase().includes(lowerQuery) ||
      s.repoName.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Convert fetched skills to skill items for display
 */
export function toSkillItems(skills: FetchedSkill[]): SkillItem[] {
  return skills.map((s) => ({
    name: s.name,
    description: s.description || s.repoName,
    source: s.source,
  }));
}

/**
 * Sort skills alphabetically by name
 */
export function sortSkillsByName(skills: FetchedSkill[]): FetchedSkill[] {
  return [...skills].sort((a, b) => a.name.localeCompare(b.name));
}
