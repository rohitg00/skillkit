import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { ActivityLog } from '@skillkit/core';

export class ActivityCommand extends Command {
  static override paths = [['activity']];

  static override usage = Command.Usage({
    description: 'Show skill activity log for git commits',
    examples: [
      ['Show recent activity', '$0 activity'],
      ['Filter by skill', '$0 activity --skill code-simplifier'],
      ['JSON output', '$0 activity --json'],
    ],
  });

  skill = Option.String('--skill,-s', {
    description: 'Filter by skill name',
  });

  limit = Option.String('--limit,-l', {
    description: 'Number of entries to show (default: 10)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const log = new ActivityLog(projectPath);
    const parsed = this.limit ? parseInt(this.limit, 10) : 10;
    const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;

    const activities = this.skill
      ? log.getBySkill(this.skill)
      : log.getRecent(limit);

    if (this.json) {
      console.log(JSON.stringify(activities.slice(0, limit), null, 2));
      return 0;
    }

    if (activities.length === 0) {
      console.log(chalk.yellow('No activity recorded'));
      console.log(
        chalk.dim(
          'Activity is recorded when skills are active during git commits.'
        )
      );
      return 0;
    }

    console.log(chalk.cyan('  Recent Skill Activity\n'));

    const displayed = activities.slice(0, limit);

    for (const activity of displayed) {
      const shortSha = activity.commitSha.slice(0, 7);
      const skills = activity.activeSkills.join(', ');
      const files = activity.filesChanged.join(', ');
      const ago = formatTimeAgo(activity.committedAt);

      console.log(`    ${chalk.bold(shortSha)}  ${activity.message}`);
      console.log(`             Skills: ${chalk.green(skills)}`);
      console.log(
        `             Files: ${files} ${chalk.dim(`(${ago})`)}`
      );
      console.log();
    }

    const topSkills = log.getMostUsedSkills().slice(0, 5);
    if (topSkills.length > 0) {
      const formatted = topSkills
        .map((s) => `${s.skill} (${s.count})`)
        .join(', ');
      console.log(`  Top Skills: ${formatted}`);
    }

    return 0;
  }
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
