/**
 * Multi-Mode System
 *
 * Implements multi-mode support for agents that support different operating modes.
 */

import type { AgentMode, ModeConfig } from './types.js';

/**
 * Default mode configurations
 */
const DEFAULT_MODES: Record<AgentMode, Omit<ModeConfig, 'skills'>> = {
  code: {
    mode: 'code',
    description: 'Code editing and implementation mode',
    promptPrefix: 'You are in code mode. Focus on writing and editing code.',
  },
  architect: {
    mode: 'architect',
    description: 'Architecture and planning mode',
    promptPrefix: 'You are in architect mode. Focus on system design and planning.',
  },
  ask: {
    mode: 'ask',
    description: 'Question and answer mode',
    promptPrefix: 'You are in ask mode. Focus on answering questions clearly.',
  },
  debug: {
    mode: 'debug',
    description: 'Debugging and troubleshooting mode',
    promptPrefix: 'You are in debug mode. Focus on finding and fixing issues.',
  },
  review: {
    mode: 'review',
    description: 'Code review mode',
    promptPrefix: 'You are in review mode. Focus on reviewing code quality.',
  },
  test: {
    mode: 'test',
    description: 'Testing mode',
    promptPrefix: 'You are in test mode. Focus on writing and running tests.',
  },
  docs: {
    mode: 'docs',
    description: 'Documentation mode',
    promptPrefix: 'You are in docs mode. Focus on writing documentation.',
  },
};

/**
 * ModeManager - Manage agent operating modes
 */
export class ModeManager {
  private modes: Map<AgentMode, ModeConfig> = new Map();
  private currentMode: AgentMode = 'code';
  private modeListeners: Set<ModeChangeListener> = new Set();

  constructor(modes?: ModeConfig[]) {
    if (modes) {
      for (const mode of modes) {
        this.addMode(mode);
      }
    }
  }

  /**
   * Add a mode configuration
   */
  addMode(config: ModeConfig): void {
    this.modes.set(config.mode, config);
  }

  /**
   * Get a mode configuration
   */
  getMode(mode: AgentMode): ModeConfig | undefined {
    return this.modes.get(mode);
  }

  /**
   * Get all mode configurations
   */
  getAllModes(): ModeConfig[] {
    return Array.from(this.modes.values());
  }

  /**
   * Get available mode names
   */
  getAvailableModes(): AgentMode[] {
    return Array.from(this.modes.keys());
  }

  /**
   * Set the current mode
   */
  setMode(mode: AgentMode): void {
    const config = this.modes.get(mode);
    if (!config) {
      throw new Error(`Mode not configured: ${mode}`);
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Notify listeners
    for (const listener of this.modeListeners) {
      listener(mode, previousMode, config);
    }
  }

  /**
   * Get the current mode
   */
  getCurrentMode(): AgentMode {
    return this.currentMode;
  }

  /**
   * Get current mode configuration
   */
  getCurrentModeConfig(): ModeConfig | undefined {
    return this.modes.get(this.currentMode);
  }

  /**
   * Get skills for current mode
   */
  getCurrentSkills(): string[] {
    const config = this.getCurrentModeConfig();
    return config?.skills || [];
  }

  /**
   * Get tools for current mode
   */
  getCurrentTools(): string[] {
    const config = this.getCurrentModeConfig();
    return config?.tools || [];
  }

  /**
   * Check if a skill is available in current mode
   */
  isSkillAvailable(skillName: string): boolean {
    const skills = this.getCurrentSkills();
    return skills.length === 0 || skills.includes(skillName);
  }

  /**
   * Check if a file is allowed in current mode
   */
  isFileAllowed(filePath: string): boolean {
    const config = this.getCurrentModeConfig();
    if (!config?.allowedFiles || config.allowedFiles.length === 0) {
      return true;
    }

    return config.allowedFiles.some((pattern) => {
      // Escape special regex characters except * and ?
      let regexPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

      // Handle **/ at start (matches any path prefix or nothing)
      regexPattern = regexPattern.replace(/^\*\*\//, '(?:.*/)?');

      // Handle /**/ in middle (matches any path segment or nothing)
      regexPattern = regexPattern.replace(/\/\*\*\//g, '(?:/.*)?/');

      // Handle /** at end (matches any path suffix)
      regexPattern = regexPattern.replace(/\/\*\*$/, '(?:/.*)?');

      // Handle remaining ** (match any path)
      regexPattern = regexPattern.replace(/\*\*/g, '.*');

      // Handle * (match any except /)
      regexPattern = regexPattern.replace(/\*/g, '[^/]*');

      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(filePath);
    });
  }

  /**
   * Add mode change listener
   */
  addModeListener(listener: ModeChangeListener): void {
    this.modeListeners.add(listener);
  }

  /**
   * Remove mode change listener
   */
  removeModeListener(listener: ModeChangeListener): void {
    this.modeListeners.delete(listener);
  }

  /**
   * Create a mode from default configuration
   */
  addDefaultMode(mode: AgentMode, skills: string[]): void {
    const defaultConfig = DEFAULT_MODES[mode];
    this.addMode({
      ...defaultConfig,
      skills,
    });
  }

  /**
   * Generate mode-specific prompt prefix
   */
  getPromptPrefix(): string {
    const config = this.getCurrentModeConfig();
    return config?.promptPrefix || '';
  }

  /**
   * Generate Roo-compatible mode configuration
   */
  generateRooConfig(): Record<string, unknown> {
    const modes: Record<string, unknown> = {};

    for (const config of this.modes.values()) {
      modes[config.mode] = {
        description: config.description,
        skills: config.skills,
        tools: config.tools,
        promptPrefix: config.promptPrefix,
      };
    }

    return {
      defaultMode: this.currentMode,
      modes,
    };
  }

  /**
   * Generate mode documentation
   */
  generateModeDocumentation(): string {
    const lines: string[] = [];

    lines.push('# Available Modes');
    lines.push('');

    for (const config of this.modes.values()) {
      lines.push(`## ${config.mode}`);
      lines.push('');
      lines.push(config.description);
      lines.push('');

      if (config.skills.length > 0) {
        lines.push('### Skills');
        lines.push('');
        for (const skill of config.skills) {
          lines.push(`- ${skill}`);
        }
        lines.push('');
      }

      if (config.tools && config.tools.length > 0) {
        lines.push('### Tools');
        lines.push('');
        for (const tool of config.tools) {
          lines.push(`- ${tool}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}

/**
 * Mode change listener type
 */
export type ModeChangeListener = (
  newMode: AgentMode,
  previousMode: AgentMode,
  config: ModeConfig
) => void;

/**
 * Create a ModeManager instance
 */
export function createModeManager(modes?: ModeConfig[]): ModeManager {
  return new ModeManager(modes);
}

/**
 * Create a ModeManager with all default modes
 */
export function createDefaultModeManager(
  skillsPerMode: Partial<Record<AgentMode, string[]>>
): ModeManager {
  const manager = new ModeManager();

  for (const [mode, config] of Object.entries(DEFAULT_MODES)) {
    const skills = skillsPerMode[mode as AgentMode] || [];
    manager.addMode({
      ...config,
      skills,
    });
  }

  return manager;
}

/**
 * Get default configuration for a mode
 */
export function getDefaultModeConfig(mode: AgentMode): Omit<ModeConfig, 'skills'> {
  return DEFAULT_MODES[mode];
}

/**
 * All available agent modes
 */
export const ALL_MODES: AgentMode[] = ['code', 'architect', 'ask', 'debug', 'review', 'test', 'docs'];
