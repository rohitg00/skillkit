import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { SessionHandoff } from '../handoff.js';
import type { SessionState } from '../types.js';

const TEST_DIR = join(process.cwd(), '.test-handoff-' + process.pid);
const SKILLKIT_DIR = join(TEST_DIR, '.skillkit');

function writeSessionState(state: SessionState): void {
  mkdirSync(SKILLKIT_DIR, { recursive: true });
  writeFileSync(join(SKILLKIT_DIR, 'session.yaml'), stringify(state));
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

describe('SessionHandoff', () => {
  it('should create handoff instance', () => {
    const handoff = new SessionHandoff(TEST_DIR);
    expect(handoff).toBeDefined();
  });

  it('should generate empty handoff when no data', () => {
    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.generatedAt).toBeTruthy();
    expect(doc.projectPath).toBe(TEST_DIR);
    expect(doc.accomplished.tasks).toEqual([]);
    expect(doc.pending.tasks).toEqual([]);
    expect(doc.keyFiles).toEqual([]);
  });

  it('should collect accomplished tasks', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
      currentExecution: {
        skillName: 'test-skill',
        skillSource: 'test',
        currentStep: 2,
        totalSteps: 3,
        status: 'running',
        startedAt: '2026-02-12T10:00:00.000Z',
        tasks: [
          {
            id: 't1',
            name: 'Setup project',
            type: 'auto',
            status: 'completed',
            startedAt: '2026-02-12T10:00:00.000Z',
            completedAt: '2026-02-12T10:03:00.000Z',
            commitSha: 'abc1234',
          },
          {
            id: 't2',
            name: 'Write tests',
            type: 'auto',
            status: 'completed',
            startedAt: '2026-02-12T10:03:00.000Z',
            completedAt: '2026-02-12T10:08:00.000Z',
          },
          {
            id: 't3',
            name: 'Update docs',
            type: 'auto',
            status: 'pending',
          },
        ],
      },
    });

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.accomplished.tasks.length).toBe(2);
    expect(doc.accomplished.tasks[0].name).toBe('Setup project');
    expect(doc.accomplished.tasks[0].duration).toBe('3m');
    expect(doc.accomplished.tasks[0].commitSha).toBe('abc1234');
  });

  it('should collect pending tasks', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
      currentExecution: {
        skillName: 'test-skill',
        skillSource: 'test',
        currentStep: 0,
        totalSteps: 2,
        status: 'running',
        startedAt: '2026-02-12T10:00:00.000Z',
        tasks: [
          { id: 't1', name: 'Pending task', type: 'auto', status: 'pending' },
          { id: 't2', name: 'In progress task', type: 'auto', status: 'in_progress', startedAt: '2026-02-12T10:00:00.000Z' },
        ],
      },
    });

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.pending.tasks.length).toBe(2);
    expect(doc.pending.tasks[0].name).toBe('Pending task');
    expect(doc.pending.tasks[1].name).toBe('In progress task');
  });

  it('should collect key files from tasks and history', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'old-skill',
          skillSource: 'test',
          completedAt: '2026-02-11T15:00:00.000Z',
          durationMs: 120000,
          status: 'completed',
          commits: [],
          filesModified: ['src/old.ts', 'src/shared.ts'],
        },
      ],
      decisions: [],
      currentExecution: {
        skillName: 'test-skill',
        skillSource: 'test',
        currentStep: 1,
        totalSteps: 1,
        status: 'running',
        startedAt: '2026-02-12T10:00:00.000Z',
        tasks: [
          {
            id: 't1',
            name: 'Task 1',
            type: 'auto',
            status: 'completed',
            filesModified: ['src/new.ts', 'src/shared.ts'],
          },
        ],
      },
    });

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.keyFiles.length).toBe(3);
    const paths = doc.keyFiles.map((f) => f.path);
    expect(paths).toContain('src/new.ts');
    expect(paths).toContain('src/old.ts');
    expect(paths).toContain('src/shared.ts');
  });

  it('should collect observations by type', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
    });

    writeObservations([
      {
        id: 'o1',
        timestamp: '2026-02-12T10:00:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'error',
        content: { action: 'build', context: 'src', error: 'missing import' },
        relevance: 90,
      },
      {
        id: 'o2',
        timestamp: '2026-02-12T10:01:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'solution',
        content: { action: 'fix', context: 'src', solution: 'added import' },
        relevance: 85,
      },
      {
        id: 'o3',
        timestamp: '2026-02-12T10:02:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'pattern',
        content: { action: 'review', context: 'always check imports' },
        relevance: 70,
      },
    ]);

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.observations.errors.length).toBe(1);
    expect(doc.observations.errors[0].error).toBe('missing import');
    expect(doc.observations.solutions.length).toBe(1);
    expect(doc.observations.solutions[0].solution).toBe('added import');
    expect(doc.observations.patterns.length).toBe(1);
  });

  it('should generate recommendations from pending tasks', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
      currentExecution: {
        skillName: 'test-skill',
        skillSource: 'test',
        currentStep: 0,
        totalSteps: 1,
        status: 'running',
        startedAt: '2026-02-12T10:00:00.000Z',
        tasks: [
          { id: 't1', name: 'Write documentation', type: 'auto', status: 'pending' },
        ],
      },
    });

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.recommendations.length).toBeGreaterThan(0);
    expect(doc.recommendations[0]).toContain('Write documentation');
  });

  it('should format markdown output', () => {
    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });
    const md = handoff.toMarkdown(doc);

    expect(md).toContain('# Session Handoff');
    expect(md).toContain('## Accomplished');
    expect(md).toContain('## Pending');
  });

  it('should format JSON output', () => {
    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });
    const json = handoff.toJson(doc);

    const parsed = JSON.parse(json);
    expect(parsed.projectPath).toBe(TEST_DIR);
    expect(parsed.accomplished).toBeDefined();
    expect(parsed.pending).toBeDefined();
  });

  it('should include history in accomplished', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'completed-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T09:00:00.000Z',
          durationMs: 300000,
          status: 'completed',
          commits: ['def5678'],
          filesModified: ['src/foo.ts'],
        },
      ],
      decisions: [],
    });

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false });

    expect(doc.accomplished.tasks.length).toBe(1);
    expect(doc.accomplished.tasks[0].name).toBe('completed-skill');
    expect(doc.accomplished.tasks[0].duration).toBe('5m');
  });

  it('should respect maxObservations option', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
    });

    writeObservations(
      Array.from({ length: 10 }, (_, i) => ({
        id: `o${i}`,
        timestamp: `2026-02-12T10:${String(i).padStart(2, '0')}:00.000Z`,
        sessionId: 'test',
        agent: 'claude-code',
        type: 'error',
        content: { action: `action-${i}`, context: 'src', error: `error-${i}` },
        relevance: 90 - i,
      }))
    );

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false, maxObservations: 3 });

    const totalObs =
      doc.observations.errors.length +
      doc.observations.solutions.length +
      doc.observations.patterns.length;
    expect(totalObs).toBeLessThanOrEqual(3);
  });

  it('should skip observations when disabled', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
    });

    writeObservations([
      {
        id: 'o1',
        timestamp: '2026-02-12T10:00:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'error',
        content: { action: 'build', context: 'src', error: 'fail' },
        relevance: 90,
      },
    ]);

    const handoff = new SessionHandoff(TEST_DIR);
    const doc = handoff.generate({ includeGit: false, includeObservations: false });

    expect(doc.observations.errors).toEqual([]);
    expect(doc.observations.solutions).toEqual([]);
    expect(doc.observations.patterns).toEqual([]);
  });
});
