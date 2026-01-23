/**
 * Team Collaboration Types
 */

import type { AgentType } from '../types.js';

/**
 * Team member information
 */
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'contributor' | 'viewer';
  joinedAt: string;
}

/**
 * Shared skill metadata
 */
export interface SharedSkill {
  name: string;
  version: string;
  description?: string;
  author: string;
  sharedAt: string;
  updatedAt: string;
  source: string; // Git URL or registry path
  tags?: string[];
  agents: AgentType[];
  downloads?: number;
  rating?: number;
}

/**
 * Team configuration
 */
export interface TeamConfig {
  /** Team identifier */
  teamId: string;
  /** Team name */
  teamName: string;
  /** Team registry URL (git repo or registry endpoint) */
  registryUrl: string;
  /** Authentication method */
  auth?: {
    type: 'token' | 'ssh' | 'none';
    token?: string;
    keyPath?: string;
  };
  /** Auto-sync interval in minutes (0 = disabled) */
  autoSyncInterval?: number;
  /** Members list (for admin features) */
  members?: TeamMember[];
}

/**
 * Team registry containing shared skills
 */
export interface TeamRegistry {
  version: number;
  teamId: string;
  teamName: string;
  skills: SharedSkill[];
  updatedAt: string;
  createdAt: string;
}

/**
 * Bundle manifest for exporting skills
 */
export interface BundleManifest {
  version: number;
  name: string;
  description?: string;
  author: string;
  createdAt: string;
  skills: {
    name: string;
    path: string;
    agents: AgentType[];
  }[];
  totalSize: number;
}

/**
 * Options for sharing a skill
 */
export interface ShareOptions {
  /** Skill name to share */
  skillName: string;
  /** Description override */
  description?: string;
  /** Tags to add */
  tags?: string[];
  /** Target agents (default: all compatible) */
  agents?: AgentType[];
  /** Visibility level */
  visibility?: 'team' | 'public';
}

/**
 * Options for importing skills
 */
export interface ImportOptions {
  /** Overwrite existing skills */
  overwrite?: boolean;
  /** Target agents to install for */
  agents?: AgentType[];
  /** Dry run mode */
  dryRun?: boolean;
}
