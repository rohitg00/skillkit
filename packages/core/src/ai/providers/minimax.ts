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

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MiniMaxResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/**
 * Selectable MiniMax OpenAI-compatible base URLs. The global endpoint serves the
 * international API (`https://api.minimax.io/v1`), while the CN endpoint serves the
 * China API (`https://api.minimaxi.com/v1`). Either is selected at construction time
 * via `config.baseUrl`, the `MINIMAX_BASE_URL` env var (for a fully custom URL), or
 * the `MINIMAX_REGION` env var.
 */
const MINIMAX_GLOBAL_BASE_URL = 'https://api.minimax.io/v1';
const MINIMAX_CN_BASE_URL = 'https://api.minimaxi.com/v1';

function resolveMiniMaxBaseUrl(configBaseUrl?: string): string {
  if (configBaseUrl) return configBaseUrl.replace(/\/$/, '');
  if (process.env.MINIMAX_BASE_URL) return process.env.MINIMAX_BASE_URL.replace(/\/$/, '');
  const region = (process.env.MINIMAX_REGION || '').toLowerCase();
  if (region === 'cn' || region === 'cn_zh' || region === 'china') {
    return MINIMAX_CN_BASE_URL;
  }
  return MINIMAX_GLOBAL_BASE_URL;
}

/**
 * MiniMax text provider.
 *
 * Reuses the existing OpenAI-compatible chat-completions request and response
 * implementation, with MiniMax-specific defaults: the `MINIMAX_API_KEY` env var,
 * the MiniMax-M3 default model, and selectable global/CN base URLs.
 */
export class MiniMaxProvider implements LLMProvider {
  readonly name = 'minimax' as const;
  readonly displayName = 'MiniMax';

  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private baseUrl: string;

  constructor(config: ProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.MINIMAX_API_KEY || '';
    this.model = config.model || 'MiniMax-M3';
    this.maxTokens = config.maxTokens ?? 4096;
    this.temperature = config.temperature ?? 0.7;
    this.baseUrl = resolveMiniMaxBaseUrl(config.baseUrl);
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('MiniMax API key not configured');
    }

    const minimaxMessages: MiniMaxMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.makeRequest(minimaxMessages);
    const choice = response.choices[0];
    if (!choice) {
      throw new Error('MiniMax API returned no choices');
    }
    return choice.message.content || '';
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
    const systemPrompt = `You are an expert skill designer. Generate 2-4 clarification questions to help create a better skill.

Return JSON array:
[
  {
    "id": "q1",
    "question": "Question text?",
    "type": "select" | "text" | "confirm" | "multiselect",
    "options": ["opt1", "opt2"] (for select/multiselect),
    "context": "Why this matters"
  }
]`;

    const contextSummary = context.gatheredContext
      ?.map((c) => `[${c.source}] ${c.content.slice(0, 200)}...`)
      .join('\n\n') || 'No context yet';

    const userPrompt = `Expertise: ${context.expertise}
Context: ${contextSummary}
Agents: ${context.targetAgents.join(', ') || 'Not specified'}

Generate questions:`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return this.parseJSON<ClarificationQuestion[]>(response, []);
  }

  async optimizeForAgent(skillContent: string, agentId: string): Promise<string> {
    const constraints = this.getAgentConstraints(agentId);

    const systemPrompt = `Optimize this skill for ${agentId}. Preserve core functionality while adapting to agent constraints. Return ONLY the optimized content.`;

    const userPrompt = `Agent: ${agentId}
Constraints: ${JSON.stringify(constraints)}

Skill:
${skillContent}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async search(query: string, skills: SearchableSkill[]): Promise<SearchResult[]> {
    if (skills.length === 0) return [];

    const skillsList = skills
      .map((s, i) => `${i + 1}. ${s.name}${s.description ? ` - ${s.description}` : ''}`)
      .join('\n');

    const prompt = `Find relevant skills for: "${query}"\n\nSkills:\n${skillsList}\n\nReturn JSON array: [{"index": N, "relevance": 0-1, "reasoning": "why"}]`;
    const response = await this.chat([{ role: 'user', content: prompt }]);

    try {
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as Array<{ index: number; relevance: number; reasoning: string }>;
        return parsed
          .filter((item) => Number.isInteger(item.index) && item.index >= 1 && item.index <= skills.length)
          .map((item) => ({
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
        if (typeof parsed.name !== 'string' || typeof parsed.description !== 'string' || typeof parsed.content !== 'string') {
          throw new Error('Missing required fields: name, description, content');
        }
        return {
          name: parsed.name,
          description: parsed.description,
          content: parsed.content,
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
          reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
        };
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('required fields')) throw e;
    }
    throw new Error('Failed to parse skill generation response');
  }

  private async makeRequest(messages: MiniMaxMessage[]): Promise<MiniMaxResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MiniMax API error: ${response.status} - ${error}`);
      }

      return response.json() as Promise<MiniMaxResponse>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildGenerationSystemPrompt(): string {
    return `You are an expert AI skill designer. Create high-quality SKILL.md files.

Output JSON:
{
  "name": "kebab-case-name",
  "description": "One-line description",
  "content": "Full SKILL.md markdown",
  "tags": ["tag1", "tag2"],
  "confidence": 0.0-1.0,
  "reasoning": "Design rationale"
}`;
  }

  private buildGenerationUserPrompt(context: GenerationContext): string {
    let prompt = `Create skill: ${context.expertise}\n\n`;

    if (context.contextChunks.length > 0) {
      prompt += '## Context\n';
      for (const chunk of context.contextChunks) {
        prompt += `[${chunk.source}] ${chunk.content.slice(0, 500)}\n\n`;
      }
    }

    if (context.clarifications.length > 0) {
      prompt += '## Clarifications\n';
      for (const c of context.clarifications) {
        prompt += `- ${c.questionId}: ${c.answer}\n`;
      }
    }

    if (context.targetAgents.length > 0) {
      prompt += `\nTargets: ${context.targetAgents.join(', ')}\n`;
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
