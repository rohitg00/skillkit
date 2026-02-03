import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface SkillReference {
  path: string;
  type: 'example' | 'doc' | 'resource' | 'asset';
  name: string;
}

export interface ParsedSkillContent {
  frontmatter: Record<string, unknown>;
  body: string;
  references: SkillReference[];
  raw: string;
}

const REFERENCE_DIRS = ['references', 'resources', 'docs', 'examples', 'assets', 'scripts'];

const DIR_TYPE_MAP: Record<string, SkillReference['type']> = {
  references: 'resource',
  resources: 'resource',
  docs: 'doc',
  examples: 'example',
  assets: 'asset',
  scripts: 'resource',
};

export function discoverReferences(skillDir: string): SkillReference[] {
  const refs: SkillReference[] = [];

  for (const dir of REFERENCE_DIRS) {
    const fullPath = join(skillDir, dir);
    if (!existsSync(fullPath)) continue;

    try {
      const stat = statSync(fullPath);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const type = DIR_TYPE_MAP[dir] || 'resource';
    try {
      const entries = readdirSync(fullPath);
      for (const entry of entries) {
        const entryPath = join(fullPath, entry);
        try {
          const entryStat = statSync(entryPath);
          if (entryStat.isFile()) {
            refs.push({
              path: join(dir, entry),
              type,
              name: entry,
            });
          }
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }

  return refs;
}

export function stripFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    const emptyMatch = raw.match(/^---\r?\n---\r?\n?([\s\S]*)$/);
    if (emptyMatch) {
      return { frontmatter: {}, body: emptyMatch[1] };
    }
    return { frontmatter: {}, body: raw };
  }

  const fmBlock = match[1];
  const body = match[2];

  const frontmatter: Record<string, unknown> = {};
  for (const line of fmBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

export function parseSkillMd(raw: string, skillDir?: string): ParsedSkillContent {
  const { frontmatter, body } = stripFrontmatter(raw);
  const references = skillDir ? discoverReferences(skillDir) : [];

  return {
    frontmatter,
    body,
    references,
    raw,
  };
}
