/**
 * Plugin System Types
 */

import type { AgentType } from '../types.js';
import type { CanonicalSkill, FormatTranslator } from '../translator/types.js';
import type { GitProviderAdapter } from '../providers/base.js';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  name: string;
  /** Plugin version (semver) */
  version: string;
  /** Human-readable description */
  description?: string;
  /** Plugin author */
  author?: string;
  /** Plugin homepage or repository URL */
  homepage?: string;
  /** Required SkillKit version */
  skillkitVersion?: string;
  /** Plugin dependencies */
  dependencies?: string[];
  /** Plugin keywords for discovery */
  keywords?: string[];
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
  /** Called when a skill is installed */
  onSkillInstall?: (skill: CanonicalSkill, agent: AgentType) => Promise<void>;
  /** Called when a skill is removed */
  onSkillRemove?: (skillName: string, agent: AgentType) => Promise<void>;
  /** Called when skills are synced */
  onSync?: (agents: AgentType[]) => Promise<void>;
  /** Called before translation */
  beforeTranslate?: (skill: CanonicalSkill, targetAgent: AgentType) => Promise<CanonicalSkill>;
  /** Called after translation */
  afterTranslate?: (content: string, targetAgent: AgentType) => Promise<string>;
  /** Called when plugin is loaded */
  onLoad?: (context: PluginContext) => Promise<void>;
  /** Called when plugin is unloaded */
  onUnload?: () => Promise<void>;
}

/**
 * Translator plugin - adds support for new agent formats
 */
export interface TranslatorPlugin {
  type: 'translator';
  /** Agent type this translator handles */
  agentType: AgentType | string;
  /** The translator implementation */
  translator: FormatTranslator;
}

/**
 * Provider plugin - adds support for new skill sources
 */
export interface ProviderPlugin {
  type: 'provider';
  /** Provider name (e.g., 'bitbucket', 's3') */
  providerName: string;
  /** The provider implementation */
  provider: GitProviderAdapter;
}

/**
 * Command plugin - adds new CLI commands
 */
export interface CommandPlugin {
  type: 'command';
  /** Command name */
  name: string;
  /** Command aliases */
  aliases?: string[];
  /** Command description */
  description: string;
  /** Command options */
  options?: Array<{
    name: string;
    description: string;
    type: 'string' | 'boolean' | 'number';
    required?: boolean;
    default?: unknown;
  }>;
  /** Command handler */
  handler: (args: Record<string, unknown>, context: PluginContext) => Promise<number>;
}

/**
 * Plugin context passed to plugins
 */
export interface PluginContext {
  /** Project path */
  projectPath: string;
  /** SkillKit version */
  skillkitVersion: string;
  /** Plugin configuration */
  config: PluginConfig;
  /** Logger instance */
  log: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
  };
  /** Get a registered translator by agent type */
  getTranslator: (agentType: AgentType) => FormatTranslator | undefined;
  /** Get a registered provider by name */
  getProvider: (name: string) => GitProviderAdapter | undefined;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** Plugin-specific settings */
  settings?: Record<string, unknown>;
  /** Whether plugin is enabled */
  enabled?: boolean;
}

/**
 * Main plugin interface
 */
export interface Plugin {
  /** Plugin metadata */
  metadata: PluginMetadata;
  /** Plugin hooks */
  hooks?: PluginHooks;
  /** Translator extensions */
  translators?: TranslatorPlugin[];
  /** Provider extensions */
  providers?: ProviderPlugin[];
  /** Command extensions */
  commands?: CommandPlugin[];
  /** Plugin initialization */
  init?: (context: PluginContext) => Promise<void>;
  /** Plugin cleanup */
  destroy?: () => Promise<void>;
}
