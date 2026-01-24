import type {
  AIProvider,
  AISearchResult,
  GeneratedSkill,
  SearchableSkill,
  SkillExample,
} from '../types.js';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;

  abstract search(
    query: string,
    skills: SearchableSkill[]
  ): Promise<AISearchResult[]>;

  abstract generateSkill(example: SkillExample): Promise<GeneratedSkill>;

  protected buildSearchPrompt(query: string, skills: SearchableSkill[]): string {
    const skillsList = skills
      .map(
        (s, i) =>
          `${i + 1}. ${s.name}${s.description ? ` - ${s.description}` : ''}${s.tags ? ` [${s.tags.join(', ')}]` : ''}`
      )
      .join('\n');

    return `You are a skill search assistant. Given a user query and a list of available skills, identify the most relevant skills.

User Query: "${query}"

Available Skills:
${skillsList}

For each relevant skill (up to 10), provide:
1. Skill index number
2. Relevance score (0-1)
3. Brief reasoning

Format your response as JSON:
[
  {
    "index": <number>,
    "relevance": <0-1>,
    "reasoning": "<explanation>"
  }
]`;
  }

  protected buildGeneratePrompt(example: SkillExample): string {
    let prompt = `You are a skill generation assistant. Generate a complete skill based on the following specification:

Description: ${example.description}`;

    if (example.context) {
      prompt += `\n\nContext: ${example.context}`;
    }

    if (example.codeExamples && example.codeExamples.length > 0) {
      prompt += `\n\nCode Examples:\n${example.codeExamples.map((code, i) => `Example ${i + 1}:\n\`\`\`\n${code}\n\`\`\``).join('\n\n')}`;
    }

    if (example.expectedBehavior) {
      prompt += `\n\nExpected Behavior: ${example.expectedBehavior}`;
    }

    prompt += `

Generate a skill in SKILL.md format with:
1. Clear name (kebab-case)
2. Comprehensive description
3. Detailed instructions
4. Relevant tags
5. Usage examples if applicable

Format your response as JSON:
{
  "name": "<skill-name>",
  "description": "<description>",
  "content": "<full SKILL.md content>",
  "tags": ["<tag1>", "<tag2>"],
  "confidence": <0-1>,
  "reasoning": "<why this skill design>"
}`;

    return prompt;
  }

  protected parseSearchResponse(
    response: string,
    skills: SearchableSkill[]
  ): AISearchResult[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((item: any) => ({
        skill: skills[item.index - 1],
        relevance: item.relevance,
        reasoning: item.reasoning,
      }));
    } catch {
      return [];
    }
  }

  protected parseGenerateResponse(response: string): GeneratedSkill {
    try {
      const parsed = JSON.parse(response);
      return {
        name: parsed.name,
        description: parsed.description,
        content: parsed.content,
        tags: parsed.tags || [],
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || '',
      };
    } catch {
      throw new Error('Failed to parse skill generation response');
    }
  }
}
