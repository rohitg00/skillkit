import { describe, it, expect } from 'vitest';
import {
  evaluateSkillContent,
  getQualityGrade,
  isHighQuality,
} from '../index.js';

describe('Quality Evaluation', () => {
  describe('evaluateSkillContent', () => {
    it('should score a well-structured skill highly', () => {
      const content = `---
name: test-skill
description: A test skill for validation
globs: ["**/*.ts"]
---

# Test Skill

## When to Use

Use this skill when working with TypeScript files.

## Instructions

Always follow these patterns:

\`\`\`typescript
function example(): void {
  console.log('example');
}
\`\`\`

## Commands

Run tests with:

\`\`\`bash
npm test
\`\`\`

## Boundaries

Never commit secrets to the repository.
Always run linting before commits.
`;

      const result = evaluateSkillContent(content);
      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(result.structure.hasMetadata).toBe(true);
      expect(result.structure.hasTriggers).toBe(true);
      expect(result.structure.hasExamples).toBe(true);
      expect(result.structure.hasBoundaries).toBe(true);
      expect(result.clarity.hasHeaders).toBe(true);
      expect(result.specificity.hasConcreteCommands).toBe(true);
    });

    it('should score a minimal skill lower', () => {
      const content = `# My Skill

Be helpful and assist the user with various tasks.
Try to do your best.
`;

      const result = evaluateSkillContent(content);
      expect(result.overall).toBeLessThan(50);
      expect(result.structure.hasMetadata).toBe(false);
      expect(result.structure.hasTriggers).toBe(false);
      expect(result.specificity.vagueTermCount).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should penalize overly long skills', () => {
      const longContent = '# Skill\n' + 'Some content.\n'.repeat(600);
      const result = evaluateSkillContent(longContent);
      expect(result.clarity.lineCount).toBeGreaterThan(500);
      expect(result.clarity.score).toBeLessThan(70);
    });

    it('should detect vague terms', () => {
      const content = `# Skill

Be helpful and assist the user.
Try to do your best when appropriate.
Help with various tasks as needed.
`;

      const result = evaluateSkillContent(content);
      expect(result.specificity.vagueTermCount).toBeGreaterThan(3);
    });

    it('should detect code examples', () => {
      const content = `# Skill

\`\`\`typescript
const x = 1;
\`\`\`

\`\`\`javascript
const y = 2;
\`\`\`
`;

      const result = evaluateSkillContent(content);
      expect(result.structure.hasExamples).toBe(true);
      expect(result.specificity.hasCodeExamples).toBe(true);
    });

    it('should detect boundary patterns', () => {
      const content = `# Skill

## Boundaries

- Never commit secrets
- Always run tests
- Don't modify node_modules
- Avoid using deprecated APIs
`;

      const result = evaluateSkillContent(content);
      expect(result.structure.hasBoundaries).toBe(true);
    });

    it('should detect trigger conditions', () => {
      const content = `# Skill

## When to Use

Use this skill when:
- Working with React components
- Building forms
`;

      const result = evaluateSkillContent(content);
      expect(result.structure.hasTriggers).toBe(true);
      expect(result.structure.hasWhenToUse).toBe(true);
    });
  });

  describe('getQualityGrade', () => {
    it('should return A for scores >= 90', () => {
      expect(getQualityGrade(90)).toBe('A');
      expect(getQualityGrade(100)).toBe('A');
    });

    it('should return B for scores >= 80', () => {
      expect(getQualityGrade(80)).toBe('B');
      expect(getQualityGrade(89)).toBe('B');
    });

    it('should return C for scores >= 70', () => {
      expect(getQualityGrade(70)).toBe('C');
      expect(getQualityGrade(79)).toBe('C');
    });

    it('should return D for scores >= 60', () => {
      expect(getQualityGrade(60)).toBe('D');
      expect(getQualityGrade(69)).toBe('D');
    });

    it('should return F for scores < 60', () => {
      expect(getQualityGrade(59)).toBe('F');
      expect(getQualityGrade(0)).toBe('F');
    });
  });

  describe('isHighQuality', () => {
    it('should return true for high scoring skills with few warnings', () => {
      const score = {
        overall: 80,
        structure: { score: 80, hasMetadata: true, hasDescription: true, hasTriggers: true, hasExamples: true, hasBoundaries: true, hasWhenToUse: true },
        clarity: { score: 80, lineCount: 100, tokenCount: 500, avgSentenceLength: 15, hasHeaders: true },
        specificity: { score: 80, hasConcreteCommands: true, hasFilePatterns: true, hasCodeExamples: true, vagueTermCount: 0 },
        warnings: [],
        suggestions: [],
      };
      expect(isHighQuality(score)).toBe(true);
    });

    it('should return false for low scoring skills', () => {
      const score = {
        overall: 50,
        structure: { score: 50, hasMetadata: false, hasDescription: false, hasTriggers: false, hasExamples: false, hasBoundaries: false, hasWhenToUse: false },
        clarity: { score: 50, lineCount: 100, tokenCount: 500, avgSentenceLength: 15, hasHeaders: true },
        specificity: { score: 50, hasConcreteCommands: false, hasFilePatterns: false, hasCodeExamples: false, vagueTermCount: 5 },
        warnings: ['Missing triggers', 'No examples'],
        suggestions: [],
      };
      expect(isHighQuality(score)).toBe(false);
    });

    it('should return false for skills with many warnings', () => {
      const score = {
        overall: 75,
        structure: { score: 75, hasMetadata: true, hasDescription: true, hasTriggers: false, hasExamples: false, hasBoundaries: false, hasWhenToUse: false },
        clarity: { score: 75, lineCount: 100, tokenCount: 500, avgSentenceLength: 15, hasHeaders: true },
        specificity: { score: 75, hasConcreteCommands: true, hasFilePatterns: true, hasCodeExamples: false, vagueTermCount: 0 },
        warnings: ['Warning 1', 'Warning 2', 'Warning 3'],
        suggestions: [],
      };
      expect(isHighQuality(score)).toBe(false);
    });
  });
});
