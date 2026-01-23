import { describe, it, expect, beforeEach } from 'vitest';
import { CursorTranslator } from '../formats/cursor.js';
import type { CanonicalSkill } from '../types.js';

describe('CursorTranslator', () => {
  let translator: CursorTranslator;

  beforeEach(() => {
    translator = new CursorTranslator();
  });

  describe('format detection', () => {
    it('should detect .mdc files', () => {
      const content = `---
description: A cursor rule
---
Instructions`;

      expect(translator.detect(content, 'rule.mdc')).toBe(true);
    });

    it('should detect .cursorrules file', () => {
      const content = `---
description: Cursor rules
globs: ["**/*.ts"]
---
Content`;

      expect(translator.detect(content, '.cursorrules')).toBe(true);
    });

    it('should detect cursor format by globs field', () => {
      const content = `---
description: Has globs
globs:
  - "**/*.tsx"
---
Instructions`;

      expect(translator.detect(content)).toBe(true);
    });

    it('should detect cursor format by alwaysApply field', () => {
      const content = `---
description: Has alwaysApply
alwaysApply: true
---
Instructions`;

      expect(translator.detect(content)).toBe(true);
    });

    it('should not detect regular markdown', () => {
      const content = `# README
Just a regular file`;

      expect(translator.detect(content, 'README.md')).toBe(false);
    });
  });

  describe('parsing', () => {
    it('should parse complete Cursor MDC file', () => {
      const content = `---
description: React component best practices
globs:
  - "**/*.tsx"
  - "**/*.jsx"
alwaysApply: false
---
# React Guidelines

Use functional components and hooks.`;

      const skill = translator.parse(content, 'react-rules.mdc');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('react-rules');
      expect(skill!.description).toBe('React component best practices');
      expect(skill!.globs).toEqual(['**/*.tsx', '**/*.jsx']);
      // alwaysApply is stored directly on skill, not in metadata
      expect(skill!.alwaysApply).toBe(false);
      expect(skill!.content).toContain('# React Guidelines');
    });

    it('should parse MDC with only description', () => {
      const content = `---
description: Simple rule
---
Follow these guidelines`;

      const skill = translator.parse(content, 'simple.mdc');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('simple');
      expect(skill!.description).toBe('Simple rule');
    });

    it('should handle alwaysApply: true', () => {
      const content = `---
description: Global rule
alwaysApply: true
---
This applies everywhere`;

      const skill = translator.parse(content, 'global.mdc');

      expect(skill).not.toBeNull();
      // alwaysApply is stored directly on skill, not in metadata
      expect(skill!.alwaysApply).toBe(true);
    });

    it('should infer name from filename', () => {
      const content = `---
description: Test
---
Content`;

      const skill = translator.parse(content, 'my-custom-rule.mdc');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('my-custom-rule');
    });

    it('should handle glob patterns as string', () => {
      const content = `---
description: Single glob
globs: "**/*.ts"
---
TypeScript rules`;

      const skill = translator.parse(content, 'ts-rules.mdc');

      expect(skill).not.toBeNull();
      expect(skill!.globs).toContain('**/*.ts');
    });
  });

  describe('generation', () => {
    it('should generate Cursor MDC format', () => {
      const skill: CanonicalSkill = {
        name: 'typescript-rules',
        description: 'TypeScript coding guidelines',
        tags: ['typescript', 'backend'],
        content: '# TypeScript Guidelines\n\nUse strict mode.',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('description: TypeScript coding guidelines');
      expect(result.content).toContain('# TypeScript Guidelines');
      expect(result.filename).toBe('typescript-rules.mdc');
    });

    it('should infer globs from tags', () => {
      const skill: CanonicalSkill = {
        name: 'react-skill',
        description: 'React patterns',
        tags: ['react', 'typescript', 'frontend'],
        content: 'React content',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('globs:');
      expect(result.content).toMatch(/\*\*\/\*\.tsx/);
    });

    it('should preserve explicit globs', () => {
      const skill: CanonicalSkill = {
        name: 'custom-globs',
        description: 'Has custom globs',
        globs: ['src/components/**/*.tsx', 'lib/**/*.ts'],
        content: 'Content',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('src/components/**/*.tsx');
      expect(result.content).toContain('lib/**/*.ts');
    });

    it('should preserve explicit alwaysApply value', () => {
      const skillWithAlwaysApply: CanonicalSkill = {
        name: 'scoped-skill',
        description: 'Scoped',
        globs: ['**/*.py'],
        alwaysApply: false,
        content: 'Python',
      };

      const result = translator.generate(skillWithAlwaysApply, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('alwaysApply: false');
    });

    it('should not add alwaysApply if not explicitly set', () => {
      const skillWithoutAlwaysApply: CanonicalSkill = {
        name: 'scoped-python',
        description: 'Python skill',
        globs: ['**/*.py'],
        content: 'Python',
      };

      const result = translator.generate(skillWithoutAlwaysApply, 'cursor');

      expect(result.success).toBe(true);
      // alwaysApply is only added if explicitly set
      expect(result.content).not.toMatch(/^alwaysApply:/m);
    });

    it('should generate .mdc extension', () => {
      const skill: CanonicalSkill = {
        name: 'my-rule',
        content: 'Instructions',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.filename).toBe('my-rule.mdc');
    });
  });

  describe('glob inference', () => {
    it('should infer TypeScript globs from typescript tag', () => {
      const skill: CanonicalSkill = {
        name: 'ts-skill',
        tags: ['typescript'],
        content: 'Content',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.content).toMatch(/\*\*\/\*\.ts/);
    });

    it('should infer Python globs from python tag', () => {
      const skill: CanonicalSkill = {
        name: 'py-skill',
        tags: ['python'],
        content: 'Content',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.content).toMatch(/\*\*\/\*\.py/);
    });

    it('should infer multiple globs from multiple tags', () => {
      const skill: CanonicalSkill = {
        name: 'fullstack-skill',
        tags: ['react', 'nodejs', 'typescript'],
        content: 'Full stack patterns',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.content).toContain('globs:');
      // Should have React/TS globs
      expect(result.content).toMatch(/\*\*\/\*\.tsx|\*\*\/\*\.ts/);
    });
  });

  describe('round-trip', () => {
    it('should preserve content through parse and generate cycle', () => {
      const original = `---
description: Round trip test for Cursor
globs:
  - "**/*.tsx"
alwaysApply: false
---
# Original Content

This should be preserved.

\`\`\`typescript
const example = true;
\`\`\`
`;

      const parsed = translator.parse(original, 'test.mdc');
      expect(parsed).not.toBeNull();

      const generated = translator.generate(parsed!, 'cursor');
      expect(generated.success).toBe(true);

      const reparsed = translator.parse(generated.content, 'test.mdc');
      expect(reparsed).not.toBeNull();
      expect(reparsed!.description).toBe(parsed!.description);
      expect(reparsed!.content).toContain('This should be preserved.');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined description', () => {
      const skill: CanonicalSkill = {
        name: 'no-desc',
        content: 'Content only',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      // When description is undefined, YAML may serialize as null or skip the field
      // The important thing is that generation succeeds
      expect(result.content).toContain('---');
    });

    it('should handle special characters in content', () => {
      const skill: CanonicalSkill = {
        name: 'special-chars',
        description: 'Test with special: characters',
        content: 'Content with `backticks` and $variables and {{templates}}',
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain('`backticks`');
      expect(result.content).toContain('$variables');
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);
      const skill: CanonicalSkill = {
        name: 'long-content',
        content: longContent,
      };

      const result = translator.generate(skill, 'cursor');

      expect(result.success).toBe(true);
      expect(result.content).toContain(longContent);
    });
  });
});
