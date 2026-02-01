import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { GitProviderAdapter, CloneOptions } from './base.js';
import { isGitUrl, isLocalPath } from './base.js';
import type { GitProvider, CloneResult } from '../types.js';

export interface WellKnownSkill {
  name: string;
  description?: string;
  files: string[];
}

export interface WellKnownIndex {
  version?: string;
  skills: WellKnownSkill[];
}

export class WellKnownProvider implements GitProviderAdapter {
  readonly type: GitProvider = 'wellknown';
  readonly name = 'Well-Known';
  readonly baseUrl = '';

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null {
    try {
      const url = new URL(source);
      return { owner: url.hostname, repo: url.pathname.replace(/^\//, '') || 'skills' };
    } catch {
      return null;
    }
  }

  matches(source: string): boolean {
    if (isLocalPath(source)) return false;
    if (!isGitUrl(source)) return false;
    if (source.includes('github.com')) return false;
    if (source.includes('gitlab.com')) return false;
    if (source.includes('bitbucket.org')) return false;

    try {
      new URL(source);
      return true;
    } catch {
      return false;
    }
  }

  getCloneUrl(_owner: string, _repo: string): string {
    return '';
  }

  getSshUrl(_owner: string, _repo: string): string {
    return '';
  }

  async clone(source: string, _targetDir: string, _options: CloneOptions = {}): Promise<CloneResult> {
    const tempDir = join(tmpdir(), `skillkit-wellknown-${randomUUID()}`);

    try {
      mkdirSync(tempDir, { recursive: true });

      const baseUrl = source.replace(/\/$/, '');
      const indexUrls = [
        `${baseUrl}/.well-known/skills/index.json`,
        `${baseUrl}/.well-known/skills.json`,
      ];

      let index: WellKnownIndex | null = null;
      let foundUrl = '';

      for (const url of indexUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            index = await response.json() as WellKnownIndex;
            foundUrl = url;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!index || !index.skills || index.skills.length === 0) {
        return {
          success: false,
          error: `No skills found at ${baseUrl}/.well-known/skills/index.json`,
        };
      }

      const skills: string[] = [];
      const discoveredSkills: Array<{ name: string; dirName: string; path: string }> = [];
      const baseSkillsUrl = foundUrl.replace('/index.json', '').replace('/skills.json', '/.well-known/skills');

      for (const skill of index.skills) {
        const skillDir = join(tempDir, skill.name);
        mkdirSync(skillDir, { recursive: true });

        let hasSkillMd = false;

        for (const file of skill.files) {
          const fileUrl = `${baseSkillsUrl}/${skill.name}/${file}`;
          try {
            const response = await fetch(fileUrl);
            if (response.ok) {
              const content = await response.text();
              writeFileSync(join(skillDir, basename(file)), content);

              if (file === 'SKILL.md' || file.endsWith('/SKILL.md')) {
                hasSkillMd = true;
              }
            }
          } catch {
            continue;
          }
        }

        if (hasSkillMd) {
          skills.push(skill.name);
          discoveredSkills.push({
            name: skill.name,
            dirName: skill.name,
            path: skillDir,
          });
        }
      }

      if (skills.length === 0) {
        rmSync(tempDir, { recursive: true, force: true });
        return {
          success: false,
          error: 'No valid skills found (skills must contain SKILL.md)',
        };
      }

      return {
        success: true,
        path: tempDir,
        tempRoot: tempDir,
        skills,
        discoveredSkills,
      };
    } catch (error) {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }

      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to fetch skills: ${message}` };
    }
  }
}

export function generateWellKnownIndex(skills: Array<{ name: string; description?: string; files: string[] }>): WellKnownIndex {
  return {
    version: '1.0',
    skills: skills.map(s => ({
      name: s.name,
      description: s.description,
      files: s.files,
    })),
  };
}

export function generateWellKnownStructure(
  outputDir: string,
  skills: Array<{ name: string; description?: string; content: string; additionalFiles?: Record<string, string> }>
): { indexPath: string; skillPaths: string[] } {
  const wellKnownDir = join(outputDir, '.well-known', 'skills');
  mkdirSync(wellKnownDir, { recursive: true });

  const indexSkills: WellKnownSkill[] = [];
  const skillPaths: string[] = [];

  for (const skill of skills) {
    const skillDir = join(wellKnownDir, skill.name);
    mkdirSync(skillDir, { recursive: true });

    writeFileSync(join(skillDir, 'SKILL.md'), skill.content);
    skillPaths.push(join(skillDir, 'SKILL.md'));

    const files = ['SKILL.md'];

    if (skill.additionalFiles) {
      for (const [filename, content] of Object.entries(skill.additionalFiles)) {
        writeFileSync(join(skillDir, filename), content);
        files.push(filename);
        skillPaths.push(join(skillDir, filename));
      }
    }

    indexSkills.push({
      name: skill.name,
      description: skill.description,
      files,
    });
  }

  const index = generateWellKnownIndex(indexSkills);
  const indexPath = join(wellKnownDir, 'index.json');
  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  return { indexPath, skillPaths };
}
