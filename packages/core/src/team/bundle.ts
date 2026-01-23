/**
 * Skill Bundle
 *
 * Package multiple skills into a shareable bundle
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import type { BundleManifest } from './types.js';
import type { AgentType } from '../types.js';

const BUNDLE_VERSION = 1;

/**
 * Skill Bundle class for creating and managing skill bundles
 */
export class SkillBundle {
  private manifest: BundleManifest;
  private skills: Map<string, string> = new Map(); // skillName -> content

  constructor(name: string, author: string, description?: string) {
    this.manifest = {
      version: BUNDLE_VERSION,
      name,
      description,
      author,
      createdAt: new Date().toISOString(),
      skills: [],
      totalSize: 0,
    };
  }

  /**
   * Add a skill to the bundle
   */
  addSkill(skillPath: string, agents?: AgentType[]): void {
    const skillName = basename(skillPath);
    const content = this.readSkillContent(skillPath);

    this.skills.set(skillName, content);
    this.manifest.skills.push({
      name: skillName,
      path: skillName, // Store only the skill name, not the full path
      agents: agents || this.detectAgents(skillPath),
    });

    this.manifest.totalSize += Buffer.byteLength(content, 'utf-8');
  }

  /**
   * Remove a skill from the bundle
   */
  removeSkill(skillName: string): boolean {
    const skill = this.manifest.skills.find((s) => s.name === skillName);
    if (!skill) return false;

    const content = this.skills.get(skillName);
    if (content) {
      this.manifest.totalSize -= Buffer.byteLength(content, 'utf-8');
    }

    this.skills.delete(skillName);
    this.manifest.skills = this.manifest.skills.filter((s) => s.name !== skillName);

    return true;
  }

  /**
   * Get bundle manifest
   */
  getManifest(): BundleManifest {
    return { ...this.manifest };
  }

  /**
   * Get all skill names in bundle
   */
  getSkillNames(): string[] {
    return this.manifest.skills.map((s) => s.name);
  }

  /**
   * Get skill content by name
   */
  getSkillContent(skillName: string): string | undefined {
    return this.skills.get(skillName);
  }

  /**
   * Calculate bundle checksum
   */
  getChecksum(): string {
    const contents: string[] = [];
    for (const [name, content] of this.skills.entries()) {
      contents.push(`${name}:${content}`);
    }
    contents.sort();
    return createHash('sha256').update(contents.join('\n')).digest('hex').slice(0, 12);
  }

  private readSkillContent(skillPath: string): string {
    const contents: string[] = [];

    const readDir = (dir: string, prefix = ''): void => {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const relativePath = prefix ? `${prefix}/${entry}` : entry;
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          readDir(fullPath, relativePath);
        } else if (stat.isFile()) {
          const content = readFileSync(fullPath, 'utf-8');
          contents.push(`--- ${relativePath} ---\n${content}`);
        }
      }
    };

    if (statSync(skillPath).isDirectory()) {
      readDir(skillPath);
    } else {
      contents.push(readFileSync(skillPath, 'utf-8'));
    }

    return contents.join('\n\n');
  }

  private detectAgents(skillPath: string): AgentType[] {
    const agents: AgentType[] = [];

    if (existsSync(join(skillPath, 'SKILL.md'))) {
      agents.push('claude-code', 'codex', 'gemini-cli', 'universal');
    }
    if (existsSync(join(skillPath, 'skill.mdc'))) {
      agents.push('cursor');
    }
    if (existsSync(join(skillPath, 'rules.md'))) {
      agents.push('windsurf');
    }

    return agents.length > 0 ? agents : ['universal'];
  }
}

/**
 * Create a new skill bundle
 */
export function createSkillBundle(
  name: string,
  author: string,
  description?: string
): SkillBundle {
  return new SkillBundle(name, author, description);
}

/**
 * Export a bundle to a file
 */
export function exportBundle(
  bundle: SkillBundle,
  outputPath: string
): { success: boolean; path?: string; error?: string } {
  try {
    const manifest = bundle.getManifest();
    const exportData = {
      manifest,
      skills: {} as Record<string, string>,
    };

    for (const skill of manifest.skills) {
      const content = bundle.getSkillContent(skill.name);
      if (content) {
        exportData.skills[skill.name] = content;
      }
    }

    const dir = join(outputPath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Export as JSON (could be changed to tarball for better compression)
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    return { success: true, path: outputPath };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Import a bundle from a file
 */
export function importBundle(
  bundlePath: string,
  targetDir: string,
  options: { overwrite?: boolean } = {}
): { success: boolean; imported: string[]; errors: string[] } {
  const imported: string[] = [];
  const errors: string[] = [];

  try {
    const content = readFileSync(bundlePath, 'utf-8');
    const data = JSON.parse(content) as {
      manifest: BundleManifest;
      skills: Record<string, string>;
    };

    for (const skill of data.manifest.skills) {
      const skillContent = data.skills[skill.name];
      if (!skillContent) {
        errors.push(`Skill "${skill.name}" has no content in bundle`);
        continue;
      }

      const skillDir = join(targetDir, skill.name);

      // Check if exists
      if (existsSync(skillDir) && !options.overwrite) {
        errors.push(`Skill "${skill.name}" already exists (use --overwrite)`);
        continue;
      }

      // Create skill directory
      if (!existsSync(skillDir)) {
        mkdirSync(skillDir, { recursive: true });
      }

      // Parse and write skill files
      const files = parseSkillContent(skillContent);
      for (const [filePath, fileContent] of Object.entries(files)) {
        // Validate path to prevent path traversal attacks
        const fullPath = resolve(skillDir, filePath);
        const relativePath = relative(skillDir, fullPath);

        // Check for path traversal (path escapes skillDir)
        if (relativePath.startsWith('..') || resolve(fullPath) !== fullPath || !fullPath.startsWith(skillDir)) {
          errors.push(`Skill "${skill.name}" contains invalid file path: ${filePath}`);
          continue;
        }

        const fileDir = join(fullPath, '..');
        if (!existsSync(fileDir)) {
          mkdirSync(fileDir, { recursive: true });
        }
        writeFileSync(fullPath, fileContent, 'utf-8');
      }

      imported.push(skill.name);
    }

    return { success: errors.length === 0, imported, errors };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Unknown error');
    return { success: false, imported, errors };
  }
}

/**
 * Parse skill content back into individual files
 */
function parseSkillContent(content: string): Record<string, string> {
  const files: Record<string, string> = {};
  const sections = content.split(/\n--- ([^\n]+) ---\n/);

  // First section is empty or content without header
  let i = 1;
  while (i < sections.length) {
    const filePath = sections[i];
    const fileContent = sections[i + 1] || '';
    if (filePath && !filePath.startsWith('---')) {
      files[filePath.trim()] = fileContent;
    }
    i += 2;
  }

  // If no file markers found, assume it's a single SKILL.md
  if (Object.keys(files).length === 0 && content.trim()) {
    files['SKILL.md'] = content;
  }

  return files;
}
