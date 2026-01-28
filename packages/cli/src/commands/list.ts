import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { findAllSkills, evaluateSkillDirectory } from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';
import { formatQualityBadge, colors } from '../onboarding/index.js';

export class ListCommand extends Command {
  static override paths = [['list'], ['ls'], ['l']];

  static override usage = Command.Usage({
    description: 'List all installed skills',
    examples: [
      ['List all skills', '$0 list'],
      ['Show only enabled skills', '$0 list --enabled'],
      ['Show JSON output', '$0 list --json'],
    ],
  });

  enabled = Option.Boolean('--enabled,-e', false, {
    description: 'Show only enabled skills',
  });

  disabled = Option.Boolean('--disabled,-d', false, {
    description: 'Show only disabled skills',
  });

  quality = Option.Boolean('--quality,-q', false, {
    description: 'Show quality scores and grades',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    let skills = findAllSkills(searchDirs);

    if (this.enabled) {
      skills = skills.filter(s => s.enabled);
    } else if (this.disabled) {
      skills = skills.filter(s => !s.enabled);
    }

    skills.sort((a, b) => {
      if (a.location !== b.location) {
        return a.location === 'project' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    const skillsWithQuality = this.quality || this.json
      ? skills.map(s => {
          const quality = evaluateSkillDirectory(s.path);
          return {
            ...s,
            quality: quality?.overall ?? null,
          };
        })
      : skills.map(s => ({ ...s, quality: null as number | null }));

    if (this.json) {
      console.log(JSON.stringify(skillsWithQuality, null, 2));
      return 0;
    }

    if (skills.length === 0) {
      console.log(chalk.yellow('No skills installed'));
      console.log(chalk.dim('Install skills with: skillkit install <source>'));
      return 0;
    }

    console.log(chalk.cyan(`Installed skills (${skills.length}):\n`));

    const projectSkills = skillsWithQuality.filter(s => s.location === 'project');
    const globalSkills = skillsWithQuality.filter(s => s.location === 'global');

    if (projectSkills.length > 0) {
      console.log(chalk.blue('Project skills:'));
      for (const skill of projectSkills) {
        printSkill(skill, this.quality);
      }
      console.log();
    }

    if (globalSkills.length > 0) {
      console.log(chalk.dim('Global skills:'));
      for (const skill of globalSkills) {
        printSkill(skill, this.quality);
      }
      console.log();
    }

    const enabledCount = skills.filter(s => s.enabled).length;
    const disabledCount = skills.length - enabledCount;

    console.log(
      chalk.dim(
        `${projectSkills.length} project, ${globalSkills.length} global` +
          (disabledCount > 0 ? `, ${disabledCount} disabled` : '')
      )
    );

    if (this.quality) {
      const qualityScores = skillsWithQuality.filter(s => s.quality !== null).map(s => s.quality!);
      if (qualityScores.length > 0) {
        const avgQuality = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length);
        console.log(colors.muted(`Average quality: ${avgQuality}/100`));
      }
    }

    return 0;
  }
}

function printSkill(
  skill: { name: string; description: string; enabled: boolean; location: string; quality: number | null },
  showQuality = false
) {
  const status = skill.enabled ? chalk.green('✓') : chalk.red('○');
  const name = skill.enabled ? skill.name : chalk.dim(skill.name);
  const desc = chalk.dim(truncate(skill.description, 50));
  const qualityBadge = showQuality && skill.quality !== null ? ` ${formatQualityBadge(skill.quality)}` : '';

  console.log(`  ${status} ${name}${qualityBadge}`);
  if (skill.description) {
    console.log(`    ${desc}`);
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
