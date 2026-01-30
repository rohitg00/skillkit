import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import {
  analyzeGitHistory,
  loadPatternStore,
  addPattern,
  getAllPatterns,
  getApprovedPatterns,
  generateSkillFromPatterns,
  saveGeneratedSkill,
  generatePatternReport,
  exportPatternsAsJson,
  importPatternsFromJson,
  recordSuccess,
  recordFailure,
  approvePattern,
  rejectPattern,
  getPatternStats,
  clusterPatterns,
  type LearnedPattern,
  type GitAnalysisResult,
} from '@skillkit/core';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

export class LearnCommand extends Command {
  static override paths = [['learn']];

  static override usage = Command.Usage({
    description: 'Extract learnable patterns from git history or sessions',
    details: `
      Analyzes git commit history to extract reusable patterns for error fixes,
      workarounds, debugging techniques, and project conventions.

      Patterns are stored locally and can be converted into skills.
    `,
    examples: [
      ['Analyze git history', '$0 learn'],
      ['Analyze specific number of commits', '$0 learn --commits 50'],
      ['Auto-approve patterns', '$0 learn --approve'],
      ['Show extracted patterns', '$0 learn --show'],
    ],
  });

  commits = Option.String('--commits,-c', {
    description: 'Number of commits to analyze (default: 100)',
  });

  since = Option.String('--since,-s', {
    description: 'Analyze commits since date (e.g., "2 weeks ago")',
  });

  approve = Option.Boolean('--approve,-a', false, {
    description: 'Auto-approve extracted patterns',
  });

  show = Option.Boolean('--show', false, {
    description: 'Show existing patterns without analyzing',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  directory = Option.String('--dir,-d', {
    description: 'Project directory to analyze (default: current directory)',
  });

  async execute(): Promise<number> {
    const projectPath = resolve(this.directory || process.cwd());

    if (this.show) {
      return this.showPatterns();
    }

    console.log(chalk.cyan('Analyzing git history for learnable patterns...\n'));

    const result = analyzeGitHistory(projectPath, {
      commits: this.commits ? parseInt(this.commits) : 100,
      since: this.since,
    });

    if (this.json) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    this.printAnalysisResult(result);

    if (result.patterns.length === 0) {
      console.log(chalk.yellow('\nNo learnable patterns found.'));
      console.log(chalk.dim('Try analyzing more commits or a different date range.'));
      return 0;
    }

    loadPatternStore();
    let added = 0;

    for (const pattern of result.patterns) {
      if (this.approve) {
        pattern.approved = true;
      }
      addPattern(pattern);
      added++;
    }

    console.log();
    console.log(chalk.green(`✓ Extracted ${added} patterns`));

    if (!this.approve) {
      console.log(chalk.dim('Patterns are pending approval. Use:'));
      console.log(chalk.dim('  skillkit pattern approve <id>  - to approve'));
      console.log(chalk.dim('  skillkit pattern status        - to view all'));
    }

    return 0;
  }

  private printAnalysisResult(result: GitAnalysisResult): void {
    const { summary, dateRange, languages, frameworks } = result;

    console.log(chalk.bold('Analysis Summary'));
    console.log(`  Commits analyzed: ${summary.totalCommits}`);
    console.log(`  Files changed: ${summary.totalFilesChanged}`);
    console.log(`  Date range: ${dateRange.from || 'N/A'} to ${dateRange.to || 'N/A'}`);
    console.log();

    if (languages.length > 0) {
      console.log(`  Languages: ${chalk.cyan(languages.join(', '))}`);
    }
    if (frameworks.length > 0) {
      console.log(`  Frameworks: ${chalk.cyan(frameworks.join(', '))}`);
    }
    console.log();

    console.log(chalk.bold('Commit Categories'));
    console.log(`  Error fixes: ${summary.errorFixes}`);
    console.log(`  Refactors: ${summary.refactors}`);
    console.log(`  Features: ${summary.features}`);
    console.log(`  Documentation: ${summary.documentation}`);
    console.log(`  Tests: ${summary.tests}`);
    console.log();

    console.log(chalk.bold(`Patterns Extracted: ${result.patterns.length}`));

    for (const pattern of result.patterns.slice(0, 5)) {
      const confidence = chalk.blue(`${(pattern.confidence * 100).toFixed(0)}%`);
      console.log(`  ${chalk.dim('○')} ${pattern.title} [${pattern.category}] ${confidence}`);
    }

    if (result.patterns.length > 5) {
      console.log(chalk.dim(`  ... and ${result.patterns.length - 5} more`));
    }
  }

  private showPatterns(): number {
    const patterns = getAllPatterns();

    if (this.json) {
      console.log(JSON.stringify(patterns, null, 2));
      return 0;
    }

    if (patterns.length === 0) {
      console.log(chalk.yellow('No patterns stored yet.'));
      console.log(chalk.dim('Run `skillkit learn` to extract patterns from git history.'));
      return 0;
    }

    console.log(chalk.cyan(`Stored Patterns (${patterns.length}):\n`));

    const approved = patterns.filter(p => p.approved);
    const pending = patterns.filter(p => !p.approved);

    if (approved.length > 0) {
      console.log(chalk.green('Approved:'));
      for (const pattern of approved) {
        this.printPattern(pattern);
      }
      console.log();
    }

    if (pending.length > 0) {
      console.log(chalk.yellow('Pending Approval:'));
      for (const pattern of pending) {
        this.printPattern(pattern);
      }
    }

    return 0;
  }

  private printPattern(pattern: LearnedPattern): void {
    const confidence = chalk.blue(`${(pattern.confidence * 100).toFixed(0)}%`);
    const status = pattern.approved ? chalk.green('✓') : chalk.yellow('○');
    console.log(`  ${status} ${chalk.bold(pattern.id)}`);
    console.log(`    ${pattern.title} [${pattern.category}] ${confidence}`);
    console.log(chalk.dim(`    ${truncate(pattern.problem, 60)}`));
  }
}

export class PatternStatusCommand extends Command {
  static override paths = [['pattern', 'status'], ['pattern', 'list']];

  static override usage = Command.Usage({
    description: 'Show status of learned patterns',
    examples: [
      ['Show all patterns', '$0 pattern status'],
      ['Show by category', '$0 pattern status --category error_fix'],
    ],
  });

  category = Option.String('--category,-c', {
    description: 'Filter by category (error_fix, refactor, workaround, debugging, convention)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const stats = getPatternStats();

    if (this.json) {
      console.log(JSON.stringify(stats, null, 2));
      return 0;
    }

    console.log(chalk.cyan('Pattern Statistics\n'));
    console.log(`Total patterns: ${stats.total}`);
    console.log();

    console.log(chalk.bold('By Confidence:'));
    console.log(`  High (>70%): ${stats.byConfidenceRange.high}`);
    console.log(`  Medium (40-70%): ${stats.byConfidenceRange.medium}`);
    console.log(`  Low (<40%): ${stats.byConfidenceRange.low}`);
    console.log();

    if (stats.byDomain.size > 0) {
      console.log(chalk.bold('By Domain:'));
      for (const [domain, count] of stats.byDomain) {
        console.log(`  ${domain}: ${count}`);
      }
      console.log();
    }

    if (stats.mostUsed) {
      console.log(chalk.bold('Most Used Pattern:'));
      console.log(`  ${stats.mostUsed.title} (${stats.mostUsed.useCount} uses)`);
    }

    return 0;
  }
}

export class PatternFeedbackCommand extends Command {
  static override paths = [['pattern', 'feedback']];

  static override usage = Command.Usage({
    description: 'Provide feedback on a pattern to evolve its confidence',
    examples: [
      ['Mark pattern as successful', '$0 pattern feedback <id> --success'],
      ['Mark pattern as failed', '$0 pattern feedback <id> --failure'],
    ],
  });

  id = Option.String({ required: true });

  success = Option.Boolean('--success,-s', false, {
    description: 'Pattern was helpful',
  });

  failure = Option.Boolean('--failure,-f', false, {
    description: 'Pattern was not helpful',
  });

  async execute(): Promise<number> {
    if (!this.success && !this.failure) {
      console.log(chalk.yellow('Please specify --success or --failure'));
      return 1;
    }

    const result = this.success
      ? recordSuccess(this.id)
      : recordFailure(this.id);

    if (!result) {
      console.log(chalk.red(`Pattern not found: ${this.id}`));
      return 1;
    }

    const change = result.change === 'increased' ? chalk.green('↑') : chalk.red('↓');
    console.log(chalk.green(`✓ Feedback recorded`));
    console.log(`  Confidence: ${(result.previousConfidence * 100).toFixed(0)}% ${change} ${(result.newConfidence * 100).toFixed(0)}%`);
    console.log(`  Total uses: ${result.pattern.useCount}`);

    return 0;
  }
}

export class PatternApproveCommand extends Command {
  static override paths = [['pattern', 'approve']];

  static override usage = Command.Usage({
    description: 'Approve a pending pattern',
    examples: [['Approve pattern', '$0 pattern approve <id>']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const pattern = approvePattern(this.id);

    if (!pattern) {
      console.log(chalk.red(`Pattern not found: ${this.id}`));
      return 1;
    }

    console.log(chalk.green(`✓ Approved: ${pattern.title}`));
    return 0;
  }
}

export class PatternRejectCommand extends Command {
  static override paths = [['pattern', 'reject']];

  static override usage = Command.Usage({
    description: 'Reject and remove a pattern',
    examples: [['Reject pattern', '$0 pattern reject <id>']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const removed = rejectPattern(this.id);

    if (!removed) {
      console.log(chalk.red(`Pattern not found: ${this.id}`));
      return 1;
    }

    console.log(chalk.green(`✓ Removed pattern: ${this.id}`));
    return 0;
  }
}

export class PatternExportCommand extends Command {
  static override paths = [['pattern', 'export']];

  static override usage = Command.Usage({
    description: 'Export patterns to a file',
    examples: [
      ['Export as JSON', '$0 pattern export --output patterns.json'],
      ['Export as markdown report', '$0 pattern export --format report'],
    ],
  });

  output = Option.String('--output,-o', {
    description: 'Output file path',
  });

  format = Option.String('--format,-f', {
    description: 'Format: json or report (default: json)',
  });

  approvedOnly = Option.Boolean('--approved', false, {
    description: 'Export only approved patterns',
  });

  async execute(): Promise<number> {
    const patterns = this.approvedOnly ? getApprovedPatterns() : getAllPatterns();

    if (patterns.length === 0) {
      console.log(chalk.yellow('No patterns to export'));
      return 0;
    }

    const format = this.format || 'json';
    let content: string;

    if (format === 'report') {
      content = generatePatternReport(patterns);
    } else {
      content = exportPatternsAsJson(patterns);
    }

    if (this.output) {
      writeFileSync(this.output, content);
      console.log(chalk.green(`✓ Exported ${patterns.length} patterns to ${this.output}`));
    } else {
      console.log(content);
    }

    return 0;
  }
}

export class PatternImportCommand extends Command {
  static override paths = [['pattern', 'import']];

  static override usage = Command.Usage({
    description: 'Import patterns from a file',
    examples: [['Import patterns', '$0 pattern import patterns.json']],
  });

  file = Option.String({ required: true });

  async execute(): Promise<number> {
    if (!existsSync(this.file)) {
      console.log(chalk.red(`File not found: ${this.file}`));
      return 1;
    }

    const content = readFileSync(this.file, 'utf-8');
    const patterns = importPatternsFromJson(content);

    if (patterns.length === 0) {
      console.log(chalk.yellow('No patterns found in file'));
      return 1;
    }

    for (const pattern of patterns) {
      addPattern(pattern);
    }

    console.log(chalk.green(`✓ Imported ${patterns.length} patterns`));
    return 0;
  }
}

export class PatternClusterCommand extends Command {
  static override paths = [['pattern', 'cluster']];

  static override usage = Command.Usage({
    description: 'Cluster similar patterns and generate skills',
    examples: [
      ['Cluster patterns', '$0 pattern cluster'],
      ['Cluster and generate skills', '$0 pattern cluster --generate'],
    ],
  });

  generate = Option.Boolean('--generate,-g', false, {
    description: 'Generate skills from clusters',
  });

  minConfidence = Option.String('--min-confidence', {
    description: 'Minimum confidence for clustering (default: 0.5)',
  });

  async execute(): Promise<number> {
    const patterns = getApprovedPatterns();

    if (patterns.length === 0) {
      console.log(chalk.yellow('No approved patterns to cluster'));
      console.log(chalk.dim('Approve patterns first with: skillkit pattern approve <id>'));
      return 0;
    }

    const clusters = clusterPatterns(patterns);

    console.log(chalk.cyan(`Pattern Clusters (${clusters.size}):\n`));

    for (const [category, categoryPatterns] of clusters) {
      console.log(chalk.bold(`${category.replace('_', ' ')} (${categoryPatterns.length}):`));

      for (const pattern of categoryPatterns) {
        const confidence = chalk.blue(`${(pattern.confidence * 100).toFixed(0)}%`);
        console.log(`  ${chalk.dim('○')} ${pattern.title} ${confidence}`);
      }
      console.log();

      if (this.generate && categoryPatterns.length >= 1) {
        const skill = generateSkillFromPatterns(categoryPatterns, {
          minConfidence: this.minConfidence ? parseFloat(this.minConfidence) : 0.5,
        });

        if (skill) {
          const filepath = saveGeneratedSkill(skill);
          console.log(chalk.green(`  → Generated skill: ${filepath}`));
        }
      }
    }

    return 0;
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
