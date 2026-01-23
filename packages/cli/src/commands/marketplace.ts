import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import ora from 'ora';
import {
  createMarketplaceAggregator,
  type MarketplaceSearchOptions,
} from '@skillkit/core';

/**
 * Marketplace command - browse and install skills from the marketplace
 */
export class MarketplaceCommand extends Command {
  static override paths = [['marketplace'], ['market'], ['mp']];

  static override usage = Command.Usage({
    description: 'Browse and install skills from the marketplace',
    details: `
      The marketplace command lets you discover and install skills
      from curated repositories.

      Skills are aggregated from multiple sources including:
      - composioHQ/awesome-claude-code-skills
      - anthropics/courses
      - User-added custom sources
    `,
    examples: [
      ['Browse marketplace', '$0 marketplace'],
      ['Search for skills', '$0 marketplace search typescript'],
      ['Refresh marketplace index', '$0 marketplace refresh'],
      ['Show popular tags', '$0 marketplace tags'],
      ['List sources', '$0 marketplace sources'],
    ],
  });

  action = Option.String({ required: false });
  query = Option.String({ required: false });

  limit = Option.String('--limit,-l', {
    description: 'Limit results',
  });

  tags = Option.String('--tags,-t', {
    description: 'Filter by tags (comma-separated)',
  });

  source = Option.String('--source,-s', {
    description: 'Filter by source',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const marketplace = createMarketplaceAggregator();

    switch (this.action) {
      case 'search':
        return this.searchSkills(marketplace);
      case 'refresh':
        return this.refreshIndex(marketplace);
      case 'tags':
        return this.showTags(marketplace);
      case 'sources':
        return this.showSources(marketplace);
      default:
        // Default: browse/search
        if (this.query || this.action) {
          return this.searchSkills(marketplace);
        }
        return this.browseMarketplace(marketplace);
    }
  }

  private async browseMarketplace(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const spinner = ora('Loading marketplace...').start();

    try {
      const index = await marketplace.getIndex();
      spinner.stop();

      if (this.json) {
        console.log(JSON.stringify({
          totalSkills: index.totalCount,
          sources: index.sources.length,
          updatedAt: index.updatedAt,
        }));
        return 0;
      }

      console.log(chalk.bold('Skill Marketplace\n'));
      console.log(`Total skills: ${chalk.cyan(index.totalCount)}`);
      console.log(`Sources: ${chalk.cyan(index.sources.length)}`);
      console.log(`Last updated: ${chalk.dim(new Date(index.updatedAt).toLocaleString())}\n`);

      // Show sample skills
      console.log(chalk.bold('Featured Skills:\n'));
      const featured = index.skills.slice(0, 10);

      for (const skill of featured) {
        console.log(`  ${chalk.cyan(skill.name)}`);
        if (skill.description) {
          console.log(`  ${chalk.dim(skill.description.slice(0, 60))}${skill.description.length > 60 ? '...' : ''}`);
        }
        console.log(`  ${chalk.dim(`Source: ${skill.source.name}`)}`);
        console.log();
      }

      console.log(chalk.dim('Use "skillkit marketplace search <query>" to search for skills.'));
      console.log(chalk.dim('Use "skillkit marketplace tags" to see popular tags.'));

      return 0;
    } catch (error) {
      spinner.fail('Failed to load marketplace');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }

  private async searchSkills(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const query = this.query || this.action;
    const spinner = ora(`Searching for "${query}"...`).start();

    try {
      const options: MarketplaceSearchOptions = {
        query: query || undefined,
        limit: this.limit ? parseInt(this.limit, 10) : 20,
        tags: this.tags?.split(',').map((t) => t.trim()),
        source: this.source,
      };

      const result = await marketplace.search(options);
      spinner.stop();

      if (this.json) {
        console.log(JSON.stringify(result));
        return 0;
      }

      if (result.skills.length === 0) {
        console.log(chalk.yellow(`No skills found${query ? ` matching "${query}"` : ''}.`));
        return 0;
      }

      console.log(chalk.bold(`Found ${result.total} skill(s):\n`));

      for (const skill of result.skills) {
        console.log(`${chalk.cyan(skill.name)} ${chalk.dim(`(${skill.source.name})`)}`);
        if (skill.description) {
          console.log(`  ${skill.description}`);
        }
        if (skill.tags.length > 0) {
          console.log(`  Tags: ${chalk.dim(skill.tags.join(', '))}`);
        }
        console.log();
      }

      if (result.total > result.skills.length) {
        console.log(chalk.dim(`Showing ${result.skills.length} of ${result.total} results. Use --limit to see more.`));
      }

      return 0;
    } catch (error) {
      spinner.fail('Search failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }

  private async refreshIndex(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const spinner = ora('Refreshing marketplace index...').start();

    try {
      const index = await marketplace.refresh();
      spinner.succeed(`Marketplace refreshed: ${index.totalCount} skills from ${index.sources.length} sources`);
      return 0;
    } catch (error) {
      spinner.fail('Refresh failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }

  private async showTags(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const spinner = ora('Loading tags...').start();

    try {
      const tags = await marketplace.getPopularTags(30);
      spinner.stop();

      if (this.json) {
        console.log(JSON.stringify(tags));
        return 0;
      }

      console.log(chalk.bold('Popular Tags:\n'));

      for (const { tag, count } of tags) {
        const bar = '█'.repeat(Math.min(count, 20));
        console.log(`  ${tag.padEnd(15)} ${chalk.cyan(bar)} ${count}`);
      }

      return 0;
    } catch (error) {
      spinner.fail('Failed to load tags');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }

  private async showSources(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const sources = marketplace.getSources();

    if (this.json) {
      console.log(JSON.stringify(sources));
      return 0;
    }

    console.log(chalk.bold('Skill Sources:\n'));

    for (const source of sources) {
      console.log(`${chalk.cyan(source.name)} ${source.official ? chalk.green('(official)') : ''}`);
      console.log(`  ${chalk.dim(`${source.owner}/${source.repo}`)}`);
      if (source.description) {
        console.log(`  ${source.description}`);
      }
      console.log();
    }

    return 0;
  }
}
