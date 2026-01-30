import { BUILTIN_PROFILES, PROFILE_MANIFEST } from './manifest.js';
import type { OperationalProfile, ProfileName, ProfileManifest } from './types.js';

export type { OperationalProfile, ProfileName, ProfileManifest };
export { BUILTIN_PROFILES, PROFILE_MANIFEST };

export function getBuiltinProfiles(): OperationalProfile[] {
  return BUILTIN_PROFILES;
}

export function getBuiltinProfile(name: ProfileName): OperationalProfile | null {
  return BUILTIN_PROFILES.find(p => p.name === name) || null;
}

export function getProfileNames(): ProfileName[] {
  return BUILTIN_PROFILES.map(p => p.name);
}

export function isValidProfileName(name: string): name is ProfileName {
  return getProfileNames().includes(name as ProfileName);
}

export function getProfileContext(name: ProfileName): string | null {
  const profile = getBuiltinProfile(name);
  return profile?.injectedContext || null;
}
