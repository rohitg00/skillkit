import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'node:fs';
import { SnapshotManager } from '../snapshot-manager.js';
import type { SessionState } from '../types.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

const mockSessionState: SessionState = {
  version: 1,
  lastActivity: '2026-02-10T12:00:00.000Z',
  projectPath: '/test/project',
  history: [
    {
      skillName: 'code-simplifier',
      skillSource: 'local',
      completedAt: '2026-02-10T11:00:00.000Z',
      durationMs: 60000,
      status: 'completed',
      commits: ['sha1'],
      filesModified: ['src/index.ts'],
    },
  ],
  decisions: [
    {
      key: 'format',
      value: 'yaml',
      madeAt: '2026-02-10T10:00:00.000Z',
    },
  ],
};

const mockObservations = [
  {
    id: 'obs-1',
    timestamp: '2026-02-10T10:00:00.000Z',
    sessionId: 'session-1',
    agent: 'claude-code',
    type: 'error',
    content: { action: 'Build failed', context: 'TS error' },
    relevance: 80,
  },
];

describe('SnapshotManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('save', () => {
    it('should save a snapshot to disk', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      manager.save('my-feature', mockSessionState, mockObservations, 'Before refactor');

      expect(vi.mocked(mkdirSync)).toHaveBeenCalledWith(
        expect.stringContaining('snapshots'),
        { recursive: true }
      );
      expect(vi.mocked(writeFileSync)).toHaveBeenCalledTimes(1);
      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('my-feature');
      expect(content).toContain('Before refactor');
      expect(content).toContain('code-simplifier');
    });

    it('should save without description', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const manager = new SnapshotManager('/test/project');
      manager.save('quick-save', mockSessionState, []);

      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('quick-save');
    });
  });

  describe('restore', () => {
    it('should restore a snapshot from disk', () => {
      const snapshotYaml = `
version: 1
name: my-feature
createdAt: "2026-02-10T12:00:00.000Z"
description: Before refactor
sessionState:
  version: 1
  lastActivity: "2026-02-10T12:00:00.000Z"
  projectPath: /test/project
  history:
    - skillName: code-simplifier
      skillSource: local
      completedAt: "2026-02-10T11:00:00.000Z"
      durationMs: 60000
      status: completed
      commits:
        - sha1
      filesModified:
        - src/index.ts
  decisions:
    - key: format
      value: yaml
      madeAt: "2026-02-10T10:00:00.000Z"
observations:
  - id: obs-1
    timestamp: "2026-02-10T10:00:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: error
    content:
      action: Build failed
      context: TS error
    relevance: 80
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(snapshotYaml);

      const manager = new SnapshotManager('/test/project');
      const result = manager.restore('my-feature');

      expect(result.sessionState.version).toBe(1);
      expect(result.sessionState.history).toHaveLength(1);
      expect(result.sessionState.history[0].skillName).toBe('code-simplifier');
      expect(result.observations).toHaveLength(1);
      expect(result.observations[0].id).toBe('obs-1');
    });

    it('should throw if snapshot does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');

      expect(() => manager.restore('nonexistent')).toThrow(
        'Snapshot "nonexistent" not found'
      );
    });
  });

  describe('list', () => {
    it('should list all snapshots sorted by creation date', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([
        'old-snap.yaml',
        'new-snap.yaml',
      ] as unknown as ReturnType<typeof readdirSync>);

      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        if (String(filepath).includes('old-snap')) {
          return `
version: 1
name: old-snap
createdAt: "2026-02-09T10:00:00.000Z"
sessionState:
  version: 1
  lastActivity: "2026-02-09T10:00:00.000Z"
  projectPath: /test/project
  history: []
  decisions: []
observations: []
`;
        }
        return `
version: 1
name: new-snap
createdAt: "2026-02-10T10:00:00.000Z"
description: Latest snapshot
sessionState:
  version: 1
  lastActivity: "2026-02-10T10:00:00.000Z"
  projectPath: /test/project
  history:
    - skillName: code-simplifier
      skillSource: local
      completedAt: "2026-02-10T09:00:00.000Z"
      durationMs: 30000
      status: completed
      commits: []
      filesModified: []
  decisions: []
observations: []
`;
      });

      const manager = new SnapshotManager('/test/project');
      const snapshots = manager.list();

      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].name).toBe('new-snap');
      expect(snapshots[0].description).toBe('Latest snapshot');
      expect(snapshots[0].skillCount).toBe(1);
      expect(snapshots[1].name).toBe('old-snap');
      expect(snapshots[1].skillCount).toBe(0);
    });

    it('should return empty array when no snapshots dir exists', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      const snapshots = manager.list();

      expect(snapshots).toEqual([]);
    });

    it('should skip corrupted snapshot files', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([
        'good.yaml',
        'bad.yaml',
      ] as unknown as ReturnType<typeof readdirSync>);

      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        if (String(filepath).includes('bad')) {
          return '{{invalid yaml';
        }
        return `
version: 1
name: good
createdAt: "2026-02-10T10:00:00.000Z"
sessionState:
  version: 1
  lastActivity: "2026-02-10T10:00:00.000Z"
  projectPath: /test/project
  history: []
  decisions: []
observations: []
`;
      });

      const manager = new SnapshotManager('/test/project');
      const snapshots = manager.list();

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].name).toBe('good');
    });
  });

  describe('get', () => {
    it('should return snapshot by name', () => {
      const snapshotYaml = `
version: 1
name: test-snap
createdAt: "2026-02-10T12:00:00.000Z"
sessionState:
  version: 1
  lastActivity: "2026-02-10T12:00:00.000Z"
  projectPath: /test/project
  history: []
  decisions: []
observations: []
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(snapshotYaml);

      const manager = new SnapshotManager('/test/project');
      const snapshot = manager.get('test-snap');

      expect(snapshot).toBeDefined();
      expect(snapshot!.name).toBe('test-snap');
    });

    it('should return undefined for nonexistent snapshot', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      const snapshot = manager.get('nonexistent');

      expect(snapshot).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a snapshot file', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const manager = new SnapshotManager('/test/project');
      const result = manager.delete('my-feature');

      expect(result).toBe(true);
      expect(vi.mocked(unlinkSync)).toHaveBeenCalledWith(
        expect.stringContaining('my-feature.yaml')
      );
    });

    it('should return false for nonexistent snapshot', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      const result = manager.delete('nonexistent');

      expect(result).toBe(false);
      expect(vi.mocked(unlinkSync)).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true when snapshot file exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const manager = new SnapshotManager('/test/project');
      expect(manager.exists('my-feature')).toBe(true);
    });

    it('should return false when snapshot file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      expect(manager.exists('nonexistent')).toBe(false);
    });
  });

  describe('path traversal protection', () => {
    it('should reject names with path separators', () => {
      const manager = new SnapshotManager('/test/project');

      expect(() => manager.exists('../../etc/passwd')).toThrow('Invalid snapshot name');
      expect(() => manager.exists('../config')).toThrow('Invalid snapshot name');
    });

    it('should reject names with special characters', () => {
      const manager = new SnapshotManager('/test/project');

      expect(() => manager.exists('snap shot')).toThrow('Invalid snapshot name');
      expect(() => manager.exists('snap.shot')).toThrow('Invalid snapshot name');
    });

    it('should allow valid names with hyphens and underscores', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new SnapshotManager('/test/project');
      expect(() => manager.exists('my-feature_v2')).not.toThrow();
    });
  });

  describe('restore validation', () => {
    it('should throw on corrupted YAML', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('{{invalid yaml');

      const manager = new SnapshotManager('/test/project');
      expect(() => manager.restore('corrupted')).toThrow('Failed to read snapshot');
    });

    it('should throw on missing sessionState', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(`
version: 1
name: broken
createdAt: "2026-02-10T12:00:00.000Z"
observations: []
`);

      const manager = new SnapshotManager('/test/project');
      expect(() => manager.restore('broken')).toThrow('corrupted or invalid');
    });
  });
});
