import { existsSync, statSync, realpathSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import type { GitProviderAdapter, CloneOptions } from './base.js';
import { isLocalPath } from './base.js';
import type { GitProvider, CloneResult } from '../core/types.js';
import { discoverSkills } from '../core/skills.js';

export class LocalProvider implements GitProviderAdapter {
  readonly type: GitProvider = 'local';
  readonly name = 'Local Filesystem';
  readonly baseUrl = '';

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null {
    if (!isLocalPath(source)) {
      return null;
    }

    let expandedPath = source;
    if (source.startsWith('~/')) {
      expandedPath = join(homedir(), source.slice(2));
    }

    const absolutePath = resolve(expandedPath);

    const dirName = basename(absolutePath);

    return {
      owner: 'local',
      repo: dirName,
      subpath: absolutePath, 
    };
  }

  matches(source: string): boolean {
    return isLocalPath(source);
  }

  getCloneUrl(_owner: string, _repo: string): string {
    return ''; 
  }

  getSshUrl(_owner: string, _repo: string): string {
    return ''; 
  }

  async clone(source: string, _targetDir: string, _options: CloneOptions = {}): Promise<CloneResult> {
    const parsed = this.parseSource(source);
    if (!parsed || !parsed.subpath) {
      return { success: false, error: `Invalid local path: ${source}` };
    }

    const sourcePath = parsed.subpath;

    if (!existsSync(sourcePath)) {
      return { success: false, error: `Path does not exist: ${sourcePath}` };
    }

    const stats = statSync(sourcePath);
    if (!stats.isDirectory()) {
      return { success: false, error: `Path is not a directory: ${sourcePath}` };
    }

    try {
      
      let actualPath = sourcePath;
      try {
        actualPath = realpathSync(sourcePath);
      } catch {
        
      }

      const skills = discoverSkills(actualPath);

      return {
        success: true,
        path: actualPath,
        skills: skills.map(s => s.name),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Failed to process local path: ${message}` };
    }
  }
}
