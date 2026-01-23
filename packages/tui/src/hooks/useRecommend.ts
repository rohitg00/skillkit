import { useState, useCallback, useEffect } from 'react';
import {
  RecommendationEngine,
  ContextManager,
  type ScoredSkill,
  type ProjectProfile,
  type SkillIndex,
  type SkillSummary,
} from '@skillkit/core';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const INDEX_PATH = join(process.env.HOME || '~', '.skillkit', 'index.json');
const INDEX_CACHE_HOURS = 24;

interface UseRecommendResult {
  recommendations: ScoredSkill[];
  profile: ProjectProfile | null;
  loading: boolean;
  error: string | null;
  totalScanned: number;
  indexStatus: 'missing' | 'stale' | 'fresh';
  refresh: () => void;
  updateIndex: () => void;
  search: (query: string) => void;
  searchResults: ScoredSkill[];
}

/**
 * Sample skills for the index (matches CLI implementation)
 */
function getSampleSkills(): SkillSummary[] {
  return [
    {
      name: 'vercel-react-best-practices',
      description: 'Modern React patterns including Server Components, hooks best practices, and performance optimization',
      source: 'vercel-labs/agent-skills',
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
      name: 'tailwind-v4-patterns',
      description: 'Tailwind CSS v4 utility patterns, responsive design, and component styling best practices',
      source: 'vercel-labs/agent-skills',
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
      name: 'nextjs-app-router',
      description: 'Next.js App Router patterns including layouts, server actions, and data fetching',
      source: 'vercel-labs/agent-skills',
      tags: ['nextjs', 'react', 'routing', 'server-actions', 'frontend'],
      compatibility: {
        frameworks: ['nextjs'],
        languages: ['typescript', 'javascript'],
        libraries: [],
      },
      popularity: 1100,
      quality: 94,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'typescript-strict-patterns',
      description: 'TypeScript strict mode patterns, type safety, and advanced type utilities',
      source: 'anthropics/skills',
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
      name: 'supabase-best-practices',
      description: 'Supabase integration patterns including auth, database queries, and real-time subscriptions',
      source: 'anthropics/skills',
      tags: ['supabase', 'database', 'auth', 'backend', 'postgresql'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['@supabase/supabase-js'],
      },
      popularity: 800,
      quality: 88,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'vitest-testing-patterns',
      description: 'Testing patterns with Vitest including mocking, assertions, and test organization',
      source: 'anthropics/skills',
      tags: ['vitest', 'testing', 'typescript', 'mocking', 'tdd'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['vitest'],
      },
      popularity: 700,
      quality: 86,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
    {
      name: 'prisma-database-patterns',
      description: 'Prisma ORM patterns for schema design, migrations, and efficient queries',
      source: 'vercel-labs/agent-skills',
      tags: ['prisma', 'database', 'orm', 'postgresql', 'backend'],
      compatibility: {
        frameworks: [],
        languages: ['typescript'],
        libraries: ['@prisma/client'],
      },
      popularity: 850,
      quality: 89,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'security-best-practices',
      description: 'Security patterns for web applications including XSS prevention, CSRF, and secure headers',
      source: 'trailofbits/skills',
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
      name: 'python-fastapi-patterns',
      description: 'FastAPI best practices for building high-performance Python APIs',
      source: 'python-skills/fastapi',
      tags: ['python', 'fastapi', 'backend', 'api', 'async'],
      compatibility: {
        frameworks: ['fastapi'],
        languages: ['python'],
        libraries: [],
      },
      popularity: 550,
      quality: 85,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
    {
      name: 'zustand-state-management',
      description: 'Zustand state management patterns for React applications',
      source: 'react-skills/state',
      tags: ['zustand', 'react', 'state-management', 'frontend'],
      compatibility: {
        frameworks: ['react'],
        languages: ['typescript', 'javascript'],
        libraries: ['zustand'],
      },
      popularity: 650,
      quality: 84,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
  ];
}

export function useRecommend(projectPath: string = process.cwd()): UseRecommendResult {
  const [recommendations, setRecommendations] = useState<ScoredSkill[]>([]);
  const [searchResults, setSearchResults] = useState<ScoredSkill[]>([]);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScanned, setTotalScanned] = useState(0);
  const [indexStatus, setIndexStatus] = useState<'missing' | 'stale' | 'fresh'>('missing');
  const [engine] = useState(() => new RecommendationEngine());

  const loadIndex = useCallback((): SkillIndex | null => {
    if (!existsSync(INDEX_PATH)) {
      setIndexStatus('missing');
      return null;
    }

    try {
      const content = readFileSync(INDEX_PATH, 'utf-8');
      const index = JSON.parse(content) as SkillIndex;

      // Check if index is stale
      const lastUpdated = new Date(index.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > INDEX_CACHE_HOURS) {
        setIndexStatus('stale');
      } else {
        setIndexStatus('fresh');
      }

      return index;
    } catch {
      setIndexStatus('missing');
      return null;
    }
  }, []);

  const getProjectProfile = useCallback((): ProjectProfile | null => {
    try {
      const manager = new ContextManager(projectPath);
      let context = manager.get();

      if (!context) {
        context = manager.init();
      }

      if (!context) {
        return null;
      }

      return {
        name: context.project.name,
        type: context.project.type,
        stack: context.stack,
        patterns: context.patterns,
        installedSkills: context.skills?.installed || [],
        excludedSkills: context.skills?.excluded || [],
      };
    } catch {
      return null;
    }
  }, [projectPath]);

  const loadRecommendations = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Load project profile
      const projectProfile = getProjectProfile();
      if (!projectProfile) {
        setError('Failed to analyze project');
        setLoading(false);
        return;
      }
      setProfile(projectProfile);

      // Load skill index
      const index = loadIndex();
      if (!index || index.skills.length === 0) {
        setRecommendations([]);
        setTotalScanned(0);
        setLoading(false);
        return;
      }

      engine.loadIndex(index);

      // Get recommendations
      const result = engine.recommend(projectProfile, {
        limit: 20,
        minScore: 20,
        excludeInstalled: true,
        includeReasons: true,
      });

      setRecommendations(result.recommendations);
      setTotalScanned(result.totalSkillsScanned);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, [engine, getProjectProfile, loadIndex]);

  const updateIndex = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const sampleIndex: SkillIndex = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        skills: getSampleSkills(),
        sources: [
          {
            name: 'vercel-labs',
            url: 'https://github.com/vercel-labs/agent-skills',
            lastFetched: new Date().toISOString(),
            skillCount: 5,
          },
          {
            name: 'anthropics',
            url: 'https://github.com/anthropics/skills',
            lastFetched: new Date().toISOString(),
            skillCount: 3,
          },
        ],
      };

      // Save index
      const indexDir = join(process.env.HOME || '~', '.skillkit');
      if (!existsSync(indexDir)) {
        mkdirSync(indexDir, { recursive: true });
      }

      writeFileSync(INDEX_PATH, JSON.stringify(sampleIndex, null, 2));
      setIndexStatus('fresh');

      // Reload recommendations
      loadRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update index');
      setLoading(false);
    }
  }, [loadRecommendations]);

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = engine.search({
      query,
      limit: 10,
      semantic: true,
    });

    // Convert SearchResult to ScoredSkill for consistency
    const scoredResults: ScoredSkill[] = results.map(r => ({
      skill: r.skill,
      score: r.relevance,
      reasons: r.matchedTerms.map(term => ({
        category: 'tag' as const,
        description: `Matched: ${term}`,
        weight: 0,
        matched: [term],
      })),
      warnings: [],
    }));

    setSearchResults(scoredResults);
  }, [engine]);

  const refresh = useCallback(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Initial load
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    profile,
    loading,
    error,
    totalScanned,
    indexStatus,
    refresh,
    updateIndex,
    search,
    searchResults,
  };
}
