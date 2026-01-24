/**
 * Command Types
 *
 * Type definitions for slash commands and agent integration.
 */

import type { AgentType } from '../types.js';

/**
 * Command argument definition
 */
export interface CommandArg {
  /** Argument name */
  name: string;
  /** Argument description */
  description: string;
  /** Whether the argument is required */
  required?: boolean;
  /** Default value */
  default?: string;
  /** Argument type */
  type?: 'string' | 'number' | 'boolean' | 'file' | 'choice';
  /** Valid choices (for type: 'choice') */
  choices?: string[];
  /** Validation pattern (regex) */
  pattern?: string;
}

/**
 * Slash command definition
 */
export interface SlashCommand {
  /** Command name (without slash) */
  name: string;
  /** Command description */
  description: string;
  /** Skill to invoke when command is executed */
  skill: string;
  /** Alternative names for the command */
  aliases?: string[];
  /** Whether to disable model invocation (user-only) */
  disableModelInvocation?: boolean;
  /** Command arguments */
  args?: CommandArg[];
  /** Category for grouping */
  category?: string;
  /** Usage examples */
  examples?: string[];
  /** Tags for filtering */
  tags?: string[];
  /** Priority for ordering */
  priority?: number;
  /** Whether the command is hidden from help */
  hidden?: boolean;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Command execution context
 */
export interface CommandContext {
  /** The command being executed */
  command: SlashCommand;
  /** Parsed arguments */
  args: Record<string, unknown>;
  /** Agent executing the command */
  agent: AgentType;
  /** Working directory */
  cwd: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Additional context */
  metadata?: Record<string, unknown>;
}

/**
 * Command execution result
 */
export interface SlashCommandResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Output message */
  output?: string;
  /** Error message if failed */
  error?: string;
  /** Data returned by the command */
  data?: unknown;
  /** Duration in milliseconds */
  durationMs?: number;
}

/**
 * Command handler function
 */
export type CommandHandler = (context: CommandContext) => Promise<SlashCommandResult>;

/**
 * Registered command with handler
 */
export interface RegisteredCommand extends SlashCommand {
  /** Command handler function */
  handler?: CommandHandler;
  /** Whether the command is enabled */
  enabled: boolean;
  /** Source of the command (plugin, skill, etc.) */
  source?: string;
}

/**
 * Command registry options
 */
export interface CommandRegistryOptions {
  /** Allow command overrides */
  allowOverrides?: boolean;
  /** Validate commands on registration */
  validateOnRegister?: boolean;
  /** Default handler for commands without one */
  defaultHandler?: CommandHandler;
}

/**
 * Command generator options
 */
export interface CommandGeneratorOptions {
  /** Target agent */
  agent: AgentType;
  /** Include hidden commands */
  includeHidden?: boolean;
  /** Include disabled commands */
  includeDisabled?: boolean;
  /** Output format */
  format?: 'markdown' | 'json' | 'native';
  /** Custom template */
  template?: string;
}

/**
 * Command search options
 */
export interface CommandSearchOptions {
  /** Search query */
  query?: string;
  /** Filter by category */
  category?: string;
  /** Filter by tags */
  tags?: string[];
  /** Include hidden commands */
  includeHidden?: boolean;
  /** Include disabled commands */
  includeDisabled?: boolean;
  /** Maximum results */
  limit?: number;
}

/**
 * Command validation result
 */
export interface CommandValidationResult {
  /** Whether the command is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Agent command format
 */
export interface AgentCommandFormat {
  /** Agent type */
  agent: AgentType;
  /** File extension */
  extension: string;
  /** Directory for commands */
  directory: string;
  /** Whether agent supports slash commands */
  supportsSlashCommands: boolean;
  /** Whether agent supports command files */
  supportsCommandFiles: boolean;
  /** Template for generating commands */
  template?: string;
}

/**
 * Command event types
 */
export type CommandEvent =
  | 'command:registered'
  | 'command:unregistered'
  | 'command:enabled'
  | 'command:disabled'
  | 'command:executed'
  | 'command:failed';

/**
 * Command event listener
 */
export type CommandEventListener = (
  event: CommandEvent,
  command: RegisteredCommand,
  result?: SlashCommandResult
) => void;

/**
 * Command import/export format
 */
export interface CommandBundle {
  /** Bundle version */
  version: string;
  /** Commands in the bundle */
  commands: SlashCommand[];
  /** Bundle metadata */
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    createdAt?: Date;
  };
}
