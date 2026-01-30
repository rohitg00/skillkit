export type PatternCategory =
  | 'error_fix'
  | 'refactor'
  | 'workaround'
  | 'debugging'
  | 'convention';

export type PatternDomain =
  | 'code-style'
  | 'testing'
  | 'git'
  | 'debugging'
  | 'workflow'
  | 'security'
  | 'performance';

export interface LearnedPattern {
  id: string;
  category: PatternCategory;
  domain?: PatternDomain;
  title: string;
  problem: string;
  solution: string;
  example?: string;
  context: string;
  extractedAt: string;
  source: 'git' | 'session' | 'manual';
  commitRange?: { from: string; to: string };
  approved: boolean;
  confidence: number;
}

export interface EvolvingPattern extends LearnedPattern {
  trigger: string;
  action: string;
  useCount: number;
  successCount: number;
  failureCount: number;
  lastUsed?: string;
}

export interface LearningConfig {
  minSessionLength: number;
  sensitivity: 'low' | 'medium' | 'high';
  autoApprove: boolean;
  outputPath: string;
  categories: PatternCategory[];
  ignorePatterns: string[];
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  message: string;
  body?: string;
  files: GitFileChange[];
}

export interface GitFileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  oldPath?: string;
}

export interface GitAnalysisResult {
  patterns: LearnedPattern[];
  commitCount: number;
  dateRange: { from: string; to: string };
  languages: string[];
  frameworks: string[];
  summary: GitAnalysisSummary;
}

export interface GitAnalysisSummary {
  totalCommits: number;
  totalFilesChanged: number;
  errorFixes: number;
  refactors: number;
  features: number;
  documentation: number;
  tests: number;
}

export interface PatternExtractionResult {
  patterns: LearnedPattern[];
  skipped: { reason: string; commit?: string }[];
  errors: string[];
}

export interface PatternStore {
  version: number;
  updatedAt: string;
  patterns: LearnedPattern[];
  evolvingPatterns: EvolvingPattern[];
}

export const DEFAULT_LEARNING_CONFIG: LearningConfig = {
  minSessionLength: 10,
  sensitivity: 'medium',
  autoApprove: false,
  outputPath: '~/.skillkit/learned/',
  categories: ['error_fix', 'refactor', 'workaround', 'debugging', 'convention'],
  ignorePatterns: ['trivial_typo', 'one_off_fix', 'wip', 'merge'],
};
