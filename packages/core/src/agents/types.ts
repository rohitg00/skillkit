/**
 * Agent Types
 *
 * Types for custom AI sub-agents (e.g., .claude/agents/*.md)
 * Based on Claude Code's agent specification.
 */

import { z } from 'zod';
import type { AgentType } from '../types.js';

/**
 * Agent permission modes
 */
export const AgentPermissionMode = z.enum([
  'default',      // Normal permission prompts
  'plan',         // Plan mode - ask before executing
  'auto-edit',    // Auto-accept edits
  'full-auto',    // Auto-accept everything (dangerous)
  'bypassPermissions', // Skip all permission checks
]);
export type AgentPermissionMode = z.infer<typeof AgentPermissionMode>;

/**
 * Agent hook definition
 */
export const AgentHook = z.object({
  /** Hook event type */
  type: z.enum([
    'PreToolUse',
    'PostToolUse',
    'Stop',
    'SubagentStop',
    'SessionStart',
    'SessionEnd',
  ]),
  /** Command to run */
  command: z.string(),
  /** Timeout in milliseconds */
  timeout: z.number().optional(),
  /** Run only once */
  once: z.boolean().optional(),
  /** Tool matcher (for PreToolUse/PostToolUse) */
  matcher: z.string().optional(),
});
export type AgentHook = z.infer<typeof AgentHook>;

/**
 * Agent frontmatter schema
 */
export const AgentFrontmatter = z.object({
  /** Agent name (kebab-case) */
  name: z.string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Agent name must be lowercase alphanumeric with hyphens'),
  /** Description of what this agent does */
  description: z.string().min(1).max(1024),
  /** Model to use (e.g., 'opus', 'sonnet', 'haiku') */
  model: z.string().optional(),
  /** Permission mode for this agent */
  permissionMode: AgentPermissionMode.optional(),
  /** Tools this agent cannot use */
  disallowedTools: z.array(z.string()).optional(),
  /** Allowed tools for this agent */
  allowedTools: z.union([
    z.array(z.string()),
    z.string(), // YAML-style list in frontmatter
  ]).optional(),
  /** Agent-scoped hooks */
  hooks: z.array(AgentHook).optional(),
  /** Skills to auto-load for this agent */
  skills: z.array(z.string()).optional(),
  /** Run in forked sub-agent context */
  context: z.enum(['fork', 'inline']).optional(),
  /** Version */
  version: z.string().optional(),
  /** Author */
  author: z.string().optional(),
  /** Tags for categorization */
  tags: z.array(z.string()).optional(),
  /** Whether agent is user-invocable via @mention */
  'user-invocable': z.boolean().optional(),
  /** Argument hint for agent invocation */
  'argument-hint': z.string().optional(),
});
export type AgentFrontmatter = z.infer<typeof AgentFrontmatter>;

/**
 * Agent location (project or global)
 */
export const AgentLocation = z.enum(['project', 'global']);
export type AgentLocation = z.infer<typeof AgentLocation>;

/**
 * Agent metadata (stored in .skillkit-agent.json)
 */
export const AgentMetadata = z.object({
  name: z.string(),
  description: z.string(),
  source: z.string(),
  sourceType: z.enum(['github', 'gitlab', 'bitbucket', 'local']),
  subpath: z.string().optional(),
  installedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  enabled: z.boolean().default(true),
  version: z.string().optional(),
  checksum: z.string().optional(),
});
export type AgentMetadata = z.infer<typeof AgentMetadata>;

/**
 * Parsed agent definition
 */
export interface CustomAgent {
  /** Agent name */
  name: string;
  /** Description */
  description: string;
  /** Path to agent directory or file */
  path: string;
  /** Project or global location */
  location: AgentLocation;
  /** Full frontmatter */
  frontmatter: AgentFrontmatter;
  /** Agent content (system prompt) */
  content: string;
  /** Metadata if installed via skillkit */
  metadata?: AgentMetadata;
  /** Whether agent is enabled */
  enabled: boolean;
}

/**
 * Canonical agent for translation
 */
export interface CanonicalAgent {
  /** Agent name */
  name: string;
  /** Description */
  description: string;
  /** Model to use */
  model?: string;
  /** Permission mode */
  permissionMode?: AgentPermissionMode;
  /** Disallowed tools */
  disallowedTools?: string[];
  /** Allowed tools */
  allowedTools?: string[];
  /** Agent-scoped hooks */
  hooks?: AgentHook[];
  /** Skills to load */
  skills?: string[];
  /** Execution context */
  context?: 'fork' | 'inline';
  /** Version */
  version?: string;
  /** Author */
  author?: string;
  /** Tags */
  tags?: string[];
  /** User invocable */
  userInvocable?: boolean;
  /** Argument hint */
  argumentHint?: string;
  /** Main content (system prompt) */
  content: string;
  /** Source format */
  sourceFormat: AgentFormatCategory;
  /** Source agent type */
  sourceAgent?: AgentType;
}

/**
 * Agent format categories
 */
export type AgentFormatCategory =
  | 'claude-agent'    // Claude Code .claude/agents/*.md
  | 'cursor-agent'    // Cursor agent format (if different)
  | 'universal';      // Universal agent format

/**
 * Agent translation result
 */
export interface AgentTranslationResult {
  /** Whether translation succeeded */
  success: boolean;
  /** Translated content */
  content: string;
  /** Output filename */
  filename: string;
  /** Warnings during translation */
  warnings: string[];
  /** Features that couldn't be translated */
  incompatible: string[];
  /** Target format */
  targetFormat: AgentFormatCategory;
  /** Target agent type */
  targetAgent: AgentType;
}

/**
 * Agent translation options
 */
export interface AgentTranslationOptions {
  /** Preserve original comments */
  preserveComments?: boolean;
  /** Add translation metadata */
  addMetadata?: boolean;
  /** Custom output filename */
  outputFilename?: string;
}

/**
 * Agent discovery paths per AI coding agent (2026 updated)
 */
export const AGENT_DISCOVERY_PATHS: Record<AgentType, string[]> = {
  'claude-code': ['.claude/agents'],
  'cursor': ['.cursor/agents', '.cursor/commands'],
  'codex': ['.codex/agents'],
  'gemini-cli': ['.gemini/agents'],
  'opencode': ['.opencode/agents', '.opencode/agent'],
  'antigravity': ['.antigravity/agents'],
  'amp': ['.amp/agents'],
  'clawdbot': ['.clawdbot/agents', 'agents'],
  'droid': ['.factory/agents'],
  'github-copilot': ['.github/agents', '.github/instructions', '.github/custom-agents'],
  'goose': ['.goose/agents'],
  'kilo': ['.kilocode/agents', '.kilocode/modes'],
  'kiro-cli': ['.kiro/agents'],
  'roo': ['.roo/agents', '.roo/modes'],
  'trae': ['.trae/agents', '.trae/agent'],
  'windsurf': ['.windsurf/agents', '.windsurf/workflows'],
  'universal': ['agents', '.agents'],
};

/**
 * All agent discovery paths (union of all agent paths) - 2026 updated
 */
export const ALL_AGENT_DISCOVERY_PATHS = [
  'agents',
  '.agents',
  '.claude/agents',
  '.cursor/agents',
  '.cursor/commands',
  '.codex/agents',
  '.gemini/agents',
  '.opencode/agents',
  '.opencode/agent',
  '.antigravity/agents',
  '.amp/agents',
  '.clawdbot/agents',
  '.factory/agents',
  '.github/agents',
  '.github/instructions',
  '.github/custom-agents',
  '.goose/agents',
  '.kilocode/agents',
  '.kilocode/modes',
  '.kiro/agents',
  '.roo/agents',
  '.roo/modes',
  '.trae/agents',
  '.trae/agent',
  '.windsurf/agents',
  '.windsurf/workflows',
];

/**
 * Agent format mapping (which agents use which format)
 */
export const CUSTOM_AGENT_FORMAT_MAP: Record<AgentType, AgentFormatCategory> = {
  'claude-code': 'claude-agent',
  'cursor': 'cursor-agent',
  'codex': 'claude-agent',
  'gemini-cli': 'claude-agent',
  'opencode': 'claude-agent',
  'antigravity': 'claude-agent',
  'amp': 'claude-agent',
  'clawdbot': 'claude-agent',
  'droid': 'claude-agent',
  'github-copilot': 'universal',
  'goose': 'claude-agent',
  'kilo': 'claude-agent',
  'kiro-cli': 'claude-agent',
  'roo': 'claude-agent',
  'trae': 'claude-agent',
  'windsurf': 'universal',
  'universal': 'universal',
};
