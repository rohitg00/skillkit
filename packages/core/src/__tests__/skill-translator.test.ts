import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  AGENT_SKILL_FORMATS,
  parseSkillToCanonical,
  parseSkillContentToCanonical,
  translateSkillToAgent,
  translateSkillToAll,
  writeTranslatedSkill,
  generateSkillsConfig,
  getAgentSkillsDir,
  getAgentConfigFile,
  supportsAutoDiscovery,
  getAllSkillsDirs,
  getGlobalSkillsDir,
  type CrossAgentSkill,
  type SkillTranslationOptions,
} from '../skill-translator.js';

describe('Skill Translator', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `skillkit-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('AGENT_SKILL_FORMATS', () => {
    it('should have configurations for all supported agents', () => {
      const expectedAgents = [
        'claude-code', 'cursor', 'codex', 'gemini-cli', 'opencode',
        'antigravity', 'amp', 'clawdbot', 'droid', 'github-copilot',
        'goose', 'kilo', 'kiro-cli', 'roo', 'trae', 'windsurf', 'universal',
      ];

      for (const agent of expectedAgents) {
        expect(AGENT_SKILL_FORMATS[agent as keyof typeof AGENT_SKILL_FORMATS]).toBeDefined();
      }
    });

    it('should have valid skillsDir for each agent', () => {
      for (const [agent, format] of Object.entries(AGENT_SKILL_FORMATS)) {
        expect(format.skillsDir).toBeTruthy();
        expect(typeof format.skillsDir).toBe('string');
      }
    });

    it('should have valid configFile for each agent', () => {
      for (const [agent, format] of Object.entries(AGENT_SKILL_FORMATS)) {
        expect(format.configFile).toBeTruthy();
        expect(typeof format.configFile).toBe('string');
      }
    });

    it('should have correct Cursor MDC format', () => {
      const cursor = AGENT_SKILL_FORMATS.cursor;
      expect(cursor.skillsDir).toBe('.cursor/skills');
      expect(cursor.configFile).toBe('.cursor/rules/skills.mdc');
      expect(cursor.configFormat).toBe('mdc');
    });

    it('should have correct Windsurf format', () => {
      const windsurf = AGENT_SKILL_FORMATS.windsurf;
      expect(windsurf.skillsDir).toBe('.windsurf/skills');
      expect(windsurf.configFile).toBe('.windsurf/rules/skills.md');
      expect(windsurf.configFormat).toBe('markdown');
      expect(windsurf.globalSkillsDir).toBe('~/.codeium/windsurf/skills');
    });

    it('should have correct GitHub Copilot format', () => {
      const copilot = AGENT_SKILL_FORMATS['github-copilot'];
      expect(copilot.skillsDir).toBe('.github/skills');
      expect(copilot.configFile).toBe('.github/copilot-instructions.md');
      expect(copilot.configFormat).toBe('markdown');
    });
  });

  describe('parseSkillToCanonical', () => {
    it('should parse a valid SKILL.md file', () => {
      const skillDir = join(tempDir, 'test-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: test-skill
description: A test skill for unit testing
version: "1.0.0"
author: Test Author
tags:
  - testing
  - unit-test
---
# Test Skill

This is a test skill for unit testing purposes.

## Usage

Use this skill when you need to test something.
`);

      const result = parseSkillToCanonical(skillDir);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('test-skill');
      expect(result?.description).toBe('A test skill for unit testing');
      expect(result?.version).toBe('1.0.0');
      expect(result?.author).toBe('Test Author');
      expect(result?.tags).toEqual(['testing', 'unit-test']);
      expect(result?.content).toContain('# Test Skill');
    });

    it('should return null for non-existent skill', () => {
      const result = parseSkillToCanonical(join(tempDir, 'non-existent'));
      expect(result).toBeNull();
    });

    it('should handle SKILL.md without frontmatter', () => {
      const skillDir = join(tempDir, 'no-frontmatter-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `# Simple Skill

Just some content without frontmatter.
`);

      const result = parseSkillToCanonical(skillDir);
      expect(result).not.toBeNull();
      // Without frontmatter, name is derived from directory name
      expect(result?.name).toBe('no-frontmatter-skill');
    });

    it('should extract allowed-tools from frontmatter', () => {
      const skillDir = join(tempDir, 'tools-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: tools-skill
description: Skill with allowed tools
allowed-tools: Read, Write, Bash
---
Content here.
`);

      const result = parseSkillToCanonical(skillDir);
      expect(result?.allowedTools).toEqual(['Read', 'Write', 'Bash']);
    });
  });

  describe('parseSkillContentToCanonical', () => {
    it('should parse skill content with full frontmatter', () => {
      const content = `---
name: content-skill
description: Parsed from content
model: opus
context: fork
disable-model-invocation: true
---
# Content Skill

Instructions here.
`;

      const result = parseSkillContentToCanonical(content, '/path/to/skill', 'claude-code');
      expect(result?.name).toBe('content-skill');
      expect(result?.description).toBe('Parsed from content');
      expect(result?.agentFields?.['model']).toBe('opus');
      expect(result?.agentFields?.['context']).toBe('fork');
      expect(result?.agentFields?.['disable-model-invocation']).toBe(true);
      expect(result?.sourceAgent).toBe('claude-code');
    });

    it('should extract description from content when not in frontmatter', () => {
      const content = `---
name: no-desc
---
This is a longer paragraph that should be used as the description when none is provided in frontmatter.

## More Content
`;

      const result = parseSkillContentToCanonical(content, '/path/to/skill');
      expect(result?.description).toContain('This is a longer paragraph');
    });
  });

  describe('translateSkillToAgent', () => {
    const testSkill: CrossAgentSkill = {
      name: 'translate-test',
      description: 'A skill to test translation',
      content: '# Translate Test\n\nTest content for translation.',
      frontmatter: { name: 'translate-test', description: 'A skill to test translation' },
      sourcePath: '/test/path',
      sourceAgent: 'claude-code',
      version: '1.0.0',
      author: 'Test',
      tags: ['test'],
    };

    it('should translate to Claude Code format', () => {
      const result = translateSkillToAgent(testSkill, 'claude-code');
      expect(result.success).toBe(true);
      expect(result.content).toContain('name: translate-test');
      expect(result.content).toContain('description: A skill to test translation');
      expect(result.targetAgent).toBe('claude-code');
    });

    it('should translate to Cursor format', () => {
      const result = translateSkillToAgent(testSkill, 'cursor');
      expect(result.success).toBe(true);
      expect(result.content).toContain('name: translate-test');
      expect(result.targetAgent).toBe('cursor');
    });

    it('should translate to Windsurf format', () => {
      const result = translateSkillToAgent(testSkill, 'windsurf');
      expect(result.success).toBe(true);
      expect(result.targetAgent).toBe('windsurf');
    });

    it('should include translation metadata when requested', () => {
      const options: SkillTranslationOptions = { addMetadata: true };
      const result = translateSkillToAgent(testSkill, 'cursor', options);
      expect(result.content).toContain('_translated-from: claude-code');
      expect(result.content).toContain('_translated-at:');
    });

    it('should preserve agent-specific fields for Claude Code', () => {
      const skillWithFields: CrossAgentSkill = {
        ...testSkill,
        agentFields: {
          model: 'opus',
          context: 'fork',
          'disable-model-invocation': true,
        },
      };

      const result = translateSkillToAgent(skillWithFields, 'claude-code');
      expect(result.content).toContain('model: opus');
      expect(result.content).toContain('context: fork');
      expect(result.content).toContain('disable-model-invocation: true');
    });

    it('should report incompatible features', () => {
      const skillWithHooks: CrossAgentSkill = {
        ...testSkill,
        agentFields: {
          hooks: [{ type: 'PreToolUse', command: 'echo test' }],
        },
      };

      const result = translateSkillToAgent(skillWithHooks, 'cursor');
      expect(result.incompatible).toContain('hooks (only supported in Claude Code)');
    });
  });

  describe('translateSkillToAll', () => {
    it('should translate skill to all supported agents', () => {
      const skillDir = join(tempDir, 'all-agents-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: all-agents
description: Skill for all agents
---
# All Agents Skill
`);

      const results = translateSkillToAll(skillDir, 'claude-code');
      expect(results.size).toBeGreaterThan(0);

      // Should not include source agent
      expect(results.has('claude-code')).toBe(false);

      // Should include other agents
      expect(results.has('cursor')).toBe(true);
      expect(results.has('windsurf')).toBe(true);
    });

    it('should return empty map for non-existent skill', () => {
      const results = translateSkillToAll(join(tempDir, 'non-existent'));
      expect(results.size).toBe(0);
    });
  });

  describe('writeTranslatedSkill', () => {
    it('should write translated skill to disk', () => {
      const result = {
        success: true,
        content: '---\nname: written-skill\n---\n# Content',
        filename: 'SKILL.md',
        targetDir: 'test-skill',
        warnings: [],
        incompatible: [],
        targetAgent: 'claude-code' as const,
      };

      const writeResult = writeTranslatedSkill(result, tempDir);
      expect(writeResult.success).toBe(true);
      expect(existsSync(writeResult.path)).toBe(true);
    });

    it('should create nested directories', () => {
      const result = {
        success: true,
        content: '---\nname: nested\n---\n# Content',
        filename: 'SKILL.md',
        targetDir: '.cursor/skills/nested-skill',
        warnings: [],
        incompatible: [],
        targetAgent: 'cursor' as const,
      };

      const writeResult = writeTranslatedSkill(result, tempDir);
      expect(writeResult.success).toBe(true);
      expect(existsSync(join(tempDir, '.cursor/skills/nested-skill/SKILL.md'))).toBe(true);
    });
  });

  describe('generateSkillsConfig', () => {
    const testSkills = [
      { name: 'skill-one', description: 'First skill', path: '/path/one', location: 'project' as const, enabled: true },
      { name: 'skill-two', description: 'Second skill', path: '/path/two', location: 'project' as const, enabled: true },
      { name: 'disabled-skill', description: 'Disabled', path: '/path/disabled', location: 'project' as const, enabled: false },
    ];

    it('should generate XML config for Claude Code', () => {
      const config = generateSkillsConfig(testSkills, 'claude-code');
      expect(config).toContain('<skills_system');
      expect(config).toContain('<name>skill-one</name>');
      expect(config).toContain('<name>skill-two</name>');
      expect(config).not.toContain('disabled-skill');
    });

    it('should generate MDC config for Cursor', () => {
      const config = generateSkillsConfig(testSkills, 'cursor');
      expect(config).toContain('---');
      expect(config).toContain('description:');
      expect(config).toContain('globs:');
      expect(config).toContain('alwaysApply: true');
      expect(config).toContain('**skill-one**');
      expect(config).toContain('**skill-two**');
    });

    it('should generate Markdown table config for Codex', () => {
      const config = generateSkillsConfig(testSkills, 'codex');
      expect(config).toContain('| Skill | Description | Command |');
      expect(config).toContain('| skill-one |');
      expect(config).toContain('| skill-two |');
    });

    it('should generate JSON config for Gemini CLI', () => {
      const config = generateSkillsConfig(testSkills, 'gemini-cli');
      expect(config).toContain('```json');
      expect(config).toContain('"name": "skill-one"');
      expect(config).toContain('"name": "skill-two"');
    });

    it('should generate Markdown config for Windsurf', () => {
      const config = generateSkillsConfig(testSkills, 'windsurf');
      expect(config).toContain('### skill-one');
      expect(config).toContain('### skill-two');
      expect(config).toContain('**Invoke:**');
    });

    it('should return empty string for no enabled skills', () => {
      const disabledSkills = [
        { name: 'disabled', description: 'Disabled', path: '/path', location: 'project' as const, enabled: false },
      ];
      const config = generateSkillsConfig(disabledSkills, 'claude-code');
      expect(config).toBe('');
    });
  });

  describe('utility functions', () => {
    it('getAgentSkillsDir should return correct path', () => {
      expect(getAgentSkillsDir('claude-code')).toBe('.claude/skills');
      expect(getAgentSkillsDir('cursor')).toBe('.cursor/skills');
      expect(getAgentSkillsDir('windsurf')).toBe('.windsurf/skills');
    });

    it('getAgentConfigFile should return correct path', () => {
      expect(getAgentConfigFile('claude-code')).toBe('CLAUDE.md');
      expect(getAgentConfigFile('cursor')).toBe('.cursor/rules/skills.mdc');
      expect(getAgentConfigFile('github-copilot')).toBe('.github/copilot-instructions.md');
    });

    it('supportsAutoDiscovery should return true for all major agents', () => {
      expect(supportsAutoDiscovery('claude-code')).toBe(true);
      expect(supportsAutoDiscovery('cursor')).toBe(true);
      expect(supportsAutoDiscovery('windsurf')).toBe(true);
    });

    it('getAllSkillsDirs should include alternative directories', () => {
      const cursorDirs = getAllSkillsDirs('cursor');
      expect(cursorDirs).toContain('.cursor/skills');
      expect(cursorDirs).toContain('.cursor/commands');

      const windsurfDirs = getAllSkillsDirs('windsurf');
      expect(windsurfDirs).toContain('.windsurf/skills');
      expect(windsurfDirs).toContain('.windsurf/workflows');
    });

    it('getGlobalSkillsDir should return correct global path', () => {
      expect(getGlobalSkillsDir('claude-code')).toBe('~/.claude/skills');
      expect(getGlobalSkillsDir('windsurf')).toBe('~/.codeium/windsurf/skills');
      expect(getGlobalSkillsDir('opencode')).toBe('~/.config/opencode/skills');
      expect(getGlobalSkillsDir('roo')).toBe('~/.roo/skills');
    });
  });
});

describe('Agent Adapter Integration', () => {
  it('should have matching config formats between AGENT_SKILL_FORMATS and expected values', () => {
    // Verify that the 2026 updates are consistent
    expect(AGENT_SKILL_FORMATS.cursor.configFormat).toBe('mdc');
    expect(AGENT_SKILL_FORMATS.windsurf.configFormat).toBe('markdown');
    expect(AGENT_SKILL_FORMATS['github-copilot'].configFormat).toBe('markdown');
    expect(AGENT_SKILL_FORMATS.trae.configFormat).toBe('markdown');
    expect(AGENT_SKILL_FORMATS['claude-code'].configFormat).toBe('xml');
    expect(AGENT_SKILL_FORMATS.codex.configFormat).toBe('markdown-table');
    expect(AGENT_SKILL_FORMATS['gemini-cli'].configFormat).toBe('json');
  });

  it('should have valid invoke commands', () => {
    for (const format of Object.values(AGENT_SKILL_FORMATS)) {
      expect(format.invokeCommand).toBe('skillkit read');
    }
  });
});
