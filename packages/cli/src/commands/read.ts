import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { findSkill, readSkillContent } from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';

export class ReadCommand extends Command {
  static override paths = [['read'], ['r']];

  static override usage = Command.Usage({
    description: 'Read skill content for AI agent consumption',
    examples: [
      ['Read a single skill', '$0 read pdf'],
      ['Read multiple skills', '$0 read pdf,xlsx,docx'],
      ['Read with verbose output', '$0 read pdf --verbose'],
    ],
  });

  skills = Option.String({ required: true });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show additional information',
  });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();

    const skillNames = this.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (skillNames.length === 0) {
      console.error(chalk.red('No skill names provided'));
      return 1;
    }

    let exitCode = 0;

    for (const skillName of skillNames) {
      const skill = findSkill(skillName, searchDirs);

      if (!skill) {
        console.error(chalk.red(`Skill not found: ${skillName}`));
        console.error(chalk.dim('Available directories:'));
        searchDirs.forEach(d => console.error(chalk.dim(`  - ${d}`)));
        exitCode = 1;
        continue;
      }

      if (!skill.enabled) {
        console.error(chalk.yellow(`Skill disabled: ${skillName}`));
        console.error(chalk.dim('Enable with: skillkit enable ' + skillName));
        exitCode = 1;
        continue;
      }

      const content = readSkillContent(skill.path);

      if (!content) {
        console.error(chalk.red(`Could not read SKILL.md for: ${skillName}`));
        exitCode = 1;
        continue;
      }

      console.log(`Reading: ${skillName}`);
      console.log(`Base directory: ${skill.path}`);
      console.log();
      console.log(content);
      console.log();
      console.log(`Skill read: ${skillName}`);

      if (skillNames.length > 1 && skillName !== skillNames[skillNames.length - 1]) {
        console.log('\n---\n');
      }
    }

    return exitCode;
  }
}
