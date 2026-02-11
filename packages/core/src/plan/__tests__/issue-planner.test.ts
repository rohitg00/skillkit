import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IssuePlanner, createIssuePlanner } from '../issue-planner.js';
import type { GitHubIssue } from '../issue-planner.js';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
}));

import { execFileSync } from 'node:child_process';
const mockExecFileSync = vi.mocked(execFileSync);

describe('IssuePlanner', () => {
  let planner: IssuePlanner;

  beforeEach(() => {
    planner = new IssuePlanner();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseIssueRef', () => {
    it('should parse short ref #123', () => {
      const result = planner.parseIssueRef('#123');
      expect(result).toEqual({ number: 123 });
    });

    it('should parse bare number 123', () => {
      const result = planner.parseIssueRef('123');
      expect(result).toEqual({ number: 123 });
    });

    it('should parse owner/repo#123', () => {
      const result = planner.parseIssueRef('rohitg00/skillkit#42');
      expect(result).toEqual({
        owner: 'rohitg00',
        repo: 'skillkit',
        number: 42,
      });
    });

    it('should parse full GitHub URL', () => {
      const result = planner.parseIssueRef(
        'https://github.com/rohitg00/skillkit/issues/42'
      );
      expect(result).toEqual({
        owner: 'rohitg00',
        repo: 'skillkit',
        number: 42,
      });
    });

    it('should throw on invalid ref', () => {
      expect(() => planner.parseIssueRef('invalid')).toThrow(
        'Invalid issue reference'
      );
    });
  });

  describe('extractTasksFromBody', () => {
    it('should extract unchecked tasks', () => {
      const body = '- [ ] Add auth\n- [ ] Add tests\n';
      const tasks = planner.extractTasksFromBody(body);
      expect(tasks).toEqual([
        { name: 'Add auth', checked: false },
        { name: 'Add tests', checked: false },
      ]);
    });

    it('should extract checked tasks', () => {
      const body = '- [x] Setup project\n- [X] Add config\n';
      const tasks = planner.extractTasksFromBody(body);
      expect(tasks).toEqual([
        { name: 'Setup project', checked: true },
        { name: 'Add config', checked: true },
      ]);
    });

    it('should handle mixed tasks', () => {
      const body = '- [x] Done task\n- [ ] Pending task\n';
      const tasks = planner.extractTasksFromBody(body);
      expect(tasks).toHaveLength(2);
      expect(tasks[0].checked).toBe(true);
      expect(tasks[1].checked).toBe(false);
    });

    it('should handle empty body', () => {
      expect(planner.extractTasksFromBody('')).toEqual([]);
    });

    it('should ignore non-checkbox lines', () => {
      const body = '- Regular list item\n- [ ] Checkbox item\n';
      const tasks = planner.extractTasksFromBody(body);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toBe('Checkbox item');
    });

    it('should handle indented checkboxes', () => {
      const body = '  - [ ] Indented task\n';
      const tasks = planner.extractTasksFromBody(body);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toBe('Indented task');
    });
  });

  describe('extractFileMentions', () => {
    it('should extract file paths in backticks', () => {
      const text = 'Update `src/foo.ts` and `lib/bar.js`';
      const files = planner.extractFileMentions(text);
      expect(files).toContain('src/foo.ts');
      expect(files).toContain('lib/bar.js');
    });

    it('should deduplicate file mentions', () => {
      const text = 'See `src/foo.ts` and also `src/foo.ts`';
      const files = planner.extractFileMentions(text);
      expect(files).toHaveLength(1);
    });

    it('should handle text with no file mentions', () => {
      const text = 'No files here';
      expect(planner.extractFileMentions(text)).toEqual([]);
    });

    it('should extract files with extensions', () => {
      const text = 'Check `config.json` and `README.md`';
      const files = planner.extractFileMentions(text);
      expect(files).toContain('config.json');
      expect(files).toContain('README.md');
    });
  });

  describe('inferLabelsToTags', () => {
    it('should map known labels', () => {
      expect(planner.inferLabelsToTags(['bug'])).toEqual(['fix']);
      expect(planner.inferLabelsToTags(['enhancement'])).toEqual(['feature']);
      expect(planner.inferLabelsToTags(['documentation'])).toEqual(['docs']);
    });

    it('should handle case insensitivity', () => {
      expect(planner.inferLabelsToTags(['Bug'])).toEqual(['fix']);
      expect(planner.inferLabelsToTags(['ENHANCEMENT'])).toEqual(['feature']);
    });

    it('should skip unknown labels', () => {
      expect(planner.inferLabelsToTags(['unknown-label'])).toEqual([]);
    });

    it('should deduplicate tags', () => {
      expect(planner.inferLabelsToTags(['bug', 'fix'])).toEqual(['fix']);
    });
  });

  describe('fetchIssue', () => {
    it('should fetch issue from current repo', () => {
      const ghResponse = JSON.stringify({
        number: 42,
        title: 'Add dark mode',
        body: '- [ ] Add theme provider\n- [ ] Update styles',
        labels: [{ name: 'enhancement' }],
        assignees: [{ login: 'user1' }],
        url: 'https://github.com/test/repo/issues/42',
        state: 'OPEN',
      });

      mockExecFileSync.mockReturnValue(ghResponse as any);

      const issue = planner.fetchIssue('#42');

      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        [
          'issue',
          'view',
          '42',
          '--json',
          'number,title,body,labels,assignees,url,state',
        ],
        expect.objectContaining({ encoding: 'utf-8' })
      );

      expect(issue.number).toBe(42);
      expect(issue.title).toBe('Add dark mode');
      expect(issue.labels).toEqual(['enhancement']);
      expect(issue.assignees).toEqual(['user1']);
    });

    it('should fetch issue from specific repo', () => {
      const ghResponse = JSON.stringify({
        number: 10,
        title: 'Fix bug',
        body: '',
        labels: [],
        assignees: [],
        url: 'https://github.com/owner/repo/issues/10',
        state: 'OPEN',
      });

      mockExecFileSync.mockReturnValue(ghResponse as any);

      planner.fetchIssue('owner/repo#10');

      expect(mockExecFileSync).toHaveBeenCalledWith(
        'gh',
        [
          'issue',
          'view',
          '10',
          '--json',
          'number,title,body,labels,assignees,url,state',
          '--repo',
          'owner/repo',
        ],
        expect.objectContaining({ encoding: 'utf-8' })
      );
    });
  });

  describe('generatePlan', () => {
    const baseIssue: GitHubIssue = {
      number: 42,
      title: 'Add dark mode support',
      body: 'We need dark mode.\n\n- [ ] Add theme context provider\n- [ ] Update component styles\n- [x] Research themes',
      labels: ['enhancement'],
      assignees: ['user1'],
      url: 'https://github.com/test/repo/issues/42',
      state: 'OPEN',
    };

    it('should generate plan from issue with checklist', () => {
      const plan = planner.generatePlan(baseIssue);

      expect(plan.name).toBe('Issue #42: Add dark mode support');
      expect(plan.goal).toBe('We need dark mode.');
      expect(plan.tasks).toHaveLength(3);
      expect(plan.tasks[0].name).toBe('Add theme context provider');
      expect(plan.tasks[1].name).toBe('Update component styles');
      expect(plan.tasks[2].name).toBe('Research themes');
      expect(plan.tasks[2].status).toBe('completed');
    });

    it('should set metadata correctly', () => {
      const plan = planner.generatePlan(baseIssue, { agent: 'cursor' });

      expect(plan.metadata).toBeDefined();
      expect(plan.metadata!.issueNumber).toBe(42);
      expect(plan.metadata!.issueUrl).toBe(
        'https://github.com/test/repo/issues/42'
      );
      expect(plan.metadata!.agent).toBe('cursor');
      expect(plan.metadata!.generatedAt).toBeDefined();
    });

    it('should infer tags from labels', () => {
      const plan = planner.generatePlan(baseIssue);
      expect(plan.tags).toContain('feature');
    });

    it('should create single task when no checklist', () => {
      const issue: GitHubIssue = {
        ...baseIssue,
        body: 'Just a description with no checkboxes.\n\nUpdate `src/theme.ts`.',
      };

      const plan = planner.generatePlan(issue);
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].name).toBe('Add dark mode support');
      expect(plan.tasks[0].files.modify).toContain('src/theme.ts');
    });

    it('should extract file mentions into task files', () => {
      const issue: GitHubIssue = {
        ...baseIssue,
        body: '- [ ] Update `src/components/App.tsx` for theming',
      };

      const plan = planner.generatePlan(issue);
      expect(plan.tasks[0].files.modify).toContain(
        'src/components/App.tsx'
      );
    });

    it('should respect includeTests option', () => {
      const plan = planner.generatePlan(baseIssue, { includeTests: false });
      for (const task of plan.tasks) {
        const hasTestStep = task.steps.some((s) => s.type === 'test');
        expect(hasTestStep).toBe(false);
      }
    });

    it('should use custom tech stack', () => {
      const plan = planner.generatePlan(baseIssue, {
        techStack: ['React', 'TypeScript'],
      });
      expect(plan.techStack).toEqual(['React', 'TypeScript']);
    });
  });

  describe('createIssuePlanner', () => {
    it('should create an IssuePlanner instance', () => {
      const p = createIssuePlanner();
      expect(p).toBeInstanceOf(IssuePlanner);
    });
  });
});
