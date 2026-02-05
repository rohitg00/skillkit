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
import type { SearchableSkill, GeneratedSkill, SkillExample } from '../types.js';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export class OpenRouterProvider implements LLMProvider {
  readonly name = 'openrouter' as const;
  readonly displayName = 'OpenRouter (100+ Models)';

  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: ProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || '';
    this.model = config.model || 'anthropic/claude-3.5-sonnet';
    this.maxTokens = config.maxTokens ?? 4096;
    this.temperature = config.temperature ?? 0.7;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }

    const openRouterMessages: OpenRouterMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.makeRequest(openRouterMessages);
    return response.choices[0]?.message.content || '';
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
    const systemPrompt = `Generate 2-4 clarification questions for skill creation.

Return JSON:
[{"id": "q1", "question": "?", "type": "select|text|confirm", "options": [], "context": "why"}]`;

    const userPrompt = `Expertise: ${context.expertise}
Context: ${context.gatheredContext?.map((c) => `[${c.source}] ${c.content.slice(0, 200)}`).join('\n') || 'None'}`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseJSON<ClarificationQuestion[]>(response, []);
  }

  async optimizeForAgent(skillContent: string, agentId: string): Promise<string> {
    const constraints = this.getAgentConstraints(agentId);

    const response = await this.chat([
      { role: 'system', content: `Optimize skill for ${agentId}. Constraints: ${JSON.stringify(constraints)}` },
      { role: 'user', content: skillContent },
    ]);

    return response;
  }

  async search(query: string, skills: SearchableSkill[]): Promise<SearchResult[]> {
    if (skills.length === 0) return [];

    const skillsList = skills
      .map((s, i) => `${i + 1}. ${s.name}${s.description ? ` - ${s.description}` : ''}`)
      .join('\n');

    const prompt = `Find relevant skills for: "${query}"\n\nSkills:\n${skillsList}\n\nReturn JSON: [{"index": N, "relevance": 0-1, "reasoning": "why"}]`;
    const response = await this.chat([{ role: 'user', content: prompt }]);

    try {
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as Array<{ index: number; relevance: number; reasoning: string }>;
        return parsed.map((item) => ({
          skill: skills[item.index - 1],
          relevance: item.relevance,
          reasoning: item.reasoning,
        }));
      }
    } catch {
      // Parse error
    }
    return [];
  }

  async generateFromExample(example: SkillExample): Promise<GeneratedSkill> {
    let prompt = `Generate a skill for: ${example.description}`;
    if (example.context) prompt += `\nContext: ${example.context}`;
    prompt += `\n\nReturn JSON: {"name": "...", "description": "...", "content": "...", "tags": [], "confidence": 0-1, "reasoning": "..."}`;

    const response = await this.chat([{ role: 'user', content: prompt }]);

    try {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          name: parsed.name,
          description: parsed.description,
          content: parsed.content,
          tags: parsed.tags || [],
          confidence: parsed.confidence || 0.7,
          reasoning: parsed.reasoning || '',
        };
      }
    } catch {
      // Parse error
    }
    throw new Error('Failed to parse skill generation response');
  }

  private async makeRequest(messages: OpenRouterMessage[]): Promise<OpenRouterResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://skillkit.dev',
        'X-Title': 'SkillKit',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<OpenRouterResponse>;
  }

  private buildGenerationSystemPrompt(): string {
    return `You are an expert AI skill designer. Create SKILL.md files.

Output JSON:
{"name": "kebab-case", "description": "...", "content": "markdown", "tags": [], "confidence": 0-1, "reasoning": "..."}`;
  }

  private buildGenerationUserPrompt(context: GenerationContext): string {
    let prompt = `Create skill: ${context.expertise}\n\n`;

    if (context.contextChunks.length > 0) {
      for (const chunk of context.contextChunks) {
        prompt += `[${chunk.source}] ${chunk.content.slice(0, 500)}\n`;
      }
    }

    if (context.clarifications.length > 0) {
      prompt += '\nClarifications:\n';
      for (const c of context.clarifications) {
        prompt += `- ${c.questionId}: ${c.answer}\n`;
      }
    }

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

    return { ...parsed, composedFrom: context.composedFrom };
  }

  private parseJSON<T>(response: string, defaultValue: T): T {
    try {
      const match = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]) as T;
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private getAgentConstraints(agentId: string): Record<string, unknown> {
    const constraints: Record<string, Record<string, unknown>> = {
      'claude-code': { maxContext: 200000, markdown: true, mcp: true },
      cursor: { maxContext: 32000, markdown: true, mcp: false },
      codex: { maxContext: 8000, markdown: true, mcp: false },
      universal: { maxContext: 8000, markdown: true, mcp: false },
    };
    return constraints[agentId] || constraints.universal;
  }
}
