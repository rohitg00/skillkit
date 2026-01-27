import { Command, Option } from 'clipanion';
import {
  createMarketplaceAggregator,
  type MarketplaceSearchOptions,
} from '@skillkit/core';
import {
  header,
  colors,
  spinner,
  warn,
  showMarketplaceInfo,
  showSkillList,
  progressBar,
} from '../onboarding/index.js';

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

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output',
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
    if (!this.quiet && !this.json) {
      header('Skill Marketplace');
    }

    const s = spinner();
    s.start('Loading marketplace...');

    try {
      const index = await marketplace.getIndex();
      s.stop('Marketplace loaded');

      if (this.json) {
        console.log(JSON.stringify({
          totalSkills: index.totalCount,
          sources: index.sources.length,
          updatedAt: index.updatedAt,
        }));
        return 0;
      }

      // Show marketplace info
      showMarketplaceInfo({
        totalSkills: index.totalCount,
        sourceCount: index.sources.length,
        lastUpdated: index.updatedAt,
      });

      // Show featured skills
      console.log(colors.bold('Featured Skills:'));
      console.log('');

      const featured = index.skills.slice(0, 10);
      showSkillList(featured.map(skill => ({
        name: skill.name,
        description: skill.description,
        source: skill.source.name,
      })));

      console.log(colors.muted('Use "skillkit marketplace search <query>" to search for skills.'));
      console.log(colors.muted('Use "skillkit marketplace tags" to see popular tags.'));

      return 0;
    } catch (err) {
      s.stop(colors.error('Failed to load marketplace'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private async searchSkills(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    const query = this.query || this.action;

    if (!this.quiet && !this.json) {
      header('Search Skills');
    }

    // Validate and parse limit
    let limit = 20;
    if (this.limit) {
      const parsed = parseInt(this.limit, 10);
      if (isNaN(parsed) || parsed <= 0) {
        console.log(colors.error('Invalid --limit value. Must be a positive number.'));
        return 1;
      }
      limit = parsed;
    }

    // Sanitize tags - filter out empty strings
    const tags = this.tags
      ?.split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const s = spinner();
    s.start(`Searching for "${query}"...`);

    try {
      const options: MarketplaceSearchOptions = {
        query: query || undefined,
        limit,
        tags: tags && tags.length > 0 ? tags : undefined,
        source: this.source,
      };

      const result = await marketplace.search(options);
      s.stop(`Found ${result.total} skill(s)`);

      if (this.json) {
        console.log(JSON.stringify(result));
        return 0;
      }

      if (result.skills.length === 0) {
        warn(`No skills found${query ? ` matching "${query}"` : ''}.`);
        return 0;
      }

      console.log('');
      console.log(colors.bold(`Found ${result.total} skill(s):`));
      console.log('');

      showSkillList(result.skills.map(skill => ({
        name: skill.name,
        description: skill.description,
        source: skill.source.name,
      })));

      if (result.total > result.skills.length) {
        console.log(colors.muted(`Showing ${result.skills.length} of ${result.total} results. Use --limit to see more.`));
      }

      return 0;
    } catch (err) {
      s.stop(colors.error('Search failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private async refreshIndex(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    if (!this.quiet) {
      header('Refresh Marketplace');
    }

    const s = spinner();
    s.start('Refreshing marketplace index...');

    try {
      const index = await marketplace.refresh();
      s.stop(`Refreshed: ${index.totalCount} skills from ${index.sources.length} sources`);
      return 0;
    } catch (err) {
      s.stop(colors.error('Refresh failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private async showTags(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    if (!this.quiet && !this.json) {
      header('Popular Tags');
    }

    const s = spinner();
    s.start('Loading tags...');

    try {
      const tags = await marketplace.getPopularTags(30);
      s.stop('Tags loaded');

      if (this.json) {
        console.log(JSON.stringify(tags));
        return 0;
      }

      console.log('');
      console.log(colors.bold('Popular Tags:'));
      console.log('');

      const maxCount = Math.max(...tags.map(t => t.count));

      for (const { tag, count } of tags) {
        const bar = progressBar(count, maxCount, 20);
        console.log(`  ${tag.padEnd(15)} ${colors.dim(bar)} ${colors.muted(String(count))}`);
      }

      console.log('');

      return 0;
    } catch (err) {
      s.stop(colors.error('Failed to load tags'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }

  private async showSources(marketplace: ReturnType<typeof createMarketplaceAggregator>): Promise<number> {
    if (!this.quiet && !this.json) {
      header('Skill Sources');
    }

    const sources = marketplace.getSources();

    if (this.json) {
      console.log(JSON.stringify(sources));
      return 0;
    }

    console.log('');
    console.log(colors.bold('Skill Sources:'));
    console.log('');

    for (const source of sources) {
      const officialBadge = source.official ? colors.success(' (official)') : '';
      console.log(`${colors.cyan(source.name)}${officialBadge}`);
      console.log(`  ${colors.muted(`${source.owner}/${source.repo}`)}`);
      if (source.description) {
        console.log(`  ${source.description}`);
      }
      console.log('');
    }

    return 0;
  }
}
