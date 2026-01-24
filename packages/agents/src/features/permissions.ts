/**
 * Permissions System
 *
 * Implements permission patterns for agent skill access control.
 */

import { minimatch } from 'minimatch';
import type {
  PermissionConfig,
  PermissionPattern,
  PermissionLevel,
} from './types.js';

/**
 * PermissionManager - Manage skill permissions
 */
export class PermissionManager {
  private config: PermissionConfig;

  constructor(config?: PermissionConfig) {
    this.config = config || { default: 'ask' };
  }

  /**
   * Set permission configuration
   */
  setConfig(config: PermissionConfig): void {
    this.config = config;
  }

  /**
   * Get permission configuration
   */
  getConfig(): PermissionConfig {
    return this.config;
  }

  /**
   * Check file access permission
   */
  checkFileAccess(path: string): PermissionLevel {
    return this.checkPattern(path, this.config.files);
  }

  /**
   * Check command execution permission
   */
  checkCommandAccess(command: string): PermissionLevel {
    return this.checkPattern(command, this.config.commands);
  }

  /**
   * Check network access permission
   */
  checkNetworkAccess(url: string): PermissionLevel {
    return this.checkPattern(url, this.config.network);
  }

  /**
   * Check environment variable access
   */
  checkEnvAccess(varName: string): PermissionLevel {
    return this.checkPattern(varName, this.config.env);
  }

  /**
   * Add file permission pattern
   */
  addFilePattern(pattern: PermissionPattern): void {
    if (!this.config.files) {
      this.config.files = [];
    }
    this.config.files.push(pattern);
  }

  /**
   * Add command permission pattern
   */
  addCommandPattern(pattern: PermissionPattern): void {
    if (!this.config.commands) {
      this.config.commands = [];
    }
    this.config.commands.push(pattern);
  }

  /**
   * Check pattern against permission list
   */
  private checkPattern(
    value: string,
    patterns?: PermissionPattern[]
  ): PermissionLevel {
    if (!patterns || patterns.length === 0) {
      return this.config.default || 'ask';
    }

    // Check patterns in order (first match wins)
    for (const pattern of patterns) {
      if (this.matchPattern(value, pattern.pattern)) {
        return pattern.level;
      }
    }

    return this.config.default || 'ask';
  }

  /**
   * Match value against pattern (glob-style)
   *
   * Uses minimatch for safe glob matching, avoiding ReDoS vulnerabilities.
   */
  private matchPattern(value: string, pattern: string): boolean {
    // Use minimatch for safe, battle-tested glob matching
    // nocase option ensures case-insensitive matching
    return minimatch(value, pattern, { nocase: true });
  }

  /**
   * Generate OpenCode-compatible permission config
   */
  generateOpenCodeConfig(): string {
    const lines: string[] = [];

    lines.push('# Permission Configuration');
    lines.push('');

    if (this.config.files && this.config.files.length > 0) {
      lines.push('## File Access');
      lines.push('');
      for (const pattern of this.config.files) {
        lines.push(`- ${pattern.level}: \`${pattern.pattern}\``);
        if (pattern.reason) {
          lines.push(`  - Reason: ${pattern.reason}`);
        }
      }
      lines.push('');
    }

    if (this.config.commands && this.config.commands.length > 0) {
      lines.push('## Command Execution');
      lines.push('');
      for (const pattern of this.config.commands) {
        lines.push(`- ${pattern.level}: \`${pattern.pattern}\``);
        if (pattern.reason) {
          lines.push(`  - Reason: ${pattern.reason}`);
        }
      }
      lines.push('');
    }

    if (this.config.network && this.config.network.length > 0) {
      lines.push('## Network Access');
      lines.push('');
      for (const pattern of this.config.network) {
        lines.push(`- ${pattern.level}: \`${pattern.pattern}\``);
        if (pattern.reason) {
          lines.push(`  - Reason: ${pattern.reason}`);
        }
      }
      lines.push('');
    }

    lines.push(`Default: ${this.config.default || 'ask'}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate SKILL.md metadata for permissions
   */
  generateSkillMetadata(): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    if (this.config.files) {
      metadata.filePermissions = this.config.files.map((p) => ({
        pattern: p.pattern,
        level: p.level,
      }));
    }

    if (this.config.commands) {
      metadata.commandPermissions = this.config.commands.map((p) => ({
        pattern: p.pattern,
        level: p.level,
      }));
    }

    if (this.config.network) {
      metadata.networkPermissions = this.config.network.map((p) => ({
        pattern: p.pattern,
        level: p.level,
      }));
    }

    if (this.config.default) {
      metadata.defaultPermission = this.config.default;
    }

    return metadata;
  }

  /**
   * Parse permissions from SKILL.md metadata
   */
  static fromMetadata(metadata: Record<string, unknown>): PermissionConfig {
    const config: PermissionConfig = {};

    if (metadata.filePermissions && Array.isArray(metadata.filePermissions)) {
      config.files = metadata.filePermissions as PermissionPattern[];
    }

    if (metadata.commandPermissions && Array.isArray(metadata.commandPermissions)) {
      config.commands = metadata.commandPermissions as PermissionPattern[];
    }

    if (metadata.networkPermissions && Array.isArray(metadata.networkPermissions)) {
      config.network = metadata.networkPermissions as PermissionPattern[];
    }

    if (metadata.defaultPermission) {
      config.default = metadata.defaultPermission as PermissionLevel;
    }

    return config;
  }

  /**
   * Merge two permission configs
   */
  static merge(base: PermissionConfig, override: PermissionConfig): PermissionConfig {
    return {
      files: [...(base.files || []), ...(override.files || [])],
      commands: [...(base.commands || []), ...(override.commands || [])],
      network: [...(base.network || []), ...(override.network || [])],
      env: [...(base.env || []), ...(override.env || [])],
      default: override.default || base.default,
    };
  }
}

/**
 * Create a PermissionManager instance
 */
export function createPermissionManager(config?: PermissionConfig): PermissionManager {
  return new PermissionManager(config);
}

/**
 * Quick permission check helpers
 */
export function isAllowed(level: PermissionLevel): boolean {
  return level === 'allow';
}

export function isDenied(level: PermissionLevel): boolean {
  return level === 'deny';
}

export function needsConfirmation(level: PermissionLevel): boolean {
  return level === 'ask';
}
