import type { GitProvider, CloneResult } from '../types.js';

export interface GitProviderAdapter {
  readonly type: GitProvider;
  readonly name: string;
  readonly baseUrl: string;

  parseSource(source: string): { owner: string; repo: string; subpath?: string } | null;
  matches(source: string): boolean;
  getCloneUrl(owner: string, repo: string): string;
  getSshUrl(owner: string, repo: string): string;
  clone(source: string, targetDir: string, options?: CloneOptions): Promise<CloneResult>;
}

export interface CloneOptions {
  depth?: number;
  branch?: string;
  ssh?: boolean;
}

export function parseShorthand(source: string): { owner: string; repo: string; subpath?: string } | null {
  const cleaned = source.replace(/^\/+|\/+$/g, '');
  const parts = cleaned.split('/');

  if (parts.length < 2) {
    return null;
  }

  const owner = parts[0];
  const repo = parts[1];
  const subpath = parts.length > 2 ? parts.slice(2).join('/') : undefined;

  return { owner, repo, subpath };
}

export function isLocalPath(source: string): boolean {
  return (
    source.startsWith('/') ||
    source.startsWith('./') ||
    source.startsWith('../') ||
    source.startsWith('~/') ||
    source.startsWith('.')
  );
}

export function isGitUrl(source: string): boolean {
  return (
    source.startsWith('git@') ||
    source.startsWith('https://') ||
    source.startsWith('http://') ||
    source.startsWith('ssh://')
  );
}
