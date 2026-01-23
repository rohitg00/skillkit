import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { Command, Option } from 'clipanion';
import { detectProvider, isLocalPath, getProvider } from '@skillkit/core';
import type { SkillMetadata, GitProvider, AgentType } from '@skillkit/core';
import { isPathInside } from '@skillkit/core';
import { getAdapter, detectAgent } from '@skillkit/agents';
import { getInstallDir, saveSkillMetadata } from '../helpers.js';

export class InstallCommand extends Command {
  static override paths = [['install'], ['i']];

  static override usage = Command.Usage({
    description: 'Install skills from GitHub, GitLab, Bitbucket, or local path',
    examples: [
      ['Install from GitHub', '$0 install owner/repo'],
      ['Install from GitLab', '$0 install gitlab:owner/repo'],
      ['Install from Bitbucket', '$0 install bitbucket:owner/repo'],
      ['Install specific skills (CI/CD)', '$0 install owner/repo --skills=pdf,xlsx'],
      ['Install all skills non-interactively', '$0 install owner/repo --all'],
      ['Install from local path', '$0 install ./my-skills'],
      ['Install globally', '$0 install owner/repo --global'],
      ['List available skills', '$0 install owner/repo --list'],
      ['Install to specific agents', '$0 install owner/repo --agent claude-code --agent cursor'],
    ],
  });

  source = Option.String({ required: true });

  skills = Option.String('--skills,-s', {
    description: 'Comma-separated list of skills to install (non-interactive)',
  });

  all = Option.Boolean('--all,-a', false, {
    description: 'Install all discovered skills (non-interactive)',
  });

  yes = Option.Boolean('--yes,-y', false, {
    description: 'Skip confirmation prompts',
  });

  global = Option.Boolean('--global,-g', false, {
    description: 'Install to global skills directory',
  });

  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing skills',
  });

  provider = Option.String('--provider,-p', {
    description: 'Force specific provider (github, gitlab, bitbucket)',
  });

  list = Option.Boolean('--list,-l', false, {
    description: 'List available skills without installing',
  });

  agent = Option.Array('--agent', {
    description: 'Target specific agents (can specify multiple)',
  });

  async execute(): Promise<number> {
    const spinner = ora();

    try {
      let providerAdapter = detectProvider(this.source);

      if (this.provider) {
        providerAdapter = getProvider(this.provider as GitProvider);
      }

      if (!providerAdapter) {
        console.error(chalk.red(`Could not detect provider for: ${this.source}`));
        console.error(chalk.dim('Use --provider flag or specify source as:'));
        console.error(chalk.dim('  GitHub: owner/repo or https://github.com/owner/repo'));
        console.error(chalk.dim('  GitLab: gitlab:owner/repo or https://gitlab.com/owner/repo'));
        console.error(chalk.dim('  Bitbucket: bitbucket:owner/repo'));
        console.error(chalk.dim('  Local: ./path or ~/path'));
        return 1;
      }

      spinner.start(`Fetching from ${providerAdapter.name}...`);

      const result = await providerAdapter.clone(this.source, '', { depth: 1 });

      if (!result.success || !result.path) {
        spinner.fail(chalk.red(result.error || 'Failed to fetch source'));
        return 1;
      }

      spinner.succeed(`Found ${result.skills?.length || 0} skill(s)`);

      const discoveredSkills = result.discoveredSkills || [];

      if (this.list) {
        if (discoveredSkills.length === 0) {
          console.log(chalk.yellow('\nNo skills found in this repository'));
        } else {
          console.log(chalk.cyan('\nAvailable skills:\n'));
          for (const skill of discoveredSkills) {
            console.log(`  ${chalk.green(skill.name)}`);
          }
          console.log();
          console.log(chalk.dim(`Total: ${discoveredSkills.length} skill(s)`));
          console.log(chalk.dim('\nTo install specific skills: skillkit install <source> --skills=skill1,skill2'));
          console.log(chalk.dim('To install all skills: skillkit install <source> --all'));
        }

        const cleanupPath = result.tempRoot || result.path;
        if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
          rmSync(cleanupPath, { recursive: true, force: true });
        }

        return 0;
      }

      let skillsToInstall = discoveredSkills;

      if (this.skills) {
        const requestedSkills = this.skills.split(',').map(s => s.trim());
        const available = discoveredSkills.map(s => s.name);
        const notFound = requestedSkills.filter(s => !available.includes(s));

        if (notFound.length > 0) {
          console.error(chalk.red(`Skills not found: ${notFound.join(', ')}`));
          console.error(chalk.dim(`Available: ${available.join(', ')}`));
          return 1;
        }

        skillsToInstall = discoveredSkills.filter(s => requestedSkills.includes(s.name));
      } else if (this.all || this.yes) {
        skillsToInstall = discoveredSkills;
      } else {
        skillsToInstall = discoveredSkills;

        if (skillsToInstall.length > 0) {
          console.log(chalk.cyan('\nSkills to install:'));
          skillsToInstall.forEach(s => console.log(chalk.dim(`  - ${s.name}`)));
          console.log();
        }
      }

      if (skillsToInstall.length === 0) {
        console.log(chalk.yellow('No skills to install'));
        return 0;
      }

      let targetAgents: AgentType[];
      if (this.agent && this.agent.length > 0) {
        targetAgents = this.agent as AgentType[];
      } else {
        const detectedAgent = await detectAgent();
        targetAgents = [detectedAgent];
      }

      let totalInstalled = 0;
      const installResults: { agent: string; dir: string; count: number }[] = [];

      for (const agentType of targetAgents) {
        const adapter = getAdapter(agentType);
        const installDir = getInstallDir(this.global, agentType);

        if (!existsSync(installDir)) {
          mkdirSync(installDir, { recursive: true });
        }

        if (targetAgents.length > 1) {
          console.log(chalk.cyan(`\nInstalling to ${adapter.name}...`));
        }

        let installed = 0;
        for (const skill of skillsToInstall) {
          const skillName = skill.name;
          const sourcePath = skill.path;
          const targetPath = join(installDir, skillName);

          if (existsSync(targetPath) && !this.force) {
            console.log(chalk.yellow(`  Skipping ${skillName} (already exists, use --force to overwrite)`));
            continue;
          }

          const securityRoot = result.tempRoot || result.path;
          if (!isPathInside(sourcePath, securityRoot)) {
            console.log(chalk.red(`  Skipping ${skillName} (path traversal detected)`));
            continue;
          }

          spinner.start(`Installing ${skillName}...`);

          try {
            if (existsSync(targetPath)) {
              rmSync(targetPath, { recursive: true, force: true });
            }

            cpSync(sourcePath, targetPath, { recursive: true, dereference: true });

            const metadata: SkillMetadata = {
              name: skillName,
              description: '',
              source: this.source,
              sourceType: providerAdapter.type,
              subpath: skillName,
              installedAt: new Date().toISOString(),
              enabled: true,
            };
            saveSkillMetadata(targetPath, metadata);

            spinner.succeed(chalk.green(`Installed ${skillName}`));
            installed++;
          } catch (error) {
            spinner.fail(chalk.red(`Failed to install ${skillName}`));
            console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
          }
        }

        totalInstalled += installed;
        installResults.push({ agent: adapter.name, dir: installDir, count: installed });
      }

      const cleanupPath = result.tempRoot || result.path;
      if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
        rmSync(cleanupPath, { recursive: true, force: true });
      }

      console.log();
      if (targetAgents.length > 1) {
        console.log(chalk.green(`Installed ${totalInstalled} skill(s) across ${targetAgents.length} agents:`));
        for (const r of installResults) {
          console.log(chalk.dim(`  - ${r.agent}: ${r.count} skill(s) to ${r.dir}`));
        }
      } else {
        console.log(chalk.green(`Installed ${totalInstalled} skill(s) to ${installResults[0]?.dir}`));
      }

      if (!this.yes) {
        console.log(chalk.dim('\nRun `skillkit sync` to update your agent config'));
      }

      return 0;
    } catch (error) {
      spinner.fail(chalk.red('Installation failed'));
      console.error(chalk.dim(error instanceof Error ? error.message : String(error)));
      return 1;
    }
  }
}
