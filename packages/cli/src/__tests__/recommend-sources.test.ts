import { describe, expect, it } from 'vitest';
import { buildRecommendationSources } from '../recommend-sources.js';
import type { TapEntry } from '../helpers.js';

const knownSkillRepos = [
  {
    owner: 'anthropics',
    repo: 'courses',
    description: 'Anthropic official courses and skills',
  },
  {
    owner: 'vercel-labs',
    repo: 'ai-sdk-preview-internal-knowledge-base',
    description: 'Vercel AI SDK skills',
  },
];

describe('recommend source resolution', () => {
  it('should include built-in sources and valid custom taps', () => {
    const taps: TapEntry[] = [
      { source: 'some-org/some-skills', addedAt: '2026-06-14T00:00:00.000Z' },
    ];

    const result = buildRecommendationSources(knownSkillRepos, taps);

    expect(result.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining(knownSkillRepos[0]),
        expect.objectContaining({ owner: 'some-org', repo: 'some-skills' }),
      ])
    );
    expect(result.warnings).toEqual([]);
  });

  it('should dedupe duplicate owner/repo sources', () => {
    const builtIn = knownSkillRepos[0];
    const taps: TapEntry[] = [
      { source: `${builtIn.owner}/${builtIn.repo}`, addedAt: '2026-06-14T00:00:00.000Z' },
      { source: 'some-org/some-skills', addedAt: '2026-06-14T00:00:00.000Z' },
      { source: 'Some-Org/Some-Skills', addedAt: '2026-06-14T00:00:00.000Z' },
      { source: 'some-org/some-skills', addedAt: '2026-06-14T00:00:00.000Z' },
    ];

    const result = buildRecommendationSources(knownSkillRepos, taps);
    const names = result.sources.map((source) => `${source.owner}/${source.repo}`);

    expect(names.filter((name) => name === `${builtIn.owner}/${builtIn.repo}`)).toHaveLength(1);
    expect(names.filter((name) => name.toLowerCase() === 'some-org/some-skills')).toHaveLength(1);
  });

  it('should warn and skip invalid tap sources', () => {
    const result = buildRecommendationSources(knownSkillRepos, [
      { source: 'not-a-github-source', addedAt: '2026-06-14T00:00:00.000Z' },
      { source: 'valid-org/valid-skills', addedAt: '2026-06-14T00:00:00.000Z' },
    ]);

    expect(result.sources).toContainEqual(
      expect.objectContaining({ owner: 'valid-org', repo: 'valid-skills' })
    );
    expect(result.sources).not.toContainEqual(
      expect.objectContaining({ owner: 'not-a-github-source' })
    );
    expect(result.warnings).toContain('Invalid tap source skipped: not-a-github-source');
  });
});
