import { existsSync, rmSync, cpSync, copyFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Command, Option } from 'clipanion';
import { findAllSkills, findSkill, detectProvider, isLocalPath, computeSkillChecksum, addSkillToLock } from '@skillkit/core';
import type { Skill, SkillMetadata } from '@skillkit/core';
import { getSearchDirs, loadSkillMetadata, saveSkillMetadata, fetchGitHubActivity } from '../helpers.js';
import { colors, spinner, warn, step } from '../onboarding/index.js';

type UpdateStatus = 'updated' | 'skipped' | 'failed';
type UpdateSpinner = ReturnType<typeof spinner>;

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
    const skillsToUpdate = this.getSkillsToUpdate();

    if (skillsToUpdate.length === 0) {
      if (this.json) {
        console.log(JSON.stringify({ updated: 0, skipped: 0, failed: 0 }));
      } else {
        warn('No skills to update');
      }
      return 0;
    }

    if (!this.json) step(`Updating ${skillsToUpdate.length} skill(s)...`);

    const counts = { updated: 0, skipped: 0, failed: 0 };
    for (const skill of skillsToUpdate) {
      counts[await this.updateSkill(skill, s)]++;
    }

    if (this.json) {
      console.log(JSON.stringify(counts));
      return counts.failed > 0 ? 1 : 0;
    }

    console.log();
    step(`Updated: ${counts.updated}, Skipped: ${counts.skipped}, Failed: ${counts.failed}`);

    return counts.failed > 0 ? 1 : 0;
  }

  private getSkillsToUpdate(): Skill[] {
    const searchDirs = getSearchDirs();
    if (this.skills.length > 0) {
      const skillsToUpdate = this.skills
        .map(name => findSkill(name, searchDirs))
        .filter((s): s is NonNullable<typeof s> => s !== null);

      const notFound = this.skills.filter(name => !findSkill(name, searchDirs));
      if (notFound.length > 0 && !this.json) {
        warn(`Skills not found: ${notFound.join(', ')}`);
      }
      return skillsToUpdate;
    }
    return findAllSkills(searchDirs);
  }

  private async updateSkill(skill: Skill, s: UpdateSpinner): Promise<UpdateStatus> {
    const metadata = loadSkillMetadata(skill.path);
    if (!metadata) {
      if (!this.json) console.log(colors.muted(`Skipping ${skill.name} (no metadata, reinstall needed)`));
      return 'skipped';
    }

    s.start(`Updating ${skill.name}...`);
    try {
      if (isLocalPath(metadata.source)) {
        return this.updateLocalSkill(skill, metadata, s);
      }
      return await this.updateGitSkill(skill, metadata, s);
    } catch (err) {
      s.stop(colors.error(`Failed to update ${skill.name}`));
      if (!this.json) console.log(colors.muted(err instanceof Error ? err.message : String(err)));
      return 'failed';
    }
  }

  private updateLocalSkill(skill: Skill, metadata: SkillMetadata, s: UpdateSpinner): UpdateStatus {
    const localPath = metadata.subpath
      ? join(metadata.source, metadata.subpath)
      : metadata.source;

    if (!existsSync(localPath)) {
      s.stop(colors.warning(`${skill.name}: local source missing`));
      return 'skipped';
    }

    const skillMdPath = join(localPath, 'SKILL.md');
    if (!existsSync(skillMdPath)) {
      s.stop(colors.warning(`${skill.name}: no SKILL.md at source`));
      return 'skipped';
    }

    rmSync(skill.path, { recursive: true, force: true });
    cpSync(localPath, skill.path, { recursive: true, dereference: true });
    this.saveUpdatedMetadata(skill, metadata);
    s.stop(`Updated ${skill.name}`);
    return 'updated';
  }

  private async updateGitSkill(skill: Skill, metadata: SkillMetadata, s: UpdateSpinner): Promise<UpdateStatus> {
    const provider = detectProvider(metadata.source);
    if (!provider) {
      s.stop(colors.warning(`${skill.name}: unknown provider`));
      return 'skipped';
    }

    if (await this.isGitHubSourceUnchanged(provider, metadata)) {
      s.stop(`${skill.name}: no changes detected`);
      return 'skipped';
    }

    const result = await provider.clone(metadata.source, '', { depth: 1 });
    if (!result.success || !result.path) {
      s.stop(colors.error(`${skill.name}: ${result.error || 'clone failed'}`));
      return 'failed';
    }

    return this.updateClonedSkill(skill, metadata, result.path, s);
  }

  private async isGitHubSourceUnchanged(
    provider: NonNullable<ReturnType<typeof detectProvider>>,
    metadata: SkillMetadata,
  ): Promise<boolean> {
    const parsed = provider.parseSource?.(metadata.source);
    if (this.force || !parsed || !('owner' in parsed) || !('repo' in parsed)) return false;
    if (provider.type !== 'github' && provider.type !== 'skills-sh') return false;
    const activity = await fetchGitHubActivity(parsed.owner, parsed.repo);
    return this.isActivityUnchanged(metadata, activity?.pushedAt);
  }

  private isActivityUnchanged(metadata: SkillMetadata, pushedAt: string | null | undefined): boolean {
    const localDate = metadata.updatedAt ?? metadata.installedAt;
    if (pushedAt && localDate) return pushedAt <= localDate;
    return false;
  }

  private updateClonedSkill(
    skill: Skill,
    metadata: SkillMetadata,
    clonePath: string,
    s: UpdateSpinner,
  ): UpdateStatus {
    const sourcePath = metadata.subpath ? join(clonePath, metadata.subpath) : clonePath;
    if (!this.isGitSourceValid(sourcePath, skill.path)) {
      s.stop(colors.warning(`${skill.name}: no SKILL.md in source`));
      rmSync(clonePath, { recursive: true, force: true });
      return 'skipped';
    }

    const newChecksum = computeSkillChecksum(sourcePath);
    if (!this.force && newChecksum && metadata.checksum && newChecksum === metadata.checksum) {
      s.stop(`${skill.name}: already up to date`);
      rmSync(clonePath, { recursive: true, force: true });
      return 'skipped';
    }

    this.copyGitSkill(sourcePath, skill.path);
    rmSync(clonePath, { recursive: true, force: true });
    this.saveUpdatedMetadata(skill, metadata);
    s.stop(`Updated ${skill.name}`);
    return 'updated';
  }

  private isGitSourceValid(sourcePath: string, installedPath: string): boolean {
    if (!existsSync(sourcePath)) return false;
    const sourceStat = statSync(sourcePath);
    if (statSync(installedPath).isFile()) return sourceStat.isFile();
    return sourceStat.isDirectory() && existsSync(join(sourcePath, 'SKILL.md'));
  }

  private copyGitSkill(sourcePath: string, targetPath: string): void {
    rmSync(targetPath, { recursive: true, force: true });
    if (statSync(sourcePath).isFile()) {
      copyFileSync(sourcePath, targetPath);
    } else {
      cpSync(sourcePath, targetPath, { recursive: true, dereference: true });
    }
  }

  private saveUpdatedMetadata(skill: Skill, metadata: SkillMetadata): void {
    metadata.checksum = computeSkillChecksum(skill.path);
    metadata.updatedAt = new Date().toISOString();
    saveSkillMetadata(skill.path, metadata);
    addSkillToLock(skill.name, {
      source: metadata.source,
      sourceType: metadata.sourceType,
      installedAt: metadata.installedAt,
      updatedAt: metadata.updatedAt,
      checksum: metadata.checksum,
      agents: [],
      path: skill.path,
    });
  }
}
