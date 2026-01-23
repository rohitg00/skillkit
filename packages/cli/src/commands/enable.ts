import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { setSkillEnabled, findSkill } from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';

export class EnableCommand extends Command {
  static override paths = [['enable']];

  static override usage = Command.Usage({
    description: 'Enable one or more skills',
    examples: [
      ['Enable a skill', '$0 enable pdf'],
      ['Enable multiple skills', '$0 enable pdf xlsx docx'],
    ],
  });

  skills = Option.Rest({ required: 1 });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    let success = 0;
    let failed = 0;

    for (const skillName of this.skills) {
      const skill = findSkill(skillName, searchDirs);

      if (!skill) {
        console.log(chalk.red(`Skill not found: ${skillName}`));
        failed++;
        continue;
      }

      if (skill.enabled) {
        console.log(chalk.dim(`Already enabled: ${skillName}`));
        continue;
      }

      const result = setSkillEnabled(skill.path, true);

      if (result) {
        console.log(chalk.green(`Enabled: ${skillName}`));
        success++;
      } else {
        console.log(chalk.red(`Failed to enable: ${skillName}`));
        failed++;
      }
    }

    if (success > 0) {
      console.log(chalk.dim('\nRun `skillkit sync` to update your agent config'));
    }

    return failed > 0 ? 1 : 0;
  }
}

export class DisableCommand extends Command {
  static override paths = [['disable']];

  static override usage = Command.Usage({
    description: 'Disable one or more skills',
    examples: [
      ['Disable a skill', '$0 disable pdf'],
      ['Disable multiple skills', '$0 disable pdf xlsx docx'],
    ],
  });

  skills = Option.Rest({ required: 1 });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    let success = 0;
    let failed = 0;

    for (const skillName of this.skills) {
      const skill = findSkill(skillName, searchDirs);

      if (!skill) {
        console.log(chalk.red(`Skill not found: ${skillName}`));
        failed++;
        continue;
      }

      if (!skill.enabled) {
        console.log(chalk.dim(`Already disabled: ${skillName}`));
        continue;
      }

      const result = setSkillEnabled(skill.path, false);

      if (result) {
        console.log(chalk.yellow(`Disabled: ${skillName}`));
        success++;
      } else {
        console.log(chalk.red(`Failed to disable: ${skillName}`));
        failed++;
      }
    }

    if (success > 0) {
      console.log(chalk.dim('\nRun `skillkit sync` to update your agent config'));
    }

    return failed > 0 ? 1 : 0;
  }
}
