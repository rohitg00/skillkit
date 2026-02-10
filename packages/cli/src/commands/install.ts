import { existsSync, mkdirSync, cpSync, rmSync, symlinkSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
import { Command, Option } from 'clipanion';
import { detectProvider, isLocalPath, getProvider, evaluateSkillDirectory, SkillScanner, formatSummary, Severity, WellKnownProvider, AgentsMdParser, AgentsMdGenerator } from '@skillkit/core';
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
  quickAgentSelect,
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
  formatQualityBadge,
  getQualityGradeFromScore,
  type InstallResult,
} from '../onboarding/index.js';

export class InstallCommand extends Command {
  static override paths = [['install'], ['i'], ['add']];

  static override usage = Command.Usage({
    description: 'Install skills from GitHub, GitLab, Bitbucket, or local path',
    examples: [
      ['Install from GitHub', '$0 install owner/repo'],
      ['Install from GitLab', '$0 install gitlab:owner/repo'],
      ['Install from Bitbucket', '$0 install bitbucket:owner/repo'],
      ['Install specific skill', '$0 install owner/repo --skill=pdf'],
      ['Install multiple skills (CI/CD)', '$0 install owner/repo --skills=pdf,xlsx'],
      ['Install all skills non-interactively', '$0 install owner/repo --all'],
      ['Install from local path', '$0 install ./my-skills'],
      ['Install globally', '$0 install owner/repo --global'],
      ['List available skills', '$0 install owner/repo --list'],
      ['Install to specific agents', '$0 install owner/repo --agent claude-code --agent cursor'],
    ],
  });

  source = Option.String({ required: true });

  skills = Option.String('--skills,--skill,-s', {
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

  scan = Option.Boolean('--scan', true, {
    description: 'Run security scan before installing (default: true)',
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
      let result: { success: boolean; path?: string; tempRoot?: string; error?: string; skills?: string[]; discoveredSkills?: Array<{ name: string; dirName: string; path: string }> } | null = null;

      const isUrl = this.source.startsWith('http://') || this.source.startsWith('https://');
      if (isUrl && !this.provider && !providerAdapter) {
        s.start('Checking for well-known skills...');
        const wellKnown = new WellKnownProvider();
        const discovery = await wellKnown.discoverFromUrl(this.source);
        if (discovery.success) {
          s.stop(`Found ${discovery.skills?.length || 0} skill(s) via well-known discovery`);
          providerAdapter = wellKnown;
          result = discovery;
        } else {
          s.stop('No well-known skills found');
          warn(`No well-known skills found at ${this.source}`);
          console.log(colors.muted('You can save this URL as a skill instead:'));
          console.log(colors.muted(`  skillkit save ${this.source}`));
          return 1;
        }
      }

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

      if (!result) {
        s.start(`Fetching from ${providerAdapter.name}...`);
        result = await providerAdapter.clone(this.source, '', { depth: 1 });

        if (!result.success || !result.path) {
          s.stop(colors.error(result.error || 'Failed to fetch source'));
          return 1;
        }

        s.stop(`Found ${result.skills?.length || 0} skill(s)`);
      }

      const cloneResult = result!;
      const discoveredSkills = cloneResult.discoveredSkills || [];

      // List mode - just show skills and exit
      if (this.list) {
        if (discoveredSkills.length === 0) {
          warn('No skills found in this repository');
        } else {
          console.log('');
          console.log(colors.bold('Available skills:'));
          console.log('');
          for (const skill of discoveredSkills) {
            const quality = evaluateSkillDirectory(skill.path);
            const qualityBadge = quality ? ` ${formatQualityBadge(quality.overall)}` : '';
            console.log(`  ${colors.success(symbols.stepActive)} ${colors.primary(skill.name)}${qualityBadge}`);
          }
          console.log('');
          console.log(colors.muted(`Total: ${discoveredSkills.length} skill(s)`));
          console.log(colors.muted('To install: skillkit install <source> --skill=name'));
        }

        const cleanupPath = cloneResult.tempRoot || cloneResult.path;
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
        const allAgentTypes = getAllAdapters().map(a => a.type);
        const lastAgents = getLastAgents();

        step(`Detected ${allAgentTypes.length} agents`);

        const agentResult = await quickAgentSelect({
          message: 'Install to',
          agents: allAgentTypes,
          lastSelected: lastAgents,
        });

        if (isCancel(agentResult)) {
          cancel('Installation cancelled');
          return 0;
        }

        targetAgents = (agentResult as { agents: string[] }).agents as AgentType[];

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

      // Check for low-quality skills and warn
      const lowQualitySkills: Array<{ name: string; score: number; warnings: string[] }> = [];
      for (const skill of skillsToInstall) {
        const quality = evaluateSkillDirectory(skill.path);
        if (quality && quality.overall < 60) {
          lowQualitySkills.push({
            name: skill.name,
            score: quality.overall,
            warnings: quality.warnings.slice(0, 2),
          });
        }
      }

      if (this.scan) {
        const scanner = new SkillScanner({ failOnSeverity: Severity.HIGH });
        for (const skill of skillsToInstall) {
          const scanResult = await scanner.scan(skill.path);

          if (scanResult.verdict === 'fail' && !this.force) {
            error(`Security scan FAILED for "${skill.name}"`);
            console.log(formatSummary(scanResult));
            console.log(colors.muted('Use --force to install anyway, or --no-scan to skip scanning'));

            const cleanupPath = cloneResult.tempRoot || cloneResult.path;
            if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
              rmSync(cleanupPath, { recursive: true, force: true });
            }
            return 1;
          }

          if (scanResult.verdict === 'warn' && !this.quiet) {
            warn(`Security warnings for "${skill.name}" (${scanResult.stats.medium} medium, ${scanResult.stats.low} low)`);
          }
        }
      }

      // Confirm installation
      if (isInteractive && !this.yes) {
        console.log('');

        // Show low-quality warning if any
        if (lowQualitySkills.length > 0) {
          console.log(colors.warning(`${symbols.warning} Warning: ${lowQualitySkills.length} skill(s) have low quality scores (< 60)`));
          for (const lq of lowQualitySkills) {
            const grade = getQualityGradeFromScore(lq.score);
            const warningText = lq.warnings.length > 0 ? ` - ${lq.warnings.join(', ')}` : '';
            console.log(colors.muted(`    - ${lq.name} [${grade}]${warningText}`));
          }
          console.log('');
        }

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
        let primaryPath: string | null = null;

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

          const securityRoot = cloneResult.tempRoot || cloneResult.path || '';
          if (!securityRoot || !isPathInside(sourcePath, securityRoot)) {
            error(`Skipping ${skillName} (path traversal detected)`);
            continue;
          }

          const isSymlinkMode = installMethod === 'symlink' && targetAgents.length > 1;
          const useSymlink = isSymlinkMode && primaryPath !== null;

          s.start(`Installing ${skillName} to ${adapter.name}${useSymlink ? ' (symlink)' : ''}...`);

          try {
            if (existsSync(targetPath)) {
              rmSync(targetPath, { recursive: true, force: true });
            }

            if (useSymlink && primaryPath) {
              symlinkSync(primaryPath, targetPath, 'dir');
            } else {
              cpSync(sourcePath, targetPath, { recursive: true, dereference: true });
              if (isSymlinkMode && primaryPath === null) {
                primaryPath = targetPath;
              }

              // Auto-install npm dependencies if package.json exists
              const packageJsonPath = join(targetPath, 'package.json');
              if (existsSync(packageJsonPath)) {
                s.stop(`Installed ${skillName} to ${adapter.name}`);
                s.start(`Installing npm dependencies for ${skillName}...`);
                try {
                  await execFileAsync('npm', ['install', '--production'], { cwd: targetPath });
                  s.stop(`Installed dependencies for ${skillName}`);
                } catch (npmErr) {
                  s.stop(colors.warning(`Dependencies failed for ${skillName}`));
                  console.log(colors.muted('Run manually: npm install in ' + targetPath));
                }
                s.start(`Finishing ${skillName} installation...`);
              }
            }

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
            s.stop(`Installed ${skillName} to ${adapter.name}${useSymlink ? ' (symlink)' : ''}`);
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
      const cleanupPath = cloneResult.tempRoot || cloneResult.path;
      if (!isLocalPath(this.source) && cleanupPath && existsSync(cleanupPath)) {
        rmSync(cleanupPath, { recursive: true, force: true });
      }

      if (totalInstalled > 0) {
        try {
          const agentsMdPath = join(process.cwd(), 'AGENTS.md');
          if (existsSync(agentsMdPath)) {
            const parser = new AgentsMdParser();
            const existing = readFileSync(agentsMdPath, 'utf-8');
            if (parser.hasManagedSections(existing)) {
              const gen = new AgentsMdGenerator({ projectPath: process.cwd() });
              const genResult = gen.generate();
              const updated = parser.updateManagedSections(existing, genResult.sections.filter(s => s.managed));
              writeFileSync(agentsMdPath, updated, 'utf-8');
            }
          }
        } catch {
          warn('Failed to update AGENTS.md');
        }
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
