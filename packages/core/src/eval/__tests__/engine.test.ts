import { describe, it, expect, vi } from 'vitest';
import { EvalEngine, createEvalEngine } from '../engine.js';
import type { TierEvaluator, TierResult, EvalOptions } from '../types.js';

function createMockEvaluator(tier: number, score: number, name: string): TierEvaluator {
  return {
    tier: tier as any,
    name,
    evaluate: vi.fn().mockResolvedValue({
      tier,
      name,
      score,
      grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
      duration: 10,
      details: {},
    } satisfies TierResult),
  };
}

describe('EvalEngine', () => {
  it('creates engine with factory', () => {
    const engine = createEvalEngine();
    expect(engine).toBeInstanceOf(EvalEngine);
  });

  it('registers evaluators', () => {
    const engine = createEvalEngine();
    engine.registerEvaluator(createMockEvaluator(1, 80, 'Test'));
    expect(engine.getAvailableTiers()).toEqual([1]);
  });

  it('evaluates with registered tiers', async () => {
    const engine = createEvalEngine();
    engine.registerEvaluator(createMockEvaluator(1, 90, 'Quality'));
    engine.registerEvaluator(createMockEvaluator(2, 80, 'Contradiction'));

    const result = await engine.evaluate(
      new URL('../__tests__/fixtures/good-skill', import.meta.url).pathname,
      { tiers: [1, 2] }
    );

    expect(result.skillName).toBe('good-skill');
    expect(result.tiers).toHaveLength(2);
    expect(result.overallScore).toBe(85);
    expect(result.grade).toBe('A');
  });

  it('skips unregistered tiers', async () => {
    const engine = createEvalEngine();
    engine.registerEvaluator(createMockEvaluator(1, 75, 'Quality'));

    const result = await engine.evaluate(
      new URL('../__tests__/fixtures/good-skill', import.meta.url).pathname,
      { tiers: [1, 2, 3] }
    );

    expect(result.tiers).toHaveLength(1);
    expect(result.tiers[0].tier).toBe(1);
  });

  it('handles evaluator errors gracefully', async () => {
    const engine = createEvalEngine();
    const failingEvaluator: TierEvaluator = {
      tier: 1,
      name: 'Failing',
      evaluate: vi.fn().mockRejectedValue(new Error('LLM timeout')),
    };
    engine.registerEvaluator(failingEvaluator);

    const result = await engine.evaluate(
      new URL('../__tests__/fixtures/good-skill', import.meta.url).pathname,
      { tiers: [1] }
    );

    expect(result.tiers).toHaveLength(1);
    expect(result.tiers[0].score).toBe(0);
    expect(result.tiers[0].grade).toBe('F');
    expect(result.tiers[0].details.error).toBe('LLM timeout');
  });

  it('throws on missing skill path', async () => {
    const engine = createEvalEngine();
    await expect(engine.evaluate('/nonexistent/path')).rejects.toThrow('Path not found');
  });

  it('throws when no skill file found in directory', async () => {
    const engine = createEvalEngine();
    await expect(engine.evaluate('/tmp')).rejects.toThrow('No skill file found');
  });

  it('returns correct grade for various scores', async () => {
    const engine = createEvalEngine();

    engine.registerEvaluator(createMockEvaluator(1, 97, 'S-tier'));
    let result = await engine.evaluate(
      new URL('../__tests__/fixtures/good-skill', import.meta.url).pathname,
      { tiers: [1] }
    );
    expect(result.grade).toBe('S');

    engine.registerEvaluator(createMockEvaluator(1, 30, 'F-tier'));
    result = await engine.evaluate(
      new URL('../__tests__/fixtures/bad-skill', import.meta.url).pathname,
      { tiers: [1] }
    );
    expect(result.grade).toBe('F');
  });

  it('includes timestamp and options in result', async () => {
    const engine = createEvalEngine();
    engine.registerEvaluator(createMockEvaluator(1, 80, 'Test'));

    const options: EvalOptions = { tiers: [1], verbose: true };
    const result = await engine.evaluate(
      new URL('../__tests__/fixtures/good-skill', import.meta.url).pathname,
      options
    );

    expect(result.timestamp).toBeTruthy();
    expect(result.options).toEqual(options);
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });
});
