export interface AIProvider {
  name: string;
  search(query: string, skills: SearchableSkill[]): Promise<AISearchResult[]>;
  generateSkill(example: SkillExample): Promise<GeneratedSkill>;
}

export interface SearchableSkill {
  name: string;
  description?: string;
  content: string;
  tags?: string[];
  source?: string;
}

export interface AISearchResult {
  skill: SearchableSkill;
  relevance: number;
  reasoning: string;
}

export interface SkillExample {
  description: string;
  context?: string;
  codeExamples?: string[];
  expectedBehavior?: string;
  targetAgent?: string;
}

export interface GeneratedSkill {
  name: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
  reasoning: string;
}

export interface AIConfig {
  provider: 'anthropic' | 'openai' | 'none';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AISearchOptions {
  limit?: number;
  minRelevance?: number;
  includeReasoning?: boolean;
}

export interface AIGenerateOptions {
  targetAgent?: string;
  includeTests?: boolean;
  includeDocumentation?: boolean;
}
