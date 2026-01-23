import { describe, it, expect, beforeEach } from 'vitest';
import { WindsurfTranslator } from '../formats/windsurf.js';
import type { CanonicalSkill } from '../types.js';

describe('WindsurfTranslator', () => {
  let translator: WindsurfTranslator;

  beforeEach(() => {
    translator = new WindsurfTranslator();
  });

  describe('format detection', () => {
    it('should detect .windsurfrules file', () => {
      const content = `# Coding Guidelines
Follow these rules`;

      expect(translator.detect(content, '.windsurfrules')).toBe(true);
    });

    it('should detect windsurf rules by HTML comment metadata', () => {
      const content = `<!-- name: my-rule -->
# My Rule
Instructions`;

      expect(translator.detect(content)).toBe(true);
    });

    it('should not detect regular markdown', () => {
      const content = `# README
Regular content`;

      expect(translator.detect(content, 'README.md')).toBe(false);
    });

    it('should not detect files with YAML frontmatter', () => {
      const content = `---
name: skill
---
Content`;

      expect(translator.detect(content)).toBe(false);
    });
  });

  describe('parsing', () => {
    it('should parse windsurf rules with metadata comment', () => {
      const content = `<!-- name: react-rules -->
<!-- description: React best practices -->
<!-- version: 1.0.0 -->

# React Rules

Use functional components.`;

      const skill = translator.parse(content, '.windsurfrules');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('react-rules');
      expect(skill!.description).toBe('React best practices');
      expect(skill!.version).toBe('1.0.0');
      expect(skill!.content).toContain('# React Rules');
    });

    it('should parse windsurf rules without metadata', () => {
      const content = `# General Guidelines

Follow these coding standards.

## Code Style
- Use consistent indentation
- Add comments for complex logic`;

      const skill = translator.parse(content, '.windsurfrules');

      expect(skill).not.toBeNull();
      // Name should be inferred from first heading
      expect(skill!.name).toBe('general-guidelines');
      expect(skill!.content).toContain('# General Guidelines');
    });

    it('should infer name from first heading', () => {
      const content = `# My Amazing Coding Rules

These are my rules.`;

      const skill = translator.parse(content, 'rules.md');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('my-amazing-coding-rules');
    });

    it('should handle rules without headings', () => {
      const content = `Use TypeScript.
Always add types.
Prefer interfaces over type aliases.`;

      const skill = translator.parse(content, '.windsurfrules');

      expect(skill).not.toBeNull();
      expect(skill!.content).toContain('Use TypeScript');
    });

    it('should extract tags from metadata comment', () => {
      const content = `<!-- name: test -->
<!-- tags: react, typescript, frontend -->
Content`;

      const skill = translator.parse(content, '.windsurfrules');

      expect(skill).not.toBeNull();
      // Tags are parsed from comma-separated string
      expect(skill!.tags).toBeDefined();
      if (skill!.tags) {
        expect(skill!.tags.join(',')).toContain('react');
      }
    });
  });

  describe('generation', () => {
    it('should generate windsurf rules format', () => {
      const skill: CanonicalSkill = {
        name: 'typescript-rules',
        description: 'TypeScript coding standards',
        version: '1.0.0',
        content: '# TypeScript\n\nUse strict mode.',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('<!-- name: typescript-rules -->');
      expect(result.content).toContain('# TypeScript');
      expect(result.filename).toBe('.windsurfrules');
    });

    it('should include all metadata in comments', () => {
      const skill: CanonicalSkill = {
        name: 'full-metadata',
        description: 'Complete metadata test',
        version: '2.0.0',
        author: 'test-author',
        tags: ['tag1', 'tag2'],
        content: 'Content',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('<!-- name: full-metadata -->');
      expect(result.content).toContain('<!-- version: 2.0.0 -->');
    });

    it('should generate clean markdown without YAML', () => {
      const skill: CanonicalSkill = {
        name: 'clean-output',
        content: '# Clean Markdown\n\nNo YAML here.',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).not.toMatch(/^---\n/);
      expect(result.content).toContain('# Clean Markdown');
    });

    it('should always use .windsurfrules filename', () => {
      const skill: CanonicalSkill = {
        name: 'any-name',
        content: 'Content',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.filename).toBe('.windsurfrules');
    });
  });

  describe('content preservation', () => {
    it('should preserve code blocks', () => {
      const skill: CanonicalSkill = {
        name: 'code-blocks',
        content: `# Code Examples

\`\`\`typescript
function example() {
  return true;
}
\`\`\`

\`\`\`python
def example():
    return True
\`\`\`
`,
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('```typescript');
      expect(result.content).toContain('function example()');
      expect(result.content).toContain('```python');
    });

    it('should preserve lists and formatting', () => {
      const skill: CanonicalSkill = {
        name: 'lists',
        content: `# Lists

- Item 1
- Item 2
  - Nested item
  - Another nested

1. First
2. Second

**Bold** and *italic* and \`code\`
`,
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('- Item 1');
      expect(result.content).toContain('- Nested item');
      expect(result.content).toContain('1. First');
      expect(result.content).toContain('**Bold**');
    });
  });

  describe('round-trip', () => {
    it('should preserve content through parse and generate cycle', () => {
      const original = `<!-- name: round-trip-test -->
<!-- version: 1.0.0 -->
<!-- description: Test round trip -->

# Round Trip Test

This content should survive the round trip.

## Section 1
Content here.

## Section 2
More content.
`;

      const parsed = translator.parse(original, '.windsurfrules');
      expect(parsed).not.toBeNull();

      const generated = translator.generate(parsed!, 'windsurf');
      expect(generated.success).toBe(true);

      const reparsed = translator.parse(generated.content, '.windsurfrules');
      expect(reparsed).not.toBeNull();
      expect(reparsed!.name).toBe('round-trip-test');
      expect(reparsed!.content).toContain('This content should survive the round trip.');
    });
  });

  describe('edge cases', () => {
    it('should handle content with HTML', () => {
      const skill: CanonicalSkill = {
        name: 'html-content',
        content: `# HTML in Markdown

<div class="example">
  <p>Some HTML</p>
</div>

Regular markdown.
`,
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
      expect(result.content).toContain('<div class="example">');
    });

    it('should handle empty content', () => {
      const skill: CanonicalSkill = {
        name: 'empty',
        content: '',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
    });

    it('should handle content with only whitespace', () => {
      const skill: CanonicalSkill = {
        name: 'whitespace',
        content: '   \n\n   \n',
      };

      const result = translator.generate(skill, 'windsurf');

      expect(result.success).toBe(true);
    });
  });
});
