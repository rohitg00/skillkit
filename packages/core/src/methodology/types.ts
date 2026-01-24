/**
 * Methodology Framework Types
 *
 * Defines types for methodology packs, skills, and the management system.
 * SkillKit's methodology framework is composable, community-driven, and
 * methodology-agnostic (supports TDD, BDD, DDD, or custom approaches).
 */

import type { AgentType } from '../types.js';

/**
 * Methodology pack manifest - defines a collection of related skills
 */
export interface MethodologyPack {
  /** Pack name (e.g., 'testing', 'debugging') */
  name: string;
  /** Semantic version */
  version: string;
  /** Human-readable description */
  description: string;
  /** Skills included in this pack */
  skills: string[];
  /** Tags for discovery */
  tags: string[];
  /** Agent compatibility ('all' or specific agents) */
  compatibility: ('all' | AgentType)[];
  /** Author information */
  author?: string;
  /** Repository/homepage URL */
  repository?: string;
  /** License */
  license?: string;
  /** Pack dependencies (other packs) */
  dependencies?: string[];
}

/**
 * Methodology skill - a skill within a methodology pack
 */
export interface MethodologySkill {
  /** Unique skill identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Skill description */
  description: string;
  /** Skill version */
  version: string;
  /** Parent pack name */
  pack: string;
  /** Tags for discovery */
  tags: string[];
  /** File path to SKILL.md content */
  path: string;
  /** Raw SKILL.md content */
  content: string;
  /** Skill metadata from frontmatter */
  metadata: MethodologySkillMetadata;
}

/**
 * Skill metadata from SKILL.md frontmatter
 */
export interface MethodologySkillMetadata {
  /** Skill triggers/keywords for activation */
  triggers?: string[];
  /** Related skills that work well together */
  relatedSkills?: string[];
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Estimated time to apply (in minutes) */
  estimatedTime?: number;
  /** Prerequisites (other skills or knowledge) */
  prerequisites?: string[];
  /** Custom metadata */
  [key: string]: unknown;
}

/**
 * Installed methodology state
 */
export interface MethodologyState {
  /** State format version */
  version: number;
  /** Installed packs */
  installedPacks: Record<string, InstalledPackInfo>;
  /** Installed skills (for individual skill installs) */
  installedSkills: Record<string, InstalledSkillInfo>;
  /** Last sync timestamp */
  lastSync?: string;
}

/**
 * Information about an installed pack
 */
export interface InstalledPackInfo {
  /** Pack version */
  version: string;
  /** Installation timestamp */
  installedAt: string;
  /** Skills installed from this pack */
  skills: string[];
  /** Whether auto-sync is enabled */
  autoSync?: boolean;
}

/**
 * Information about an installed skill
 */
export interface InstalledSkillInfo {
  /** Skill version */
  version: string;
  /** Pack name (if installed from pack) */
  pack?: string;
  /** Installation timestamp */
  installedAt: string;
  /** Agents synced to */
  syncedAgents: AgentType[];
}

/**
 * Options for methodology manager
 */
export interface MethodologyManagerOptions {
  /** Project path */
  projectPath: string;
  /** Custom packs directory */
  packsDir?: string;
  /** Whether to auto-sync on install */
  autoSync?: boolean;
}

/**
 * Result of pack/skill installation
 */
export interface InstallResult {
  /** Whether installation succeeded */
  success: boolean;
  /** Installed items */
  installed: string[];
  /** Skipped items (already installed) */
  skipped: string[];
  /** Failed items with error messages */
  failed: Array<{ name: string; error: string }>;
}

/**
 * Result of skill sync operation
 */
export interface MethodologySyncResult {
  /** Whether sync succeeded */
  success: boolean;
  /** Skills synced */
  synced: Array<{ skill: string; agents: AgentType[] }>;
  /** Skills that failed to sync */
  failed: Array<{ skill: string; agent: AgentType; error: string }>;
}

/**
 * Pack validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Path to the problematic item */
  path?: string;
  /** Line number (if applicable) */
  line?: number;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Recommendation */
  recommendation?: string;
}

/**
 * Methodology search query
 */
export interface MethodologySearchQuery {
  /** Search term */
  query?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by pack name */
  pack?: string;
  /** Filter by difficulty */
  difficulty?: MethodologySkillMetadata['difficulty'];
  /** Filter by agent compatibility */
  agent?: AgentType;
}

/**
 * Methodology search result
 */
export interface MethodologySearchResult {
  /** Matching skills */
  skills: MethodologySkill[];
  /** Matching packs */
  packs: MethodologyPack[];
  /** Total count */
  total: number;
}
