import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunityRegistry } from '../community.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { existsSync, readFileSync } from 'node:fs';

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

const SAMPLE_SKILLS_MD = `# SkillKit Community Skills Registry

## Code Quality

- [code-simplifier](https://github.com/anthropics/skills) - Simplifies and refines code
- [code-review](https://github.com/anthropics/skills) - Automated code review

## Testing

- [testing-guide](https://github.com/anthropics/skills) - Unit testing fundamentals
- [e2e-testing](https://github.com/anthropics/skills) - End-to-end testing with Playwright
`;

describe('CommunityRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(SAMPLE_SKILLS_MD);
  });

  it('parses SKILLS.md entries', async () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const results = await registry.search('code');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].registry).toBe('community');
    expect(results[0].name).toBe('code-simplifier');
  });

  it('searches by description', async () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const results = await registry.search('Playwright');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('e2e-testing');
  });

  it('searches by category', async () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const results = await registry.search('Testing');
    expect(results.length).toBe(2);
  });

  it('respects limit', async () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const results = await registry.search('code', { limit: 1 });
    expect(results.length).toBe(1);
  });

  it('returns empty when no match', async () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const results = await registry.search('nonexistent-xyz');
    expect(results.length).toBe(0);
  });

  it('getAll returns all entries', () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const all = registry.getAll();
    expect(all.length).toBe(4);
  });

  it('getCategories returns unique categories', () => {
    const registry = new CommunityRegistry('/fake/SKILLS.md');
    const cats = registry.getCategories();
    expect(cats).toContain('Code Quality');
    expect(cats).toContain('Testing');
    expect(cats.length).toBe(2);
  });

  it('handles missing file gracefully', async () => {
    mockExistsSync.mockReturnValue(false);
    const registry = new CommunityRegistry('/missing/SKILLS.md');
    const results = await registry.search('anything');
    expect(results).toEqual([]);
  });
});
