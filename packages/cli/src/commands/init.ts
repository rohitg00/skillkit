import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import type { AgentType } from '@skillkit/core';
import { detectAgent, getAdapter, getAllAdapters } from '@skillkit/agents';
import { initProject } from '../helpers.js';

export class InitCommand extends Command {
  static override paths = [['init']];

  static override usage = Command.Usage({
    description: 'Initialize skillkit in a project',
    examples: [
      ['Auto-detect agent and initialize', '$0 init'],
      ['Initialize for specific agent', '$0 init --agent cursor'],
      ['List supported agents', '$0 init --list'],
    ],
  });

  agent = Option.String('--agent,-a', {
    description: 'Target agent type',
  });

  list = Option.Boolean('--list,-l', false, {
    description: 'List supported agents',
  });

  async execute(): Promise<number> {
    if (this.list) {
      console.log(chalk.cyan('Supported agents:\n'));
      const adapters = getAllAdapters();

      for (const adapter of adapters) {
        console.log(`  ${chalk.green(adapter.type)}`);
        console.log(`    Name: ${adapter.name}`);
        console.log(`    Skills dir: ${adapter.skillsDir}`);
        console.log(`    Config file: ${adapter.configFile}`);
        console.log();
      }

      return 0;
    }

    try {
      let agentType: AgentType;

      if (this.agent) {
        agentType = this.agent as AgentType;
      } else {
        console.log(chalk.dim('Auto-detecting agent...'));
        agentType = await detectAgent();
      }

      const adapter = getAdapter(agentType);

      console.log(chalk.cyan(`Initializing for ${adapter.name}...`));

      await initProject(agentType);

      console.log();
      console.log(chalk.green('Initialized successfully!'));
      console.log();
      console.log(chalk.dim('Created:'));
      console.log(chalk.dim(`  - ${adapter.skillsDir}/ (skills directory)`));
      console.log(chalk.dim(`  - skillkit.yaml (config file)`));
      console.log(chalk.dim(`  - ${adapter.configFile} (agent config)`));
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.dim('  1. Install skills: skillkit install owner/repo'));
      console.log(chalk.dim('  2. Sync config: skillkit sync'));
      console.log(chalk.dim('  3. Use skills: skillkit read <skill-name>'));

      // Check if SKILL.md exists and offer to publish
      await this.checkAndPromptPublish();

      return 0;
    } catch (error) {
      console.error(chalk.red('Initialization failed'));
      console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }

  private async checkAndPromptPublish(): Promise<void> {
    // Skip in non-interactive environments (CI, piped input, etc.)
    if (!process.stdin.isTTY) return;

    const skillMdLocations = [
      join(process.cwd(), 'SKILL.md'),
      join(process.cwd(), 'skills', 'SKILL.md'),
      join(process.cwd(), '.claude', 'skills', 'SKILL.md'),
      join(process.cwd(), '.cursor', 'skills', 'SKILL.md'),
    ];

    const foundSkillMd = skillMdLocations.find(loc => existsSync(loc));
    if (!foundSkillMd) return;

    console.log();
    console.log(chalk.yellow('Found SKILL.md in your project!'));
    console.log(chalk.dim('Would you like to publish it to the SkillKit marketplace?'));
    console.log();

    const answer = await this.prompt('Publish skill? [y/N]: ');

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log();
      console.log(chalk.cyan('To publish your skill, run:'));
      console.log(chalk.white(`  skillkit publish ${foundSkillMd}`));
      console.log();
    }
  }

  private prompt(question: string): Promise<string> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
}
