import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import {
  type ProjectProfile,
  type ScoredSkill,
  ContextManager,
  RecommendationEngine,
  buildSkillIndex,
  saveIndex,
  loadIndex as loadIndexFromCache,
  isIndexStale,
  INDEX_PATH,
  KNOWN_SKILL_REPOS,
} from '@skillkit/core';

/**
 * Recommend command - get smart skill recommendations based on project analysis
 */
export class RecommendCommand extends Command {
  static override paths = [['recommend'], ['rec']];

  static override usage = Command.Usage({
    description: 'Get skill recommendations based on your project',
    details: `
      The recommend command analyzes your project and suggests skills that match
      your technology stack, frameworks, and patterns.

      It scores skills based on:
      - Framework compatibility (React, Vue, Next.js, etc.)
      - Language match (TypeScript, Python, etc.)
      - Library alignment (Tailwind, Prisma, etc.)
      - Tag relevance
      - Popularity and quality metrics

      Run "skillkit recommend --update" to refresh the skill index from known sources.
    `,
    examples: [
      ['Get recommendations', '$0 recommend'],
      ['Show top 5 recommendations', '$0 recommend --limit 5'],
      ['Filter by category', '$0 recommend --category security'],
      ['Show detailed reasons', '$0 recommend --verbose'],
      ['Update skill index', '$0 recommend --update'],
      ['Search for skills by task', '$0 recommend --task "authentication"'],
      ['Search for skills (alias)', '$0 recommend --search "testing"'],
    ],
  });

  // Limit number of results
  limit = Option.String('--limit,-l', {
    description: 'Maximum number of recommendations',
  });

  // Minimum score threshold
  minScore = Option.String('--min-score', {
    description: 'Minimum match score (0-100)',
  });

  // Filter by category/tag
  category = Option.Array('--category,-c', {
    description: 'Filter by category (can be used multiple times)',
  });

  // Verbose output with reasons
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed match reasons',
  });

  // Update index
  update = Option.Boolean('--update,-u', false, {
    description: 'Update skill index from sources',
  });

  // Search mode (--search or --task)
  search = Option.String('--search,-s', {
    description: 'Search skills by task/query',
  });

  // Task alias for search (GSD-style)
  task = Option.String('--task,-t', {
    description: 'Search skills by task (alias for --search)',
  });

  // Include installed skills
  includeInstalled = Option.Boolean('--include-installed', false, {
    description: 'Include already installed skills',
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

    // Handle index update
    if (this.update) {
      return await this.updateIndex();
    }

    // Load or create project profile
    const profile = await this.getProjectProfile(targetPath);
    if (!profile) {
      console.error(chalk.red('Failed to analyze project'));
      return 1;
    }

    // Load skill index
    const index = this.loadIndex();
    if (!index || index.skills.length === 0) {
      console.log(chalk.yellow('No skill index found.'));
      console.log(chalk.dim('Run "skillkit recommend --update" to fetch skills from known sources.'));
      console.log(chalk.dim('Or install skills manually with "skillkit install <source>"\n'));

      // Still show project profile
      this.showProjectProfile(profile);
      return 0;
    }

    // Create recommendation engine
    const engine = new RecommendationEngine();
    engine.loadIndex(index);

    // Handle search mode (--search or --task)
    const searchQuery = this.search || this.task;
    if (searchQuery) {
      return this.handleSearch(engine, searchQuery);
    }

    // Get recommendations
    const result = engine.recommend(profile, {
      limit: this.limit ? parseInt(this.limit, 10) : 10,
      minScore: this.minScore ? parseInt(this.minScore, 10) : 30,
      categories: this.category,
      excludeInstalled: !this.includeInstalled,
      includeReasons: this.verbose,
    });

    // Output results
    if (this.json) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    this.displayRecommendations(result.recommendations, profile, result.totalSkillsScanned);
    return 0;
  }

  /**
   * Get project profile from context or by analyzing project
   */
  private async getProjectProfile(projectPath: string): Promise<ProjectProfile | null> {
    const manager = new ContextManager(projectPath);
    let context = manager.get();

    if (!context) {
      // Auto-analyze project
      if (!this.json) {
        console.log(chalk.dim('Analyzing project...\n'));
      }
      context = manager.init();
    }

    if (!context) {
      return null;
    }

    // Convert ProjectContext to ProjectProfile
    return {
      name: context.project.name,
      type: context.project.type,
      stack: context.stack,
      patterns: context.patterns,
      installedSkills: context.skills?.installed || [],
      excludedSkills: context.skills?.excluded || [],
    };
  }

  /**
   * Show project profile summary
   */
  private showProjectProfile(profile: ProjectProfile): void {
    console.log(chalk.cyan('Project Profile:'));
    console.log(`  Name: ${chalk.bold(profile.name)}`);
    if (profile.type) {
      console.log(`  Type: ${profile.type}`);
    }

    const stackItems: string[] = [];
    for (const lang of profile.stack.languages) {
      stackItems.push(`${lang.name}${lang.version ? ` ${lang.version}` : ''}`);
    }
    for (const fw of profile.stack.frameworks) {
      stackItems.push(`${fw.name}${fw.version ? ` ${fw.version}` : ''}`);
    }

    if (stackItems.length > 0) {
      console.log(`  Stack: ${chalk.dim(stackItems.join(', '))}`);
    }
    console.log();
  }

  /**
   * Display recommendations
   */
  private displayRecommendations(
    recommendations: ScoredSkill[],
    profile: ProjectProfile,
    totalScanned: number
  ): void {
    // Show project profile
    this.showProjectProfile(profile);

    if (recommendations.length === 0) {
      console.log(chalk.yellow('No matching skills found.'));
      console.log(chalk.dim('Try lowering the minimum score with --min-score'));
      return;
    }

    console.log(chalk.cyan(`Recommended Skills (${recommendations.length} of ${totalScanned} scanned):\n`));

    for (const rec of recommendations) {
      const scoreColor = rec.score >= 70 ? chalk.green : rec.score >= 50 ? chalk.yellow : chalk.dim;
      const scoreBar = this.getScoreBar(rec.score);

      console.log(`  ${scoreColor(`${rec.score}%`)} ${scoreBar} ${chalk.bold(rec.skill.name)}`);

      if (rec.skill.description) {
        console.log(`      ${chalk.dim(truncate(rec.skill.description, 70))}`);
      }

      if (rec.skill.source) {
        console.log(`      ${chalk.dim('Source:')} ${rec.skill.source}`);
      }

      if (this.verbose && rec.reasons.length > 0) {
        console.log(chalk.dim('      Reasons:'));
        for (const reason of rec.reasons.filter(r => r.weight > 0)) {
          console.log(`        ${chalk.dim('•')} ${reason.description} (+${reason.weight})`);
        }
      }

      if (rec.warnings.length > 0) {
        for (const warning of rec.warnings) {
          console.log(`      ${chalk.yellow('⚠')} ${warning}`);
        }
      }

      console.log();
    }

    console.log(chalk.dim('Install with: skillkit install <source>'));
  }

  /**
   * Generate a visual score bar
   */
  private getScoreBar(score: number): string {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
  }

  /**
   * Handle search mode
   */
  private handleSearch(engine: RecommendationEngine, query: string): number {
    const results = engine.search({
      query,
      limit: this.limit ? parseInt(this.limit, 10) : 10,
      semantic: true,
      filters: {
        minScore: this.minScore ? parseInt(this.minScore, 10) : undefined,
      },
    });

    if (this.json) {
      console.log(JSON.stringify(results, null, 2));
      return 0;
    }

    if (results.length === 0) {
      console.log(chalk.yellow(`No skills found matching "${query}"`));
      return 0;
    }

    console.log(chalk.cyan(`Search results for "${query}" (${results.length} found):\n`));

    for (const result of results) {
      const relevanceColor =
        result.relevance >= 70 ? chalk.green : result.relevance >= 50 ? chalk.yellow : chalk.dim;

      console.log(`  ${relevanceColor(`${result.relevance}%`)} ${chalk.bold(result.skill.name)}`);

      if (result.snippet) {
        console.log(`      ${chalk.dim(result.snippet)}`);
      }

      if (result.matchedTerms.length > 0) {
        console.log(`      ${chalk.dim('Matched:')} ${result.matchedTerms.join(', ')}`);
      }

      console.log();
    }

    return 0;
  }

  /**
   * Load skill index from cache
   */
  private loadIndex() {
    const index = loadIndexFromCache();

    if (!index) {
      return null;
    }

    // Check if index is stale
    if (isIndexStale(index) && !this.json) {
      const lastUpdated = new Date(index.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
      console.log(
        chalk.dim(`Index is ${Math.round(hoursSinceUpdate)} hours old. Run --update to refresh.\n`)
      );
    }

    return index;
  }

  /**
   * Update skill index from sources
   */
  private async updateIndex(): Promise<number> {
    console.log(chalk.cyan('Updating skill index from GitHub repositories...\n'));
    console.log(chalk.dim(`Sources: ${KNOWN_SKILL_REPOS.map(r => `${r.owner}/${r.repo}`).join(', ')}\n`));

    const spinner = ora('Fetching skills...').start();

    try {
      const { index, errors } = await buildSkillIndex(KNOWN_SKILL_REPOS, (message) => {
        spinner.text = message;
      });

      spinner.stop();

      // Report any errors
      if (errors.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        for (const error of errors) {
          console.log(chalk.dim(`  • ${error}`));
        }
        console.log();
      }

      // Save the index
      saveIndex(index);

      console.log(chalk.green(`✓ Updated index with ${index.skills.length} skills`));
      if (index.sources.length > 0) {
        console.log(chalk.dim(`  Sources: ${index.sources.map((s) => s.name).join(', ')}`));
      }
      console.log(chalk.dim(`  Saved to: ${INDEX_PATH}\n`));

      return 0;
    } catch (error) {
      spinner.fail('Failed to update index');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }
}

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
