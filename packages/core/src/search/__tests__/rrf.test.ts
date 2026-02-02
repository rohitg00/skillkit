import { describe, it, expect } from 'vitest';
import {
  computeRRFScore,
  fuseWithRRF,
  normalizeScores,
  weightedCombine,
  applyPositionAwareBlending,
  getRankFromScore,
  mergeRankings,
  type RankerResult,
  type RRFInput,
} from '../rrf.js';

describe('RRF (Reciprocal Rank Fusion)', () => {
  describe('computeRRFScore', () => {
    it('should compute RRF score for a single rank', () => {
      const score = computeRRFScore([1], 60);
      expect(score).toBeCloseTo(1 / 61, 5);
    });

    it('should sum RRF scores for multiple ranks', () => {
      const score = computeRRFScore([1, 2, 3], 60);
      const expected = 1 / 61 + 1 / 62 + 1 / 63;
      expect(score).toBeCloseTo(expected, 5);
    });

    it('should use custom k value', () => {
      const scoreK60 = computeRRFScore([1], 60);
      const scoreK30 = computeRRFScore([1], 30);
      expect(scoreK30).toBeGreaterThan(scoreK60);
    });

    it('should return 0 for empty ranks', () => {
      const score = computeRRFScore([]);
      expect(score).toBe(0);
    });
  });

  describe('fuseWithRRF', () => {
    it('should fuse results from multiple rankers', () => {
      const inputs: RRFInput[] = [
        {
          source: 'vector',
          results: [
            { skillName: 'skill-a', score: 0.9 },
            { skillName: 'skill-b', score: 0.8 },
            { skillName: 'skill-c', score: 0.7 },
          ],
        },
        {
          source: 'keyword',
          results: [
            { skillName: 'skill-b', score: 90 },
            { skillName: 'skill-a', score: 80 },
            { skillName: 'skill-d', score: 70 },
          ],
        },
      ];

      const rankings = fuseWithRRF(inputs, 60);

      expect(rankings.length).toBe(4);
      expect(rankings[0].skillName).toBe('skill-a');
      expect(rankings[1].skillName).toBe('skill-b');
    });

    it('should include rank information from each source', () => {
      const inputs: RRFInput[] = [
        {
          source: 'vector',
          results: [{ skillName: 'skill-a', score: 0.9 }],
        },
        {
          source: 'keyword',
          results: [{ skillName: 'skill-a', score: 90 }],
        },
      ];

      const rankings = fuseWithRRF(inputs);

      expect(rankings[0].ranks).toHaveLength(2);
      expect(rankings[0].ranks.map((r) => r.source)).toContain('vector');
      expect(rankings[0].ranks.map((r) => r.source)).toContain('keyword');
    });

    it('should handle skills appearing in only one ranker', () => {
      const inputs: RRFInput[] = [
        {
          source: 'vector',
          results: [{ skillName: 'skill-a', score: 0.9 }],
        },
        {
          source: 'keyword',
          results: [{ skillName: 'skill-b', score: 90 }],
        },
      ];

      const rankings = fuseWithRRF(inputs);

      expect(rankings).toHaveLength(2);
      const skillAInfo = rankings.find((r) => r.skillName === 'skill-a');
      const skillBInfo = rankings.find((r) => r.skillName === 'skill-b');
      expect(skillAInfo?.ranks).toHaveLength(1);
      expect(skillBInfo?.ranks).toHaveLength(1);
    });
  });

  describe('normalizeScores', () => {
    it('should normalize scores to 0-1 range', () => {
      const results: RankerResult[] = [
        { skillName: 'a', score: 100 },
        { skillName: 'b', score: 50 },
        { skillName: 'c', score: 0 },
      ];

      const normalized = normalizeScores(results);

      expect(normalized[0].score).toBe(1);
      expect(normalized[1].score).toBe(0.5);
      expect(normalized[2].score).toBe(0);
    });

    it('should handle all same scores', () => {
      const results: RankerResult[] = [
        { skillName: 'a', score: 50 },
        { skillName: 'b', score: 50 },
      ];

      const normalized = normalizeScores(results);

      expect(normalized[0].score).toBe(1);
      expect(normalized[1].score).toBe(1);
    });

    it('should return empty array for empty input', () => {
      const normalized = normalizeScores([]);
      expect(normalized).toEqual([]);
    });
  });

  describe('weightedCombine', () => {
    it('should combine results with weights', () => {
      const inputs: RRFInput[] = [
        {
          source: 'vector',
          results: [
            { skillName: 'a', score: 100 },
            { skillName: 'b', score: 50 },
          ],
        },
        {
          source: 'keyword',
          results: [
            { skillName: 'b', score: 100 },
            { skillName: 'a', score: 50 },
          ],
        },
      ];

      const combined = weightedCombine(inputs, { vector: 0.6, keyword: 0.4 });

      expect(combined).toHaveLength(2);
      const skillA = combined.find((r) => r.skillName === 'a')!;
      const skillB = combined.find((r) => r.skillName === 'b')!;
      expect(skillA.score).toBeCloseTo(0.6 * 1 + 0.4 * 0, 5);
      expect(skillB.score).toBeCloseTo(0.6 * 0 + 0.4 * 1, 5);
    });

    it('should default to weight 1 for unknown sources', () => {
      const inputs: RRFInput[] = [
        {
          source: 'unknown',
          results: [{ skillName: 'a', score: 100 }],
        },
      ];

      const combined = weightedCombine(inputs, {});

      expect(combined[0].score).toBe(1);
    });
  });

  describe('applyPositionAwareBlending', () => {
    it('should apply different weights based on position', () => {
      const retrievalScores = new Map([
        ['a', 0.9],
        ['b', 0.8],
        ['c', 0.7],
        ['d', 0.6],
      ]);

      const rerankerScores = new Map([
        ['a', 0.5],
        ['b', 0.6],
        ['c', 0.7],
        ['d', 0.8],
      ]);

      const sortedSkills = ['a', 'b', 'c', 'd'];

      const blended = applyPositionAwareBlending(
        retrievalScores,
        rerankerScores,
        sortedSkills
      );

      const scoreA = blended.get('a')!;
      expect(scoreA).toBeCloseTo(0.9 * 0.75 + 0.5 * 0.25, 5);

      const scoreD = blended.get('d')!;
      expect(scoreD).toBeCloseTo(0.6 * 0.6 + 0.8 * 0.4, 5);
    });

    it('should handle missing scores', () => {
      const retrievalScores = new Map([['a', 0.9]]);
      const rerankerScores = new Map<string, number>();
      const sortedSkills = ['a'];

      const blended = applyPositionAwareBlending(
        retrievalScores,
        rerankerScores,
        sortedSkills
      );

      expect(blended.get('a')).toBeCloseTo(0.9 * 0.75, 5);
    });
  });

  describe('getRankFromScore', () => {
    it('should return correct rank for a skill', () => {
      const results: RankerResult[] = [
        { skillName: 'a', score: 90 },
        { skillName: 'b', score: 80 },
        { skillName: 'c', score: 70 },
      ];

      expect(getRankFromScore('a', results)).toBe(1);
      expect(getRankFromScore('b', results)).toBe(2);
      expect(getRankFromScore('c', results)).toBe(3);
    });

    it('should return length+1 for missing skill', () => {
      const results: RankerResult[] = [
        { skillName: 'a', score: 90 },
        { skillName: 'b', score: 80 },
      ];

      expect(getRankFromScore('missing', results)).toBe(3);
    });
  });

  describe('mergeRankings', () => {
    it('should merge primary and secondary rankings with weights', () => {
      const primary = [
        { skillName: 'a', rrfScore: 0.1, ranks: [{ source: 'primary', rank: 1 }] },
        { skillName: 'b', rrfScore: 0.05, ranks: [{ source: 'primary', rank: 2 }] },
      ];

      const secondary = [
        { skillName: 'b', rrfScore: 0.1, ranks: [{ source: 'secondary', rank: 1 }] },
        { skillName: 'c', rrfScore: 0.05, ranks: [{ source: 'secondary', rank: 2 }] },
      ];

      const merged = mergeRankings(primary, secondary, 0.7);

      expect(merged).toHaveLength(3);
      const skillA = merged.find((r) => r.skillName === 'a')!;
      const skillB = merged.find((r) => r.skillName === 'b')!;
      const skillC = merged.find((r) => r.skillName === 'c')!;

      expect(skillA.rrfScore).toBeCloseTo(0.1 * 0.7, 5);
      expect(skillB.rrfScore).toBeCloseTo(0.05 * 0.7 + 0.1 * 0.3, 5);
      expect(skillC.rrfScore).toBeCloseTo(0.05 * 0.3, 5);
    });
  });
});
