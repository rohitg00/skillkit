import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { ExtractedContent } from './types.js';
import { AutoTagger } from './tagger.js';

export interface SaveGenerateOptions {
  name?: string;
  global?: boolean;
  outputDir?: string;
}

export interface SaveGeneratedSkill {
  skillPath: string;
  skillMd: string;
  name: string;
}

const MAX_NAME_LENGTH = 64;
const SUMMARY_LINE_LIMIT = 100;
const SPLIT_THRESHOLD = 500;
const DESCRIPTION_MAX = 200;

export class SkillGenerator {
  private tagger = new AutoTagger();

  generate(content: ExtractedContent, options: SaveGenerateOptions = {}): SaveGeneratedSkill {
    const name = options.name
      ? this.slugify(options.name)
      : this.slugify(content.title || 'untitled-skill');

    const tags = this.tagger.detectTags(content);
    const description = this.makeDescription(content.content);
    const source = content.sourceUrl ?? content.sourcePath ?? '';

    const frontmatter = this.buildFrontmatter(name, description, tags, source);
    const lines = content.content.split('\n');
    const needsSplit = lines.length > SPLIT_THRESHOLD;

    const body = needsSplit
      ? lines.slice(0, SUMMARY_LINE_LIMIT).join('\n')
      : content.content;

    const skillMd = `${frontmatter}\n${body}\n`;

    const outputDir = options.outputDir ?? this.defaultOutputDir(name, options.global);
    mkdirSync(outputDir, { recursive: true });

    const skillPath = join(outputDir, 'SKILL.md');
    writeFileSync(skillPath, skillMd, 'utf-8');

    if (needsSplit) {
      const refsDir = join(outputDir, 'references');
      mkdirSync(refsDir, { recursive: true });
      writeFileSync(
        join(refsDir, 'full-content.md'),
        content.content,
        'utf-8',
      );
    }

    return { skillPath, skillMd, name };
  }

  private slugify(input: string): string {
    const slug = input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

    const trimmed = slug.slice(0, MAX_NAME_LENGTH).replace(/-+$/, '');
    return trimmed || 'untitled-skill';
  }

  private makeDescription(content: string): string {
    const firstLine = content.split('\n').find((l) => l.trim().length > 0) ?? '';
    const cleaned = firstLine.replace(/^#+\s*/, '').trim();
    return cleaned.length > DESCRIPTION_MAX
      ? cleaned.slice(0, DESCRIPTION_MAX - 3) + '...'
      : cleaned || 'Saved skill';
  }

  private buildFrontmatter(
    name: string,
    description: string,
    tags: string[],
    source: string,
  ): string {
    const yamlTags = tags.map((t) => `  - ${t}`).join('\n');
    const savedAt = new Date().toISOString();

    const lines = [
      '---',
      `name: ${name}`,
      `description: ${this.yamlEscape(description)}`,
      tags.length > 0 ? `tags:\n${yamlTags}` : null,
      'metadata:',
      source ? `  source: ${source}` : null,
      `  savedAt: ${savedAt}`,
      '---',
    ].filter((l): l is string => l !== null);

    return lines.join('\n') + '\n';
  }

  private yamlEscape(value: string): string {
    const singleLine = value.replace(/\r?\n/g, ' ').trim();
    if (/[:#{}[\],&*?|>!%@`]/.test(singleLine) || singleLine.startsWith("'") || singleLine.startsWith('"')) {
      return `"${singleLine.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return singleLine;
  }

  private defaultOutputDir(name: string, global?: boolean): string {
    if (global) {
      return join(homedir(), '.skillkit', 'skills', name);
    }
    return join('.skillkit', 'skills', name);
  }
}
