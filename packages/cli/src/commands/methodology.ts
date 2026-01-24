/**
 * Methodology Command
 *
 * Manage methodology packs for AI coding agents
 */

import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { createMethodologyManager, createMethodologyLoader } from '@skillkit/core';

export class MethodologyCommand extends Command {
  static override paths = [['methodology']];

  static override usage = Command.Usage({
    description: 'Manage methodology packs for AI coding agents',
    examples: [
      ['List available packs', '$0 methodology list'],
      ['Install all methodology packs', '$0 methodology install'],
      ['Install specific pack', '$0 methodology install testing'],
      ['Install specific skill', '$0 methodology install testing/red-green-refactor'],
      ['Sync methodology skills to agents', '$0 methodology sync'],
      ['Search methodology skills', '$0 methodology search tdd'],
      ['Show pack details', '$0 methodology info testing'],
    ],
  });

  action = Option.String({ required: true });
  target = Option.String({ required: false });
  agent = Option.String('--agent,-a', { description: 'Target agent for sync' });
  dryRun = Option.Boolean('--dry-run', { description: 'Preview without making changes' });
  verbose = Option.Boolean('--verbose,-v', { description: 'Show detailed output' });

  async execute(): Promise<number> {
    const projectPath = process.cwd();

    try {
      switch (this.action) {
        case 'list':
          return await this.listPacks();
        case 'install':
          return await this.installPacks(projectPath);
        case 'uninstall':
          return await this.uninstallPack(projectPath);
        case 'sync':
          return await this.syncSkills(projectPath);
        case 'search':
          return await this.searchSkills();
        case 'info':
          return await this.showPackInfo();
        case 'installed':
          return await this.listInstalled(projectPath);
        default:
          this.context.stderr.write(chalk.red(`Unknown action: ${this.action}\n`));
          this.context.stderr.write('Available actions: list, install, uninstall, sync, search, info, installed\n');
          return 1;
      }
    } catch (err) {
      this.context.stderr.write(chalk.red(`✗ ${err instanceof Error ? err.message : 'Unknown error'}\n`));
      return 1;
    }
  }

  private async listPacks(): Promise<number> {
    const loader = createMethodologyLoader();
    const packs = await loader.loadAllPacks();

    if (packs.length === 0) {
      this.context.stdout.write('No methodology packs available.\n');
      return 0;
    }

    this.context.stdout.write(chalk.cyan('Available Methodology Packs:\n\n'));

    for (const pack of packs) {
      this.context.stdout.write(chalk.green(`  ${pack.name}`) + ` v${pack.version}\n`);
      this.context.stdout.write(chalk.gray(`    ${pack.description}\n`));
      this.context.stdout.write(`    Skills: ${pack.skills.join(', ')}\n`);
      this.context.stdout.write(`    Tags: ${pack.tags.join(', ')}\n`);
      this.context.stdout.write('\n');
    }

    this.context.stdout.write(`Total: ${packs.length} packs\n`);
    this.context.stdout.write(chalk.gray('\nRun `skillkit methodology install` to install all packs.\n'));
    return 0;
  }

  private async installPacks(projectPath: string): Promise<number> {
    const manager = createMethodologyManager({ projectPath });
    const loader = manager.getLoader();

    if (this.target) {
      // Check if it's a skill ID (pack/skill) or pack name
      if (this.target.includes('/')) {
        // Install single skill
        this.context.stdout.write(`Installing skill: ${chalk.cyan(this.target)}...\n`);

        if (this.dryRun) {
          this.context.stdout.write(chalk.yellow('[dry-run] Would install skill.\n'));
          return 0;
        }

        const result = await manager.installSkill(this.target);

        if (result.success) {
          this.context.stdout.write(chalk.green(`✓ Skill installed: ${this.target}\n`));
        } else {
          for (const failed of result.failed) {
            this.context.stderr.write(chalk.red(`✗ ${failed.name}: ${failed.error}\n`));
          }
          return 1;
        }
      } else {
        // Install single pack
        this.context.stdout.write(`Installing pack: ${chalk.cyan(this.target)}...\n`);

        if (this.dryRun) {
          const pack = await loader.loadPack(this.target);
          if (pack) {
            this.context.stdout.write(chalk.yellow(`[dry-run] Would install ${pack.skills.length} skills.\n`));
          }
          return 0;
        }

        const result = await manager.installPack(this.target);

        if (result.success) {
          this.context.stdout.write(chalk.green(`✓ Pack "${this.target}" installed!\n`));
          this.context.stdout.write(`  Installed: ${result.installed.length} skills\n`);
          if (result.skipped.length > 0) {
            this.context.stdout.write(`  Skipped (already installed): ${result.skipped.length}\n`);
          }
        } else {
          this.context.stderr.write(chalk.red(`✗ Failed to install pack\n`));
          for (const failed of result.failed) {
            this.context.stderr.write(chalk.red(`  - ${failed.name}: ${failed.error}\n`));
          }
          return 1;
        }
      }
    } else {
      // Install all packs
      this.context.stdout.write('Installing all methodology packs...\n\n');

      if (this.dryRun) {
        const packs = await loader.loadAllPacks();
        let totalSkills = 0;
        for (const pack of packs) {
          this.context.stdout.write(chalk.yellow(`[dry-run] Would install ${pack.name} (${pack.skills.length} skills)\n`));
          totalSkills += pack.skills.length;
        }
        this.context.stdout.write(chalk.yellow(`\n[dry-run] Would install ${totalSkills} skills total.\n`));
        return 0;
      }

      const result = await manager.installAllPacks();

      if (result.success) {
        this.context.stdout.write(chalk.green('\n✓ All methodology packs installed!\n'));
        this.context.stdout.write(`  Installed: ${result.installed.length} skills\n`);
        if (result.skipped.length > 0) {
          this.context.stdout.write(`  Skipped (already installed): ${result.skipped.length}\n`);
        }
      } else {
        this.context.stdout.write(chalk.yellow('\n⚠ Some skills failed to install:\n'));
        for (const failed of result.failed) {
          this.context.stderr.write(chalk.red(`  - ${failed.name}: ${failed.error}\n`));
        }
        this.context.stdout.write(`\n  Installed: ${result.installed.length} skills\n`);
      }
    }

    this.context.stdout.write(chalk.gray('\nRun `skillkit methodology sync` to sync to detected agents.\n'));
    return 0;
  }

  private async uninstallPack(projectPath: string): Promise<number> {
    const manager = createMethodologyManager({ projectPath });

    if (!this.target) {
      this.context.stderr.write(chalk.red('Pack name required for uninstall.\n'));
      this.context.stderr.write('Usage: skillkit methodology uninstall <pack-name>\n');
      return 1;
    }

    if (this.dryRun) {
      this.context.stdout.write(chalk.yellow(`[dry-run] Would uninstall pack: ${this.target}\n`));
      return 0;
    }

    await manager.uninstallPack(this.target);
    this.context.stdout.write(chalk.green(`✓ Pack "${this.target}" uninstalled.\n`));
    return 0;
  }

  private async syncSkills(projectPath: string): Promise<number> {
    const manager = createMethodologyManager({ projectPath, autoSync: false });

    this.context.stdout.write('Syncing methodology skills to detected agents...\n\n');

    if (this.dryRun) {
      const installed = manager.listInstalledSkills();
      this.context.stdout.write(chalk.yellow(`[dry-run] Would sync ${installed.length} skills.\n`));
      return 0;
    }

    const result = await manager.syncAll();

    if (result.synced.length > 0) {
      this.context.stdout.write(chalk.green('✓ Sync complete!\n'));
      for (const sync of result.synced) {
        this.context.stdout.write(`  ${sync.skill} → ${sync.agents.join(', ')}\n`);
      }
    }

    if (result.failed.length > 0) {
      this.context.stdout.write(chalk.yellow('\n⚠ Some syncs failed:\n'));
      for (const fail of result.failed) {
        this.context.stderr.write(chalk.red(`  ${fail.skill} (${fail.agent}): ${fail.error}\n`));
      }
    }

    if (result.synced.length === 0 && result.failed.length === 0) {
      this.context.stdout.write('No installed skills to sync. Run `skillkit methodology install` first.\n');
    }

    return result.success ? 0 : 1;
  }

  private async searchSkills(): Promise<number> {
    const loader = createMethodologyLoader();

    if (!this.target) {
      this.context.stderr.write(chalk.red('Search query required.\n'));
      this.context.stderr.write('Usage: skillkit methodology search <query>\n');
      return 1;
    }

    const skills = await loader.searchSkills(this.target);

    if (skills.length === 0) {
      this.context.stdout.write(`No skills found matching "${this.target}".\n`);
      return 0;
    }

    this.context.stdout.write(chalk.cyan(`Found ${skills.length} skills matching "${this.target}":\n\n`));

    for (const skill of skills) {
      this.context.stdout.write(chalk.green(`  ${skill.id}`) + ` v${skill.version}\n`);
      this.context.stdout.write(chalk.gray(`    ${skill.description || 'No description'}\n`));
      if (skill.tags.length > 0) {
        this.context.stdout.write(`    Tags: ${skill.tags.join(', ')}\n`);
      }
      if (this.verbose && skill.metadata.triggers) {
        this.context.stdout.write(`    Triggers: ${skill.metadata.triggers.join(', ')}\n`);
      }
      this.context.stdout.write('\n');
    }

    return 0;
  }

  private async showPackInfo(): Promise<number> {
    const loader = createMethodologyLoader();

    if (!this.target) {
      this.context.stderr.write(chalk.red('Pack name required.\n'));
      this.context.stderr.write('Usage: skillkit methodology info <pack-name>\n');
      return 1;
    }

    const pack = await loader.loadPack(this.target);

    if (!pack) {
      this.context.stderr.write(chalk.red(`Pack not found: ${this.target}\n`));
      return 1;
    }

    this.context.stdout.write(chalk.cyan(`\nPack: ${pack.name}\n`));
    this.context.stdout.write(`Version: ${pack.version}\n`);
    this.context.stdout.write(`Description: ${pack.description}\n`);
    this.context.stdout.write(`Tags: ${pack.tags.join(', ')}\n`);
    this.context.stdout.write(`Author: ${pack.author || 'Unknown'}\n`);
    this.context.stdout.write(`License: ${pack.license || 'Unknown'}\n`);
    this.context.stdout.write(`Compatibility: ${pack.compatibility.join(', ')}\n`);

    this.context.stdout.write(chalk.cyan(`\nSkills (${pack.skills.length}):\n`));

    const skills = await loader.loadPackSkills(this.target);
    for (const skill of skills) {
      this.context.stdout.write(chalk.green(`  ${skill.id.split('/')[1]}\n`));
      this.context.stdout.write(chalk.gray(`    ${skill.description || 'No description'}\n`));
      if (this.verbose) {
        if (skill.metadata.triggers) {
          this.context.stdout.write(`    Triggers: ${skill.metadata.triggers.join(', ')}\n`);
        }
        if (skill.metadata.difficulty) {
          this.context.stdout.write(`    Difficulty: ${skill.metadata.difficulty}\n`);
        }
        if (skill.metadata.estimatedTime) {
          this.context.stdout.write(`    Est. Time: ${skill.metadata.estimatedTime} min\n`);
        }
      }
    }

    this.context.stdout.write(chalk.gray(`\nRun \`skillkit methodology install ${this.target}\` to install this pack.\n`));
    return 0;
  }

  private async listInstalled(projectPath: string): Promise<number> {
    const manager = createMethodologyManager({ projectPath });

    const installedPacks = manager.listInstalledPacks();
    const installedSkills = manager.listInstalledSkills();

    if (installedPacks.length === 0 && installedSkills.length === 0) {
      this.context.stdout.write('No methodology skills installed.\n');
      this.context.stdout.write(chalk.gray('Run `skillkit methodology install` to install methodology packs.\n'));
      return 0;
    }

    if (installedPacks.length > 0) {
      this.context.stdout.write(chalk.cyan('Installed Packs:\n'));
      for (const pack of installedPacks) {
        this.context.stdout.write(chalk.green(`  ${pack.name}`) + ` v${pack.version}\n`);
        this.context.stdout.write(`    Skills: ${pack.skills.length}\n`);
      }
      this.context.stdout.write('\n');
    }

    if (installedSkills.length > 0) {
      this.context.stdout.write(chalk.cyan('Installed Skills:\n'));
      for (const skill of installedSkills) {
        const syncStatus = skill.syncedAgents.length > 0
          ? chalk.green(`synced to ${skill.syncedAgents.length} agents`)
          : chalk.yellow('not synced');
        this.context.stdout.write(`  ${chalk.green(skill.id)} v${skill.version} [${syncStatus}]\n`);
      }
    }

    this.context.stdout.write(chalk.gray(`\nTotal: ${installedSkills.length} skills installed.\n`));
    return 0;
  }
}
