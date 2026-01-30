export type GuidelineCategory = 'security' | 'code-style' | 'testing' | 'git' | 'performance' | 'custom';

export interface Guideline {
  id: string;
  name: string;
  description: string;
  category: GuidelineCategory;
  content: string;
  priority: number;
  enabled: boolean;
  scope: 'global' | 'project';
}

export interface GuidelineConfig {
  enabledGuidelines: string[];
  customGuidelines: Guideline[];
}

export const DEFAULT_GUIDELINE_CONFIG: GuidelineConfig = {
  enabledGuidelines: ['security', 'code-style', 'testing', 'git'],
  customGuidelines: [],
};
