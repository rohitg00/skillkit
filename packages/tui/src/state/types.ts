export interface SkillItem {
  name: string;
  description?: string;
  source?: string;
  installs?: number;
  enabled?: boolean;
  quality?: number;
  grade?: string;
  warnings?: number;
}

export interface RepoInfo {
  source: string;
  name: string;
}

export interface FetchedSkill {
  name: string;
  source: string;
  repoName: string;
  description?: string;
}

export type Screen =
  | 'home' | 'browse' | 'installed' | 'marketplace' | 'recommend'
  | 'translate' | 'context' | 'memory' | 'team' | 'plugins'
  | 'methodology' | 'plan' | 'workflow' | 'execute' | 'history'
  | 'sync' | 'settings' | 'help' | 'mesh' | 'message';

export const NAV_KEYS: Record<string, Screen> = {
  h: 'home', m: 'marketplace', b: 'browse', w: 'workflow',
  x: 'execute', y: 'history', r: 'recommend', t: 'translate',
  c: 'context', e: 'memory', i: 'installed', s: 'sync',
  a: 'team', p: 'plugins', o: 'methodology', n: 'plan',
  ',': 'settings', '/': 'help', 'g': 'mesh', 'j': 'message',
} as const;

export const STATUS_BAR_SHORTCUTS = 'b browse  m market  i installed  s sync  / help  q quit';

export interface ScreenMeta {
  key: string;
  label: string;
  screen: Screen;
}

export interface SidebarSection {
  section: string;
  items: ScreenMeta[];
}

export const SIDEBAR_NAV: SidebarSection[] = [
  {
    section: 'Discover',
    items: [
      { key: 'h', label: 'Home', screen: 'home' },
      { key: 'b', label: 'Browse', screen: 'browse' },
      { key: 'm', label: 'Market', screen: 'marketplace' },
      { key: 'r', label: 'Recommend', screen: 'recommend' },
    ],
  },
  {
    section: 'Manage',
    items: [
      { key: 'i', label: 'Installed', screen: 'installed' },
      { key: 's', label: 'Sync', screen: 'sync' },
      { key: 't', label: 'Translate', screen: 'translate' },
    ],
  },
  {
    section: 'Execute',
    items: [
      { key: 'w', label: 'Workflows', screen: 'workflow' },
      { key: 'x', label: 'Execute', screen: 'execute' },
      { key: 'n', label: 'Plan', screen: 'plan' },
    ],
  },
  {
    section: 'Team',
    items: [
      { key: 'a', label: 'Team', screen: 'team' },
      { key: 'c', label: 'Context', screen: 'context' },
      { key: 'e', label: 'Memory', screen: 'memory' },
      { key: 'g', label: 'Mesh', screen: 'mesh' },
      { key: 'j', label: 'Messages', screen: 'message' },
    ],
  },
  {
    section: 'More',
    items: [
      { key: 'p', label: 'Plugins', screen: 'plugins' },
      { key: 'o', label: 'Methods', screen: 'methodology' },
      { key: ',', label: 'Settings', screen: 'settings' },
    ],
  },
];
