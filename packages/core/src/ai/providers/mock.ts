import { BaseAIProvider } from './base.js';
import type {
  AISearchResult,
  GeneratedSkill,
  SearchableSkill,
  SkillExample,
} from '../types.js';

export class MockAIProvider extends BaseAIProvider {
  name = 'mock';

  async search(
    query: string,
    skills: SearchableSkill[]
  ): Promise<AISearchResult[]> {
    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(/\s+/).filter((t) => t.length > 2);

    return skills
      .map((skill) => {
        let relevance = 0;

        const nameMatch = skill.name.toLowerCase().includes(lowerQuery);
        const descMatch = skill.description?.toLowerCase().includes(lowerQuery);
        const tagMatch = skill.tags?.some((t) =>
          t.toLowerCase().includes(lowerQuery)
        );
        const contentMatch = skill.content.toLowerCase().includes(lowerQuery);

        // Also check individual terms
        const nameTermMatch = queryTerms.some((term) =>
          skill.name.toLowerCase().includes(term)
        );
        const descTermMatch = queryTerms.some(
          (term) => skill.description?.toLowerCase().includes(term)
        );
        const tagTermMatch = queryTerms.some((term) =>
          skill.tags?.some((t) => t.toLowerCase().includes(term))
        );

        if (nameMatch) relevance += 0.5;
        if (descMatch) relevance += 0.3;
        if (tagMatch) relevance += 0.2;
        if (contentMatch) relevance += 0.1;

        // Partial term matches
        if (!nameMatch && nameTermMatch) relevance += 0.3;
        if (!descMatch && descTermMatch) relevance += 0.2;
        if (!tagMatch && tagTermMatch) relevance += 0.15;

        relevance = Math.min(1, relevance);

        return {
          skill,
          relevance,
          reasoning: this.buildReasoning(
            nameMatch || nameTermMatch,
            descMatch || descTermMatch,
            tagMatch || tagTermMatch,
            contentMatch
          ),
        };
      })
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }

  async generateSkill(example: SkillExample): Promise<GeneratedSkill> {
    const name = this.generateName(example.description);
    const tags = this.generateTags(example.description);

    return {
      name,
      description: example.description,
      content: this.generateContent(name, example),
      tags,
      confidence: 0.75,
      reasoning: 'Mock generated skill based on description and examples',
    };
  }

  private buildReasoning(
    nameMatch: boolean,
    descMatch: boolean | undefined,
    tagMatch: boolean | undefined,
    contentMatch: boolean
  ): string {
    const matches: string[] = [];
    if (nameMatch) matches.push('name');
    if (descMatch === true) matches.push('description');
    if (tagMatch === true) matches.push('tags');
    if (contentMatch) matches.push('content');

    return matches.length > 0
      ? `Matched in: ${matches.join(', ')}`
      : 'No significant matches';
  }

  private generateName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .slice(0, 3)
      .join('-');
  }

  private generateTags(description: string): string[] {
    const commonTags = ['productivity', 'automation', 'development'];
    if (description.toLowerCase().includes('test')) commonTags.push('testing');
    if (description.toLowerCase().includes('debug'))
      commonTags.push('debugging');
    if (description.toLowerCase().includes('code')) commonTags.push('coding');
    return commonTags.slice(0, 5);
  }

  private generateContent(name: string, example: SkillExample): string {
    let content = `# ${name}\n\n${example.description}\n\n`;

    if (example.context) {
      content += `## Context\n\n${example.context}\n\n`;
    }

    content += `## Instructions\n\n`;
    content += `1. Review the task requirements\n`;
    content += `2. Implement the solution\n`;
    content += `3. Test the implementation\n`;
    content += `4. Document the changes\n\n`;

    if (example.codeExamples && example.codeExamples.length > 0) {
      content += `## Examples\n\n`;
      example.codeExamples.forEach((code, i) => {
        content += `### Example ${i + 1}\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
      });
    }

    if (example.expectedBehavior) {
      content += `## Expected Behavior\n\n${example.expectedBehavior}\n`;
    }

    return content;
  }
}
