import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
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
import {
  header,
  colors,
  symbols,
  spinner,
  warn,
  showProjectSummary,
  progressBar,
  formatQualityBadge,
  getQualityGradeFromScore,
} from '../onboarding/index.js';

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

  // Quiet mode
  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.projectPath || process.cwd());

    // Handle index update
    if (this.update) {
      return await this.updateIndex();
    }

    if (!this.quiet && !this.json) {
      header('Skill Recommendations');
    }

    // Load or create project profile
    const profile = await this.getProjectProfile(targetPath);
    if (!profile) {
      console.log(colors.error('Failed to analyze project'));
      return 1;
    }

    // Load skill index
    const index = this.loadIndex();
    if (!index || index.skills.length === 0) {
      warn('No skill index found.');
      console.log(colors.muted('Run "skillkit recommend --update" to fetch skills from known sources.'));
      console.log(colors.muted('Or install skills manually with "skillkit install <source>"\n'));

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

  private async getProjectProfile(projectPath: string): Promise<ProjectProfile | null> {
    const manager = new ContextManager(projectPath);
    let context = manager.get();

    if (!context) {
      // Auto-analyze project
      if (!this.json && !this.quiet) {
        const s = spinner();
        s.start('Analyzing project...');
        context = manager.init();
        s.stop('Project analyzed');
      } else {
        context = manager.init();
      }
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

  private showProjectProfile(profile: ProjectProfile): void {
    const languages = profile.stack.languages.map(l => `${l.name}${l.version ? ` ${l.version}` : ''}`);
    const frameworks = profile.stack.frameworks.map(f => `${f.name}${f.version ? ` ${f.version}` : ''}`);

    showProjectSummary({
      name: profile.name,
      type: profile.type,
      languages,
      frameworks,
    });
  }

  private displayRecommendations(
    recommendations: ScoredSkill[],
    profile: ProjectProfile,
    totalScanned: number
  ): void {
    // Show project profile
    this.showProjectProfile(profile);

    if (recommendations.length === 0) {
      warn('No matching skills found.');
      console.log(colors.muted('Try lowering the minimum score with --min-score'));
      return;
    }

    console.log(colors.bold(`Recommended Skills (${recommendations.length} of ${totalScanned} scanned):`));
    console.log('');

    for (const rec of recommendations) {
      let scoreColor: (text: string) => string;
      if (rec.score >= 70) {
        scoreColor = colors.success;
      } else if (rec.score >= 50) {
        scoreColor = colors.warning;
      } else {
        scoreColor = colors.muted;
      }
      const scoreBar = progressBar(rec.score, 100, 10);
      const qualityScore = rec.skill.quality ?? null;
      const qualityDisplay = qualityScore !== null && qualityScore !== undefined
        ? ` ${formatQualityBadge(qualityScore)}`
        : '';

      console.log(`  ${scoreColor(`${rec.score}%`)} ${colors.dim(scoreBar)} ${colors.bold(rec.skill.name)}${qualityDisplay}`);

      if (rec.skill.description) {
        console.log(`      ${colors.muted(truncate(rec.skill.description, 70))}`);
      }

      if (rec.skill.source) {
        console.log(`      ${colors.dim('Source:')} ${rec.skill.source}`);
      }

      if (this.verbose && rec.reasons.length > 0) {
        console.log(colors.dim('      Reasons:'));
        for (const reason of rec.reasons.filter(r => r.weight > 0)) {
          console.log(`        ${colors.muted(symbols.stepActive)} ${reason.description} (+${reason.weight})`);
        }
        if (qualityScore !== null && qualityScore !== undefined) {
          const grade = getQualityGradeFromScore(qualityScore);
          console.log(`        ${colors.muted(symbols.stepActive)} Quality: ${qualityScore}/100 (${grade})`);
        }
      }

      if (rec.warnings.length > 0) {
        for (const warning of rec.warnings) {
          console.log(`      ${colors.warning(symbols.warning)} ${warning}`);
        }
      }

      console.log('');
    }

    console.log(colors.muted('Install with: skillkit install <source>'));
  }

  private handleSearch(engine: RecommendationEngine, query: string): number {
    if (!this.quiet && !this.json) {
      header(`Search: "${query}"`);
    }

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
      warn(`No skills found matching "${query}"`);
      return 0;
    }

    console.log('');
    console.log(colors.bold(`Search results for "${query}" (${results.length} found):`));
    console.log('');

    for (const result of results) {
      let relevanceColor: (text: string) => string;
      if (result.relevance >= 70) {
        relevanceColor = colors.success;
      } else if (result.relevance >= 50) {
        relevanceColor = colors.warning;
      } else {
        relevanceColor = colors.muted;
      }
      const relevanceBar = progressBar(result.relevance, 100, 10);

      console.log(`  ${relevanceColor(`${result.relevance}%`)} ${colors.dim(relevanceBar)} ${colors.bold(result.skill.name)}`);

      if (result.snippet) {
        console.log(`      ${colors.muted(result.snippet)}`);
      }

      if (result.matchedTerms.length > 0) {
        console.log(`      ${colors.dim('Matched:')} ${result.matchedTerms.join(', ')}`);
      }

      console.log('');
    }

    return 0;
  }

  private loadIndex() {
    const index = loadIndexFromCache();

    if (!index) {
      return null;
    }

    // Check if index is stale
    if (isIndexStale(index) && !this.json && !this.quiet) {
      const lastUpdated = new Date(index.lastUpdated);
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
      console.log(
        colors.muted(`Index is ${Math.round(hoursSinceUpdate)} hours old. Run --update to refresh.\n`)
      );
    }

    return index;
  }

  private async updateIndex(): Promise<number> {
    if (!this.quiet) {
      header('Update Skill Index');
    }

    console.log(colors.muted(`Sources: ${KNOWN_SKILL_REPOS.map(r => `${r.owner}/${r.repo}`).join(', ')}\n`));

    const s = spinner();
    s.start('Fetching skills...');

    try {
      const { index, errors } = await buildSkillIndex(KNOWN_SKILL_REPOS, (message) => {
        s.message(message);
      });

      s.stop(`Fetched ${index.skills.length} skills`);

      // Report any errors
      if (errors.length > 0) {
        console.log('');
        console.log(colors.warning('Warnings:'));
        for (const error of errors) {
          console.log(colors.muted(`  ${symbols.stepActive} ${error}`));
        }
      }

      // Save the index
      saveIndex(index);

      console.log('');
      console.log(colors.success(`${symbols.success} Updated index with ${index.skills.length} skills`));
      if (index.sources.length > 0) {
        console.log(colors.muted(`  Sources: ${index.sources.map((s) => s.name).join(', ')}`));
      }
      console.log(colors.muted(`  Saved to: ${INDEX_PATH}\n`));

      return 0;
    } catch (err) {
      s.stop(colors.error('Failed to update index'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
