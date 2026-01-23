import { execSync } from 'node:child_process';
import { existsSync, rmSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { SkillIndex, SkillSummary, IndexSource } from './types.js';
import { discoverSkills, extractFrontmatter } from '../skills.js';

/**
 * Known skill repositories to index
 */
export const KNOWN_SKILL_REPOS = [
  { owner: 'anthropics', repo: 'courses', description: 'Anthropic official courses and skills' },
  { owner: 'vercel-labs', repo: 'ai-sdk-preview-internal-knowledge-base', description: 'Vercel AI SDK skills' },
  { owner: 'composioHQ', repo: 'awesome-claude-code-skills', description: 'Curated Claude Code skills' },
] as const;

/**
 * Index file path
 */
export const INDEX_PATH = join(homedir(), '.skillkit', 'index.json');
export const INDEX_CACHE_HOURS = 24;

/**
 * Fetch skills from a GitHub repository
 */
export async function fetchSkillsFromRepo(
  owner: string,
  repo: string
): Promise<{ skills: SkillSummary[]; error?: string }> {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const tempDir = join(tmpdir(), `skillkit-fetch-${randomUUID()}`);

  try {
    // Shallow clone for speed
    execSync(`git clone --depth 1 ${cloneUrl} ${tempDir}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
      timeout: 60000, // 60 second timeout
    });

    // Discover skills in the cloned repo
    const discoveredSkills = discoverSkills(tempDir);
    const skills: SkillSummary[] = [];

    for (const skill of discoveredSkills) {
      const skillMdPath = join(skill.path, 'SKILL.md');
      if (!existsSync(skillMdPath)) continue;

      try {
        const content = readFileSync(skillMdPath, 'utf-8');
        const frontmatter = extractFrontmatter(content);

        const summary: SkillSummary = {
          name: skill.name,
          description: skill.description || frontmatter?.description as string || 'No description',
          source: `${owner}/${repo}`,
          tags: (frontmatter?.tags as string[]) || [],
          compatibility: {
            frameworks: (frontmatter?.compatibility as Record<string, unknown>)?.frameworks as string[] || [],
            languages: (frontmatter?.compatibility as Record<string, unknown>)?.languages as string[] || [],
            libraries: (frontmatter?.compatibility as Record<string, unknown>)?.libraries as string[] || [],
          },
          popularity: 0,
          quality: 50,
          lastUpdated: new Date().toISOString(),
          verified: owner === 'anthropics' || owner === 'vercel-labs',
        };

        skills.push(summary);
      } catch {
        // Skip skills that fail to parse
      }
    }

    return { skills };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { skills: [], error: `Failed to fetch ${owner}/${repo}: ${message}` };
  } finally {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Fetch skills from all known repositories and build index
 */
export async function buildSkillIndex(
  repos: typeof KNOWN_SKILL_REPOS = KNOWN_SKILL_REPOS,
  onProgress?: (message: string) => void
): Promise<{ index: SkillIndex; errors: string[] }> {
  const allSkills: SkillSummary[] = [];
  const sources: IndexSource[] = [];
  const errors: string[] = [];

  for (const { owner, repo } of repos) {
    onProgress?.(`Fetching ${owner}/${repo}...`);

    const result = await fetchSkillsFromRepo(owner, repo);

    if (result.error) {
      errors.push(result.error);
    }

    if (result.skills.length > 0) {
      allSkills.push(...result.skills);
      sources.push({
        name: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        lastFetched: new Date().toISOString(),
        skillCount: result.skills.length,
      });
      onProgress?.(`  Found ${result.skills.length} skills`);
    } else if (!result.error) {
      onProgress?.(`  No skills found`);
    }
  }

  // Add fallback sample skills if no repos could be fetched
  if (allSkills.length === 0) {
    onProgress?.('No skills fetched, using sample index...');
    allSkills.push(...getSampleSkills());
    sources.push({
      name: 'skillkit-samples',
      url: 'https://github.com/skillkit/samples',
      lastFetched: new Date().toISOString(),
      skillCount: allSkills.length,
    });
  }

  const index: SkillIndex = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    skills: allSkills,
    sources,
  };

  return { index, errors };
}

/**
 * Save skill index to cache
 */
export function saveIndex(index: SkillIndex): void {
  const indexDir = join(homedir(), '.skillkit');
  if (!existsSync(indexDir)) {
    mkdirSync(indexDir, { recursive: true });
  }
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

/**
 * Load skill index from cache
 */
export function loadIndex(): SkillIndex | null {
  if (!existsSync(INDEX_PATH)) {
    return null;
  }

  try {
    const content = readFileSync(INDEX_PATH, 'utf-8');
    return JSON.parse(content) as SkillIndex;
  } catch {
    return null;
  }
}

/**
 * Check if index is stale
 */
export function isIndexStale(index: SkillIndex): boolean {
  const lastUpdated = new Date(index.lastUpdated);
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  return hoursSinceUpdate > INDEX_CACHE_HOURS;
}

/**
 * Get index status
 */
export function getIndexStatus(): 'missing' | 'stale' | 'fresh' {
  const index = loadIndex();
  if (!index) return 'missing';
  return isIndexStale(index) ? 'stale' : 'fresh';
}

/**
 * Sample skills fallback (when repos can't be fetched)
 */
function getSampleSkills(): SkillSummary[] {
  return [
    {
      name: 'react-best-practices',
      description: 'Modern React patterns including Server Components, hooks best practices, and performance optimization',
      source: 'skillkit/samples',
      tags: ['react', 'frontend', 'typescript', 'nextjs', 'performance'],
      compatibility: {
        frameworks: ['react', 'nextjs'],
        languages: ['typescript', 'javascript'],
        libraries: [],
      },
      popularity: 1500,
      quality: 95,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'tailwind-patterns',
      description: 'Tailwind CSS utility patterns, responsive design, and component styling best practices',
      source: 'skillkit/samples',
      tags: ['tailwind', 'css', 'styling', 'frontend', 'responsive'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['tailwindcss'],
      },
      popularity: 1200,
      quality: 92,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'typescript-strict-patterns',
      description: 'TypeScript strict mode patterns, type safety, and advanced type utilities',
      source: 'skillkit/samples',
      tags: ['typescript', 'types', 'safety', 'patterns'],
      compatibility: {
        frameworks: [],
        languages: ['typescript'],
        libraries: [],
      },
      popularity: 900,
      quality: 90,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'security-best-practices',
      description: 'Security patterns for web applications including XSS prevention, CSRF, and secure headers',
      source: 'skillkit/samples',
      tags: ['security', 'xss', 'csrf', 'headers', 'owasp'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript', 'python'],
        libraries: [],
      },
      popularity: 600,
      quality: 95,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'testing-patterns',
      description: 'Testing patterns with Vitest/Jest including mocking, assertions, and test organization',
      source: 'skillkit/samples',
      tags: ['vitest', 'jest', 'testing', 'typescript', 'mocking', 'tdd'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['vitest', 'jest'],
      },
      popularity: 700,
      quality: 86,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
  ];
}
