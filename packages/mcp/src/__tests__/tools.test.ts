import { describe, it, expect } from 'vitest';
import {
  handleSearchSkills,
  handleGetSkill,
  handleRecommendSkills,
  handleListCategories,
} from '../tools.js';
import type { SkillEntry } from '../tools.js';

const testSkills: SkillEntry[] = [
  { name: 'react-perf', description: 'React performance tips', source: 'owner/repo', tags: ['react', 'performance'] },
  { name: 'testing-guide', description: 'Unit testing guide', source: 'owner/repo2', tags: ['testing'] },
  { name: 'nextjs-auth', description: 'Next.js authentication', source: 'other/repo', tags: ['nextjs', 'auth'], category: 'framework' },
];

describe('handleSearchSkills', () => {
  it('returns ranked results for query', () => {
    const result = handleSearchSkills(testSkills, { query: 'react', limit: 10 });
    const data = JSON.parse(result.content[0].text);
    expect(data.skills.length).toBeGreaterThan(0);
    expect(data.query).toBe('react');
    expect(data.total).toBeGreaterThan(0);
  });

  it('applies tag filters', () => {
    const result = handleSearchSkills(testSkills, {
      query: 'guide',
      limit: 10,
      filters: { tags: ['testing'] },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.skills.length).toBeGreaterThanOrEqual(1);
  });

  it('respects limit', () => {
    const result = handleSearchSkills(testSkills, { query: 'test', limit: 1 });
    const data = JSON.parse(result.content[0].text);
    expect(data.skills.length).toBeLessThanOrEqual(1);
  });
});

describe('handleGetSkill', () => {
  it('returns a specific skill', () => {
    const result = handleGetSkill(testSkills, { source: 'owner/repo', skill_id: 'react-perf' });
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.name).toBe('react-perf');
  });

  it('returns error for missing skill', () => {
    const result = handleGetSkill(testSkills, { source: 'owner/repo', skill_id: 'nonexistent' });
    expect(result.isError).toBe(true);
  });
});

describe('handleRecommendSkills', () => {
  it('recommends based on languages', () => {
    const result = handleRecommendSkills(testSkills, { languages: ['react'], limit: 5 });
    const data = JSON.parse(result.content[0].text);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it('recommends based on task description', () => {
    const result = handleRecommendSkills(testSkills, { task: 'testing react components', limit: 5 });
    const data = JSON.parse(result.content[0].text);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it('errors with no input', () => {
    const result = handleRecommendSkills(testSkills, { limit: 5 });
    expect(result.isError).toBe(true);
  });
});

describe('handleListCategories', () => {
  it('returns tag counts', () => {
    const result = handleListCategories(testSkills);
    const data = JSON.parse(result.content[0].text);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    const react = data.categories.find((c: { name: string }) => c.name === 'react');
    expect(react?.count).toBe(1);
  });
});
