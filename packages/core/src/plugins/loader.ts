/**
 * Plugin Loader
 *
 * Loads plugins from various sources:
 * - Local files
 * - npm packages
 * - Git repositories
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, PluginMetadata } from './types.js';

/**
 * Plugin Loader class
 */
export class PluginLoader {
  /**
   * Load a plugin from a file path
   */
  async loadFromFile(filePath: string): Promise<Plugin> {
    if (!existsSync(filePath)) {
      throw new Error(`Plugin file not found: ${filePath}`);
    }

    const ext = extname(filePath);
    if (ext !== '.js' && ext !== '.mjs') {
      throw new Error(`Unsupported plugin file type: ${ext}. Only .js and .mjs files are supported.`);
    }

    try {
      // Use dynamic import for ES modules
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);

      // Plugin can be default export or named export
      const plugin = module.default || module.plugin;

      if (!plugin || !plugin.metadata) {
        throw new Error('Invalid plugin: missing metadata');
      }

      return this.validatePlugin(plugin);
    } catch (err) {
      throw new Error(
        `Failed to load plugin from ${filePath}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Load a plugin from an npm package
   */
  async loadFromPackage(packageName: string): Promise<Plugin> {
    try {
      // Try to resolve the package
      const module = await import(packageName);
      const plugin = module.default || module.plugin;

      if (!plugin || !plugin.metadata) {
        throw new Error('Invalid plugin: missing metadata');
      }

      return this.validatePlugin(plugin);
    } catch (err) {
      throw new Error(
        `Failed to load plugin from package ${packageName}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Load a plugin from a JSON definition (for simple plugins)
   */
  loadFromJson(jsonPath: string): Plugin {
    if (!existsSync(jsonPath)) {
      throw new Error(`Plugin JSON not found: ${jsonPath}`);
    }

    try {
      const content = readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(content);

      if (!data.metadata) {
        throw new Error('Invalid plugin JSON: missing metadata');
      }

      // JSON plugins can only define metadata, hooks need code
      const plugin: Plugin = {
        metadata: data.metadata,
      };

      return this.validatePlugin(plugin);
    } catch (err) {
      throw new Error(
        `Failed to load plugin from ${jsonPath}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Scan a directory for plugins
   */
  async scanDirectory(dirPath: string): Promise<PluginMetadata[]> {
    if (!existsSync(dirPath)) {
      return [];
    }

    const plugins: PluginMetadata[] = [];
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);

      // Guard against unreadable entries (permission denied, broken symlinks)
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        // Skip unreadable entries
        continue;
      }

      if (stat.isDirectory()) {
        // Check for package.json or plugin.json
        const pkgPath = join(fullPath, 'package.json');
        const pluginPath = join(fullPath, 'plugin.json');

        if (existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            // Validate required fields before pushing
            if ((pkg.skillkitPlugin || pkg.keywords?.includes('skillkit-plugin')) &&
                pkg.name && typeof pkg.name === 'string' &&
                pkg.version && typeof pkg.version === 'string') {
              plugins.push({
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                author: pkg.author,
                homepage: pkg.homepage,
              });
            }
          } catch {
            // Skip invalid packages
          }
        } else if (existsSync(pluginPath)) {
          try {
            const data = JSON.parse(readFileSync(pluginPath, 'utf-8'));
            // Validate metadata has required fields
            if (data.metadata &&
                data.metadata.name && typeof data.metadata.name === 'string' &&
                data.metadata.version && typeof data.metadata.version === 'string') {
              plugins.push(data.metadata);
            }
          } catch {
            // Skip invalid plugins
          }
        }
      } else if (stat.isFile()) {
        // Check for plugin files
        const ext = extname(entry);
        if (ext === '.js' || ext === '.mjs') {
          const name = basename(entry, ext);
          if (name.includes('plugin') || name.startsWith('skillkit-')) {
            plugins.push({
              name,
              version: '0.0.0', // Unknown until loaded
              description: `Plugin file: ${entry}`,
            });
          }
        }
      }
    }

    return plugins;
  }

  /**
   * Validate a plugin structure
   */
  private validatePlugin(plugin: Plugin): Plugin {
    const { metadata } = plugin;

    // Validate required metadata
    if (!metadata.name) {
      throw new Error('Plugin metadata must include a name');
    }
    if (!metadata.version) {
      throw new Error('Plugin metadata must include a version');
    }

    // Validate name format (allow scoped npm names like @scope/name)
    if (!/^(?:@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(metadata.name)) {
      throw new Error(
        'Plugin name must be lowercase alphanumeric with hyphens only (scoped names like @scope/name are allowed)'
      );
    }

    // Validate version format (loose semver check)
    if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
      throw new Error('Plugin version must be semver format (e.g., 1.0.0)');
    }

    // Validate translators
    if (plugin.translators) {
      for (const t of plugin.translators) {
        if (!t.agentType || !t.translator) {
          throw new Error('Translator plugin must include agentType and translator');
        }
      }
    }

    // Validate providers
    if (plugin.providers) {
      for (const p of plugin.providers) {
        if (!p.providerName || !p.provider) {
          throw new Error('Provider plugin must include providerName and provider');
        }
      }
    }

    // Validate commands
    if (plugin.commands) {
      for (const c of plugin.commands) {
        if (!c.name || !c.handler) {
          throw new Error('Command plugin must include name and handler');
        }
      }
    }

    return plugin;
  }
}

/**
 * Load a plugin from a file
 */
export async function loadPlugin(source: string): Promise<Plugin> {
  const loader = new PluginLoader();

  // Determine source type
  // Check for local file paths: absolute, relative (./,  .., paths with /), Windows paths, or tilde
  const isLocalPath =
    source.startsWith('.') ||                          // ./, ../, .hidden
    isAbsolute(source) ||                              // /abs/path or C:\path
    (source.includes('/') && !source.startsWith('@')) || // plugins/x.js (but not @scope/pkg)
    source.includes('\\') ||                           // Windows backslash
    source.startsWith('~');                            // ~/path

  if (isLocalPath) {
    // File path
    if (source.endsWith('.json')) {
      return loader.loadFromJson(source);
    }
    return loader.loadFromFile(source);
  } else if (source.startsWith('@') || /^[a-z0-9-]+$/.test(source)) {
    // npm package
    return loader.loadFromPackage(source);
  } else {
    throw new Error(`Cannot determine plugin source type: ${source}`);
  }
}

/**
 * Load all plugins from a directory
 */
export async function loadPluginsFromDirectory(dirPath: string): Promise<Plugin[]> {
  const loader = new PluginLoader();
  const plugins: Plugin[] = [];

  if (!existsSync(dirPath)) {
    return plugins;
  }

  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);

    // Guard against unreadable entries (permission denied, broken symlinks)
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      // Skip unreadable entries
      continue;
    }

    try {
      if (stat.isDirectory()) {
        // Try to load from directory (check ESM .mjs files first, then .js)
        const indexMjsPath = join(fullPath, 'index.mjs');
        const indexPath = join(fullPath, 'index.js');
        const mainMjsPath = join(fullPath, 'plugin.mjs');
        const mainPath = join(fullPath, 'plugin.js');
        const jsonPath = join(fullPath, 'plugin.json');

        if (existsSync(indexMjsPath)) {
          plugins.push(await loader.loadFromFile(indexMjsPath));
        } else if (existsSync(indexPath)) {
          plugins.push(await loader.loadFromFile(indexPath));
        } else if (existsSync(mainMjsPath)) {
          plugins.push(await loader.loadFromFile(mainMjsPath));
        } else if (existsSync(mainPath)) {
          plugins.push(await loader.loadFromFile(mainPath));
        } else if (existsSync(jsonPath)) {
          plugins.push(loader.loadFromJson(jsonPath));
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (ext === '.js' || ext === '.mjs') {
          plugins.push(await loader.loadFromFile(fullPath));
        } else if (ext === '.json' && entry.includes('plugin')) {
          plugins.push(loader.loadFromJson(fullPath));
        }
      }
    } catch (err) {
      // Log but continue loading other plugins
      console.warn(`Failed to load plugin from ${fullPath}: ${err}`);
    }
  }

  return plugins;
}
