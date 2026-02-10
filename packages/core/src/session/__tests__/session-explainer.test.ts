import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SessionExplainer } from '../session-explainer.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn().mockReturnValue(''),
}));

const sessionYaml = `
version: 1
lastActivity: "2026-02-10T14:00:00.000Z"
projectPath: /test/project
currentExecution:
  skillName: code-simplifier
  skillSource: claude-code
  currentStep: 2
  totalSteps: 3
  status: running
  startedAt: "2026-02-10T12:00:00.000Z"
  tasks:
    - id: task-1
      name: Refactor SessionManager
      type: auto
      status: completed
      startedAt: "2026-02-10T12:00:00.000Z"
      completedAt: "2026-02-10T12:45:00.000Z"
      filesModified:
        - src/session/manager.ts
    - id: task-2
      name: Add snapshot tests
      type: auto
      status: completed
      startedAt: "2026-02-10T12:45:00.000Z"
      completedAt: "2026-02-10T13:17:00.000Z"
      filesModified:
        - src/session/__tests__/snapshot.test.ts
    - id: task-3
      name: Update documentation
      type: auto
      status: paused
history:
  - skillName: remotion-best-practices
    skillSource: local
    completedAt: "2026-02-10T11:00:00.000Z"
    durationMs: 120000
    status: completed
    commits:
      - sha1
    filesModified:
      - src/video.ts
decisions:
  - key: snapshot-format
    value: YAML
    madeAt: "2026-02-10T12:30:00.000Z"
  - key: storage-location
    value: ".skillkit/snapshots/"
    madeAt: "2026-02-10T12:35:00.000Z"
`;

const observationsYaml = `
version: 1
sessionId: session-1
observations:
  - id: obs-1
    timestamp: "2026-02-10T12:10:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: error
    content:
      action: Build failed
      context: Type error
    relevance: 90
  - id: obs-2
    timestamp: "2026-02-10T12:15:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: solution
    content:
      action: Fixed type
      context: Added annotation
    relevance: 85
  - id: obs-3
    timestamp: "2026-02-10T12:20:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: pattern
    content:
      action: Detected pattern
      context: Recurring fix
    relevance: 70
  - id: obs-4
    timestamp: "2026-02-10T12:25:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: error
    content:
      action: Test failed
      context: Assertion error
    relevance: 80
  - id: obs-5
    timestamp: "2026-02-10T12:30:00.000Z"
    sessionId: session-1
    agent: claude-code
    type: solution
    content:
      action: Fixed test
      context: Updated assertion
    relevance: 75
`;

describe('SessionExplainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T14:34:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('explain', () => {
    it('should return a full explanation with active session', () => {
      vi.mocked(existsSync).mockImplementation((filepath: any) => {
        const path = String(filepath);
        if (path.includes('session.yaml')) return true;
        if (path.includes('.git')) return false;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        const path = String(filepath);
        if (path.includes('session.yaml')) return sessionYaml;
        return '';
      });

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });

      expect(explanation.agent).toBe('claude-code');
      expect(explanation.duration).toBeDefined();
      expect(explanation.skillsUsed).toHaveLength(2);
      expect(explanation.skillsUsed[0].name).toBe('code-simplifier');
      expect(explanation.skillsUsed[0].status).toBe('running');
      expect(explanation.skillsUsed[1].name).toBe('remotion-best-practices');
      expect(explanation.skillsUsed[1].status).toBe('completed');
      expect(explanation.tasks).toHaveLength(3);
      expect(explanation.tasks[0].name).toBe('Refactor SessionManager');
      expect(explanation.tasks[0].duration).toBe('45m');
      expect(explanation.tasks[1].name).toBe('Add snapshot tests');
      expect(explanation.tasks[1].duration).toBe('32m');
      expect(explanation.tasks[2].name).toBe('Update documentation');
      expect(explanation.filesModified).toContain('src/session/manager.ts');
      expect(explanation.filesModified).toContain('src/video.ts');
      expect(explanation.decisions).toHaveLength(2);
      expect(explanation.decisions[0].key).toBe('snapshot-format');
      expect(explanation.decisions[0].value).toBe('YAML');
    });

    it('should deduplicate files across current execution and history', () => {
      const sessionWithDupes = `
version: 1
lastActivity: "2026-02-10T14:00:00.000Z"
projectPath: /test/project
currentExecution:
  skillName: skill-a
  skillSource: local
  currentStep: 1
  totalSteps: 1
  status: completed
  startedAt: "2026-02-10T12:00:00.000Z"
  tasks:
    - id: task-1
      name: Task A
      type: auto
      status: completed
      filesModified:
        - src/shared.ts
        - src/a.ts
history:
  - skillName: skill-b
    skillSource: local
    completedAt: "2026-02-10T11:00:00.000Z"
    durationMs: 60000
    status: completed
    commits: []
    filesModified:
      - src/shared.ts
      - src/b.ts
decisions: []
`;
      vi.mocked(existsSync).mockImplementation((filepath: any) => {
        return String(filepath).includes('session.yaml');
      });
      vi.mocked(readFileSync).mockReturnValue(sessionWithDupes);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });

      expect(explanation.filesModified).toHaveLength(3);
      expect(explanation.filesModified).toContain('src/shared.ts');
      expect(explanation.filesModified).toContain('src/a.ts');
      expect(explanation.filesModified).toContain('src/b.ts');
    });

    it('should return empty explanation when no session exists', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });

      expect(explanation.agent).toBe('unknown');
      expect(explanation.skillsUsed).toEqual([]);
      expect(explanation.tasks).toEqual([]);
      expect(explanation.filesModified).toEqual([]);
      expect(explanation.decisions).toEqual([]);
      expect(explanation.gitCommits).toBe(0);
    });

    it('should skip git when includeGit is false', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });

      expect(explanation.gitCommits).toBe(0);
    });

    it('should default observation counts to zero when store is unavailable', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });

      expect(explanation.observationCounts).toEqual({
        errors: 0,
        solutions: 0,
        patterns: 0,
        total: 0,
      });
    });
  });

  describe('formatText', () => {
    it('should format explanation as readable text', () => {
      vi.mocked(existsSync).mockImplementation((filepath: any) => {
        const path = String(filepath);
        if (path.includes('session.yaml')) return true;
        if (path.includes('observations.yaml')) return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        const path = String(filepath);
        if (path.includes('session.yaml')) return sessionYaml;
        if (path.includes('observations.yaml')) return observationsYaml;
        return '';
      });

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });
      const text = explainer.formatText(explanation);

      expect(text).toContain('Session Summary');
      expect(text).toContain('Duration:');
      expect(text).toContain('Agent:');
      expect(text).toContain('Skills Used');
      expect(text).toContain('code-simplifier');
      expect(text).toContain('Tasks');
      expect(text).toContain('Refactor SessionManager');
      expect(text).toContain('Files Modified:');
      expect(text).toContain('Decisions');
      expect(text).toContain('snapshot-format');
      expect(text).toContain('Observations:');
    });

    it('should handle empty explanation', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });
      const text = explainer.formatText(explanation);

      expect(text).toContain('Session Summary');
      expect(text).toContain('Agent:');
      expect(text).toContain('Files Modified: 0 files');
    });
  });

  describe('formatJson', () => {
    it('should format explanation as valid JSON', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });
      const json = explainer.formatJson(explanation);

      const parsed = JSON.parse(json);
      expect(parsed.date).toBeDefined();
      expect(parsed.agent).toBe('unknown');
      expect(parsed.skillsUsed).toEqual([]);
      expect(parsed.observationCounts).toBeDefined();
    });

    it('should output valid JSON for a full explanation', () => {
      vi.mocked(existsSync).mockImplementation((filepath: any) => {
        const path = String(filepath);
        if (path.includes('session.yaml')) return true;
        return false;
      });
      vi.mocked(readFileSync).mockReturnValue(sessionYaml);

      const explainer = new SessionExplainer('/test/project');
      const explanation = explainer.explain({ includeGit: false });
      const json = explainer.formatJson(explanation);

      const parsed = JSON.parse(json);
      expect(parsed.skillsUsed).toHaveLength(2);
      expect(parsed.tasks).toHaveLength(3);
      expect(parsed.decisions).toHaveLength(2);
    });
  });
});
