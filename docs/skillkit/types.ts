export interface LearningStep {
  title: string;
  description: string;
  duration: string;
  keyConcepts: string[];
}

export interface LearningPath {
  skill: string;
  description: string;
  steps: LearningStep[];
}

export interface GenerateSkillResponse {
  learningPath: LearningPath;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AgentSkill {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  applicability: string;
  principles: SkillPrinciple[];
  patterns: SkillPattern[];
  antiPatterns: SkillAntiPattern[];
  filePatterns?: string[];
  references?: string[];
}

export interface SkillPrinciple {
  title: string;
  description: string;
  priority: 'must' | 'should' | 'may';
}

export interface SkillPattern {
  name: string;
  description: string;
  example: string;
  language?: string;
}

export interface SkillAntiPattern {
  name: string;
  description: string;
  badExample?: string;
  goodExample?: string;
}
