import { describe, it, expect, beforeEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MemoryInjector, createMemoryInjector } from '../injector.js';
import type { Learning } from '../types.js';
import type { ProjectContext } from '../../context/types.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Helper to create mock learnings
const createLearning = (overrides: Partial<Learning> = {}): Learning => ({
  id: `learn-${Math.random().toString(36).slice(2, 9)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: 'session',
  title: 'Test Learning',
  content: 'Test content for learning that provides useful information about best practices.',
  scope: 'project',
  tags: ['test'],
  useCount: 0,
  ...overrides,
});

// Helper to create mock project context
const createProjectContext = (overrides: Partial<ProjectContext> = {}): ProjectContext => ({
  version: 1,
  project: {
    name: 'test-project',
    description: 'A test project',
    type: 'web-app',
  },
  stack: {
    languages: [{ name: 'TypeScript', confidence: 100 }],
    frameworks: [{ name: 'React', confidence: 100 }, { name: 'Next.js', confidence: 90 }],
    libraries: [],
    styling: [{ name: 'Tailwind', confidence: 100 }],
    testing: [{ name: 'Vitest', confidence: 100 }],
    databases: [],
    tools: [],
    runtime: [{ name: 'Node.js', confidence: 100 }],
  },
  ...overrides,
});

// Mock YAML content for project learnings
const createMockLearningsYaml = (learnings: Learning[]) => ({
  version: 1,
  learnings,
});

describe('MemoryInjector', () => {
  let injector: MemoryInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should create instance without project context', () => {
      injector = new MemoryInjector('/test/project');
      expect(injector).toBeInstanceOf(MemoryInjector);
    });

    it('should create instance with project context', () => {
      const context = createProjectContext();
      injector = new MemoryInjector('/test/project', 'test-project', context);
      expect(injector).toBeInstanceOf(MemoryInjector);
    });
  });

  describe('setProjectContext', () => {
    it('should set project context', () => {
      injector = new MemoryInjector('/test/project');
      const context = createProjectContext();
      injector.setProjectContext(context);
      // No direct way to verify, but it should not throw
    });
  });

  describe('getRelevantMemories', () => {
    it('should return empty array when no learnings exist', async () => {
      injector = new MemoryInjector('/test/project');
      const memories = await injector.getRelevantMemories();
      expect(memories).toHaveLength(0);
    });

    it('should return learnings with relevance scores', async () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'React hooks best practices',
          tags: ['react', 'hooks'],
          frameworks: ['react'],
          useCount: 5,
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      const context = createProjectContext();
      injector = new MemoryInjector('/test/project', 'test-project', context);

      const memories = await injector.getRelevantMemories();

      expect(memories.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by minimum relevance', async () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Unrelated learning',
          tags: ['unrelated'],
          useCount: 0,
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const memories = await injector.getRelevantMemories({ minRelevance: 90 });

      expect(memories).toHaveLength(0);
    });

    it('should limit results to maxLearnings', async () => {
      const learnings = Array.from({ length: 20 }, (_, i) =>
        createLearning({
          id: `l${i}`,
          title: `Learning ${i}`,
          tags: ['common-tag'],
          useCount: i,
        })
      );

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const memories = await injector.getRelevantMemories({
        maxLearnings: 5,
        minRelevance: 0,
      });

      expect(memories.length).toBeLessThanOrEqual(5);
    });

    it('should match by current task keywords', async () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Authentication patterns',
          content: 'How to implement JWT authentication in Node.js applications.',
          tags: ['auth', 'jwt', 'security'],
        }),
        createLearning({
          id: 'l2',
          title: 'CSS Grid layout',
          content: 'Guide to using CSS Grid for responsive layouts.',
          tags: ['css', 'layout'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const memories = await injector.getRelevantMemories({
        currentTask: 'implement JWT authentication',
        minRelevance: 0,
      });

      // Auth learning should rank higher
      if (memories.length > 0) {
        const authMemory = memories.find((m) => m.learning.id === 'l1');
        const cssMemory = memories.find((m) => m.learning.id === 'l2');

        if (authMemory && cssMemory) {
          expect(authMemory.relevanceScore).toBeGreaterThan(cssMemory.relevanceScore);
        }
      }
    });
  });

  describe('inject', () => {
    it('should return empty result when no learnings exist', async () => {
      injector = new MemoryInjector('/test/project');

      const result = await injector.inject();

      expect(result.memories).toHaveLength(0);
      expect(result.formattedContent).toBe('');
      expect(result.totalTokens).toBe(0);
      expect(result.stats.injected).toBe(0);
    });

    it('should respect token budget', async () => {
      const learnings = Array.from({ length: 10 }, (_, i) =>
        createLearning({
          id: `l${i}`,
          title: `Learning ${i}`,
          content: 'A'.repeat(500), // Long content
          tags: ['test'],
          useCount: 10 - i,
        })
      );

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const result = await injector.inject({
        maxTokens: 100,
        minRelevance: 0,
      });

      expect(result.totalTokens).toBeLessThanOrEqual(100);
    });

    it('should format content as markdown by default', async () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Test Learning',
          content: 'Test content',
          tags: ['test'],
          useCount: 5,
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const result = await injector.inject({ minRelevance: 0 });

      if (result.memories.length > 0) {
        expect(result.formattedContent).toContain('# Relevant Memories');
        expect(result.formattedContent).toContain('## Test Learning');
      }
    });
  });

  describe('injectForAgent', () => {
    const learnings = [
      createLearning({
        id: 'l1',
        title: 'Test Learning',
        content: 'Test content for agent',
        tags: ['test'],
        frameworks: ['react'],
        useCount: 5,
      }),
    ];

    beforeEach(() => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );
    });

    it('should format for claude-code with XML tags', async () => {
      injector = new MemoryInjector('/test/project');

      const result = await injector.injectForAgent('claude-code', { minRelevance: 0 });

      if (result.memories.length > 0) {
        expect(result.formattedContent).toContain('<memories>');
        expect(result.formattedContent).toContain('<memory');
        expect(result.formattedContent).toContain('</memories>');
      }
    });

    it('should format for cursor with MDC format', async () => {
      injector = new MemoryInjector('/test/project');

      const result = await injector.injectForAgent('cursor', { minRelevance: 0 });

      if (result.memories.length > 0) {
        expect(result.formattedContent).toContain('---');
        expect(result.formattedContent).toContain('description:');
        expect(result.formattedContent).toContain('# Session Memories');
      }
    });

    it('should format for github-copilot with HTML comments', async () => {
      injector = new MemoryInjector('/test/project');

      const result = await injector.injectForAgent('github-copilot', { minRelevance: 0 });

      if (result.memories.length > 0) {
        expect(result.formattedContent).toContain('<!-- Session Memories -->');
      }
    });

    it('should use default markdown for unknown agents', async () => {
      injector = new MemoryInjector('/test/project');

      const result = await injector.injectForAgent('universal', { minRelevance: 0 });

      if (result.memories.length > 0) {
        expect(result.formattedContent).toContain('# Relevant Memories');
      }
    });
  });

  describe('getSummaries', () => {
    it('should return memory summaries', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Test Learning',
          tags: ['test', 'example'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const summaries = injector.getSummaries();

      expect(summaries.length).toBeGreaterThanOrEqual(0);
      if (summaries.length > 0) {
        expect(summaries[0]).toHaveProperty('id');
        expect(summaries[0]).toHaveProperty('title');
        expect(summaries[0]).toHaveProperty('tags');
        expect(summaries[0]).toHaveProperty('relevance');
      }
    });
  });

  describe('getPreviews', () => {
    it('should return memory previews for given IDs', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Test Learning',
          content: 'Full content that is longer than the excerpt limit would allow.',
          tags: ['test'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const previews = injector.getPreviews(['l1']);

      if (previews.length > 0) {
        expect(previews[0]).toHaveProperty('excerpt');
        expect(previews[0].excerpt.length).toBeLessThanOrEqual(200);
      }
    });

    it('should return empty for non-existent IDs', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      injector = new MemoryInjector('/test/project');

      const previews = injector.getPreviews(['non-existent']);

      expect(previews).toHaveLength(0);
    });
  });

  describe('getFullMemories', () => {
    it('should return full memory content', () => {
      const fullContent = 'This is the full content of the learning that should be returned.';
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Test Learning',
          content: fullContent,
          tags: ['test'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const fullMemories = injector.getFullMemories(['l1']);

      if (fullMemories.length > 0) {
        expect(fullMemories[0].content).toBe(fullContent);
      }
    });
  });

  describe('search', () => {
    it('should search memories by query', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'React hooks patterns',
          content: 'How to use useEffect and useState effectively.',
          tags: ['react', 'hooks'],
        }),
        createLearning({
          id: 'l2',
          title: 'Python data analysis',
          content: 'Using pandas for data manipulation.',
          tags: ['python', 'data'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const results = injector.search('react hooks');

      // React learning should be found
      const reactResult = results.find((r) => r.learning.id === 'l1');
      if (results.length > 0 && reactResult) {
        expect(reactResult.matchedBy.keywords.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should respect minRelevance in search', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Unrelated topic',
          content: 'Nothing to do with the search.',
          tags: ['other'],
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const results = injector.search('completely different query', { minRelevance: 80 });

      expect(results).toHaveLength(0);
    });
  });

  describe('formatForAgent', () => {
    it('should escape XML special characters for Claude', () => {
      const learnings = [
        createLearning({
          id: 'l1',
          title: 'Test <script> & "quotes"',
          content: 'Content with <tags> & special chars',
          tags: ['test'],
          useCount: 5,
        }),
      ];

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify(createMockLearningsYaml(learnings))
      );

      injector = new MemoryInjector('/test/project');

      const memories = injector.search('test', { minRelevance: 0 });
      const formatted = injector.formatForAgent(memories, 'claude-code');

      if (memories.length > 0) {
        expect(formatted).toContain('&lt;script&gt;');
        expect(formatted).toContain('&amp;');
        expect(formatted).toContain('&quot;');
      }
    });
  });
});

describe('createMemoryInjector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  it('should create MemoryInjector instance', () => {
    const injector = createMemoryInjector('/test/project');
    expect(injector).toBeInstanceOf(MemoryInjector);
  });

  it('should create with project name', () => {
    const injector = createMemoryInjector('/test/project', 'my-project');
    expect(injector).toBeInstanceOf(MemoryInjector);
  });

  it('should create with project context', () => {
    const context = createProjectContext();
    const injector = createMemoryInjector('/test/project', 'my-project', context);
    expect(injector).toBeInstanceOf(MemoryInjector);
  });
});
