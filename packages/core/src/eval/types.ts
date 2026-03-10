export enum EvalDimension {
  CLARITY = 'clarity',
  SPECIFICITY = 'specificity',
  COMPLETENESS = 'completeness',
  SAFETY = 'safety',
  EXECUTABILITY = 'executability',
  TOKEN_EFFICIENCY = 'token-efficiency',
}

export type EvalGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type EvalTier = 1 | 2 | 3 | 4 | 5 | 6;

export type EvalFormat = 'summary' | 'json' | 'table';

export interface DimensionScore {
  dimension: EvalDimension;
  score: number;
  reasoning: string;
  confidence: number;
}

export interface ContradictionFinding {
  type: 'formal' | 'semantic';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lineA?: number;
  lineB?: number;
  textA?: string;
  textB?: string;
}

export interface SecurityFinding {
  engine: 'ast' | 'taint' | 'llm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  snippet?: string;
  remediation?: string;
}

export interface SandboxTestCase {
  name: string;
  prompt: string;
  expectedOutcome: string;
  graderType: 'deterministic' | 'llm-rubric';
  graderScript?: string;
  rubric?: string;
}

export interface SandboxResult {
  testCase: string;
  passed: boolean;
  score: number;
  duration: number;
  output?: string;
  error?: string;
  tokenUsage?: number;
}

export interface BenchmarkComparison {
  category: string;
  percentile: number;
  sampleSize: number;
  mean: number;
  median: number;
  p90: number;
  skillScore: number;
}

export interface CommunitySignal {
  source: string;
  metric: string;
  value: number | string;
  normalizedScore: number;
}

export interface TierResult {
  tier: EvalTier;
  name: string;
  score: number;
  grade: EvalGrade;
  duration: number;
  details: Record<string, unknown>;
}

export interface QualityTierResult extends TierResult {
  tier: 1;
  details: {
    dimensions: DimensionScore[];
    weights: Record<EvalDimension, number>;
    heuristicFallback: boolean;
  };
}

export interface ContradictionTierResult extends TierResult {
  tier: 2;
  details: {
    findings: ContradictionFinding[];
    formalCount: number;
    semanticCount: number;
  };
}

export interface SecurityTierResult extends TierResult {
  tier: 3;
  details: {
    findings: SecurityFinding[];
    engines: string[];
    crossValidated: number;
  };
}

export interface SandboxTierResult extends TierResult {
  tier: 4;
  details: {
    results: SandboxResult[];
    passRate: number;
    avgDuration: number;
    dockerAvailable: boolean;
  };
}

export interface BenchmarkTierResult extends TierResult {
  tier: 5;
  details: {
    comparisons: BenchmarkComparison[];
    overallPercentile: number;
    cacheUsed: boolean;
  };
}

export interface CommunityTierResult extends TierResult {
  tier: 6;
  details: {
    signals: CommunitySignal[];
    warnings: string[];
  };
}

export interface EvalResult {
  skillPath: string;
  skillName: string;
  overallScore: number;
  grade: EvalGrade;
  tiers: TierResult[];
  duration: number;
  timestamp: string;
  options: EvalOptions;
}

export interface EvalOptions {
  tiers?: EvalTier[];
  provider?: string;
  model?: string;
  format?: EvalFormat;
  verbose?: boolean;
  sandboxImage?: string;
  timeout?: number;
  minScore?: number;
}

export interface TierEvaluator {
  readonly tier: EvalTier;
  readonly name: string;
  evaluate(content: string, skillPath: string, options: EvalOptions): Promise<TierResult>;
}

export const DIMENSION_WEIGHTS: Record<EvalDimension, number> = {
  [EvalDimension.CLARITY]: 0.20,
  [EvalDimension.SPECIFICITY]: 0.20,
  [EvalDimension.COMPLETENESS]: 0.20,
  [EvalDimension.SAFETY]: 0.15,
  [EvalDimension.EXECUTABILITY]: 0.15,
  [EvalDimension.TOKEN_EFFICIENCY]: 0.10,
};

export function scoreToGrade(score: number): EvalGrade {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}
