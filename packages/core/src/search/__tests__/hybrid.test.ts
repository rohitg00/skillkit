import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SkillSummary, SkillIndex } from '../../recommend/types.js';

const mockSkills: SkillSummary[] = [
  {
    name: 'react-auth',
    description: 'Authentication utilities for React applications',
    tags: ['react', 'auth', 'authentication'],
    compatibility: {
      frameworks: ['react'],
      languages: ['typescript', 'javascript'],
      libraries: ['next-auth'],
    },
    popularity: 500,
    quality: 80,
    verified: true,
  },
  {
    name: 'vue-forms',
    description: 'Form validation library for Vue',
    tags: ['vue', 'forms', 'validation'],
    compatibility: {
      frameworks: ['vue'],
      languages: ['typescript', 'javascript'],
      libraries: [],
    },
    popularity: 300,
    quality: 75,
    verified: false,
  },
  {
    name: 'api-testing',
    description: 'API testing utilities for REST endpoints',
    tags: ['testing', 'api', 'rest'],
    compatibility: {
      frameworks: [],
      languages: ['typescript'],
      libraries: ['jest', 'supertest'],
    },
    popularity: 400,
    quality: 85,
    verified: true,
  },
  {
    name: 'login-helper',
    description: 'Helper functions for login and authentication flows',
    tags: ['auth', 'login', 'oauth'],
    compatibility: {
      frameworks: ['react', 'vue'],
      languages: ['typescript'],
      libraries: [],
    },
    popularity: 200,
    quality: 70,
    verified: false,
  },
];

const mockIndex: SkillIndex = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  skills: mockSkills,
  sources: [],
};

vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      throw new Error("Cannot find module 'better-sqlite3'");
    }),
  };
});

vi.mock('sqlite-vec', () => {
  return {
    load: vi.fn(),
  };
});

vi.mock('node-llama-cpp', () => {
  return {
    getLlama: vi.fn().mockImplementation(() => {
      throw new Error("Cannot find package 'node-llama-cpp'");
    }),
  };
});

describe('HybridSearchPipeline', () => {
  let HybridSearchPipeline: typeof import('../hybrid.js').HybridSearchPipeline;
  let createHybridSearchPipeline: typeof import('../hybrid.js').createHybridSearchPipeline;
  let pipeline: InstanceType<typeof HybridSearchPipeline>;

  beforeEach(async () => {
    const module = await import('../hybrid.js');
    HybridSearchPipeline = module.HybridSearchPipeline;
    createHybridSearchPipeline = module.createHybridSearchPipeline;
    pipeline = createHybridSearchPipeline();
  });

  afterEach(async () => {
    if (pipeline) {
      await pipeline.dispose();
    }
  });

  describe('initialization', () => {
    it('should create a pipeline', () => {
      expect(pipeline).toBeInstanceOf(HybridSearchPipeline);
    });

    it('should not be initialized before calling initialize()', () => {
      expect(pipeline.isInitialized()).toBe(false);
    });

    it('should be initialized after calling initialize()', async () => {
      await pipeline.initialize();
      expect(pipeline.isInitialized()).toBe(true);
    });

    it('should load skills index', async () => {
      pipeline.loadSkillsIndex(mockIndex);
      const stats = pipeline.getStats();
      expect(stats.skillCount).toBe(mockSkills.length);
    });
  });

  describe('search (keyword-only fallback)', () => {
    beforeEach(async () => {
      pipeline.loadSkillsIndex(mockIndex);
      await pipeline.initialize();
    });

    it('should find skills matching query', async () => {
      const response = await pipeline.search({ query: 'authentication' });

      expect(response.results.length).toBeGreaterThan(0);
      expect(response.results.some((r) => r.skill.name === 'react-auth')).toBe(true);
    });

    it('should find skills by tag', async () => {
      const response = await pipeline.search({ query: 'react' });

      expect(response.results.length).toBeGreaterThan(0);
      expect(response.results.some((r) => r.skill.tags?.includes('react'))).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await pipeline.search({ query: 'auth', limit: 2 });

      expect(response.results.length).toBeLessThanOrEqual(2);
    });

    it('should include timing information', async () => {
      const response = await pipeline.search({ query: 'test' });

      expect(typeof response.timing.totalMs).toBe('number');
      expect(response.timing.totalMs).toBeGreaterThanOrEqual(0);
      expect(response.timing.keywordSearchMs).toBeGreaterThanOrEqual(0);
    });

    it('should include stats', async () => {
      const response = await pipeline.search({ query: 'auth' });

      expect(response.stats.candidatesFromKeyword).toBeGreaterThan(0);
      expect(response.stats.totalMerged).toBeGreaterThan(0);
    });

    it('should return original query in response', async () => {
      const response = await pipeline.search({ query: 'authentication' });

      expect(response.query.original).toBe('authentication');
    });
  });

  describe('search with expansion', () => {
    beforeEach(async () => {
      pipeline.loadSkillsIndex(mockIndex);
      await pipeline.initialize();
    });

    it('should expand query and find more results', async () => {
      const response = await pipeline.search({
        query: 'auth',
        enableExpansion: true,
      });

      expect(response.results.length).toBeGreaterThan(0);
      expect(response.query.expanded).toBeDefined();
    });

    it('should include expanded terms in response', async () => {
      const response = await pipeline.search({
        query: 'auth',
        enableExpansion: true,
      });

      if (response.query.expanded) {
        expect(response.query.expanded.original).toBe('auth');
        expect(response.query.expanded.weights[0]).toBe(2.0);
      }
    });
  });

  describe('getStats', () => {
    it('should return stats before initialization', () => {
      const stats = pipeline.getStats();
      expect(stats.initialized).toBe(false);
      expect(stats.skillCount).toBe(0);
    });

    it('should return updated stats after loading index', async () => {
      pipeline.loadSkillsIndex(mockIndex);
      await pipeline.initialize();

      const stats = pipeline.getStats();
      expect(stats.initialized).toBe(true);
      expect(stats.skillCount).toBe(mockSkills.length);
    });
  });
});

describe('hybridSearch helper', () => {
  let hybridSearch: typeof import('../hybrid.js').hybridSearch;

  beforeEach(async () => {
    const module = await import('../hybrid.js');
    hybridSearch = module.hybridSearch;
  });

  it('should perform search on skills array', async () => {
    const response = await hybridSearch(mockSkills, 'react');

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.query.original).toBe('react');
  });

  it('should respect options', async () => {
    const response = await hybridSearch(mockSkills, 'auth', {
      limit: 1,
    });

    expect(response.results.length).toBe(1);
  });
});
