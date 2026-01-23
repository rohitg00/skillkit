/**
 * Plugin Command
 *
 * Manage SkillKit plugins
 */

import { Command, Option } from 'clipanion';
import { join } from 'node:path';
import { homedir } from 'node:os';
import chalk from 'chalk';
import { createPluginManager, loadPlugin, loadPluginsFromDirectory } from '@skillkit/core';

export class PluginCommand extends Command {
  static override paths = [['plugin']];

  static override usage = Command.Usage({
    description: 'Manage SkillKit plugins',
    examples: [
      ['List installed plugins', '$0 plugin list'],
      ['Install a plugin', '$0 plugin install --source ./my-plugin'],
      ['Install from npm', '$0 plugin install --source skillkit-plugin-gitlab'],
      ['Uninstall a plugin', '$0 plugin uninstall --name my-plugin'],
      ['Enable a plugin', '$0 plugin enable --name my-plugin'],
      ['Disable a plugin', '$0 plugin disable --name my-plugin'],
    ],
  });

  action = Option.String({ required: true });
  source = Option.String('--source,-s', { description: 'Plugin source (file path or npm package)' });
  name = Option.String('--name,-n', { description: 'Plugin name' });
  global = Option.Boolean('--global,-g', { description: 'Use global plugin directory' });

  async execute(): Promise<number> {
    const projectPath = this.global
      ? join(homedir(), '.skillkit')
      : process.cwd();
    const pluginManager = createPluginManager(projectPath);

    // Auto-load plugins from directory
    const pluginsDir = this.global
      ? join(projectPath, 'plugins')
      : join(projectPath, '.skillkit', 'plugins');
    try {
      const plugins = await loadPluginsFromDirectory(pluginsDir);
      for (const plugin of plugins) {
        if (pluginManager.isPluginEnabled(plugin.metadata.name)) {
          await pluginManager.register(plugin);
        }
      }
    } catch {
      // Plugins directory may not exist
    }

    try {
      switch (this.action) {
        case 'list':
          return this.listPlugins(pluginManager);
        case 'install':
          return await this.installPlugin(pluginManager);
        case 'uninstall':
          return await this.uninstallPlugin(pluginManager);
        case 'enable':
          return this.enablePlugin(pluginManager);
        case 'disable':
          return this.disablePlugin(pluginManager);
        case 'info':
          return this.pluginInfo(pluginManager);
        default:
          this.context.stderr.write(chalk.red(`Unknown action: ${this.action}\n`));
          this.context.stderr.write('Available actions: list, install, uninstall, enable, disable, info\n');
          return 1;
      }
    } catch (err) {
      this.context.stderr.write(chalk.red(`✗ ${err instanceof Error ? err.message : 'Unknown error'}\n`));
      return 1;
    }
  }

  private listPlugins(pluginManager: ReturnType<typeof createPluginManager>): number {
    const plugins = pluginManager.listPlugins();

    if (plugins.length === 0) {
      this.context.stdout.write('No plugins installed.\n');
      this.context.stdout.write('Use `skillkit plugin install --source <source>` to install a plugin.\n');
      return 0;
    }

    this.context.stdout.write(chalk.cyan(`Installed Plugins (${plugins.length}):\n\n`));

    for (const plugin of plugins) {
      const enabled = pluginManager.isPluginEnabled(plugin.name);
      const status = enabled
        ? chalk.green('enabled')
        : chalk.gray('disabled');

      this.context.stdout.write(chalk.cyan(`  ${plugin.name}`) + ` v${plugin.version} [${status}]\n`);
      if (plugin.description) {
        this.context.stdout.write(chalk.gray(`    ${plugin.description}\n`));
      }
    }

    // Show registered extensions
    const translators = pluginManager.getAllTranslators();
    const providers = pluginManager.getAllProviders();
    const commands = pluginManager.getAllCommands();

    if (translators.size > 0 || providers.size > 0 || commands.length > 0) {
      this.context.stdout.write(chalk.cyan('\nRegistered Extensions:\n'));
      if (translators.size > 0) {
        this.context.stdout.write(`  Translators: ${Array.from(translators.keys()).join(', ')}\n`);
      }
      if (providers.size > 0) {
        this.context.stdout.write(`  Providers: ${Array.from(providers.keys()).join(', ')}\n`);
      }
      if (commands.length > 0) {
        this.context.stdout.write(`  Commands: ${commands.map((c) => c.name).join(', ')}\n`);
      }
    }

    return 0;
  }

  private async installPlugin(pluginManager: ReturnType<typeof createPluginManager>): Promise<number> {
    if (!this.source) {
      this.context.stderr.write(chalk.red('--source is required for install\n'));
      return 1;
    }

    this.context.stdout.write(`Installing plugin from ${this.source}...\n`);

    const plugin = await loadPlugin(this.source);
    await pluginManager.register(plugin);

    this.context.stdout.write(chalk.green(`✓ Plugin "${plugin.metadata.name}" installed!\n`));
    this.context.stdout.write(`  Version: ${plugin.metadata.version}\n`);
    if (plugin.metadata.description) {
      this.context.stdout.write(`  ${plugin.metadata.description}\n`);
    }

    // Show what was registered
    if (plugin.translators?.length) {
      this.context.stdout.write(`  Translators: ${plugin.translators.map((t) => t.agentType).join(', ')}\n`);
    }
    if (plugin.providers?.length) {
      this.context.stdout.write(`  Providers: ${plugin.providers.map((p) => p.providerName).join(', ')}\n`);
    }
    if (plugin.commands?.length) {
      this.context.stdout.write(`  Commands: ${plugin.commands.map((c) => c.name).join(', ')}\n`);
    }

    return 0;
  }

  private async uninstallPlugin(pluginManager: ReturnType<typeof createPluginManager>): Promise<number> {
    if (!this.name) {
      this.context.stderr.write(chalk.red('--name is required for uninstall\n'));
      return 1;
    }

    await pluginManager.unregister(this.name);
    this.context.stdout.write(chalk.green(`✓ Plugin "${this.name}" uninstalled.\n`));
    return 0;
  }

  private enablePlugin(pluginManager: ReturnType<typeof createPluginManager>): number {
    if (!this.name) {
      this.context.stderr.write(chalk.red('--name is required for enable\n'));
      return 1;
    }

    pluginManager.enablePlugin(this.name);
    this.context.stdout.write(chalk.green(`✓ Plugin "${this.name}" enabled.\n`));
    return 0;
  }

  private disablePlugin(pluginManager: ReturnType<typeof createPluginManager>): number {
    if (!this.name) {
      this.context.stderr.write(chalk.red('--name is required for disable\n'));
      return 1;
    }

    pluginManager.disablePlugin(this.name);
    this.context.stdout.write(chalk.green(`✓ Plugin "${this.name}" disabled.\n`));
    return 0;
  }

  private pluginInfo(pluginManager: ReturnType<typeof createPluginManager>): number {
    if (!this.name) {
      this.context.stderr.write(chalk.red('--name is required for info\n'));
      return 1;
    }

    const plugin = pluginManager.getPlugin(this.name);
    if (!plugin) {
      this.context.stderr.write(chalk.red(`Plugin "${this.name}" not found.\n`));
      return 1;
    }

    const { metadata } = plugin;
    const enabled = pluginManager.isPluginEnabled(this.name);

    this.context.stdout.write(chalk.cyan(`${metadata.name}`) + ` v${metadata.version}\n`);
    this.context.stdout.write(`Status: ${enabled ? 'enabled' : 'disabled'}\n`);
    if (metadata.description) {
      this.context.stdout.write(`Description: ${metadata.description}\n`);
    }
    if (metadata.author) {
      this.context.stdout.write(`Author: ${metadata.author}\n`);
    }
    if (metadata.homepage) {
      this.context.stdout.write(`Homepage: ${metadata.homepage}\n`);
    }
    if (metadata.keywords?.length) {
      this.context.stdout.write(`Keywords: ${metadata.keywords.join(', ')}\n`);
    }
    if (metadata.dependencies?.length) {
      this.context.stdout.write(`Dependencies: ${metadata.dependencies.join(', ')}\n`);
    }

    return 0;
  }
}
