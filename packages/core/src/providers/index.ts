import type { GitProviderAdapter } from './base.js';
import type { GitProvider } from '../types.js';
import { GitHubProvider } from './github.js';
import { GitLabProvider } from './gitlab.js';
import { BitbucketProvider } from './bitbucket.js';
import { LocalProvider } from './local.js';
import { WellKnownProvider } from './wellknown.js';

export * from './base.js';
export * from './github.js';
export * from './gitlab.js';
export * from './bitbucket.js';
export * from './local.js';
export * from './wellknown.js';

const providers: GitProviderAdapter[] = [
  new LocalProvider(),
  new GitLabProvider(),
  new BitbucketProvider(),
  new WellKnownProvider(),
  new GitHubProvider(),
];

export function getProvider(type: GitProvider): GitProviderAdapter | undefined {
  return providers.find(p => p.type === type);
}

export function getAllProviders(): GitProviderAdapter[] {
  return providers;
}

export function detectProvider(source: string): GitProviderAdapter | undefined {
  return providers.find(p => p.matches(source));
}

export function parseSource(source: string): {
  provider: GitProviderAdapter;
  owner: string;
  repo: string;
  subpath?: string;
} | null {
  for (const provider of providers) {
    if (provider.matches(source)) {
      const parsed = provider.parseSource(source);
      if (parsed) {
        return { provider, ...parsed };
      }
    }
  }
  return null;
}
