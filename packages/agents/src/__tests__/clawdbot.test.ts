import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClawdbotAdapter } from '../clawdbot.js';
import type { Skill } from '@skillkit/core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// Mock filesystem functions
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

describe('ClawdbotAdapter', () => {
  let adapter: ClawdbotAdapter;
  const mockExistsSync = vi.mocked(existsSync);

  beforeEach(() => {
    adapter = new ClawdbotAdapter();
    mockExistsSync.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('configuration', () => {
    it('should have correct type', () => {
      expect(adapter.type).toBe('clawdbot');
    });

    it('should have correct name', () => {
      expect(adapter.name).toBe('Clawdbot');
    });

    it('should have correct skillsDir', () => {
      expect(adapter.skillsDir).toBe('.clawdbot/skills');
    });

    it('should have correct configFile', () => {
      expect(adapter.configFile).toBe('AGENTS.md');
    });
  });

  describe('generateConfig', () => {
    it('should return empty string for no enabled skills', () => {
      const skills: Skill[] = [
        {
          name: 'test-skill',
          enabled: false,
          path: '/path/to/skill',
          content: '# Test',
        },
      ];

      const config = adapter.generateConfig(skills);
      expect(config).toBe('');
    });

    it('should generate config with enabled skills', () => {
      const skills: Skill[] = [
        {
          name: 'test-skill',
          description: 'A test skill',
          enabled: true,
          path: '/path/to/skill',
          content: '# Test',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<skills_system priority="1">');
      expect(config).toContain('## Available Skills');
      expect(config).toContain('<name>test-skill</name>');
      expect(config).toContain('<description>A test skill</description>');
      expect(config).toContain('skillkit read <skill-name>');
    });

    it('should generate config with multiple skills', () => {
      const skills: Skill[] = [
        {
          name: 'skill-1',
          description: 'First skill',
          enabled: true,
          path: '/path/to/skill1',
          content: '# Skill 1',
        },
        {
          name: 'skill-2',
          description: 'Second skill',
          enabled: true,
          path: '/path/to/skill2',
          content: '# Skill 2',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<name>skill-1</name>');
      expect(config).toContain('<name>skill-2</name>');
      expect(config).toContain('<description>First skill</description>');
      expect(config).toContain('<description>Second skill</description>');
    });

    it('should filter out disabled skills', () => {
      const skills: Skill[] = [
        {
          name: 'enabled-skill',
          enabled: true,
          path: '/path/to/enabled',
          content: '# Enabled',
        },
        {
          name: 'disabled-skill',
          enabled: false,
          path: '/path/to/disabled',
          content: '# Disabled',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('enabled-skill');
      expect(config).not.toContain('disabled-skill');
    });

    it('should include usage notes', () => {
      const skills: Skill[] = [
        {
          name: 'test-skill',
          enabled: true,
          path: '/path/to/skill',
          content: '# Test',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<usage>');
      expect(config).toContain('When users ask you to perform tasks');
      expect(config).toContain('How to use skills:');
      expect(config).toContain('- Invoke:');
      expect(config).toContain('Usage notes:');
    });

    it('should include available_skills section', () => {
      const skills: Skill[] = [
        {
          name: 'test-skill',
          enabled: true,
          path: '/path/to/skill',
          content: '# Test',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<available_skills>');
      expect(config).toContain('</available_skills>');
    });
  });

  describe('parseConfig', () => {
    it('should parse skill names from config', () => {
      const config = `
        <skills_system>
          <available_skills>
            <skill>
              <name>skill-1</name>
              <description>Test skill 1</description>
            </skill>
            <skill>
              <name>skill-2</name>
              <description>Test skill 2</description>
            </skill>
          </available_skills>
        </skills_system>
      `;

      const skillNames = adapter.parseConfig(config);

      expect(skillNames).toEqual(['skill-1', 'skill-2']);
    });

    it('should return empty array for no skills', () => {
      const config = '<skills_system></skills_system>';

      const skillNames = adapter.parseConfig(config);

      expect(skillNames).toEqual([]);
    });

    it('should handle whitespace in skill names', () => {
      const config = `
        <skill>
          <name>  skill-with-spaces  </name>
        </skill>
      `;

      const skillNames = adapter.parseConfig(config);

      expect(skillNames).toEqual(['skill-with-spaces']);
    });

    it('should handle multiple name tags', () => {
      const config = `
        <name>skill-1</name>
        <name>skill-2</name>
        <name>skill-3</name>
      `;

      const skillNames = adapter.parseConfig(config);

      expect(skillNames).toEqual(['skill-1', 'skill-2', 'skill-3']);
    });
  });

  describe('getInvokeCommand', () => {
    it('should return correct invoke command', () => {
      const command = adapter.getInvokeCommand('test-skill');

      expect(command).toBe('skillkit read test-skill');
    });

    it('should work with skill names containing hyphens', () => {
      const command = adapter.getInvokeCommand('my-test-skill');

      expect(command).toBe('skillkit read my-test-skill');
    });

    it('should work with skill names containing underscores', () => {
      const command = adapter.getInvokeCommand('my_test_skill');

      expect(command).toBe('skillkit read my_test_skill');
    });
  });

  describe('isDetected', () => {
    it('should detect Clawdbot from workspace skills directory', async () => {
      mockExistsSync.mockImplementation((path) => {
        return path === join(process.cwd(), 'skills');
      });

      const detected = await adapter.isDetected();

      expect(detected).toBe(true);
    });

    it('should detect Clawdbot from global directory', async () => {
      mockExistsSync.mockImplementation((path) => {
        return path === join(homedir(), '.clawdbot');
      });

      const detected = await adapter.isDetected();

      expect(detected).toBe(true);
    });

    it('should detect Clawdbot from config file', async () => {
      mockExistsSync.mockImplementation((path) => {
        return path === join(process.cwd(), 'clawdbot.json');
      });

      const detected = await adapter.isDetected();

      expect(detected).toBe(true);
    });

    it('should not detect Clawdbot when no indicators present', async () => {
      mockExistsSync.mockReturnValue(false);

      const detected = await adapter.isDetected();

      expect(detected).toBe(false);
    });

    it('should detect when multiple indicators are present', async () => {
      mockExistsSync.mockReturnValue(true);

      const detected = await adapter.isDetected();

      expect(detected).toBe(true);
    });

    it('should check all expected paths', async () => {
      mockExistsSync.mockReturnValue(false);

      await adapter.isDetected();

      expect(mockExistsSync).toHaveBeenCalledWith(join(process.cwd(), 'skills'));
      expect(mockExistsSync).toHaveBeenCalledWith(join(homedir(), '.clawdbot'));
      expect(mockExistsSync).toHaveBeenCalledWith(join(process.cwd(), 'clawdbot.json'));
    });
  });

  describe('integration', () => {
    it('should work end-to-end with typical workflow', () => {
      const skills: Skill[] = [
        {
          name: 'react-patterns',
          description: 'React best practices',
          enabled: true,
          path: '/skills/react-patterns',
          content: '# React Patterns\n\nBest practices...',
        },
        {
          name: 'typescript-strict',
          description: 'TypeScript strict mode',
          enabled: true,
          path: '/skills/typescript-strict',
          content: '# TypeScript Strict\n\nUse strict mode...',
        },
      ];

      // Generate config
      const config = adapter.generateConfig(skills);

      // Parse config
      const parsedSkills = adapter.parseConfig(config);

      // Verify round-trip
      expect(parsedSkills).toEqual(['react-patterns', 'typescript-strict']);

      // Get invoke commands
      const command1 = adapter.getInvokeCommand('react-patterns');
      const command2 = adapter.getInvokeCommand('typescript-strict');

      expect(command1).toBe('skillkit read react-patterns');
      expect(command2).toBe('skillkit read typescript-strict');
    });

    it('should preserve skill order during generation and parsing', () => {
      const skills: Skill[] = [
        { name: 'a-skill', enabled: true, path: '/a', content: '' },
        { name: 'z-skill', enabled: true, path: '/z', content: '' },
        { name: 'm-skill', enabled: true, path: '/m', content: '' },
      ];

      const config = adapter.generateConfig(skills);
      const parsed = adapter.parseConfig(config);

      expect(parsed).toEqual(['a-skill', 'z-skill', 'm-skill']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty skills array', () => {
      const config = adapter.generateConfig([]);
      expect(config).toBe('');
    });

    it('should handle skills without descriptions', () => {
      const skills: Skill[] = [
        {
          name: 'no-desc-skill',
          enabled: true,
          path: '/path',
          content: '# No description',
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<name>no-desc-skill</name>');
      expect(config).toContain('<description></description>');
    });

    it('should handle special characters in skill names', () => {
      const command = adapter.getInvokeCommand('skill-with-special_chars.123');

      expect(command).toBe('skillkit read skill-with-special_chars.123');
    });

    it('should handle empty config string during parsing', () => {
      const parsed = adapter.parseConfig('');

      expect(parsed).toEqual([]);
    });

    it('should handle malformed XML during parsing', () => {
      const config = '<name>skill-1<name>broken</name>';

      const parsed = adapter.parseConfig(config);

      // Should still extract valid names
      expect(parsed).toContain('broken');
    });
  });

  describe('metadata handling', () => {
    it('should include skill metadata in generated config', () => {
      const skills: Skill[] = [
        {
          name: 'meta-skill',
          description: 'Has metadata',
          enabled: true,
          path: '/path',
          content: '# Meta',
          metadata: {
            version: '1.0.0',
            author: 'Test Author',
          },
        },
      ];

      const config = adapter.generateConfig(skills);

      expect(config).toContain('<name>meta-skill</name>');
      expect(config).toContain('<description>Has metadata</description>');
    });
  });
});
