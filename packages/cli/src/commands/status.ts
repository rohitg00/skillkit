import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { SessionManager } from '@skillkit/core';

/**
 * Status command - show current session state
 */
export class StatusCommand extends Command {
  static override paths = [['status'], ['st']];

  static override usage = Command.Usage({
    description: 'Show current session state and execution progress',
    details: `
      The status command shows the current state of skill execution sessions,
      including any paused executions and recent history.
    `,
    examples: [
      ['Show session status', '$0 status'],
      ['Show with history', '$0 status --history'],
      ['Show JSON output', '$0 status --json'],
    ],
  });

  // Show history
  history = Option.Boolean('--history,-h', false, {
    description: 'Show execution history',
  });

  // History limit
  limit = Option.String('--limit,-l', {
    description: 'Limit history entries (default: 10)',
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
    const manager = new SessionManager(targetPath);
    const state = manager.get();

    if (this.json) {
      console.log(JSON.stringify(state || { message: 'No session found' }, null, 2));
      return 0;
    }

    if (!state) {
      console.log(chalk.dim('No active session found.'));
      console.log(chalk.dim('Run a skill with "skillkit run <skill>" to start a session.'));
      return 0;
    }

    // Show current execution
    if (state.currentExecution) {
      const exec = state.currentExecution;
      const statusColor = exec.status === 'paused' ? chalk.yellow : chalk.green;

      console.log(chalk.cyan('Current Execution:\n'));
      console.log(`  Skill: ${chalk.bold(exec.skillName)}`);
      console.log(`  Source: ${chalk.dim(exec.skillSource)}`);
      console.log(`  Status: ${statusColor(exec.status)}`);
      console.log(`  Progress: ${exec.currentStep}/${exec.totalSteps} tasks`);
      console.log(`  Started: ${chalk.dim(new Date(exec.startedAt).toLocaleString())}`);

      if (exec.pausedAt) {
        console.log(`  Paused: ${chalk.dim(new Date(exec.pausedAt).toLocaleString())}`);
      }

      console.log(chalk.cyan('\n  Tasks:'));
      for (const task of exec.tasks) {
        const statusIcon = this.getStatusIcon(task.status);
        const statusText = this.getStatusColor(task.status)(task.status);
        console.log(`    ${statusIcon} ${task.name} - ${statusText}`);
        if (task.error) {
          console.log(`      ${chalk.red('Error:')} ${task.error}`);
        }
      }

      if (exec.status === 'paused') {
        console.log(chalk.yellow('\n  Resume with: skillkit resume'));
      }
    } else {
      console.log(chalk.dim('No active execution.'));
    }

    // Show history
    if (this.history || (!state.currentExecution && state.history.length > 0)) {
      const limit = this.limit ? parseInt(this.limit, 10) : 10;
      const history = manager.getHistory(limit);

      if (history.length > 0) {
        console.log(chalk.cyan('\nExecution History:\n'));

        for (const entry of history) {
          const statusColor = entry.status === 'completed' ? chalk.green : chalk.red;
          const duration = this.formatDuration(entry.durationMs);

          console.log(`  ${statusColor('●')} ${chalk.bold(entry.skillName)}`);
          console.log(`    ${chalk.dim(entry.skillSource)} • ${duration}`);
          console.log(`    ${chalk.dim(new Date(entry.completedAt).toLocaleString())}`);

          if (entry.commits.length > 0) {
            console.log(`    Commits: ${chalk.dim(entry.commits.join(', '))}`);
          }

          if (entry.error) {
            console.log(`    ${chalk.red('Error:')} ${entry.error}`);
          }

          console.log();
        }
      }
    }

    // Show decisions
    if (state.decisions.length > 0) {
      console.log(chalk.cyan('Saved Decisions:\n'));
      for (const decision of state.decisions.slice(0, 5)) {
        console.log(`  ${chalk.dim(decision.key)}: ${decision.value}`);
      }
      if (state.decisions.length > 5) {
        console.log(chalk.dim(`  ... and ${state.decisions.length - 5} more`));
      }
    }

    return 0;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return chalk.green('✓');
      case 'failed':
        return chalk.red('✗');
      case 'in_progress':
        return chalk.blue('●');
      case 'paused':
        return chalk.yellow('⏸');
      default:
        return chalk.dim('○');
    }
  }

  private getStatusColor(status: string): (text: string) => string {
    switch (status) {
      case 'completed':
        return chalk.green;
      case 'failed':
        return chalk.red;
      case 'in_progress':
        return chalk.blue;
      case 'paused':
        return chalk.yellow;
      default:
        return chalk.dim;
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}
