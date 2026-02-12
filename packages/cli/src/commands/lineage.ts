import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { SkillLineage } from '@skillkit/core';

export class LineageCommand extends Command {
  static override paths = [['lineage']];

  static override usage = Command.Usage({
    description: 'Show skill impact lineage — which skills produced which changes',
    examples: [
      ['Full overview', '$0 lineage'],
      ['Single skill', '$0 lineage --skill code-simplifier'],
      ['Single file', '$0 lineage --file src/index.ts'],
      ['Date filter + JSON', '$0 lineage --since 2026-02-01 --json'],
    ],
  });

  skill = Option.String('--skill,-s', {
    description: 'Filter by skill name',
  });

  file = Option.String('--file,-f', {
    description: 'Filter by file path',
  });

  since = Option.String('--since', {
    description: 'Show lineage since date (YYYY-MM-DD)',
  });

  limit = Option.String('--limit,-l', {
    description: 'Max entries to show',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const lineage = new SkillLineage(projectPath);

    const parsed = this.limit ? parseInt(this.limit, 10) : undefined;
    const limit = parsed && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;

    const data = lineage.build({
      skill: this.skill,
      file: this.file,
      since: this.since,
      limit,
    });

    if (this.json) {
      console.log(lineage.formatJson(data));
      return 0;
    }

    if (data.skills.length === 0) {
      console.log(chalk.yellow('No skill lineage found.'));
      console.log(chalk.dim('Lineage is built from skill execution history and activity logs.'));
      return 0;
    }

    console.log(lineage.formatText(data));
    return 0;
  }
}
