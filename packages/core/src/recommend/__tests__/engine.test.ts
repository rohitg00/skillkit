import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine, createRecommendationEngine } from '../engine.js';
import { getTechTags } from '../types.js';
import type {
  SkillSummary,
  SkillIndex,
  ProjectProfile,
  ScoringWeights,
} from '../types.js';
import type { ProjectStack } from '../../context/types.js';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  // Sample project profile (React + TypeScript + Tailwind)
  const sampleProfile: ProjectProfile = {
    name: 'test-project',
    type: 'web-app',
    stack: {
      languages: [
        { name: 'typescript', version: '5.0.0', confidence: 100 },
        { name: 'javascript', confidence: 80 },
      ],
      frameworks: [
        { name: 'react', version: '19.0.0', confidence: 100 },
        { name: 'nextjs', version: '15.0.0', confidence: 100 },
      ],
      libraries: [
        { name: 'zustand', version: '4.5.0', confidence: 100 },
      ],
      styling: [
        { name: 'tailwindcss', version: '4.0.0', confidence: 100 },
      ],
      testing: [
        { name: 'vitest', version: '1.0.0', confidence: 100 },
      ],
      databases: [
        { name: 'supabase', confidence: 100 },
      ],
      tools: [
        { name: 'eslint', confidence: 100 },
      ],
      runtime: [],
    },
    patterns: {
      components: 'functional',
      stateManagement: 'zustand',
      styling: 'tailwind',
      testing: 'vitest',
    },
    installedSkills: [],
    excludedSkills: [],
  };

  // Sample skill index
  const sampleIndex: SkillIndex = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    skills: [
      {
        name: 'react-best-practices',
        description: 'Modern React patterns and hooks best practices',
        source: 'vercel-labs/agent-skills',
        tags: ['react', 'frontend', 'typescript', 'hooks'],
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
        description: 'Tailwind CSS v4 patterns and utility classes',
        source: 'vercel-labs/agent-skills',
        tags: ['tailwind', 'css', 'styling', 'frontend'],
        compatibility: {
          frameworks: [],
          languages: ['typescript', 'javascript'],
          libraries: ['tailwindcss'],
        },
        popularity: 800,
        quality: 90,
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        verified: true,
      },
      {
        name: 'python-fastapi',
        description: 'FastAPI best practices for Python APIs',
        source: 'python-skills/fastapi',
        tags: ['python', 'fastapi', 'backend', 'api'],
        compatibility: {
          frameworks: ['fastapi'],
          languages: ['python'],
          libraries: [],
        },
        popularity: 500,
        quality: 85,
        lastUpdated: new Date().toISOString(),
        verified: false,
      },
      {
        name: 'supabase-best-practices',
        description: 'Supabase integration patterns',
        source: 'supabase/skills',
        tags: ['supabase', 'database', 'auth', 'backend'],
        compatibility: {
          frameworks: [],
          languages: ['typescript', 'javascript'],
          libraries: ['@supabase/supabase-js'],
        },
        popularity: 600,
        quality: 88,
        lastUpdated: new Date().toISOString(),
        verified: true,
      },
      {
        name: 'vitest-testing',
        description: 'Testing patterns with Vitest',
        source: 'testing-skills/vitest',
        tags: ['vitest', 'testing', 'typescript'],
        compatibility: {
          frameworks: [],
          languages: ['typescript'],
          libraries: ['vitest'],
        },
        popularity: 400,
        quality: 82,
        lastUpdated: new Date().toISOString(),
        verified: false,
      },
      {
        name: 'old-react-patterns',
        description: 'React patterns (class components)',
        source: 'legacy/react-skills',
        tags: ['react', 'class-components'],
        compatibility: {
          frameworks: ['react'],
          languages: ['javascript'],
          libraries: [],
          minVersion: { react: '16.0.0' },
        },
        popularity: 100,
        quality: 50,
        lastUpdated: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // 400 days ago
        verified: false,
      },
    ],
    sources: [
      {
        name: 'vercel-labs',
        url: 'https://github.com/vercel-labs/agent-skills',
        lastFetched: new Date().toISOString(),
        skillCount: 2,
      },
    ],
  };

  beforeEach(() => {
    engine = new RecommendationEngine();
    engine.loadIndex(sampleIndex);
  });

  describe('scoreSkill', () => {
    it('should score skill with matching framework highly', () => {
      const reactSkill = sampleIndex.skills[0]; // react-best-practices
      const scored = engine.scoreSkill(sampleProfile, reactSkill);

      expect(scored.score).toBeGreaterThan(60);
      expect(scored.reasons.some((r) => r.category === 'framework')).toBe(true);
      expect(scored.reasons.find((r) => r.category === 'framework')?.weight).toBeGreaterThan(0);
    });

    it('should score skill with matching language', () => {
      const reactSkill = sampleIndex.skills[0];
      const scored = engine.scoreSkill(sampleProfile, reactSkill);

      expect(scored.reasons.some((r) => r.category === 'language')).toBe(true);
      expect(scored.reasons.find((r) => r.category === 'language')?.matched).toContain('typescript');
    });

    it('should score skill with matching library', () => {
      const tailwindSkill = sampleIndex.skills[1];
      const scored = engine.scoreSkill(sampleProfile, tailwindSkill);

      expect(scored.score).toBeGreaterThan(30);
    });

    it('should give low score to non-matching skill', () => {
      const pythonSkill = sampleIndex.skills[2]; // python-fastapi
      const scored = engine.scoreSkill(sampleProfile, pythonSkill);

      expect(scored.score).toBeLessThan(30);
      expect(scored.reasons.find((r) => r.category === 'framework')?.weight).toBe(0);
    });

    it('should include popularity bonus for popular skills', () => {
      const popularSkill = sampleIndex.skills[0]; // 1500 popularity
      const scored = engine.scoreSkill(sampleProfile, popularSkill);

      expect(scored.reasons.some((r) => r.category === 'popularity')).toBe(true);
      expect(scored.reasons.find((r) => r.category === 'popularity')?.weight).toBeGreaterThan(0);
    });

    it('should include quality score', () => {
      const highQualitySkill = sampleIndex.skills[0]; // 95 quality
      const scored = engine.scoreSkill(sampleProfile, highQualitySkill);

      expect(scored.reasons.some((r) => r.category === 'quality')).toBe(true);
    });

    it('should penalize outdated skills in freshness score', () => {
      const outdatedSkill = sampleIndex.skills[5]; // old-react-patterns, 400 days old
      const scored = engine.scoreSkill(sampleProfile, outdatedSkill);

      const freshnessReason = scored.reasons.find((r) => r.category === 'freshness');
      expect(freshnessReason?.weight).toBe(0);
    });

    it('should add warning for already installed skills', () => {
      const profileWithInstalled: ProjectProfile = {
        ...sampleProfile,
        installedSkills: ['react-best-practices'],
      };

      const scored = engine.scoreSkill(profileWithInstalled, sampleIndex.skills[0]);
      expect(scored.warnings).toContain('Already installed');
    });
  });

  describe('recommend', () => {
    it('should return recommendations sorted by score', () => {
      const result = engine.recommend(sampleProfile);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeLessThanOrEqual(10);

      // Check descending order
      for (let i = 1; i < result.recommendations.length; i++) {
        expect(result.recommendations[i - 1].score).toBeGreaterThanOrEqual(
          result.recommendations[i].score
        );
      }
    });

    it('should filter by minimum score', () => {
      const result = engine.recommend(sampleProfile, { minScore: 50 });

      for (const rec of result.recommendations) {
        expect(rec.score).toBeGreaterThanOrEqual(50);
      }
    });

    it('should respect limit option', () => {
      const result = engine.recommend(sampleProfile, { limit: 3 });

      expect(result.recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should exclude installed skills by default', () => {
      const profileWithInstalled: ProjectProfile = {
        ...sampleProfile,
        installedSkills: ['react-best-practices'],
      };

      const result = engine.recommend(profileWithInstalled);

      expect(result.recommendations.some((r) => r.skill.name === 'react-best-practices')).toBe(
        false
      );
    });

    it('should include installed skills when excludeInstalled is false', () => {
      const profileWithInstalled: ProjectProfile = {
        ...sampleProfile,
        installedSkills: ['react-best-practices'],
      };

      const result = engine.recommend(profileWithInstalled, { excludeInstalled: false });

      // May or may not include it depending on score, but it's not excluded
      expect(result.totalSkillsScanned).toBe(sampleIndex.skills.length);
    });

    it('should exclude explicitly excluded skills', () => {
      const profileWithExcluded: ProjectProfile = {
        ...sampleProfile,
        excludedSkills: ['react-best-practices'],
      };

      const result = engine.recommend(profileWithExcluded);

      expect(result.recommendations.some((r) => r.skill.name === 'react-best-practices')).toBe(
        false
      );
    });

    it('should filter by categories', () => {
      const result = engine.recommend(sampleProfile, { categories: ['testing'] });

      // Should only include skills with testing tag
      for (const rec of result.recommendations) {
        expect(rec.skill.tags?.includes('testing')).toBe(true);
      }
    });

    it('should include profile in result', () => {
      const result = engine.recommend(sampleProfile);

      expect(result.profile).toBe(sampleProfile);
    });

    it('should include totalSkillsScanned in result', () => {
      const result = engine.recommend(sampleProfile);

      expect(result.totalSkillsScanned).toBe(sampleIndex.skills.length);
    });

    it('should return empty results when no index loaded', () => {
      const emptyEngine = new RecommendationEngine();
      const result = emptyEngine.recommend(sampleProfile);

      expect(result.recommendations).toEqual([]);
      expect(result.totalSkillsScanned).toBe(0);
    });

    it('should strip reasons when includeReasons is false', () => {
      const result = engine.recommend(sampleProfile, { includeReasons: false });

      for (const rec of result.recommendations) {
        expect(rec.reasons).toEqual([]);
      }
    });
  });

  describe('search', () => {
    it('should find skills by name', () => {
      const results = engine.search({ query: 'react' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].skill.name).toContain('react');
    });

    it('should find skills by description', () => {
      const results = engine.search({ query: 'hooks' });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.skill.description?.includes('hooks'))).toBe(true);
    });

    it('should find skills by tags', () => {
      const results = engine.search({ query: 'frontend' });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.skill.tags?.includes('frontend'))).toBe(true);
    });

    it('should return matched terms', () => {
      const results = engine.search({ query: 'react typescript' });

      expect(results[0].matchedTerms.length).toBeGreaterThan(0);
    });

    it('should respect limit option', () => {
      const results = engine.search({ query: 'react', limit: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should filter by tags', () => {
      const results = engine.search({
        query: 'patterns',
        filters: { tags: ['tailwind'] },
      });

      for (const r of results) {
        expect(r.skill.tags?.includes('tailwind')).toBe(true);
      }
    });

    it('should filter by verified status', () => {
      const results = engine.search({
        query: 'react',
        filters: { verified: true },
      });

      for (const r of results) {
        expect(r.skill.verified).toBe(true);
      }
    });

    it('should use semantic matching by default', () => {
      // Search for 'frontend' should find related skills with frontend tag
      const results = engine.search({ query: 'frontend' });

      // Skills with 'frontend' tag should be found
      expect(results.some((r) => r.skill.tags?.includes('frontend'))).toBe(true);
      // React-best-practices has frontend tag
      expect(results.some((r) => r.skill.name === 'react-best-practices')).toBe(true);
    });

    it('should return empty results when no index loaded', () => {
      const emptyEngine = new RecommendationEngine();
      const results = emptyEngine.search({ query: 'react' });

      expect(results).toEqual([]);
    });

    it('should include snippet for matching skills', () => {
      const results = engine.search({ query: 'react' });

      const withSnippet = results.find((r) => r.snippet);
      expect(withSnippet).toBeDefined();
    });
  });

  describe('checkFreshness', () => {
    it('should return current for up-to-date skills', () => {
      const installedSkills: SkillSummary[] = [
        {
          name: 'modern-skill',
          compatibility: {
            frameworks: [],
            languages: [],
            libraries: [],
            minVersion: { react: '18.0.0' },
          },
        },
      ];

      const results = engine.checkFreshness(sampleProfile, installedSkills);

      expect(results[0].status).toBe('current');
    });

    it('should return outdated for skills targeting older versions', () => {
      const installedSkills: SkillSummary[] = [
        {
          name: 'old-skill',
          compatibility: {
            frameworks: [],
            languages: [],
            libraries: [],
            minVersion: { react: '16.0.0' },
          },
        },
      ];

      const results = engine.checkFreshness(sampleProfile, installedSkills);

      expect(results[0].status).toBe('outdated');
    });

    it('should return unknown for skills without version requirements', () => {
      const installedSkills: SkillSummary[] = [
        {
          name: 'no-version-skill',
        },
      ];

      const results = engine.checkFreshness(sampleProfile, installedSkills);

      expect(results[0].status).toBe('unknown');
    });
  });

  describe('custom weights', () => {
    it('should allow custom scoring weights', () => {
      const customWeights: Partial<ScoringWeights> = {
        framework: 60,
        language: 30,
        library: 5,
        tag: 5,
        popularity: 0,
        quality: 0,
        freshness: 0,
      };

      const customEngine = new RecommendationEngine(customWeights);
      customEngine.loadIndex(sampleIndex);

      const scored = customEngine.scoreSkill(sampleProfile, sampleIndex.skills[0]);

      // Framework should contribute more with higher weight
      const frameworkReason = scored.reasons.find((r) => r.category === 'framework');
      expect(frameworkReason?.weight).toBeGreaterThan(0);
    });
  });

  describe('createRecommendationEngine', () => {
    it('should create an engine with default weights', () => {
      const engine = createRecommendationEngine();
      expect(engine).toBeInstanceOf(RecommendationEngine);
    });

    it('should create an engine with custom weights', () => {
      const engine = createRecommendationEngine({ framework: 50 });
      expect(engine).toBeInstanceOf(RecommendationEngine);
    });
  });

  describe('index management', () => {
    it('should load and return index', () => {
      const engine = new RecommendationEngine();
      expect(engine.getIndex()).toBeNull();

      engine.loadIndex(sampleIndex);
      expect(engine.getIndex()).toBe(sampleIndex);
    });
  });

  describe('edge cases', () => {
    it('should handle empty project stack', () => {
      const emptyProfile: ProjectProfile = {
        name: 'empty-project',
        stack: {
          languages: [],
          frameworks: [],
          libraries: [],
          styling: [],
          testing: [],
          databases: [],
          tools: [],
          runtime: [],
        },
        installedSkills: [],
        excludedSkills: [],
      };

      const result = engine.recommend(emptyProfile);
      expect(result.recommendations).toBeDefined();
    });

    it('should handle skill with missing optional fields', () => {
      const minimalSkill: SkillSummary = {
        name: 'minimal-skill',
      };

      const scored = engine.scoreSkill(sampleProfile, minimalSkill);
      expect(scored).toBeDefined();
      expect(scored.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle skill with empty tags', () => {
      const noTagsSkill: SkillSummary = {
        name: 'no-tags-skill',
        tags: [],
      };

      const scored = engine.scoreSkill(sampleProfile, noTagsSkill);
      expect(scored).toBeDefined();
    });

    it('should handle profile with no patterns', () => {
      const noPatternProfile: ProjectProfile = {
        ...sampleProfile,
        patterns: undefined,
      };

      const scored = engine.scoreSkill(noPatternProfile, sampleIndex.skills[0]);
      expect(scored).toBeDefined();
    });

    it('should handle search with empty query', () => {
      const results = engine.search({ query: '' });
      expect(results).toEqual([]);
    });

    it('should handle search with no matching results', () => {
      const results = engine.search({ query: 'xyznonexistent123' });
      expect(results).toEqual([]);
    });
  });
});

describe('TAG_TO_TECH and getTechTags', () => {
  it('should map common packages to tags', () => {
    expect(getTechTags('react')).toContain('react');
    expect(getTechTags('next')).toContain('nextjs');
    expect(getTechTags('tailwindcss')).toContain('tailwind');
    expect(getTechTags('vitest')).toContain('vitest');
  });

  it('should return empty array for unknown tech', () => {
    expect(getTechTags('unknown-package-xyz')).toEqual([]);
  });
});
