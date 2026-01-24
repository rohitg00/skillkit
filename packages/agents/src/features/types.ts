/**
 * Agent Features Types
 *
 * Type definitions for enhanced agent-specific features.
 */

import type { AgentType } from '@skillkit/core';

/**
 * Permission level for agent actions
 */
export type PermissionLevel = 'allow' | 'deny' | 'ask';

/**
 * Permission pattern for file/resource access
 */
export interface PermissionPattern {
  /** Pattern to match (glob or regex) */
  pattern: string;
  /** Permission level */
  level: PermissionLevel;
  /** Description of why this permission is needed */
  reason?: string;
}

/**
 * Permission configuration for skills
 */
export interface PermissionConfig {
  /** File access permissions */
  files?: PermissionPattern[];
  /** Command execution permissions */
  commands?: PermissionPattern[];
  /** Network access permissions */
  network?: PermissionPattern[];
  /** Environment variable access */
  env?: PermissionPattern[];
  /** Default permission level */
  default?: PermissionLevel;
}

/**
 * Glob pattern configuration for file-scoped skills
 */
export interface GlobConfig {
  /** Patterns to include */
  include: string[];
  /** Patterns to exclude */
  exclude?: string[];
  /** Whether to match directories */
  matchDirectories?: boolean;
  /** Whether to match hidden files */
  matchHidden?: boolean;
}

/**
 * Bootstrap file types
 */
export type BootstrapFileType =
  | 'agents'      // AGENTS.md - Agent definitions
  | 'soul'        // SOUL.md - Personality and behavior
  | 'tools'       // TOOLS.md - Available tools
  | 'identity'    // IDENTITY.md - Agent identity
  | 'context'     // CONTEXT.md - Context information
  | 'brief'       // BRIEF.md - Project brief
  | 'history';    // HISTORY.md - Conversation history

/**
 * Bootstrap file configuration
 */
export interface BootstrapFile {
  /** File type */
  type: BootstrapFileType;
  /** File name */
  name: string;
  /** File content */
  content: string;
  /** Priority (higher = loaded first) */
  priority?: number;
  /** Whether file is required */
  required?: boolean;
}

/**
 * Agent mode types
 */
export type AgentMode =
  | 'code'       // Code editing mode
  | 'architect'  // Architecture/planning mode
  | 'ask'        // Question/answer mode
  | 'debug'      // Debugging mode
  | 'review'     // Code review mode
  | 'test'       // Testing mode
  | 'docs';      // Documentation mode

/**
 * Mode configuration
 */
export interface ModeConfig {
  /** Mode name */
  mode: AgentMode;
  /** Mode description */
  description: string;
  /** Skills available in this mode */
  skills: string[];
  /** Tools available in this mode */
  tools?: string[];
  /** Default prompt prefix for this mode */
  promptPrefix?: string;
  /** Allowed file patterns in this mode */
  allowedFiles?: string[];
}

/**
 * Tool whitelist configuration
 */
export interface ToolWhitelistConfig {
  /** Allowed tools */
  allowed: string[];
  /** Denied tools */
  denied?: string[];
  /** Mode for handling unlisted tools */
  unlisted?: 'allow' | 'deny' | 'ask';
}

/**
 * Skill package configuration (for .skill bundles)
 */
export interface SkillPackageConfig {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
  /** Package description */
  description?: string;
  /** Entry point skill */
  entryPoint: string;
  /** Included skill files */
  files: string[];
  /** Dependencies */
  dependencies?: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent feature capabilities
 */
export interface AgentCapabilities {
  /** Supports permission system */
  permissions: boolean;
  /** Supports glob patterns */
  globs: boolean;
  /** Supports bootstrap files */
  bootstrapFiles: boolean;
  /** Supports multi-mode */
  multiMode: boolean;
  /** Supports tool whitelisting */
  toolWhitelist: boolean;
  /** Supports .skill packages */
  skillPackages: boolean;
  /** Supports hooks */
  hooks: boolean;
  /** Supports subagents */
  subagents: boolean;
}

/**
 * Agent feature set
 */
export interface AgentFeatures {
  /** Agent type */
  agent: AgentType;
  /** Agent capabilities */
  capabilities: AgentCapabilities;
  /** Permission configuration */
  permissions?: PermissionConfig;
  /** Glob configuration */
  globs?: GlobConfig;
  /** Bootstrap files */
  bootstrapFiles?: BootstrapFile[];
  /** Mode configurations */
  modes?: ModeConfig[];
  /** Tool whitelist */
  toolWhitelist?: ToolWhitelistConfig;
}

/**
 * Feature generation options
 */
export interface FeatureGenerationOptions {
  /** Target agent */
  agent: AgentType;
  /** Output directory */
  outputDir?: string;
  /** Include optional files */
  includeOptional?: boolean;
  /** Dry run (don't write files) */
  dryRun?: boolean;
}

/**
 * Feature validation result
 */
export interface FeatureValidationResult {
  /** Whether features are valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Agent capabilities used */
  usedCapabilities: (keyof AgentCapabilities)[];
}
