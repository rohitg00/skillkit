import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Command, Option } from 'clipanion';
import { detectProvider, isLocalPath, getProvider } from '@skillkit/core';
import type { SkillMetadata, GitProvider, AgentType } from '@skillkit/core';
import { isPathInside } from '@skillkit/core';
import { getAdapter, detectAgent, getAllAdapters } from '@skillkit/agents';
import { getInstallDir, saveSkillMetadata } from '../helpers.js';
import {
  welcome,
  colors,
  symbols,
  formatAgent,
  getAgentIcon,
  isCancel,
  spinner,
  agentMultiselect,
  skillMultiselect,
  selectInstallMethod,
  confirm,
  outro,
  cancel,
  step,
  success,
  error,
  warn,
  showInstallSummary,
  showNextSteps,
  saveLastAgents,
  getLastAgents,
  type InstallResult,
} from '../onboarding/index.js';

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

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output (no logo)',
  });

  async execute(): Promise<number> {
    const isInteractive = process.stdin.isTTY && !this.skills && !this.all && !this.yes;
    const s = spinner();

    try {
      // Show welcome logo for interactive mode
      if (isInteractive && !this.quiet) {
        welcome();
      }

      let providerAdapter = detectProvider(this.source);

      if (this.provider) {
        providerAdapter = getProvider(this.provider as GitProvider);
      }

      if (!providerAdapter) {
        error(`Could not detect provider for: ${this.source}`);
        console.log(colors.muted('Use --provider flag or specify source as:'));
        console.log(colors.muted('  GitHub: owner/repo or https://github.com/owner/repo'));
        console.log(colors.muted('  GitLab: gitlab:owner/repo or https://gitlab.com/owner/repo'));
        console.log(colors.muted('  Bitbucket: bitbucket:owner/repo'));
        console.log(colors.muted('  Local: ./path or ~/path'));
        return 1;
      }

      s.start(`Fetching from ${providerAdapter.name}...`);

      const result = await providerAdapter.clone(this.source, '', { depth: 1 });

      if (!result.success || !result.path) {
        s.stop(colors.error(result.error || 'Failed to fetch source'));
        return 1;
      }

      s.stop(`Found ${result.skills?.length || 0} skill(s)`);

      const discoveredSkills = result.discoveredSkills || [];

      // List mode - just show skills and exit
      if (this.list) {
        if (discoveredSkills.length === 0) {
          warn('No skills found in this repository');
        } else {
          console.log('');
          console.log(colors.bold('Available skills:'));
          console.log('');
          for (const skill of discoveredSkills) {
            console.log(`  ${colors.success(symbols.stepActive)} ${colors.primary(skill.name)}`);
          }
          console.log('');
          console.log(colors.muted(`Total: ${discoveredSkills.length} skill(s)`));
          console.log(colors.muted('To install: skillkit install <source> --skills=skill1,skill2'));
        }

        const cleanupPath = result.tempRoot || result.path;
        if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
          rmSync(cleanupPath, { recursive: true, force: true });
        }

        return 0;
      }

      let skillsToInstall = discoveredSkills;

      // Non-interactive: use --skills filter
      if (this.skills) {
        const requestedSkills = this.skills.split(',').map(s => s.trim());
        const available = discoveredSkills.map(s => s.name);
        const notFound = requestedSkills.filter(s => !available.includes(s));

        if (notFound.length > 0) {
          error(`Skills not found: ${notFound.join(', ')}`);
          console.log(colors.muted(`Available: ${available.join(', ')}`));
          return 1;
        }

        skillsToInstall = discoveredSkills.filter(s => requestedSkills.includes(s.name));
      } else if (this.all || this.yes) {
        skillsToInstall = discoveredSkills;
      } else if (isInteractive && discoveredSkills.length > 1) {
        // Interactive skill selection
        step(`Source: ${colors.cyan(this.source)}`);

        const skillResult = await skillMultiselect({
          message: 'Select skills to install',
          skills: discoveredSkills.map(s => ({ name: s.name })),
          initialValues: discoveredSkills.map(s => s.name),
        });

        if (isCancel(skillResult)) {
          cancel('Installation cancelled');
          return 0;
        }

        skillsToInstall = discoveredSkills.filter(s => (skillResult as string[]).includes(s.name));
      }

      if (skillsToInstall.length === 0) {
        warn('No skills to install');
        return 0;
      }

      // Determine target agents
      let targetAgents: AgentType[];

      if (this.agent && this.agent.length > 0) {
        // Explicitly specified agents
        targetAgents = this.agent as AgentType[];
      } else if (isInteractive) {
        // Interactive agent selection
        const allAgentTypes = getAllAdapters().map(a => a.type);
        const detectedAgent = await detectAgent();

        // Get last selected agents or use detected
        const lastAgents = getLastAgents();
        const initialAgents = lastAgents.length > 0
          ? lastAgents.filter(a => allAgentTypes.includes(a as AgentType))
          : [detectedAgent];

        const agentResult = await agentMultiselect({
          message: 'Install to which agents?',
          agents: allAgentTypes,
          initialValues: initialAgents,
        });

        if (isCancel(agentResult)) {
          cancel('Installation cancelled');
          return 0;
        }

        targetAgents = agentResult as AgentType[];

        // Save selection for next time
        saveLastAgents(targetAgents);
      } else {
        // Non-interactive: use detected agent
        const detectedAgent = await detectAgent();
        targetAgents = [detectedAgent];
      }

      // Interactive: select installation method
      let installMethod: 'symlink' | 'copy' = 'copy';

      if (isInteractive && targetAgents.length > 1) {
        const methodResult = await selectInstallMethod({});

        if (isCancel(methodResult)) {
          cancel('Installation cancelled');
          return 0;
        }

        installMethod = methodResult as 'symlink' | 'copy';
      }

      // Confirm installation
      if (isInteractive && !this.yes) {
        console.log('');
        const agentDisplay = targetAgents.length <= 3
          ? targetAgents.map(formatAgent).join(', ')
          : `${targetAgents.slice(0, 2).map(formatAgent).join(', ')} +${targetAgents.length - 2} more`;

        const confirmResult = await confirm({
          message: `Install ${skillsToInstall.length} skill(s) to ${agentDisplay}?`,
          initialValue: true,
        });

        if (isCancel(confirmResult) || !confirmResult) {
          cancel('Installation cancelled');
          return 0;
        }
      }

      // Perform installation
      let totalInstalled = 0;
      const installResults: InstallResult[] = [];

      for (const skill of skillsToInstall) {
        const skillName = skill.name;
        const sourcePath = skill.path;
        const installedAgents: string[] = [];

        for (const agentType of targetAgents) {
          const adapter = getAdapter(agentType);
          const installDir = getInstallDir(this.global, agentType);

          if (!existsSync(installDir)) {
            mkdirSync(installDir, { recursive: true });
          }

          const targetPath = join(installDir, skillName);

          if (existsSync(targetPath) && !this.force) {
            if (!this.quiet) {
              warn(`Skipping ${skillName} for ${adapter.name} (already exists, use --force)`);
            }
            continue;
          }

          const securityRoot = result.tempRoot || result.path;
          if (!isPathInside(sourcePath, securityRoot)) {
            error(`Skipping ${skillName} (path traversal detected)`);
            continue;
          }

          s.start(`Installing ${skillName} to ${adapter.name}...`);

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

            installedAgents.push(agentType);
            s.stop(`Installed ${skillName} to ${adapter.name}`);
          } catch (err) {
            s.stop(colors.error(`Failed to install ${skillName} to ${adapter.name}`));
            console.log(colors.muted(err instanceof Error ? err.message : String(err)));
          }
        }

        if (installedAgents.length > 0) {
          totalInstalled++;
          installResults.push({
            skillName,
            method: installMethod,
            agents: installedAgents,
            path: join(getInstallDir(this.global, installedAgents[0] as AgentType), skillName),
          });
        }
      }

      // Cleanup temp directory
      const cleanupPath = result.tempRoot || result.path;
      if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
        rmSync(cleanupPath, { recursive: true, force: true });
      }

      // Show summary
      if (totalInstalled > 0) {
        if (isInteractive) {
          showInstallSummary({
            totalSkills: totalInstalled,
            totalAgents: targetAgents.length,
            results: installResults,
            source: this.source,
          });

          outro('Installation complete!');

          if (!this.yes) {
            showNextSteps({
              skillNames: installResults.map(r => r.skillName),
              agentTypes: targetAgents,
              syncNeeded: true,
            });
          }
        } else {
          success(`Installed ${totalInstalled} skill(s) to ${targetAgents.length} agent(s)`);
          for (const r of installResults) {
            console.log(colors.muted(`  ${symbols.success} ${r.skillName} ${symbols.arrowRight} ${r.agents.map(getAgentIcon).join(' ')}`));
          }
          console.log('');
          console.log(colors.muted('Run `skillkit sync` to update agent configs'));
        }
      } else {
        warn('No skills were installed');
      }

      return 0;
    } catch (err) {
      s.stop(colors.error('Installation failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }
}
