import { Command, Option } from 'clipanion';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import chalk from 'chalk';
import {
  type ProjectProfile,
  type SkillSummary,
  type SkillIndex,
  type ScoredSkill,
  ContextManager,
  RecommendationEngine,
} from '@skillkit/core';

const INDEX_PATH = join(process.env.HOME || '~', '.skillkit', 'index.json');
const INDEX_CACHE_HOURS = 24;

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
      ['Search for skills by task', '$0 recommend --search "authentication"'],
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

  // Search mode
  search = Option.String('--search,-s', {
    description: 'Search skills by task/query',
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
      return this.updateIndex();
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

    // Handle search mode
    if (this.search) {
      return this.handleSearch(engine, this.search);
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
  private loadIndex(): SkillIndex | null {
    if (!existsSync(INDEX_PATH)) {
      return null;
    }

    try {
      const content = readFileSync(INDEX_PATH, 'utf-8');
      const index = JSON.parse(content) as SkillIndex;

      // Check if index is stale
      const lastUpdated = new Date(index.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > INDEX_CACHE_HOURS && !this.json) {
        console.log(
          chalk.dim(`Index is ${Math.round(hoursSinceUpdate)} hours old. Run --update to refresh.\n`)
        );
      }

      return index;
    } catch {
      return null;
    }
  }

  /**
   * Update skill index from sources
   */
  private updateIndex(): number {
    console.log(chalk.cyan('Updating skill index...\n'));

    // For now, create a sample index with well-known skill repositories
    // In the future, this would fetch from a registry or known skill sources
    const sampleIndex: SkillIndex = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      skills: getSampleSkills(),
      sources: [
        {
          name: 'vercel-labs',
          url: 'https://github.com/vercel-labs/agent-skills',
          lastFetched: new Date().toISOString(),
          skillCount: 5,
        },
        {
          name: 'anthropics',
          url: 'https://github.com/anthropics/skills',
          lastFetched: new Date().toISOString(),
          skillCount: 3,
        },
      ],
    };

    // Save index
    const indexDir = join(process.env.HOME || '~', '.skillkit');
    if (!existsSync(indexDir)) {
      mkdirSync(indexDir, { recursive: true });
    }

    writeFileSync(INDEX_PATH, JSON.stringify(sampleIndex, null, 2));

    console.log(chalk.green(`✓ Updated index with ${sampleIndex.skills.length} skills`));
    console.log(chalk.dim(`  Sources: ${sampleIndex.sources.map((s) => s.name).join(', ')}`));
    console.log(chalk.dim(`  Saved to: ${INDEX_PATH}\n`));

    return 0;
  }
}

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Sample skills for the index (in a real implementation, this would fetch from sources)
 */
function getSampleSkills(): SkillSummary[] {
  return [
    {
      name: 'vercel-react-best-practices',
      description: 'Modern React patterns including Server Components, hooks best practices, and performance optimization',
      source: 'vercel-labs/agent-skills',
      tags: ['react', 'frontend', 'typescript', 'nextjs', 'performance'],
      compatibility: {
        frameworks: ['react', 'nextjs'],
        languages: ['typescript', 'javascript'],
        libraries: [],
      },
      popularity: 1500,
      quality: 95,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'tailwind-v4-patterns',
      description: 'Tailwind CSS v4 utility patterns, responsive design, and component styling best practices',
      source: 'vercel-labs/agent-skills',
      tags: ['tailwind', 'css', 'styling', 'frontend', 'responsive'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['tailwindcss'],
      },
      popularity: 1200,
      quality: 92,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'nextjs-app-router',
      description: 'Next.js App Router patterns including layouts, server actions, and data fetching',
      source: 'vercel-labs/agent-skills',
      tags: ['nextjs', 'react', 'routing', 'server-actions', 'frontend'],
      compatibility: {
        frameworks: ['nextjs'],
        languages: ['typescript', 'javascript'],
        libraries: [],
      },
      popularity: 1100,
      quality: 94,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'typescript-strict-patterns',
      description: 'TypeScript strict mode patterns, type safety, and advanced type utilities',
      source: 'anthropics/skills',
      tags: ['typescript', 'types', 'safety', 'patterns'],
      compatibility: {
        frameworks: [],
        languages: ['typescript'],
        libraries: [],
      },
      popularity: 900,
      quality: 90,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'supabase-best-practices',
      description: 'Supabase integration patterns including auth, database queries, and real-time subscriptions',
      source: 'anthropics/skills',
      tags: ['supabase', 'database', 'auth', 'backend', 'postgresql'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['@supabase/supabase-js'],
      },
      popularity: 800,
      quality: 88,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'vitest-testing-patterns',
      description: 'Testing patterns with Vitest including mocking, assertions, and test organization',
      source: 'anthropics/skills',
      tags: ['vitest', 'testing', 'typescript', 'mocking', 'tdd'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript'],
        libraries: ['vitest'],
      },
      popularity: 700,
      quality: 86,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
    {
      name: 'prisma-database-patterns',
      description: 'Prisma ORM patterns for schema design, migrations, and efficient queries',
      source: 'vercel-labs/agent-skills',
      tags: ['prisma', 'database', 'orm', 'postgresql', 'backend'],
      compatibility: {
        frameworks: [],
        languages: ['typescript'],
        libraries: ['@prisma/client'],
      },
      popularity: 850,
      quality: 89,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'security-best-practices',
      description: 'Security patterns for web applications including XSS prevention, CSRF, and secure headers',
      source: 'trailofbits/skills',
      tags: ['security', 'xss', 'csrf', 'headers', 'owasp'],
      compatibility: {
        frameworks: [],
        languages: ['typescript', 'javascript', 'python'],
        libraries: [],
      },
      popularity: 600,
      quality: 95,
      lastUpdated: new Date().toISOString(),
      verified: true,
    },
    {
      name: 'python-fastapi-patterns',
      description: 'FastAPI best practices for building high-performance Python APIs',
      source: 'python-skills/fastapi',
      tags: ['python', 'fastapi', 'backend', 'api', 'async'],
      compatibility: {
        frameworks: ['fastapi'],
        languages: ['python'],
        libraries: [],
      },
      popularity: 550,
      quality: 85,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
    {
      name: 'zustand-state-management',
      description: 'Zustand state management patterns for React applications',
      source: 'react-skills/state',
      tags: ['zustand', 'react', 'state-management', 'frontend'],
      compatibility: {
        frameworks: ['react'],
        languages: ['typescript', 'javascript'],
        libraries: ['zustand'],
      },
      popularity: 650,
      quality: 84,
      lastUpdated: new Date().toISOString(),
      verified: false,
    },
  ];
}
