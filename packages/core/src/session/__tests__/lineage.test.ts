import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { SkillLineage } from '../lineage.js';
import type { SessionState } from '../types.js';

const TEST_DIR = join(process.cwd(), '.test-lineage-' + process.pid);
const SKILLKIT_DIR = join(TEST_DIR, '.skillkit');

function writeSessionState(state: SessionState): void {
  mkdirSync(SKILLKIT_DIR, { recursive: true });
  writeFileSync(join(SKILLKIT_DIR, 'session.yaml'), stringify(state));
}

function writeActivityLog(activities: Array<Record<string, unknown>>): void {
  mkdirSync(SKILLKIT_DIR, { recursive: true });
  writeFileSync(
    join(SKILLKIT_DIR, 'activity.yaml'),
    stringify({ version: 1, activities })
  );
}

function writeObservations(observations: Array<Record<string, unknown>>): void {
  const dir = join(SKILLKIT_DIR, 'memory');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'observations.yaml'),
    stringify({ version: 1, sessionId: 'test', observations })
  );
}

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('SkillLineage', () => {
  it('should create lineage instance', () => {
    const lineage = new SkillLineage(TEST_DIR);
    expect(lineage).toBeDefined();
  });

  it('should return empty lineage when no data', () => {
    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    expect(data.skills).toEqual([]);
    expect(data.files).toEqual([]);
    expect(data.stats.totalSkillExecutions).toBe(0);
    expect(data.stats.mostImpactfulSkill).toBeNull();
  });

  it('should build lineage from execution history', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'code-simplifier',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 120000,
          status: 'completed',
          commits: ['abc1234', 'def5678'],
          filesModified: ['src/index.ts', 'src/utils.ts'],
        },
        {
          skillName: 'code-simplifier',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['ghi9012'],
          filesModified: ['src/index.ts'],
        },
        {
          skillName: 'pro-workflow',
          skillSource: 'test',
          completedAt: '2026-02-12T12:00:00.000Z',
          durationMs: 180000,
          status: 'completed',
          commits: ['jkl3456'],
          filesModified: ['src/index.ts', 'README.md'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    expect(data.skills.length).toBe(2);

    const cs = data.skills.find((s) => s.skillName === 'code-simplifier');
    expect(cs).toBeDefined();
    expect(cs!.executions).toBe(2);
    expect(cs!.totalDurationMs).toBe(180000);
    expect(cs!.commits.length).toBe(3);
    expect(cs!.filesModified).toContain('src/index.ts');
    expect(cs!.filesModified).toContain('src/utils.ts');

    const pw = data.skills.find((s) => s.skillName === 'pro-workflow');
    expect(pw).toBeDefined();
    expect(pw!.executions).toBe(1);
  });

  it('should build file lineage', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'skill-a',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['abc'],
          filesModified: ['src/shared.ts'],
        },
        {
          skillName: 'skill-b',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['def'],
          filesModified: ['src/shared.ts', 'src/only-b.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    const shared = data.files.find((f) => f.path === 'src/shared.ts');
    expect(shared).toBeDefined();
    expect(shared!.skills.length).toBe(2);
    expect(shared!.skills).toContain('skill-a');
    expect(shared!.skills).toContain('skill-b');
  });

  it('should compute stats', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'big-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['a', 'b'],
          filesModified: ['f1.ts', 'f2.ts', 'f3.ts'],
        },
        {
          skillName: 'small-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 30000,
          status: 'completed',
          commits: ['c'],
          filesModified: ['f1.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    expect(data.stats.totalSkillExecutions).toBe(2);
    expect(data.stats.totalCommits).toBe(3);
    expect(data.stats.totalFilesChanged).toBe(3);
    expect(data.stats.mostImpactfulSkill).toBe('big-skill');
  });

  it('should filter by skill name', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'target',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['a'],
          filesModified: ['src/a.ts'],
        },
        {
          skillName: 'other',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['b'],
          filesModified: ['src/b.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build({ skill: 'target' });

    expect(data.skills.length).toBe(1);
    expect(data.skills[0].skillName).toBe('target');
    expect(data.files.every((f) => f.skills.includes('target'))).toBe(true);
  });

  it('should filter by file path', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'skill-a',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['a'],
          filesModified: ['src/target.ts', 'src/other.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build({ file: 'target.ts' });

    expect(data.files.length).toBe(1);
    expect(data.files[0].path).toBe('src/target.ts');
  });

  it('should filter by since date', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'old',
          skillSource: 'test',
          completedAt: '2026-01-01T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['a'],
          filesModified: ['old.ts'],
        },
        {
          skillName: 'recent',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['b'],
          filesModified: ['recent.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build({ since: '2026-02-01' });

    expect(data.skills.length).toBe(1);
    expect(data.skills[0].skillName).toBe('recent');
  });

  it('should include current execution in lineage', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
      currentExecution: {
        skillName: 'active-skill',
        skillSource: 'test',
        currentStep: 1,
        totalSteps: 2,
        status: 'running',
        startedAt: '2026-02-12T10:00:00.000Z',
        tasks: [
          {
            id: 't1',
            name: 'Task 1',
            type: 'auto',
            status: 'completed',
            commitSha: 'abc',
            filesModified: ['src/active.ts'],
          },
        ],
      },
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    expect(data.skills.length).toBe(1);
    expect(data.skills[0].skillName).toBe('active-skill');
    expect(data.skills[0].commits).toContain('abc');
    expect(data.skills[0].filesModified).toContain('src/active.ts');
  });

  it('should merge activity log data', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'my-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['abc'],
          filesModified: ['src/a.ts'],
        },
      ],
      decisions: [],
    });

    writeActivityLog([
      {
        commitSha: 'xyz',
        committedAt: '2026-02-12T11:00:00.000Z',
        activeSkills: ['my-skill'],
        filesChanged: ['src/b.ts'],
        message: 'extra commit',
      },
    ]);

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    const skill = data.skills.find((s) => s.skillName === 'my-skill');
    expect(skill).toBeDefined();
    expect(skill!.commits).toContain('xyz');
  });

  it('should match observations by timestamp overlap', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'test-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 3600000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
      ],
      decisions: [],
    });

    writeObservations([
      {
        id: 'obs1',
        timestamp: '2026-02-12T10:30:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'error',
        content: { action: 'build', context: 'src', files: ['src/buggy.ts'] },
        relevance: 80,
      },
    ]);

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    expect(data.stats.errorProneFiles).toContain('src/buggy.ts');
  });

  it('should getSkillLineage for a specific skill', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'target-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['abc'],
          filesModified: ['src/foo.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const entry = lineage.getSkillLineage('target-skill');

    expect(entry).toBeDefined();
    expect(entry!.skillName).toBe('target-skill');
    expect(entry!.executions).toBe(1);
  });

  it('should getFileLineage for a specific file', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'skill-a',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['abc'],
          filesModified: ['src/target.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const fl = lineage.getFileLineage('src/target.ts');

    expect(fl).toBeDefined();
    expect(fl!.path).toBe('src/target.ts');
    expect(fl!.skills).toContain('skill-a');
  });

  it('should format text output', () => {
    const lineage = new SkillLineage(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      skills: [
        {
          skillName: 'test-skill',
          executions: 3,
          totalDurationMs: 180000,
          commits: ['a', 'b'],
          filesModified: ['f1.ts', 'f2.ts'],
          observationIds: [],
          firstSeen: '2026-02-12T08:00:00.000Z',
          lastSeen: '2026-02-12T12:00:00.000Z',
        },
      ],
      files: [
        { path: 'f1.ts', skills: ['test-skill', 'other'], commitCount: 5, lastModified: '2026-02-12T12:00:00.000Z' },
      ],
      stats: {
        totalSkillExecutions: 3,
        totalCommits: 2,
        totalFilesChanged: 2,
        mostImpactfulSkill: 'test-skill',
        mostChangedFile: 'f1.ts',
        errorProneFiles: ['f1.ts'],
      },
    };

    const text = lineage.formatText(data);
    expect(text).toContain('Skill Lineage');
    expect(text).toContain('test-skill');
    expect(text).toContain('3 runs');
    expect(text).toContain('File Hotspots');
    expect(text).toContain('Stats');
  });

  it('should format JSON output', () => {
    const lineage = new SkillLineage(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      skills: [],
      files: [],
      stats: {
        totalSkillExecutions: 0,
        totalCommits: 0,
        totalFilesChanged: 0,
        mostImpactfulSkill: null,
        mostChangedFile: null,
        errorProneFiles: [],
      },
    };

    const json = lineage.formatJson(data);
    const parsed = JSON.parse(json);
    expect(parsed.projectPath).toBe(TEST_DIR);
  });

  it('should handle empty lineage in text format', () => {
    const lineage = new SkillLineage(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      skills: [],
      files: [],
      stats: {
        totalSkillExecutions: 0,
        totalCommits: 0,
        totalFilesChanged: 0,
        mostImpactfulSkill: null,
        mostChangedFile: null,
        errorProneFiles: [],
      },
    };

    const text = lineage.formatText(data);
    expect(text).toContain('No skill executions found');
  });

  it('should deduplicate commits and files', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'dup-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: ['abc', 'abc'],
          filesModified: ['src/a.ts', 'src/a.ts', 'src/b.ts'],
        },
      ],
      decisions: [],
    });

    const lineage = new SkillLineage(TEST_DIR);
    const data = lineage.build();

    const skill = data.skills.find((s) => s.skillName === 'dup-skill');
    expect(skill!.commits.length).toBe(1);
    expect(skill!.filesModified.length).toBe(2);
  });
});
