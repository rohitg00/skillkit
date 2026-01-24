/**
 * Bootstrap Files System
 *
 * Implements bootstrap file generation for agents that support them.
 */

import type {
  BootstrapFile,
  BootstrapFileType,
} from './types.js';

/**
 * Default bootstrap file names for each type
 */
const DEFAULT_FILE_NAMES: Record<BootstrapFileType, string> = {
  agents: 'AGENTS.md',
  soul: 'SOUL.md',
  tools: 'TOOLS.md',
  identity: 'IDENTITY.md',
  context: 'CONTEXT.md',
  brief: 'BRIEF.md',
  history: 'HISTORY.md',
};

/**
 * BootstrapManager - Manage bootstrap files for agents
 */
export class BootstrapManager {
  private files: Map<BootstrapFileType, BootstrapFile> = new Map();

  /**
   * Add a bootstrap file
   */
  addFile(file: BootstrapFile): void {
    this.files.set(file.type, file);
  }

  /**
   * Get a bootstrap file by type
   */
  getFile(type: BootstrapFileType): BootstrapFile | undefined {
    return this.files.get(type);
  }

  /**
   * Get all bootstrap files
   */
  getAllFiles(): BootstrapFile[] {
    return Array.from(this.files.values());
  }

  /**
   * Get files sorted by priority
   */
  getFilesByPriority(): BootstrapFile[] {
    return this.getAllFiles().sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Remove a bootstrap file
   */
  removeFile(type: BootstrapFileType): boolean {
    return this.files.delete(type);
  }

  /**
   * Check if a file type exists
   */
  hasFile(type: BootstrapFileType): boolean {
    return this.files.has(type);
  }

  /**
   * Create AGENTS.md file
   */
  createAgentsFile(agents: AgentDefinition[]): void {
    const lines: string[] = [];

    lines.push('# Agents');
    lines.push('');
    lines.push('This file defines the available agents and their capabilities.');
    lines.push('');

    for (const agent of agents) {
      lines.push(`## ${agent.name}`);
      lines.push('');
      if (agent.description) {
        lines.push(agent.description);
        lines.push('');
      }
      if (agent.capabilities && agent.capabilities.length > 0) {
        lines.push('### Capabilities');
        lines.push('');
        for (const cap of agent.capabilities) {
          lines.push(`- ${cap}`);
        }
        lines.push('');
      }
      if (agent.constraints && agent.constraints.length > 0) {
        lines.push('### Constraints');
        lines.push('');
        for (const constraint of agent.constraints) {
          lines.push(`- ${constraint}`);
        }
        lines.push('');
      }
    }

    this.addFile({
      type: 'agents',
      name: 'AGENTS.md',
      content: lines.join('\n'),
      priority: 100,
      required: true,
    });
  }

  /**
   * Create SOUL.md file
   */
  createSoulFile(soul: SoulDefinition): void {
    const lines: string[] = [];

    lines.push('# Soul');
    lines.push('');
    lines.push('This file defines the personality and behavior of the agent.');
    lines.push('');

    if (soul.personality) {
      lines.push('## Personality');
      lines.push('');
      lines.push(soul.personality);
      lines.push('');
    }

    if (soul.values && soul.values.length > 0) {
      lines.push('## Values');
      lines.push('');
      for (const value of soul.values) {
        lines.push(`- ${value}`);
      }
      lines.push('');
    }

    if (soul.communication) {
      lines.push('## Communication Style');
      lines.push('');
      lines.push(soul.communication);
      lines.push('');
    }

    if (soul.rules && soul.rules.length > 0) {
      lines.push('## Rules');
      lines.push('');
      for (const rule of soul.rules) {
        lines.push(`- ${rule}`);
      }
      lines.push('');
    }

    this.addFile({
      type: 'soul',
      name: 'SOUL.md',
      content: lines.join('\n'),
      priority: 90,
    });
  }

  /**
   * Create TOOLS.md file
   */
  createToolsFile(tools: ToolDefinition[]): void {
    const lines: string[] = [];

    lines.push('# Tools');
    lines.push('');
    lines.push('This file defines the available tools and their usage.');
    lines.push('');

    for (const tool of tools) {
      lines.push(`## ${tool.name}`);
      lines.push('');
      if (tool.description) {
        lines.push(tool.description);
        lines.push('');
      }
      if (tool.usage) {
        lines.push('### Usage');
        lines.push('');
        lines.push('```');
        lines.push(tool.usage);
        lines.push('```');
        lines.push('');
      }
      if (tool.examples && tool.examples.length > 0) {
        lines.push('### Examples');
        lines.push('');
        for (const example of tool.examples) {
          lines.push(`- ${example}`);
        }
        lines.push('');
      }
    }

    this.addFile({
      type: 'tools',
      name: 'TOOLS.md',
      content: lines.join('\n'),
      priority: 80,
    });
  }

  /**
   * Create IDENTITY.md file
   */
  createIdentityFile(identity: IdentityDefinition): void {
    const lines: string[] = [];

    lines.push('# Identity');
    lines.push('');

    if (identity.name) {
      lines.push(`**Name:** ${identity.name}`);
      lines.push('');
    }

    if (identity.role) {
      lines.push(`**Role:** ${identity.role}`);
      lines.push('');
    }

    if (identity.description) {
      lines.push('## Description');
      lines.push('');
      lines.push(identity.description);
      lines.push('');
    }

    if (identity.expertise && identity.expertise.length > 0) {
      lines.push('## Expertise');
      lines.push('');
      for (const exp of identity.expertise) {
        lines.push(`- ${exp}`);
      }
      lines.push('');
    }

    this.addFile({
      type: 'identity',
      name: 'IDENTITY.md',
      content: lines.join('\n'),
      priority: 95,
    });
  }

  /**
   * Create CONTEXT.md file
   */
  createContextFile(context: ContextDefinition): void {
    const lines: string[] = [];

    lines.push('# Context');
    lines.push('');

    if (context.project) {
      lines.push('## Project');
      lines.push('');
      lines.push(context.project);
      lines.push('');
    }

    if (context.techStack && context.techStack.length > 0) {
      lines.push('## Tech Stack');
      lines.push('');
      for (const tech of context.techStack) {
        lines.push(`- ${tech}`);
      }
      lines.push('');
    }

    if (context.conventions && context.conventions.length > 0) {
      lines.push('## Conventions');
      lines.push('');
      for (const conv of context.conventions) {
        lines.push(`- ${conv}`);
      }
      lines.push('');
    }

    if (context.currentTask) {
      lines.push('## Current Task');
      lines.push('');
      lines.push(context.currentTask);
      lines.push('');
    }

    this.addFile({
      type: 'context',
      name: 'CONTEXT.md',
      content: lines.join('\n'),
      priority: 70,
    });
  }

  /**
   * Generate all files as a map
   */
  generateFiles(): Map<string, string> {
    const files = new Map<string, string>();

    for (const file of this.getFilesByPriority()) {
      files.set(file.name, file.content);
    }

    return files;
  }

  /**
   * Generate combined content for agents without file support
   */
  generateCombinedContent(): string {
    const lines: string[] = [];

    for (const file of this.getFilesByPriority()) {
      lines.push(`<!-- ${file.name} -->`);
      lines.push('');
      lines.push(file.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get default file name for a type
   */
  static getDefaultFileName(type: BootstrapFileType): string {
    return DEFAULT_FILE_NAMES[type];
  }
}

/**
 * Agent definition for AGENTS.md
 */
export interface AgentDefinition {
  name: string;
  description?: string;
  capabilities?: string[];
  constraints?: string[];
}

/**
 * Soul definition for SOUL.md
 */
export interface SoulDefinition {
  personality?: string;
  values?: string[];
  communication?: string;
  rules?: string[];
}

/**
 * Tool definition for TOOLS.md
 */
export interface ToolDefinition {
  name: string;
  description?: string;
  usage?: string;
  examples?: string[];
}

/**
 * Identity definition for IDENTITY.md
 */
export interface IdentityDefinition {
  name?: string;
  role?: string;
  description?: string;
  expertise?: string[];
}

/**
 * Context definition for CONTEXT.md
 */
export interface ContextDefinition {
  project?: string;
  techStack?: string[];
  conventions?: string[];
  currentTask?: string;
}

/**
 * Create a BootstrapManager instance
 */
export function createBootstrapManager(): BootstrapManager {
  return new BootstrapManager();
}

/**
 * Create a complete bootstrap set from definitions
 */
export function createBootstrapSet(options: {
  agents?: AgentDefinition[];
  soul?: SoulDefinition;
  tools?: ToolDefinition[];
  identity?: IdentityDefinition;
  context?: ContextDefinition;
}): BootstrapManager {
  const manager = new BootstrapManager();

  if (options.agents) {
    manager.createAgentsFile(options.agents);
  }

  if (options.soul) {
    manager.createSoulFile(options.soul);
  }

  if (options.tools) {
    manager.createToolsFile(options.tools);
  }

  if (options.identity) {
    manager.createIdentityFile(options.identity);
  }

  if (options.context) {
    manager.createContextFile(options.context);
  }

  return manager;
}
