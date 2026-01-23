import { describe, it, expect, beforeEach } from 'vitest';
import { CopilotTranslator } from '../formats/copilot.js';
import type { CanonicalSkill } from '../types.js';

describe('CopilotTranslator', () => {
  let translator: CopilotTranslator;

  beforeEach(() => {
    translator = new CopilotTranslator();
  });

  describe('format detection', () => {
    it('should detect copilot-instructions.md file', () => {
      const content = `# Coding Instructions
Follow these guidelines`;

      expect(translator.detect(content, 'copilot-instructions.md')).toBe(true);
    });

    it('should detect .github/copilot-instructions.md path', () => {
      const content = `# GitHub Copilot Instructions
Guidelines here`;

      expect(translator.detect(content, '.github/copilot-instructions.md')).toBe(true);
    });

    it('should detect copilot format by github copilot mention', () => {
      const content = `<!-- This file provides instructions for GitHub Copilot -->
# Instructions
Content`;

      expect(translator.detect(content)).toBe(true);
    });

    it('should not detect regular markdown', () => {
      const content = `# README
Not copilot instructions`;

      expect(translator.detect(content, 'README.md')).toBe(false);
    });
  });

  describe('parsing', () => {
    it('should parse copilot instructions file with metadata', () => {
      const content = `<!-- name: project-guidelines -->
<!-- version: 1.0.0 -->

# Project Guidelines

## Code Style
- Use TypeScript
- Follow ESLint rules

## Architecture
- Use clean architecture principles`;

      const skill = translator.parse(content, 'copilot-instructions.md');

      expect(skill).not.toBeNull();
      expect(skill!.name).toBe('project-guidelines');
      expect(skill!.content).toContain('# Project Guidelines');
      expect(skill!.content).toContain('Use TypeScript');
    });

    it('should parse plain copilot instructions', () => {
      const content = `# Coding Standards

Always write clean code.
Add tests for all features.`;

      const skill = translator.parse(content, 'copilot-instructions.md');

      expect(skill).not.toBeNull();
      // Name is inferred from heading
      expect(skill!.name).toBe('coding-standards');
      expect(skill!.content).toContain('Coding Standards');
    });

    it('should handle instructions with multiple sections', () => {
      const content = `# Project Instructions

## General
Be consistent.

## Testing
Write unit tests.

## Documentation
Document all APIs.`;

      const skill = translator.parse(content, 'copilot-instructions.md');

      expect(skill).not.toBeNull();
      expect(skill!.content).toContain('## General');
      expect(skill!.content).toContain('## Testing');
      expect(skill!.content).toContain('## Documentation');
    });

    it('should extract description from metadata', () => {
      const content = `<!-- name: test -->
<!-- description: My description here -->
Content`;

      const skill = translator.parse(content, 'copilot-instructions.md');

      expect(skill).not.toBeNull();
      expect(skill!.description).toBe('My description here');
    });
  });

  describe('generation', () => {
    it('should generate GitHub Copilot format', () => {
      const skill: CanonicalSkill = {
        name: 'my-instructions',
        description: 'Project coding guidelines',
        version: '1.0.0',
        content: '# Guidelines\n\nFollow these rules.',
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content).toContain('# Guidelines');
      expect(result.filename).toBe('copilot-instructions.md');
    });

    it('should preserve markdown formatting', () => {
      const skill: CanonicalSkill = {
        name: 'formatted',
        content: `# Main Title

## Section 1

- Item 1
- Item 2

\`\`\`typescript
const x = 1;
\`\`\`

> A quote

**Bold** and *italic*
`,
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content).toContain('## Section 1');
      expect(result.content).toContain('- Item 1');
      expect(result.content).toContain('```typescript');
      expect(result.content).toContain('> A quote');
      expect(result.content).toContain('**Bold**');
    });
  });

  describe('content handling', () => {
    it('should handle code blocks with various languages', () => {
      const skill: CanonicalSkill = {
        name: 'multi-lang',
        content: `# Multi-language Examples

\`\`\`python
def hello():
    print("Hello")
\`\`\`

\`\`\`javascript
function hello() {
  console.log("Hello");
}
\`\`\`

\`\`\`rust
fn hello() {
    println!("Hello");
}
\`\`\`
`,
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content).toContain('```python');
      expect(result.content).toContain('```javascript');
      expect(result.content).toContain('```rust');
    });
  });

  describe('round-trip', () => {
    it('should preserve content through parse and generate cycle', () => {
      const original = `<!-- name: round-trip-test -->
<!-- version: 1.0.0 -->
<!-- description: Round trip test -->

# Round Trip Content

This content should be preserved.

## Section
With subsections.
`;

      const parsed = translator.parse(original, 'copilot-instructions.md');
      expect(parsed).not.toBeNull();

      // Use addMetadata to preserve metadata in generated output
      const generated = translator.generate(parsed!, 'github-copilot', { addMetadata: true });
      expect(generated.success).toBe(true);

      const reparsed = translator.parse(generated.content, 'copilot-instructions.md');
      expect(reparsed).not.toBeNull();
      // Metadata is preserved when addMetadata is true
      expect(reparsed!.name).toBe('round-trip-test');
      expect(reparsed!.content).toContain('This content should be preserved.');
    });
  });

  describe('edge cases', () => {
    it('should handle content with HTML elements', () => {
      const skill: CanonicalSkill = {
        name: 'html',
        content: `# Title

<details>
<summary>Click to expand</summary>

Hidden content here.

</details>

<table>
<tr><td>Cell</td></tr>
</table>
`,
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content).toContain('<details>');
      expect(result.content).toContain('<table>');
    });

    it('should handle empty content', () => {
      const skill: CanonicalSkill = {
        name: 'empty',
        content: '',
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
    });

    it('should handle very long content', () => {
      const longContent = '# Title\n\n' + 'This is a long line. '.repeat(500);
      const skill: CanonicalSkill = {
        name: 'long',
        content: longContent,
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content.length).toBeGreaterThan(5000);
    });

    it('should handle special characters', () => {
      const skill: CanonicalSkill = {
        name: 'special',
        content: `# Special Characters

Symbols: © ® ™ € £ ¥ § ¶
Emojis: 🚀 🎉 ✅ ❌
Math: ∑ ∏ √ ∞ ≠ ≤ ≥
`,
      };

      const result = translator.generate(skill, 'github-copilot');

      expect(result.success).toBe(true);
      expect(result.content).toContain('©');
      expect(result.content).toContain('🚀');
      expect(result.content).toContain('∑');
    });
  });
});
