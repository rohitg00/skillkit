import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { LearningStore } from '../learning-store.js';
import type { Learning } from '../types.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

describe('LearningStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should set project file path for project scope', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const store = new LearningStore('project', '/test/project', 'my-project');
      expect(store.getScope()).toBe('project');
    });

    it('should set global file path for global scope', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const store = new LearningStore('global');
      expect(store.getScope()).toBe('global');
    });
  });

  describe('add', () => {
    it('should add a new learning', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new LearningStore('project', '/test/project', 'my-project');
      const learning = store.add({
        source: 'session',
        title: 'React hooks best practices',
        content: 'When using useEffect, always include cleanup functions...',
        tags: ['react', 'hooks', 'best-practices'],
        frameworks: ['react'],
      });

      expect(isValidUUID(learning.id)).toBe(true);
      expect(learning).toMatchObject({
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        source: 'session',
        title: 'React hooks best practices',
        useCount: 0,
        scope: 'project',
        project: 'my-project',
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing learning', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Original title
    content: Original content
    scope: project
    tags:
      - react
    useCount: 5
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const updated = store.update('learn-1', {
        title: 'Updated title',
        content: 'Updated content',
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Updated title');
      expect(updated!.content).toBe('Updated content');
      expect(updated!.updatedAt).toBe('2024-01-15T10:00:00.000Z');
      expect(updated!.useCount).toBe(5); // Preserved
    });

    it('should return null when learning not found', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new LearningStore('project', '/test/project');
      const updated = store.update('non-existent', { title: 'test' });

      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing learning', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: To delete
    content: Content
    scope: project
    tags: []
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: To keep
    content: Content
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const result = store.delete('learn-1');

      expect(result).toBe(true);
      expect(store.getAll()).toHaveLength(1);
      expect(store.getAll()[0].id).toBe('learn-2');
    });

    it('should return false when learning not found', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new LearningStore('project', '/test/project');
      const result = store.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getByTags', () => {
    it('should find learnings by tags', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: React patterns
    content: Content
    scope: project
    tags:
      - react
      - patterns
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: TypeScript tips
    content: Content
    scope: project
    tags:
      - typescript
      - tips
    useCount: 0
  - id: learn-3
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: React TypeScript
    content: Content
    scope: project
    tags:
      - react
      - typescript
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getByTags(['react']);

      expect(results).toHaveLength(2);
      expect(results.map((l) => l.id)).toContain('learn-1');
      expect(results.map((l) => l.id)).toContain('learn-3');
    });

    it('should be case-insensitive', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: React patterns
    content: Content
    scope: project
    tags:
      - React
      - PATTERNS
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getByTags(['react', 'patterns']);

      expect(results).toHaveLength(1);
    });
  });

  describe('getByFrameworks', () => {
    it('should find learnings by frameworks', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Next.js routing
    content: Content
    scope: project
    tags: []
    frameworks:
      - nextjs
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Express middleware
    content: Content
    scope: project
    tags: []
    frameworks:
      - express
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getByFrameworks(['nextjs']);

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Next.js routing');
    });
  });

  describe('getRecent', () => {
    it('should return most recently updated learnings', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Oldest
    content: Content
    scope: project
    tags: []
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-12T09:00:00.000Z"
    updatedAt: "2024-01-14T09:00:00.000Z"
    source: session
    title: Middle
    content: Content
    scope: project
    tags: []
    useCount: 0
  - id: learn-3
    createdAt: "2024-01-11T09:00:00.000Z"
    updatedAt: "2024-01-15T09:00:00.000Z"
    source: session
    title: Newest
    content: Content
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getRecent(2);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Newest');
      expect(results[1].title).toBe('Middle');
    });
  });

  describe('getMostUsed', () => {
    it('should return most used learnings', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Low usage
    content: Content
    scope: project
    tags: []
    useCount: 2
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: High usage
    content: Content
    scope: project
    tags: []
    useCount: 15
  - id: learn-3
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Medium usage
    content: Content
    scope: project
    tags: []
    useCount: 8
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getMostUsed(2);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('High usage');
      expect(results[1].title).toBe('Medium usage');
    });
  });

  describe('getMostEffective', () => {
    it('should return most effective learnings', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: No rating
    content: Content
    scope: project
    tags: []
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: High effectiveness
    content: Content
    scope: project
    tags: []
    useCount: 0
    effectiveness: 90
  - id: learn-3
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Low effectiveness
    content: Content
    scope: project
    tags: []
    useCount: 0
    effectiveness: 40
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.getMostEffective(2);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('High effectiveness');
      expect(results[1].title).toBe('Low effectiveness');
    });
  });

  describe('incrementUseCount', () => {
    it('should increment use count and set lastUsed', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Test
    content: Content
    scope: project
    tags: []
    useCount: 5
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      store.incrementUseCount('learn-1');

      const learning = store.getById('learn-1');
      expect(learning?.useCount).toBe(6);
      expect(learning?.lastUsed).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  describe('setEffectiveness', () => {
    it('should set effectiveness rating', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Test
    content: Content
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      store.setEffectiveness('learn-1', 85);

      const learning = store.getById('learn-1');
      expect(learning?.effectiveness).toBe(85);
    });

    it('should clamp effectiveness between 0 and 100', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Test
    content: Content
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');

      store.setEffectiveness('learn-1', 150);
      expect(store.getById('learn-1')?.effectiveness).toBe(100);

      store.setEffectiveness('learn-1', -20);
      expect(store.getById('learn-1')?.effectiveness).toBe(0);
    });
  });

  describe('search', () => {
    it('should search by title', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: React hooks patterns
    content: Some content about hooks
    scope: project
    tags:
      - react
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: TypeScript generics
    content: Generic types explained
    scope: project
    tags:
      - typescript
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.search('React hooks');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React hooks patterns');
    });

    it('should search by content', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Error handling
    content: Use try-catch blocks for async operations
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.search('async operations');

      expect(results).toHaveLength(1);
    });

    it('should search by tags', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Some title
    content: Some content
    scope: project
    tags:
      - authentication
      - security
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');
      const results = store.search('authentication');

      expect(results).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should clear all learnings', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Test
    content: Content
    scope: project
    tags: []
    useCount: 0
`);

      const store = new LearningStore('project', '/test/project');
      store.clear();

      expect(store.count()).toBe(0);
    });
  });

  describe('count', () => {
    it('should return the number of learnings', () => {
      const existingData = `
version: 1
learnings:
  - id: learn-1
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: First
    content: Content
    scope: project
    tags: []
    useCount: 0
  - id: learn-2
    createdAt: "2024-01-10T09:00:00.000Z"
    updatedAt: "2024-01-10T09:00:00.000Z"
    source: session
    title: Second
    content: Content
    scope: project
    tags: []
    useCount: 0
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new LearningStore('project', '/test/project');

      expect(store.count()).toBe(2);
    });
  });
});
