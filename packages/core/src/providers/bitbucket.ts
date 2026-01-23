import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { GitProviderAdapter, CloneOptions } from './base.js';
import { parseShorthand } from './base.js';
import type { GitProvider, CloneResult } from '../types.js';
import { discoverSkills } from '../skills.js';

export class BitbucketProvider implements GitProviderAdapter {
  readonly type: GitProvider = 'bitbucket';
  readonly name = 'Bitbucket';
  readonly baseUrl = 'https://bitbucket.org';

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null {
    if (source.startsWith('https://bitbucket.org/')) {
      const path = source.replace('https://bitbucket.org/', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (source.startsWith('git@bitbucket.org:')) {
      const path = source.replace('git@bitbucket.org:', '').replace(/\.git$/, '');
      return parseShorthand(path);
    }

    if (source.startsWith('bitbucket:')) {
      return parseShorthand(source.replace('bitbucket:', ''));
    }

    if (source.startsWith('bitbucket.org/')) {
      return parseShorthand(source.replace('bitbucket.org/', ''));
    }

    return null;
  }

  matches(source: string): boolean {
    return (
      source.startsWith('https://bitbucket.org/') ||
      source.startsWith('git@bitbucket.org:') ||
      source.startsWith('bitbucket:') ||
      source.startsWith('bitbucket.org/')
    );
  }

  getCloneUrl(owner: string, repo: string): string {
    return `https://bitbucket.org/${owner}/${repo}.git`;
  }

  getSshUrl(owner: string, repo: string): string {
    return `git@bitbucket.org:${owner}/${repo}.git`;
  }

  async clone(source: string, _targetDir: string, options: CloneOptions = {}): Promise<CloneResult> {
    const parsed = this.parseSource(source);
    if (!parsed) {
      return { success: false, error: `Invalid Bitbucket source: ${source}` };
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
