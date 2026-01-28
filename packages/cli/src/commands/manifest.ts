import { Command, Option } from 'clipanion';
import {
  loadManifest,
  saveManifest,
  initManifest,
  addToManifest,
  removeFromManifest,
  findManifestPath,
  generateManifestFromInstalled,
  findAllSkills,
} from '@skillkit/core';
import { getSearchDirs, loadSkillMetadata } from '../helpers.js';
import {
  colors,
  symbols,
  spinner,
  step,
  success,
  warn,
  error,
  header,
  confirm,
  isCancel,
} from '../onboarding/index.js';

export class ManifestCommand extends Command {
  static override paths = [['manifest']];

  static override usage = Command.Usage({
    description: 'Manage .skills manifest file',
    details: `
      The .skills manifest file allows declarative skill management.
      Commit this file to version control to share skill configurations.
    `,
    examples: [
      ['Show current manifest', '$0 manifest'],
      ['Initialize manifest', '$0 manifest init'],
      ['Add skill to manifest', '$0 manifest add owner/repo'],
      ['Remove skill from manifest', '$0 manifest remove owner/repo'],
      ['Install from manifest', '$0 manifest install'],
      ['Generate from installed', '$0 manifest generate'],
    ],
  });

  async execute(): Promise<number> {
    const manifestPath = findManifestPath();

    if (!manifestPath) {
      warn('No .skills manifest found');
      console.log('');
      console.log(colors.muted('Create one with:'));
      console.log(`  ${colors.cyan('skillkit manifest init')}`);
      console.log('');
      console.log(colors.muted('Or generate from installed skills:'));
      console.log(`  ${colors.cyan('skillkit manifest generate')}`);
      return 0;
    }

    const manifest = loadManifest(manifestPath);

    if (!manifest) {
      error('Failed to load manifest');
      return 1;
    }

    header('.skills Manifest');
    console.log(colors.muted(`Path: ${manifestPath}`));
    console.log('');

    if (manifest.skills.length === 0) {
      console.log(colors.muted('No skills defined'));
    } else {
      console.log(colors.primary('Skills:'));
      for (const skill of manifest.skills) {
        const status = skill.enabled === false ? colors.muted('(disabled)') : '';
        console.log(`  ${colors.success(symbols.bullet)} ${skill.source} ${status}`);
        if (skill.skills) {
          console.log(`    ${colors.muted(`Skills: ${skill.skills.join(', ')}`)}`);
        }
        if (skill.agents) {
          console.log(`    ${colors.muted(`Agents: ${skill.agents.join(', ')}`)}`);
        }
      }
    }

    console.log('');

    if (manifest.agents) {
      console.log(`${colors.muted('Default agents:')} ${manifest.agents.join(', ')}`);
    }

    if (manifest.installMethod) {
      console.log(`${colors.muted('Install method:')} ${manifest.installMethod}`);
    }

    if (manifest.updatedAt) {
      console.log(`${colors.muted('Updated:')} ${manifest.updatedAt}`);
    }

    console.log('');
    console.log(colors.muted('Commands: init, add, remove, install, generate'));

    return 0;
  }
}

export class ManifestInitCommand extends Command {
  static override paths = [['manifest', 'init']];

  static override usage = Command.Usage({
    description: 'Initialize a new .skills manifest',
  });

  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing manifest',
  });

  async execute(): Promise<number> {
    const existingPath = findManifestPath();

    if (existingPath && !this.force) {
      warn(`Manifest already exists: ${existingPath}`);
      console.log(colors.muted('Use --force to overwrite'));
      return 1;
    }

    initManifest();
    success('Created .skills manifest');
    console.log('');
    console.log(colors.muted('Add skills with:'));
    console.log(`  ${colors.cyan('skillkit manifest add owner/repo')}`);

    return 0;
  }
}

export class ManifestAddCommand extends Command {
  static override paths = [['manifest', 'add']];

  static override usage = Command.Usage({
    description: 'Add a skill source to the manifest',
  });

  source = Option.String({ required: true });

  skills = Option.String('--skills,-s', {
    description: 'Specific skills to include (comma-separated)',
  });

  agents = Option.String('--agents,-a', {
    description: 'Target agents (comma-separated)',
  });

  async execute(): Promise<number> {
    const options: { skills?: string[]; agents?: string[] } = {};

    if (this.skills) {
      options.skills = this.skills.split(',').map(s => s.trim());
    }

    if (this.agents) {
      options.agents = this.agents.split(',').map(s => s.trim());
    }

    addToManifest(this.source, options);
    success(`Added ${this.source} to manifest`);

    return 0;
  }
}

export class ManifestRemoveCommand extends Command {
  static override paths = [['manifest', 'remove']];

  static override usage = Command.Usage({
    description: 'Remove a skill source from the manifest',
  });

  source = Option.String({ required: true });

  async execute(): Promise<number> {
    const result = removeFromManifest(this.source);

    if (!result) {
      error('No manifest found');
      return 1;
    }

    success(`Removed ${this.source} from manifest`);

    return 0;
  }
}

export class ManifestInstallCommand extends Command {
  static override paths = [['manifest', 'install']];

  static override usage = Command.Usage({
    description: 'Install all skills defined in the manifest',
  });

  yes = Option.Boolean('--yes,-y', false, {
    description: 'Skip confirmation',
  });

  async execute(): Promise<number> {
    const manifest = loadManifest();

    if (!manifest) {
      error('No .skills manifest found');
      console.log(colors.muted('Create one with: skillkit manifest init'));
      return 1;
    }

    const enabledSkills = manifest.skills.filter(s => s.enabled !== false);

    if (enabledSkills.length === 0) {
      warn('No skills to install');
      return 0;
    }

    header('Install from Manifest');

    console.log(`Installing ${enabledSkills.length} source(s):`);
    for (const skill of enabledSkills) {
      console.log(`  ${colors.success(symbols.bullet)} ${skill.source}`);
    }
    console.log('');

    if (!this.yes && process.stdin.isTTY) {
      const confirmResult = await confirm({
        message: 'Proceed with installation?',
        initialValue: true,
      });

      if (isCancel(confirmResult) || !confirmResult) {
        return 0;
      }
    }

    const s = spinner();

    for (const skill of enabledSkills) {
      s.start(`Installing ${skill.source}...`);

      try {
        const args = ['install', skill.source];

        if (skill.skills) {
          args.push('--skills', skill.skills.join(','));
        }

        if (skill.agents || manifest.agents) {
          const agents = skill.agents || manifest.agents || [];
          for (const agent of agents) {
            args.push('--agent', agent);
          }
        }

        args.push('--yes');

        const { execFileSync } = await import('node:child_process');
        execFileSync('skillkit', args, {
          stdio: 'pipe',
          encoding: 'utf-8',
        });

        s.stop(`Installed ${skill.source}`);
      } catch (err) {
        s.stop(colors.error(`Failed: ${skill.source}`));
        if (err instanceof Error) {
          console.log(colors.muted(err.message));
        }
      }
    }

    success('Manifest installation complete');

    return 0;
  }
}

export class ManifestGenerateCommand extends Command {
  static override paths = [['manifest', 'generate']];

  static override usage = Command.Usage({
    description: 'Generate manifest from currently installed skills',
  });

  output = Option.String('--output,-o', {
    description: 'Output file path (default: .skills)',
  });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    const installedSkills = findAllSkills(searchDirs);

    if (installedSkills.length === 0) {
      warn('No installed skills found');
      return 0;
    }

    step(`Found ${installedSkills.length} installed skill(s)`);

    const skillsWithMeta = installedSkills.map(skill => {
      const metadata = loadSkillMetadata(skill.path);
      return {
        name: skill.name,
        source: metadata?.source || '',
      };
    }).filter(s => s.source);

    const manifest = generateManifestFromInstalled(skillsWithMeta);

    const outputPath = this.output || '.skills';
    saveManifest(manifest, outputPath);

    success(`Generated ${outputPath} with ${manifest.skills.length} source(s)`);

    console.log('');
    console.log(colors.muted('Commit this file to share skill configuration with your team.'));

    return 0;
  }
}
