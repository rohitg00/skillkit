import type {
  LLMProvider,
  ProviderConfig,
  GenerationContext,
  GeneratedSkillResult,
  WizardContext,
  ClarificationQuestion,
  SearchResult,
  ChatMessage,
} from './types.js';
import type { SearchableSkill, GeneratedSkill, SkillExample, AISearchResult } from '../types.js';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
}

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic' as const;
  readonly displayName = 'Claude (Anthropic)';

  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: ProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens ?? 4096;
    this.temperature = config.temperature ?? 0.7;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured');
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.makeRequest(conversationMessages, systemMessage?.content);
    return response.content[0]?.text || '';
  }

  async generateSkill(context: GenerationContext): Promise<GeneratedSkillResult> {
    const systemPrompt = this.buildGenerationSystemPrompt();
    const userPrompt = this.buildGenerationUserPrompt(context);

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseGeneratedSkillResult(response, context);
  }

  async generateClarifications(context: WizardContext): Promise<ClarificationQuestion[]> {
    const systemPrompt = `You are an expert skill designer. Based on the user's expertise description and gathered context, generate 2-4 clarification questions that would help create a better, more targeted skill.

Focus on:
- Specific use cases or scenarios
- Edge cases to handle
- Integration preferences
- Output format preferences

Return JSON array of questions:
[
  {
    "id": "q1",
    "question": "The question text?",
    "type": "select" | "text" | "confirm" | "multiselect",
    "options": ["option1", "option2"] (for select/multiselect only),
    "context": "Why this question matters"
  }
]`;

    const contextSummary = context.gatheredContext
      ?.map((c) => `[${c.source}] ${c.content.slice(0, 200)}...`)
      .join('\n\n') || 'No context gathered yet';

    const userPrompt = `Expertise: ${context.expertise}

Gathered Context:
${contextSummary}

Target Agents: ${context.targetAgents.join(', ') || 'Not specified'}

Generate clarification questions to refine this skill:`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseJSON<ClarificationQuestion[]>(response, []);
  }

  async optimizeForAgent(skillContent: string, agentId: string): Promise<string> {
    const agentConstraints = this.getAgentConstraints(agentId);

    const systemPrompt = `You are an expert at adapting AI agent skills for specific agents. Given a skill and target agent constraints, optimize the skill content while preserving its core functionality.

Rules:
- Preserve all essential instructions
- Adapt format for the agent's capabilities
- Respect context length limits
- Use agent-appropriate syntax

Return ONLY the optimized skill content, no explanations.`;

    const userPrompt = `Target Agent: ${agentId}
Agent Constraints:
${JSON.stringify(agentConstraints, null, 2)}

Original Skill:
${skillContent}

Optimize this skill for ${agentId}:`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async search(query: string, skills: SearchableSkill[]): Promise<SearchResult[]> {
    if (skills.length === 0) return [];

    const prompt = this.buildSearchPrompt(query, skills);
    const response = await this.chat([{ role: 'user', content: prompt }]);

    const parsed = this.parseSearchResponse(response, skills);
    return parsed.map((r) => ({
      skill: r.skill,
      relevance: r.relevance,
      reasoning: r.reasoning,
    }));
  }

  async generateFromExample(example: SkillExample): Promise<GeneratedSkill> {
    const prompt = this.buildGeneratePrompt(example);
    const response = await this.chat([{ role: 'user', content: prompt }]);
    return this.parseGenerateResponse(response);
  }

  private buildSearchPrompt(query: string, skills: SearchableSkill[]): string {
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

  private buildGeneratePrompt(example: SkillExample): string {
    let prompt = `You are a skill generation assistant. Generate a complete skill based on the following specification:

Description: ${example.description}`;

    if (example.context) {
      prompt += `\n\nContext: ${example.context}`;
    }

    if (example.codeExamples && example.codeExamples.length > 0) {
      prompt += `\n\nCode Examples:\n${example.codeExamples.map((code, i) => `Example ${i + 1}:\n\`\`\`\n${code}\n\`\`\``).join('\n\n')}`;
    }

    prompt += `

Generate a skill in SKILL.md format with:
1. Clear name (kebab-case)
2. Comprehensive description
3. Detailed instructions

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

  private parseSearchResponse(
    response: string,
    skills: SearchableSkill[]
  ): AISearchResult[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed
        .filter((item: { index: number }) => Number.isInteger(item.index) && item.index >= 1 && item.index <= skills.length)
        .map((item: { index: number; relevance: number; reasoning: string }) => ({
          skill: skills[item.index - 1],
          relevance: item.relevance,
          reasoning: item.reasoning,
        }));
    } catch {
      return [];
    }
  }

  private parseGenerateResponse(response: string): GeneratedSkill {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);

      if (typeof parsed.name !== 'string' || !parsed.name) {
        throw new Error('Missing required field: name');
      }
      if (typeof parsed.description !== 'string' || !parsed.description) {
        throw new Error('Missing required field: description');
      }
      if (typeof parsed.content !== 'string' || !parsed.content) {
        throw new Error('Missing required field: content');
      }

      return {
        name: parsed.name,
        description: parsed.description,
        content: parsed.content,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.7,
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Failed to parse skill generation response: ${msg}`);
    }
  }

  private async makeRequest(
    messages: AnthropicMessage[],
    system?: string
  ): Promise<AnthropicResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const body: Record<string, unknown> = {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages,
      };

      if (system) {
        body.system = system;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      return response.json() as Promise<AnthropicResponse>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildGenerationSystemPrompt(): string {
    return `You are an expert AI skill designer. You create high-quality SKILL.md files that help AI coding assistants perform specific tasks effectively.

A good skill has:
1. Clear, specific instructions
2. Examples where helpful
3. Edge case handling
4. Appropriate scope (not too broad, not too narrow)

Output format - return valid JSON:
{
  "name": "skill-name-in-kebab-case",
  "description": "One-line description",
  "content": "Full SKILL.md content with markdown",
  "tags": ["tag1", "tag2"],
  "confidence": 0.0-1.0,
  "reasoning": "Why this design"
}`;
  }

  private buildGenerationUserPrompt(context: GenerationContext): string {
    let prompt = `Create a skill for: ${context.expertise}\n\n`;

    if (context.contextChunks.length > 0) {
      prompt += '## Gathered Context\n\n';
      for (const chunk of context.contextChunks) {
        prompt += `### From ${chunk.source} (relevance: ${chunk.relevance.toFixed(2)})\n`;
        prompt += chunk.content + '\n\n';
      }
    }

    if (context.clarifications.length > 0) {
      prompt += '## User Clarifications\n\n';
      for (const clarification of context.clarifications) {
        const answer = Array.isArray(clarification.answer)
          ? clarification.answer.join(', ')
          : String(clarification.answer);
        prompt += `- ${clarification.questionId}: ${answer}\n`;
      }
      prompt += '\n';
    }

    if (context.memoryPatterns && context.memoryPatterns.length > 0) {
      prompt += '## Learned Patterns from User\n\n';
      for (const pattern of context.memoryPatterns) {
        prompt += `- [${pattern.category}] ${pattern.pattern}\n`;
      }
      prompt += '\n';
    }

    if (context.composedFrom && context.composedFrom.length > 0) {
      prompt += `## Compose From These Skills\n`;
      prompt += `Incorporate best practices from: ${context.composedFrom.join(', ')}\n\n`;
    }

    if (context.targetAgents.length > 0) {
      prompt += `## Target Agents\n`;
      prompt += `Primary targets: ${context.targetAgents.join(', ')}\n\n`;
    }

    prompt += 'Generate the skill as JSON:';

    return prompt;
  }

  private parseGeneratedSkillResult(response: string, context: GenerationContext): GeneratedSkillResult {
    const parsed = this.parseJSON<GeneratedSkill>(response, {
      name: 'generated-skill',
      description: 'AI-generated skill',
      content: response,
      tags: [],
      confidence: 0.5,
      reasoning: '',
    });

    return {
      ...parsed,
      composedFrom: context.composedFrom,
    };
  }

  private parseJSON<T>(response: string, defaultValue: T): T {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private getAgentConstraints(agentId: string): Record<string, unknown> {
    const constraints: Record<string, Record<string, unknown>> = {
      'claude-code': {
        maxContextLength: 200000,
        supportsMarkdown: true,
        supportsMCP: true,
        supportsTools: true,
        format: 'SKILL.md',
      },
      cursor: {
        maxContextLength: 32000,
        supportsMarkdown: true,
        supportsMCP: false,
        supportsTools: false,
        format: '.cursorrules',
      },
      codex: {
        maxContextLength: 8000,
        supportsMarkdown: true,
        supportsMCP: false,
        supportsTools: false,
        format: 'concise-prompt',
      },
      universal: {
        maxContextLength: 8000,
        supportsMarkdown: true,
        supportsMCP: false,
        supportsTools: false,
        format: 'common-subset',
      },
    };

    return constraints[agentId] || constraints.universal;
  }
}
