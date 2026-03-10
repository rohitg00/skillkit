import type { ChatMessage, ProviderName } from '../../ai/providers/types.js';
import type {
  TierEvaluator,
  EvalOptions,
  QualityTierResult,
  DimensionScore,
  EvalDimension,
} from '../types.js';
import { DIMENSION_WEIGHTS, scoreToGrade } from '../types.js';
import { EvalDimension as Dim } from '../types.js';
import { DIMENSION_PROMPTS } from '../prompts/quality-cot.js';
import { createProvider } from '../../ai/providers/factory.js';
import { evaluateSkillContent } from '../../quality/index.js';

interface ParsedScore {
  score: number;
  reasoning: string;
  confidence: number;
}

function extractJSON(raw: string): ParsedScore {
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return validateParsed(parsed);
  } catch {
    return regexFallback(raw);
  }
}

function validateParsed(parsed: unknown): ParsedScore {
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'score' in parsed &&
    'reasoning' in parsed &&
    'confidence' in parsed
  ) {
    const obj = parsed as Record<string, unknown>;
    const score = Number(obj.score);
    const confidence = Number(obj.confidence);
    return {
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 50,
      reasoning: typeof obj.reasoning === 'string' ? obj.reasoning : 'No reasoning provided',
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.5,
    };
  }
  return { score: 50, reasoning: 'Failed to parse response', confidence: 0.3 };
}

function regexFallback(raw: string): ParsedScore {
  const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
  const reasoningMatch = raw.match(/"reasoning"\s*:\s*"([^"]+)"/);
  const confidenceMatch = raw.match(/"confidence"\s*:\s*([\d.]+)/);

  if (scoreMatch) {
    const score = Math.max(0, Math.min(100, parseInt(scoreMatch[1], 10)));
    return {
      score,
      reasoning: reasoningMatch ? reasoningMatch[1] : 'Extracted via regex fallback',
      confidence: confidenceMatch ? Math.max(0, Math.min(1, parseFloat(confidenceMatch[1]))) : 0.4,
    };
  }

  return { score: 50, reasoning: 'Could not parse LLM response', confidence: 0.2 };
}

function mapHeuristicToDimensions(content: string): DimensionScore[] {
  const result = evaluateSkillContent(content);

  return [
    {
      dimension: Dim.CLARITY,
      score: result.clarity.score,
      reasoning: `Heuristic: ${result.clarity.lineCount} lines, ${result.clarity.tokenCount} tokens, avg sentence length ${result.clarity.avgSentenceLength}`,
      confidence: 0.6,
    },
    {
      dimension: Dim.SPECIFICITY,
      score: result.specificity.score,
      reasoning: `Heuristic: ${result.specificity.vagueTermCount} vague terms, commands=${result.specificity.hasConcreteCommands}, code=${result.specificity.hasCodeExamples}`,
      confidence: 0.6,
    },
    {
      dimension: Dim.COMPLETENESS,
      score: result.advanced.completeness.score,
      reasoning: `Heuristic: ${result.advanced.completeness.todoCount} TODOs, ${result.advanced.completeness.emptySections.length} empty sections, example coverage ${result.advanced.completeness.exampleCoverage}%`,
      confidence: 0.6,
    },
    {
      dimension: Dim.SAFETY,
      score: result.advanced.securityIssues.length === 0 ? 85 : Math.max(20, 85 - result.advanced.securityIssues.length * 15),
      reasoning: `Heuristic: ${result.advanced.securityIssues.length} security issues found${result.advanced.securityIssues.length > 0 ? ': ' + result.advanced.securityIssues.join(', ') : ''}`,
      confidence: 0.5,
    },
    {
      dimension: Dim.EXECUTABILITY,
      score: Math.round(result.structure.score * 0.6 + result.specificity.score * 0.4),
      reasoning: `Heuristic: structure=${result.structure.score}, specificity=${result.specificity.score}, triggers=${result.structure.hasTriggers}, examples=${result.structure.hasExamples}`,
      confidence: 0.5,
    },
    {
      dimension: Dim.TOKEN_EFFICIENCY,
      score: result.clarity.tokenCount <= 1000 ? 90 : result.clarity.tokenCount <= 2000 ? 75 : result.clarity.tokenCount <= 4000 ? 55 : 30,
      reasoning: `Heuristic: ${result.clarity.tokenCount} tokens, ${result.clarity.lineCount} lines`,
      confidence: 0.6,
    },
  ];
}

function calculateWeightedScore(dimensions: DimensionScore[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dim of dimensions) {
    const weight = DIMENSION_WEIGHTS[dim.dimension];
    if (typeof weight === 'number' && Number.isFinite(weight)) {
      weightedSum += dim.score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export class LLMQualityEvaluator implements TierEvaluator {
  readonly tier = 1 as const;
  readonly name = 'LLM Quality';

  async evaluate(content: string, _skillPath: string, options: EvalOptions): Promise<QualityTierResult> {
    const start = performance.now();

    let dimensions: DimensionScore[];
    let heuristicFallback: boolean;

    try {
      const providerName = options.provider as ProviderName | undefined;
      const provider = createProvider(providerName, { model: options.model });

      if (provider.name === 'mock' || !provider.isConfigured()) {
        const fallback = this.runHeuristicFallback(content, start);
        return fallback;
      }

      dimensions = await this.runLLMEvaluation(content, provider);
      heuristicFallback = false;
    } catch {
      return this.runHeuristicFallback(content, start);
    }

    const score = calculateWeightedScore(dimensions);
    const duration = Math.round(performance.now() - start);

    return {
      tier: 1,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        dimensions,
        weights: { ...DIMENSION_WEIGHTS },
        heuristicFallback,
      },
    };
  }

  private async runLLMEvaluation(
    content: string,
    provider: { chat(messages: ChatMessage[]): Promise<string> },
  ): Promise<DimensionScore[]> {
    const dimensionEntries: Array<[string, (c: string) => ChatMessage[]]> = Object.entries(DIMENSION_PROMPTS);

    const results = await Promise.all(
      dimensionEntries.map(async ([key, promptFn]) => {
        const messages = promptFn(content);
        const raw = await provider.chat(messages);
        const parsed = extractJSON(raw);
        return {
          dimension: key as EvalDimension,
          score: parsed.score,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence,
        };
      }),
    );

    return results;
  }

  private runHeuristicFallback(content: string, start: number): QualityTierResult {
    const dimensions = mapHeuristicToDimensions(content);
    const score = calculateWeightedScore(dimensions);
    const duration = Math.round(performance.now() - start);

    return {
      tier: 1,
      name: this.name,
      score,
      grade: scoreToGrade(score),
      duration,
      details: {
        dimensions,
        weights: { ...DIMENSION_WEIGHTS },
        heuristicFallback: true,
      },
    };
  }
}
