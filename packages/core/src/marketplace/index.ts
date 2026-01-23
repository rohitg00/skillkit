/**
 * Skill Marketplace Module
 *
 * Provides aggregated skill discovery from multiple GitHub repositories.
 *
 * @example
 * ```typescript
 * import { createMarketplaceAggregator } from '@skillkit/core';
 *
 * const marketplace = createMarketplaceAggregator();
 *
 * // Search for skills
 * const results = await marketplace.search({ query: 'typescript' });
 *
 * // Get popular tags
 * const tags = await marketplace.getPopularTags();
 *
 * // Refresh index from all sources
 * await marketplace.refresh();
 * ```
 */

export * from './types.js';
export * from './aggregator.js';

export {
  MarketplaceAggregator,
  createMarketplaceAggregator,
} from './aggregator.js';

export {
  DEFAULT_SKILL_SOURCES,
  MARKETPLACE_CACHE_FILE,
  DEFAULT_CACHE_TTL,
  type SkillSource,
  type MarketplaceSkill,
  type MarketplaceIndex,
  type MarketplaceSearchOptions,
  type MarketplaceSearchResult,
  type MarketplaceConfig,
} from './types.js';
