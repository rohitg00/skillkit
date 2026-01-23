import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { loadConfig, saveConfig, type SkillkitConfig, type AgentType } from '@skillkit/core';

const VALID_AGENTS: AgentType[] = [
  'claude-code', 'cursor', 'codex', 'gemini-cli', 'opencode',
  'antigravity', 'amp', 'clawdbot', 'droid', 'github-copilot',
  'goose', 'kilo', 'kiro-cli', 'roo', 'trae', 'windsurf', 'universal',
];

/**
 * Settings command - view and modify SkillKit configuration
 */
export class SettingsCommand extends Command {
  static override paths = [['settings'], ['config']];

  static override usage = Command.Usage({
    description: 'View and modify SkillKit settings',
    details: `
      View or modify SkillKit configuration. Settings are stored in skillkit.yaml.

      Without arguments, shows all current settings.
      With --set, modifies a specific setting.
    `,
    examples: [
      ['Show all settings', '$0 settings'],
      ['Set default agent', '$0 settings --set agent=claude-code'],
      ['Enable auto-sync', '$0 settings --set autoSync=true'],
      ['Set cache directory', '$0 settings --set cacheDir=~/.cache/skillkit'],
      ['Show settings as JSON', '$0 settings --json'],
      ['Save to global config', '$0 settings --set agent=cursor --global'],
    ],
  });

  // Set a setting
  set = Option.String('--set,-s', {
    description: 'Set a config value (key=value)',
  });

  // Get a specific setting
  get = Option.String('--get,-g', {
    description: 'Get a specific setting value',
  });

  // JSON output
  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  // Global config
  global = Option.Boolean('--global', false, {
    description: 'Use global config (~/.config/skillkit/)',
  });

  // Reset to defaults
  reset = Option.Boolean('--reset', false, {
    description: 'Reset all settings to defaults',
  });

  async execute(): Promise<number> {
    // Load current config (respect --global flag)
    const config = loadConfig(this.global);

    // Reset to defaults
    if (this.reset) {
      const defaultConfig: SkillkitConfig = {
        version: 1,
        agent: 'universal',
        autoSync: true,
      };
      saveConfig(defaultConfig, this.global);
      console.log(chalk.green('Settings reset to defaults'));
      return 0;
    }

    // Get a specific setting
    if (this.get) {
      // Check if the key is a known setting (not just if value is undefined)
      const knownKeys = [
        'agent', 'autoSync', 'cacheDir', 'skillsDir',
        'enabledSkills', 'disabledSkills', 'marketplaceSources', 'defaultTimeout'
      ];
      if (!knownKeys.includes(this.get)) {
        console.error(chalk.red(`Unknown setting: ${this.get}`));
        return 1;
      }
      const value = this.getConfigValue(config, this.get);
      if (this.json) {
        console.log(JSON.stringify({ [this.get]: value }));
      } else {
        console.log(value ?? '(not set)');
      }
      return 0;
    }

    // Set a setting
    if (this.set) {
      const [key, ...valueParts] = this.set.split('=');
      const value = valueParts.join('=');

      if (!key || !this.set.includes('=')) {
        console.error(chalk.red('Invalid format. Use: --set key=value'));
        return 1;
      }

      const result = this.setConfigValue(config, key, value);
      if (!result.success) {
        console.error(chalk.red(result.error));
        return 1;
      }

      saveConfig(config, this.global);
      console.log(chalk.green(`${key} = ${value}`));
      return 0;
    }

    // Show all settings
    if (this.json) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      console.log(chalk.cyan('SkillKit Settings'));
      console.log(chalk.dim('─'.repeat(40)));
      console.log();

      const settings = [
        { key: 'agent', label: 'Default Agent', value: config.agent },
        { key: 'autoSync', label: 'Auto Sync', value: config.autoSync ? 'enabled' : 'disabled' },
        { key: 'cacheDir', label: 'Cache Dir', value: config.cacheDir || '~/.skillkit/cache' },
        { key: 'skillsDir', label: 'Skills Dir', value: config.skillsDir || '(default)' },
      ];

      for (const setting of settings) {
        console.log(`  ${chalk.white(setting.label.padEnd(14))} ${chalk.dim(setting.value)}`);
      }

      if (config.enabledSkills?.length) {
        console.log();
        console.log(`  ${chalk.white('Enabled Skills'.padEnd(14))} ${chalk.dim(config.enabledSkills.join(', '))}`);
      }

      if (config.disabledSkills?.length) {
        console.log(`  ${chalk.white('Disabled Skills'.padEnd(14))} ${chalk.dim(config.disabledSkills.join(', '))}`);
      }

      console.log();
      console.log(chalk.dim('Use --set key=value to modify settings'));
      console.log(chalk.dim('Available keys: agent, autoSync, cacheDir, skillsDir, defaultTimeout'));
    }

    return 0;
  }

  private getConfigValue(config: SkillkitConfig, key: string): unknown {
    switch (key) {
      case 'agent':
        return config.agent;
      case 'autoSync':
        return config.autoSync;
      case 'cacheDir':
        return config.cacheDir;
      case 'skillsDir':
        return config.skillsDir;
      case 'enabledSkills':
        return config.enabledSkills;
      case 'disabledSkills':
        return config.disabledSkills;
      case 'marketplaceSources':
        return config.marketplaceSources;
      case 'defaultTimeout':
        return config.defaultTimeout;
      default:
        return undefined;
    }
  }

  private setConfigValue(
    config: SkillkitConfig,
    key: string,
    value: string
  ): { success: boolean; error?: string } {
    switch (key) {
      case 'agent':
        if (!VALID_AGENTS.includes(value as AgentType)) {
          return {
            success: false,
            error: `Invalid agent. Valid options: ${VALID_AGENTS.join(', ')}`,
          };
        }
        config.agent = value as AgentType;
        break;

      case 'autoSync':
        if (!['true', 'false', 'enabled', 'disabled'].includes(value.toLowerCase())) {
          return { success: false, error: 'autoSync must be true/false or enabled/disabled' };
        }
        config.autoSync = value.toLowerCase() === 'true' || value.toLowerCase() === 'enabled';
        break;

      case 'cacheDir':
        config.cacheDir = value || undefined;
        break;

      case 'skillsDir':
        config.skillsDir = value || undefined;
        break;

      case 'defaultTimeout': {
        const timeout = parseInt(value, 10);
        if (isNaN(timeout) || timeout <= 0) {
          return { success: false, error: 'defaultTimeout must be a positive number (milliseconds)' };
        }
        config.defaultTimeout = timeout;
        break;
      }

      default:
        return { success: false, error: `Unknown setting: ${key}` };
    }

    return { success: true };
  }
}
