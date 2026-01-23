/**
 * Team Command
 *
 * Manage team skill sharing and collaboration
 */

import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { createTeamManager, createSkillBundle, exportBundle, importBundle } from '@skillkit/core';
import { join } from 'node:path';

export class TeamCommand extends Command {
  static override paths = [['team']];

  static override usage = Command.Usage({
    description: 'Manage team skill sharing and collaboration',
    examples: [
      ['Initialize team', '$0 team init --name "My Team" --registry https://github.com/myteam/skills'],
      ['Share a skill', '$0 team share --name my-skill'],
      ['Import a skill', '$0 team import --name shared-skill'],
      ['List shared skills', '$0 team list'],
      ['Sync with remote', '$0 team sync'],
      ['Create a bundle', '$0 team bundle-create --name my-bundle --skills skill1,skill2'],
      ['Export a bundle', '$0 team bundle-export --name my-bundle --output ./bundle.json'],
      ['Import a bundle', '$0 team bundle-import --source ./bundle.json'],
    ],
  });

  action = Option.String({ required: true });
  name = Option.String('--name', { description: 'Team name (for init), skill name, or bundle name' });
  registry = Option.String('--registry', { description: 'Registry URL (for init)' });
  description = Option.String('--description,-d', { description: 'Description (for share/bundle)' });
  tags = Option.String('--tags,-t', { description: 'Comma-separated tags (for share)' });
  skills = Option.String('--skills', { description: 'Comma-separated skill names (for bundle)' });
  output = Option.String('--output,-o', { description: 'Output path (for bundle-export)' });
  source = Option.String('--source,-s', { description: 'Source path (for bundle-import)' });
  overwrite = Option.Boolean('--overwrite', { description: 'Overwrite existing (for import)' });
  dryRun = Option.Boolean('--dry-run', { description: 'Preview without changes' });

  async execute(): Promise<number> {
    const projectPath = process.cwd();
    const teamManager = createTeamManager(projectPath);

    try {
      switch (this.action) {
        case 'init':
          return await this.initTeam(teamManager);
        case 'share':
          return await this.shareSkill(teamManager);
        case 'import':
          return await this.importSkill(teamManager);
        case 'list':
          return await this.listSkills(teamManager);
        case 'sync':
          return await this.syncTeam(teamManager);
        case 'remove':
          return await this.removeSkill(teamManager);
        case 'bundle-create':
          return await this.createBundle(teamManager);
        case 'bundle-export':
          return await this.exportSkillBundle(teamManager);
        case 'bundle-import':
          return await this.importSkillBundle();
        default:
          this.context.stderr.write(chalk.red(`Unknown action: ${this.action}\n`));
          this.context.stderr.write('Available actions: init, share, import, list, sync, remove, bundle-create, bundle-export, bundle-import\n');
          return 1;
      }
    } catch (err) {
      this.context.stderr.write(chalk.red(`✗ ${err instanceof Error ? err.message : 'Unknown error'}\n`));
      return 1;
    }
  }

  private async initTeam(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    if (!this.name) {
      this.context.stderr.write(chalk.red('--name is required for init\n'));
      return 1;
    }
    if (!this.registry) {
      this.context.stderr.write(chalk.red('--registry is required for init\n'));
      return 1;
    }

    const config = await teamManager.init({
      teamName: this.name,
      registryUrl: this.registry,
    });

    this.context.stdout.write(chalk.green('✓ Team initialized!\n'));
    this.context.stdout.write(`  Team ID: ${config.teamId}\n`);
    this.context.stdout.write(`  Registry: ${config.registryUrl}\n`);
    return 0;
  }

  private async shareSkill(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    if (!this.name) {
      this.context.stderr.write(chalk.red('--name <skill-name> is required for share\n'));
      return 1;
    }

    const shared = await teamManager.shareSkill({
      skillName: this.name,
      description: this.description,
      tags: this.tags?.split(',').map((t) => t.trim()),
    });

    this.context.stdout.write(chalk.green('✓ Skill shared!\n'));
    this.context.stdout.write(`  Name: ${shared.name}\n`);
    this.context.stdout.write(`  Version: ${shared.version}\n`);
    this.context.stdout.write(`  Source: ${shared.source}\n`);
    return 0;
  }

  private async importSkill(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    if (!this.name) {
      this.context.stderr.write(chalk.red('--name <skill-name> is required for import\n'));
      return 1;
    }

    const result = await teamManager.importSkill(this.name, {
      overwrite: this.overwrite,
      dryRun: this.dryRun,
    });

    if (!result.success) {
      this.context.stderr.write(chalk.red(`✗ ${result.error}\n`));
      return 1;
    }

    if (this.dryRun) {
      this.context.stdout.write(chalk.cyan(`[dry-run] Would import to: ${result.path}\n`));
    } else {
      this.context.stdout.write(chalk.green(`✓ Skill imported to: ${result.path}\n`));
    }
    return 0;
  }

  private async listSkills(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    const skills = teamManager.listSharedSkills();

    this.context.stdout.write(chalk.cyan(`Team: ${config.teamName}\n`));
    this.context.stdout.write(chalk.gray(`Registry: ${config.registryUrl}\n\n`));

    if (skills.length === 0) {
      this.context.stdout.write('No shared skills yet. Use `skillkit team share` to share a skill.\n');
      return 0;
    }

    this.context.stdout.write(`Shared Skills (${skills.length}):\n`);
    for (const skill of skills) {
      this.context.stdout.write(chalk.cyan(`  ${skill.name}`) + ` v${skill.version}\n`);
      if (skill.description) {
        this.context.stdout.write(chalk.gray(`    ${skill.description}\n`));
      }
      this.context.stdout.write(`    by ${skill.author} | ${skill.downloads || 0} downloads\n`);
    }

    return 0;
  }

  private async syncTeam(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    this.context.stdout.write(`Syncing with ${config.registryUrl}...\n`);

    const result = await teamManager.sync();

    this.context.stdout.write(chalk.green('✓ Sync complete!\n'));
    if (result.added.length > 0) {
      this.context.stdout.write(`  Added: ${result.added.join(', ')}\n`);
    }
    if (result.updated.length > 0) {
      this.context.stdout.write(`  Updated: ${result.updated.join(', ')}\n`);
    }
    if (result.added.length === 0 && result.updated.length === 0) {
      this.context.stdout.write('  Already up to date.\n');
    }

    return 0;
  }

  private async removeSkill(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    if (!this.name) {
      this.context.stderr.write(chalk.red('--name <skill-name> is required for remove\n'));
      return 1;
    }

    const removed = teamManager.removeSkill(this.name);
    if (!removed) {
      this.context.stderr.write(chalk.red(`Skill "${this.name}" not found in team registry.\n`));
      return 1;
    }

    this.context.stdout.write(chalk.green(`✓ Skill "${this.name}" removed from team registry.\n`));
    return 0;
  }

  private async createBundle(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    if (!this.name) {
      this.context.stderr.write(chalk.red('--name <bundle-name> is required for bundle-create\n'));
      return 1;
    }

    if (!this.skills) {
      this.context.stderr.write(chalk.red('--skills <skill1,skill2,...> is required for bundle-create\n'));
      return 1;
    }

    const skillNames = this.skills.split(',').map((s) => s.trim());
    const projectPath = process.cwd();
    const skillsDir = join(projectPath, 'skills');

    // Create the bundle
    const bundle = createSkillBundle(this.name, config.teamName, this.description);

    let addedCount = 0;
    for (const skillName of skillNames) {
      const skillPath = join(skillsDir, skillName);
      try {
        bundle.addSkill(skillPath);
        addedCount++;
        this.context.stdout.write(chalk.gray(`  + ${skillName}\n`));
      } catch (err) {
        this.context.stderr.write(chalk.yellow(`  ⚠ Skipping ${skillName}: ${err instanceof Error ? err.message : 'Unknown error'}\n`));
      }
    }

    if (addedCount === 0) {
      this.context.stderr.write(chalk.red('No skills were added to the bundle.\n'));
      return 1;
    }

    // Export to default location
    const outputPath = this.output || join(projectPath, '.skillkit', 'bundles', `${this.name}.json`);
    const result = exportBundle(bundle, outputPath);

    if (!result.success) {
      this.context.stderr.write(chalk.red(`✗ ${result.error}\n`));
      return 1;
    }

    this.context.stdout.write(chalk.green(`\n✓ Bundle "${this.name}" created with ${addedCount} skills!\n`));
    this.context.stdout.write(`  Checksum: ${bundle.getChecksum()}\n`);
    this.context.stdout.write(`  Output: ${result.path}\n`);
    return 0;
  }

  private async exportSkillBundle(teamManager: ReturnType<typeof createTeamManager>): Promise<number> {
    const config = teamManager.load();
    if (!config) {
      this.context.stderr.write(chalk.red('Team not initialized. Run `skillkit team init` first.\n'));
      return 1;
    }

    if (!this.name) {
      this.context.stderr.write(chalk.red('--name <bundle-name> is required for bundle-export\n'));
      return 1;
    }

    if (!this.output) {
      this.context.stderr.write(chalk.red('--output <path> is required for bundle-export\n'));
      return 1;
    }

    const projectPath = process.cwd();
    const bundlePath = join(projectPath, '.skillkit', 'bundles', `${this.name}.json`);

    // Check if bundle exists
    const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
    if (!existsSync(bundlePath)) {
      this.context.stderr.write(chalk.red(`Bundle "${this.name}" not found. Create it first with bundle-create.\n`));
      return 1;
    }

    // Copy bundle to output
    const content = readFileSync(bundlePath, 'utf-8');
    writeFileSync(this.output, content, 'utf-8');

    this.context.stdout.write(chalk.green(`✓ Bundle exported to: ${this.output}\n`));
    return 0;
  }

  private async importSkillBundle(): Promise<number> {
    if (!this.source) {
      this.context.stderr.write(chalk.red('--source <path> is required for bundle-import\n'));
      return 1;
    }

    const { existsSync } = await import('node:fs');
    if (!existsSync(this.source)) {
      this.context.stderr.write(chalk.red(`Bundle file not found: ${this.source}\n`));
      return 1;
    }

    const projectPath = process.cwd();
    const skillsDir = join(projectPath, 'skills');

    if (this.dryRun) {
      this.context.stdout.write(chalk.cyan('[dry-run] Would import bundle to: ' + skillsDir + '\n'));
      return 0;
    }

    const result = importBundle(this.source, skillsDir, { overwrite: this.overwrite });

    if (!result.success && result.imported.length === 0) {
      this.context.stderr.write(chalk.red('✗ Failed to import bundle:\n'));
      for (const error of result.errors) {
        this.context.stderr.write(chalk.red(`  - ${error}\n`));
      }
      return 1;
    }

    this.context.stdout.write(chalk.green(`✓ Imported ${result.imported.length} skills from bundle!\n`));
    for (const name of result.imported) {
      this.context.stdout.write(chalk.gray(`  + ${name}\n`));
    }
    if (result.errors.length > 0) {
      this.context.stdout.write(chalk.yellow('\nWarnings:\n'));
      for (const error of result.errors) {
        this.context.stdout.write(chalk.yellow(`  - ${error}\n`));
      }
    }
    return 0;
  }
}
