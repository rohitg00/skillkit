/**
 * E2E Tests: Skill Translator
 *
 * End-to-end tests for cross-agent skill translation.
 * Tests the complete workflow of parsing, translating, and writing skills.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import {
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  testFileExists,
  readTestFile,
} from './helpers/cli-runner.js';
import {
  parseSkillToCanonical,
  parseSkillContentToCanonical,
  translateSkillToAgent,
  translateSkillToAll,
  writeTranslatedSkill,
  generateSkillsConfig,
  getAgentSkillsDir,
  getAgentConfigFile,
  AGENT_SKILL_FORMATS,
  type CrossAgentSkill,
} from '@skillkit/core';

// All 32 supported agents
const SUPPORTED_AGENTS = [
  'claude-code',
  'cursor',
  'codex',
  'gemini-cli',
  'opencode',
  'antigravity',
  'amp',
  'clawdbot',
  'droid',
  'github-copilot',
  'goose',
  'kilo',
  'kiro-cli',
  'roo',
  'trae',
  'windsurf',
  'universal',
] as const;

describe('E2E: Skill Translator - Parsing', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir('skillkit-translator-');
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('parseSkillToCanonical', () => {
    it('should parse a complete SKILL.md with all frontmatter fields', () => {
      const skillDir = join(testDir, 'complete-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: complete-skill
description: A comprehensive skill for E2E testing
version: "2.0.0"
author: SkillKit Team
tags:
  - testing
  - e2e
  - comprehensive
allowed-tools: Read, Write, Bash(npm:*)
---
# Complete Skill

This skill tests all parsing capabilities.

## Features

- Full frontmatter parsing
- Content extraction
- Agent-specific field handling

## Usage

\`\`\`bash
skillkit read complete-skill
\`\`\`
`);

      const result = parseSkillToCanonical(skillDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('complete-skill');
      expect(result?.description).toBe('A comprehensive skill for E2E testing');
      expect(result?.version).toBe('2.0.0');
      expect(result?.author).toBe('SkillKit Team');
      expect(result?.tags).toEqual(['testing', 'e2e', 'comprehensive']);
      expect(result?.allowedTools).toEqual(['Read', 'Write', 'Bash(npm:*)']);
      expect(result?.content).toContain('# Complete Skill');
      expect(result?.content).toContain('## Features');
    });

    it('should handle SKILL.md with minimal frontmatter', () => {
      const skillDir = join(testDir, 'minimal-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: minimal-skill
description: Just the basics
---
# Minimal Skill

Simple content.
`);

      const result = parseSkillToCanonical(skillDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('minimal-skill');
      expect(result?.description).toBe('Just the basics');
      expect(result?.version).toBeUndefined();
      expect(result?.author).toBeUndefined();
    });

    it('should extract description from content when not in frontmatter', () => {
      const skillDir = join(testDir, 'no-desc-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: no-desc-skill
---
This is the first paragraph which should become the description automatically.

## More Content

Additional content here.
`);

      const result = parseSkillToCanonical(skillDir);

      expect(result).not.toBeNull();
      expect(result?.description).toContain('This is the first paragraph');
    });

    it('should handle SKILL.md without any frontmatter', () => {
      const skillDir = join(testDir, 'no-frontmatter');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `# No Frontmatter Skill

This skill has no YAML frontmatter at all.

## Usage

Just use it directly.
`);

      const result = parseSkillToCanonical(skillDir);

      expect(result).not.toBeNull();
      // Name should be derived from directory
      expect(result?.name).toBe('no-frontmatter');
      expect(result?.content).toContain('# No Frontmatter Skill');
    });

    it('should return null for non-existent skill directory', () => {
      const result = parseSkillToCanonical(join(testDir, 'does-not-exist'));
      expect(result).toBeNull();
    });

    it('should return null for directory without SKILL.md', () => {
      const emptyDir = join(testDir, 'empty-dir');
      mkdirSync(emptyDir, { recursive: true });
      writeFileSync(join(emptyDir, 'README.md'), '# Not a skill');

      const result = parseSkillToCanonical(emptyDir);
      expect(result).toBeNull();
    });
  });

  describe('parseSkillContentToCanonical', () => {
    it('should parse content with Claude Code specific fields', () => {
      const content = `---
name: claude-specific
description: Skill with Claude Code specific fields
model: opus
context: fork
disable-model-invocation: true
---
# Claude Specific Skill

Use with Claude Code for best results.
`;

      const result = parseSkillContentToCanonical(content, '/path/to/skill', 'claude-code');

      expect(result?.name).toBe('claude-specific');
      expect(result?.agentFields?.model).toBe('opus');
      expect(result?.agentFields?.context).toBe('fork');
      expect(result?.agentFields?.['disable-model-invocation']).toBe(true);
      expect(result?.sourceAgent).toBe('claude-code');
    });

    it('should parse content with Cursor specific fields', () => {
      const content = `---
name: cursor-specific
description: Skill with Cursor specific fields
globs: "**/*.ts"
alwaysApply: true
---
# Cursor Specific Skill

Optimized for Cursor.
`;

      const result = parseSkillContentToCanonical(content, '/path/to/skill', 'cursor');

      expect(result?.name).toBe('cursor-specific');
      expect(result?.agentFields?.globs).toBe('**/*.ts');
      expect(result?.agentFields?.alwaysApply).toBe(true);
      expect(result?.sourceAgent).toBe('cursor');
    });
  });
});

describe('E2E: Skill Translator - Translation', () => {
  let testDir: string;
  let testSkill: CrossAgentSkill;

  beforeEach(() => {
    testDir = createTestDir('skillkit-translate-');
    testSkill = {
      name: 'translation-test',
      description: 'A skill designed for testing cross-agent translation',
      content: `# Translation Test Skill

This skill is used to verify that translation works correctly across all supported agents.

## Features

- Cross-agent compatibility
- Frontmatter preservation
- Content integrity

## Usage

\`\`\`bash
skillkit read translation-test
\`\`\`
`,
      frontmatter: {
        name: 'translation-test',
        description: 'A skill designed for testing cross-agent translation',
        version: '1.0.0',
        author: 'SkillKit E2E Tests',
        tags: ['testing', 'translation'],
      },
      sourcePath: join(testDir, 'translation-test'),
      sourceAgent: 'claude-code',
      version: '1.0.0',
      author: 'SkillKit E2E Tests',
      tags: ['testing', 'translation'],
      allowedTools: ['Read', 'Write', 'Bash'],
    };
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('translateSkillToAgent', () => {
    it.each(SUPPORTED_AGENTS)('should translate skill to %s format', (agent) => {
      const result = translateSkillToAgent(testSkill, agent);

      expect(result.success).toBe(true);
      expect(result.targetAgent).toBe(agent);
      expect(result.content).toBeTruthy();
      expect(result.content).toContain('translation-test');
      expect(typeof result.filename).toBe('string');
    });

    it('should preserve skill name and description across translations', () => {
      for (const agent of SUPPORTED_AGENTS) {
        const result = translateSkillToAgent(testSkill, agent);
        expect(result.content).toContain('translation-test');
      }
    });

    it('should add translation metadata when requested', () => {
      const result = translateSkillToAgent(testSkill, 'cursor', { addMetadata: true });

      expect(result.success).toBe(true);
      expect(result.content).toContain('_translated-from: claude-code');
      expect(result.content).toContain('_translated-at:');
    });

    it('should not add metadata by default', () => {
      const result = translateSkillToAgent(testSkill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).not.toContain('_translated-from');
    });

    it('should preserve Claude Code specific fields when translating back to Claude Code', () => {
      const claudeSkill: CrossAgentSkill = {
        ...testSkill,
        agentFields: {
          model: 'opus',
          context: 'fork',
          'disable-model-invocation': true,
        },
      };

      const result = translateSkillToAgent(claudeSkill, 'claude-code');

      expect(result.success).toBe(true);
      expect(result.content).toContain('model: opus');
      expect(result.content).toContain('context: fork');
      expect(result.content).toContain('disable-model-invocation: true');
    });

    it('should report incompatible features when translating hooks to non-Claude agents', () => {
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
    it('should translate skill to all agents except source', () => {
      const skillDir = join(testDir, 'all-agents-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), `---
name: all-agents
description: Skill for all agents testing
version: "1.0.0"
---
# All Agents Skill

Universal skill content.
`);

      const results = translateSkillToAll(skillDir, 'claude-code');

      // Should have translations for all agents except source
      expect(results.size).toBe(SUPPORTED_AGENTS.length - 1);
      expect(results.has('claude-code')).toBe(false);

      for (const agent of SUPPORTED_AGENTS) {
        if (agent !== 'claude-code') {
          expect(results.has(agent)).toBe(true);
          const result = results.get(agent);
          expect(result?.success).toBe(true);
        }
      }
    });

    it('should return empty map for non-existent skill', () => {
      const results = translateSkillToAll(join(testDir, 'non-existent'));
      expect(results.size).toBe(0);
    });
  });
});

describe('E2E: Skill Translator - Writing', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir('skillkit-write-');
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('writeTranslatedSkill', () => {
    it('should write translated skill to correct location', () => {
      const translationResult = {
        success: true,
        content: `---
name: written-skill
description: A skill that was written to disk
---
# Written Skill

Content here.
`,
        filename: 'SKILL.md',
        targetDir: 'written-skill',
        warnings: [],
        incompatible: [],
        targetAgent: 'claude-code' as const,
      };

      const writeResult = writeTranslatedSkill(translationResult, testDir);

      expect(writeResult.success).toBe(true);
      expect(existsSync(writeResult.path)).toBe(true);

      const writtenContent = readFileSync(writeResult.path, 'utf-8');
      expect(writtenContent).toContain('name: written-skill');
      expect(writtenContent).toContain('# Written Skill');
    });

    it('should create nested directories as needed', () => {
      const translationResult = {
        success: true,
        content: '---\nname: nested\n---\n# Content',
        filename: 'SKILL.md',
        targetDir: '.cursor/skills/deeply/nested/skill',
        warnings: [],
        incompatible: [],
        targetAgent: 'cursor' as const,
      };

      const writeResult = writeTranslatedSkill(translationResult, testDir);

      expect(writeResult.success).toBe(true);
      expect(existsSync(join(testDir, '.cursor/skills/deeply/nested/skill/SKILL.md'))).toBe(true);
    });

    it('should handle failed translation results gracefully', () => {
      const failedResult = {
        success: false,
        content: '',
        filename: 'SKILL.md',
        targetDir: 'failed-skill',
        warnings: ['Translation failed'],
        incompatible: [],
        targetAgent: 'cursor' as const,
      };

      const writeResult = writeTranslatedSkill(failedResult, testDir);

      expect(writeResult.success).toBe(false);
    });
  });
});

describe('E2E: Skill Translator - Config Generation', () => {
  const testSkills = [
    { name: 'skill-alpha', description: 'First test skill', path: '/skills/alpha', location: 'project' as const, enabled: true },
    { name: 'skill-beta', description: 'Second test skill', path: '/skills/beta', location: 'project' as const, enabled: true },
    { name: 'skill-gamma', description: 'Third test skill', path: '/skills/gamma', location: 'global' as const, enabled: true },
    { name: 'skill-disabled', description: 'Disabled skill', path: '/skills/disabled', location: 'project' as const, enabled: false },
  ];

  describe('generateSkillsConfig', () => {
    it('should generate XML config for Claude Code', () => {
      const config = generateSkillsConfig(testSkills, 'claude-code');

      expect(config).toContain('<skills_system');
      expect(config).toContain('<name>skill-alpha</name>');
      expect(config).toContain('<name>skill-beta</name>');
      expect(config).toContain('<name>skill-gamma</name>');
      expect(config).not.toContain('skill-disabled');
      expect(config).toContain('<description>First test skill</description>');
      expect(config).toContain('skillkit read');
    });

    it('should generate MDC config for Cursor', () => {
      const config = generateSkillsConfig(testSkills, 'cursor');

      expect(config).toContain('---');
      expect(config).toContain('description:');
      expect(config).toContain('globs:');
      expect(config).toContain('alwaysApply: true');
      expect(config).toContain('**skill-alpha**');
      expect(config).toContain('**skill-beta**');
      expect(config).not.toContain('skill-disabled');
    });

    it('should generate Markdown table config for Codex', () => {
      const config = generateSkillsConfig(testSkills, 'codex');

      expect(config).toContain('| Skill | Description | Command |');
      expect(config).toContain('| skill-alpha |');
      expect(config).toContain('| skill-beta |');
      expect(config).toContain('First test skill');
      expect(config).not.toContain('skill-disabled');
    });

    it('should generate JSON config for Gemini CLI', () => {
      const config = generateSkillsConfig(testSkills, 'gemini-cli');

      expect(config).toContain('```json');
      expect(config).toContain('"name": "skill-alpha"');
      expect(config).toContain('"name": "skill-beta"');
      expect(config).toContain('"description": "First test skill"');
      expect(config).not.toContain('skill-disabled');
    });

    it('should generate Markdown config for Windsurf', () => {
      const config = generateSkillsConfig(testSkills, 'windsurf');

      expect(config).toContain('### skill-alpha');
      expect(config).toContain('### skill-beta');
      expect(config).toContain('**Invoke:**');
      expect(config).toContain('`skillkit read skill-alpha`');
      expect(config).not.toContain('skill-disabled');
    });

    it('should generate XML config for Roo', () => {
      const config = generateSkillsConfig(testSkills, 'roo');

      expect(config).toContain('<skills_system');
      expect(config).toContain('<name>skill-alpha</name>');
    });

    it('should generate Markdown config for Trae', () => {
      const config = generateSkillsConfig(testSkills, 'trae');

      expect(config).toContain('### skill-alpha');
      expect(config).toContain('### skill-beta');
    });

    it('should generate Markdown config for GitHub Copilot', () => {
      const config = generateSkillsConfig(testSkills, 'github-copilot');

      expect(config).toContain('### skill-alpha');
      expect(config).toContain('### skill-beta');
    });

    it('should return empty string when no skills are enabled', () => {
      const disabledOnlySkills = [
        { name: 'disabled-1', description: 'Disabled', path: '/d1', location: 'project' as const, enabled: false },
        { name: 'disabled-2', description: 'Also disabled', path: '/d2', location: 'project' as const, enabled: false },
      ];

      const config = generateSkillsConfig(disabledOnlySkills, 'claude-code');
      expect(config).toBe('');
    });

    it('should exclude disabled skills from all agent configs', () => {
      for (const agent of SUPPORTED_AGENTS) {
        const config = generateSkillsConfig(testSkills, agent);
        expect(config).not.toContain('skill-disabled');
      }
    });
  });
});

describe('E2E: Skill Translator - Utility Functions', () => {
  describe('getAgentSkillsDir', () => {
    it.each(SUPPORTED_AGENTS)('should return valid skills directory for %s', (agent) => {
      const dir = getAgentSkillsDir(agent);
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    });

    it('should return correct paths for major agents', () => {
      expect(getAgentSkillsDir('claude-code')).toBe('.claude/skills');
      expect(getAgentSkillsDir('cursor')).toBe('.cursor/skills');
      expect(getAgentSkillsDir('windsurf')).toBe('.windsurf/skills');
      expect(getAgentSkillsDir('github-copilot')).toBe('.github/skills');
      expect(getAgentSkillsDir('codex')).toBe('.codex/skills');
    });
  });

  describe('getAgentConfigFile', () => {
    it.each(SUPPORTED_AGENTS)('should return valid config file for %s', (agent) => {
      const file = getAgentConfigFile(agent);
      expect(typeof file).toBe('string');
      expect(file.length).toBeGreaterThan(0);
    });

    it('should return correct config files for major agents', () => {
      expect(getAgentConfigFile('claude-code')).toBe('CLAUDE.md');
      expect(getAgentConfigFile('cursor')).toBe('.cursor/rules/skills.mdc');
      expect(getAgentConfigFile('windsurf')).toBe('.windsurf/rules/skills.md');
      expect(getAgentConfigFile('github-copilot')).toBe('.github/copilot-instructions.md');
    });
  });

  describe('AGENT_SKILL_FORMATS', () => {
    it('should have configuration for all supported agents', () => {
      for (const agent of SUPPORTED_AGENTS) {
        expect(AGENT_SKILL_FORMATS[agent]).toBeDefined();
        expect(AGENT_SKILL_FORMATS[agent].skillsDir).toBeTruthy();
        expect(AGENT_SKILL_FORMATS[agent].configFile).toBeTruthy();
        expect(AGENT_SKILL_FORMATS[agent].invokeCommand).toBe('skillkit read');
      }
    });

    it('should have correct config formats for each agent', () => {
      expect(AGENT_SKILL_FORMATS['claude-code'].configFormat).toBe('xml');
      expect(AGENT_SKILL_FORMATS.cursor.configFormat).toBe('mdc');
      expect(AGENT_SKILL_FORMATS.windsurf.configFormat).toBe('markdown');
      expect(AGENT_SKILL_FORMATS.codex.configFormat).toBe('markdown-table');
      expect(AGENT_SKILL_FORMATS['gemini-cli'].configFormat).toBe('json');
      expect(AGENT_SKILL_FORMATS['github-copilot'].configFormat).toBe('markdown');
      expect(AGENT_SKILL_FORMATS.trae.configFormat).toBe('markdown');
      expect(AGENT_SKILL_FORMATS.roo.configFormat).toBe('xml');
    });
  });
});

describe('E2E: Skill Translator - Complete Workflow', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir('skillkit-workflow-');
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  it('should complete full translation workflow from Claude Code to all agents', () => {
    // Create a Claude Code skill
    const skillDir = join(testDir, 'workflow-skill');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), `---
name: workflow-skill
description: Complete workflow test skill
version: "1.0.0"
author: E2E Test Suite
tags:
  - workflow
  - testing
allowed-tools: Read, Write
---
# Workflow Test Skill

This skill tests the complete translation workflow.

## Instructions

1. Parse the SKILL.md file
2. Translate to target agent format
3. Write the translated skill
4. Generate config

## Usage

Use \`skillkit read workflow-skill\` to load this skill.
`);

    // Step 1: Parse to canonical format
    const canonicalSkill = parseSkillToCanonical(skillDir);
    expect(canonicalSkill).not.toBeNull();
    expect(canonicalSkill?.name).toBe('workflow-skill');

    // Step 2: Translate to all agents
    const translations = translateSkillToAll(skillDir, 'claude-code');
    expect(translations.size).toBeGreaterThan(0);

    // Step 3: Verify translations for key agents
    const cursorTranslation = translations.get('cursor');
    expect(cursorTranslation?.success).toBe(true);
    expect(cursorTranslation?.content).toContain('workflow-skill');

    const windsurfTranslation = translations.get('windsurf');
    expect(windsurfTranslation?.success).toBe(true);
    expect(windsurfTranslation?.content).toContain('workflow-skill');

    const copilotTranslation = translations.get('github-copilot');
    expect(copilotTranslation?.success).toBe(true);
    expect(copilotTranslation?.content).toContain('workflow-skill');

    // Step 4: Write a translation to disk
    const outputDir = join(testDir, 'output');
    mkdirSync(outputDir, { recursive: true });

    if (cursorTranslation) {
      const writeResult = writeTranslatedSkill(cursorTranslation, outputDir);
      expect(writeResult.success).toBe(true);
      expect(existsSync(writeResult.path)).toBe(true);
    }

    // Step 5: Generate config for installed skills
    const installedSkills = [
      { name: 'workflow-skill', description: 'Complete workflow test skill', path: skillDir, location: 'project' as const, enabled: true },
    ];

    const claudeConfig = generateSkillsConfig(installedSkills, 'claude-code');
    expect(claudeConfig).toContain('<name>workflow-skill</name>');

    const cursorConfig = generateSkillsConfig(installedSkills, 'cursor');
    expect(cursorConfig).toContain('**workflow-skill**');
  });

  it('should handle skill with agent-specific features during translation', () => {
    // Create a CrossAgentSkill directly with hooks in agentFields
    // This is more reliable than parsing from YAML
    const skillWithHooks: CrossAgentSkill = {
      name: 'agent-specific',
      description: 'Skill with agent-specific features',
      content: '# Agent Specific Skill\n\nThis skill has Claude Code specific features.',
      frontmatter: { name: 'agent-specific', description: 'Skill with agent-specific features' },
      sourcePath: join(testDir, 'agent-specific'),
      sourceAgent: 'claude-code',
      agentFields: {
        model: 'opus',
        context: 'fork',
        hooks: [
          { type: 'PreToolUse', command: 'echo "Before tool use"' },
          { type: 'PostToolUse', command: 'echo "After tool use"' },
        ],
      },
    };

    // Translate to Claude Code (should preserve features)
    const claudeResult = translateSkillToAgent(skillWithHooks, 'claude-code');
    expect(claudeResult.success).toBe(true);
    expect(claudeResult.incompatible).toHaveLength(0);

    // Translate to Cursor (should report incompatible features)
    const cursorResult = translateSkillToAgent(skillWithHooks, 'cursor');
    expect(cursorResult.success).toBe(true);
    // Hooks are not supported in Cursor
    expect(cursorResult.incompatible.some(i => i.includes('hooks'))).toBe(true);
  });

  it('should maintain content integrity across multiple translations', () => {
    const originalContent = `## Important Section

This content must be preserved exactly.

\`\`\`typescript
const important = "code";
console.log(important);
\`\`\`

### Subsection

- Bullet point 1
- Bullet point 2
- Bullet point 3
`;

    const skillDir = join(testDir, 'content-integrity');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, 'SKILL.md'), `---
name: content-integrity
description: Tests content preservation
---
${originalContent}`);

    const canonicalSkill = parseSkillToCanonical(skillDir);
    expect(canonicalSkill).not.toBeNull();

    // Verify content is preserved in translations
    for (const agent of ['cursor', 'windsurf', 'github-copilot', 'codex'] as const) {
      const result = translateSkillToAgent(canonicalSkill!, agent);
      expect(result.success).toBe(true);
      expect(result.content).toContain('## Important Section');
      expect(result.content).toContain('const important = "code"');
      expect(result.content).toContain('- Bullet point 1');
    }
  });
});
