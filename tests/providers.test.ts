import { describe, it, expect } from 'vitest';
import { GitHubProvider } from '../src/providers/github.js';
import { GitLabProvider } from '../src/providers/gitlab.js';
import { BitbucketProvider } from '../src/providers/bitbucket.js';
import { LocalProvider } from '../src/providers/local.js';
import { detectProvider, parseSource, isLocalPath, isGitUrl } from '../src/providers/index.js';

describe('providers', () => {
  describe('GitHubProvider', () => {
    const provider = new GitHubProvider();

    it('should match GitHub URLs', () => {
      expect(provider.matches('https://github.com/owner/repo')).toBe(true);
      expect(provider.matches('git@github.com:owner/repo')).toBe(true);
      expect(provider.matches('owner/repo')).toBe(true);
    });

    it('should not match other URLs', () => {
      expect(provider.matches('https://gitlab.com/owner/repo')).toBe(false);
      expect(provider.matches('gitlab:owner/repo')).toBe(false);
    });

    it('should parse GitHub URLs', () => {
      expect(provider.parseSource('owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: undefined,
      });

      expect(provider.parseSource('owner/repo/subdir')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: 'subdir',
      });

      expect(provider.parseSource('https://github.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: undefined,
      });
    });

    it('should generate correct clone URLs', () => {
      expect(provider.getCloneUrl('owner', 'repo')).toBe('https://github.com/owner/repo.git');
      expect(provider.getSshUrl('owner', 'repo')).toBe('git@github.com:owner/repo.git');
    });
  });

  describe('GitLabProvider', () => {
    const provider = new GitLabProvider();

    it('should match GitLab URLs', () => {
      expect(provider.matches('https://gitlab.com/owner/repo')).toBe(true);
      expect(provider.matches('git@gitlab.com:owner/repo')).toBe(true);
      expect(provider.matches('gitlab:owner/repo')).toBe(true);
      expect(provider.matches('gitlab.com/owner/repo')).toBe(true);
    });

    it('should not match other URLs', () => {
      expect(provider.matches('https://github.com/owner/repo')).toBe(false);
      expect(provider.matches('owner/repo')).toBe(false);
    });

    it('should parse GitLab URLs', () => {
      expect(provider.parseSource('gitlab:owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: undefined,
      });

      expect(provider.parseSource('https://gitlab.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: undefined,
      });
    });
  });

  describe('BitbucketProvider', () => {
    const provider = new BitbucketProvider();

    it('should match Bitbucket URLs', () => {
      expect(provider.matches('https://bitbucket.org/owner/repo')).toBe(true);
      expect(provider.matches('git@bitbucket.org:owner/repo')).toBe(true);
      expect(provider.matches('bitbucket:owner/repo')).toBe(true);
    });

    it('should parse Bitbucket URLs', () => {
      expect(provider.parseSource('bitbucket:owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
        subpath: undefined,
      });
    });
  });

  describe('LocalProvider', () => {
    const provider = new LocalProvider();

    it('should match local paths', () => {
      expect(provider.matches('./local')).toBe(true);
      expect(provider.matches('../parent')).toBe(true);
      expect(provider.matches('/absolute/path')).toBe(true);
      expect(provider.matches('~/home/path')).toBe(true);
    });

    it('should not match URLs', () => {
      expect(provider.matches('https://github.com/owner/repo')).toBe(false);
      expect(provider.matches('owner/repo')).toBe(false);
    });
  });

  describe('detectProvider', () => {
    it('should detect GitHub', () => {
      const provider = detectProvider('owner/repo');
      expect(provider?.type).toBe('github');
    });

    it('should detect GitLab', () => {
      const provider = detectProvider('gitlab:owner/repo');
      expect(provider?.type).toBe('gitlab');
    });

    it('should detect Bitbucket', () => {
      const provider = detectProvider('bitbucket:owner/repo');
      expect(provider?.type).toBe('bitbucket');
    });

    it('should detect local paths', () => {
      const provider = detectProvider('./local-path');
      expect(provider?.type).toBe('local');
    });
  });

  describe('utility functions', () => {
    it('isLocalPath should identify local paths', () => {
      expect(isLocalPath('./path')).toBe(true);
      expect(isLocalPath('../path')).toBe(true);
      expect(isLocalPath('/absolute')).toBe(true);
      expect(isLocalPath('~/home')).toBe(true);
      expect(isLocalPath('owner/repo')).toBe(false);
    });

    it('isGitUrl should identify git URLs', () => {
      expect(isGitUrl('https://github.com/owner/repo')).toBe(true);
      expect(isGitUrl('git@github.com:owner/repo')).toBe(true);
      expect(isGitUrl('ssh://git@github.com/owner/repo')).toBe(true);
      expect(isGitUrl('owner/repo')).toBe(false);
    });
  });
});
