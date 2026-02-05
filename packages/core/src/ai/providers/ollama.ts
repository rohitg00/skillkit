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

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  message: { role: string; content: string };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama' as const;
  readonly displayName = 'Ollama (Local)';

  private baseUrl: string;
  private model: string;
  private temperature: number;

  constructor(config: ProviderConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = config.model || 'llama3.2';
    this.temperature = config.temperature ?? 0.7;
  }

  isConfigured(): boolean {
    return true;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const ollamaMessages: OllamaMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.makeRequest(ollamaMessages);
    return response.message.content;
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
    const systemPrompt = `Generate 2-3 clarification questions for skill creation. Keep it simple for local model.

Return JSON array:
[{"id": "q1", "question": "?", "type": "text", "context": "why"}]`;

    const userPrompt = `Expertise: ${context.expertise}`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseJSON<ClarificationQuestion[]>(response, [
      {
        id: 'q1',
        question: 'What specific use cases should this skill cover?',
        type: 'text',
        context: 'Helps narrow down the scope',
      },
    ]);
  }

  async optimizeForAgent(skillContent: string, agentId: string): Promise<string> {
    const response = await this.chat([
      { role: 'system', content: `Optimize this skill for ${agentId}. Keep the core instructions.` },
      { role: 'user', content: skillContent },
    ]);

    return response || skillContent;
  }

  async search(query: string, skills: SearchableSkill[]): Promise<SearchResult[]> {
    if (skills.length === 0) return [];

    const limited = skills.slice(0, 20);
    const skillsList = limited
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

  private async makeRequest(messages: OllamaMessage[]): Promise<OllamaResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: { temperature: this.temperature },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<OllamaResponse>;
  }

  private buildGenerationSystemPrompt(): string {
    return `You are a skill designer. Create a SKILL.md file.

Return JSON:
{"name": "skill-name", "description": "...", "content": "# Skill\\n...", "tags": [], "confidence": 0.7, "reasoning": "..."}`;
  }

  private buildGenerationUserPrompt(context: GenerationContext): string {
    let prompt = `Create skill for: ${context.expertise}\n`;

    if (context.contextChunks.length > 0) {
      prompt += '\nContext:\n';
      for (const chunk of context.contextChunks.slice(0, 3)) {
        prompt += `${chunk.content.slice(0, 300)}\n`;
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
}
