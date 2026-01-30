import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import {
  BUILTIN_PIPELINES,
  getBuiltinPipeline,
  getBuiltinPipelines,
  type AgentPipeline,
} from '@skillkit/core';

export class WorkflowPipelineCommand extends Command {
  static override paths = [['workflow', 'pipeline']];

  static override usage = Command.Usage({
    description: 'Run a built-in agent pipeline',
    details: `
      Pipelines are sequential multi-agent workflows for common development tasks.
      Each pipeline runs agents in order, passing context between stages.
    `,
    examples: [
      ['Run feature pipeline', '$0 workflow pipeline feature'],
      ['Run bugfix pipeline', '$0 workflow pipeline bugfix'],
      ['List available pipelines', '$0 workflow pipeline list'],
    ],
  });

  pipeline = Option.String({ required: false });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Show what would be done without executing',
  });

  async execute(): Promise<number> {
    if (!this.pipeline) {
      console.log(chalk.cyan('Usage: skillkit workflow pipeline <name>\n'));
      console.log('Available pipelines:');
      for (const p of BUILTIN_PIPELINES) {
        console.log(`  ${chalk.bold(p.id)} - ${p.description}`);
      }
      console.log();
      console.log(chalk.dim('Run: skillkit workflow pipeline list for details'));
      return 0;
    }

    const pipeline = getBuiltinPipeline(this.pipeline);

    if (!pipeline) {
      console.log(chalk.red(`Pipeline not found: ${this.pipeline}`));
      console.log(chalk.dim('Run `skillkit workflow pipeline list` to see available pipelines'));
      return 1;
    }

    if (this.dryRun) {
      return this.showPipeline(pipeline);
    }

    return this.runPipeline(pipeline);
  }

  private showPipeline(pipeline: AgentPipeline): number {
    console.log(chalk.cyan(`Pipeline: ${pipeline.name}\n`));
    console.log(`Description: ${pipeline.description}`);
    console.log();
    console.log(chalk.bold('Stages:'));

    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      const arrow = i < pipeline.stages.length - 1 ? '→' : '';
      console.log(`  ${i + 1}. ${chalk.bold(stage.name)} (@${stage.agent})`);
      console.log(`     ${chalk.dim(stage.description)}`);
      if (arrow) {
        console.log(`     ${chalk.dim(arrow)}`);
      }
    }

    console.log();
    console.log(chalk.dim('(dry-run mode - no execution)'));

    return 0;
  }

  private async runPipeline(pipeline: AgentPipeline): Promise<number> {
    console.log(chalk.cyan(`Starting Pipeline: ${pipeline.name}\n`));

    for (let i = 0; i < pipeline.stages.length; i++) {
      const stage = pipeline.stages[i];
      const stageNum = `[${i + 1}/${pipeline.stages.length}]`;

      console.log(`${chalk.blue(stageNum)} ${chalk.bold(stage.name)}`);
      console.log(`  Agent: @${stage.agent}`);
      console.log(`  ${chalk.dim(stage.description)}`);
      console.log();

      console.log(chalk.yellow(`  → Invoke @${stage.agent} for: ${stage.description}`));
      console.log(chalk.dim('    (Manual agent invocation required in current implementation)'));
      console.log();
    }

    console.log(chalk.green('✓ Pipeline stages displayed'));
    console.log(chalk.dim('Execute each stage by invoking the agents in order'));

    return 0;
  }
}

export class WorkflowPipelineListCommand extends Command {
  static override paths = [['workflow', 'pipeline', 'list']];

  static override usage = Command.Usage({
    description: 'List available pipelines',
    examples: [['List pipelines', '$0 workflow pipeline list']],
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const pipelines = getBuiltinPipelines();

    if (this.json) {
      console.log(JSON.stringify(pipelines, null, 2));
      return 0;
    }

    console.log(chalk.cyan(`Available Pipelines (${pipelines.length}):\n`));

    for (const pipeline of pipelines) {
      console.log(chalk.bold(`  ${pipeline.id}`));
      console.log(`    ${pipeline.name}: ${pipeline.description}`);
      console.log(`    Stages: ${pipeline.stages.map(s => s.name).join(' → ')}`);
      console.log();
    }

    console.log(chalk.dim('Run with: skillkit workflow pipeline <name>'));

    return 0;
  }
}
