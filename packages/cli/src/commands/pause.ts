import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { SessionManager } from '@skillkit/core';

/**
 * Pause command - pause current skill execution
 */
export class PauseCommand extends Command {
  static override paths = [['pause']];

  static override usage = Command.Usage({
    description: 'Pause current skill execution for later resumption',
    details: `
      The pause command saves the current execution state so you can
      continue later with "skillkit resume".

      This is useful when you need to:
      - Take a break from a long skill execution
      - Handle an interruption
      - Review progress before continuing
    `,
    examples: [
      ['Pause current execution', '$0 pause'],
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
      console.log(chalk.yellow('No skill execution in progress.'));
      return 1;
    }

    if (state.currentExecution.status === 'paused') {
      console.log(chalk.yellow('Execution is already paused.'));
      console.log(chalk.dim('Resume with: skillkit resume'));
      return 0;
    }

    const success = manager.pause();

    if (success) {
      const exec = state.currentExecution;
      console.log(chalk.green('✓ Execution paused'));
      console.log();
      console.log(`  Skill: ${chalk.bold(exec.skillName)}`);
      console.log(`  Progress: ${exec.currentStep}/${exec.totalSteps} tasks completed`);
      console.log();
      console.log(chalk.dim('Resume with: skillkit resume'));
      console.log(chalk.dim('View status: skillkit status'));
      return 0;
    } else {
      console.log(chalk.red('Failed to pause execution.'));
      return 1;
    }
  }
}
