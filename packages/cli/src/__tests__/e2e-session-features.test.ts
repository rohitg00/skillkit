import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { stringify } from 'yaml';

const CLI = join(__dirname, '../../../../apps/skillkit/dist/cli.js');

function run(args: string, cwd: string): string {
  try {
    return execSync(`node ${CLI} ${args}`, {
      cwd,
      encoding: 'utf-8',
      timeout: 15000,
      env: { ...process.env, NO_COLOR: '1' },
    });
  } catch (err: any) {
    return err.stdout || err.stderr || err.message;
  }
}

describe('E2E: Session Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `skillkit-e2e-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('skillkit activity', () => {
    it('should show empty state message', () => {
      const output = run('activity', testDir);
      expect(output).toContain('No activity recorded');
    });

    it('should return empty JSON array', () => {
      const output = run('activity --json', testDir);
      const parsed = JSON.parse(output.trim());
      expect(parsed).toEqual([]);
    });

    it('should accept --skill filter without error', () => {
      const output = run('activity --skill code-simplifier', testDir);
      expect(output).toContain('No activity recorded');
    });

    it('should accept --limit flag without error', () => {
      const output = run('activity --limit 5', testDir);
      expect(output).toContain('No activity recorded');
    });
  });

  describe('skillkit session snapshot', () => {
    it('should list no snapshots initially', () => {
      const output = run('session snapshot list', testDir);
      expect(output).toContain('No snapshots found');
    });

    it('should return empty JSON for snapshot list', () => {
      const output = run('session snapshot list --json', testDir);
      const parsed = JSON.parse(output.trim());
      expect(parsed).toEqual([]);
    });

    it('should fail to save without active session', () => {
      const output = run('session snapshot save test-snap', testDir);
      expect(output).toContain('No active session');
    });

    it('should fail to restore nonexistent snapshot', () => {
      const output = run('session snapshot restore nonexistent', testDir);
      expect(output).toContain('not found');
    });

    it('should fail to delete nonexistent snapshot', () => {
      const output = run('session snapshot delete nonexistent', testDir);
      expect(output).toContain('not found');
    });

    it('should save and restore snapshot with active session', () => {
      const skillkitDir = join(testDir, '.skillkit');
      mkdirSync(skillkitDir, { recursive: true });

      const sessionState = {
        version: 1,
        lastActivity: new Date().toISOString(),
        projectPath: testDir,
        currentExecution: {
          skillName: 'code-simplifier',
          skillSource: 'local',
          currentStep: 1,
          totalSteps: 2,
          status: 'running',
          startedAt: new Date().toISOString(),
          tasks: [
            {
              id: 'task-1',
              name: 'Test task',
              type: 'auto',
              status: 'completed',
            },
          ],
        },
        history: [],
        decisions: [{ key: 'test-key', value: 'test-value', madeAt: new Date().toISOString() }],
      };

      writeFileSync(
        join(skillkitDir, 'session.yaml'),
        stringify(sessionState)
      );

      const saveOutput = run('session snapshot save my-test-snap --desc "E2E test"', testDir);
      expect(saveOutput).toContain('Snapshot saved: my-test-snap');

      const snapshotFile = join(skillkitDir, 'snapshots', 'my-test-snap.yaml');
      expect(existsSync(snapshotFile)).toBe(true);

      const listOutput = run('session snapshot list', testDir);
      expect(listOutput).toContain('my-test-snap');
      expect(listOutput).toContain('E2E test');

      const restoreOutput = run('session snapshot restore my-test-snap', testDir);
      expect(restoreOutput).toContain('Snapshot restored: my-test-snap');

      const deleteOutput = run('session snapshot delete my-test-snap', testDir);
      expect(deleteOutput).toContain('Snapshot deleted: my-test-snap');

      expect(existsSync(snapshotFile)).toBe(false);
    });
  });

  describe('skillkit session explain', () => {
    it('should show empty session summary', () => {
      const output = run('session explain --no-git', testDir);
      expect(output).toContain('Session Summary');
      expect(output).toContain('Agent:');
      expect(output).toContain('Files Modified: 0 files');
    });

    it('should return valid JSON', () => {
      const output = run('session explain --json --no-git', testDir);
      const parsed = JSON.parse(output.trim());
      expect(parsed.date).toBeDefined();
      expect(parsed.agent).toBe('unknown');
      expect(parsed.skillsUsed).toEqual([]);
      expect(parsed.observationCounts).toBeDefined();
      expect(typeof parsed.observationCounts.errors).toBe('number');
      expect(typeof parsed.observationCounts.solutions).toBe('number');
      expect(typeof parsed.observationCounts.patterns).toBe('number');
    });

    it('should explain session with active execution', () => {
      const skillkitDir = join(testDir, '.skillkit');
      mkdirSync(skillkitDir, { recursive: true });

      const sessionState = {
        version: 1,
        lastActivity: new Date().toISOString(),
        projectPath: testDir,
        currentExecution: {
          skillName: 'remotion-best-practices',
          skillSource: 'claude-code',
          currentStep: 2,
          totalSteps: 3,
          status: 'running',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          tasks: [
            {
              id: 't1',
              name: 'Setup video',
              type: 'auto',
              status: 'completed',
              startedAt: new Date(Date.now() - 3600000).toISOString(),
              completedAt: new Date(Date.now() - 1800000).toISOString(),
              filesModified: ['src/video.tsx'],
            },
            {
              id: 't2',
              name: 'Add effects',
              type: 'auto',
              status: 'in_progress',
              startedAt: new Date(Date.now() - 1800000).toISOString(),
            },
          ],
        },
        history: [],
        decisions: [
          { key: 'codec', value: 'h264', madeAt: new Date().toISOString() },
        ],
      };

      writeFileSync(
        join(skillkitDir, 'session.yaml'),
        stringify(sessionState)
      );

      const output = run('session explain --no-git', testDir);
      expect(output).toContain('Session Summary');
      expect(output).toContain('Duration:');
      expect(output).toContain('claude-code');
      expect(output).toContain('remotion-best-practices');
      expect(output).toContain('Setup video');
      expect(output).toContain('Add effects');
      expect(output).toContain('codec');

      const jsonOutput = run('session explain --json --no-git', testDir);
      const parsed = JSON.parse(jsonOutput.trim());
      expect(parsed.skillsUsed).toHaveLength(1);
      expect(parsed.skillsUsed[0].name).toBe('remotion-best-practices');
      expect(parsed.tasks).toHaveLength(2);
      expect(parsed.decisions).toHaveLength(1);
      expect(parsed.filesModified).toContain('src/video.tsx');
    });
  });

  describe('skillkit session (help)', () => {
    it('should list all subcommands including new ones', () => {
      const output = run('session', testDir);
      expect(output).toContain('session explain');
      expect(output).toContain('session snapshot save');
      expect(output).toContain('session snapshot restore');
      expect(output).toContain('session snapshot list');
      expect(output).toContain('session snapshot delete');
    });
  });
});
