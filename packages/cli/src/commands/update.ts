import { existsSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { Command, Option } from 'clipanion';
import { findAllSkills, findSkill, detectProvider, isLocalPath, computeSkillChecksum, computeSkillIntegrity, addSkillToLock } from '@skillkit/core';

function safeIntegrity(path: string): string | undefined {
  try {
    return computeSkillIntegrity(path).sri;
  } catch {
    return undefined;
  }
}
import { getSearchDirs, loadSkillMetadata, saveSkillMetadata, fetchGitHubActivity } from '../helpers.js';
import { colors, spinner, warn, step } from '../onboarding/index.js';

export class UpdateCommand extends Command {
  static override paths = [['update'], ['u']];

  static override usage = Command.Usage({
    description: 'Update skills from their original sources',
    examples: [
      ['Update all skills', '$0 update'],
      ['Update specific skills', '$0 update pdf xlsx'],
      ['Force update (overwrite local changes)', '$0 update --force'],
    ],
  });

  skills = Option.Rest();

  force = Option.Boolean('--force,-f', false, {
    description: 'Force update even if local changes exist',
  });

  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const s = this.json ? { start: () => {}, stop: () => {}, message: () => {} } : spinner();
    const searchDirs = getSearchDirs();

    let skillsToUpdate;

    if (this.skills.length > 0) {
      skillsToUpdate = this.skills
        .map(name => findSkill(name, searchDirs))
        .filter((s): s is NonNullable<typeof s> => s !== null);

      const notFound = this.skills.filter(name => !findSkill(name, searchDirs));
      if (notFound.length > 0 && !this.json) {
        warn(`Skills not found: ${notFound.join(', ')}`);
      }
    } else {
      skillsToUpdate = findAllSkills(searchDirs);
    }

    if (skillsToUpdate.length === 0) {
      if (this.json) {
        console.log(JSON.stringify({ updated: 0, skipped: 0, failed: 0 }));
      } else {
        warn('No skills to update');
      }
      return 0;
    }

    if (!this.json) step(`Updating ${skillsToUpdate.length} skill(s)...`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const skill of skillsToUpdate) {
      const metadata = loadSkillMetadata(skill.path);

      if (!metadata) {
        if (!this.json) console.log(colors.muted(`Skipping ${skill.name} (no metadata, reinstall needed)`));
        skipped++;
        continue;
      }

      s.start(`Updating ${skill.name}...`);

      try {
        if (isLocalPath(metadata.source)) {
          const localPath = metadata.subpath
            ? join(metadata.source, metadata.subpath)
            : metadata.source;

          if (!existsSync(localPath)) {
            s.stop(colors.warning(`${skill.name}: local source missing`));
            skipped++;
            continue;
          }

          const skillMdPath = join(localPath, 'SKILL.md');
          if (!existsSync(skillMdPath)) {
            s.stop(colors.warning(`${skill.name}: no SKILL.md at source`));
            skipped++;
            continue;
          }

          rmSync(skill.path, { recursive: true, force: true });
          cpSync(localPath, skill.path, { recursive: true, dereference: true });

          metadata.checksum = computeSkillChecksum(skill.path);
          metadata.updatedAt = new Date().toISOString();
          saveSkillMetadata(skill.path, metadata);
          addSkillToLock(skill.name, {
            source: metadata.source,
            sourceType: metadata.sourceType,
            installedAt: metadata.installedAt,
            updatedAt: metadata.updatedAt,
            checksum: safeIntegrity(skill.path) ?? metadata.checksum,
            agents: [],
            path: skill.path,
          });

          s.stop(`Updated ${skill.name}`);
          updated++;
        } else {
          const provider = detectProvider(metadata.source);

          if (!provider) {
            s.stop(colors.warning(`${skill.name}: unknown provider`));
            skipped++;
            continue;
          }

          const parsed = provider.parseSource?.(metadata.source);
          if (!this.force && parsed && 'owner' in parsed && 'repo' in parsed && (provider.type === 'github' || provider.type === 'skills-sh')) {
            const activity = await fetchGitHubActivity(parsed.owner, parsed.repo);
            const localDate = metadata.updatedAt ?? metadata.installedAt;
            if (activity?.pushedAt && localDate && activity.pushedAt <= localDate) {
              s.stop(`${skill.name}: no changes detected`);
              skipped++;
              continue;
            }
          }

          const result = await provider.clone(metadata.source, '', { depth: 1 });

          if (!result.success || !result.path) {
            s.stop(colors.error(`${skill.name}: ${result.error || 'clone failed'}`));
            failed++;
            continue;
          }

          const sourcePath = metadata.subpath
            ? join(result.path, metadata.subpath)
            : result.path;

          const skillMdPath = join(sourcePath, 'SKILL.md');
          if (!existsSync(skillMdPath)) {
            s.stop(colors.warning(`${skill.name}: no SKILL.md in source`));
            rmSync(result.path, { recursive: true, force: true });
            skipped++;
            continue;
          }

          const newChecksum = computeSkillChecksum(sourcePath);
          if (!this.force && newChecksum && metadata.checksum && newChecksum === metadata.checksum) {
            s.stop(`${skill.name}: already up to date`);
            rmSync(result.path, { recursive: true, force: true });
            skipped++;
            continue;
          }

          rmSync(skill.path, { recursive: true, force: true });
          cpSync(sourcePath, skill.path, { recursive: true, dereference: true });

          rmSync(result.path, { recursive: true, force: true });

          metadata.checksum = computeSkillChecksum(skill.path);
          metadata.updatedAt = new Date().toISOString();
          saveSkillMetadata(skill.path, metadata);
          addSkillToLock(skill.name, {
            source: metadata.source,
            sourceType: metadata.sourceType,
            installedAt: metadata.installedAt,
            updatedAt: metadata.updatedAt,
            checksum: safeIntegrity(skill.path) ?? metadata.checksum,
            agents: [],
            path: skill.path,
          });

          s.stop(`Updated ${skill.name}`);
          updated++;
        }
      } catch (err) {
        s.stop(colors.error(`Failed to update ${skill.name}`));
        if (!this.json) console.log(colors.muted(err instanceof Error ? err.message : String(err)));
        failed++;
      }
    }

    if (this.json) {
      console.log(JSON.stringify({ updated, skipped, failed }));
      return failed > 0 ? 1 : 0;
    }

    console.log();
    step(`Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);

    return failed > 0 ? 1 : 0;
  }
}
