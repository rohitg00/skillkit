import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { Command } from 'clipanion';
import { AgentsMdGenerator, AgentsMdParser } from '@skillkit/core';

export class AgentsMdCommand extends Command {
  static override paths = [['agents']];

  static override usage = Command.Usage({
    description: 'Manage AGENTS.md for project-specific agent context',
    details: `
      Sub-commands:
        agents init  - Generate initial AGENTS.md
        agents sync  - Update managed sections in existing AGENTS.md
        agents show  - Display current AGENTS.md content
    `,
    examples: [
      ['Generate AGENTS.md', '$0 agents init'],
      ['Update skills section', '$0 agents sync'],
      ['Show AGENTS.md', '$0 agents show'],
    ],
  });

  async execute(): Promise<number> {
    this.context.stdout.write(this.cli.usage(AgentsMdCommand, { detailed: true }));
    return 0;
  }
}

export class AgentsMdInitCommand extends Command {
  static override paths = [['agents', 'init']];

  static override usage = Command.Usage({
    description: 'Generate initial AGENTS.md in current directory',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const agentsPath = join(projectPath, 'AGENTS.md');

    if (existsSync(agentsPath)) {
      console.log(chalk.yellow('AGENTS.md already exists. Use `skillkit agents sync` to update.'));
      return 1;
    }

    try {
      const generator = new AgentsMdGenerator({ projectPath });
      const result = generator.generate();

      console.log(chalk.dim('Preview:'));
      console.log('');
      console.log(result.content);

      writeFileSync(agentsPath, result.content, 'utf-8');
      console.log(chalk.green(`Created ${agentsPath}`));
      return 0;
    } catch (err) {
      console.log(chalk.red(`Failed to generate AGENTS.md: ${err instanceof Error ? err.message : String(err)}`));
      return 1;
    }
  }
}

export class AgentsMdSyncCommand extends Command {
  static override paths = [['agents', 'sync']];

  static override usage = Command.Usage({
    description: 'Update managed sections in existing AGENTS.md',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const agentsPath = join(projectPath, 'AGENTS.md');

    if (!existsSync(agentsPath)) {
      console.log(chalk.yellow('No AGENTS.md found. Run `skillkit agents init` first.'));
      return 1;
    }

    try {
      const existing = readFileSync(agentsPath, 'utf-8');
      const parser = new AgentsMdParser();

      if (!parser.hasManagedSections(existing)) {
        console.log(chalk.yellow('No managed sections found in AGENTS.md. Nothing to update.'));
        return 0;
      }

      const generator = new AgentsMdGenerator({ projectPath });
      const result = generator.generate();
      const managedSections = result.sections.filter(s => s.managed);
      const updated = parser.updateManagedSections(existing, managedSections);

      writeFileSync(agentsPath, updated, 'utf-8');
      console.log(chalk.green(`Updated ${managedSections.length} managed section(s) in AGENTS.md`));
      return 0;
    } catch (err) {
      console.log(chalk.red(`Failed to sync AGENTS.md: ${err instanceof Error ? err.message : String(err)}`));
      return 1;
    }
  }
}

export class AgentsMdShowCommand extends Command {
  static override paths = [['agents', 'show']];

  static override usage = Command.Usage({
    description: 'Display current AGENTS.md content',
  });

  async execute(): Promise<number> {
    const agentsPath = join(process.cwd(), 'AGENTS.md');

    if (!existsSync(agentsPath)) {
      console.log(chalk.yellow('No AGENTS.md found. Run `skillkit agents init` to create one.'));
      return 1;
    }

    console.log(readFileSync(agentsPath, 'utf-8'));
    return 0;
  }
}
