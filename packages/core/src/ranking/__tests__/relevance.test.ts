import { describe, it, expect } from 'vitest';
import { RelevanceRanker } from '../relevance.js';
import type { RankableSkill } from '../relevance.js';

describe('RelevanceRanker', () => {
  const ranker = new RelevanceRanker();

  const skills: RankableSkill[] = [
    {
      name: 'react-performance',
      description: 'Optimize React app performance',
      content: 'Full guide on React performance optimization',
      stars: 150,
      references: ['examples/demo.ts'],
    },
    {
      name: 'testing-basics',
      description: 'Unit testing fundamentals',
      stars: 10,
    },
    {
      name: 'empty-skill',
    },
  ];

  it('ranks skills by relevance score', () => {
    const results = ranker.rank(skills);
    expect(results).toHaveLength(3);
    expect(results[0].skill.name).toBe('react-performance');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('gives max content score for description + content', () => {
    const results = ranker.rank(skills);
    const full = results.find((r) => r.skill.name === 'react-performance')!;
    expect(full.breakdown.contentAvailability).toBe(40);
  });

  it('gives partial content score for description only', () => {
    const results = ranker.rank(skills);
    const partial = results.find((r) => r.skill.name === 'testing-basics')!;
    expect(partial.breakdown.contentAvailability).toBe(20);
  });

  it('gives zero content score for empty skill', () => {
    const results = ranker.rank(skills);
    const empty = results.find((r) => r.skill.name === 'empty-skill')!;
    expect(empty.breakdown.contentAvailability).toBe(0);
  });

  it('boosts exact name match on query', () => {
    const results = ranker.rank(skills, 'react-performance');
    const match = results.find((r) => r.skill.name === 'react-performance')!;
    expect(match.breakdown.queryMatch).toBe(30);
  });

  it('gives partial query match for substring', () => {
    const results = ranker.rank(skills, 'react');
    const match = results.find((r) => r.skill.name === 'react-performance')!;
    expect(match.breakdown.queryMatch).toBeGreaterThan(0);
    expect(match.breakdown.queryMatch).toBeLessThan(30);
  });

  it('scores popularity via log scale', () => {
    const results = ranker.rank(skills);
    const popular = results.find((r) => r.skill.name === 'react-performance')!;
    const less = results.find((r) => r.skill.name === 'testing-basics')!;
    expect(popular.breakdown.popularity).toBeGreaterThan(less.breakdown.popularity);
  });

  it('scores references', () => {
    const results = ranker.rank(skills);
    const withRefs = results.find((r) => r.skill.name === 'react-performance')!;
    const noRefs = results.find((r) => r.skill.name === 'testing-basics')!;
    expect(withRefs.breakdown.referenceScore).toBeGreaterThan(0);
    expect(noRefs.breakdown.referenceScore).toBe(0);
  });

  it('returns zero query match when no query provided', () => {
    const results = ranker.rank(skills);
    for (const r of results) {
      expect(r.breakdown.queryMatch).toBe(0);
    }
  });
});
