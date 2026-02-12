import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { SessionTimeline } from '../timeline.js';
import type { SessionState, TimelineOptions } from '../types.js';

const TEST_DIR = join(process.cwd(), '.test-timeline-' + process.pid);
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

function writeSnapshots(snapshots: Array<Record<string, unknown>>): void {
  const dir = join(SKILLKIT_DIR, 'snapshots');
  mkdirSync(dir, { recursive: true });
  for (const snap of snapshots) {
    writeFileSync(join(dir, `${snap.name}.yaml`), stringify(snap));
  }
}

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('SessionTimeline', () => {
  it('should create timeline instance', () => {
    const timeline = new SessionTimeline(TEST_DIR);
    expect(timeline).toBeDefined();
  });

  it('should return empty timeline when no data', () => {
    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build();
    expect(data.events).toEqual([]);
    expect(data.totalCount).toBe(0);
    expect(data.projectPath).toBe(TEST_DIR);
  });

  it('should collect events from current execution', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
      currentExecution: {
        skillName: 'test-skill',
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
            startedAt: '2026-02-12T10:00:00.000Z',
            completedAt: '2026-02-12T10:01:00.000Z',
          },
          {
            id: 't2',
            name: 'Task 2',
            type: 'auto',
            status: 'in_progress',
            startedAt: '2026-02-12T10:01:00.000Z',
          },
        ],
      },
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    const skillStarts = data.events.filter((e) => e.type === 'skill_start');
    expect(skillStarts.length).toBe(1);
    expect(skillStarts[0].source).toBe('test-skill');

    const taskEvents = data.events.filter((e) => e.type === 'task_progress');
    expect(taskEvents.length).toBe(2);
  });

  it('should collect events from execution history', () => {
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
          commits: ['abc1234'],
          filesModified: ['src/index.ts'],
        },
      ],
      decisions: [],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    const completes = data.events.filter((e) => e.type === 'skill_complete');
    expect(completes.length).toBe(1);
    expect(completes[0].summary).toContain('old-skill');
    expect(completes[0].summary).toContain('2m');
  });

  it('should collect decision events', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [
        {
          key: 'api-style',
          value: 'REST',
          madeAt: '2026-02-12T11:00:00.000Z',
          skillName: 'architect',
        },
      ],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    const decisions = data.events.filter((e) => e.type === 'decision');
    expect(decisions.length).toBe(1);
    expect(decisions[0].summary).toContain('REST');
  });

  it('should collect observation events', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
    });

    writeObservations([
      {
        id: 'obs1',
        timestamp: '2026-02-12T10:30:00.000Z',
        sessionId: 'test',
        agent: 'claude-code',
        type: 'error',
        content: { action: 'build', context: 'src', error: 'missing import' },
        relevance: 80,
      },
    ]);

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    const obs = data.events.filter((e) => e.type === 'observation');
    expect(obs.length).toBe(1);
    expect(obs[0].summary).toContain('error');
  });

  it('should collect snapshot events', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [],
      decisions: [],
    });

    writeSnapshots([
      {
        version: 1,
        name: 'pre-refactor',
        createdAt: '2026-02-12T09:00:00.000Z',
        description: 'Before big refactor',
        sessionState: {
          version: 1,
          lastActivity: '2026-02-12T09:00:00.000Z',
          projectPath: TEST_DIR,
          history: [],
          decisions: [],
        },
        observations: [],
      },
    ]);

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    const snaps = data.events.filter((e) => e.type === 'snapshot');
    expect(snaps.length).toBe(1);
    expect(snaps[0].summary).toContain('pre-refactor');
  });

  it('should filter by event type', () => {
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
          commits: [],
          filesModified: [],
        },
      ],
      decisions: [
        { key: 'k', value: 'v', madeAt: '2026-02-12T10:01:00.000Z' },
      ],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ types: ['decision'], includeGit: false });

    expect(data.events.every((e) => e.type === 'decision')).toBe(true);
    expect(data.events.length).toBe(1);
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
          completedAt: '2026-02-01T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
        {
          skillName: 'recent',
          skillSource: 'test',
          completedAt: '2026-02-12T10:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
      ],
      decisions: [],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ since: '2026-02-10', includeGit: false });

    expect(data.events.length).toBe(1);
    expect(data.events[0].source).toBe('recent');
  });

  it('should respect limit', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: Array.from({ length: 10 }, (_, i) => ({
        skillName: `skill-${i}`,
        skillSource: 'test',
        completedAt: `2026-02-12T${String(i).padStart(2, '0')}:00:00.000Z`,
        durationMs: 60000,
        status: 'completed' as const,
        commits: [],
        filesModified: [],
      })),
      decisions: [],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ limit: 3, includeGit: false });

    expect(data.events.length).toBe(3);
    expect(data.totalCount).toBe(10);
  });

  it('should sort events chronologically', () => {
    writeSessionState({
      version: 1,
      lastActivity: new Date().toISOString(),
      projectPath: TEST_DIR,
      history: [
        {
          skillName: 'later',
          skillSource: 'test',
          completedAt: '2026-02-12T12:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
        {
          skillName: 'earlier',
          skillSource: 'test',
          completedAt: '2026-02-12T08:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
      ],
      decisions: [],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ includeGit: false });

    expect(data.events[0].source).toBe('earlier');
    expect(data.events[1].source).toBe('later');
  });

  it('should format text output', () => {
    const timeline = new SessionTimeline(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      sessionDate: '2026-02-12',
      events: [
        {
          timestamp: '2026-02-12T10:30:00.000Z',
          type: 'skill_start' as const,
          source: 'test-skill',
          summary: 'test-skill started',
        },
      ],
      totalCount: 1,
    };

    const text = timeline.formatText(data);
    expect(text).toContain('Session Timeline');
    expect(text).toContain('test-skill started');
    expect(text).toContain('1 event total');
  });

  it('should format JSON output', () => {
    const timeline = new SessionTimeline(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      sessionDate: '2026-02-12',
      events: [],
      totalCount: 0,
    };

    const json = timeline.formatJson(data);
    const parsed = JSON.parse(json);
    expect(parsed.projectPath).toBe(TEST_DIR);
    expect(parsed.events).toEqual([]);
  });

  it('should filter by skill name', () => {
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
          commits: [],
          filesModified: [],
        },
        {
          skillName: 'other-skill',
          skillSource: 'test',
          completedAt: '2026-02-12T11:00:00.000Z',
          durationMs: 60000,
          status: 'completed',
          commits: [],
          filesModified: [],
        },
      ],
      decisions: [],
    });

    const timeline = new SessionTimeline(TEST_DIR);
    const data = timeline.build({ skillFilter: 'target-skill', includeGit: false });

    expect(data.events.length).toBe(1);
    expect(data.events[0].source).toBe('target-skill');
  });

  it('should handle empty events in text format', () => {
    const timeline = new SessionTimeline(TEST_DIR);
    const data = {
      projectPath: TEST_DIR,
      sessionDate: '2026-02-12',
      events: [],
      totalCount: 0,
    };

    const text = timeline.formatText(data);
    expect(text).toContain('No events found');
  });
});
