/**
 * Team Collaboration Module
 *
 * Enables sharing skills across team members via:
 * - Git repositories (shared skill repos)
 * - Team skill registries
 * - Import/export of skill bundles
 */

export { TeamManager, createTeamManager } from './manager.js';
export { SkillBundle, createSkillBundle, exportBundle, importBundle } from './bundle.js';
export type {
  TeamConfig,
  TeamMember,
  SharedSkill,
  TeamRegistry,
  BundleManifest,
  ShareOptions,
  ImportOptions,
} from './types.js';
