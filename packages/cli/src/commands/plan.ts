/**
 * Plan Command
 *
 * Manage structured development plans.
 * Parse, validate, execute, and generate plans.
 */

import { Command, Option } from 'clipanion';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  createPlanParser,
  createPlanValidator,
  createPlanGenerator,
  createPlanExecutor,
  dryRunExecutor,
  shellExecutor,
  TASK_TEMPLATES,
} from '@skillkit/core';

export class PlanCommand extends Command {
  static paths = [['plan']];

  static usage = Command.Usage({
    category: 'Development',
    description: 'Manage structured development plans',
    details: `
      This command provides tools for working with structured development plans.

      Actions:
      - parse:    Parse a markdown plan to structured format
      - validate: Validate a plan for completeness
      - execute:  Execute a plan (with optional dry-run)
      - generate: Generate a plan from task list
      - templates: List available task templates
      - create:   Create a new empty plan

      Examples:
        $ skillkit plan parse ./plan.md
        $ skillkit plan validate ./plan.md
        $ skillkit plan execute ./plan.md --dry-run
        $ skillkit plan generate "Add auth" --tasks "Setup,Login,Logout"
        $ skillkit plan templates
    `,
    examples: [
      ['Parse a markdown plan', '$0 plan parse ./development-plan.md'],
      ['Validate a plan', '$0 plan validate ./plan.md --strict'],
      ['Dry-run execute a plan', '$0 plan execute ./plan.md --dry-run'],
      ['List task templates', '$0 plan templates'],
    ],
  });

  action = Option.String({ required: true });

  file = Option.String('--file,-f', {
    description: 'Plan file path',
  });

  output = Option.String('--output,-o', {
    description: 'Output file path',
  });

  name = Option.String('--name,-n', {
    description: 'Plan name',
  });

  goal = Option.String('--goal,-g', {
    description: 'Plan goal',
  });

  tasks = Option.String('--tasks,-t', {
    description: 'Comma-separated list of task names',
  });

  template = Option.String('--template', {
    description: 'Task template to use',
  });

  techStack = Option.String('--tech-stack', {
    description: 'Comma-separated tech stack',
  });

  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Dry run execution (no actual changes)',
  });

  strict = Option.Boolean('--strict', false, {
    description: 'Strict validation (treat warnings as errors)',
  });

  stopOnError = Option.Boolean('--stop-on-error', true, {
    description: 'Stop execution on first error',
  });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Verbose output',
  });

  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    try {
      switch (this.action) {
        case 'parse':
          return await this.parsePlan();
        case 'validate':
          return await this.validatePlan();
        case 'execute':
          return await this.executePlan();
        case 'generate':
          return await this.generatePlan();
        case 'templates':
          return await this.listTemplates();
        case 'create':
          return await this.createPlan();
        default:
          this.context.stderr.write(
            `Unknown action: ${this.action}\n` +
              `Available actions: parse, validate, execute, generate, templates, create\n`
          );
          return 1;
      }
    } catch (error) {
      this.context.stderr.write(`Error: ${(error as Error).message}\n`);
      return 1;
    }
  }

  private async parsePlan(): Promise<number> {
    if (!this.file) {
      this.context.stderr.write('Error: --file is required for parse action\n');
      return 1;
    }

    const filePath = resolve(this.file);
    const content = await readFile(filePath, 'utf-8');

    const parser = createPlanParser();
    const plan = parser.parse(content);

    if (this.json) {
      this.context.stdout.write(JSON.stringify(plan, null, 2) + '\n');
    } else {
      this.context.stdout.write(`Plan: ${plan.name}\n`);
      this.context.stdout.write(`Goal: ${plan.goal}\n`);
      this.context.stdout.write(`Status: ${plan.status}\n`);
      this.context.stdout.write(`Tasks: ${plan.tasks.length}\n\n`);

      for (const task of plan.tasks) {
        this.context.stdout.write(`  Task ${task.id}: ${task.name}\n`);
        this.context.stdout.write(`    Steps: ${task.steps.length}\n`);
        if (task.estimatedMinutes) {
          this.context.stdout.write(`    Estimated: ${task.estimatedMinutes} min\n`);
        }
      }
    }

    if (this.output) {
      const outputPath = resolve(this.output);
      await writeFile(outputPath, JSON.stringify(plan, null, 2));
      this.context.stdout.write(`\nSaved to: ${outputPath}\n`);
    }

    return 0;
  }

  private async validatePlan(): Promise<number> {
    if (!this.file) {
      this.context.stderr.write('Error: --file is required for validate action\n');
      return 1;
    }

    const filePath = resolve(this.file);
    const content = await readFile(filePath, 'utf-8');

    const parser = createPlanParser();
    const plan = parser.parse(content);

    const validator = createPlanValidator({ strict: this.strict });
    const result = validator.validate(plan);

    if (this.json) {
      this.context.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else {
      this.context.stdout.write(`Validation: ${result.valid ? 'PASSED' : 'FAILED'}\n\n`);

      this.context.stdout.write(`Statistics:\n`);
      this.context.stdout.write(`  Total tasks: ${result.stats.totalTasks}\n`);
      this.context.stdout.write(`  Total steps: ${result.stats.totalSteps}\n`);
      this.context.stdout.write(`  Estimated time: ${result.stats.estimatedMinutes} minutes\n`);
      this.context.stdout.write(`  Tasks with tests: ${result.stats.tasksWithTests}\n`);
      this.context.stdout.write(`  Avg steps/task: ${result.stats.avgStepsPerTask}\n\n`);

      if (result.issues.length > 0) {
        this.context.stdout.write(`Issues:\n`);
        for (const issue of result.issues) {
          const icon =
            issue.type === 'error' ? '\u274C' : issue.type === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F';
          const location = issue.taskId ? `Task ${issue.taskId}` : 'Plan';
          this.context.stdout.write(`  ${icon} [${location}] ${issue.message}\n`);
          if (issue.suggestion && this.verbose) {
            this.context.stdout.write(`     Suggestion: ${issue.suggestion}\n`);
          }
        }
      } else {
        this.context.stdout.write('No issues found.\n');
      }
    }

    return result.valid ? 0 : 1;
  }

  private async executePlan(): Promise<number> {
    if (!this.file) {
      this.context.stderr.write('Error: --file is required for execute action\n');
      return 1;
    }

    const filePath = resolve(this.file);
    const content = await readFile(filePath, 'utf-8');

    const parser = createPlanParser();
    const plan = parser.parse(content);

    // Validate first
    const validator = createPlanValidator({ strict: this.strict });
    const validation = validator.validate(plan);

    if (!validation.valid) {
      this.context.stderr.write('Plan validation failed. Fix errors before executing.\n');
      for (const issue of validation.issues.filter((i) => i.type === 'error')) {
        this.context.stderr.write(`  \u274C ${issue.message}\n`);
      }
      return 1;
    }

    // Create executor
    const executor = createPlanExecutor({
      stepExecutor: this.dryRun ? dryRunExecutor : shellExecutor,
    });

    // Add progress listener
    executor.addListener((event, _plan, task) => {
      if (this.verbose) {
        if (event === 'plan:task_started' && task) {
          this.context.stdout.write(`Starting task ${task.id}: ${task.name}\n`);
        } else if (event === 'plan:task_completed' && task) {
          this.context.stdout.write(`Completed task ${task.id}: ${task.name}\n`);
        } else if (event === 'plan:task_failed' && task) {
          this.context.stderr.write(`Failed task ${task.id}: ${task.name}\n`);
        }
      }
    });

    this.context.stdout.write(`Executing plan: ${plan.name}\n`);
    if (this.dryRun) {
      this.context.stdout.write('(Dry run mode - no actual changes)\n');
    }
    this.context.stdout.write('\n');

    const result = await executor.execute(plan, {
      dryRun: this.dryRun,
      stopOnError: this.stopOnError,
      onProgress: (taskId, step, status) => {
        if (this.verbose) {
          this.context.stdout.write(`  Task ${taskId}, Step ${step}: ${status}\n`);
        }
      },
    });

    this.context.stdout.write('\n');

    if (this.json) {
      this.context.stdout.write(
        JSON.stringify(
          {
            ...result,
            taskResults: Object.fromEntries(result.taskResults),
          },
          null,
          2
        ) + '\n'
      );
    } else {
      this.context.stdout.write(`Execution: ${result.success ? 'SUCCESS' : 'FAILED'}\n`);
      this.context.stdout.write(`Duration: ${result.durationMs}ms\n`);
      this.context.stdout.write(`Completed: ${result.completedTasks.length} tasks\n`);
      this.context.stdout.write(`Failed: ${result.failedTasks.length} tasks\n`);
      this.context.stdout.write(`Skipped: ${result.skippedTasks.length} tasks\n`);

      if (result.errors && result.errors.length > 0) {
        this.context.stdout.write('\nErrors:\n');
        for (const error of result.errors) {
          this.context.stderr.write(`  - ${error}\n`);
        }
      }
    }

    return result.success ? 0 : 1;
  }

  private async generatePlan(): Promise<number> {
    if (!this.name) {
      this.context.stderr.write('Error: --name is required for generate action\n');
      return 1;
    }

    const generator = createPlanGenerator({
      includeTests: true,
      includeCommits: true,
      techStack: this.techStack?.split(',').map((s) => s.trim()).filter((s) => s !== ''),
    });

    let plan;

    if (this.tasks) {
      const taskNames = this.tasks.split(',').map((s) => s.trim()).filter((s) => s !== '');
      plan = generator.fromTaskList(this.name, this.goal || 'Complete the tasks', taskNames, {
        template: this.template as keyof typeof TASK_TEMPLATES,
        techStack: this.techStack?.split(',').map((s) => s.trim()).filter((s) => s !== ''),
      });
    } else {
      plan = generator.createPlan(this.name, this.goal || 'Complete the project');
      if (this.techStack) {
        plan.techStack = this.techStack.split(',').map((s) => s.trim()).filter((s) => s !== '');
      }
    }

    const markdown = generator.toMarkdown(plan);

    if (this.output) {
      const outputPath = resolve(this.output);
      await writeFile(outputPath, markdown);
      this.context.stdout.write(`Plan saved to: ${outputPath}\n`);
    } else if (this.json) {
      this.context.stdout.write(JSON.stringify(plan, null, 2) + '\n');
    } else {
      this.context.stdout.write(markdown);
    }

    return 0;
  }

  private async listTemplates(): Promise<number> {
    if (this.json) {
      this.context.stdout.write(JSON.stringify(TASK_TEMPLATES, null, 2) + '\n');
    } else {
      this.context.stdout.write('Available Task Templates:\n\n');

      for (const [name, template] of Object.entries(TASK_TEMPLATES)) {
        this.context.stdout.write(`  ${name}\n`);
        this.context.stdout.write(`    ${template.description}\n`);
        this.context.stdout.write(`    Steps: ${template.steps.length}\n`);
        this.context.stdout.write(`    Estimated: ${template.estimatedMinutes} min\n\n`);
      }
    }

    return 0;
  }

  private async createPlan(): Promise<number> {
    if (!this.name) {
      this.context.stderr.write('Error: --name is required for create action\n');
      return 1;
    }

    const generator = createPlanGenerator({
      includeTests: true,
      includeCommits: true,
    });

    const plan = generator.createPlan(this.name, this.goal || 'Complete the project');

    if (this.techStack) {
      plan.techStack = this.techStack.split(',').map((s) => s.trim());
    }

    const markdown = generator.toMarkdown(plan);

    const outputPath = this.output || resolve(`${this.name.toLowerCase().replace(/\s+/g, '-')}-plan.md`);
    await writeFile(outputPath, markdown);
    this.context.stdout.write(`Plan created: ${outputPath}\n`);

    return 0;
  }
}
