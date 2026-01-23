import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MemoryIndexStore } from '../memory-index.js';
import type { Learning } from '../types.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

describe('MemoryIndexStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  const createMockLearning = (overrides: Partial<Learning> = {}): Learning => ({
    id: 'learn-1',
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-01-10T09:00:00.000Z',
    source: 'session',
    title: 'React hooks best practices',
    content: 'When using useEffect, always include cleanup functions for subscriptions.',
    scope: 'project',
    tags: ['react', 'hooks', 'best-practices'],
    frameworks: ['react'],
    useCount: 0,
    ...overrides,
  });

  describe('indexLearning', () => {
    it('should index a learning by keywords and tags', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new MemoryIndexStore('/test/project');
      const learning = createMockLearning();

      store.indexLearning(learning);

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
      const [, content] = vi.mocked(writeFileSync).mock.calls[0];

      // Should contain keyword entries
      expect(content).toContain('react');
      expect(content).toContain('hooks');
      expect(content).toContain('useeffect');
      expect(content).toContain('cleanup');
    });

    it('should add learning ID to existing keywords', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - existing-learn-1
tags:
  react:
    - existing-learn-1
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const learning = createMockLearning({ id: 'learn-2' });

      store.indexLearning(learning);

      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      // Should have both IDs under react keyword
      expect(content).toContain('existing-learn-1');
      expect(content).toContain('learn-2');
    });

    it('should index frameworks as tags', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new MemoryIndexStore('/test/project');
      const learning = createMockLearning({
        frameworks: ['nextjs', 'tailwind'],
      });

      store.indexLearning(learning);

      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('nextjs');
      expect(content).toContain('tailwind');
    });
  });

  describe('removeLearning', () => {
    it('should remove learning from all index entries', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - learn-1
    - learn-2
  hooks:
    - learn-1
  typescript:
    - learn-2
tags:
  react:
    - learn-1
  typescript:
    - learn-2
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      store.removeLearning('learn-1');

      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      // learn-1 should be removed
      expect(content).not.toMatch(/learn-1/);
      // learn-2 should still exist
      expect(content).toContain('learn-2');
      // hooks entry should be completely removed (was only learn-1)
      expect(content).not.toContain('hooks:');
    });
  });

  describe('searchByKeywords', () => {
    it('should find learnings by keywords', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - learn-1
    - learn-3
  hooks:
    - learn-1
  typescript:
    - learn-2
tags: {}
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.searchByKeywords('react hooks');

      // learn-1 matches both 'react' and 'hooks', should be first
      expect(results[0]).toBe('learn-1');
      expect(results).toContain('learn-3');
    });

    it('should return empty array for no matches', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - learn-1
tags: {}
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.searchByKeywords('python django');

      expect(results).toEqual([]);
    });

    it('should handle partial matches', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  authentication:
    - learn-1
  authorization:
    - learn-2
tags: {}
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.searchByKeywords('auth');

      expect(results).toContain('learn-1');
      expect(results).toContain('learn-2');
    });
  });

  describe('searchByTags', () => {
    it('should find learnings by tags', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries: {}
tags:
  react:
    - learn-1
    - learn-2
  nextjs:
    - learn-1
  express:
    - learn-3
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.searchByTags(['react', 'nextjs']);

      // learn-1 matches both tags, should be first
      expect(results[0]).toBe('learn-1');
      expect(results).toContain('learn-2');
      expect(results).not.toContain('learn-3');
    });

    it('should be case-insensitive', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries: {}
tags:
  react:
    - learn-1
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.searchByTags(['REACT']);

      expect(results).toContain('learn-1');
    });
  });

  describe('search', () => {
    it('should combine keyword and tag search', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  hooks:
    - learn-1
    - learn-2
  state:
    - learn-3
tags:
  react:
    - learn-1
    - learn-3
  vue:
    - learn-2
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.search('hooks', ['react']);

      // learn-1 matches both keyword and tag
      expect(results[0]).toBe('learn-1');
    });

    it('should handle keyword-only search', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  hooks:
    - learn-1
tags: {}
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.search('hooks');

      expect(results).toContain('learn-1');
    });

    it('should handle tag-only search', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries: {}
tags:
  react:
    - learn-1
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const results = store.search('', ['react']);

      expect(results).toContain('learn-1');
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags sorted', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries: {}
tags:
  react:
    - learn-1
  typescript:
    - learn-2
  nextjs:
    - learn-1
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const tags = store.getAllTags();

      expect(tags).toEqual(['nextjs', 'react', 'typescript']);
    });
  });

  describe('getTagCounts', () => {
    it('should return tag usage counts', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries: {}
tags:
  react:
    - learn-1
    - learn-2
    - learn-3
  typescript:
    - learn-1
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const counts = store.getTagCounts();

      expect(counts).toEqual({
        react: 3,
        typescript: 1,
      });
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild index from learnings', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new MemoryIndexStore('/test/project');
      const learnings: Learning[] = [
        {
          id: 'learn-1',
          createdAt: '2024-01-10T09:00:00.000Z',
          updatedAt: '2024-01-10T09:00:00.000Z',
          source: 'session',
          title: 'React patterns',
          content: 'Using React hooks effectively',
          scope: 'project',
          tags: ['react'],
          useCount: 0,
        },
        {
          id: 'learn-2',
          createdAt: '2024-01-10T09:00:00.000Z',
          updatedAt: '2024-01-10T09:00:00.000Z',
          source: 'session',
          title: 'TypeScript tips',
          content: 'TypeScript generics explained',
          scope: 'project',
          tags: ['typescript'],
          useCount: 0,
        },
      ];

      store.rebuildIndex(learnings);

      // Get the last write call (after both learnings are indexed)
      const calls = vi.mocked(writeFileSync).mock.calls;
      const [, content] = calls[calls.length - 1];
      expect(content).toContain('react');
      expect(content).toContain('typescript');
      expect(content).toContain('learn-1');
      expect(content).toContain('learn-2');
    });
  });

  describe('clear', () => {
    it('should clear the index', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - learn-1
tags:
  react:
    - learn-1
`);

      const store = new MemoryIndexStore('/test/project');
      store.clear();

      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('entries: {}');
      expect(content).toContain('tags: {}');
    });
  });

  describe('getStats', () => {
    it('should return index statistics', () => {
      const existingIndex = `
version: 1
lastUpdated: "2024-01-14T10:00:00.000Z"
entries:
  react:
    - learn-1
  hooks:
    - learn-1
  typescript:
    - learn-2
tags:
  react:
    - learn-1
  typescript:
    - learn-2
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingIndex);

      const store = new MemoryIndexStore('/test/project');
      const stats = store.getStats();

      expect(stats.keywords).toBe(3);
      expect(stats.tags).toBe(2);
      expect(stats.lastUpdated).toBe('2024-01-14T10:00:00.000Z');
    });
  });

  describe('exists', () => {
    it('should return true when file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const store = new MemoryIndexStore('/test/project');

      expect(store.exists()).toBe(true);
    });

    it('should return false when file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new MemoryIndexStore('/test/project');

      expect(store.exists()).toBe(false);
    });
  });
});
