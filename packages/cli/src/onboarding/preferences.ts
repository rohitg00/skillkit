import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SKILLKIT_DIR = join(homedir(), '.skillkit');
const PREFERENCES_FILE = join(SKILLKIT_DIR, 'preferences.json');

export interface UserPreferences {
  onboardingComplete: boolean;
  lastSelectedAgents: string[];
  defaultInstallMethod: 'symlink' | 'copy';
  outputFormat: 'pretty' | 'json';
  lastAccessed: string;
  version?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingComplete: false,
  lastSelectedAgents: [],
  defaultInstallMethod: 'symlink',
  outputFormat: 'pretty',
  lastAccessed: new Date().toISOString(),
};

function ensureDir(): void {
  if (!existsSync(SKILLKIT_DIR)) {
    mkdirSync(SKILLKIT_DIR, { recursive: true });
  }
}

export function loadPreferences(): UserPreferences {
  try {
    if (!existsSync(PREFERENCES_FILE)) {
      return { ...DEFAULT_PREFERENCES };
    }

    const content = readFileSync(PREFERENCES_FILE, 'utf-8');
    const data = JSON.parse(content);

    return {
      ...DEFAULT_PREFERENCES,
      ...data,
      lastAccessed: new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    ensureDir();

    const current = loadPreferences();
    const updated: UserPreferences = {
      ...current,
      ...prefs,
      lastAccessed: new Date().toISOString(),
    };

    writeFileSync(PREFERENCES_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Silently fail - preferences are not critical
  }
}

export function isOnboardingComplete(): boolean {
  return loadPreferences().onboardingComplete;
}

export function completeOnboarding(): void {
  savePreferences({ onboardingComplete: true });
}

export function saveLastAgents(agents: string[]): void {
  savePreferences({ lastSelectedAgents: agents });
}

export function getLastAgents(): string[] {
  return loadPreferences().lastSelectedAgents;
}

export function saveInstallMethod(method: 'symlink' | 'copy'): void {
  savePreferences({ defaultInstallMethod: method });
}

export function getInstallMethod(): 'symlink' | 'copy' {
  return loadPreferences().defaultInstallMethod;
}

export function getPreferencesDir(): string {
  return SKILLKIT_DIR;
}

export function getPreferencesPath(): string {
  return PREFERENCES_FILE;
}
