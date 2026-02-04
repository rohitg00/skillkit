import { RelevanceRanker } from '@skillkit/core';
import type { SkillEntry } from './tools.js';

const ranker = new RelevanceRanker();

export function getTrendingResource(skills: SkillEntry[]) {
  const skillMap = new Map(skills.map((s) => [s.name, s]));

  const ranked = ranker.rank(
    skills.map((s) => ({
      name: s.name,
      description: s.description,
      content: s.content,
    })),
  );

  const trending = ranked.slice(0, 20).map((r) => {
    const original = skillMap.get(r.skill.name);
    if (!original) return null;
    return {
      name: original.name,
      description: original.description,
      source: original.source,
      tags: original.tags,
      score: r.score,
    };
  }).filter(Boolean);

  return JSON.stringify({ trending, count: trending.length }, null, 2);
}

export function getCategoriesResource(skills: SkillEntry[]) {
  const tagCounts = new Map<string, number>();

  for (const skill of skills) {
    if (skill.tags) {
      for (const tag of skill.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  const categories = Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return JSON.stringify({ categories, total: categories.length }, null, 2);
}
