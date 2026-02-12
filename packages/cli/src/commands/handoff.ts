import { Command, Option } from 'clipanion';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import { SessionHandoff } from '@skillkit/core';

export class SessionHandoffCommand extends Command {
  static override paths = [['session', 'handoff']];

  static override usage = Command.Usage({
    description: 'Generate agent-to-agent session handoff document',
    examples: [
      ['Print handoff to stdout', '$0 session handoff'],
      ['Target agent recommendations', '$0 session handoff --to cursor'],
      ['Save to file', '$0 session handoff --out handoff.md'],
      ['JSON output', '$0 session handoff --json'],
    ],
  });

  to = Option.String('--to', {
    description: 'Target agent for recommendations',
  });

  out = Option.String('--out,-o', {
    description: 'Save handoff to file',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const handoff = new SessionHandoff(projectPath);

    const doc = handoff.generate({
      targetAgent: this.to,
    });

    const output = this.json ? handoff.toJson(doc) : handoff.toMarkdown(doc);

    if (this.out) {
      try {
        writeFileSync(this.out, output, 'utf-8');
        console.log(chalk.green(`Handoff saved to ${this.out}`));
      } catch (error) {
        console.error(chalk.red(`Failed to write file: ${(error as Error).message}`));
        return 1;
      }
    } else {
      console.log(output);
    }

    return 0;
  }
}
