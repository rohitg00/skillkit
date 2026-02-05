export interface TrustScore {
  score: number;
  grade: 'trusted' | 'review' | 'caution';
  breakdown: TrustBreakdown;
  warnings: string[];
  recommendations: string[];
}

export interface TrustBreakdown {
  clarity: number;
  boundaries: number;
  specificity: number;
  safety: number;
}

export interface TrustScoreOptions {
  weights?: Partial<TrustBreakdown>;
  strictMode?: boolean;
}

const DEFAULT_WEIGHTS: TrustBreakdown = {
  clarity: 0.3,
  boundaries: 0.25,
  specificity: 0.25,
  safety: 0.2,
};

export class TrustScorer {
  private weights: TrustBreakdown;
  private strictMode: boolean;

  constructor(options: TrustScoreOptions = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...options.weights };
    this.strictMode = options.strictMode ?? false;
  }

  score(skillContent: string): TrustScore {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const clarity = this.scoreClarity(skillContent);
    const boundaries = this.scoreBoundaries(skillContent, warnings);
    const specificity = this.scoreSpecificity(skillContent);
    const safety = this.scoreSafety(skillContent, warnings);

    const breakdown: TrustBreakdown = {
      clarity,
      boundaries,
      specificity,
      safety,
    };

    const weightedScore =
      clarity * this.weights.clarity +
      boundaries * this.weights.boundaries +
      specificity * this.weights.specificity +
      safety * this.weights.safety;

    const finalScore = this.strictMode
      ? Math.min(weightedScore, Math.min(clarity, boundaries, specificity, safety))
      : weightedScore;

    const normalizedScore = Math.round(finalScore * 10) / 10;

    this.generateRecommendations(breakdown, recommendations);

    return {
      score: normalizedScore,
      grade: this.scoreToGrade(normalizedScore),
      breakdown,
      warnings,
      recommendations,
    };
  }

  private scoreClarity(content: string): number {
    let score = 5;

    const hasHeadings = /^#{1,3}\s/m.test(content);
    if (hasHeadings) score += 1;

    const headingCount = (content.match(/^#{1,3}\s/gm) || []).length;
    if (headingCount >= 3 && headingCount <= 10) score += 1;

    const hasBulletPoints = /^[-*]\s/m.test(content);
    if (hasBulletPoints) score += 0.5;

    const hasExamples = /```[\s\S]*?```|example:|for example/i.test(content);
    if (hasExamples) score += 1;

    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgSentenceLength < 25) score += 0.5;

    const hasAmbiguousTerms = /\b(maybe|perhaps|sometimes|might|could be|possibly)\b/gi.test(content);
    if (hasAmbiguousTerms) score -= 0.5;

    return Math.max(0, Math.min(10, score));
  }

  private scoreBoundaries(content: string, warnings: string[]): number {
    let score = 5;

    const hasScope = /\b(when to use|triggers?|scope|purpose|this skill)\b/i.test(content);
    if (hasScope) score += 1.5;

    const hasLimitations = /\b(don't|do not|never|avoid|not for|limitation|exception)\b/i.test(content);
    if (hasLimitations) score += 1;

    const hasTriggerConditions = /\bwhen\s+(the\s+)?(user|you|it)\s/i.test(content);
    if (hasTriggerConditions) score += 1;

    const overpromises = /\b(always works|perfect|guaranteed|never fails|100%)\b/i.test(content);
    if (overpromises) {
      score -= 1;
      warnings.push('Contains overpromising language');
    }

    const veryBroad = /\b(everything|anything|all\s+cases|universal)\b/i.test(content);
    if (veryBroad) {
      score -= 0.5;
      warnings.push('Scope may be too broad');
    }

    return Math.max(0, Math.min(10, score));
  }

  private scoreSpecificity(content: string): number {
    let score = 5;

    const hasConcreteInstructions = /\b(step\s+\d|first|then|next|finally|1\.|2\.)\b/i.test(content);
    if (hasConcreteInstructions) score += 1.5;

    const hasSpecificTech = /\b(react|vue|typescript|python|node|docker|kubernetes|git|npm|yarn)\b/i.test(content);
    if (hasSpecificTech) score += 1;

    const hasFilePatterns = /\.\w{2,4}\b|\*\.\w+|\/[\w-]+\//i.test(content);
    if (hasFilePatterns) score += 0.5;

    const hasCodeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    if (hasCodeBlocks >= 1) score += 0.5;
    if (hasCodeBlocks >= 3) score += 0.5;

    const vaguePhrases = content.match(/\b(make sure|be careful|pay attention|keep in mind)\b/gi) || [];
    if (vaguePhrases.length > 3) score -= 0.5;

    return Math.max(0, Math.min(10, score));
  }

  private scoreSafety(content: string, warnings: string[]): number {
    let score = 10;

    const dangerousPatterns = [
      { pattern: /rm\s+-rf\s+\/|rm\s+-rf\s+\*/i, warning: 'Contains dangerous file deletion commands' },
      { pattern: /sudo\s+chmod\s+777/i, warning: 'Contains insecure permission changes' },
      { pattern: /eval\s*\(|exec\s*\(/i, warning: 'Contains potentially dangerous eval/exec' },
      { pattern: /password\s*=\s*["'][^"']+["']|api[_-]?key\s*=\s*["'][^"']+["']/i, warning: 'May contain hardcoded credentials' },
      { pattern: /disable\s+security|bypass\s+auth|skip\s+validation/i, warning: 'Contains security bypass instructions' },
    ];

    for (const { pattern, warning } of dangerousPatterns) {
      if (pattern.test(content)) {
        score -= 2;
        warnings.push(warning);
      }
    }

    const hasSafetyNotes = /\b(caution|warning|security|validate|sanitize|escape)\b/i.test(content);
    if (hasSafetyNotes) score += 0.5;

    const hasInputValidation = /\b(validate|sanitize|check|verify)\s+(input|data|parameter)/i.test(content);
    if (hasInputValidation) score += 0.5;

    return Math.max(0, Math.min(10, score));
  }

  private generateRecommendations(breakdown: TrustBreakdown, recommendations: string[]): void {
    if (breakdown.clarity < 6) {
      recommendations.push('Add more structure with headings and bullet points');
      recommendations.push('Include concrete examples');
    }

    if (breakdown.boundaries < 6) {
      recommendations.push('Define when this skill should and should not be used');
      recommendations.push('Add specific trigger conditions');
    }

    if (breakdown.specificity < 6) {
      recommendations.push('Add step-by-step instructions');
      recommendations.push('Include code examples where applicable');
    }

    if (breakdown.safety < 8) {
      recommendations.push('Review for any security concerns');
      recommendations.push('Add input validation guidance');
    }
  }

  private scoreToGrade(score: number): 'trusted' | 'review' | 'caution' {
    if (score >= 8) return 'trusted';
    if (score >= 5) return 'review';
    return 'caution';
  }
}

export function quickTrustScore(content: string): number {
  const scorer = new TrustScorer();
  return scorer.score(content).score;
}
