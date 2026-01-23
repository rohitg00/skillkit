/**
 * Plugin Manager
 *
 * Manages plugin registration, lifecycle, and execution
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Plugin,
  PluginMetadata,
  PluginHooks,
  PluginContext,
  PluginConfig,
  CommandPlugin,
} from './types.js';
import type { AgentType } from '../types.js';
import type { CanonicalSkill, FormatTranslator } from '../translator/types.js';
import type { GitProviderAdapter } from '../providers/base.js';

const PLUGINS_DIR = '.skillkit/plugins';
const PLUGINS_CONFIG_FILE = 'plugins.json';

interface PluginsState {
  version: number;
  plugins: Record<string, {
    enabled: boolean;
    config: PluginConfig;
    loadedAt?: string;
  }>;
}

/**
 * Plugin Manager class
 */
export class PluginManager {
  private projectPath: string;
  private plugins: Map<string, Plugin> = new Map();
  private translators: Map<string, FormatTranslator> = new Map();
  private providers: Map<string, GitProviderAdapter> = new Map();
  private commands: Map<string, CommandPlugin> = new Map();
  private hooks: Map<string, PluginHooks> = new Map();
  private state: PluginsState;
  private context: PluginContext;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.state = this.loadState();
    this.context = this.createContext();
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    const name = plugin.metadata.name;

    // Check if already registered
    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`);
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${name}" requires "${dep}" which is not loaded`);
        }
      }
    }

    // Initialize plugin
    if (plugin.init) {
      await plugin.init(this.context);
    }

    // Register translators
    if (plugin.translators) {
      for (const t of plugin.translators) {
        this.translators.set(t.agentType, t.translator);
      }
    }

    // Register providers
    if (plugin.providers) {
      for (const p of plugin.providers) {
        this.providers.set(p.providerName, p.provider);
      }
    }

    // Register commands
    if (plugin.commands) {
      for (const c of plugin.commands) {
        this.commands.set(c.name, c);
        if (c.aliases) {
          for (const alias of c.aliases) {
            this.commands.set(alias, c);
          }
        }
      }
    }

    // Register hooks
    if (plugin.hooks) {
      this.hooks.set(name, plugin.hooks);

      // Call onLoad hook
      if (plugin.hooks.onLoad) {
        await plugin.hooks.onLoad(this.context);
      }
    }

    // Store plugin
    this.plugins.set(name, plugin);

    // Update state
    this.state.plugins[name] = {
      enabled: true,
      config: {},
      loadedAt: new Date().toISOString(),
    };
    this.saveState();
  }

  /**
   * Unregister a plugin
   */
  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`);
    }

    // Call onUnload hook
    const hooks = this.hooks.get(name);
    if (hooks?.onUnload) {
      await hooks.onUnload();
    }

    // Cleanup
    if (plugin.destroy) {
      await plugin.destroy();
    }

    // Remove translators
    if (plugin.translators) {
      for (const t of plugin.translators) {
        this.translators.delete(t.agentType);
      }
    }

    // Remove providers
    if (plugin.providers) {
      for (const p of plugin.providers) {
        this.providers.delete(p.providerName);
      }
    }

    // Remove commands
    if (plugin.commands) {
      for (const c of plugin.commands) {
        this.commands.delete(c.name);
        if (c.aliases) {
          for (const alias of c.aliases) {
            this.commands.delete(alias);
          }
        }
      }
    }

    // Remove hooks
    this.hooks.delete(name);

    // Remove plugin
    this.plugins.delete(name);

    // Update state
    delete this.state.plugins[name];
    this.saveState();
  }

  /**
   * Get a registered plugin
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin metadata for all plugins
   */
  listPlugins(): PluginMetadata[] {
    return this.getAllPlugins().map((p) => p.metadata);
  }

  /**
   * Get a translator by agent type
   */
  getTranslator(agentType: AgentType | string): FormatTranslator | undefined {
    return this.translators.get(agentType);
  }

  /**
   * Get all registered translators
   */
  getAllTranslators(): Map<string, FormatTranslator> {
    return new Map(this.translators);
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): GitProviderAdapter | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): Map<string, GitProviderAdapter> {
    return new Map(this.providers);
  }

  /**
   * Get a command by name
   */
  getCommand(name: string): CommandPlugin | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): CommandPlugin[] {
    return Array.from(new Set(this.commands.values()));
  }

  /**
   * Execute hooks for an event
   */
  async executeHook<K extends keyof PluginHooks>(
    hookName: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ): Promise<void> {
    for (const [, hooks] of this.hooks) {
      const hook = hooks[hookName];
      if (hook) {
        await (hook as (...args: unknown[]) => Promise<void>)(...args);
      }
    }
  }

  /**
   * Execute beforeTranslate hooks (returns transformed skill)
   */
  async executeBeforeTranslate(
    skill: CanonicalSkill,
    targetAgent: AgentType
  ): Promise<CanonicalSkill> {
    let result = skill;
    for (const [, hooks] of this.hooks) {
      if (hooks.beforeTranslate) {
        result = await hooks.beforeTranslate(result, targetAgent);
      }
    }
    return result;
  }

  /**
   * Execute afterTranslate hooks (returns transformed content)
   */
  async executeAfterTranslate(
    content: string,
    targetAgent: AgentType
  ): Promise<string> {
    let result = content;
    for (const [, hooks] of this.hooks) {
      if (hooks.afterTranslate) {
        result = await hooks.afterTranslate(result, targetAgent);
      }
    }
    return result;
  }

  /**
   * Set plugin configuration
   */
  setPluginConfig(name: string, config: PluginConfig): void {
    if (!this.state.plugins[name]) {
      this.state.plugins[name] = { enabled: true, config };
    } else {
      this.state.plugins[name].config = config;
    }
    this.saveState();
  }

  /**
   * Get plugin configuration
   */
  getPluginConfig(name: string): PluginConfig | undefined {
    return this.state.plugins[name]?.config;
  }

  /**
   * Enable a plugin
   */
  enablePlugin(name: string): void {
    if (this.state.plugins[name]) {
      this.state.plugins[name].enabled = true;
      this.saveState();
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(name: string): void {
    if (this.state.plugins[name]) {
      this.state.plugins[name].enabled = false;
      this.saveState();
    }
  }

  /**
   * Check if plugin is enabled
   */
  isPluginEnabled(name: string): boolean {
    return this.state.plugins[name]?.enabled ?? true;
  }

  // Private helpers

  private loadState(): PluginsState {
    const statePath = join(this.projectPath, PLUGINS_DIR, PLUGINS_CONFIG_FILE);
    if (existsSync(statePath)) {
      try {
        return JSON.parse(readFileSync(statePath, 'utf-8'));
      } catch {
        // Return default state on error
      }
    }
    return { version: 1, plugins: {} };
  }

  private saveState(): void {
    const pluginsDir = join(this.projectPath, PLUGINS_DIR);
    if (!existsSync(pluginsDir)) {
      mkdirSync(pluginsDir, { recursive: true });
    }
    const statePath = join(pluginsDir, PLUGINS_CONFIG_FILE);
    writeFileSync(statePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  private createContext(): PluginContext {
    return {
      projectPath: this.projectPath,
      skillkitVersion: '1.4.0',
      config: {},
      log: {
        info: (msg) => console.log(`[plugin] ${msg}`),
        warn: (msg) => console.warn(`[plugin] ${msg}`),
        error: (msg) => console.error(`[plugin] ${msg}`),
        debug: (msg) => {
          if (process.env.DEBUG) console.log(`[plugin:debug] ${msg}`);
        },
      },
      getTranslator: (agentType) => this.translators.get(agentType),
      getProvider: (name) => this.providers.get(name),
    };
  }
}

/**
 * Create a plugin manager instance
 */
export function createPluginManager(projectPath: string): PluginManager {
  return new PluginManager(projectPath);
}
