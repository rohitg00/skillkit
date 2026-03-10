import { Command, Option } from 'clipanion';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import {
  createEvalEngine,
  formatEvalResult,
  LLMQualityEvaluator,
  ContradictionEvaluator,
  BehavioralSecurityEvaluator,
  SandboxEvaluator,
  DynamicBenchmarkEvaluator,
  CommunitySignalsEvaluator,
} from '@skillkit/core';
import type { EvalTier, EvalOptions } from '@skillkit/core';

export class EvalCommand extends Command {
  static override paths = [['eval']];

  static override usage = Command.Usage({
    description: 'Evaluate a skill with multi-tier analysis (LLM quality, contradictions, security, benchmarks)',
    details: `
      Runs a comprehensive evaluation engine across up to 6 tiers:
        Tier 1: LLM-based quality scoring (G-Eval pattern)
        Tier 2: Contradiction detection (formal + semantic)
        Tier 3: Behavioral security analysis (AST + taint + LLM)
        Tier 4: Sandbox execution testing (Docker)
        Tier 5: Dynamic marketplace benchmarks
        Tier 6: Community signals (GitHub, installs, freshness)

      Works without API keys (heuristic fallback for Tier 1, Tiers 5-6 always available).
      Configure a provider for full LLM-powered evaluation.
    `,
    examples: [
      ['Evaluate a skill', '$0 eval ./my-skill'],
      ['Run specific tiers', '$0 eval ./my-skill --tier 1,2,3'],
      ['Use Anthropic provider', '$0 eval ./my-skill --provider anthropic'],
      ['JSON output', '$0 eval ./my-skill --format json'],
      ['Set minimum score', '$0 eval ./my-skill --min-score 70'],
      ['Verbose output', '$0 eval ./my-skill --verbose'],
    ],
  });

  skillPath = Option.String({ required: true, name: 'path' });

  tier = Option.String('--tier,-t', {
    description: 'Comma-separated tier numbers to run (1-6). Default: 1,2,3,5,6',
  });

  provider = Option.String('--provider,-p', {
    description: 'LLM provider: anthropic, openai, google, ollama, openrouter',
  });

  model = Option.String('--model,-m', {
    description: 'Model name to use with the provider',
  });

  format = Option.String('--format,-f', 'summary', {
    description: 'Output format: summary, json, table',
  });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed output for each tier',
  });

  minScore = Option.String('--min-score', {
    description: 'Exit with code 1 if overall score is below this threshold',
  });

  sandboxImage = Option.String('--sandbox-image', {
    description: 'Docker image for sandbox testing (Tier 4)',
  });

  timeout = Option.String('--timeout', {
    description: 'Timeout in seconds for each tier',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.skillPath);

    if (!existsSync(targetPath)) {
      this.context.stderr.write(`Path not found: ${targetPath}\n`);
      return 1;
    }

    const validFormats = ['summary', 'json', 'table'];
    if (!validFormats.includes(this.format)) {
      this.context.stderr.write(`Invalid format: "${this.format}". Must be one of: ${validFormats.join(', ')}\n`);
      return 1;
    }

    let tiers: EvalTier[] | undefined;
    if (this.tier) {
      tiers = this.tier.split(',').map((s) => {
        const n = parseInt(s.trim(), 10);
        if (isNaN(n) || n < 1 || n > 6) {
          return null;
        }
        return n as EvalTier;
      }).filter((n): n is EvalTier => n !== null);
      if (tiers.length === 0) {
        this.context.stderr.write(`Invalid --tier value: "${this.tier}". Must be comma-separated numbers 1-6.\n`);
        return 1;
      }
    }

    if (this.minScore) {
      const threshold = parseInt(this.minScore, 10);
      if (isNaN(threshold)) {
        this.context.stderr.write(`Invalid --min-score value: "${this.minScore}". Must be a number.\n`);
        return 1;
      }
    }

    const parsedTimeout = this.timeout ? parseInt(this.timeout, 10) : NaN;

    const options: EvalOptions = {
      tiers,
      provider: this.provider,
      model: this.model,
      format: this.format as 'summary' | 'json' | 'table',
      verbose: this.verbose,
      sandboxImage: this.sandboxImage,
      timeout: !isNaN(parsedTimeout) ? parsedTimeout : undefined,
    };

    const engine = createEvalEngine();

    engine.registerEvaluator(new LLMQualityEvaluator());
    engine.registerEvaluator(new ContradictionEvaluator());
    engine.registerEvaluator(new BehavioralSecurityEvaluator());
    engine.registerEvaluator(new SandboxEvaluator());
    engine.registerEvaluator(new DynamicBenchmarkEvaluator());
    engine.registerEvaluator(new CommunitySignalsEvaluator());

    const result = await engine.evaluate(targetPath, options);

    this.context.stdout.write(formatEvalResult(result, this.format) + '\n');

    if (this.minScore) {
      const threshold = parseInt(this.minScore, 10);
      if (result.overallScore < threshold) {
        this.context.stderr.write(`Score ${result.overallScore} is below minimum ${threshold}\n`);
        return 1;
      }
    }

    return 0;
  }
}
