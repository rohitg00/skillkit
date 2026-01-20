import { existsSync, rmSync } from 'node:fs';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { getSearchDirs } from '../core/config.js';
import { findSkill } from '../core/skills.js';

export class RemoveCommand extends Command {
  static override paths = [['remove'], ['rm'], ['uninstall']];

  static override usage = Command.Usage({
    description: 'Remove installed skills',
    examples: [
      ['Remove a skill', '$0 remove pdf'],
      ['Remove multiple skills', '$0 remove pdf xlsx docx'],
      ['Force removal without confirmation', '$0 remove pdf --force'],
    ],
  });

  skills = Option.Rest({ required: 1 });

  force = Option.Boolean('--force,-f', false, {
    description: 'Skip confirmation',
  });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    let removed = 0;
    let failed = 0;

    for (const skillName of this.skills) {
      const skill = findSkill(skillName, searchDirs);

      if (!skill) {
        console.log(chalk.yellow(`Skill not found: ${skillName}`));
        continue;
      }

      if (!existsSync(skill.path)) {
        console.log(chalk.yellow(`Path not found: ${skill.path}`));
        continue;
      }

      try {
        rmSync(skill.path, { recursive: true, force: true });
        console.log(chalk.green(`Removed: ${skillName}`));
        removed++;
      } catch (error) {
        console.log(chalk.red(`Failed to remove: ${skillName}`));
        console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
        failed++;
      }
    }

    if (removed > 0) {
      console.log(chalk.dim('\nRun `skillkit sync` to update your agent config'));
    }

    return failed > 0 ? 1 : 0;
  }
}
