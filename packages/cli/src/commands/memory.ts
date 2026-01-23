import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import {
  ObservationStore,
  LearningStore,
  getMemoryPaths,
  initializeMemoryDirectory,
  getMemoryStatus,
  createMemoryCompressor,
  createMemoryInjector,
  type Learning,
} from '@skillkit/core';

/**
 * Memory command - manage session memory across AI agents
 */
export class MemoryCommand extends Command {
  static override paths = [['memory'], ['mem']];

  static override usage = Command.Usage({
    description: 'Manage session memory across AI coding agents',
    details: `
      The memory command helps you view, search, and manage learnings
      captured from coding sessions across all AI agents.

      Subcommands:
      - status:   Show current memory status
      - search:   Search memories by query
      - list:     List all learnings
      - show:     Show a specific learning
      - compress: Compress observations into learnings
      - export:   Export a learning as a skill
      - import:   Import memories from another project
      - clear:    Clear session observations
      - add:      Manually add a learning
      - rate:     Rate a learning's effectiveness
      - config:   Configure memory settings
    `,
    examples: [
      ['Show memory status', '$0 memory status'],
      ['Search memories', '$0 memory search "authentication"'],
      ['Search global memories', '$0 memory search --global "react hooks"'],
      ['List project learnings', '$0 memory list'],
      ['List global learnings', '$0 memory list --global'],
      ['Show a learning', '$0 memory show <id>'],
      ['Compress observations', '$0 memory compress'],
      ['Export as skill', '$0 memory export <id> --name my-skill'],
      ['Clear session', '$0 memory clear'],
      ['Add manual learning', '$0 memory add --title "..." --content "..."'],
      ['Rate effectiveness', '$0 memory rate <id> 85'],
    ],
  });

  // Subcommand (status, search, list, show, compress, export, import, clear, add, rate, config)
  action = Option.String({ required: false });

  // Second argument (query for search, id for show/export/rate, rating for rate)
  arg = Option.String({ required: false });

  // Global scope
  global = Option.Boolean('--global,-g', false, {
    description: 'Use global memories instead of project',
  });

  // Tags filter
  tags = Option.String('--tags,-t', {
    description: 'Filter by tags (comma-separated)',
  });

  // Limit results
  limit = Option.String('--limit,-l', {
    description: 'Maximum number of results',
  });

  // Title for add
  title = Option.String('--title', {
    description: 'Title for new learning',
  });

  // Content for add
  content = Option.String('--content,-c', {
    description: 'Content for new learning',
  });

  // Name for export
  name = Option.String('--name,-n', {
    description: 'Name for exported skill',
  });

  // Output file
  output = Option.String('--output,-o', {
    description: 'Output file path',
  });

  // Input file
  input = Option.String('--input,-i', {
    description: 'Input file path',
  });

  // Keep learnings when clearing
  keepLearnings = Option.Boolean('--keep-learnings', false, {
    description: 'Keep learnings when clearing',
  });

  // Dry run
  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Preview without making changes',
  });

  // JSON output
  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  // Verbose output
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed output',
  });

  async execute(): Promise<number> {
    const action = this.action || 'status';

    switch (action) {
      case 'status':
        return this.showStatus();
      case 'search':
        return this.searchMemories();
      case 'list':
        return this.listLearnings();
      case 'show':
        return this.showLearning();
      case 'compress':
        return this.compressObservations();
      case 'export':
        return this.exportLearning();
      case 'import':
        return this.importMemories();
      case 'clear':
        return this.clearMemory();
      case 'add':
        return this.addLearning();
      case 'rate':
        return this.rateLearning();
      case 'config':
        return this.showConfig();
      default:
        console.error(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.gray('Available actions: status, search, list, show, compress, export, import, clear, add, rate, config'));
        return 1;
    }
  }

  /**
   * Show memory status
   */
  private async showStatus(): Promise<number> {
    const projectPath = process.cwd();
    const status = getMemoryStatus(projectPath);
    const paths = getMemoryPaths(projectPath);

    // Get counts from stores
    const observationStore = new ObservationStore(projectPath);
    const projectLearningStore = new LearningStore('project', projectPath);
    const globalLearningStore = new LearningStore('global');

    const sessionObservations = status.hasObservations ? observationStore.count() : 0;
    const projectLearnings = status.hasLearnings ? projectLearningStore.count() : 0;
    const globalLearnings = status.hasGlobalLearnings ? globalLearningStore.count() : 0;
    const sessionId = status.hasObservations ? observationStore.getSessionId() : null;

    if (this.json) {
      console.log(JSON.stringify({
        ...status,
        sessionObservations,
        projectLearnings,
        globalLearnings,
        sessionId,
        paths,
      }, null, 2));
      return 0;
    }

    console.log(chalk.bold('\nMemory Status\n'));

    // Session observations
    console.log(chalk.cyan('Session:'));
    console.log(`  Observations: ${sessionObservations}`);
    if (sessionId) {
      console.log(`  Session ID: ${chalk.gray(sessionId.slice(0, 8))}`);
    }
    console.log();

    // Project learnings
    console.log(chalk.cyan('Project:'));
    console.log(`  Learnings: ${projectLearnings}`);
    console.log(`  Path: ${chalk.gray(status.projectMemoryExists ? paths.projectMemoryDir : 'Not initialized')}`);
    console.log();

    // Global learnings
    console.log(chalk.cyan('Global:'));
    console.log(`  Learnings: ${globalLearnings}`);
    console.log(`  Path: ${chalk.gray(status.globalMemoryExists ? paths.globalMemoryDir : 'Not initialized')}`);
    console.log();

    // Recommendations
    if (sessionObservations >= 50) {
      console.log(chalk.yellow('💡 You have many uncompressed observations. Consider running:'));
      console.log(chalk.gray('   skillkit memory compress'));
    }

    return 0;
  }

  /**
   * Search memories
   */
  private async searchMemories(): Promise<number> {
    const query = this.arg;
    if (!query) {
      console.error(chalk.red('Error: Search query is required'));
      console.log(chalk.gray('Usage: skillkit memory search "your query"'));
      return 1;
    }

    const projectPath = process.cwd();
    const injector = createMemoryInjector(projectPath);

    const results = injector.search(query, {
      includeGlobal: this.global,
      tags: this.tags?.split(',').map((t) => t.trim()),
      maxLearnings: this.limit ? parseInt(this.limit, 10) : 10,
      minRelevance: 0,
    });

    if (this.json) {
      console.log(JSON.stringify(results, null, 2));
      return 0;
    }

    if (results.length === 0) {
      console.log(chalk.yellow(`No memories found for: "${query}"`));
      return 0;
    }

    console.log(chalk.bold(`\nFound ${results.length} memories:\n`));

    for (const { learning, relevanceScore, matchedBy } of results) {
      console.log(`${chalk.cyan('●')} ${chalk.bold(learning.title)}`);
      console.log(`  ID: ${chalk.gray(learning.id.slice(0, 8))}`);
      console.log(`  Relevance: ${this.formatScore(relevanceScore)}%`);
      console.log(`  Tags: ${learning.tags.join(', ')}`);
      console.log(`  Scope: ${learning.scope}`);

      if (this.verbose) {
        console.log(`  Matched: ${this.formatMatchedBy(matchedBy)}`);
        console.log(`  Created: ${new Date(learning.createdAt).toLocaleDateString()}`);
        console.log(`  Uses: ${learning.useCount}`);
      }

      // Show excerpt
      const excerpt = learning.content.slice(0, 100);
      console.log(`  ${chalk.gray(excerpt)}${learning.content.length > 100 ? '...' : ''}`);
      console.log();
    }

    return 0;
  }

  /**
   * List all learnings
   */
  private async listLearnings(): Promise<number> {
    const projectPath = process.cwd();
    const store = new LearningStore(
      this.global ? 'global' : 'project',
      this.global ? undefined : projectPath
    );

    let learnings = store.getAll();

    // Filter by tags if specified
    if (this.tags) {
      const tagList = this.tags.split(',').map((t) => t.trim().toLowerCase());
      learnings = learnings.filter((l) =>
        l.tags.some((t) => tagList.includes(t.toLowerCase()))
      );
    }

    // Limit results
    const limit = this.limit ? parseInt(this.limit, 10) : learnings.length;
    learnings = learnings.slice(0, limit);

    if (this.json) {
      console.log(JSON.stringify(learnings, null, 2));
      return 0;
    }

    const scope = this.global ? 'Global' : 'Project';
    console.log(chalk.bold(`\n${scope} Learnings (${learnings.length}):\n`));

    if (learnings.length === 0) {
      console.log(chalk.gray('No learnings found.'));
      console.log(chalk.gray('\nCapture learnings by running skills or add manually:'));
      console.log(chalk.gray('  skillkit memory add --title "..." --content "..."'));
      return 0;
    }

    for (const learning of learnings) {
      const effectiveness = learning.effectiveness !== undefined
        ? ` [${this.formatScore(learning.effectiveness)}%]`
        : '';

      console.log(`${chalk.cyan('●')} ${learning.title}${chalk.green(effectiveness)}`);
      console.log(`  ${chalk.gray(learning.id.slice(0, 8))} | ${learning.tags.join(', ')} | ${learning.useCount} uses`);

      if (this.verbose) {
        const excerpt = learning.content.slice(0, 80);
        console.log(`  ${chalk.gray(excerpt)}${learning.content.length > 80 ? '...' : ''}`);
      }
    }

    console.log();
    return 0;
  }

  /**
   * Show a specific learning
   */
  private async showLearning(): Promise<number> {
    const id = this.arg;
    if (!id) {
      console.error(chalk.red('Error: Learning ID is required'));
      console.log(chalk.gray('Usage: skillkit memory show <id>'));
      return 1;
    }

    const projectPath = process.cwd();

    // Try project store first
    let learning = new LearningStore('project', projectPath).getById(id);

    // Try global store
    if (!learning) {
      learning = new LearningStore('global').getById(id);
    }

    // Try matching by prefix
    if (!learning) {
      const projectLearnings = new LearningStore('project', projectPath).getAll();
      const globalLearnings = new LearningStore('global').getAll();
      const all = [...projectLearnings, ...globalLearnings];

      learning = all.find((l) => l.id.startsWith(id));
    }

    if (!learning) {
      console.error(chalk.red(`Learning not found: ${id}`));
      return 1;
    }

    if (this.json) {
      console.log(JSON.stringify(learning, null, 2));
      return 0;
    }

    console.log(chalk.bold(`\n${learning.title}\n`));
    console.log(chalk.gray(`ID: ${learning.id}`));
    console.log(chalk.gray(`Scope: ${learning.scope}`));
    console.log(chalk.gray(`Source: ${learning.source}`));
    console.log(chalk.gray(`Tags: ${learning.tags.join(', ')}`));

    if (learning.frameworks?.length) {
      console.log(chalk.gray(`Frameworks: ${learning.frameworks.join(', ')}`));
    }

    if (learning.patterns?.length) {
      console.log(chalk.gray(`Patterns: ${learning.patterns.join(', ')}`));
    }

    console.log(chalk.gray(`Created: ${new Date(learning.createdAt).toLocaleString()}`));
    console.log(chalk.gray(`Updated: ${new Date(learning.updatedAt).toLocaleString()}`));
    console.log(chalk.gray(`Uses: ${learning.useCount}`));

    if (learning.effectiveness !== undefined) {
      console.log(chalk.gray(`Effectiveness: ${this.formatScore(learning.effectiveness)}%`));
    }

    console.log(chalk.bold('\nContent:\n'));
    console.log(learning.content);
    console.log();

    return 0;
  }

  /**
   * Compress observations into learnings
   */
  private async compressObservations(): Promise<number> {
    const projectPath = process.cwd();

    // Initialize memory directory if needed
    initializeMemoryDirectory(projectPath);

    const observationStore = new ObservationStore(projectPath);
    const observations = observationStore.getAll();

    if (observations.length === 0) {
      console.log(chalk.yellow('No observations to compress.'));
      return 0;
    }

    console.log(chalk.cyan(`Found ${observations.length} observations to compress...\n`));

    const compressor = createMemoryCompressor(projectPath);
    const compressionOptions = {
      minObservations: 2,
      additionalTags: this.tags?.split(',').map((t) => t.trim()),
    };

    if (this.dryRun) {
      console.log(chalk.gray('(Dry run - no changes will be made)\n'));

      // For dry-run, only compress without storing
      const result = await compressor.compress(observations, compressionOptions);

      console.log(chalk.green(`✓ Would compress ${result.stats.inputCount} observations into ${result.stats.outputCount} learnings\n`));

      if (result.learnings.length > 0) {
        console.log(chalk.bold('Learnings that would be created:'));
        for (const learning of result.learnings) {
          console.log(`  ${chalk.cyan('●')} ${learning.title}`);
          console.log(`    Tags: ${learning.tags.join(', ')}`);
        }
        console.log();
      }

      return 0;
    }

    // Actual compression with storage
    const { learnings, result } = await compressor.compressAndStore(observations, compressionOptions);

    console.log(chalk.green(`✓ Compressed ${result.stats.inputCount} observations into ${result.stats.outputCount} learnings\n`));

    if (learnings.length > 0) {
      console.log(chalk.bold('New Learnings:'));
      for (const learning of learnings) {
        console.log(`  ${chalk.cyan('●')} ${learning.title}`);
        console.log(`    Tags: ${learning.tags.join(', ')}`);
      }
      console.log();
    }

    if (result.processedObservationIds.length > 0) {
      // Remove processed observations
      const deleted = observationStore.deleteMany(result.processedObservationIds);
      console.log(chalk.gray(`Cleared ${deleted} processed observations.`));
    }

    return 0;
  }

  /**
   * Export a learning as a skill
   */
  private async exportLearning(): Promise<number> {
    const id = this.arg;
    if (!id) {
      console.error(chalk.red('Error: Learning ID is required'));
      console.log(chalk.gray('Usage: skillkit memory export <id> --name my-skill'));
      return 1;
    }

    const projectPath = process.cwd();

    // Find the learning
    let learning = new LearningStore('project', projectPath).getById(id);
    if (!learning) {
      learning = new LearningStore('global').getById(id);
    }

    // Try matching by prefix
    if (!learning) {
      const projectLearnings = new LearningStore('project', projectPath).getAll();
      const globalLearnings = new LearningStore('global').getAll();
      const all = [...projectLearnings, ...globalLearnings];
      learning = all.find((l) => l.id.startsWith(id));
    }

    if (!learning) {
      console.error(chalk.red(`Learning not found: ${id}`));
      return 1;
    }

    // Generate skill name
    const skillName = this.name || this.slugify(learning.title);

    // Generate skill content
    const skillContent = this.generateSkillContent(learning, skillName);

    if (this.dryRun) {
      console.log(chalk.gray('(Dry run preview)\n'));
      console.log(skillContent);
      return 0;
    }

    // Determine output path
    const outputPath = this.output || `.skillkit/exports/${skillName}/SKILL.md`;
    const { dirname } = await import('node:path');
    const { existsSync, mkdirSync, writeFileSync } = await import('node:fs');

    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, skillContent, 'utf-8');

    console.log(chalk.green(`✓ Exported learning as skill: ${skillName}`));
    console.log(chalk.gray(`  Path: ${outputPath}`));

    return 0;
  }

  /**
   * Import memories from another project
   */
  private async importMemories(): Promise<number> {
    const inputPath = this.input || this.arg;
    if (!inputPath) {
      console.error(chalk.red('Error: Input path is required'));
      console.log(chalk.gray('Usage: skillkit memory import --input <path>'));
      return 1;
    }

    const { existsSync, readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');

    const fullPath = resolve(inputPath);
    if (!existsSync(fullPath)) {
      console.error(chalk.red(`File not found: ${fullPath}`));
      return 1;
    }

    const projectPath = process.cwd();
    const store = new LearningStore(
      this.global ? 'global' : 'project',
      this.global ? undefined : projectPath
    );

    try {
      const content = readFileSync(fullPath, 'utf-8');
      const { parse: parseYaml } = await import('yaml');
      const data = parseYaml(content) as { learnings?: Learning[] };

      if (!data.learnings || !Array.isArray(data.learnings)) {
        console.error(chalk.red('Invalid memory file format'));
        return 1;
      }

      let imported = 0;
      for (const learning of data.learnings) {
        if (this.dryRun) {
          console.log(chalk.gray(`Would import: ${learning.title}`));
        } else {
          store.add({
            source: 'imported',
            title: learning.title,
            content: learning.content,
            tags: learning.tags,
            frameworks: learning.frameworks,
            patterns: learning.patterns,
          });
          imported++;
        }
      }

      if (this.dryRun) {
        console.log(chalk.gray(`\n(Dry run - ${data.learnings.length} learnings would be imported)`));
      } else {
        console.log(chalk.green(`✓ Imported ${imported} learnings`));
      }

      return 0;
    } catch (error) {
      console.error(chalk.red(`Import failed: ${error}`));
      return 1;
    }
  }

  /**
   * Clear session observations
   */
  private async clearMemory(): Promise<number> {
    const projectPath = process.cwd();

    if (this.dryRun) {
      const observationStore = new ObservationStore(projectPath);
      const learningStore = new LearningStore('project', projectPath);

      console.log(chalk.gray('(Dry run preview)\n'));
      console.log(`Would clear ${observationStore.count()} observations`);
      if (!this.keepLearnings) {
        console.log(`Would clear ${learningStore.count()} learnings`);
      }
      return 0;
    }

    const observationStore = new ObservationStore(projectPath);
    observationStore.clear();
    console.log(chalk.green('✓ Cleared session observations'));

    if (!this.keepLearnings) {
      const learningStore = new LearningStore('project', projectPath);
      learningStore.clear();
      console.log(chalk.green('✓ Cleared project learnings'));
    }

    return 0;
  }

  /**
   * Add a manual learning
   */
  private async addLearning(): Promise<number> {
    if (!this.title) {
      console.error(chalk.red('Error: --title is required'));
      console.log(chalk.gray('Usage: skillkit memory add --title "..." --content "..."'));
      return 1;
    }

    if (!this.content) {
      console.error(chalk.red('Error: --content is required'));
      console.log(chalk.gray('Usage: skillkit memory add --title "..." --content "..."'));
      return 1;
    }

    const projectPath = process.cwd();
    const store = new LearningStore(
      this.global ? 'global' : 'project',
      this.global ? undefined : projectPath
    );

    const tags = this.tags?.split(',').map((t) => t.trim()) || [];

    const learning = store.add({
      source: 'manual',
      title: this.title,
      content: this.content,
      tags,
    });

    console.log(chalk.green(`✓ Added learning: ${learning.title}`));
    console.log(chalk.gray(`  ID: ${learning.id}`));

    return 0;
  }

  /**
   * Rate a learning's effectiveness
   */
  private async rateLearning(): Promise<number> {
    const id = this.arg;
    if (!id) {
      console.error(chalk.red('Error: Learning ID is required'));
      console.log(chalk.gray('Usage: skillkit memory rate <id> <rating>'));
      return 1;
    }

    // Find the rating (could be second positional or parse from id)
    const rating = parseInt(this.content || '0', 10);
    if (isNaN(rating) || rating < 0 || rating > 100) {
      console.error(chalk.red('Error: Rating must be 0-100'));
      console.log(chalk.gray('Usage: skillkit memory rate <id> --content <rating>'));
      return 1;
    }

    const projectPath = process.cwd();

    // Try project store first
    const projectStore = new LearningStore('project', projectPath);
    let learning = projectStore.getById(id);
    let store = projectStore;

    if (!learning) {
      const globalStore = new LearningStore('global');
      learning = globalStore.getById(id);
      store = globalStore;
    }

    // Try prefix match
    if (!learning) {
      const projectLearnings = projectStore.getAll();
      const globalStore = new LearningStore('global');
      const globalLearnings = globalStore.getAll();

      learning = projectLearnings.find((l) => l.id.startsWith(id));
      if (learning) {
        store = projectStore;
      } else {
        learning = globalLearnings.find((l) => l.id.startsWith(id));
        if (learning) {
          store = globalStore;
        }
      }
    }

    if (!learning) {
      console.error(chalk.red(`Learning not found: ${id}`));
      return 1;
    }

    store.setEffectiveness(learning.id, rating);
    console.log(chalk.green(`✓ Rated "${learning.title}" as ${rating}% effective`));

    return 0;
  }

  /**
   * Show memory configuration
   */
  private async showConfig(): Promise<number> {
    const projectPath = process.cwd();
    const paths = getMemoryPaths(projectPath);

    if (this.json) {
      console.log(JSON.stringify(paths, null, 2));
      return 0;
    }

    console.log(chalk.bold('\nMemory Configuration\n'));

    console.log(chalk.cyan('Paths:'));
    console.log(`  Project observations: ${chalk.gray(paths.observationsFile)}`);
    console.log(`  Project learnings: ${chalk.gray(paths.learningsFile)}`);
    console.log(`  Project index: ${chalk.gray(paths.indexFile)}`);
    console.log(`  Global learnings: ${chalk.gray(paths.globalLearningsFile)}`);
    console.log(`  Global index: ${chalk.gray(paths.globalIndexFile)}`);
    console.log();

    return 0;
  }

  /**
   * Format relevance/effectiveness score with color
   */
  private formatScore(score: number): string {
    if (score >= 80) return chalk.green(score.toString());
    if (score >= 50) return chalk.yellow(score.toString());
    return chalk.red(score.toString());
  }

  /**
   * Format matched by info
   */
  private formatMatchedBy(matchedBy: {
    frameworks: string[];
    tags: string[];
    keywords: string[];
    patterns: string[];
  }): string {
    const parts: string[] = [];
    if (matchedBy.frameworks.length > 0) {
      parts.push(`frameworks: ${matchedBy.frameworks.join(', ')}`);
    }
    if (matchedBy.tags.length > 0) {
      parts.push(`tags: ${matchedBy.tags.join(', ')}`);
    }
    if (matchedBy.keywords.length > 0) {
      parts.push(`keywords: ${matchedBy.keywords.slice(0, 3).join(', ')}`);
    }
    if (matchedBy.patterns.length > 0) {
      parts.push(`patterns: ${matchedBy.patterns.join(', ')}`);
    }
    return parts.join(' | ') || 'general';
  }

  /**
   * Convert title to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  }

  /**
   * Generate skill content from learning
   */
  private generateSkillContent(learning: Learning, skillName: string): string {
    const lines: string[] = [
      '---',
      `name: ${skillName}`,
      `description: ${learning.title}`,
      `version: 1.0.0`,
      `tags: [${learning.tags.join(', ')}]`,
      `source: skillkit-memory`,
      `sourceType: local`,
    ];

    if (learning.frameworks?.length) {
      lines.push(`compatibility:`);
      lines.push(`  frameworks: [${learning.frameworks.join(', ')}]`);
    }

    lines.push('---', '', `# ${learning.title}`, '');

    if (learning.patterns?.length) {
      lines.push(`## Patterns`, '');
      for (const pattern of learning.patterns) {
        lines.push(`- ${pattern}`);
      }
      lines.push('');
    }

    lines.push(`## Content`, '', learning.content, '');

    lines.push(
      '---',
      '',
      '*Exported from SkillKit session memory*',
      `*Created: ${new Date(learning.createdAt).toLocaleDateString()}*`,
      `*Uses: ${learning.useCount}*`
    );

    if (learning.effectiveness !== undefined) {
      lines.push(`*Effectiveness: ${learning.effectiveness}%*`);
    }

    return lines.join('\n');
  }
}
