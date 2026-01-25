/**
 * State management module for SkillKit TUI
 */

// Types
export {
  type SkillItem,
  type RepoInfo,
  type FetchedSkill,
  type Screen,
  NAV_KEYS,
  STATUS_BAR_SHORTCUTS,
  type ScreenMeta,
  type SidebarSection,
  SIDEBAR_NAV,
} from './types.js';

// Navigation
export {
  type NavigationState,
  createNavigationState,
  navigateTo,
  goBack,
  getScreenFromKey,
  isNavKey,
} from './navigation.js';

// Skills
export {
  type SkillsState,
  createSkillsState,
  loadSkills,
  removeSkill,
  filterSkills,
} from './skills.js';

// Agents
export {
  type AgentStatus,
  type AgentsState,
  createAgentsState,
  loadAgents,
  getDetectedAgentCount,
  getDetectedAgents,
  getAgentAdapter,
  TOTAL_AGENTS,
} from './agents.js';

// Marketplace
export {
  type MarketplaceState,
  DEFAULT_REPOS,
  getMarketplaceRepos,
  createMarketplaceState,
  readSkillDescription,
  fetchRepoSkills,
  cleanupTempRoot,
  filterMarketplaceSkills,
  toSkillItems,
  sortSkillsByName,
} from './marketplace.js';
