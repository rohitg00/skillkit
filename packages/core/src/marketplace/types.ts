/**
 * Skill Marketplace Types
 *
 * Types for the aggregated skill marketplace.
 */

/**
 * Skill source repository
 */
export interface SkillSource {
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description?: string;
  /** Whether this is an official source */
  official?: boolean;
  /** Branch to fetch from */
  branch?: string;
  /** Path to skills index file */
  indexPath?: string;
}

/**
 * Skill entry in the marketplace
 */
export interface MarketplaceSkill {
  /** Unique identifier (owner/repo/path) */
  id: string;
  /** Skill name */
  name: string;
  /** Description */
  description: string;
  /** Source repository */
  source: SkillSource;
  /** Path within the repository */
  path: string;
  /** Version if available */
  version?: string;
  /** Author */
  author?: string;
  /** Tags for categorization */
  tags: string[];
  /** Supported agents */
  agents?: string[];
  /** GitHub stars (if available) */
  stars?: number;
  /** Last updated date */
  updatedAt?: string;
  /** Download/install count */
  downloads?: number;
  /** Raw content URL */
  rawUrl?: string;
}

/**
 * Marketplace index (cached locally)
 */
export interface MarketplaceIndex {
  /** Index version */
  version: number;
  /** When the index was last updated */
  updatedAt: string;
  /** Sources included in this index */
  sources: SkillSource[];
  /** All skills in the index */
  skills: MarketplaceSkill[];
  /** Total skill count */
  totalCount: number;
}

/**
 * Search options for the marketplace
 */
export interface MarketplaceSearchOptions {
  /** Search query */
  query?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by source */
  source?: string;
  /** Filter by agent compatibility */
  agent?: string;
  /** Sort by field */
  sortBy?: 'name' | 'stars' | 'downloads' | 'updatedAt';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Search result
 */
export interface MarketplaceSearchResult {
  /** Matching skills */
  skills: MarketplaceSkill[];
  /** Total matches (before limit) */
  total: number;
  /** Query that was searched */
  query?: string;
}

/**
 * Marketplace configuration
 */
export interface MarketplaceConfig {
  /** Custom sources to include */
  sources?: SkillSource[];
  /** Cache directory */
  cacheDir?: string;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
  /** GitHub token for API access */
  githubToken?: string;
}

/**
 * Default skill sources
 */
export const DEFAULT_SKILL_SOURCES: SkillSource[] = [
  {
    owner: 'composioHQ',
    repo: 'awesome-claude-code-skills',
    name: 'Composio Curated',
    description: 'Curated collection of Claude Code skills',
    official: false,
    branch: 'main',
  },
  {
    owner: 'anthropics',
    repo: 'courses',
    name: 'Anthropic Official',
    description: 'Official Anthropic courses and skills',
    official: true,
    branch: 'master',
  },
];

/**
 * Cache file name
 */
export const MARKETPLACE_CACHE_FILE = 'marketplace-index.json';

/**
 * Default cache TTL (1 hour)
 */
export const DEFAULT_CACHE_TTL = 60 * 60 * 1000;
