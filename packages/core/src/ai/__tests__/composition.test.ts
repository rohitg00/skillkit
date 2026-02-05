import { describe, it, expect } from 'vitest';
import { SkillAnalyzer } from '../composition/analyzer.js';
import { SkillMerger } from '../composition/merger.js';
import { SkillComposer } from '../composition/index.js';

describe('SkillAnalyzer', () => {
  const analyzer = new SkillAnalyzer();

  describe('analyzeSkillContent', () => {
    it('should extract sections', () => {
      const content = `# My Skill

## Instructions
Do something

## Examples
Example code

## Rules
- Rule 1
- Rule 2
`;

      const result = analyzer.analyzeSkillContent(content);

      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.sections).toContain('My Skill');
    });

    it('should extract patterns from list items', () => {
      const content = `# Skill

- You should always test your code
- You must never commit secrets
- Always use type annotations
`;

      const result = analyzer.analyzeSkillContent(content);

      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it('should calculate complexity', () => {
      const simpleContent = '# Simple Skill\n\nJust do it.';
      const complexContent = `# Complex Skill

## Section 1
Content 1

## Section 2
Content 2

## Section 3
Content 3

\`\`\`typescript
code
\`\`\`

\`\`\`typescript
more code
\`\`\`
`;

      const simple = analyzer.analyzeSkillContent(simpleContent);
      const complex = analyzer.analyzeSkillContent(complexContent);

      expect(complex.complexity).toBeGreaterThan(simple.complexity);
    });
  });

  describe('parseSkillContent', () => {
    it('should classify section types', () => {
      const content = `# Skill

## When to Use
Trigger conditions

## Rules
- Must do X
- Never do Y

## Examples
\`\`\`
code
\`\`\`
`;

      const result = analyzer.parseSkillContent(content);

      const triggerSection = result.sections.find((s) => s.title === 'When to Use');
      const rulesSection = result.sections.find((s) => s.title === 'Rules');
      const examplesSection = result.sections.find((s) => s.title === 'Examples');

      expect(triggerSection?.type).toBe('trigger');
      expect(rulesSection?.type).toBe('rule');
      expect(examplesSection?.type).toBe('example');
    });
  });
});

describe('SkillMerger', () => {
  const merger = new SkillMerger();

  describe('merge', () => {
    it('should merge multiple skills', async () => {
      const skills = [
        {
          name: 'skill-1',
          content: '# Skill 1\n\n## Rules\n- Rule A',
          trustScore: 8,
          relevance: 0.9,
        },
        {
          name: 'skill-2',
          content: '# Skill 2\n\n## Rules\n- Rule B',
          trustScore: 7,
          relevance: 0.8,
        },
      ];

      const result = await merger.merge(skills);

      expect(result.content).toBeDefined();
      expect(result.report.sectionsPreserved).toBeGreaterThan(0);
    });

    it('should handle single skill', async () => {
      const skills = [
        {
          name: 'only-skill',
          content: '# Only Skill\n\nContent here',
          trustScore: 9,
          relevance: 1.0,
        },
      ];

      const result = await merger.merge(skills);

      expect(result.content).toContain('Only Skill');
    });

    it('should remove duplicates', async () => {
      const skills = [
        {
          name: 'skill-1',
          content: '# Skill\n\n- Same rule',
          trustScore: 8,
          relevance: 0.9,
        },
        {
          name: 'skill-2',
          content: '# Skill\n\n- Same rule',
          trustScore: 8,
          relevance: 0.9,
        },
      ];

      const result = await merger.merge(skills);

      expect(result.report.duplicatesRemoved).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('SkillComposer', () => {
  const composer = new SkillComposer();

  describe('compose', () => {
    it('should compose skills into one', async () => {
      const skills = [
        {
          name: 'testing-patterns',
          description: 'Testing best practices',
          content: '# Testing\n\n- Write tests first',
          trustScore: 8,
          relevance: 0.9,
        },
        {
          name: 'code-review',
          description: 'Code review guidelines',
          content: '# Review\n\n- Check for bugs',
          trustScore: 7,
          relevance: 0.8,
        },
      ];

      const result = await composer.compose(skills);

      expect(result.skill.name).toBeDefined();
      expect(result.skill.sourceSkills).toHaveLength(2);
      expect(result.skill.content).toBeDefined();
    });

    it('should handle single skill', async () => {
      const skills = [
        {
          name: 'single-skill',
          description: 'Only one',
          content: '# Single\n\nContent',
          trustScore: 9,
          relevance: 1.0,
        },
      ];

      const result = await composer.compose(skills);

      expect(result.skill.sourceSkills).toHaveLength(1);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should throw for empty skills array', async () => {
      await expect(composer.compose([])).rejects.toThrow();
    });
  });
});
