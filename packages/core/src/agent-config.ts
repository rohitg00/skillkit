/**
 * Centralized Agent Configuration
 *
 * Single source of truth for all AI coding agent configurations.
 * All modules should import from here instead of defining their own values.
 */

import type { AgentType } from './types.js';

/**
 * Agent configuration for skills and config files
 */
export interface AgentDirectoryConfig {
  /** Primary skills directory path */
  skillsDir: string;
  /** Config file that references skills */
  configFile: string;
  /** Alternative skills directories */
  altSkillsDirs?: string[];
  /** Global skills directory */
  globalSkillsDir?: string;
  /** Config format: xml, markdown, mdc, json, markdown-table */
  configFormat: 'xml' | 'markdown' | 'mdc' | 'json' | 'markdown-table';
  /** Whether agent uses YAML frontmatter in SKILL.md */
  usesFrontmatter: boolean;
  /** Agent-specific frontmatter fields */
  frontmatterFields?: string[];
  /** Whether agent supports skill auto-discovery */
  supportsAutoDiscovery: boolean;
}

/**
 * Centralized agent configurations
 *
 * This is the ONLY source of truth for agent paths and formats.
 * Do not define these values elsewhere.
 */
export const AGENT_CONFIG: Record<AgentType, AgentDirectoryConfig> = {
  // Claude Code - all Claude products use the same format
  'claude-code': {
    skillsDir: '.claude/skills',
    configFile: 'CLAUDE.md',
    globalSkillsDir: '~/.claude/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    frontmatterFields: [
      'name', 'description', 'allowed-tools', 'model', 'context',
      'agent', 'disable-model-invocation', 'user-invocable', 'argument-hint',
    ],
    supportsAutoDiscovery: true,
  },

  // Cursor - uses MDC format in .cursor/rules/
  cursor: {
    skillsDir: '.cursor/skills',
    configFile: '.cursor/rules/skills.mdc',
    altSkillsDirs: ['.cursor/commands'],
    globalSkillsDir: '~/.cursor/skills',
    configFormat: 'mdc',
    usesFrontmatter: true,
    frontmatterFields: ['description', 'globs', 'alwaysApply'],
    supportsAutoDiscovery: true,
  },

  // Codex (OpenAI)
  codex: {
    skillsDir: '.codex/skills',
    configFile: 'AGENTS.md',
    globalSkillsDir: '~/.codex/skills',
    configFormat: 'markdown-table',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Gemini CLI
  'gemini-cli': {
    skillsDir: '.gemini/skills',
    configFile: 'GEMINI.md',
    globalSkillsDir: '~/.gemini/skills',
    configFormat: 'json',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // OpenCode
  opencode: {
    skillsDir: '.opencode/skills',
    configFile: 'AGENTS.md',
    altSkillsDirs: ['.opencode/agent'],
    globalSkillsDir: '~/.config/opencode/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Antigravity
  antigravity: {
    skillsDir: '.antigravity/skills',
    configFile: 'AGENTS.md',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Amp - uses .amp/ directory
  amp: {
    skillsDir: '.amp/skills',
    configFile: 'AGENTS.md',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Clawdbot
  clawdbot: {
    skillsDir: '.clawdbot/skills',
    configFile: 'AGENTS.md',
    altSkillsDirs: ['skills'],
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Droid (Factory)
  droid: {
    skillsDir: '.factory/skills',
    configFile: 'AGENTS.md',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // GitHub Copilot
  'github-copilot': {
    skillsDir: '.github/skills',
    configFile: '.github/copilot-instructions.md',
    altSkillsDirs: ['.github/instructions'],
    configFormat: 'markdown',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Goose
  goose: {
    skillsDir: '.goose/skills',
    configFile: 'AGENTS.md',
    globalSkillsDir: '~/.goose/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Kilo
  kilo: {
    skillsDir: '.kilocode/skills',
    configFile: 'AGENTS.md',
    altSkillsDirs: ['.kilocode/modes'],
    globalSkillsDir: '~/.kilocode/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Kiro CLI
  'kiro-cli': {
    skillsDir: '.kiro/skills',
    configFile: 'AGENTS.md',
    globalSkillsDir: '~/.kiro/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Roo Code
  roo: {
    skillsDir: '.roo/skills',
    configFile: 'AGENTS.md',
    altSkillsDirs: ['.roo/modes'],
    globalSkillsDir: '~/.roo/skills',
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Trae
  trae: {
    skillsDir: '.trae/skills',
    configFile: '.trae/rules/project_rules.md',
    altSkillsDirs: ['.trae/agent'],
    configFormat: 'markdown',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Windsurf
  windsurf: {
    skillsDir: '.windsurf/skills',
    configFile: '.windsurf/rules/skills.md',
    altSkillsDirs: ['.windsurf/workflows'],
    globalSkillsDir: '~/.codeium/windsurf/skills',
    configFormat: 'markdown',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },

  // Universal - works with any agent
  universal: {
    skillsDir: 'skills',
    configFile: 'AGENTS.md',
    altSkillsDirs: ['.agent/skills', '.agents/skills'],
    configFormat: 'xml',
    usesFrontmatter: true,
    supportsAutoDiscovery: true,
  },
};

/**
 * Get agent configuration
 */
export function getAgentDirectoryConfig(agent: AgentType): AgentDirectoryConfig {
  return AGENT_CONFIG[agent];
}

/**
 * Get skills directory for an agent
 */
export function getSkillsDir(agent: AgentType): string {
  return AGENT_CONFIG[agent].skillsDir;
}

/**
 * Get config file for an agent
 */
export function getConfigFile(agent: AgentType): string {
  return AGENT_CONFIG[agent].configFile;
}

/**
 * Get all skills directories for an agent (including alternatives)
 */
export function getAllSkillsDirs(agent: AgentType): string[] {
  const config = AGENT_CONFIG[agent];
  const dirs = [config.skillsDir];
  if (config.altSkillsDirs) {
    dirs.push(...config.altSkillsDirs);
  }
  return dirs;
}

/**
 * Get global skills directory for an agent
 */
export function getGlobalSkillsDir(agent: AgentType): string | undefined {
  return AGENT_CONFIG[agent].globalSkillsDir;
}

/**
 * Check if agent supports auto-discovery
 */
export function supportsAutoDiscovery(agent: AgentType): boolean {
  return AGENT_CONFIG[agent].supportsAutoDiscovery;
}

/**
 * Get config format for an agent
 */
export function getConfigFormat(agent: AgentType): AgentDirectoryConfig['configFormat'] {
  return AGENT_CONFIG[agent].configFormat;
}
