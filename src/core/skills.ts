import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { SkillFrontmatter, SkillMetadata, type Skill, type SkillLocation } from './types.js';

export function discoverSkills(dir: string): Skill[] {
  const skills: Skill[] = [];

  if (!existsSync(dir)) {
    return skills;
  }

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillPath = join(dir, entry.name);
    const skillMdPath = join(skillPath, 'SKILL.md');

    if (existsSync(skillMdPath)) {
      const skill = parseSkill(skillPath);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

export function parseSkill(skillPath: string, location: SkillLocation = 'project'): Skill | null {
  const skillMdPath = join(skillPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    return null;
  }

  try {
    const content = readFileSync(skillMdPath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      const name = basename(skillPath);
      return {
        name,
        description: 'No description available',
        path: skillPath,
        location,
        enabled: true,
      };
    }

    const parsed = SkillFrontmatter.safeParse(frontmatter);

    if (!parsed.success) {
      return {
        name: (frontmatter.name as string) || basename(skillPath),
        description: (frontmatter.description as string) || 'No description available',
        path: skillPath,
        location,
        enabled: true,
      };
    }

    const metadata = loadMetadata(skillPath);

    return {
      name: parsed.data.name,
      description: parsed.data.description,
      path: skillPath,
      location,
      metadata: metadata ?? undefined,
      enabled: metadata?.enabled ?? true,
    };
  } catch {
    return null;
  }
}

export function extractFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!match) {
    return null;
  }

  try {
    return parseYaml(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractField(content: string, field: string): string | null {
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter || !(field in frontmatter)) {
    return null;
  }

  const value = frontmatter[field];
  return typeof value === 'string' ? value : null;
}

export function loadMetadata(skillPath: string): SkillMetadata | null {
  const metadataPath = join(skillPath, '.skillkit.json');

  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = readFileSync(metadataPath, 'utf-8');
    const data = JSON.parse(content);
    const parsed = SkillMetadata.safeParse(data);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function readSkillContent(skillPath: string): string | null {
  const skillMdPath = join(skillPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    return null;
  }

  try {
    return readFileSync(skillMdPath, 'utf-8');
  } catch {
    return null;
  }
}

export function findSkill(name: string, searchDirs: string[]): Skill | null {
  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    const skillPath = join(dir, name);
    if (existsSync(skillPath)) {
      const location: SkillLocation = dir.includes(process.cwd()) ? 'project' : 'global';
      return parseSkill(skillPath, location);
    }
  }

  return null;
}

export function findAllSkills(searchDirs: string[]): Skill[] {
  const skills: Skill[] = [];
  const seen = new Set<string>();

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    const location: SkillLocation = dir.includes(process.cwd()) ? 'project' : 'global';
    const discovered = discoverSkills(dir);

    for (const skill of discovered) {
      if (!seen.has(skill.name)) {
        seen.add(skill.name);
        skills.push({ ...skill, location });
      }
    }
  }

  return skills;
}

export function validateSkill(skillPath: string): { valid: boolean; errors: string[]; warnings?: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dirName = basename(skillPath);

  const skillMdPath = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    errors.push('Missing SKILL.md file');
    return { valid: false, errors };
  }

  const content = readFileSync(skillMdPath, 'utf-8');
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    errors.push('Missing YAML frontmatter in SKILL.md');
    return { valid: false, errors };
  }

  const parsed = SkillFrontmatter.safeParse(frontmatter);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join('.') || 'frontmatter'}: ${issue.message}`);
    }
  }

  if (parsed.success) {
    const data = parsed.data;

    if (data.name !== dirName) {
      warnings.push(`name "${data.name}" does not match directory name "${dirName}"`);
    }

    if (data.description && data.description.length < 50) {
      warnings.push('description is short; consider describing what the skill does AND when to use it');
    }
  }

  const bodyContent = content.replace(/^---[\s\S]*?---\s*/, '');
  const lineCount = bodyContent.split('\n').length;
  if (lineCount > 500) {
    warnings.push(`SKILL.md has ${lineCount} lines; consider moving detailed content to references/`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function isPathInside(child: string, parent: string): boolean {
  const relative = child.replace(parent, '');
  return !relative.startsWith('..') && !relative.includes('/..');
}
