import type {
  AIProvider,
  AIGenerateOptions,
  GeneratedSkill,
  SkillExample,
} from './types.js';

export class AISkillGenerator {
  constructor(private provider: AIProvider) {}

  async generate(
    example: SkillExample,
    options: AIGenerateOptions = {}
  ): Promise<GeneratedSkill> {
    const skill = await this.provider.generateSkill(example);

    if (options.targetAgent && skill.content) {
      skill.content = this.addAgentMetadata(skill.content, options.targetAgent);
    }

    return skill;
  }

  async generateFromCode(
    code: string,
    description: string,
    options: AIGenerateOptions = {}
  ): Promise<GeneratedSkill> {
    return this.generate(
      {
        description,
        codeExamples: [code],
      },
      options
    );
  }

  async generateFromTemplate(
    templateName: string,
    variables: Record<string, string>,
    options: AIGenerateOptions = {}
  ): Promise<GeneratedSkill> {
    return this.generate(
      {
        description: `Create a skill based on the ${templateName} template with the following customization: ${JSON.stringify(variables)}`,
        context: `Template: ${templateName}`,
      },
      options
    );
  }

  private addAgentMetadata(content: string, agent: string): string {
    const metadata = `---
agent: ${agent}
generated: ${new Date().toISOString()}
---

${content}`;
    return metadata;
  }

  validateGenerated(skill: GeneratedSkill): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!skill.name || skill.name.length < 3) {
      errors.push('Skill name must be at least 3 characters');
    }

    if (!skill.description || skill.description.length < 10) {
      errors.push('Skill description must be at least 10 characters');
    }

    if (!skill.content || skill.content.length < 50) {
      errors.push('Skill content must be at least 50 characters');
    }

    if (skill.confidence < 0.6) {
      errors.push('Skill confidence is too low (< 0.6)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
