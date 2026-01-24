/**
 * Agent Module
 *
 * Custom AI sub-agent management for SkillKit.
 * Supports discovery, parsing, and translation of agents
 * between different AI coding agent formats.
 */

// Types
export {
  AgentPermissionMode,
  AgentHook,
  AgentFrontmatter,
  AgentLocation,
  AgentMetadata,
  AGENT_DISCOVERY_PATHS,
  ALL_AGENT_DISCOVERY_PATHS,
  CUSTOM_AGENT_FORMAT_MAP,
  type CustomAgent,
  type CanonicalAgent,
  type AgentFormatCategory,
  type AgentTranslationResult,
  type AgentTranslationOptions,
} from './types.js';

// Parser
export {
  extractAgentFrontmatter,
  extractAgentContent,
  parseAgentFile,
  parseAgentDir,
  loadAgentMetadata,
  toCanonicalAgent,
  fromCanonicalAgent,
  readAgentContent,
  validateAgent,
} from './parser.js';

// Discovery
export {
  discoverAgents,
  discoverAgentsForAgent,
  discoverGlobalAgents,
  findAllAgents,
  findAgent,
  getAgentsDirectory,
  agentExists,
  getAgentStats,
} from './discovery.js';

// Translator
export {
  translateAgent,
  translateCanonicalAgent,
  translateAgentContent,
  translateAgents,
  getAgentFilename,
  getAgentTargetDirectory,
  isAgentCompatible,
} from './translator.js';
