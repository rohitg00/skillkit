/**
 * Methodology Framework
 *
 * Provides a composable, community-driven methodology system for AI coding agents.
 * Supports multiple approaches (TDD, BDD, DDD, or custom methodologies) through
 * installable "packs" of related skills.
 *
 * Key features:
 * - Methodology packs: Collections of related skills (testing, debugging, planning)
 * - Universal translation: Skills work across all 17 supported agents
 * - Pack management: Install, uninstall, and sync methodology skills
 * - Community-driven: Open for custom methodology contributions
 */

// Manager
export { MethodologyManager, createMethodologyManager } from './manager.js';

// Loader
export {
  MethodologyLoader,
  createMethodologyLoader,
  getBuiltinPacksDir,
} from './loader.js';

// Validator
export {
  validatePackManifest,
  validateSkillContent,
  validatePackDirectory,
  validateBuiltinPacks,
  extractSkillMetadata,
} from './validator.js';

// Types
export type {
  MethodologyPack,
  MethodologySkill,
  MethodologySkillMetadata,
  MethodologyState,
  MethodologyManagerOptions,
  InstallResult,
  MethodologySyncResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  MethodologySearchQuery,
  MethodologySearchResult,
  InstalledPackInfo,
  InstalledSkillInfo,
} from './types.js';
