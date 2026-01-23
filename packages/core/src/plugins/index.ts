/**
 * Plugin System
 *
 * Enables extensibility through:
 * - Custom translators for new agent formats
 * - Custom providers for new skill sources
 * - Custom commands for CLI extensions
 * - Hooks for skill lifecycle events
 */

export { PluginManager, createPluginManager } from './manager.js';
export { PluginLoader, loadPlugin, loadPluginsFromDirectory } from './loader.js';
export type {
  Plugin,
  PluginMetadata,
  PluginHooks,
  TranslatorPlugin,
  ProviderPlugin,
  CommandPlugin,
  PluginContext,
  PluginConfig,
} from './types.js';
