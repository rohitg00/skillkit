import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import {
  RuleBasedCompressor,
  APIBasedCompressor,
  MemoryCompressor,
  LearningConsolidator,
  createRuleBasedCompressor,
  createAPIBasedCompressor,
  createMemoryCompressor,
} from '../compressor.js';
import type { Observation, Learning } from '../types.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Helper to create mock observations
const createObservation = (overrides: Partial<Observation> = {}): Observation => ({
  id: `obs-${Math.random().toString(36).slice(2, 9)}`,
  timestamp: new Date().toISOString(),
  sessionId: 'test-session',
  agent: 'claude-code',
  type: 'tool_use',
  content: {
    action: 'Test action',
    context: 'Test context',
  },
  relevance: 60,
  ...overrides,
});

// Helper to create mock learnings
const createLearning = (overrides: Partial<Learning> = {}): Learning => ({
  id: `learn-${Math.random().toString(36).slice(2, 9)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: 'session',
  title: 'Test Learning',
  content: 'Test content for learning',
  scope: 'project',
  tags: ['test'],
  useCount: 0,
  ...overrides,
});

describe('RuleBasedCompressor', () => {
  let compressor: RuleBasedCompressor;

  beforeEach(() => {
    compressor = new RuleBasedCompressor();
    vi.clearAllMocks();
  });

  describe('getType', () => {
    it('should return rule-based', () => {
      expect(compressor.getType()).toBe('rule-based');
    });
  });

  describe('compress', () => {
    it('should return empty result when observations below threshold', async () => {
      const observations = [createObservation(), createObservation()];

      const result = await compressor.compress(observations, { minObservations: 5 });

      expect(result.learnings).toHaveLength(0);
      expect(result.skippedObservationIds).toHaveLength(2);
    });

    it('should extract error-solution pairs', async () => {
      const observations = [
        createObservation({
          type: 'error',
          content: {
            action: 'Build failed',
            context: 'Running npm build',
            error: 'TypeError: Cannot read property of undefined',
          },
          relevance: 85,
        }),
        createObservation({
          type: 'solution',
          content: {
            action: 'Added null check',
            context: 'Fixed the TypeError',
            solution: 'Added optional chaining operator',
          },
          relevance: 90,
        }),
        createObservation({
          type: 'tool_use',
          content: {
            action: 'Some other action',
            context: 'Context',
          },
          relevance: 50,
        }),
      ];

      const result = await compressor.compress(observations, { minObservations: 2 });

      expect(result.learnings.length).toBeGreaterThanOrEqual(1);
      const errorSolutionLearning = result.learnings.find((l) =>
        l.title.includes('Error Resolution')
      );
      expect(errorSolutionLearning).toBeDefined();
    });

    it('should extract decision patterns', async () => {
      const observations = [
        createObservation({
          type: 'decision',
          content: {
            action: 'Use TypeScript',
            context: 'Choosing programming language',
          },
          relevance: 75,
        }),
        createObservation({
          type: 'decision',
          content: {
            action: 'Use React hooks',
            context: 'State management approach',
          },
          relevance: 75,
        }),
        createObservation({
          type: 'tool_use',
          content: {
            action: 'Filler',
            context: 'Context',
          },
          relevance: 50,
        }),
      ];

      const result = await compressor.compress(observations, { minObservations: 2 });

      expect(result.learnings.length).toBeGreaterThanOrEqual(1);
      const decisionLearning = result.learnings.find((l) => l.title.includes('Decision'));
      expect(decisionLearning).toBeDefined();
    });

    it('should filter by minimum importance', async () => {
      const observations = [
        createObservation({
          type: 'tool_use',
          content: { action: 'Low importance action', context: 'Context' },
          relevance: 50,
        }),
        createObservation({
          type: 'tool_use',
          content: { action: 'Another action', context: 'Context' },
          relevance: 50,
        }),
        createObservation({
          type: 'tool_use',
          content: { action: 'Third action', context: 'Context' },
          relevance: 50,
        }),
      ];

      const result = await compressor.compress(observations, {
        minObservations: 2,
        minImportance: 9, // Very high threshold
      });

      // Tool use patterns have low importance, so should be filtered
      expect(result.learnings.length).toBe(0);
    });

    it('should limit output to maxLearnings', async () => {
      const observations = [
        createObservation({
          type: 'error',
          content: { action: 'Error 1', context: 'Context', error: 'Error 1' },
          relevance: 85,
        }),
        createObservation({
          type: 'error',
          content: { action: 'Error 2', context: 'Context', error: 'Error 2' },
          relevance: 85,
        }),
        createObservation({
          type: 'error',
          content: { action: 'Error 3', context: 'Context', error: 'Error 3' },
          relevance: 85,
        }),
        createObservation({
          type: 'solution',
          content: { action: 'Solution 1', context: 'Context', solution: 'Solution' },
          relevance: 90,
        }),
      ];

      const result = await compressor.compress(observations, {
        minObservations: 2,
        maxLearnings: 2,
      });

      expect(result.learnings.length).toBeLessThanOrEqual(2);
    });

    it('should add additional tags to learnings', async () => {
      const observations = [
        createObservation({
          type: 'error',
          content: { action: 'Error', context: 'Context', error: 'Some error' },
          relevance: 85,
        }),
        createObservation({
          type: 'solution',
          content: { action: 'Fix', context: 'Context', solution: 'Fixed it' },
          relevance: 90,
        }),
        createObservation({
          type: 'tool_use',
          content: { action: 'Action', context: 'Context' },
          relevance: 50,
        }),
      ];

      const result = await compressor.compress(observations, {
        minObservations: 2,
        additionalTags: ['project-x', 'sprint-1'],
      });

      if (result.learnings.length > 0) {
        expect(result.learnings[0].tags).toContain('project-x');
        expect(result.learnings[0].tags).toContain('sprint-1');
      }
    });

    it('should calculate compression stats', async () => {
      const observations = [
        createObservation({ type: 'error', relevance: 85 }),
        createObservation({ type: 'solution', relevance: 90 }),
        createObservation({ type: 'tool_use', relevance: 50 }),
      ];

      const result = await compressor.compress(observations, { minObservations: 2 });

      expect(result.stats.inputCount).toBe(3);
      expect(result.stats.outputCount).toBe(result.learnings.length);
      expect(result.stats.compressionRatio).toBeDefined();
    });
  });
});

describe('APIBasedCompressor', () => {
  let compressor: APIBasedCompressor;

  beforeEach(() => {
    compressor = new APIBasedCompressor({
      provider: 'anthropic',
      apiKey: 'test-key',
      model: 'claude-3-haiku-20240307',
    });
    vi.clearAllMocks();
  });

  describe('getType', () => {
    it('should return api', () => {
      expect(compressor.getType()).toBe('api');
    });
  });

  describe('compress', () => {
    it('should return empty result when observations below threshold', async () => {
      const observations = [createObservation()];

      const result = await compressor.compress(observations, { minObservations: 5 });

      expect(result.learnings).toHaveLength(0);
    });

    it('should fall back to rule-based on API failure', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('API error'));

      const observations = [
        createObservation({ type: 'error', relevance: 85 }),
        createObservation({ type: 'solution', relevance: 90 }),
        createObservation({ type: 'tool_use', relevance: 50 }),
      ];

      const result = await compressor.compress(observations, { minObservations: 2 });

      // Should not throw, should return result from fallback
      expect(result.stats.inputCount).toBe(3);
    });
  });
});

describe('MemoryCompressor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should create with default engine', () => {
      const compressor = new MemoryCompressor('/test/project');
      expect(compressor.getEngineType()).toBe('rule-based');
    });

    it('should accept custom engine', () => {
      const apiEngine = new APIBasedCompressor({
        provider: 'openai',
        apiKey: 'test',
      });
      const compressor = new MemoryCompressor('/test/project', { engine: apiEngine });
      expect(compressor.getEngineType()).toBe('api');
    });
  });

  describe('setEngine', () => {
    it('should allow changing the engine', () => {
      const compressor = new MemoryCompressor('/test/project');
      expect(compressor.getEngineType()).toBe('rule-based');

      compressor.setEngine(
        new APIBasedCompressor({
          provider: 'anthropic',
          apiKey: 'test',
        })
      );
      expect(compressor.getEngineType()).toBe('api');
    });
  });

  describe('compressAndStore', () => {
    it('should compress and store learnings', async () => {
      const compressor = createMemoryCompressor('/test/project', {
        projectName: 'test-project',
      });

      const observations = [
        createObservation({
          type: 'error',
          content: { action: 'Error', context: 'Context', error: 'Test error' },
          relevance: 85,
        }),
        createObservation({
          type: 'solution',
          content: { action: 'Fix', context: 'Fixed error', solution: 'Applied fix' },
          relevance: 90,
        }),
        createObservation({ type: 'tool_use', relevance: 50 }),
      ];

      const { learnings, result } = await compressor.compressAndStore(observations, {
        minObservations: 2,
      });

      expect(result.stats.inputCount).toBe(3);
      // Learnings should have been created
      expect(learnings.length).toBe(result.learnings.length);
    });
  });
});

describe('LearningConsolidator', () => {
  let consolidator: LearningConsolidator;

  beforeEach(() => {
    consolidator = new LearningConsolidator();
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  describe('findSimilar', () => {
    it('should find similar learnings', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'React hooks best practices',
          tags: ['react', 'hooks'],
          patterns: ['best-practices'],
          content: 'When using React hooks, always follow the rules of hooks.',
        }),
        createLearning({
          id: 'l2',
          title: 'React hooks patterns',
          tags: ['react', 'hooks', 'patterns'],
          patterns: ['best-practices'],
          content: 'React hooks provide a way to use state in functional components.',
        }),
        createLearning({
          id: 'l3',
          title: 'TypeScript generics guide',
          tags: ['typescript', 'generics'],
          patterns: ['type-safety'],
          content: 'TypeScript generics allow you to write reusable type-safe code.',
        }),
      ];

      const pairs = consolidator.findSimilar(learnings, 0.5);

      // The two React hooks learnings should be similar
      expect(pairs.length).toBeGreaterThanOrEqual(1);
      const reactPair = pairs.find(
        ([a, b]) =>
          (a.id === 'l1' && b.id === 'l2') || (a.id === 'l2' && b.id === 'l1')
      );
      expect(reactPair).toBeDefined();
    });

    it('should not find similar for distinct learnings', () => {
      const learnings = [
        createLearning({
          title: 'React tutorial',
          tags: ['react', 'frontend'],
          content: 'React is a library for building user interfaces.',
        }),
        createLearning({
          title: 'Python basics',
          tags: ['python', 'backend'],
          content: 'Python is a versatile programming language.',
        }),
      ];

      const pairs = consolidator.findSimilar(learnings, 0.8);

      expect(pairs).toHaveLength(0);
    });
  });

  describe('merge', () => {
    it('should merge two learnings', () => {
      const l1 = createLearning({
        title: 'React hooks patterns',
        content: 'Content 1 about hooks',
        tags: ['react', 'hooks'],
        frameworks: ['react'],
        patterns: ['hooks'],
        useCount: 5,
        effectiveness: 80,
      });

      const l2 = createLearning({
        title: 'React hooks best practices',
        content: 'Content 2 about best practices for hooks in React applications',
        tags: ['react', 'best-practices'],
        frameworks: ['react', 'nextjs'],
        patterns: ['hooks', 'state-management'],
        useCount: 3,
        effectiveness: 70,
      });

      const merged = consolidator.merge(l1, l2);

      // Should combine tags
      expect(merged.tags).toContain('react');
      expect(merged.tags).toContain('hooks');
      expect(merged.tags).toContain('best-practices');

      // Should combine frameworks
      expect(merged.frameworks).toContain('react');
      expect(merged.frameworks).toContain('nextjs');

      // Should combine patterns
      expect(merged.patterns).toContain('hooks');
      expect(merged.patterns).toContain('state-management');

      // Should combine use count
      expect(merged.useCount).toBe(8);

      // Should keep higher effectiveness
      expect(merged.effectiveness).toBe(80);
    });
  });
});

describe('Factory functions', () => {
  it('createRuleBasedCompressor should create instance', () => {
    const compressor = createRuleBasedCompressor();
    expect(compressor).toBeInstanceOf(RuleBasedCompressor);
    expect(compressor.getType()).toBe('rule-based');
  });

  it('createAPIBasedCompressor should create instance', () => {
    const compressor = createAPIBasedCompressor({
      provider: 'anthropic',
      apiKey: 'test-key',
    });
    expect(compressor).toBeInstanceOf(APIBasedCompressor);
    expect(compressor.getType()).toBe('api');
  });

  it('createMemoryCompressor should create instance', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const compressor = createMemoryCompressor('/test/project');
    expect(compressor).toBeInstanceOf(MemoryCompressor);
  });
});
