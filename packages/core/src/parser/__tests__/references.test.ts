import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripFrontmatter, parseSkillMd, discoverReferences } from '../references.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { existsSync, readdirSync, statSync } from 'node:fs';

const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockStatSync = vi.mocked(statSync);

describe('stripFrontmatter', () => {
  it('extracts frontmatter and body', () => {
    const raw = `---
name: my-skill
version: 1.0
---
# My Skill

Content here.`;
    const result = stripFrontmatter(raw);
    expect(result.frontmatter.name).toBe('my-skill');
    expect(result.frontmatter.version).toBe('1.0');
    expect(result.body).toContain('# My Skill');
    expect(result.body).toContain('Content here.');
  });

  it('returns empty frontmatter when no delimiters', () => {
    const raw = '# Just content\n\nNo frontmatter.';
    const result = stripFrontmatter(raw);
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe(raw);
  });

  it('handles empty frontmatter block', () => {
    const raw = '---\n---\nBody text';
    const result = stripFrontmatter(raw);
    expect(result.frontmatter).toEqual({});
    expect(result.body).toBe('Body text');
  });
});

describe('parseSkillMd', () => {
  it('parses raw content without skill dir', () => {
    const raw = `---
name: test
---
Body content`;
    const result = parseSkillMd(raw);
    expect(result.frontmatter.name).toBe('test');
    expect(result.body).toBe('Body content');
    expect(result.references).toEqual([]);
    expect(result.raw).toBe(raw);
  });
});

describe('discoverReferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds files in reference directories', () => {
    mockExistsSync.mockImplementation((p) => {
      return String(p).endsWith('/examples');
    });
    mockStatSync.mockImplementation((p) => {
      const path = String(p);
      if (path.endsWith('/examples')) {
        return { isDirectory: () => true, isFile: () => false } as any;
      }
      return { isDirectory: () => false, isFile: () => true } as any;
    });
    mockReaddirSync.mockReturnValue(['demo.ts', 'readme.md'] as any);

    const refs = discoverReferences('/fake/skill');
    expect(refs).toHaveLength(2);
    expect(refs[0]).toEqual({
      path: 'examples/demo.ts',
      type: 'example',
      name: 'demo.ts',
    });
  });

  it('returns empty array when no reference dirs exist', () => {
    mockExistsSync.mockReturnValue(false);
    const refs = discoverReferences('/fake/skill');
    expect(refs).toEqual([]);
  });
});
