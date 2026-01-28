import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Command, Option } from 'clipanion';
import { findAllSkills, findSkill, detectProvider, isLocalPath } from '@skillkit/core';
import { getSearchDirs, loadSkillMetadata } from '../helpers.js';
import {
  colors,
  symbols,
  spinner,
  step,
  success,
  warn,
  header,
} from '../onboarding/index.js';

interface UpdateInfo {
  name: string;
  currentVersion?: string;
  hasUpdate: boolean;
  error?: string;
}

export class CheckCommand extends Command {
  static override paths = [['check']];

  static override usage = Command.Usage({
    description: 'Check for available skill updates (dry-run)',
    details: `
      Checks if installed skills have updates available from their sources.
      Does not modify any files - just reports what would be updated.
    `,
    examples: [
      ['Check all skills for updates', '$0 check'],
      ['Check specific skills', '$0 check pdf xlsx'],
      ['Show detailed output', '$0 check --verbose'],
    ],
  });

  skills = Option.Rest();

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed information',
  });

  quiet = Option.Boolean('--quiet,-q', false, {
    description: 'Minimal output',
  });

  async execute(): Promise<number> {
    const searchDirs = getSearchDirs();
    const s = spinner();

    if (!this.quiet) {
      header('Check Updates');
    }

    let skillsToCheck;

    if (this.skills.length > 0) {
      const foundSkills = this.skills.map(name => ({
        name,
        skill: findSkill(name, searchDirs),
      }));

      skillsToCheck = foundSkills
        .filter((s): s is { name: string; skill: NonNullable<typeof s.skill> } => s.skill !== null)
        .map(s => s.skill);

      const notFound = foundSkills.filter(s => s.skill === null).map(s => s.name);
      if (notFound.length > 0) {
        warn(`Skills not found: ${notFound.join(', ')}`);
      }
    } else {
      skillsToCheck = findAllSkills(searchDirs);
    }

    if (skillsToCheck.length === 0) {
      warn('No skills to check');
      return 0;
    }

    if (!this.quiet) {
      step(`Checking ${skillsToCheck.length} skill(s) for updates...`);
      console.log('');
    }

    const results: UpdateInfo[] = [];
    let updatesAvailable = 0;

    for (const skill of skillsToCheck) {
      const metadata = loadSkillMetadata(skill.path);

      if (!metadata) {
        results.push({
          name: skill.name,
          hasUpdate: false,
          error: 'No metadata (reinstall needed)',
        });
        continue;
      }

      if (this.verbose) {
        s.start(`Checking ${skill.name}...`);
      }

      try {
        if (isLocalPath(metadata.source)) {
          const localPath = metadata.subpath
            ? join(metadata.source, metadata.subpath)
            : metadata.source;

          if (!existsSync(localPath)) {
            results.push({
              name: skill.name,
              hasUpdate: false,
              error: 'Local source missing',
            });
            if (this.verbose) s.stop(`${skill.name}: source missing`);
            continue;
          }

          const sourceSkillMd = join(localPath, 'SKILL.md');
          const installedSkillMd = join(skill.path, 'SKILL.md');

          if (existsSync(sourceSkillMd) && existsSync(installedSkillMd)) {
            const { statSync } = await import('node:fs');
            const sourceTime = statSync(sourceSkillMd).mtime;
            const installedTime = statSync(installedSkillMd).mtime;

            if (sourceTime > installedTime) {
              results.push({ name: skill.name, hasUpdate: true });
              updatesAvailable++;
              if (this.verbose) s.stop(`${skill.name}: update available`);
            } else {
              results.push({ name: skill.name, hasUpdate: false });
              if (this.verbose) s.stop(`${skill.name}: up to date`);
            }
          } else {
            results.push({ name: skill.name, hasUpdate: false });
            if (this.verbose) s.stop(`${skill.name}: up to date`);
          }
        } else {
          const provider = detectProvider(metadata.source);

          if (!provider) {
            results.push({
              name: skill.name,
              hasUpdate: false,
              error: 'Unknown provider',
            });
            if (this.verbose) s.stop(`${skill.name}: unknown provider`);
            continue;
          }

          results.push({
            name: skill.name,
            hasUpdate: false,
            currentVersion: metadata.updatedAt || metadata.installedAt,
          });
          if (this.verbose) s.stop(`${skill.name}: remote source (run update to sync)`);
        }
      } catch (err) {
        results.push({
          name: skill.name,
          hasUpdate: false,
          error: err instanceof Error ? err.message : 'Check failed',
        });
        if (this.verbose) s.stop(`${skill.name}: error`);
      }
    }

    console.log('');

    const withUpdates = results.filter(r => r.hasUpdate);
    const upToDate = results.filter(r => !r.hasUpdate && !r.error);
    const withErrors = results.filter(r => r.error);

    if (withUpdates.length > 0) {
      console.log(colors.primary('Updates available:'));
      for (const r of withUpdates) {
        console.log(`  ${colors.success(symbols.arrowUp)} ${colors.primary(r.name)}`);
      }
      console.log('');
    }

    if (upToDate.length > 0 && this.verbose) {
      console.log(colors.muted('Up to date:'));
      for (const r of upToDate) {
        console.log(`  ${colors.muted(symbols.success)} ${colors.muted(r.name)}`);
      }
      console.log('');
    }

    if (withErrors.length > 0) {
      console.log(colors.warning('Could not check:'));
      for (const r of withErrors) {
        console.log(`  ${colors.warning(symbols.warning)} ${r.name}: ${colors.muted(r.error || 'unknown')}`);
      }
      console.log('');
    }

    if (updatesAvailable > 0) {
      success(`${updatesAvailable} update(s) available`);
      console.log(colors.muted('Run `skillkit update` to install updates'));
    } else {
      success('All skills are up to date');
    }

    return 0;
  }
}
