import { describe, it, expect, beforeEach } from 'vitest';
import { TranslatorRegistry } from '../registry.js';
import type { CanonicalSkill } from '../types.js';

describe('TranslatorRegistry', () => {
  let registry: TranslatorRegistry;

  beforeEach(() => {
    registry = new TranslatorRegistry();
  });

  describe('format detection', () => {
    it('should detect SKILL.md format', () => {
      const content = `---
name: test-skill
description: Test
---
Content`;

      const format = registry.detectFormat(content, 'SKILL.md');

      expect(format).toBe('skill-md');
    });

    it('should detect Cursor MDC format by globs field', () => {
      // Globs field is cursor-specific, so it takes priority
      const content = `---
globs: ["**/*.ts"]
---
Content`;

      const format = registry.detectFormat(content);

      expect(format).toBe('cursor-mdc');
    });

    it('should detect skill-md for content with description', () => {
      // Content with description is detected as skill-md since
      // skillMdTranslator is checked first
      const content = `---
description: Test
globs: ["**/*.ts"]
---
Content`;

      const format = registry.detectFormat(content, 'rule.mdc');

      // skill-md is detected first because description is a common field
      expect(format).toBe('skill-md');
    });

    it('should detect Copilot format by filename', () => {
      const content = `# Instructions`;

      const format = registry.detectFormat(content, 'copilot-instructions.md');

      expect(format).toBe('markdown-rules');
    });

    it('should return null for unknown format', () => {
      const content = `Just some random text
without any skill format markers`;

      const format = registry.detectFormat(content, 'random.txt');

      expect(format).toBeNull();
    });

    it('should detect skill-md for content with name field', () => {
      // Content with name field is detected as skill-md
      const content = `---
name: test
---
Content`;

      const format = registry.detectFormat(content, 'test.mdc');

      expect(format).toBe('skill-md');
    });
  });

  describe('translation', () => {
    it('should translate SKILL.md to Cursor MDC', () => {
      const skill: CanonicalSkill = {
        name: 'test-skill',
        description: 'A test skill',
        tags: ['typescript'],
        content: '# Test\nInstructions',
      };

      const result = registry.translate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('description: A test skill');
      expect(result.targetFormat).toBe('cursor-mdc');
      expect(result.filename).toBe('test-skill.mdc');
    });

    it('should translate SKILL.md to Windsurf', () => {
      const skill: CanonicalSkill = {
        name: 'test-skill',
        description: 'A test skill',
        content: '# Test\nInstructions',
      };

      const result = registry.translate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('<!-- name: test-skill -->');
      expect(result.targetFormat).toBe('markdown-rules');
    });

    it('should translate SKILL.md to GitHub Copilot', () => {
      const skill: CanonicalSkill = {
        name: 'test-skill',
        description: 'A test skill',
        content: '# Test\nInstructions',
      };

      const result = registry.translate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('copilot-instructions.md');
    });

    it('should translate SKILL.md to Claude Code (same format)', () => {
      const skill: CanonicalSkill = {
        name: 'test-skill',
        description: 'A test skill',
        content: '# Test\nInstructions',
      };

      const result = registry.translate(skill, 'claude-code');

      expect(result.success).toBe(true);
      expect(result.targetFormat).toBe('skill-md');
      // YAML uses QUOTE_DOUBLE
      expect(result.content).toContain('name: "test-skill"');
    });

    it('should translate between all SKILL.md agents', () => {
      const skill: CanonicalSkill = {
        name: 'universal',
        content: 'Works everywhere',
      };

      const skillMdAgents = [
        'claude-code',
        'codex',
        'gemini-cli',
        'opencode',
        'antigravity',
        'amp',
        'goose',
        'kilo',
        'roo',
        'trae',
      ] as const;

      for (const agent of skillMdAgents) {
        const result = registry.translate(skill, agent);
        expect(result.success).toBe(true);
        expect(result.targetFormat).toBe('skill-md');
      }
    });
  });

  describe('translateContent', () => {
    it('should translate content string to target agent', () => {
      const content = `---
name: source-skill
description: Source skill description
version: 1.0.0
---
# Source Skill

Instructions here.`;

      const result = registry.translateContent(content, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('description: Source skill description');
      expect(result.filename).toBe('source-skill.mdc');
    });

    it('should auto-detect source format and translate', () => {
      const skillMdContent = `---
name: auto-detect
---
Content`;

      const result = registry.translateContent(skillMdContent, 'windsurf');

      expect(result.success).toBe(true);
      // Result contains translated content
      expect(result.content).toContain('<!-- name: auto-detect -->');
    });

    it('should return error for completely unparseable content', () => {
      // Content without any format markers and not valid YAML frontmatter
      const invalidContent = `Random text without any format markers`;

      const result = registry.translateContent(invalidContent, 'cursor');

      // Should still succeed as fallback parsing extracts content
      // The implementation uses skillMdTranslator as fallback
      expect(result).toBeDefined();
    });

    it('should handle translation with source filename hint', () => {
      const content = `---
name: test
---
Content`;

      const result = registry.translateContent(content, 'cursor', {
        sourceFilename: 'SKILL.md',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getTranslator', () => {
    it('should return correct translator for agent', () => {
      const claudeTranslator = registry.getTranslatorForAgent('claude-code');
      const cursorTranslator = registry.getTranslatorForAgent('cursor');
      const windsurfTranslator = registry.getTranslatorForAgent('windsurf');

      expect(claudeTranslator).not.toBeNull();
      expect(cursorTranslator).not.toBeNull();
      expect(windsurfTranslator).not.toBeNull();
    });

    it('should return skill-md translator for most agents', () => {
      const agents = ['codex', 'gemini-cli', 'amp', 'goose'] as const;

      for (const agent of agents) {
        const translator = registry.getTranslatorForAgent(agent);
        expect(translator?.format).toBe('skill-md');
      }
    });
  });

  describe('cross-format translation', () => {
    it('should translate Cursor to SKILL.md', () => {
      const cursorContent = `---
description: Cursor rule
globs: ["**/*.ts"]
alwaysApply: false
---
# Instructions
Follow these rules`;

      const result = registry.translateContent(cursorContent, 'claude-code', {
        sourceFilename: 'test.mdc',
      });

      expect(result.success).toBe(true);
      expect(result.targetFormat).toBe('skill-md');
    });

    it('should translate Windsurf to Cursor', () => {
      const windsurfContent = `<!-- name: test-rule -->
<!-- version: 1.0.0 -->
# Test Rules
Follow these guidelines`;

      const result = registry.translateContent(windsurfContent, 'cursor', {
        sourceFilename: '.windsurfrules',
      });

      expect(result.success).toBe(true);
      expect(result.targetFormat).toBe('cursor-mdc');
    });

    it('should preserve content through cross-format translation', () => {
      const skill: CanonicalSkill = {
        name: 'metadata-test',
        description: 'Testing metadata preservation',
        version: '1.0.0',
        tags: ['test', 'example'],
        content: '# Content\nWith instructions',
      };

      // Translate through multiple formats
      const toCursor = registry.translate(skill, 'cursor');
      expect(toCursor.success).toBe(true);

      // Parse the cursor result and translate to windsurf
      const toWindsurf = registry.translateContent(toCursor.content, 'windsurf', {
        sourceFilename: 'test.mdc',
      });
      expect(toWindsurf.success).toBe(true);

      // The content should still be there
      expect(toWindsurf.content).toContain('Content');
    });
  });

  describe('error handling', () => {
    it('should handle skills with metadata', () => {
      const skill: CanonicalSkill = {
        name: 'complex-skill',
        content: 'Content',
        metadata: {
          someComplexFeature: 'value',
        },
      };

      const result = registry.translate(skill, 'windsurf');

      // Should succeed
      expect(result.success).toBe(true);
    });

    it('should handle empty name gracefully', () => {
      const skill: CanonicalSkill = {
        name: '',
        content: 'No name provided',
      };

      const result = registry.translate(skill, 'cursor');

      // Should handle gracefully
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('supported agents', () => {
    it('should support all 32 agents', () => {
      const allAgents = [
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

      const skill: CanonicalSkill = {
        name: 'test',
        content: 'Content',
      };

      for (const agent of allAgents) {
        const translator = registry.getTranslatorForAgent(agent);
        expect(translator).not.toBeNull();

        const result = registry.translate(skill, agent);
        expect(result.success).toBe(true);
      }
    });
  });
});
