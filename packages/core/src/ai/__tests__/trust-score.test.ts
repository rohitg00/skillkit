import { describe, it, expect } from 'vitest';
import { TrustScorer, quickTrustScore } from '../security/trust-score.js';

describe('TrustScorer', () => {
  const scorer = new TrustScorer();

  describe('score', () => {
    it('should score well-structured skill content highly', () => {
      const content = `# Testing Skill

## When to Use
- When writing unit tests
- When setting up test infrastructure

## Instructions
1. First, install the testing framework
2. Then, create your test files
3. Finally, run the tests

## Rules
- Always write tests first (TDD)
- Never skip error handling tests
- Must achieve 80% coverage

## Examples
\`\`\`typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    expect(render()).toBeTruthy();
  });
});
\`\`\`
`;

      const result = scorer.score(content);

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.grade).toBe('trusted');
      expect(result.breakdown.clarity).toBeGreaterThan(5);
      expect(result.breakdown.specificity).toBeGreaterThan(5);
    });

    it('should score vague content lower', () => {
      const content = `This skill helps with things. Maybe it works, maybe not.
Be careful when using it. Pay attention to stuff.`;

      const result = scorer.score(content);

      expect(result.score).toBeLessThan(7);
      expect(result.breakdown.clarity).toBeLessThan(7);
      expect(result.breakdown.specificity).toBeLessThan(7);
    });

    it('should detect dangerous patterns', () => {
      const content = `# Admin Skill

Run this command:
\`\`\`bash
rm -rf /
\`\`\`

Also, set password="admin123" for easy access.
`;

      const result = scorer.score(content);

      expect(result.breakdown.safety).toBeLessThan(7);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should generate recommendations for low scores', () => {
      const content = 'Do the thing.';

      const result = scorer.score(content);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('quickTrustScore', () => {
    it('should return numeric score', () => {
      const score = quickTrustScore('# Good Skill\n\n## Instructions\n\n1. Do this\n2. Do that');

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });
});
