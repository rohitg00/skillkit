import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { listWorkflows } from '@skillkit/core';

/**
 * Workflow List command - list available workflows
 */
export class WorkflowListCommand extends Command {
  static override paths = [['workflow', 'list'], ['wf', 'list'], ['workflow', 'ls'], ['wf', 'ls']];

  static override usage = Command.Usage({
    description: 'List available workflows',
    details: `
      The workflow list command shows all available workflows
      defined in .skillkit/workflows/
    `,
    examples: [
      ['List all workflows', '$0 workflow list'],
      ['List with details', '$0 workflow list --verbose'],
    ],
  });

  // Verbose output
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed workflow information',
  });

  // JSON output
  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  // Project path
  projectPath = Option.String('--path,-p', {
    description: 'Project path (default: current directory)',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.projectPath || process.cwd());
    const workflows = listWorkflows(targetPath);

    if (this.json) {
      console.log(JSON.stringify(workflows, null, 2));
      return 0;
    }

    if (workflows.length === 0) {
      console.log(chalk.yellow('No workflows found.'));
      console.log(chalk.dim('Create a workflow with: skillkit workflow create'));
      console.log(chalk.dim('Or add YAML files to .skillkit/workflows/'));
      return 0;
    }

    console.log(chalk.cyan(`Available Workflows (${workflows.length}):\n`));

    for (const workflow of workflows) {
      console.log(`  ${chalk.bold(workflow.name)}`);

      if (workflow.description) {
        console.log(`    ${chalk.dim(workflow.description)}`);
      }

      if (this.verbose) {
        console.log(`    Version: ${chalk.dim(workflow.version || 'N/A')}`);
        console.log(`    Waves: ${chalk.dim(workflow.waves.length.toString())}`);

        const totalSkills = workflow.waves.reduce(
          (sum, wave) => sum + wave.skills.length,
          0
        );
        console.log(`    Total Skills: ${chalk.dim(totalSkills.toString())}`);

        if (workflow.tags && workflow.tags.length > 0) {
          console.log(`    Tags: ${chalk.dim(workflow.tags.join(', '))}`);
        }
      }

      console.log();
    }

    console.log(chalk.dim('Run a workflow with: skillkit workflow run <name>'));

    return 0;
  }
}
