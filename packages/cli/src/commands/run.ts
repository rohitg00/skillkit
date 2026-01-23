import { Command, Option } from 'clipanion';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import chalk from 'chalk';
import ora from 'ora';
import {
  createExecutionEngine,
  discoverSkills,
  extractFrontmatter,
  type ExecutableSkill,
  type ExecutableTask,
  type AgentType,
} from '@skillkit/core';

/**
 * Run command - execute a skill
 */
export class RunCommand extends Command {
  static override paths = [['run']];

  static override usage = Command.Usage({
    description: 'Execute a skill with task-based orchestration',
    details: `
      The run command executes a skill, optionally breaking it down into
      tasks with verification checkpoints.

      Skills can be:
      - Installed skills (by name)
      - Local skill files (by path)
      - Remote skills (owner/repo/path)
    `,
    examples: [
      ['Run an installed skill', '$0 run typescript-strict-mode'],
      ['Run a local skill file', '$0 run ./my-skill/SKILL.md'],
      ['Dry run (show what would happen)', '$0 run typescript-strict-mode --dry-run'],
      ['Run with verification', '$0 run setup-testing --verify'],
    ],
  });

  // Skill name or path
  skillRef = Option.String({ required: true });

  // Target agent
  agent = Option.String('--agent,-a', {
    description: 'Target agent (claude-code, cursor, etc.)',
  });

  // Dry run
  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Show what would be executed without running',
  });

  // Enable verification
  verify = Option.Boolean('--verify', false, {
    description: 'Run verification checks after each task',
  });

  // Auto-commit
  autoCommit = Option.Boolean('--auto-commit', false, {
    description: 'Create git commits after each task',
  });

  // Continue on error
  continueOnError = Option.Boolean('--continue-on-error', false, {
    description: 'Continue execution even if a task fails',
  });

  // Verbose output
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed execution progress',
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

    // Load the skill
    const skill = await this.loadSkill(targetPath);
    if (!skill) {
      return 1;
    }

    // Show skill info
    if (!this.json) {
      console.log(chalk.cyan(`Executing skill: ${chalk.bold(skill.name)}`));
      if (skill.description) {
        console.log(chalk.dim(skill.description));
      }
      console.log();
    }

    // Dry run mode
    if (this.dryRun) {
      this.showDryRun(skill);
      return 0;
    }

    const spinner = ora();
    let currentTask = '';

    // Create execution engine
    const engine = createExecutionEngine(targetPath, {
      onProgress: (event) => {
        if (this.json) return;

        switch (event.type) {
          case 'task_start':
            currentTask = event.taskName || '';
            spinner.start(`Task ${(event.taskIndex || 0) + 1}/${event.totalTasks}: ${currentTask}`);
            break;

          case 'task_complete':
            const icon = event.status === 'completed' ? chalk.green('✓') : chalk.red('✗');
            spinner.stopAndPersist({
              symbol: icon,
              text: `Task ${(event.taskIndex || 0) + 1}/${event.totalTasks}: ${currentTask}`,
            });
            if (event.error && this.verbose) {
              console.log(chalk.red(`    Error: ${event.error}`));
            }
            break;

          case 'checkpoint':
            spinner.info(`Checkpoint: ${event.message}`);
            break;

          case 'verification':
            if (this.verbose) {
              console.log(chalk.dim(`    ${event.message}`));
            }
            break;

          case 'complete':
            console.log();
            if (event.status === 'completed') {
              console.log(chalk.green('✓ Skill execution completed'));
            } else {
              console.log(chalk.red(`✗ Skill execution ${event.status}`));
              if (event.error) {
                console.log(chalk.red(`  Error: ${event.error}`));
              }
            }
            break;
        }
      },
      checkpointHandler: async (task, _context) => {
        // For CLI, we auto-continue but could add interactive prompts
        if (task.type === 'checkpoint:decision' && task.options) {
          // Use first option by default
          return {
            continue: true,
            selectedOption: task.options[0],
          };
        }
        return { continue: true };
      },
    });

    // Execute the skill
    const result = await engine.execute(skill, {
      agent: this.agent as AgentType | undefined,
      autoCommit: this.autoCommit,
      verify: this.verify,
      continueOnError: this.continueOnError,
    });

    if (this.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Show summary
      console.log();
      console.log(chalk.cyan('Summary:'));
      console.log(`  Duration: ${chalk.dim(this.formatDuration(result.durationMs || 0))}`);
      console.log(`  Tasks: ${chalk.dim(`${result.tasks.filter(t => t.status === 'completed').length}/${result.tasks.length} completed`)}`);

      if (result.filesModified.length > 0) {
        console.log(`  Files modified: ${chalk.dim(result.filesModified.length.toString())}`);
      }

      if (result.commits.length > 0) {
        console.log(`  Commits: ${chalk.dim(result.commits.join(', '))}`);
      }
    }

    return result.status === 'completed' ? 0 : 1;
  }

  private async loadSkill(projectPath: string): Promise<ExecutableSkill | null> {
    // Check if it's a file path (must be a file, not directory)
    if (this.skillRef.endsWith('.md') || (existsSync(this.skillRef) && statSync(this.skillRef).isFile())) {
      return this.loadSkillFromFile(resolve(this.skillRef));
    }

    // Check installed skills
    const skill = this.findInstalledSkill(projectPath, this.skillRef);
    if (skill) {
      return skill;
    }

    console.error(chalk.red(`Skill "${this.skillRef}" not found`));
    console.log(chalk.dim('Install skills with: skillkit install <source>'));
    return null;
  }

  private loadSkillFromFile(filePath: string): ExecutableSkill | null {
    if (!existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      return null;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);

      // Parse tasks from frontmatter if present
      const tasks = this.parseTasksFromFrontmatter(frontmatter);

      return {
        name: (frontmatter?.name as string) || this.skillRef,
        description: frontmatter?.description as string,
        version: frontmatter?.version as string,
        source: filePath,
        content,
        tasks,
      };
    } catch (error) {
      console.error(chalk.red(`Failed to load skill: ${error}`));
      return null;
    }
  }

  private findInstalledSkill(projectPath: string, skillName: string): ExecutableSkill | null {
    // Search in common skill directories
    const skillDirs = [
      join(projectPath, '.claude', 'skills'),
      join(projectPath, '.cursor', 'skills'),
      join(projectPath, 'skills'),
      join(projectPath, '.skillkit', 'skills'),
    ];

    for (const dir of skillDirs) {
      if (!existsSync(dir)) continue;

      const skills = discoverSkills(dir);
      const skill = skills.find((s) => s.name === skillName);

      if (skill) {
        const skillMdPath = join(skill.path, 'SKILL.md');
        if (existsSync(skillMdPath)) {
          return this.loadSkillFromFile(skillMdPath);
        }
      }
    }

    return null;
  }

  private parseTasksFromFrontmatter(frontmatter: Record<string, unknown> | null): ExecutableTask[] | undefined {
    if (!frontmatter?.tasks || !Array.isArray(frontmatter.tasks)) {
      return undefined;
    }

    return frontmatter.tasks.map((task: Record<string, unknown>, index: number) => ({
      id: (task.id as string) || `task-${index}`,
      name: (task.name as string) || `Task ${index + 1}`,
      type: (task.type as ExecutableTask['type']) || 'auto',
      action: (task.action as string) || '',
      files: task.files as string[] | undefined,
      options: task.options as string[] | undefined,
      verify: task.verify as ExecutableTask['verify'],
    }));
  }

  private showDryRun(skill: ExecutableSkill): void {
    console.log(chalk.cyan('Dry Run - Execution Plan'));
    console.log();
    console.log(`Skill: ${chalk.bold(skill.name)}`);
    if (skill.description) {
      console.log(`Description: ${chalk.dim(skill.description)}`);
    }
    console.log(`Source: ${chalk.dim(skill.source)}`);
    console.log();

    if (skill.tasks && skill.tasks.length > 0) {
      console.log(chalk.cyan('Tasks:'));
      for (let i = 0; i < skill.tasks.length; i++) {
        const task = skill.tasks[i];
        const typeLabel = this.getTaskTypeLabel(task.type);
        console.log(`  ${i + 1}. ${task.name} ${typeLabel}`);
        if (task.action) {
          console.log(`     ${chalk.dim(task.action)}`);
        }
        if (task.files && task.files.length > 0) {
          console.log(`     Files: ${chalk.dim(task.files.join(', '))}`);
        }
      }
    } else {
      console.log(chalk.dim('No structured tasks defined. Skill will be executed as a single unit.'));
    }

    console.log();
    console.log(chalk.dim('This is a dry run. Remove --dry-run to execute.'));
  }

  private getTaskTypeLabel(type: string): string {
    switch (type) {
      case 'auto':
        return chalk.green('[auto]');
      case 'checkpoint:human-verify':
        return chalk.yellow('[verify]');
      case 'checkpoint:decision':
        return chalk.blue('[decision]');
      case 'checkpoint:human-action':
        return chalk.magenta('[manual]');
      default:
        return '';
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
