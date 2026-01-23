import { describe, it, expect, beforeEach } from 'vitest';
import { SkillMdTranslator } from '../formats/skill-md.js';
import type { CanonicalSkill } from '../types.js';

describe('SkillMdTranslator', () => {
  let translator: SkillMdTranslator;

  beforeEach(() => {
    translator = new SkillMdTranslator();
  });

  describe('format detection', () => {
    it('should detect SKILL.md format with YAML frontmatter', () => {
      const content = `---
name: test-skill
description: A test skill
version: 1.0.0
---
# Test Skill
Instructions here`;

      expect(translator.detect(content, 'SKILL.md')).toBe(true);
    });

    it('should detect skill-md format by filename', () => {
      const content = `---
name: test-skill
---
Instructions`;

      expect(translator.detect(content, 'test-skill.md')).toBe(true);
    });

    it('should not detect non-skill markdown files', () => {
      const content = `# README
This is a readme file.`;

      expect(translator.detect(content, 'README.md')).toBe(false);
    });

    it('should not detect markdown without frontmatter', () => {
      const content = `# Just a title
Some content without frontmatter`;

      expect(translator.detect(content)).toBe(false);
    });

    it('should detect frontmatter with name field', () => {
      const content = `---
name: my-skill
---
Content`;

      expect(translator.detect(content)).toBe(true);
    });
  });

  describe('parsing', () => {
    it('should parse complete SKILL.md file', () => {
      const content = `---
name: react-patterns
description: Best practices for React development
version: 2.0.0
author: vercel-labs
tags:
  - react
  - frontend
  - typescript
globs:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React Best Practices

## Component Guidelines
- Use functional components
- Prefer hooks over class components
`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('react-patterns');
      expect(skill!.description).toBe('Best practices for React development');
      expect(skill!.version).toBe('2.0.0');
      expect(skill!.author).toBe('vercel-labs');
      expect(skill!.tags).toEqual(['react', 'frontend', 'typescript']);
      expect(skill!.globs).toEqual(['**/*.tsx', '**/*.jsx']);
      expect(skill!.content).toContain('# React Best Practices');
      expect(skill!.content).toContain('Use functional components');
    });

    it('should parse minimal SKILL.md file', () => {
      const content = `---
name: minimal-skill
---
Just some instructions`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('minimal-skill');
      expect(skill!.content).toBe('Just some instructions');
    });

    it('should use unnamed-skill when frontmatter has no name and filename is SKILL.md', () => {
      const content = `---
description: A skill without explicit name
---
Content here`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      // When frontmatter exists but no name, and filename is SKILL.md, defaults to 'unnamed-skill'
      expect(skill!.name).toBe('unnamed-skill');
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---
# Content Only
Instructions without metadata`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      // Empty frontmatter - name is inferred from first heading
      expect(skill!.name).toBe('content-only');
    });

    it('should infer name from heading when no frontmatter', () => {
      const content = `# Content Only
Instructions without frontmatter`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      // Name is inferred from first heading
      expect(skill!.name).toBe('content-only');
    });

    it('should handle complex YAML frontmatter', () => {
      const content = `---
name: complex-skill
description: A skill with complex metadata
version: 1.0.0
compatibility: "react>=18.0.0"
agents:
  optimized:
    - claude-code
    - cursor
  compatible:
    - codex
---
# Complex Skill Content`;

      const skill = translator.parse(content, 'SKILL.md');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('complex-skill');
      // compatibility is stored directly on skill, not in metadata
      expect(skill!.compatibility).toBe('react>=18.0.0');
      // agents hints are stored in agentHints
      expect(skill!.agentHints).toBeDefined();
    });
  });

  describe('generation', () => {
    it('should generate SKILL.md format for claude-code', () => {
      const skill: CanonicalSkill = {
        name: 'test-skill',
        description: 'A test skill for generation',
        version: '1.0.0',
        tags: ['test', 'example'],
        content: '# Test Content\nInstructions here',
      };

      const result = translator.generate(skill, 'claude-code');

      expect(result.success).toBe(true);
      expect(result.content).toContain('---');
      // YAML uses QUOTE_DOUBLE so values are quoted
      expect(result.content).toContain('name: "test-skill"');
      expect(result.content).toContain('description: "A test skill for generation"');
      expect(result.content).toContain('version: "1.0.0"');
      expect(result.content).toContain('# Test Content');
    });

    it('should always use SKILL.md as filename', () => {
      const skill: CanonicalSkill = {
        name: 'my-skill',
        content: 'Instructions',
      };

      const result = translator.generate(skill, 'claude-code');

      expect(result.success).toBe(true);
      // Filename is always SKILL.md regardless of skill name
      expect(result.filename).toBe('SKILL.md');
    });

    it('should preserve all metadata in output', () => {
      const skill: CanonicalSkill = {
        name: 'full-metadata',
        description: 'Skill with full metadata',
        version: '2.5.0',
        author: 'test-author',
        tags: ['tag1', 'tag2', 'tag3'],
        globs: ['**/*.ts'],
        content: 'Content',
      };

      const result = translator.generate(skill, 'codex');

      expect(result.success).toBe(true);
      // YAML uses QUOTE_DOUBLE
      expect(result.content).toContain('name: "full-metadata"');
      expect(result.content).toContain('author: "test-author"');
      expect(result.content).toContain('tag1');
      expect(result.content).toContain('tag2');
    });

    it('should generate for all SKILL.md compatible agents', () => {
      const skill: CanonicalSkill = {
        name: 'universal-skill',
        content: 'Works everywhere',
      };

      const agents = [
        'claude-code',
        'codex',
        'gemini-cli',
        'opencode',
        'antigravity',
        'amp',
        'goose',
        'kilo',
        'roo',
      ] as const;

      for (const agent of agents) {
        const result = translator.generate(skill, agent);
        expect(result.success).toBe(true);
        // YAML uses QUOTE_DOUBLE
        expect(result.content).toContain('name: "universal-skill"');
      }
    });
  });

  describe('round-trip', () => {
    it('should preserve content through parse and generate cycle', () => {
      const original = `---
name: round-trip-test
description: Testing round-trip conversion
version: 1.0.0
tags:
  - test
---
# Round Trip Test

This content should be preserved exactly.

- Item 1
- Item 2
- Item 3

\`\`\`typescript
const code = 'preserved';
\`\`\`
`;

      const parsed = translator.parse(original, 'SKILL.md');
      expect(parsed).not.toBeNull();

      const generated = translator.generate(parsed!, 'claude-code');
      expect(generated.success).toBe(true);

      // Re-parse the generated content
      const reparsed = translator.parse(generated.content, 'SKILL.md');
      expect(reparsed).not.toBeNull();
      expect(reparsed!.name).toBe(parsed!.name);
      expect(reparsed!.description).toBe(parsed!.description);
      expect(reparsed!.content).toContain('This content should be preserved exactly.');
    });
  });
});
