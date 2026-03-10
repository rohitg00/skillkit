import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { EvalOptions, EvalResult, TierEvaluator, TierResult, EvalTier } from './types.js';
import { scoreToGrade } from './types.js';

const DEFAULT_TIERS: EvalTier[] = [1, 2, 3, 5, 6];

function readSkillContent(skillPath: string): string {
  const candidates = [
    join(skillPath, 'SKILL.md'),
    join(skillPath, 'index.mdc'),
    join(skillPath, `${basename(skillPath)}.mdc`),
  ];

  if (!existsSync(skillPath)) {
    throw new Error(`Path not found: ${skillPath}`);
  }

  const stat = statSync(skillPath);
  if (stat.isFile()) {
    return readFileSync(skillPath, 'utf-8');
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf-8');
    }
  }

  throw new Error(`No skill file found in ${skillPath}. Expected SKILL.md or .mdc file.`);
}

export class EvalEngine {
  private evaluators: Map<EvalTier, TierEvaluator> = new Map();

  registerEvaluator(evaluator: TierEvaluator): void {
    this.evaluators.set(evaluator.tier, evaluator);
  }

  async evaluate(skillPath: string, options: EvalOptions = {}): Promise<EvalResult> {
    const start = performance.now();
    const content = readSkillContent(skillPath);
    const skillName = basename(skillPath.replace(/\/+$/, '')) || 'unknown';
    const tiersToRun = options.tiers ?? DEFAULT_TIERS;

    const tierPromises: Promise<TierResult | null>[] = tiersToRun.map(async (tier) => {
      const evaluator = this.evaluators.get(tier);
      if (!evaluator) return null;

      try {
        return await evaluator.evaluate(content, skillPath, options);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          tier,
          name: evaluator.name,
          score: 0,
          grade: 'F' as const,
          duration: 0,
          details: { error: message },
        };
      }
    });

    const results = await Promise.all(tierPromises);
    const tiers = results.filter((r): r is TierResult => r !== null);
    const scorableTiers = tiers.filter((t) => t.score >= 0);

    const overallScore = scorableTiers.length > 0
      ? Math.round(scorableTiers.reduce((sum, t) => sum + t.score, 0) / scorableTiers.length)
      : 0;

    const duration = Math.round(performance.now() - start);

    return {
      skillPath,
      skillName,
      overallScore,
      grade: scoreToGrade(overallScore),
      tiers,
      duration,
      timestamp: new Date().toISOString(),
      options,
    };
  }

  getAvailableTiers(): EvalTier[] {
    return [...this.evaluators.keys()].sort();
  }
}

export function createEvalEngine(): EvalEngine {
  return new EvalEngine();
}
