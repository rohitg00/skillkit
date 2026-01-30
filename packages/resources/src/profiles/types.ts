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

export interface ProfileManifest {
  version: number;
  profiles: OperationalProfile[];
}
