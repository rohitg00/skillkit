import { RelevanceRanker } from '@skillkit/core';
import {
  SearchSkillsInputSchema,
  GetSkillInputSchema,
  RecommendSkillsInputSchema,
} from './types.js';

export interface SkillEntry {
  name: string;
  description?: string;
  source: string;
  repo?: string;
  tags?: string[];
  category?: string;
  content?: string;
}

const ranker = new RelevanceRanker();

export function handleSearchSkills(skills: SkillEntry[], args: unknown) {
  const input = SearchSkillsInputSchema.parse(args);
  let filtered = skills;

  if (input.filters) {
    if (input.filters.tags?.length) {
      filtered = filtered.filter((s) =>
        input.filters!.tags!.some((t) => s.tags?.includes(t)),
      );
    }
    if (input.filters.category) {
      filtered = filtered.filter((s) => s.category === input.filters!.category);
    }
    if (input.filters.source) {
      filtered = filtered.filter((s) => s.source.includes(input.filters!.source!));
    }
  }

  const ranked = ranker.rank(
    filtered.map((s) => ({
      name: s.name,
      description: s.description,
      content: s.content,
    })),
    input.query,
  );

  const results = ranked.slice(0, input.limit).map((r) => {
    const original = filtered.find((s) => s.name === r.skill.name)!;
    const result: Record<string, unknown> = {
      name: original.name,
      description: original.description,
      source: original.source,
      tags: original.tags,
      score: r.score,
    };
    if (input.include_content) result.content = original.content;
    return result;
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ skills: results, total: ranked.length, query: input.query }, null, 2),
      },
    ],
  };
}

export function handleGetSkill(skills: SkillEntry[], args: unknown) {
  const input = GetSkillInputSchema.parse(args);

  const skill = skills.find(
    (s) => s.source.includes(input.source) && s.name === input.skill_id,
  );

  if (!skill) {
    return {
      content: [{ type: 'text' as const, text: `Skill not found: ${input.source}/${input.skill_id}` }],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(skill, null, 2),
      },
    ],
  };
}

export function handleRecommendSkills(skills: SkillEntry[], args: unknown) {
  const input = RecommendSkillsInputSchema.parse(args);
  const queryParts: string[] = [];

  if (input.languages?.length) queryParts.push(...input.languages);
  if (input.frameworks?.length) queryParts.push(...input.frameworks);
  if (input.libraries?.length) queryParts.push(...input.libraries);
  if (input.task) queryParts.push(input.task);

  const query = queryParts.join(' ');
  if (!query) {
    return {
      content: [{ type: 'text' as const, text: 'Provide at least one of: languages, frameworks, libraries, or task' }],
      isError: true,
    };
  }

  const ranked = ranker.rank(
    skills.map((s) => ({
      name: s.name,
      description: s.description,
      content: s.content,
    })),
    query,
  );

  const results = ranked.slice(0, input.limit).map((r) => {
    const original = skills.find((s) => s.name === r.skill.name)!;
    return {
      name: original.name,
      description: original.description,
      source: original.source,
      tags: original.tags,
      score: r.score,
    };
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ recommendations: results, query }, null, 2),
      },
    ],
  };
}

export function handleListCategories(skills: SkillEntry[]) {
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

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ categories, total: categories.length }, null, 2),
      },
    ],
  };
}
