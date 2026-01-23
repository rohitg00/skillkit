import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { GitProviderAdapter, CloneOptions } from './base.js';
import { parseShorthand, isGitUrl } from './base.js';
import type { GitProvider, CloneResult } from '../types.js';
import { discoverSkills } from '../skills.js';

export class GitHubProvider implements GitProviderAdapter {
  readonly type: GitProvider = 'github';
  readonly name = 'GitHub';
  readonly baseUrl = 'https://github.com';

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null {
    if (source.startsWith('https://github.com/')) {
      const path = source.replace('https://github.com/', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (source.startsWith('git@github.com:')) {
      const path = source.replace('git@github.com:', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (!isGitUrl(source) && !source.includes(':')) {
      return parseShorthand(source);
    }

    return null;
  }

  matches(source: string): boolean {
    return (
      source.startsWith('https://github.com/') ||
      source.startsWith('git@github.com:') ||
      (!isGitUrl(source) && !source.includes(':') && source.includes('/'))
    );
  }

  getCloneUrl(owner: string, repo: string): string {
    return `https://github.com/${owner}/${repo}.git`;
  }

  getSshUrl(owner: string, repo: string): string {
    return `git@github.com:${owner}/${repo}.git`;
  }

  async clone(source: string, _targetDir: string, options: CloneOptions = {}): Promise<CloneResult> {
    const parsed = this.parseSource(source);
    if (!parsed) {
      return { success: false, error: `Invalid GitHub source: ${source}` };
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
