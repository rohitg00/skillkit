import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { SessionManager } from '@skillkit/core';

/**
 * Resume command - resume paused skill execution
 */
export class ResumeCommand extends Command {
  static override paths = [['resume']];

  static override usage = Command.Usage({
    description: 'Resume a paused skill execution',
    details: `
      The resume command continues a previously paused skill execution
      from where it left off.

      The execution state is preserved, including:
      - Completed tasks
      - User decisions
      - Modified files
    `,
    examples: [
      ['Resume paused execution', '$0 resume'],
    ],
  });

  // Project path
  projectPath = Option.String('--path,-p', {
    description: 'Project path (default: current directory)',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.projectPath || process.cwd());
    const manager = new SessionManager(targetPath);
    const state = manager.get();

    if (!state) {
      console.log(chalk.yellow('No active session found.'));
      return 1;
    }

    if (!state.currentExecution) {
      console.log(chalk.yellow('No skill execution to resume.'));
      console.log(chalk.dim('Start a new execution with: skillkit run <skill>'));
      return 1;
    }

    if (state.currentExecution.status !== 'paused') {
      if (state.currentExecution.status === 'running') {
        console.log(chalk.yellow('Execution is already running.'));
      } else {
        console.log(chalk.yellow(`Execution is ${state.currentExecution.status}.`));
      }
      return 1;
    }

    const success = manager.resume();

    if (success) {
      const exec = state.currentExecution;
      console.log(chalk.green('✓ Execution resumed'));
      console.log();
      console.log(`  Skill: ${chalk.bold(exec.skillName)}`);
      console.log(`  Progress: ${exec.currentStep}/${exec.totalSteps} tasks`);
      console.log();

      // Show next task
      const nextTask = exec.tasks.find((t) => t.status === 'pending' || t.status === 'in_progress');
      if (nextTask) {
        console.log(`  Next task: ${chalk.cyan(nextTask.name)}`);
      }

      console.log();
      console.log(chalk.dim('The execution will continue from where it left off.'));
      console.log(chalk.dim('View status: skillkit status'));
      return 0;
    } else {
      console.log(chalk.red('Failed to resume execution.'));
      return 1;
    }
  }
}
