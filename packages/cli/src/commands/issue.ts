import { Command, Option } from 'clipanion';
import { execFileSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import {
  createIssuePlanner,
  createPlanGenerator,
  createPlanValidator,
} from '@skillkit/core';

export class IssuePlanCommand extends Command {
  static paths = [['issue', 'plan']];

  static usage = Command.Usage({
    category: 'Development',
    description: 'Generate a structured plan from a GitHub Issue',
    details: `
      Fetches a GitHub Issue and generates a StructuredPlan that can be
      validated and executed with existing plan commands.

      Requires the \`gh\` CLI to be installed and authenticated.

      Examples:
        $ skillkit issue plan "#42"
        $ skillkit issue plan rohitg00/skillkit#42
        $ skillkit issue plan "#42" --agent cursor --no-tests
        $ skillkit issue plan "#42" --json
    `,
    examples: [
      ['Plan from current repo issue', '$0 issue plan "#42"'],
      ['Plan from specific repo', '$0 issue plan rohitg00/skillkit#42'],
      ['Plan with JSON output', '$0 issue plan "#42" --json'],
    ],
  });

  ref = Option.String({ required: true });
  agent = Option.String('--agent,-a', 'claude-code', {
    description: 'Target agent',
  });
  output = Option.String('--output,-o', {
    description: 'Output file path (default: .skillkit/plans/issue-<n>.md)',
  });
  noTests = Option.Boolean('--no-tests', false, {
    description: 'Skip adding test steps',
  });
  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });
  techStack = Option.String('--tech-stack', {
    description: 'Comma-separated tech stack',
  });

  async execute(): Promise<number> {
    try {
      execFileSync('gh', ['--version'], { encoding: 'utf-8', timeout: 5_000 });
    } catch {
      this.context.stderr.write(
        'Error: GitHub CLI (gh) is not installed or not in PATH.\n' +
          'Install it from https://cli.github.com/\n'
      );
      return 1;
    }

    const planner = createIssuePlanner();

    let issue;
    try {
      issue = planner.fetchIssue(this.ref);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.context.stderr.write(`Error fetching issue: ${message}\n`);
      return 1;
    }

    const techStackArr = this.techStack
      ? this.techStack.split(',').map((s) => s.trim())
      : undefined;

    const plan = planner.generatePlan(issue, {
      agent: this.agent,
      techStack: techStackArr,
      includeTests: !this.noTests,
    });

    const validator = createPlanValidator();
    const validation = validator.validate(plan);

    const generator = createPlanGenerator();
    const markdown = generator.toMarkdown(plan);

    const outputPath =
      this.output || resolve(`.skillkit/plans/issue-${issue.number}.md`);

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, markdown, 'utf-8');

    if (this.json) {
      this.context.stdout.write(
        JSON.stringify(
          {
            issue: {
              number: issue.number,
              title: issue.title,
              url: issue.url,
              state: issue.state,
              labels: issue.labels,
            },
            plan: {
              name: plan.name,
              goal: plan.goal,
              tasks: plan.tasks.map((t) => ({
                id: t.id,
                name: t.name,
                files: t.files,
                steps: t.steps.length,
                status: t.status,
              })),
              metadata: plan.metadata,
            },
            validation: {
              valid: validation.valid,
              issues: validation.issues.length,
              stats: validation.stats,
            },
            outputPath,
          },
          null,
          2
        ) + '\n'
      );
    } else {
      this.context.stdout.write(`\n  Issue #${issue.number}: ${issue.title}\n\n`);
      this.context.stdout.write(`  Generated Plan: ${outputPath}\n\n`);
      this.context.stdout.write(`  Tasks (${plan.tasks.length})\n`);
      for (const task of plan.tasks) {
        const fileList: string[] = [];
        if (task.files.create) {
          fileList.push(...task.files.create.map((f) => `${f} (create)`));
        }
        if (task.files.modify) {
          fileList.push(...task.files.modify.map((f) => `${f} (modify)`));
        }
        this.context.stdout.write(`    ${task.id}. ${task.name}\n`);
        if (fileList.length > 0) {
          this.context.stdout.write(
            `       Files: ${fileList.join(', ')}\n`
          );
        }
      }

      if (plan.tags && plan.tags.length > 0) {
        this.context.stdout.write(
          `\n  Labels: ${issue.labels.join(', ')} -> ${plan.tags.join(', ')}\n`
        );
      }
      this.context.stdout.write(`  Agent: ${this.agent}\n\n`);

      if (!validation.valid) {
        this.context.stdout.write(
          `  Warnings: ${validation.issues.length}\n`
        );
      }

      this.context.stdout.write(
        `  Next: skillkit plan validate -f ${outputPath}\n` +
          `        skillkit plan execute -f ${outputPath} --dry-run\n\n`
      );
    }

    return 0;
  }
}

export class IssueListCommand extends Command {
  static paths = [['issue', 'list']];

  static usage = Command.Usage({
    category: 'Development',
    description: 'List open GitHub Issues',
    details: `
      Lists open issues from a GitHub repository. Useful for picking
      which issue to plan.

      Examples:
        $ skillkit issue list
        $ skillkit issue list --repo rohitg00/skillkit --label bug
        $ skillkit issue list --limit 20 --json
    `,
    examples: [
      ['List issues in current repo', '$0 issue list'],
      ['Filter by label', '$0 issue list --label enhancement'],
    ],
  });

  repo = Option.String('--repo,-r', {
    description: 'Repository (owner/repo)',
  });
  label = Option.String('--label,-l', {
    description: 'Filter by label',
  });
  limit = Option.String('--limit', '10', {
    description: 'Maximum issues to list',
  });
  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    try {
      execFileSync('gh', ['--version'], { encoding: 'utf-8', timeout: 5_000 });
    } catch {
      this.context.stderr.write(
        'Error: GitHub CLI (gh) is not installed or not in PATH.\n'
      );
      return 1;
    }

    const args = [
      'issue',
      'list',
      '--limit',
      this.limit,
      '--json',
      'number,title,labels,assignees',
      '--state',
      'open',
    ];

    if (this.repo) {
      args.push('--repo', this.repo);
    }
    if (this.label) {
      args.push('--label', this.label);
    }

    let result: string;
    try {
      result = execFileSync('gh', args, {
        encoding: 'utf-8',
        timeout: 15_000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.context.stderr.write(`Error listing issues: ${message}\n`);
      return 1;
    }

    let issues: Array<{
      number: number;
      title: string;
      labels: Array<{ name: string }>;
      assignees: Array<{ login: string }>;
    }>;
    try {
      issues = JSON.parse(result);
    } catch {
      this.context.stderr.write('Error: Failed to parse GitHub CLI response.\n');
      return 1;
    }

    if (this.json) {
      this.context.stdout.write(JSON.stringify(issues, null, 2) + '\n');
    } else {
      if (issues.length === 0) {
        this.context.stdout.write('  No open issues found.\n');
        return 0;
      }

      this.context.stdout.write('\n  Open Issues\n\n');
      for (const issue of issues) {
        const labels = issue.labels.map((l) => l.name).join(', ');
        const labelStr = labels ? ` [${labels}]` : '';
        this.context.stdout.write(
          `  #${issue.number}  ${issue.title}${labelStr}\n`
        );
      }
      this.context.stdout.write(
        `\n  Use: skillkit issue plan "#<number>" to generate a plan\n\n`
      );
    }

    return 0;
  }
}
