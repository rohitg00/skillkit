import type { TreeNode } from '../tree/types.js';
import type { ProjectProfile } from '../recommend/types.js';
import type { SearchPlan, CategoryScore } from './types.js';

export const SEARCH_PLANNING_PROMPT = `You are a skill discovery assistant. Given a user query and optional project context, create a search plan.

User Query: {{query}}

{{#if context}}
Project Context:
- Languages: {{context.languages}}
- Frameworks: {{context.frameworks}}
- Project Type: {{context.type}}
{{/if}}

Available Categories:
{{categories}}

Respond with a JSON search plan:
{
  "primaryCategories": ["most relevant categories"],
  "secondaryCategories": ["somewhat relevant categories"],
  "keywords": ["extracted search terms"],
  "filters": {
    "tags": ["relevant tags"],
    "frameworks": ["relevant frameworks"],
    "languages": ["relevant languages"]
  },
  "strategy": "breadth-first" | "depth-first" | "targeted"
}`;

export const CATEGORY_RELEVANCE_PROMPT = `Rate the relevance of this category for the user's query.

Query: {{query}}

Category: {{category.name}}
Skills in category: {{category.skillCount}}
Subcategories: {{category.subcategories}}

Rate from 0-100 and explain briefly.
Respond as JSON: {"score": number, "reasoning": "brief explanation"}`;

export const SKILL_MATCH_PROMPT = `Evaluate how well this skill matches the user's query.

Query: {{query}}

Skill: {{skill.name}}
Description: {{skill.description}}
Tags: {{skill.tags}}

{{#if context}}
Project Stack:
- Languages: {{context.languages}}
- Frameworks: {{context.frameworks}}
{{/if}}

Evaluate match quality and explain why.
Respond as JSON:
{
  "confidence": 0-100,
  "matchedKeywords": ["words from query that match"],
  "relevantSections": ["which parts of skill are relevant"],
  "reasoning": "explanation of match quality"
}`;

export const EXPLANATION_PROMPT = `Explain why this skill was recommended for the user's project.

Skill: {{skill.name}}
Description: {{skill.description}}
Tags: {{skill.tags}}
Score: {{score}}

Project:
- Name: {{project.name}}
- Type: {{project.type}}
- Languages: {{project.languages}}
- Frameworks: {{project.frameworks}}

Explain the match clearly and concisely.
Respond as JSON:
{
  "matchedBecause": ["specific match reasons"],
  "relevantFor": ["how it helps this project"],
  "differentFrom": ["what distinguishes it from alternatives"],
  "confidence": "high" | "medium" | "low"
}`;

export function buildSearchPlanPrompt(
  query: string,
  categories: string[],
  context?: ProjectProfile
): string {
  let prompt = SEARCH_PLANNING_PROMPT
    .replace('{{query}}', query)
    .replace('{{categories}}', categories.join('\n'));

  if (context) {
    const languages = context.stack.languages.map(l => l.name).join(', ');
    const frameworks = context.stack.frameworks.map(f => f.name).join(', ');

    prompt = prompt
      .replace('{{#if context}}', '')
      .replace('{{/if}}', '')
      .replace('{{context.languages}}', languages)
      .replace('{{context.frameworks}}', frameworks)
      .replace('{{context.type}}', context.type || 'unknown');
  } else {
    prompt = prompt.replace(/\{\{#if context\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return prompt;
}

export function buildCategoryRelevancePrompt(
  query: string,
  node: TreeNode
): string {
  const subcategories = node.children.map(c => c.name).join(', ');

  return CATEGORY_RELEVANCE_PROMPT
    .replace('{{query}}', query)
    .replace('{{category.name}}', node.name)
    .replace('{{category.skillCount}}', String(node.skillCount))
    .replace('{{category.subcategories}}', subcategories || 'none');
}

export function buildSkillMatchPrompt(
  query: string,
  skill: { name: string; description?: string; tags?: string[] },
  context?: ProjectProfile
): string {
  let prompt = SKILL_MATCH_PROMPT
    .replace('{{query}}', query)
    .replace('{{skill.name}}', skill.name)
    .replace('{{skill.description}}', skill.description || 'No description')
    .replace('{{skill.tags}}', skill.tags?.join(', ') || 'No tags');

  if (context) {
    const languages = context.stack.languages.map(l => l.name).join(', ');
    const frameworks = context.stack.frameworks.map(f => f.name).join(', ');

    prompt = prompt
      .replace('{{#if context}}', '')
      .replace('{{/if}}', '')
      .replace('{{context.languages}}', languages)
      .replace('{{context.frameworks}}', frameworks);
  } else {
    prompt = prompt.replace(/\{\{#if context\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return prompt;
}

export function buildExplanationPrompt(
  skill: { name: string; description?: string; tags?: string[] },
  score: number,
  project: ProjectProfile
): string {
  const languages = project.stack.languages.map(l => l.name).join(', ');
  const frameworks = project.stack.frameworks.map(f => f.name).join(', ');

  return EXPLANATION_PROMPT
    .replace('{{skill.name}}', skill.name)
    .replace('{{skill.description}}', skill.description || 'No description')
    .replace('{{skill.tags}}', skill.tags?.join(', ') || 'No tags')
    .replace('{{score}}', String(score))
    .replace('{{project.name}}', project.name)
    .replace('{{project.type}}', project.type || 'unknown')
    .replace('{{project.languages}}', languages)
    .replace('{{project.frameworks}}', frameworks);
}

export function extractJsonFromResponse(response: string): unknown {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Invalid JSON in response');
  }
}

export function validateSearchPlan(data: unknown): SearchPlan {
  const plan = data as Record<string, unknown>;

  return {
    primaryCategories: Array.isArray(plan.primaryCategories)
      ? plan.primaryCategories
      : [],
    secondaryCategories: Array.isArray(plan.secondaryCategories)
      ? plan.secondaryCategories
      : [],
    keywords: Array.isArray(plan.keywords) ? plan.keywords : [],
    filters: {
      tags: Array.isArray((plan.filters as Record<string, unknown>)?.tags)
        ? (plan.filters as Record<string, unknown>).tags as string[]
        : [],
      frameworks: Array.isArray((plan.filters as Record<string, unknown>)?.frameworks)
        ? (plan.filters as Record<string, unknown>).frameworks as string[]
        : [],
      languages: Array.isArray((plan.filters as Record<string, unknown>)?.languages)
        ? (plan.filters as Record<string, unknown>).languages as string[]
        : [],
    },
    strategy: ['breadth-first', 'depth-first', 'targeted'].includes(
      plan.strategy as string
    )
      ? (plan.strategy as 'breadth-first' | 'depth-first' | 'targeted')
      : 'breadth-first',
  };
}

export function validateCategoryScore(
  data: unknown,
  fallbackCategory = ''
): CategoryScore {
  const score = data as Record<string, unknown>;

  return {
    category: typeof score.category === 'string' ? score.category : fallbackCategory,
    score: typeof score.score === 'number' ? Math.min(100, Math.max(0, score.score)) : 0,
    reasoning: typeof score.reasoning === 'string' ? score.reasoning : '',
  };
}
