import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import {
  loadWorkflowByName,
  loadWorkflow,
  validateWorkflow,
  createWorkflowOrchestrator,
} from '@skillkit/core';

/**
 * Workflow Run command - execute a workflow
 */
export class WorkflowRunCommand extends Command {
  static override paths = [['workflow', 'run'], ['wf', 'run']];

  static override usage = Command.Usage({
    description: 'Execute a skill workflow',
    details: `
      The workflow run command executes a workflow definition,
      running skills in waves with parallel or sequential execution.

      Workflows are defined in YAML files in .skillkit/workflows/
    `,
    examples: [
      ['Run a workflow by name', '$0 workflow run setup-project'],
      ['Run a workflow from file', '$0 workflow run --file my-workflow.yaml'],
      ['Dry run (no execution)', '$0 workflow run setup-project --dry-run'],
    ],
  });

  // Workflow name
  workflowName = Option.String({ required: false });

  // Workflow file path
  file = Option.String('--file,-f', {
    description: 'Path to workflow YAML file',
  });

  // Dry run
  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Show what would be executed without running',
  });

  // Verbose output
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed execution progress',
  });

  // Continue on error
  continueOnError = Option.Boolean('--continue-on-error', false, {
    description: 'Continue execution even if a skill fails',
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

    // Load workflow
    let workflow;
    try {
      if (this.file) {
        workflow = loadWorkflow(resolve(this.file));
      } else if (this.workflowName) {
        workflow = loadWorkflowByName(targetPath, this.workflowName);
        if (!workflow) {
          console.error(chalk.red(`Workflow "${this.workflowName}" not found`));
          console.log(chalk.dim('List available workflows: skillkit workflow list'));
          return 1;
        }
      } else {
        console.error(chalk.red('Please specify a workflow name or --file'));
        return 1;
      }
    } catch (error) {
      console.error(chalk.red(`Failed to load workflow: ${error}`));
      return 1;
    }

    // Validate workflow
    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      console.error(chalk.red('Invalid workflow:'));
      for (const error of validation.errors) {
        console.error(chalk.red(`  • ${error}`));
      }
      return 1;
    }

    // Dry run mode
    if (this.dryRun) {
      this.showDryRun(workflow);
      return 0;
    }

    // Execute workflow
    console.log(chalk.cyan(`Executing workflow: ${chalk.bold(workflow.name)}`));
    if (workflow.description) {
      console.log(chalk.dim(workflow.description));
    }
    console.log();

    const spinner = ora();
    let currentWave = -1;

    // Create orchestrator with mock executor (for now)
    const orchestrator = createWorkflowOrchestrator(
      async (_skillName, _config) => {
        // TODO: Integrate with actual skill execution
        // For now, simulate execution
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
      },
      (event) => {
        if (this.json) return;

        switch (event.type) {
          case 'wave_start':
            currentWave = event.waveIndex || 0;
            spinner.start(`Wave ${currentWave + 1}: ${event.waveName || 'Executing...'}`);
            break;

          case 'skill_start':
            if (this.verbose) {
              spinner.text = `Wave ${currentWave + 1}: Running ${event.skillName}...`;
            }
            break;

          case 'skill_complete':
            if (this.verbose) {
              const icon = event.status === 'completed' ? chalk.green('✓') : chalk.red('✗');
              console.log(`  ${icon} ${event.skillName}`);
            }
            break;

          case 'wave_complete':
            const waveIcon = event.status === 'completed' ? chalk.green('✓') : chalk.red('✗');
            spinner.stopAndPersist({
              symbol: waveIcon,
              text: `Wave ${(event.waveIndex || 0) + 1}: ${event.waveName || 'Complete'}`,
            });
            break;

          case 'workflow_complete':
            console.log();
            if (event.status === 'completed') {
              console.log(chalk.green('✓ Workflow completed successfully'));
            } else {
              console.log(chalk.red(`✗ Workflow ${event.status}`));
              if (event.error) {
                console.log(chalk.red(`  Error: ${event.error}`));
              }
            }
            break;
        }
      }
    );

    const execution = await orchestrator.execute(workflow);

    if (this.json) {
      console.log(JSON.stringify(execution, null, 2));
    }

    return execution.status === 'completed' ? 0 : 1;
  }

  private showDryRun(workflow: { name: string; description?: string; waves: Array<{ name?: string; parallel: boolean; skills: Array<string | { skill: string }> }> }): void {
    console.log(chalk.cyan('Dry Run - Workflow Execution Plan'));
    console.log();
    console.log(`Workflow: ${chalk.bold(workflow.name)}`);
    if (workflow.description) {
      console.log(`Description: ${chalk.dim(workflow.description)}`);
    }
    console.log();

    for (let i = 0; i < workflow.waves.length; i++) {
      const wave = workflow.waves[i];
      const modeLabel = wave.parallel ? chalk.blue('[parallel]') : chalk.yellow('[sequential]');

      console.log(`${chalk.cyan(`Wave ${i + 1}`)}: ${wave.name || 'Unnamed'} ${modeLabel}`);

      for (const skill of wave.skills) {
        const skillName = typeof skill === 'string' ? skill : skill.skill;
        console.log(`  • ${skillName}`);
      }

      console.log();
    }

    console.log(chalk.dim('This is a dry run. No skills were executed.'));
    console.log(chalk.dim('Remove --dry-run to execute the workflow.'));
  }
}
