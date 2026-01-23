import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { ObservationStore } from '../observation-store.js';
import type { ObservationType, ObservationContent } from '../types.js';

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

describe('ObservationStore', () => {
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
    it('should set the correct file path', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const store = new ObservationStore('/test/project');
      expect(store).toBeDefined();
    });

    it('should accept a custom session ID', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const store = new ObservationStore('/test/project', 'custom-session-id');
      expect(store.getSessionId()).toBe('custom-session-id');
    });

    it('should generate a session ID if not provided', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const store = new ObservationStore('/test/project');
      expect(isValidUUID(store.getSessionId())).toBe(true);
    });
  });

  describe('add', () => {
    it('should add a new observation', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new ObservationStore('/test/project', 'session-1');
      const content: ObservationContent = {
        action: 'Created new file',
        context: 'User requested new component',
        result: 'File created successfully',
        files: ['src/Component.tsx'],
        tags: ['react', 'typescript'],
      };

      const observation = store.add('file_change', content, 'claude-code', 75);

      expect(isValidUUID(observation.id)).toBe(true);
      expect(observation).toMatchObject({
        timestamp: '2024-01-15T10:00:00.000Z',
        sessionId: 'session-1',
        agent: 'claude-code',
        type: 'file_change',
        content,
        relevance: 75,
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalled();
    });

    it('should use default relevance of 50', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new ObservationStore('/test/project');
      const observation = store.add(
        'decision',
        { action: 'test', context: 'test' },
        'cursor'
      );

      expect(observation.relevance).toBe(50);
    });
  });

  describe('getAll', () => {
    it('should return all observations', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: tool_use
    content:
      action: Read file
      context: Analyzing code
    relevance: 60
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Use React hooks
      context: State management
    relevance: 80
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');
      const observations = store.getAll();

      expect(observations).toHaveLength(2);
      expect(observations[0].id).toBe('obs-1');
      expect(observations[1].id).toBe('obs-2');
    });

    it('should return empty array when no observations exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new ObservationStore('/test/project');
      const observations = store.getAll();

      expect(observations).toEqual([]);
    });
  });

  describe('getByType', () => {
    it('should filter observations by type', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: error
    content:
      action: Build failed
      context: TypeScript error
      error: Type mismatch
    relevance: 90
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: solution
    content:
      action: Fixed error
      context: Added type annotation
      solution: Added explicit type
    relevance: 85
  - id: obs-3
    timestamp: "2024-01-15T10:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: error
    content:
      action: Test failed
      context: Unit test
      error: Assertion failed
    relevance: 70
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');
      const errors = store.getByType('error');

      expect(errors).toHaveLength(2);
      expect(errors[0].type).toBe('error');
      expect(errors[1].type).toBe('error');
    });
  });

  describe('getByRelevance', () => {
    it('should filter observations by minimum relevance', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 30
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 70
  - id: obs-3
    timestamp: "2024-01-15T10:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 90
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');
      const highRelevance = store.getByRelevance(60);

      expect(highRelevance).toHaveLength(2);
      expect(highRelevance[0].relevance).toBe(70);
      expect(highRelevance[1].relevance).toBe(90);
    });
  });

  describe('getRecent', () => {
    it('should return the most recent observations', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: First
      context: Test
    relevance: 50
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Second
      context: Test
    relevance: 50
  - id: obs-3
    timestamp: "2024-01-15T10:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Third
      context: Test
    relevance: 50
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');
      const recent = store.getRecent(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].content.action).toBe('Second');
      expect(recent[1].content.action).toBe('Third');
    });
  });

  describe('getUncompressed', () => {
    it('should return observations not in the compressed list', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
  - id: obs-3
    timestamp: "2024-01-15T10:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');
      const uncompressed = store.getUncompressed(['obs-1', 'obs-3']);

      expect(uncompressed).toHaveLength(1);
      expect(uncompressed[0].id).toBe('obs-2');
    });
  });

  describe('clear', () => {
    it('should clear all observations', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
`);

      const store = new ObservationStore('/test/project', 'session-1');
      store.clear();

      const [, content] = vi.mocked(writeFileSync).mock.calls[0];
      expect(content).toContain('observations: []');
    });
  });

  describe('session management', () => {
    it('should clear observations when session ID changes', () => {
      const existingData = `
version: 1
sessionId: old-session
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: old-session
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'new-session');
      const observations = store.getAll();

      expect(observations).toHaveLength(0);
    });

    it('should allow setting session ID', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new ObservationStore('/test/project', 'initial-session');
      store.setSessionId('updated-session');

      expect(store.getSessionId()).toBe('updated-session');
    });
  });

  describe('exists', () => {
    it('should return true when file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const store = new ObservationStore('/test/project');

      expect(store.exists()).toBe(true);
    });

    it('should return false when file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const store = new ObservationStore('/test/project');

      expect(store.exists()).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the number of observations', () => {
      const existingData = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2024-01-15T09:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
  - id: obs-2
    timestamp: "2024-01-15T09:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: decision
    content:
      action: Test
      context: Test
    relevance: 50
`;

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existingData);

      const store = new ObservationStore('/test/project', 'session-1');

      expect(store.count()).toBe(2);
    });
  });
});
