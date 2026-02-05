import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import {
  type SearchableSkill,
  type SkillExample,
  AIManager,
  loadIndex as loadIndexFromCache,
  detectProviders,
  getDefaultProvider,
} from '@skillkit/core';

export class AICommand extends Command {
  static override paths = [['ai']];

  static override usage = Command.Usage({
    description: 'AI-powered skill search and generation',
    details: `
      The ai command provides AI-powered features for skills:

      - Natural language search: Find skills using conversational queries
      - Skill generation: Automatically generate skills from examples
      - Similar skills: Find skills similar to a given skill

      Note: Without an API key, the command uses a basic mock AI provider.
      Set ANTHROPIC_API_KEY or OPENAI_API_KEY to use real AI features.
    `,
    examples: [
      ['Search skills naturally', '$0 ai search "help me write better tests"'],
      ['Generate skill from description', '$0 ai generate --description "skill for code review"'],
      ['Generate from code example', '$0 ai generate --from-code example.ts --description "..."'],
      ['Find similar skills', '$0 ai similar my-skill-name'],
    ],
  });

  // Subcommand
  subcommand = Option.String({ required: true });

  // Search options
  query = Option.String('--query,-q', {
    description: 'Search query for natural language search',
  });

  // Generation options
  description = Option.String('--description,-d', {
    description: 'Description of the skill to generate',
  });

  fromCode = Option.String('--from-code', {
    description: 'Generate skill from code example file',
  });

  additionalContext = Option.String('--context', {
    description: 'Additional context for generation',
  });

  targetAgent = Option.String('--agent,-a', {
    description: 'Target agent for generated skill',
  });

  // Similar skills option
  skillName = Option.String({ required: false });

  // Common options
  limit = Option.String('--limit,-l', {
    description: 'Maximum number of results',
  });

  minRelevance = Option.String('--min-relevance', {
    description: 'Minimum relevance score (0-1)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  output = Option.String('--output,-o', {
    description: 'Output file for generated skill',
  });

  async execute(): Promise<number> {
    const aiConfig = this.getAIConfig();
    const manager = new AIManager(aiConfig);

    if (!this.json) {
      const providerName = manager.getProviderName();
      if (providerName === 'mock') {
        console.log(
          chalk.yellow(
            '⚠ Using mock AI provider (limited functionality)\n' +
              '  Set ANTHROPIC_API_KEY or OPENAI_API_KEY for real AI features\n'
          )
        );
      }
    }

    switch (this.subcommand) {
      case 'search':
        return await this.handleSearch(manager);
      case 'generate':
      case 'gen':
        return await this.handleGenerate(manager);
      case 'similar':
        return await this.handleSimilar(manager);
      case 'wizard':
        return await this.handleWizard();
      case 'providers':
        return this.handleProviders();
      default:
        console.error(
          chalk.red(`Unknown subcommand: ${this.subcommand}\n`)
        );
        console.log('Valid subcommands: search, generate, similar, wizard, providers');
        return 1;
    }
  }

  private async handleSearch(manager: AIManager): Promise<number> {
    const query = this.query || this.skillName;
    if (!query) {
      console.error(chalk.red('Search query required (--query or positional argument)'));
      return 1;
    }

    const skills = await this.loadSkills();
    if (skills.length === 0) {
      console.log(
        chalk.yellow('No skills found. Run "skillkit recommend --update" first.')
      );
      return 0;
    }

    const spinner = ora('Searching with AI...').start();

    try {
      const results = await manager.searchSkills(query, skills, {
        limit: this.limit ? parseInt(this.limit, 10) : 10,
        minRelevance: this.minRelevance
          ? parseFloat(this.minRelevance)
          : 0.5,
        includeReasoning: !this.json,
      });

      spinner.stop();

      if (this.json) {
        console.log(JSON.stringify(results, null, 2));
        return 0;
      }

      if (results.length === 0) {
        console.log(chalk.yellow(`No skills found matching "${query}"`));
        return 0;
      }

      console.log(chalk.cyan(`\nAI Search Results (${results.length} found):\n`));

      for (const result of results) {
        const score = Math.round(result.relevance * 100);
        const scoreColor =
          score >= 70 ? chalk.green : score >= 50 ? chalk.yellow : chalk.dim;

        console.log(
          `  ${scoreColor(`${score}%`)} ${chalk.bold(result.skill.name)}`
        );

        if (result.skill.description) {
          console.log(`      ${chalk.dim(result.skill.description)}`);
        }

        if (result.reasoning) {
          console.log(`      ${chalk.dim('→ ' + result.reasoning)}`);
        }

        console.log();
      }

      return 0;
    } catch (error) {
      spinner.fail('Search failed');
      console.error(
        chalk.red(error instanceof Error ? error.message : String(error))
      );
      return 1;
    }
  }

  private async handleGenerate(manager: AIManager): Promise<number> {
    const description = this.description;
    if (!description) {
      console.error(chalk.red('Description required (--description)'));
      return 1;
    }

    let codeExamples: string[] = [];
    if (this.fromCode) {
      const codePath = resolve(this.fromCode);
      try {
        const code = await fs.readFile(codePath, 'utf-8');
        codeExamples = [code];
      } catch {
        console.error(chalk.red(`Failed to read code file: ${codePath}`));
        return 1;
      }
    }

    const example: SkillExample = {
      description,
      context: this.additionalContext,
      codeExamples,
      targetAgent: this.targetAgent,
    };

    const spinner = ora('Generating skill with AI...').start();

    try {
      const generated = await manager.generateSkill(example, {
        targetAgent: this.targetAgent,
        includeTests: true,
        includeDocumentation: true,
      });

      spinner.stop();

      const validation = manager.validateGenerated(generated);
      if (!validation.valid) {
        console.log(chalk.yellow('\n⚠ Generated skill has validation warnings:'));
        for (const error of validation.errors) {
          console.log(chalk.dim(`  • ${error}`));
        }
        console.log();
      }

      if (this.json) {
        console.log(JSON.stringify(generated, null, 2));
        return 0;
      }

      console.log(chalk.green('\n✓ Generated skill successfully\n'));
      console.log(chalk.cyan('Name:') + ` ${generated.name}`);
      console.log(chalk.cyan('Description:') + ` ${generated.description}`);
      console.log(
        chalk.cyan('Tags:') + ` ${generated.tags.join(', ')}`
      );
      console.log(
        chalk.cyan('Confidence:') +
          ` ${Math.round(generated.confidence * 100)}%`
      );

      if (generated.reasoning) {
        console.log(chalk.cyan('Reasoning:') + ` ${generated.reasoning}`);
      }

      console.log('\n' + chalk.dim('Content:'));
      console.log(chalk.dim('─'.repeat(60)));
      console.log(generated.content);
      console.log(chalk.dim('─'.repeat(60)));

      if (this.output) {
        const outputPath = resolve(this.output);
        await fs.writeFile(outputPath, generated.content, 'utf-8');
        console.log(chalk.green(`\n✓ Saved to: ${outputPath}`));
      } else {
        console.log(
          chalk.dim('\nSave with: --output <filename>')
        );
      }

      return 0;
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(
        chalk.red(error instanceof Error ? error.message : String(error))
      );
      return 1;
    }
  }

  private async handleSimilar(manager: AIManager): Promise<number> {
    const skillName = this.skillName;
    if (!skillName) {
      console.error(chalk.red('Skill name required'));
      return 1;
    }

    const skills = await this.loadSkills();
    if (skills.length === 0) {
      console.log(
        chalk.yellow('No skills found. Run "skillkit recommend --update" first.')
      );
      return 0;
    }

    const targetSkill = skills.find(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );

    if (!targetSkill) {
      console.error(chalk.red(`Skill not found: ${skillName}`));
      return 1;
    }

    const spinner = ora('Finding similar skills...').start();

    try {
      const results = await manager.findSimilar(targetSkill, skills, {
        limit: this.limit ? parseInt(this.limit, 10) : 10,
        minRelevance: this.minRelevance
          ? parseFloat(this.minRelevance)
          : 0.5,
        includeReasoning: !this.json,
      });

      spinner.stop();

      if (this.json) {
        console.log(JSON.stringify(results, null, 2));
        return 0;
      }

      if (results.length === 0) {
        console.log(
          chalk.yellow(`No similar skills found for "${skillName}"`)
        );
        return 0;
      }

      console.log(
        chalk.cyan(`\nSkills similar to "${skillName}" (${results.length} found):\n`)
      );

      for (const result of results) {
        const score = Math.round(result.relevance * 100);
        const scoreColor =
          score >= 70 ? chalk.green : score >= 50 ? chalk.yellow : chalk.dim;

        console.log(
          `  ${scoreColor(`${score}%`)} ${chalk.bold(result.skill.name)}`
        );

        if (result.skill.description) {
          console.log(`      ${chalk.dim(result.skill.description)}`);
        }

        if (result.reasoning) {
          console.log(`      ${chalk.dim('→ ' + result.reasoning)}`);
        }

        console.log();
      }

      return 0;
    } catch (error) {
      spinner.fail('Search failed');
      console.error(
        chalk.red(error instanceof Error ? error.message : String(error))
      );
      return 1;
    }
  }

  private async loadSkills(): Promise<SearchableSkill[]> {
    const index = loadIndexFromCache();
    if (!index) {
      return [];
    }

    return index.skills.map((s) => ({
      name: s.name,
      description: s.description,
      content: '',
      tags: s.tags,
      source: s.source,
    }));
  }

  private async handleWizard(): Promise<number> {
    console.log(chalk.cyan('\nLaunching Smart Generate Wizard...\n'));
    console.log(chalk.dim('For the full wizard experience, use: skillkit generate\n'));

    const { GenerateCommand } = await import('./generate.js');
    const generateCmd = new GenerateCommand();
    return generateCmd.execute();
  }

  private handleProviders(): number {
    const detected = detectProviders();
    const defaultProvider = getDefaultProvider();

    console.log(chalk.cyan('\nAvailable LLM Providers:\n'));

    for (const provider of detected) {
      const isDefault = provider.provider === defaultProvider;
      const status = provider.configured
        ? chalk.green('✓ Configured')
        : chalk.dim('○ Not configured');
      const defaultBadge = isDefault ? chalk.yellow(' (default)') : '';

      console.log(`  ${provider.displayName}${defaultBadge}`);
      console.log(`    ${status}`);
      if (provider.envVar) {
        console.log(`    ${chalk.dim(`Set ${provider.envVar} to configure`)}`);
      }
      console.log();
    }

    console.log(chalk.dim('Use "skillkit generate --provider <name>" to use a specific provider\n'));

    return 0;
  }

  private getAIConfig() {
    const provider = process.env.ANTHROPIC_API_KEY
      ? ('anthropic' as const)
      : process.env.OPENAI_API_KEY
        ? ('openai' as const)
        : process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY
          ? ('google' as const)
          : process.env.OPENROUTER_API_KEY
            ? ('openrouter' as const)
            : process.env.OLLAMA_HOST
              ? ('ollama' as const)
              : ('none' as const);

    const apiKey =
      provider === 'anthropic'
        ? process.env.ANTHROPIC_API_KEY
        : provider === 'openai'
          ? process.env.OPENAI_API_KEY
          : provider === 'google'
            ? (process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY)
            : provider === 'openrouter'
              ? process.env.OPENROUTER_API_KEY
              : undefined;

    return {
      provider,
      apiKey,
      model: provider === 'anthropic' ? 'claude-sonnet-4-20250514' : undefined,
      maxTokens: 4096,
      temperature: 0.7,
    };
  }
}
