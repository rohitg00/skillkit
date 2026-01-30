import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type {
  GitCommit,
  GitFileChange,
  GitAnalysisResult,
  GitAnalysisSummary,
  LearnedPattern,
  PatternCategory,
} from './types.js';

export interface GitAnalysisOptions {
  commits?: number;
  since?: string;
  until?: string;
  branch?: string;
  author?: string;
}

function runGitCommand(command: string, cwd: string): string {
  try {
    return execSync(command, { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return '';
  }
}

function isGitRepository(path: string): boolean {
  return existsSync(join(path, '.git'));
}

export function getGitCommits(
  repoPath: string,
  options: GitAnalysisOptions = {}
): GitCommit[] {
  if (!isGitRepository(repoPath)) {
    return [];
  }

  const limit = options.commits || 100;
  const args: string[] = [
    'log',
    `--max-count=${limit}`,
    '--format=%H|||%h|||%an|||%aI|||%s|||%b|||END_COMMIT',
    '--name-status',
  ];

  if (options.since) {
    args.push(`--since="${options.since}"`);
  }
  if (options.until) {
    args.push(`--until="${options.until}"`);
  }
  if (options.branch) {
    args.push(options.branch);
  }
  if (options.author) {
    args.push(`--author="${options.author}"`);
  }

  const output = runGitCommand(`git ${args.join(' ')}`, repoPath);
  if (!output) return [];

  const commits: GitCommit[] = [];
  const commitBlocks = output.split('END_COMMIT').filter(b => b.trim());

  for (const block of commitBlocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;

    const headerLine = lines[0];
    const parts = headerLine.split('|||');
    if (parts.length < 5) continue;

    const [hash, shortHash, author, date, message, body] = parts;

    const files: GitFileChange[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const match = line.match(/^([AMDRT])\d*\t(.+?)(?:\t(.+))?$/);
      if (match) {
        const [, status, path, oldPath] = match;
        files.push({
          path,
          status: parseFileStatus(status),
          additions: 0,
          deletions: 0,
          oldPath: oldPath || undefined,
        });
      }
    }

    commits.push({
      hash,
      shortHash,
      author,
      date,
      message,
      body: body || undefined,
      files,
    });
  }

  return commits;
}

function parseFileStatus(status: string): GitFileChange['status'] {
  switch (status) {
    case 'A': return 'added';
    case 'D': return 'deleted';
    case 'R': return 'renamed';
    default: return 'modified';
  }
}

function categorizeCommit(message: string, body?: string): PatternCategory | null {
  const text = `${message} ${body || ''}`.toLowerCase();

  if (text.includes('fix') || text.includes('bug') || text.includes('error') || text.includes('issue')) {
    return 'error_fix';
  }

  if (text.includes('refactor') || text.includes('clean') || text.includes('simplify')) {
    return 'refactor';
  }

  if (text.includes('workaround') || text.includes('hack') || text.includes('temporary')) {
    return 'workaround';
  }

  if (text.includes('debug') || text.includes('log') || text.includes('trace')) {
    return 'debugging';
  }

  return null;
}

function shouldSkipCommit(commit: GitCommit, ignorePatterns: string[]): boolean {
  const message = commit.message.toLowerCase();

  for (const pattern of ignorePatterns) {
    if (message.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  if (message.startsWith('merge ') || message.startsWith('wip')) {
    return true;
  }

  if (commit.files.length === 0) {
    return true;
  }

  return false;
}

function extractPatternFromCommit(commit: GitCommit): LearnedPattern | null {
  const category = categorizeCommit(commit.message, commit.body);
  if (!category) return null;

  const id = `git-${commit.shortHash}`;
  const title = formatTitle(commit.message);
  const problem = extractProblem(commit);
  const solution = extractSolution(commit);
  const context = extractContext(commit);

  if (!problem || !solution) return null;

  return {
    id,
    category,
    title,
    problem,
    solution,
    context,
    extractedAt: new Date().toISOString(),
    source: 'git',
    commitRange: { from: commit.hash, to: commit.hash },
    approved: false,
    confidence: calculateConfidence(commit, category),
  };
}

function formatTitle(message: string): string {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

function extractProblem(commit: GitCommit): string {
  const message = commit.message.toLowerCase();

  if (message.includes('fix:') || message.includes('fix(')) {
    const match = commit.message.match(/fix[:(]\s*([^)]+)/i);
    if (match) {
      return `Issue: ${match[1]}`;
    }
  }

  if (commit.body) {
    const problemMatch = commit.body.match(/problem:?\s*(.+)/i);
    if (problemMatch) {
      return problemMatch[1].trim();
    }
  }

  return `${commit.message} (from commit ${commit.shortHash})`;
}

function extractSolution(commit: GitCommit): string {
  if (commit.body) {
    const solutionMatch = commit.body.match(/solution:?\s*(.+)/i);
    if (solutionMatch) {
      return solutionMatch[1].trim();
    }
  }

  const files = commit.files.map(f => f.path).join(', ');
  return `Modified: ${files}`;
}

function extractContext(commit: GitCommit): string {
  const files = commit.files;
  const extensions = new Set(files.map(f => f.path.split('.').pop() || ''));
  const directories = new Set(files.map(f => f.path.split('/')[0]));

  const parts: string[] = [];

  if (extensions.size > 0) {
    parts.push(`Files: ${Array.from(extensions).filter(e => e).join(', ')}`);
  }

  if (directories.size > 0 && directories.size <= 3) {
    parts.push(`Areas: ${Array.from(directories).join(', ')}`);
  }

  return parts.join('. ') || 'General codebase';
}

function calculateConfidence(commit: GitCommit, category: PatternCategory): number {
  let confidence = 0.5;

  if (commit.body && commit.body.length > 50) {
    confidence += 0.1;
  }

  if (commit.message.match(/^(fix|feat|refactor|docs|test|chore)(\(.+\))?:/)) {
    confidence += 0.1;
  }

  if (commit.files.length > 0 && commit.files.length < 10) {
    confidence += 0.1;
  }

  if (category === 'error_fix' || category === 'workaround') {
    confidence += 0.05;
  }

  return Math.min(0.9, confidence);
}

export function analyzeGitHistory(
  repoPath: string,
  options: GitAnalysisOptions = {}
): GitAnalysisResult {
  const commits = getGitCommits(repoPath, options);
  const ignorePatterns = ['merge', 'wip', 'typo'];

  const patterns: LearnedPattern[] = [];
  const summary: GitAnalysisSummary = {
    totalCommits: commits.length,
    totalFilesChanged: 0,
    errorFixes: 0,
    refactors: 0,
    features: 0,
    documentation: 0,
    tests: 0,
  };

  const languages = new Set<string>();
  const frameworks = new Set<string>();

  for (const commit of commits) {
    if (shouldSkipCommit(commit, ignorePatterns)) {
      continue;
    }

    summary.totalFilesChanged += commit.files.length;

    for (const file of commit.files) {
      const ext = file.path.split('.').pop()?.toLowerCase();
      if (ext) {
        if (['ts', 'tsx'].includes(ext)) languages.add('TypeScript');
        else if (['js', 'jsx'].includes(ext)) languages.add('JavaScript');
        else if (ext === 'py') languages.add('Python');
        else if (ext === 'go') languages.add('Go');
        else if (ext === 'rs') languages.add('Rust');
        else if (ext === 'java') languages.add('Java');
      }

      if (file.path.includes('next')) frameworks.add('Next.js');
      if (file.path.includes('react')) frameworks.add('React');
      if (file.path.includes('vue')) frameworks.add('Vue');
    }

    const category = categorizeCommit(commit.message, commit.body);
    if (category === 'error_fix') summary.errorFixes++;
    else if (category === 'refactor') summary.refactors++;

    if (commit.message.toLowerCase().includes('feat')) summary.features++;
    if (commit.message.toLowerCase().includes('doc')) summary.documentation++;
    if (commit.message.toLowerCase().includes('test')) summary.tests++;

    const pattern = extractPatternFromCommit(commit);
    if (pattern) {
      patterns.push(pattern);
    }
  }

  const dates = commits.map(c => c.date).sort();

  return {
    patterns,
    commitCount: commits.length,
    dateRange: {
      from: dates[0] || '',
      to: dates[dates.length - 1] || '',
    },
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
    summary,
  };
}

export function getRecentBugFixes(
  repoPath: string,
  limit = 20
): LearnedPattern[] {
  const result = analyzeGitHistory(repoPath, { commits: limit * 3 });
  return result.patterns
    .filter(p => p.category === 'error_fix')
    .slice(0, limit);
}

export function getRecentRefactors(
  repoPath: string,
  limit = 20
): LearnedPattern[] {
  const result = analyzeGitHistory(repoPath, { commits: limit * 3 });
  return result.patterns
    .filter(p => p.category === 'refactor')
    .slice(0, limit);
}
