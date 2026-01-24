import type {
  AIConfig,
  AIProvider,
  AISearchOptions,
  AISearchResult,
  AIGenerateOptions,
  GeneratedSkill,
  SearchableSkill,
  SkillExample,
} from './types.js';
import { AISearch } from './search.js';
import { AISkillGenerator } from './generator.js';
import { MockAIProvider } from './providers/mock.js';

export class AIManager {
  private provider: AIProvider;
  private search: AISearch;
  private generator: AISkillGenerator;

  constructor(private config: AIConfig) {
    this.provider = this.createProvider();
    this.search = new AISearch(this.provider);
    this.generator = new AISkillGenerator(this.provider);
  }

  async searchSkills(
    query: string,
    skills: SearchableSkill[],
    options?: AISearchOptions
  ): Promise<AISearchResult[]> {
    return this.search.search(query, skills, options);
  }

  async searchByIntent(
    intent: string,
    skills: SearchableSkill[],
    options?: AISearchOptions
  ): Promise<AISearchResult[]> {
    return this.search.searchByIntent(intent, skills, options);
  }

  async findSimilar(
    skill: SearchableSkill,
    allSkills: SearchableSkill[],
    options?: AISearchOptions
  ): Promise<AISearchResult[]> {
    return this.search.findSimilar(skill, allSkills, options);
  }

  async generateSkill(
    example: SkillExample,
    options?: AIGenerateOptions
  ): Promise<GeneratedSkill> {
    return this.generator.generate(example, options);
  }

  async generateFromCode(
    code: string,
    description: string,
    options?: AIGenerateOptions
  ): Promise<GeneratedSkill> {
    return this.generator.generateFromCode(code, description, options);
  }

  async generateFromTemplate(
    templateName: string,
    variables: Record<string, string>,
    options?: AIGenerateOptions
  ): Promise<GeneratedSkill> {
    return this.generator.generateFromTemplate(templateName, variables, options);
  }

  validateGenerated(skill: GeneratedSkill): {
    valid: boolean;
    errors: string[];
  } {
    return this.generator.validateGenerated(skill);
  }

  private createProvider(): AIProvider {
    if (this.config.provider === 'none' || !this.config.apiKey) {
      return new MockAIProvider();
    }

    switch (this.config.provider) {
      case 'anthropic':
      case 'openai':
        return new MockAIProvider();
      default:
        return new MockAIProvider();
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
    this.provider = this.createProvider();
    this.search = new AISearch(this.provider);
    this.generator = new AISkillGenerator(this.provider);
  }
}
