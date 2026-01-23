import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';

export class CreateCommand extends Command {
  static override paths = [['create'], ['new']];

  static override usage = Command.Usage({
    description: 'Create a new skill with proper structure',
    examples: [
      ['Create a new skill', '$0 create my-skill'],
      ['Create with all optional directories', '$0 create my-skill --full'],
      ['Create with scripts directory', '$0 create my-skill --scripts'],
    ],
  });

  name = Option.String({ required: true, name: 'skill-name' });

  full = Option.Boolean('--full,-f', false, {
    description: 'Include all optional directories (references, scripts, assets)',
  });

  scripts = Option.Boolean('--scripts', false, {
    description: 'Include scripts directory',
  });

  references = Option.Boolean('--references', false, {
    description: 'Include references directory',
  });

  assets = Option.Boolean('--assets', false, {
    description: 'Include assets directory',
  });

  directory = Option.String('--dir,-d', {
    description: 'Parent directory to create skill in (default: current directory)',
  });

  async execute(): Promise<number> {
    const skillName = this.name.toLowerCase();

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skillName)) {
      console.error(chalk.red('Invalid skill name'));
      console.error(chalk.dim('Must be lowercase alphanumeric with hyphens (e.g., my-skill)'));
      return 1;
    }

    const parentDir = this.directory || process.cwd();
    const skillDir = join(parentDir, skillName);

    if (existsSync(skillDir)) {
      console.error(chalk.red(`Directory already exists: ${skillDir}`));
      return 1;
    }

    try {
      mkdirSync(skillDir, { recursive: true });

      const skillMd = generateSkillMd(skillName);
      writeFileSync(join(skillDir, 'SKILL.md'), skillMd);

      if (this.full || this.references) {
        const refsDir = join(skillDir, 'references');
        mkdirSync(refsDir);
        writeFileSync(join(refsDir, '.gitkeep'), '');
      }

      if (this.full || this.scripts) {
        const scriptsDir = join(skillDir, 'scripts');
        mkdirSync(scriptsDir);
        writeFileSync(join(scriptsDir, '.gitkeep'), '');
      }

      if (this.full || this.assets) {
        const assetsDir = join(skillDir, 'assets');
        mkdirSync(assetsDir);
        writeFileSync(join(assetsDir, '.gitkeep'), '');
      }

      console.log(chalk.green(`Created skill: ${skillName}`));
      console.log();
      console.log(chalk.dim('Structure:'));
      console.log(chalk.dim(`  ${skillDir}/`));
      console.log(chalk.dim('  ├── SKILL.md'));
      if (this.full || this.references) console.log(chalk.dim('  ├── references/'));
      if (this.full || this.scripts) console.log(chalk.dim('  ├── scripts/'));
      if (this.full || this.assets) console.log(chalk.dim('  └── assets/'));
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.dim('  1. Edit SKILL.md with your instructions'));
      console.log(chalk.dim('  2. Validate: skillkit validate ' + skillDir));
      console.log(chalk.dim('  3. Test: skillkit read ' + skillName));

      return 0;
    } catch (error) {
      console.error(chalk.red('Failed to create skill'));
      console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }
}

function generateSkillMd(name: string): string {
  const title = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `---
name: ${name}
description: Describe what this skill does and when to use it. Include trigger keywords.
---

# ${title}

Instructions for the AI agent on how to use this skill.

## When to Use

- Scenario 1
- Scenario 2

## Steps

1. First step
2. Second step
3. Third step
`;
}
