import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SkillInjector } from '../injector.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SkillInjector', () => {
  let injector: SkillInjector;

  beforeEach(() => {
    injector = new SkillInjector(60_000);
    mockFetch.mockReset();
  });

  afterEach(() => {
    injector.clearCache();
  });

  const skillMd = `---
name: test-skill
version: 1.0
---
# Test Skill

This is the body content.`;

  it('fetches and parses a SKILL.md from GitHub', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => skillMd,
    });

    const result = await injector.fetch('owner/repo', 'test-skill');
    expect(result.source).toEqual({ owner: 'owner', repo: 'repo' });
    expect(result.skillId).toBe('test-skill');
    expect(result.parsed.frontmatter.name).toBe('test-skill');
    expect(result.parsed.body).toContain('# Test Skill');
    expect(result.fetchedAt).toBeGreaterThan(0);
  });

  it('returns cached result on subsequent calls', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => skillMd,
    });

    await injector.fetch('owner/repo', 'test-skill');
    const second = await injector.fetch('owner/repo', 'test-skill');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(second.parsed.body).toContain('# Test Skill');
  });

  it('inject() returns body without frontmatter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => skillMd,
    });

    const body = await injector.inject('owner/repo', 'test-skill');
    expect(body).toContain('# Test Skill');
    expect(body).not.toContain('---');
    expect(body).not.toContain('name: test-skill');
  });

  it('throws on invalid source format', async () => {
    await expect(injector.fetch('invalid', 'skill')).rejects.toThrow('Invalid source format');
  });

  it('throws when SKILL.md not found after trying all paths', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(injector.fetch('owner/repo', 'missing')).rejects.toThrow('SKILL.md not found');
  });

  it('tries multiple paths before failing', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => skillMd,
      });

    const result = await injector.fetch('owner/repo', 'skill');
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.parsed.body).toContain('# Test Skill');
  });

  it('reports cache stats', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => skillMd,
    });

    await injector.fetch('owner/repo', 'skill');
    await injector.fetch('owner/repo', 'skill');

    const stats = injector.cacheStats();
    expect(stats.size).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it('parses full GitHub URLs as source', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => skillMd,
    });

    const result = await injector.fetch('https://github.com/owner/repo', 'skill');
    expect(result.source).toEqual({ owner: 'owner', repo: 'repo' });
  });
});
