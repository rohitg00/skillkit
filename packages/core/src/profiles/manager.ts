import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import yaml from 'yaml';

import type { OperationalProfile, ProfileName, ProfileConfig } from './types.js';
import { DEFAULT_PROFILE_CONFIG } from './types.js';

const BUILTIN_PROFILES: OperationalProfile[] = [
  {
    name: 'dev',
    description: 'Active development mode',
    focus: 'Implementation speed and working solutions',
    behaviors: [
      'Prefer working code over perfect code',
      'Quick iterations with frequent testing',
      'Minimize context switching',
      'Focus on the current task',
    ],
    priorities: ['Functionality', 'Simplicity', 'Testability', 'Speed'],
    preferredTools: ['Edit', 'Write', 'Bash', 'Read'],
    injectedContext: `You are in DEVELOPMENT mode. Focus on:
- Getting working code quickly
- Writing minimal tests for new functionality
- Keeping changes small and focused
- Committing frequently`,
  },
  {
    name: 'review',
    description: 'Code review mode',
    focus: 'Quality, security, and maintainability',
    behaviors: [
      'Thorough analysis before suggesting changes',
      'Security-first mindset',
      'Consider edge cases and failure modes',
      'Provide constructive feedback',
    ],
    priorities: ['Security', 'Code quality', 'Best practices', 'Maintainability'],
    preferredTools: ['Read', 'Grep', 'Glob'],
    avoidTools: ['Edit', 'Write'],
    injectedContext: `You are in REVIEW mode. Focus on:
- Identifying potential bugs and security issues
- Checking code against best practices
- Verifying test coverage
- Suggesting improvements without making changes`,
  },
  {
    name: 'research',
    description: 'Exploration and discovery mode',
    focus: 'Understanding and analysis',
    behaviors: [
      'Deep exploration of codebase',
      'Document findings thoroughly',
      'Consider multiple approaches',
      'Ask clarifying questions',
    ],
    priorities: ['Understanding', 'Documentation', 'Options analysis', 'Learning'],
    preferredTools: ['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'],
    avoidTools: ['Edit', 'Write'],
    injectedContext: `You are in RESEARCH mode. Focus on:
- Understanding the codebase structure
- Finding relevant documentation
- Exploring different approaches
- Creating summaries of findings`,
  },
  {
    name: 'security',
    description: 'Security audit mode',
    focus: 'Vulnerability detection and hardening',
    behaviors: [
      'Assume hostile input',
      'Check all authentication and authorization',
      'Look for common vulnerability patterns',
      'Verify encryption and data protection',
    ],
    priorities: ['Security', 'Data protection', 'Authentication', 'Authorization'],
    preferredTools: ['Read', 'Grep', 'Glob', 'Bash'],
    injectedContext: `You are in SECURITY AUDIT mode. Focus on:
- OWASP Top 10 vulnerabilities
- Authentication and authorization flaws
- Data exposure risks
- Injection vulnerabilities
- Secrets and credentials in code`,
  },
];

function getConfigPath(): string {
  return join(homedir(), '.skillkit', 'profiles.yaml');
}

export function loadProfileConfig(): ProfileConfig {
  const path = getConfigPath();

  if (!existsSync(path)) {
    return DEFAULT_PROFILE_CONFIG;
  }

  try {
    const content = readFileSync(path, 'utf-8');
    return { ...DEFAULT_PROFILE_CONFIG, ...yaml.parse(content) };
  } catch {
    return DEFAULT_PROFILE_CONFIG;
  }
}

export function saveProfileConfig(config: ProfileConfig): void {
  const path = getConfigPath();
  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, yaml.stringify(config));
}

export function getActiveProfile(): ProfileName {
  const config = loadProfileConfig();
  return config.activeProfile;
}

export function setActiveProfile(name: ProfileName): void {
  const config = loadProfileConfig();
  config.activeProfile = name;
  saveProfileConfig(config);
}

export function getProfile(name: ProfileName): OperationalProfile | null {
  const builtin = BUILTIN_PROFILES.find(p => p.name === name);
  if (builtin) return builtin;

  const config = loadProfileConfig();
  return config.customProfiles.find(p => p.name === name) || null;
}

export function getAllProfiles(): OperationalProfile[] {
  const config = loadProfileConfig();
  return [...BUILTIN_PROFILES, ...config.customProfiles];
}

export function getBuiltinProfiles(): OperationalProfile[] {
  return BUILTIN_PROFILES;
}

export function getProfileNames(): ProfileName[] {
  const config = loadProfileConfig();
  const builtinNames = BUILTIN_PROFILES.map(p => p.name);
  const customNames = config.customProfiles.map(p => p.name);
  return [...builtinNames, ...customNames];
}

export function addCustomProfile(profile: OperationalProfile): void {
  const config = loadProfileConfig();
  const existing = config.customProfiles.findIndex(p => p.name === profile.name);

  if (existing >= 0) {
    config.customProfiles[existing] = profile;
  } else {
    config.customProfiles.push(profile);
  }

  saveProfileConfig(config);
}

export function removeCustomProfile(name: ProfileName): boolean {
  const config = loadProfileConfig();
  const index = config.customProfiles.findIndex(p => p.name === name);

  if (index < 0) return false;

  config.customProfiles.splice(index, 1);

  if (config.activeProfile === name) {
    config.activeProfile = 'dev';
  }

  saveProfileConfig(config);
  return true;
}

export function getProfileContext(name?: ProfileName): string | null {
  const profileName = name || getActiveProfile();
  const profile = getProfile(profileName);
  return profile?.injectedContext || null;
}

export function isBuiltinProfile(name: ProfileName): boolean {
  return BUILTIN_PROFILES.some(p => p.name === name);
}
