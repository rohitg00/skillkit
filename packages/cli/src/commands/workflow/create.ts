import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { createWorkflowTemplate, saveWorkflow, serializeWorkflow } from '@skillkit/core';

/**
 * Workflow Create command - create a new workflow
 */
export class WorkflowCreateCommand extends Command {
  static override paths = [['workflow', 'create'], ['wf', 'create'], ['workflow', 'new'], ['wf', 'new']];

  static override usage = Command.Usage({
    description: 'Create a new workflow',
    details: `
      The workflow create command creates a new workflow template
      that you can customize with your skill composition.
    `,
    examples: [
      ['Create a new workflow', '$0 workflow create my-workflow'],
      ['Create with description', '$0 workflow create setup-project --description "Project setup workflow"'],
      ['Print to stdout', '$0 workflow create my-workflow --stdout'],
    ],
  });

  // Workflow name
  workflowName = Option.String({ required: true });

  // Description
  description = Option.String('--description,-d', {
    description: 'Workflow description',
  });

  // Print to stdout instead of saving
  stdout = Option.Boolean('--stdout', false, {
    description: 'Print workflow YAML to stdout instead of saving',
  });

  // Project path
  projectPath = Option.String('--path,-p', {
    description: 'Project path (default: current directory)',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.projectPath || process.cwd());

    const workflow = createWorkflowTemplate(this.workflowName, this.description);

    if (this.stdout) {
      console.log(serializeWorkflow(workflow));
      return 0;
    }

    const filePath = saveWorkflow(targetPath, workflow);

    console.log(chalk.green(`✓ Created workflow: ${chalk.bold(this.workflowName)}`));
    console.log(chalk.dim(`  File: ${filePath}`));
    console.log();
    console.log(chalk.dim('Edit the workflow file to add skills and configure waves.'));
    console.log(chalk.dim('Run with: skillkit workflow run ' + this.workflowName));

    return 0;
  }
}
