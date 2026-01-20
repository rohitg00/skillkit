import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { GitProviderAdapter, CloneOptions } from './base.js';
import { parseShorthand } from './base.js';
import type { GitProvider, CloneResult } from '../core/types.js';
import { discoverSkills } from '../core/skills.js';

export class GitLabProvider implements GitProviderAdapter {
  readonly type: GitProvider = 'gitlab';
  readonly name = 'GitLab';
  readonly baseUrl = 'https://gitlab.com';

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null {
    
    if (source.startsWith('https://gitlab.com/')) {
      const path = source.replace('https://gitlab.com/', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (source.startsWith('git@gitlab.com:')) {
      const path = source.replace('git@gitlab.com:', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (source.startsWith('gitlab:')) {
      return parseShorthand(source.replace('gitlab:', ''));
    }

    if (source.startsWith('gitlab.com/')) {
      return parseShorthand(source.replace('gitlab.com/', ''));
    }

    return null;
  }

  matches(source: string): boolean {
    return (
      source.startsWith('https://gitlab.com/') ||
      source.startsWith('git@gitlab.com:') ||
      source.startsWith('gitlab:') ||
      source.startsWith('gitlab.com/')
    );
  }

  getCloneUrl(owner: string, repo: string): string {
    return `https://gitlab.com/${owner}/${repo}.git`;
  }

  getSshUrl(owner: string, repo: string): string {
    return `git@gitlab.com:${owner}/${repo}.git`;
  }

  async clone(source: string, _targetDir: string, options: CloneOptions = {}): Promise<CloneResult> {
    const parsed = this.parseSource(source);
    if (!parsed) {
      return { success: false, error: `Invalid GitLab source: ${source}` };
    }

    const { owner, repo, subpath } = parsed;
    const cloneUrl = options.ssh ? this.getSshUrl(owner, repo) : this.getCloneUrl(owner, repo);

    const tempDir = join(tmpdir(), `skillkit-${randomUUID()}`);

    try {
      
      const args = ['clone'];
      if (options.depth) {
        args.push('--depth', String(options.depth));
      }
      if (options.branch) {
        args.push('--branch', options.branch);
      }
      args.push(cloneUrl, tempDir);

      execSync(`git ${args.join(' ')}`, {
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });

      const searchDir = subpath ? join(tempDir, subpath) : tempDir;
      const skills = discoverSkills(searchDir);

      return {
        success: true,
        path: searchDir, 
        tempRoot: tempDir, 
        skills: skills.map(s => s.name),
        discoveredSkills: skills.map(s => ({
          name: s.name,
          dirName: basename(s.path),
          path: s.path,
        })),
      };
    } catch (error) {
      
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }

      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to clone: ${message}` };
    }
  }
}
