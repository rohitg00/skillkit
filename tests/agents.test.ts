import { describe, it, expect } from 'vitest';
import {
  getAdapter,
  getAllAdapters,
  getSkillsDir,
  getConfigFile,
} from '../src/agents/index.js';
import type { Skill } from '../src/core/types.js';

describe('agents', () => {
  const mockSkills: Skill[] = [
    {
      name: 'pdf',
      description: 'PDF manipulation toolkit',
      path: '/path/to/pdf',
      location: 'project',
      enabled: true,
    },
    {
      name: 'xlsx',
      description: 'Excel file processing',
      path: '/path/to/xlsx',
      location: 'global',
      enabled: true,
    },
  ];

  describe('getAdapter', () => {
    it('should return adapter for claude-code', () => {
      const adapter = getAdapter('claude-code');
      expect(adapter.type).toBe('claude-code');
      expect(adapter.name).toBe('Claude Code');
      expect(adapter.skillsDir).toBe('.claude/skills');
      expect(adapter.configFile).toBe('AGENTS.md');
    });

    it('should return adapter for cursor', () => {
      const adapter = getAdapter('cursor');
      expect(adapter.type).toBe('cursor');
      expect(adapter.name).toBe('Cursor');
      expect(adapter.skillsDir).toBe('.cursor/skills');
      expect(adapter.configFile).toBe('.cursorrules');
    });

    it('should return adapter for codex', () => {
      const adapter = getAdapter('codex');
      expect(adapter.type).toBe('codex');
      expect(adapter.name).toBe('OpenAI Codex CLI');
    });

    it('should return adapter for gemini-cli', () => {
      const adapter = getAdapter('gemini-cli');
      expect(adapter.type).toBe('gemini-cli');
      expect(adapter.name).toBe('Gemini CLI');
    });

    it('should return adapter for opencode', () => {
      const adapter = getAdapter('opencode');
      expect(adapter.type).toBe('opencode');
      expect(adapter.name).toBe('OpenCode');
    });

    it('should return adapter for antigravity', () => {
      const adapter = getAdapter('antigravity');
      expect(adapter.type).toBe('antigravity');
      expect(adapter.name).toBe('Antigravity');
    });

    it('should return adapter for universal', () => {
      const adapter = getAdapter('universal');
      expect(adapter.type).toBe('universal');
      expect(adapter.name).toBe('Universal (Any Agent)');
    });

    it('should return adapter for amp', () => {
      const adapter = getAdapter('amp');
      expect(adapter.type).toBe('amp');
      expect(adapter.name).toBe('Amp');
      expect(adapter.skillsDir).toBe('.agents/skills');
    });

    it('should return adapter for clawdbot', () => {
      const adapter = getAdapter('clawdbot');
      expect(adapter.type).toBe('clawdbot');
      expect(adapter.name).toBe('Clawdbot');
      expect(adapter.skillsDir).toBe('skills');
    });

    it('should return adapter for droid', () => {
      const adapter = getAdapter('droid');
      expect(adapter.type).toBe('droid');
      expect(adapter.name).toBe('Droid (Factory)');
      expect(adapter.skillsDir).toBe('.factory/skills');
    });

    it('should return adapter for github-copilot', () => {
      const adapter = getAdapter('github-copilot');
      expect(adapter.type).toBe('github-copilot');
      expect(adapter.name).toBe('GitHub Copilot');
      expect(adapter.skillsDir).toBe('.github/skills');
    });

    it('should return adapter for goose', () => {
      const adapter = getAdapter('goose');
      expect(adapter.type).toBe('goose');
      expect(adapter.name).toBe('Goose');
      expect(adapter.skillsDir).toBe('.goose/skills');
    });

    it('should return adapter for kilo', () => {
      const adapter = getAdapter('kilo');
      expect(adapter.type).toBe('kilo');
      expect(adapter.name).toBe('Kilo Code');
      expect(adapter.skillsDir).toBe('.kilocode/skills');
    });

    it('should return adapter for kiro-cli', () => {
      const adapter = getAdapter('kiro-cli');
      expect(adapter.type).toBe('kiro-cli');
      expect(adapter.name).toBe('Kiro CLI');
      expect(adapter.skillsDir).toBe('.kiro/skills');
    });

    it('should return adapter for roo', () => {
      const adapter = getAdapter('roo');
      expect(adapter.type).toBe('roo');
      expect(adapter.name).toBe('Roo Code');
      expect(adapter.skillsDir).toBe('.roo/skills');
    });

    it('should return adapter for trae', () => {
      const adapter = getAdapter('trae');
      expect(adapter.type).toBe('trae');
      expect(adapter.name).toBe('Trae');
      expect(adapter.skillsDir).toBe('.trae/skills');
    });

    it('should return adapter for windsurf', () => {
      const adapter = getAdapter('windsurf');
      expect(adapter.type).toBe('windsurf');
      expect(adapter.name).toBe('Windsurf');
      expect(adapter.skillsDir).toBe('.windsurf/skills');
    });
  });

  describe('getAllAdapters', () => {
    it('should return all 17 adapters', () => {
      const adapters = getAllAdapters();
      expect(adapters.length).toBe(17);
      expect(adapters.map(a => a.type)).toContain('claude-code');
      expect(adapters.map(a => a.type)).toContain('cursor');
      expect(adapters.map(a => a.type)).toContain('universal');
      expect(adapters.map(a => a.type)).toContain('amp');
      expect(adapters.map(a => a.type)).toContain('goose');
      expect(adapters.map(a => a.type)).toContain('windsurf');
    });
  });

  describe('generateConfig', () => {
    it('should generate claude-code config with XML', () => {
      const adapter = getAdapter('claude-code');
      const config = adapter.generateConfig(mockSkills);

      expect(config).toContain('<skills_system');
      expect(config).toContain('<name>pdf</name>');
      expect(config).toContain('<name>xlsx</name>');
      expect(config).toContain('SKILLS_TABLE_START');
    });

    it('should generate cursor config with markdown', () => {
      const adapter = getAdapter('cursor');
      const config = adapter.generateConfig(mockSkills);

      expect(config).toContain('# Skills System');
      expect(config).toContain('**pdf**');
      expect(config).toContain('**xlsx**');
    });

    it('should generate universal config', () => {
      const adapter = getAdapter('universal');
      const config = adapter.generateConfig(mockSkills);

      expect(config).toContain('SKILLKIT_SKILLS_START');
      expect(config).toContain('<available_skills>');
    });

    it('should return empty string for no skills', () => {
      const adapter = getAdapter('claude-code');
      const config = adapter.generateConfig([]);

      expect(config).toBe('');
    });

    it('should filter disabled skills', () => {
      const skillsWithDisabled: Skill[] = [
        { ...mockSkills[0], enabled: false },
        mockSkills[1],
      ];

      const adapter = getAdapter('claude-code');
      const config = adapter.generateConfig(skillsWithDisabled);

      expect(config).not.toContain('<name>pdf</name>');
      expect(config).toContain('<name>xlsx</name>');
    });
  });

  describe('parseConfig', () => {
    it('should parse skill names from XML config', () => {
      const adapter = getAdapter('claude-code');
      const config = adapter.generateConfig(mockSkills);
      const names = adapter.parseConfig(config);

      expect(names).toContain('pdf');
      expect(names).toContain('xlsx');
    });
  });

  describe('getInvokeCommand', () => {
    it('should return correct invoke command', () => {
      const adapter = getAdapter('claude-code');
      expect(adapter.getInvokeCommand('pdf')).toBe('skillkit read pdf');
    });
  });

  describe('utility functions', () => {
    it('getSkillsDir should return correct directory', () => {
      expect(getSkillsDir('claude-code')).toBe('.claude/skills');
      expect(getSkillsDir('cursor')).toBe('.cursor/skills');
      expect(getSkillsDir('universal')).toBe('.agent/skills');
    });

    it('getConfigFile should return correct file', () => {
      expect(getConfigFile('claude-code')).toBe('AGENTS.md');
      expect(getConfigFile('cursor')).toBe('.cursorrules');
      expect(getConfigFile('universal')).toBe('AGENTS.md');
    });
  });
});
