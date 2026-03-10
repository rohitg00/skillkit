import { describe, it, expect } from 'vitest';
import { formatEvalResult, formatEvalSummary, formatEvalJson, formatEvalTable } from '../reporter.js';
import type { EvalResult } from '../types.js';

function createMockResult(overrides?: Partial<EvalResult>): EvalResult {
  return {
    skillPath: '/test/skill',
    skillName: 'test-skill',
    overallScore: 78,
    grade: 'B',
    tiers: [
      {
        tier: 1,
        name: 'LLM Quality',
        score: 85,
        grade: 'A',
        duration: 120,
        details: {
          dimensions: [
            { dimension: 'clarity', score: 90, reasoning: 'Clear structure', confidence: 0.95 },
            { dimension: 'specificity', score: 80, reasoning: 'Good examples', confidence: 0.88 },
          ],
          weights: { clarity: 0.2, specificity: 0.2 },
          heuristicFallback: false,
        },
      },
      {
        tier: 2,
        name: 'Contradiction Detection',
        score: 70,
        grade: 'B',
        duration: 45,
        details: {
          findings: [
            { type: 'formal', severity: 'medium', description: 'Conflicting always/never', textA: 'always use X', textB: 'never use X' },
          ],
          formalCount: 1,
          semanticCount: 0,
        },
      },
    ],
    duration: 200,
    timestamp: '2026-03-10T12:00:00.000Z',
    options: {},
    ...overrides,
  };
}

describe('Reporter', () => {
  describe('formatEvalSummary', () => {
    it('produces readable output', () => {
      const output = formatEvalSummary(createMockResult());
      expect(output).toContain('test-skill');
      expect(output).toContain('LLM Quality');
      expect(output).toContain('Contradiction Detection');
    });

    it('shows heuristic fallback notice', () => {
      const result = createMockResult();
      result.tiers[0].details.heuristicFallback = true;
      const output = formatEvalSummary(result);
      expect(output).toContain('heuristic fallback');
    });

    it('shows error details', () => {
      const result = createMockResult();
      result.tiers.push({
        tier: 3,
        name: 'Security',
        score: 0,
        grade: 'F',
        duration: 0,
        details: { error: 'Provider unavailable' },
      });
      const output = formatEvalSummary(result);
      expect(output).toContain('Provider unavailable');
    });

    it('handles contradiction findings', () => {
      const output = formatEvalSummary(createMockResult());
      expect(output).toContain('Conflicting always/never');
    });

    it('shows green when no contradictions', () => {
      const result = createMockResult();
      result.tiers[1].details = { findings: [], formalCount: 0, semanticCount: 0 };
      const output = formatEvalSummary(result);
      expect(output).toContain('No contradictions detected');
    });
  });

  describe('formatEvalJson', () => {
    it('produces valid JSON', () => {
      const output = formatEvalJson(createMockResult());
      const parsed = JSON.parse(output);
      expect(parsed.skillName).toBe('test-skill');
      expect(parsed.overallScore).toBe(78);
      expect(parsed.tiers).toHaveLength(2);
    });
  });

  describe('formatEvalTable', () => {
    it('produces table output', () => {
      const output = formatEvalTable(createMockResult());
      expect(output).toContain('Tier');
      expect(output).toContain('Score');
      expect(output).toContain('Grade');
      expect(output).toContain('LLM Quality');
    });

    it('shows overall at the bottom', () => {
      const output = formatEvalTable(createMockResult());
      expect(output).toContain('Overall: 78 (B)');
    });
  });

  describe('formatEvalResult', () => {
    it('dispatches to summary by default', () => {
      const output = formatEvalResult(createMockResult());
      expect(output).toContain('test-skill');
      expect(output).toContain('Tier');
    });

    it('dispatches to json', () => {
      const output = formatEvalResult(createMockResult(), 'json');
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('dispatches to table', () => {
      const output = formatEvalResult(createMockResult(), 'table');
      expect(output).toContain('---');
    });
  });
});
