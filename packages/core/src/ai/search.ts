import type {
  AIProvider,
  AISearchOptions,
  AISearchResult,
  SearchableSkill,
} from './types.js';

export class AISearch {
  constructor(private provider: AIProvider) {}

  async search(
    query: string,
    skills: SearchableSkill[],
    options: AISearchOptions = {}
  ): Promise<AISearchResult[]> {
    const {
      limit = 10,
      minRelevance = 0.5,
      includeReasoning = true,
    } = options;

    const results = await this.provider.search(query, skills);

    const filtered = results
      .filter((r) => r.relevance >= minRelevance)
      .slice(0, limit);

    if (!includeReasoning) {
      filtered.forEach((r) => {
        r.reasoning = '';
      });
    }

    return filtered;
  }

  async searchByIntent(
    intent: string,
    skills: SearchableSkill[],
    options: AISearchOptions = {}
  ): Promise<AISearchResult[]> {
    const enhancedQuery = `Find skills that help with: ${intent}. Consider the skill's purpose, capabilities, and use cases.`;
    return this.search(enhancedQuery, skills, options);
  }

  async findSimilar(
    skill: SearchableSkill,
    allSkills: SearchableSkill[],
    options: AISearchOptions = {}
  ): Promise<AISearchResult[]> {
    const query = `Find skills similar to "${skill.name}". ${skill.description ? `This skill: ${skill.description}` : ''}`;
    const filtered = allSkills.filter((s) => s.name !== skill.name);
    return this.search(query, filtered, options);
  }
}
