import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { SessionTimeline } from '@skillkit/core';
import type { TimelineEventType } from '@skillkit/core';

export class TimelineCommand extends Command {
  static override paths = [['timeline']];

  static override usage = Command.Usage({
    description: 'Show unified session event timeline',
    examples: [
      ['Show last 50 events', '$0 timeline'],
      ['Filter by type', '$0 timeline --type git_commit'],
      ['Filter by skill', '$0 timeline --skill code-simplifier'],
      ['Date filter', '$0 timeline --since 2026-02-10'],
      ['JSON output with limit', '$0 timeline --limit 20 --json'],
    ],
  });

  type = Option.String('--type,-t', {
    description: 'Filter by event type (skill_start, skill_complete, task_progress, git_commit, observation, decision, snapshot)',
  });

  skill = Option.String('--skill,-s', {
    description: 'Filter by skill name',
  });

  since = Option.String('--since', {
    description: 'Show events since date (YYYY-MM-DD)',
  });

  limit = Option.String('--limit,-l', {
    description: 'Max events to show (default: 50)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const timeline = new SessionTimeline(projectPath);

    const parsed = this.limit ? parseInt(this.limit, 10) : 50;
    const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 50;

    const validTypes: TimelineEventType[] = [
      'skill_start', 'skill_complete', 'task_progress',
      'git_commit', 'observation', 'decision', 'snapshot',
    ];

    let types: TimelineEventType[] | undefined;
    if (this.type) {
      if (!validTypes.includes(this.type as TimelineEventType)) {
        console.log(chalk.red(`Invalid event type: ${this.type}`));
        console.log(chalk.dim(`Valid types: ${validTypes.join(', ')}`));
        return 1;
      }
      types = [this.type as TimelineEventType];
    }

    const data = timeline.build({
      since: this.since,
      types,
      limit,
      skillFilter: this.skill,
    });

    if (this.json) {
      console.log(timeline.formatJson(data));
      return 0;
    }

    if (data.events.length === 0) {
      console.log(chalk.yellow('No timeline events found.'));
      console.log(chalk.dim('Events are recorded during skill execution, git commits, and observations.'));
      return 0;
    }

    console.log(timeline.formatText(data));
    return 0;
  }
}
