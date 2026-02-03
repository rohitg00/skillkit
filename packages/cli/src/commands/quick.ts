import { existsSync, mkdirSync, cpSync, rmSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
import { Command } from 'clipanion';
import {
  type ProjectProfile,
  type SkillMetadata,
  type AgentType,
  ContextManager,
  RecommendationEngine,
  loadIndex as loadIndexFromCache,
  isIndexStale,
  buildSkillIndex,
  saveIndex,
  KNOWN_SKILL_REPOS,
  isPathInside,
  isLocalPath,
  detectProvider,
} from '@skillkit/core';
import { getAdapter, detectAgent, getAllAdapters } from '@skillkit/agents';
import { getInstallDir, saveSkillMetadata } from '../helpers.js';
import {
  welcome,
  spinner,
  step,
  success,
  error,
  warn,
  colors,
  symbols,
  confirm,
  select,
  outro,
  formatAgent,
  getAgentIcon,
  isCancel,
  cancel,
  showProjectSummary,
  progressBar,
  formatQualityBadge,
  saveLastAgents,
} from '../onboarding/index.js';

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export class QuickCommand extends Command {
  static override paths = [['quick']];

  static override usage = Command.Usage({
    description: 'Zero-friction skill setup: detect agents, analyze project, recommend and install',
    examples: [
      ['Quick setup', '$0 quick'],
    ],
  });

  async execute(): Promise<number> {
    const s = spinner();

    try {
      welcome();

      step(`${colors.bold('Quick Setup')} - zero-friction skill installation`);
      console.log('');

      s.start('Detecting installed AI agents...');
      const allAdapters = getAllAdapters();
      const detectedAgents: AgentType[] = [];

      for (const adapter of allAdapters) {
        try {
          const installDir = getInstallDir(false, adapter.type);
          const globalDir = getInstallDir(true, adapter.type);
          if (existsSync(installDir) || existsSync(globalDir) || existsSync(adapter.configFile)) {
            detectedAgents.push(adapter.type);
          }
        } catch {
          // skip
        }
      }

      if (detectedAgents.length === 0) {
        const fallback = await detectAgent();
        detectedAgents.push(fallback);
      }

      s.stop(`Detected ${detectedAgents.length} agent${detectedAgents.length !== 1 ? 's' : ''}: ${detectedAgents.map(formatAgent).join(', ')}`);

      s.start('Analyzing project...');
      const targetPath = resolve(process.cwd());
      const manager = new ContextManager(targetPath);
      let context = manager.get();
      if (!context) {
        context = manager.init();
      }
      s.stop('Project analyzed');

      if (!context) {
        error('Failed to analyze project');
        return 1;
      }

      const profile: ProjectProfile = {
        name: context.project.name,
        type: context.project.type,
        stack: context.stack,
        patterns: context.patterns,
        installedSkills: context.skills?.installed || [],
        excludedSkills: context.skills?.excluded || [],
      };

      const languages = profile.stack.languages.map((l: { name: string; version?: string }) => `${l.name}${l.version ? ` ${l.version}` : ''}`);
      const frameworks = profile.stack.frameworks.map((f: { name: string; version?: string }) => `${f.name}${f.version ? ` ${f.version}` : ''}`);

      showProjectSummary({
        name: profile.name,
        type: profile.type,
        languages,
        frameworks,
      });

      let index = loadIndexFromCache();

      if (!index || index.skills.length === 0) {
        s.start('Building skill index from known sources...');
        try {
          const result = await buildSkillIndex(KNOWN_SKILL_REPOS, (message: string) => {
            s.message(message);
          });
          index = result.index;
          saveIndex(index);
          s.stop(`Indexed ${index.skills.length} skills`);
        } catch {
          s.stop(colors.error('Failed to build index'));
          warn('Could not fetch skill index. Try running: skillkit recommend --update');
          return 1;
        }
      } else if (isIndexStale(index)) {
        step(colors.muted('Skill index is stale. Run "skillkit recommend --update" to refresh.'));
      }

      const engine = new RecommendationEngine();
      engine.loadIndex(index);

      const result = engine.recommend(profile, {
        limit: 5,
        minScore: 20,
        excludeInstalled: true,
        includeReasons: true,
      });

      const recommendations = result.recommendations;

      if (recommendations.length === 0) {
        warn('No matching skills found for your project.');
        console.log(colors.muted('Try running: skillkit recommend --update'));
        return 0;
      }

      console.log('');
      console.log(colors.bold(`Top ${recommendations.length} Recommended Skills:`));
      console.log('');

      const options: Array<{ value: string; label: string; hint?: string }> = [];

      for (let i = 0; i < recommendations.length; i++) {
        const rec = recommendations[i];
        let scoreColor: (text: string) => string;
        if (rec.score >= 70) {
          scoreColor = colors.success;
        } else if (rec.score >= 50) {
          scoreColor = colors.warning;
        } else {
          scoreColor = colors.muted;
        }
        const scoreBar = progressBar(rec.score, 100, 10);
        const qualityScore = rec.skill.quality ?? null;
        const qualityDisplay = typeof qualityScore === 'number' && Number.isFinite(qualityScore)
          ? ` ${formatQualityBadge(qualityScore)}`
          : '';

        console.log(`  ${colors.bold(`${i + 1}.`)} ${scoreColor(`${rec.score}%`)} ${colors.dim(scoreBar)} ${colors.bold(rec.skill.name)}${qualityDisplay}`);

        if (rec.skill.description) {
          console.log(`     ${colors.muted(truncate(rec.skill.description, 70))}`);
        }

        options.push({
          value: `${i}`,
          label: `${rec.skill.name} (${rec.score}% match)`,
          hint: rec.skill.source || undefined,
        });
      }

      console.log('');

      const skipOption = { value: 'skip', label: 'Skip installation' };
      const selectResult = await select({
        message: 'Select a skill to install',
        options: [...options, skipOption],
      });

      if (isCancel(selectResult) || selectResult === 'skip') {
        cancel('Quick setup complete (no installation)');
        return 0;
      }

      const selectedIndex = parseInt(selectResult as string, 10);
      const selectedSkill = recommendations[selectedIndex];

      if (!selectedSkill || !selectedSkill.skill.source) {
        error('Selected skill has no installable source');
        return 1;
      }

      const agentDisplay = detectedAgents.length <= 3
        ? detectedAgents.map(formatAgent).join(', ')
        : `${detectedAgents.slice(0, 2).map(formatAgent).join(', ')} +${detectedAgents.length - 2} more`;

      const confirmResult = await confirm({
        message: `Install ${colors.bold(selectedSkill.skill.name)} to ${agentDisplay}?`,
        initialValue: true,
      });

      if (isCancel(confirmResult) || !confirmResult) {
        cancel('Installation cancelled');
        return 0;
      }

      saveLastAgents(detectedAgents);

      const providerAdapter = detectProvider(selectedSkill.skill.source);

      if (!providerAdapter) {
        error(`Could not detect provider for: ${selectedSkill.skill.source}`);
        return 1;
      }

      s.start(`Fetching ${selectedSkill.skill.name}...`);

      const cloneResult = await providerAdapter.clone(selectedSkill.skill.source, '', { depth: 1 });

      if (!cloneResult.success || !cloneResult.path) {
        s.stop(colors.error(cloneResult.error || 'Failed to fetch source'));
        return 1;
      }

      const discoveredSkills = cloneResult.discoveredSkills || [];
      const matchedSkill = discoveredSkills.find(ds => ds.name === selectedSkill.skill.name) || discoveredSkills[0];

      if (!matchedSkill) {
        s.stop(colors.error('Skill not found in repository'));
        return 1;
      }

      s.stop(`Found ${selectedSkill.skill.name}`);

      let primaryPath: string | null = null;
      const installedAgents: string[] = [];

      for (const agentType of detectedAgents) {
        const adapter = getAdapter(agentType);
        const installDir = getInstallDir(false, agentType);

        if (!existsSync(installDir)) {
          mkdirSync(installDir, { recursive: true });
        }

        const targetInstallPath = join(installDir, matchedSkill.name);

        const securityRoot = cloneResult.tempRoot || cloneResult.path;
        if (!isPathInside(matchedSkill.path, securityRoot)) {
          error(`Skipping ${matchedSkill.name} for ${adapter.name} (path traversal detected)`);
          continue;
        }

        const useSymlink = detectedAgents.length > 1 && primaryPath !== null;

        s.start(`Installing to ${adapter.name}${useSymlink ? ' (symlink)' : ''}...`);

        try {
          if (existsSync(targetInstallPath)) {
            rmSync(targetInstallPath, { recursive: true, force: true });
          }

          if (useSymlink && primaryPath) {
            symlinkSync(primaryPath, targetInstallPath, 'dir');
          } else {
            cpSync(matchedSkill.path, targetInstallPath, { recursive: true, dereference: true });
            if (detectedAgents.length > 1 && primaryPath === null) {
              primaryPath = targetInstallPath;
            }

            const packageJsonPath = join(targetInstallPath, 'package.json');
            if (existsSync(packageJsonPath)) {
              s.stop(`Installed to ${adapter.name}`);
              s.start('Installing npm dependencies...');
              try {
                await execFileAsync('npm', ['install', '--production'], { cwd: targetInstallPath });
                s.stop('Dependencies installed');
              } catch {
                s.stop(colors.warning('Dependencies failed'));
                console.log(colors.muted('Run manually: npm install in ' + targetInstallPath));
              }
              s.start('Finishing installation...');
            }
          }

          const metadata: SkillMetadata = {
            name: matchedSkill.name,
            description: selectedSkill.skill.description || '',
            source: selectedSkill.skill.source,
            sourceType: providerAdapter.type,
            subpath: matchedSkill.name,
            installedAt: new Date().toISOString(),
            enabled: true,
          };
          saveSkillMetadata(targetInstallPath, metadata);

          installedAgents.push(agentType);
          s.stop(`Installed to ${adapter.name}${useSymlink ? ' (symlink)' : ''}`);
        } catch (err) {
          s.stop(colors.error(`Failed to install to ${adapter.name}`));
          console.log(colors.muted(err instanceof Error ? err.message : String(err)));
        }
      }

      const cleanupPath = cloneResult.tempRoot || cloneResult.path;
      if (!isLocalPath(selectedSkill.skill.source) && cleanupPath && existsSync(cleanupPath)) {
        rmSync(cleanupPath, { recursive: true, force: true });
      }

      if (installedAgents.length > 0) {
        console.log('');
        success(`Installed ${colors.bold(matchedSkill.name)} to ${installedAgents.length} agent${installedAgents.length !== 1 ? 's' : ''}`);
        for (const a of installedAgents) {
          console.log(colors.muted(`  ${symbols.success} ${getAgentIcon(a)} ${formatAgent(a)}`));
        }

        console.log('');
        const badgeUrl = `https://img.shields.io/badge/SkillKit-${encodeURIComponent(matchedSkill.name)}-black?style=flat-square`;
        console.log(colors.dim('Add to your README:'));
        console.log(colors.muted(`  [![SkillKit](${badgeUrl})](https://agenstskills.com)`));

        outro('Quick setup complete!');

        console.log('');
        console.log(colors.muted('Next steps:'));
        console.log(colors.muted(`  ${symbols.arrowRight} Run ${colors.cyan('skillkit sync')} to update agent configs`));
        console.log(colors.muted(`  ${symbols.arrowRight} Run ${colors.cyan('skillkit recommend')} for more suggestions`));
        console.log(colors.muted(`  ${symbols.arrowRight} Run ${colors.cyan('skillkit list')} to see installed skills`));
        console.log('');
      } else {
        warn('No agents were installed');
      }

      return 0;
    } catch (err) {
      s.stop(colors.error('Quick setup failed'));
      console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 1;
    }
  }
}
