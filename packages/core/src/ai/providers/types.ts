import type { SearchableSkill, GeneratedSkill, SkillExample } from '../types.js';

export type ProviderName = 'anthropic' | 'openai' | 'google' | 'ollama' | 'openrouter' | 'mock';

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationContext {
  expertise: string;
  contextChunks: ContextChunk[];
  clarifications: ClarificationAnswer[];
  targetAgents: string[];
  composedFrom?: string[];
  memoryPatterns?: MemoryPattern[];
}

export interface ContextChunk {
  source: 'docs' | 'codebase' | 'skills' | 'memory';
  content: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  options?: string[];
  type: 'text' | 'select' | 'confirm' | 'multiselect';
  context?: string;
}

export interface ClarificationAnswer {
  questionId: string;
  answer: string | string[] | boolean;
}

export interface MemoryPattern {
  category: string;
  pattern: string;
  confidence: number;
}

export interface GeneratedSkillResult extends GeneratedSkill {
  composedFrom?: string[];
  agentVariants?: Record<string, string>;
}

export interface WizardContext {
  expertise: string;
  contextSources: ContextSourceConfig[];
  composableSkills?: ComposableSkill[];
  clarifications: ClarificationAnswer[];
  targetAgents: string[];
  memoryPersonalization: boolean;
  gatheredContext?: ContextChunk[];
}

export interface ContextSourceConfig {
  name: 'docs' | 'codebase' | 'skills' | 'memory';
  enabled: boolean;
  weight?: number;
}

export interface ComposableSkill {
  name: string;
  description?: string;
  content: string;
  trustScore: number;
  relevance: number;
  source?: string;
}

export interface LLMProvider {
  readonly name: ProviderName;
  readonly displayName: string;

  generateSkill(context: GenerationContext): Promise<GeneratedSkillResult>;

  generateClarifications(context: WizardContext): Promise<ClarificationQuestion[]>;

  optimizeForAgent(skillContent: string, agentId: string): Promise<string>;

  search(query: string, skills: SearchableSkill[]): Promise<SearchResult[]>;

  generateFromExample(example: SkillExample): Promise<GeneratedSkill>;

  chat(messages: ChatMessage[]): Promise<string>;

  isConfigured(): boolean;
}

export interface SearchResult {
  skill: SearchableSkill;
  relevance: number;
  reasoning: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderCapabilities {
  maxContextLength: number;
  supportsStreaming: boolean;
  supportsJSON: boolean;
  supportsFunctionCalling: boolean;
}
