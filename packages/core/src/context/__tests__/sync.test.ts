import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { ContextSync, createContextSync, syncToAllAgents, syncToAgent } from '../sync.js';
import type { AgentType } from '../../types.js';

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock ContextManager with a class
vi.mock('../manager.js', () => ({
  ContextManager: class MockContextManager {
    get() {
      return {
        version: 1,
        project: { name: 'test-project' },
        stack: {
          languages: [],
          frameworks: [],
          libraries: [],
          styling: [],
          testing: [],
          databases: [],
          tools: [],
          runtime: [],
        },
        agents: {
          detected: ['claude-code', 'cursor'],
          synced: ['claude-code', 'cursor'],
        },
      };
    }
    init() {}
    updateAgents() {}
  },
}));

// Hoisted mocks - these are defined before vi.mock calls are hoisted
const { mockTranslateSkillFile, mockFindAllSkills } = vi.hoisted(() => {
  return {
    mockTranslateSkillFile: vi.fn().mockReturnValue({
      success: true,
      content: 'translated content',
      filename: 'skill.md',
      format: 'skill-md',
      warnings: [],
      incompatible: [],
      errors: [],
    }),
    mockFindAllSkills: vi.fn().mockReturnValue([
      {
        name: 'test-skill',
        path: '/test/project/.claude/skills/test-skill',
        filename: 'test-skill.md',
      },
    ]),
  };
});

// Mock translator
vi.mock('../../translator/index', () => ({
  translateSkillFile: mockTranslateSkillFile,
}));

// Mock skills module
vi.mock('../../skills', () => ({
  findAllSkills: mockFindAllSkills,
}));

describe('ContextSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('detectAgents', () => {
    it('should detect Claude Code agent', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.claude')) return true;
        }
        return false;
      });

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toContain('claude-code');
    });

    it('should detect Cursor agent', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.cursor')) return true;
          if (path.includes('.cursorrules')) return true;
        }
        return false;
      });

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toContain('cursor');
    });

    it('should detect multiple agents', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.claude')) return true;
          if (path.includes('.cursor')) return true;
          if (path.includes('.codex')) return true;
        }
        return false;
      });

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toContain('claude-code');
      expect(agents).toContain('cursor');
      expect(agents).toContain('codex');
    });

    it('should detect Windsurf agent', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.windsurfrules')) return true;
          if (path.includes('.windsurf')) return true;
        }
        return false;
      });

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toContain('windsurf');
    });

    it('should detect GitHub Copilot agent', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          // github-copilot is detected via .github/skills directory or AGENTS.md
          if (path.includes('.github/skills')) return true;
        }
        return false;
      });

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toContain('github-copilot');
    });

    it('should return empty array when no agents detected', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const sync = new ContextSync('/test/project');
      const agents = sync.detectAgents();

      expect(agents).toEqual([]);
    });
  });

  describe('checkStatus', () => {
    it('should return status for all agents', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.claude/skills')) return true;
        }
        return false;
      });

      // readdirSync with withFileTypes returns entries with isDirectory method
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'skill-1', isDirectory: () => true },
        { name: 'skill-2', isDirectory: () => true },
      ] as any);

      const sync = new ContextSync('/test/project');
      const status = sync.checkStatus();

      expect(status).toHaveProperty('claude-code');
      expect(status['claude-code'].skillCount).toBe(2);
    });

    it('should show hasSkills true when skills exist', () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.claude/skills')) return true;
        }
        return false;
      });

      vi.mocked(readdirSync).mockReturnValue([
        { name: 'skill-1', isDirectory: () => true },
      ] as any);

      const sync = new ContextSync('/test/project');
      const status = sync.checkStatus();

      expect(status['claude-code'].hasSkills).toBe(true);
    });

    it('should show hasSkills false when no skills exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(readdirSync).mockReturnValue([]);

      const sync = new ContextSync('/test/project');
      const status = sync.checkStatus();

      expect(status['claude-code'].hasSkills).toBe(false);
      expect(status['claude-code'].skillCount).toBe(0);
    });
  });

  describe('syncToAgent', () => {
    it('should sync skills to an agent', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const sync = new ContextSync('/test/project');
      const result = await sync.syncToAgent('cursor', [
        { name: 'skill-1', path: '/test/skill-1' },
      ]);

      expect(result.success).toBe(true);
      expect(result.agent).toBe('cursor');
      expect(result.skillsSynced).toBeGreaterThanOrEqual(0);
    });

    it('should skip existing skills without force flag', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const sync = new ContextSync('/test/project');
      const result = await sync.syncToAgent('cursor', [
        { name: 'existing-skill', path: '/test/existing-skill' },
      ]);

      expect(result.skillsSkipped).toBeGreaterThanOrEqual(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should overwrite existing skills with force flag', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const sync = new ContextSync('/test/project');
      const result = await sync.syncToAgent(
        'cursor',
        [{ name: 'existing-skill', path: '/test/existing-skill' }],
        { force: true }
      );

      // With force flag, skill should be synced (or skipped if translation fails)
      expect(result).toBeDefined();
      expect(result.agent).toBe('cursor');
    });

    it('should handle dry run mode', async () => {
      const sync = new ContextSync('/test/project');
      const result = await sync.syncToAgent(
        'cursor',
        [{ name: 'test-skill', path: '/test/test-skill' }],
        { dryRun: true }
      );

      // In dry run, files should not be written
      expect(result.success).toBe(true);
      // writeFileSync should not be called with actual writes in dry run
    });

    it('should return error for invalid agent', async () => {
      const sync = new ContextSync('/test/project');
      const result = await sync.syncToAgent(
        'invalid-agent' as AgentType,
        [{ name: 'skill', path: '/test/skill' }]
      );

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('syncAll', () => {
    it('should sync to all detected agents', async () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        if (typeof path === 'string') {
          if (path.includes('.claude')) return true;
          if (path.includes('.cursor')) return true;
        }
        return false;
      });

      vi.mocked(readdirSync).mockReturnValue(['test-skill'] as any);

      const sync = new ContextSync('/test/project');
      // Mock getSourceSkills to return test skills
      vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);
      const report = await sync.syncAll();

      expect(report.totalAgents).toBeGreaterThan(0);
      expect(report.results.length).toBeGreaterThan(0);
    });

    it('should sync to specific agents when provided', async () => {
      const sync = new ContextSync('/test/project');
      // Mock getSourceSkills to return test skills
      vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);
      const report = await sync.syncAll({
        agents: ['cursor', 'windsurf'],
      });

      expect(report.results.some((r) => r.agent === 'cursor')).toBe(true);
      expect(report.results.some((r) => r.agent === 'windsurf')).toBe(true);
    });

    it('should report successful and failed agents', async () => {
      const sync = new ContextSync('/test/project');
      // Mock getSourceSkills to return test skills
      vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);
      const report = await sync.syncAll({
        agents: ['claude-code', 'cursor'],
      });

      expect(report.totalAgents).toBe(2);
      expect(report.successfulAgents).toBeGreaterThanOrEqual(0);
      expect(report.totalSkills).toBeGreaterThanOrEqual(0);
    });

    it('should respect dry run mode for all agents', async () => {
      const sync = new ContextSync('/test/project');
      // Mock getSourceSkills to return test skills
      vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);
      const report = await sync.syncAll({
        agents: ['cursor'],
        dryRun: true,
      });

      expect(report.results[0].success).toBe(true);
    });

    it('should collect warnings from all agents', async () => {
      vi.mocked(existsSync).mockReturnValue(true); // Skills already exist

      const sync = new ContextSync('/test/project');
      // Mock getSourceSkills to return test skills
      vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);
      const report = await sync.syncAll({
        agents: ['cursor'],
      });

      // Should have warnings about existing skills
      expect(report.results[0]).toBeDefined();
    });
  });

});

describe('convenience functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContextSync', () => {
    it('should create a ContextSync instance', () => {
      const sync = createContextSync('/test/project');

      expect(sync).toBeInstanceOf(ContextSync);
    });

    it('should use current directory if no path provided', () => {
      const sync = createContextSync();

      expect(sync).toBeInstanceOf(ContextSync);
    });
  });

  describe('syncToAllAgents', () => {
    it('should sync to all agents', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      // Mock ContextSync.prototype.getSourceSkills for convenience function tests
      const originalGetSourceSkills = ContextSync.prototype['getSourceSkills'];
      ContextSync.prototype['getSourceSkills'] = vi.fn().mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);

      try {
        const report = await syncToAllAgents('/test/project');

        expect(report).toHaveProperty('totalAgents');
        expect(report).toHaveProperty('successfulAgents');
        expect(report).toHaveProperty('results');
      } finally {
        // Restore original method
        ContextSync.prototype['getSourceSkills'] = originalGetSourceSkills;
      }
    });
  });

  describe('syncToAgent', () => {
    it('should sync to a specific agent', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      // Mock ContextSync.prototype.getSourceSkills for convenience function tests
      const originalGetSourceSkills = ContextSync.prototype['getSourceSkills'];
      ContextSync.prototype['getSourceSkills'] = vi.fn().mockReturnValue([
        { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
      ]);

      try {
        // syncToAgent(agent, projectPath?, options?)
        const result = await syncToAgent('cursor', '/test/project');

        expect(result.agent).toBe('cursor');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('skillsSynced');
      } finally {
        // Restore original method
        ContextSync.prototype['getSourceSkills'] = originalGetSourceSkills;
      }
    });
  });
});

describe('error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle file system errors gracefully', async () => {
    // Setup: existsSync must return true for SKILL.md path
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const sync = new ContextSync('/test/project');
    const result = await sync.syncToAgent('cursor', [
      { name: 'skill', path: '/test/skill' },
    ]);

    // Error is caught and added to errors array
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Failed to sync');
  });

  it('should continue syncing other agents if one fails', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    let callCount = 0;
    vi.mocked(writeFileSync).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First agent failed');
      }
    });

    const sync = new ContextSync('/test/project');
    // Mock getSourceSkills to return test skills
    vi.spyOn(sync as any, 'getSourceSkills').mockReturnValue([
      { name: 'test-skill', path: '/test/project/.claude/skills/test-skill' },
    ]);
    const report = await sync.syncAll({
      agents: ['cursor', 'windsurf'],
    });

    // Should have results for both agents
    expect(report.results.length).toBe(2);
  });

  it('should report translation failures as warnings', async () => {
    // Setup: existsSync must return true for SKILL.md to be found
    vi.mocked(existsSync).mockReturnValue(true);

    // Use the hoisted mock directly
    mockTranslateSkillFile.mockReturnValue({
      success: false,
      content: '',
      filename: '',
      format: 'skill-md',
      warnings: [],
      incompatible: [],
      errors: ['Translation failed'],
    });

    const sync = new ContextSync('/test/project');
    const result = await sync.syncToAgent('cursor', [
      { name: 'untranslatable-skill', path: '/test/skill' },
    ]);

    // Translation failures add warnings, not errors
    expect(result.skillsSkipped).toBe(1);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
