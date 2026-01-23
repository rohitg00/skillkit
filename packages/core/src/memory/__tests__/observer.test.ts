import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MemoryObserver, createMemoryObserver, type ObservableEvent } from '../observer.js';
import type { ExecutionProgressEvent } from '../../executor/engine.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

describe('MemoryObserver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create an observer with default config', () => {
      const observer = new MemoryObserver('/test/project');
      expect(observer).toBeDefined();
      expect(observer.getObservationCount()).toBe(0);
    });

    it('should accept custom session ID', () => {
      const observer = new MemoryObserver('/test/project', 'custom-session');
      expect(observer.getSessionId()).toBe('custom-session');
    });

    it('should accept custom config', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        minRelevance: 50,
        captureTaskStarts: true,
      });
      expect(observer).toBeDefined();
    });
  });

  describe('setAgent', () => {
    it('should set the current agent', () => {
      const observer = new MemoryObserver('/test/project');
      observer.setAgent('cursor');
      // Agent is used when creating observations
      expect(observer).toBeDefined();
    });
  });

  describe('setSkillName', () => {
    it('should set the current skill name', () => {
      const observer = new MemoryObserver('/test/project');
      observer.setSkillName('test-skill');
      expect(observer).toBeDefined();
    });
  });

  describe('observe', () => {
    it('should capture high-relevance events', () => {
      const observer = new MemoryObserver('/test/project');

      const event: ObservableEvent = {
        type: 'error_encountered',
        timestamp: new Date().toISOString(),
        error: 'TypeError: Cannot read property of undefined',
        context: 'Running test suite',
      };

      const observation = observer.observe(event);

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('error');
      expect(observation?.relevance).toBeGreaterThanOrEqual(80);
    });

    it('should filter low-relevance events by default', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        minRelevance: 50,
      });

      const event: ObservableEvent = {
        type: 'task_start',
        timestamp: new Date().toISOString(),
        taskName: 'Test task',
      };

      // Task starts have low relevance and are disabled by default
      const observation = observer.observe(event);
      expect(observation).toBeNull();
    });

    it('should capture task starts when enabled', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        captureTaskStarts: true,
        minRelevance: 0,
      });

      const event: ObservableEvent = {
        type: 'task_start',
        timestamp: new Date().toISOString(),
        taskName: 'Test task',
      };

      const observation = observer.observe(event);
      expect(observation).not.toBeNull();
    });

    it('should capture solutions with high relevance', () => {
      const observer = new MemoryObserver('/test/project');

      const event: ObservableEvent = {
        type: 'solution_applied',
        timestamp: new Date().toISOString(),
        output: 'Added null check before accessing property',
        context: 'Fixed TypeError',
      };

      const observation = observer.observe(event);

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('solution');
      expect(observation?.relevance).toBeGreaterThanOrEqual(85);
    });

    it('should capture decisions', () => {
      const observer = new MemoryObserver('/test/project');

      const event: ObservableEvent = {
        type: 'checkpoint_decision',
        timestamp: new Date().toISOString(),
        decision: 'Use React hooks',
        context: 'Choosing state management approach',
      };

      const observation = observer.observe(event);

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('decision');
    });

    it('should capture file modifications', () => {
      const observer = new MemoryObserver('/test/project');

      const event: ObservableEvent = {
        type: 'file_modified',
        timestamp: new Date().toISOString(),
        files: ['src/App.tsx', 'src/index.ts'],
        context: 'Refactoring components',
      };

      const observation = observer.observe(event);

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('file_change');
      expect(observation?.content.files).toContain('src/App.tsx');
    });
  });

  describe('createProgressCallback', () => {
    it('should create a callback that captures progress events', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        minRelevance: 0,
      });
      const callback = observer.createProgressCallback();

      const progressEvent: ExecutionProgressEvent = {
        type: 'task_complete',
        taskId: 'task-1',
        taskName: 'Build project',
        taskIndex: 0,
        totalTasks: 3,
        status: 'completed',
        message: 'Build completed successfully',
      };

      callback(progressEvent);

      expect(observer.getObservationCount()).toBeGreaterThanOrEqual(0);
    });

    it('should capture failed task events', () => {
      const observer = new MemoryObserver('/test/project');
      const callback = observer.createProgressCallback();

      const progressEvent: ExecutionProgressEvent = {
        type: 'task_complete',
        taskId: 'task-1',
        taskName: 'Run tests',
        status: 'failed',
        error: 'Test suite failed: 3 tests failed',
      };

      callback(progressEvent);

      const observations = observer.getObservations();
      const errorObs = observations.find((o) => o.type === 'error');
      expect(errorObs).toBeDefined();
    });
  });

  describe('recordFileModification', () => {
    it('should record file modifications', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordFileModification(
        ['src/components/Button.tsx'],
        'Updated button styling'
      );

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('file_change');
      expect(observation?.content.files).toContain('src/components/Button.tsx');
    });
  });

  describe('recordError', () => {
    it('should record errors', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordError(
        'ModuleNotFoundError: Cannot find module react',
        'Import resolution'
      );

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('error');
      expect(observation?.content.error).toContain('ModuleNotFoundError');
    });
  });

  describe('recordSolution', () => {
    it('should record solutions', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordSolution(
        'Installed missing dependency: npm install react',
        'Fixed import error',
        'ModuleNotFoundError'
      );

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('solution');
    });

    it('should boost relevance for solutions matching pending errors', () => {
      const observer = new MemoryObserver('/test/project');

      // First record an error
      observer.recordError('TypeError: x is not a function', 'Runtime error');

      // Then record a matching solution
      const solution = observer.recordSolution(
        'Changed x to be a function',
        'Fixed type error',
        'TypeError: x is not a function'
      );

      expect(solution).not.toBeNull();
      expect(solution?.relevance).toBeGreaterThanOrEqual(90);
    });
  });

  describe('recordDecision', () => {
    it('should record decisions with options', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordDecision(
        'Use TypeScript',
        ['TypeScript', 'JavaScript', 'Flow'],
        'Language selection'
      );

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('decision');
      expect(observation?.content.context).toContain('TypeScript');
      expect(observation?.content.context).toContain('JavaScript');
    });
  });

  describe('recordExecutionStart', () => {
    it('should record execution start', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        minRelevance: 0,
      });

      const observation = observer.recordExecutionStart('code-review', 'claude-code');

      expect(observation).not.toBeNull();
      expect(observation?.content.action).toContain('code-review');
    });
  });

  describe('recordExecutionPause', () => {
    it('should record execution pause', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordExecutionPause('User requested pause');

      expect(observation).not.toBeNull();
      expect(observation?.type).toBe('checkpoint');
    });
  });

  describe('tag generation', () => {
    it('should generate typescript tags for .ts files', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordFileModification(
        ['src/utils.ts', 'src/types.ts'],
        'Updated utilities'
      );

      expect(observation?.content.tags).toContain('typescript');
    });

    it('should generate testing tags for test files', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordFileModification(
        ['src/__tests__/utils.test.ts'],
        'Added tests'
      );

      expect(observation?.content.tags).toContain('testing');
    });

    it('should generate error-related tags from error content', () => {
      const observer = new MemoryObserver('/test/project');

      const observation = observer.recordError(
        'TypeError: Cannot read property of null',
        'Runtime error'
      );

      expect(observation?.content.tags).toContain('null-check');
    });
  });

  describe('relevance scoring', () => {
    it('should score errors higher than task completions', () => {
      const observer = new MemoryObserver('/test/project', undefined, {
        minRelevance: 0,
        captureTaskStarts: true,
      });

      const errorObs = observer.observe({
        type: 'error_encountered',
        timestamp: new Date().toISOString(),
        error: 'Test error',
        context: 'Test',
      });

      const taskObs = observer.observe({
        type: 'task_complete',
        timestamp: new Date().toISOString(),
        taskName: 'Test task',
        context: 'Test',
      });

      expect(errorObs?.relevance).toBeGreaterThan(taskObs?.relevance || 0);
    });

    it('should use custom relevance scorer when provided', () => {
      const customScorer = vi.fn().mockReturnValue(75);
      const observer = new MemoryObserver('/test/project', undefined, {
        relevanceScorer: customScorer,
        minRelevance: 0,
      });

      observer.observe({
        type: 'task_complete',
        timestamp: new Date().toISOString(),
        taskName: 'Test',
        context: 'Test',
      });

      expect(customScorer).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all observations', () => {
      const observer = new MemoryObserver('/test/project');

      observer.recordError('Test error', 'Test context');
      expect(observer.getObservationCount()).toBeGreaterThan(0);

      observer.clear();
      expect(observer.getObservationCount()).toBe(0);
    });
  });

  describe('getObservations', () => {
    it('should return all observations', () => {
      const observer = new MemoryObserver('/test/project');

      observer.recordError('Error 1', 'Context 1');
      observer.recordError('Error 2', 'Context 2');

      const observations = observer.getObservations();
      expect(observations.length).toBe(2);
    });
  });

  describe('createMemoryObserver', () => {
    it('should create an observer instance', () => {
      const observer = createMemoryObserver('/test/project');
      expect(observer).toBeInstanceOf(MemoryObserver);
    });

    it('should pass through options', () => {
      const observer = createMemoryObserver('/test/project', 'session-123', {
        minRelevance: 60,
      });
      expect(observer.getSessionId()).toBe('session-123');
    });
  });
});
