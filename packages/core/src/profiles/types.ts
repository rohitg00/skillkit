export type ProfileName = 'dev' | 'review' | 'research' | 'security' | 'custom';

export interface OperationalProfile {
  name: ProfileName;
  description: string;
  focus: string;
  behaviors: string[];
  priorities: string[];
  preferredTools?: string[];
  avoidTools?: string[];
  injectedContext?: string;
}

export interface ProfileConfig {
  activeProfile: ProfileName;
  customProfiles: OperationalProfile[];
}

export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  activeProfile: 'dev',
  customProfiles: [],
};
