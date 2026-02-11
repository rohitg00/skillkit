import { execFileSync } from 'node:child_process';
import { PlanGenerator } from './generator.js';
import type { StructuredPlan, PlanTaskFiles, IssuePlanMetadata } from './types.js';

export type { IssuePlanMetadata };

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  url: string;
  state: string;
}

export interface IssuePlanOptions {
  agent?: string;
  techStack?: string[];
  outputPath?: string;
  includeTests?: boolean;
}

interface ParsedRef {
  owner?: string;
  repo?: string;
  number: number;
}

interface ExtractedTask {
  name: string;
  checked: boolean;
}

const LABEL_TAG_MAP: Record<string, string> = {
  bug: 'fix',
  fix: 'fix',
  enhancement: 'feature',
  feature: 'feature',
  documentation: 'docs',
  docs: 'docs',
  refactor: 'refactor',
  refactoring: 'refactor',
  test: 'test',
  testing: 'test',
  security: 'security',
  performance: 'performance',
  'good first issue': 'beginner',
  chore: 'chore',
  maintenance: 'chore',
};

const FILE_PATH_REGEX = /`([a-zA-Z0-9_./\-]+\.[a-zA-Z0-9]+)`/g;

export class IssuePlanner {

  parseIssueRef(ref: string): ParsedRef {
    const urlMatch = ref.match(
      /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/
    );
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2],
        number: parseInt(urlMatch[3], 10),
      };
    }

    const fullMatch = ref.match(/^([^/]+)\/([^#]+)#(\d+)$/);
    if (fullMatch) {
      return {
        owner: fullMatch[1],
        repo: fullMatch[2],
        number: parseInt(fullMatch[3], 10),
      };
    }

    const shortMatch = ref.match(/^#?(\d+)$/);
    if (shortMatch) {
      return { number: parseInt(shortMatch[1], 10) };
    }

    throw new Error(
      `Invalid issue reference: "${ref}". Use #123, owner/repo#123, or a GitHub URL.`
    );
  }

  fetchIssue(ref: string): GitHubIssue {
    const parsed = this.parseIssueRef(ref);
    const args = [
      'issue',
      'view',
      String(parsed.number),
      '--json',
      'number,title,body,labels,assignees,url,state',
    ];

    if (parsed.owner && parsed.repo) {
      args.push('--repo', `${parsed.owner}/${parsed.repo}`);
    }

    const result = execFileSync('gh', args, {
      encoding: 'utf-8',
      timeout: 15_000,
    });

    let data: {
      number: number;
      title: string;
      body?: string;
      labels?: Array<{ name: string }>;
      assignees?: Array<{ login: string }>;
      url: string;
      state: string;
    };
    try {
      data = JSON.parse(result);
    } catch {
      throw new Error(`Failed to parse GitHub CLI response for issue ${parsed.number}`);
    }
    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      labels: (data.labels || []).map((l) => l.name),
      assignees: (data.assignees || []).map((a) => a.login),
      url: data.url,
      state: data.state,
    };
  }

  extractTasksFromBody(body: string): ExtractedTask[] {
    const tasks: ExtractedTask[] = [];
    const lines = body.split('\n');
    for (const line of lines) {
      const match = line.match(/^[\s]*-\s*\[([ xX])\]\s+(.+)$/);
      if (match) {
        tasks.push({
          name: match[2].trim(),
          checked: match[1] !== ' ',
        });
      }
    }
    return tasks;
  }

  extractFileMentions(text: string): string[] {
    const files = new Set<string>();
    let match: RegExpExecArray | null;
    const regex = new RegExp(FILE_PATH_REGEX.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      const path = match[1];
      if (path.includes('/') || path.includes('.')) {
        files.add(path);
      }
    }
    return [...files];
  }

  inferLabelsToTags(labels: string[]): string[] {
    const tags: string[] = [];
    for (const label of labels) {
      const tag = LABEL_TAG_MAP[label.toLowerCase()];
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
    return tags;
  }

  generatePlan(
    issue: GitHubIssue,
    options?: IssuePlanOptions
  ): StructuredPlan {
    const agent = options?.agent || 'claude-code';
    const includeTests = options?.includeTests !== false;

    const bodyFirstParagraph =
      issue.body.split('\n\n')[0]?.trim() || issue.title;

    const generator = new PlanGenerator({
      includeTests,
      includeCommits: true,
      techStack: options?.techStack,
    });

    const plan = generator.createPlan(
      `Issue #${issue.number}: ${issue.title}`,
      bodyFirstParagraph
    );

    plan.tags = this.inferLabelsToTags(issue.labels);

    const checklist = this.extractTasksFromBody(issue.body);
    const allFileMentions = this.extractFileMentions(issue.body);

    if (checklist.length > 0) {
      for (const item of checklist) {
        const taskFiles = this.extractFileMentions(item.name);
        const files: PlanTaskFiles = {};
        if (taskFiles.length > 0) {
          files.modify = taskFiles;
        }

        const task = generator.addTask(plan, item.name, {
          files,
          tags: item.checked ? ['done'] : undefined,
          steps: [
            { type: 'implement', description: item.name },
            ...(includeTests
              ? [{ type: 'test' as const, description: `Write tests for ${item.name}` }]
              : []),
          ],
        });

        if (item.checked) {
          task.status = 'completed';
        }
      }
    } else {
      const files: PlanTaskFiles = {};
      if (allFileMentions.length > 0) {
        files.modify = allFileMentions;
      }

      generator.addTask(plan, issue.title, {
        description: bodyFirstParagraph,
        files,
        steps: [
          { type: 'implement', description: issue.title },
          ...(includeTests
            ? [{ type: 'test' as const, description: `Write tests for ${issue.title}` }]
            : []),
        ],
      });
    }

    plan.metadata = {
      issueNumber: issue.number,
      issueUrl: issue.url,
      issueLabels: issue.labels,
      agent,
      generatedAt: new Date().toISOString(),
    } satisfies IssuePlanMetadata;

    return plan;
  }
}

export function createIssuePlanner(): IssuePlanner {
  return new IssuePlanner();
}
