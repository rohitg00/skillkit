import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { ActivityLog } from '../activity-log.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

describe('ActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      const log = new ActivityLog('/test/project');
      expect(log).toBeDefined();
    });
  });

  describe('record', () => {
    it('should record a new activity entry', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const log = new ActivityLog('/test/project');
      log.record({
        commitSha: 'abc1234',
        message: 'fix: parser edge case',
        activeSkills: ['code-simplifier'],
        filesChanged: ['src/index.ts'],
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalledTimes(1);
      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('abc1234');
      expect(content).toContain('code-simplifier');
      expect(content).toContain('src/index.ts');
      expect(content).toContain('fix: parser edge case');
    });

    it('should prepend new activities (most recent first)', () => {
      const existing = `
version: 1
activities:
  - commitSha: "old1234"
    committedAt: "2026-02-09T10:00:00.000Z"
    activeSkills:
      - remotion-best-practices
    filesChanged:
      - src/old.ts
    message: "feat: old feature"
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      const log = new ActivityLog('/test/project');
      log.record({
        commitSha: 'new5678',
        message: 'fix: new fix',
        activeSkills: ['code-simplifier'],
        filesChanged: ['src/new.ts'],
      });

      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      const newIdx = content.indexOf('new5678');
      const oldIdx = content.indexOf('old1234');
      expect(newIdx).toBeLessThan(oldIdx);
    });

    it('should cap activities at 500', () => {
      const activityEntries = Array.from({ length: 500 }, (_, i) => `
  - commitSha: "sha${i}"
    committedAt: "2026-02-09T10:00:00.000Z"
    activeSkills:
      - skill-a
    filesChanged:
      - file.ts
    message: "commit ${i}"`).join('');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        `version: 1\nactivities:${activityEntries}`
      );

      const log = new ActivityLog('/test/project');
      log.record({
        commitSha: 'newsha',
        message: 'new commit',
        activeSkills: ['skill-b'],
        filesChanged: ['new.ts'],
      });

      expect(vi.mocked(writeFileSync)).toHaveBeenCalledTimes(1);
      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('newsha');
      const commitMatches = content.match(/commitSha:/g);
      expect(commitMatches!.length).toBe(500);
    });
  });

  describe('getByCommit', () => {
    it('should find activity by full SHA', () => {
      const existing = `
version: 1
activities:
  - commitSha: "abc1234567890"
    committedAt: "2026-02-10T10:00:00.000Z"
    activeSkills:
      - code-simplifier
    filesChanged:
      - src/index.ts
    message: "fix: edge case"
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      const log = new ActivityLog('/test/project');
      const result = log.getByCommit('abc1234567890');

      expect(result).toBeDefined();
      expect(result!.commitSha).toBe('abc1234567890');
    });

    it('should find activity by short SHA prefix', () => {
      const existing = `
version: 1
activities:
  - commitSha: "abc1234567890"
    committedAt: "2026-02-10T10:00:00.000Z"
    activeSkills:
      - code-simplifier
    filesChanged:
      - src/index.ts
    message: "fix: edge case"
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      const log = new ActivityLog('/test/project');
      const result = log.getByCommit('abc1234');

      expect(result).toBeDefined();
      expect(result!.commitSha).toBe('abc1234567890');
    });

    it('should return undefined for unknown SHA', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const log = new ActivityLog('/test/project');
      const result = log.getByCommit('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getBySkill', () => {
    it('should filter activities by skill name', () => {
      const existing = `
version: 1
activities:
  - commitSha: "sha1"
    committedAt: "2026-02-10T12:00:00.000Z"
    activeSkills:
      - code-simplifier
    filesChanged:
      - src/a.ts
    message: "fix: a"
  - commitSha: "sha2"
    committedAt: "2026-02-10T11:00:00.000Z"
    activeSkills:
      - remotion-best-practices
    filesChanged:
      - src/b.ts
    message: "feat: b"
  - commitSha: "sha3"
    committedAt: "2026-02-10T10:00:00.000Z"
    activeSkills:
      - code-simplifier
      - remotion-best-practices
    filesChanged:
      - src/c.ts
    message: "refactor: c"
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      const log = new ActivityLog('/test/project');
      const results = log.getBySkill('code-simplifier');

      expect(results).toHaveLength(2);
      expect(results[0].commitSha).toBe('sha1');
      expect(results[1].commitSha).toBe('sha3');
    });

    it('should return empty array for unknown skill', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const log = new ActivityLog('/test/project');
      const results = log.getBySkill('nonexistent');

      expect(results).toEqual([]);
    });
  });

  describe('getRecent', () => {
    it('should return recent activities with default limit', () => {
      const activities = Array.from({ length: 25 }, (_, i) => `
  - commitSha: "sha${i}"
    committedAt: "2026-02-10T12:${String(i).padStart(2, '0')}:00.000Z"
    activeSkills:
      - skill-a
    filesChanged:
      - file${i}.ts
    message: "commit ${i}"
`).join('');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        `version: 1\nactivities:\n${activities}`
      );

      const log = new ActivityLog('/test/project');
      const results = log.getRecent();

      expect(results).toHaveLength(20);
    });

    it('should respect custom limit', () => {
      const activities = Array.from({ length: 10 }, (_, i) => `
  - commitSha: "sha${i}"
    committedAt: "2026-02-10T12:${String(i).padStart(2, '0')}:00.000Z"
    activeSkills:
      - skill-a
    filesChanged:
      - file${i}.ts
    message: "commit ${i}"
`).join('');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        `version: 1\nactivities:\n${activities}`
      );

      const log = new ActivityLog('/test/project');
      const results = log.getRecent(3);

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no activities exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const log = new ActivityLog('/test/project');
      const results = log.getRecent();

      expect(results).toEqual([]);
    });
  });

  describe('getMostUsedSkills', () => {
    it('should return skills sorted by usage count', () => {
      const existing = `
version: 1
activities:
  - commitSha: "sha1"
    committedAt: "2026-02-10T12:00:00.000Z"
    activeSkills:
      - code-simplifier
    filesChanged:
      - a.ts
    message: "a"
  - commitSha: "sha2"
    committedAt: "2026-02-10T11:00:00.000Z"
    activeSkills:
      - remotion-best-practices
      - code-simplifier
    filesChanged:
      - b.ts
    message: "b"
  - commitSha: "sha3"
    committedAt: "2026-02-10T10:00:00.000Z"
    activeSkills:
      - remotion-best-practices
      - code-simplifier
      - visual-storyteller
    filesChanged:
      - c.ts
    message: "c"
`;
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      const log = new ActivityLog('/test/project');
      const topSkills = log.getMostUsedSkills();

      expect(topSkills).toHaveLength(3);
      expect(topSkills[0]).toEqual({ skill: 'code-simplifier', count: 3 });
      expect(topSkills[1]).toEqual({ skill: 'remotion-best-practices', count: 2 });
      expect(topSkills[2]).toEqual({ skill: 'visual-storyteller', count: 1 });
    });

    it('should return empty array when no activities exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const log = new ActivityLog('/test/project');
      const topSkills = log.getMostUsedSkills();

      expect(topSkills).toEqual([]);
    });
  });

  describe('corrupted file handling', () => {
    it('should handle corrupted YAML gracefully', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('{{invalid yaml');

      const log = new ActivityLog('/test/project');
      const results = log.getRecent();

      expect(results).toEqual([]);
    });
  });
});
