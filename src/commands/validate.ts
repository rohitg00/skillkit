import { existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { validateSkill } from '../core/skills.js';

export class ValidateCommand extends Command {
  static override paths = [['validate'], ['v']];

  static override usage = Command.Usage({
    description: 'Validate skill(s) against the Agent Skills specification (agenstskills.com)',
    examples: [
      ['Validate a skill directory', '$0 validate ./my-skill'],
      ['Validate all skills in a directory', '$0 validate ./skills --all'],
    ],
  });

  skillPath = Option.String({ required: true });

  all = Option.Boolean('--all,-a', false, {
    description: 'Validate all skills in the directory',
  });

  async execute(): Promise<number> {
    const targetPath = this.skillPath;

    if (!existsSync(targetPath)) {
      console.error(chalk.red(`Path does not exist: ${targetPath}`));
      return 1;
    }

    const skillPaths: string[] = [];

    if (this.all) {
      const entries = readdirSync(targetPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = join(targetPath, entry.name);
          if (existsSync(join(skillPath, 'SKILL.md'))) {
            skillPaths.push(skillPath);
          }
        }
      }

      if (skillPaths.length === 0) {
        console.error(chalk.yellow('No skills found in directory'));
        return 1;
      }
    } else {
      skillPaths.push(targetPath);
    }

    let hasErrors = false;

    for (const skillPath of skillPaths) {
      const skillName = basename(skillPath);
      const result = validateSkill(skillPath);

      if (result.valid) {
        console.log(chalk.green(`✓ ${skillName}`));

        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(w => {
            console.log(chalk.yellow(`  ⚠ ${w}`));
          });
        }
      } else {
        console.log(chalk.red(`✗ ${skillName}`));
        result.errors.forEach(e => {
          console.log(chalk.red(`  • ${e}`));
        });
        hasErrors = true;
      }
    }

    console.log();

    if (hasErrors) {
      console.log(chalk.red('Validation failed'));
      console.log(chalk.dim('See https://agenstskills.com for the complete format'));
      return 1;
    }

    console.log(chalk.green(`Validated ${skillPaths.length} skill(s) successfully`));
    return 0;
  }
}
