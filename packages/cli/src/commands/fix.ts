import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { Command, Option } from 'clipanion';
import {
  evaluateSkillFile,
  findAllSkills,
  type QualityScore,
} from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';
import {
  colors,
  symbols,
  success,
  warn,
  error,
  header,
  confirm,
} from '../onboarding/index.js';

interface FixSuggestion {
  type: 'add' | 'replace' | 'format';
  description: string;
  original?: string;
  replacement: string;
  line?: number;
  automatic: boolean;
}

const FRONTMATTER_TEMPLATE = `---
name: {{NAME}}
description: {{DESCRIPTION}}
globs:
  - "**/*"
---

`;

const WHEN_TO_USE_TEMPLATE = `
## When to Use

Use this skill when:
- [Add specific trigger conditions]
- [Add relevant patterns to detect]

`;

const BOUNDARIES_TEMPLATE = `
## Boundaries

This skill should NOT:
- [Add constraints and limitations]
- [Specify what the agent should never do]

`;

const VAGUE_TERM_REPLACEMENTS: Record<string, string> = {
  'be helpful': 'follow the specific instructions below',
  'assist the user': 'complete the requested task',
  'help with': 'handle',
  'try to': '',
  'attempt to': '',
  'do your best': 'follow these guidelines',
  'as needed': 'when the following conditions are met',
  'when appropriate': 'when',
  'if necessary': 'when required',
  'general purpose': 'designed for',
  'various tasks': 'the following tasks',
  'many things': 'the following',
  'etc.': '',
  'and so on': '',
  'stuff like that': '',
};

function generateFixes(content: string, quality: QualityScore, skillName: string): FixSuggestion[] {
  const fixes: FixSuggestion[] = [];

  if (!quality.structure.hasMetadata) {
    const template = FRONTMATTER_TEMPLATE
      .replace('{{NAME}}', skillName)
      .replace('{{DESCRIPTION}}', 'Add a description for this skill');
    fixes.push({
      type: 'add',
      description: 'Add YAML frontmatter template',
      replacement: template,
      automatic: true,
    });
  }

  if (!quality.structure.hasTriggers && !quality.structure.hasWhenToUse) {
    fixes.push({
      type: 'add',
      description: 'Add "When to Use" section scaffold',
      replacement: WHEN_TO_USE_TEMPLATE,
      automatic: true,
    });
  }

  if (!quality.structure.hasBoundaries) {
    fixes.push({
      type: 'add',
      description: 'Add "Boundaries" section scaffold',
      replacement: BOUNDARIES_TEMPLATE,
      automatic: true,
    });
  }

  for (const [vague, replacement] of Object.entries(VAGUE_TERM_REPLACEMENTS)) {
    const escaped = vague.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(content)) {
      fixes.push({
        type: 'replace',
        description: `Replace vague term "${vague}"`,
        original: vague,
        replacement: replacement || '[be specific]',
        automatic: false,
      });
    }
  }

  const codeBlockPattern = /```(\s*\n[\s\S]*?```)/g;
  let match;
  while ((match = codeBlockPattern.exec(content)) !== null) {
    if (match[1].startsWith('\n') && !content.slice(match.index, match.index + 10).match(/```\w/)) {
      fixes.push({
        type: 'format',
        description: 'Add language tag to code block',
        original: '```',
        replacement: '```typescript',
        automatic: false,
      });
      break;
    }
  }

  return fixes;
}

function applyFixes(content: string, fixes: FixSuggestion[]): string {
  let result = content;

  const hasFrontmatter = /^---\s*\n/.test(content);

  for (const fix of fixes) {
    if (fix.type === 'add') {
      if (fix.description.includes('frontmatter') && !hasFrontmatter) {
        result = fix.replacement + result;
      } else if (fix.description.includes('When to Use') || fix.description.includes('Boundaries')) {
        result = result.trimEnd() + '\n' + fix.replacement;
      }
    } else if (fix.type === 'replace' && fix.original && fix.automatic) {
      const escaped = fix.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, fix.replacement);
    }
  }

  return result;
}

export class FixCommand extends Command {
  static override paths = [['fix']];

  static override usage = Command.Usage({
    description: 'Automatically fix common skill quality issues',
    details: `
      The fix command analyzes skills and applies automatic fixes for common quality issues.

      Fixes that can be automated:
      - Add missing YAML frontmatter template
      - Add "When to Use" section scaffold
      - Add "Boundaries" section scaffold
      - Format code blocks with language tags

      Interactive mode prompts before each fix.
    `,
    examples: [
      ['Fix a specific skill', '$0 fix my-skill'],
      ['Fix skill file', '$0 fix ./path/to/SKILL.md'],
      ['Preview fixes without applying', '$0 fix my-skill --dry-run'],
      ['Apply all fixes without prompts', '$0 fix my-skill --yes'],
    ],
  });

  targets = Option.Rest();

  dryRun = Option.Boolean('--dry-run,-d', false, {
    description: 'Show proposed changes without applying',
  });

  yes = Option.Boolean('--yes,-y', false, {
    description: 'Apply all automatic fixes without prompting',
  });

  interactive = Option.Boolean('--interactive,-i', {
    description: 'Prompt for each fix (default when not using --yes)',
  });

  async execute(): Promise<number> {
    const isInteractive = this.interactive !== false && !this.yes && !this.dryRun && process.stdin.isTTY;

    if (this.targets.length === 0) {
      error('Please specify a skill to fix');
      console.log(colors.muted('Usage: skillkit fix <skill-name> or skillkit fix ./path/to/SKILL.md'));
      return 1;
    }

    header('Skill Quality Fixer');

    let totalFixes = 0;
    let filesFixed = 0;

    for (const target of this.targets) {
      const resolved = resolve(target);
      let filePath: string | null = null;
      let skillName = basename(target);

      if (existsSync(resolved)) {
        if (resolved.endsWith('.md') || resolved.endsWith('.mdc')) {
          filePath = resolved;
          const fileName = basename(resolved);
          if (fileName.endsWith('.mdc')) {
            skillName = fileName.slice(0, -4);
          } else if (fileName.endsWith('.md')) {
            skillName = fileName.slice(0, -3);
          } else {
            skillName = fileName;
          }
        } else {
          const skillMd = join(resolved, 'SKILL.md');
          const indexMdc = join(resolved, 'index.mdc');
          if (existsSync(skillMd)) {
            filePath = skillMd;
          } else if (existsSync(indexMdc)) {
            filePath = indexMdc;
          }
        }
      } else {
        const searchDirs = getSearchDirs();
        const skills = findAllSkills(searchDirs);
        const found = skills.find(s => s.name === target);
        if (found) {
          const skillMd = join(found.path, 'SKILL.md');
          const indexMdc = join(found.path, 'index.mdc');
          if (existsSync(skillMd)) {
            filePath = skillMd;
          } else if (existsSync(indexMdc)) {
            filePath = indexMdc;
          }
          skillName = found.name;
        }
      }

      if (!filePath || !existsSync(filePath)) {
        warn(`Skill not found: ${target}`);
        continue;
      }

      const content = readFileSync(filePath, 'utf-8');
      const quality = evaluateSkillFile(filePath);

      if (!quality) {
        warn(`Could not evaluate: ${target}`);
        continue;
      }

      console.log('');
      console.log(colors.bold(skillName));
      console.log(colors.muted(`Score: ${quality.overall}/100`));

      const fixes = generateFixes(content, quality, skillName);
      const automaticFixes = fixes.filter(f => f.automatic);
      const manualFixes = fixes.filter(f => !f.automatic);

      if (fixes.length === 0) {
        console.log(colors.success(`${symbols.success} No automatic fixes needed`));
        continue;
      }

      console.log('');
      console.log(colors.muted(`Found ${fixes.length} potential fix(es):`));

      for (const fix of automaticFixes) {
        console.log(`  ${colors.success(symbols.success)} ${fix.description} ${colors.muted('(automatic)')}`);
      }

      for (const fix of manualFixes) {
        console.log(`  ${colors.warning(symbols.warning)} ${fix.description} ${colors.muted('(manual review)')}`);
      }

      if (this.dryRun) {
        console.log('');
        console.log(colors.muted('Dry run - no changes applied'));

        if (automaticFixes.length > 0) {
          console.log('');
          console.log(colors.muted('Preview of automatic fixes:'));
          const preview = applyFixes(content, automaticFixes);
          const diff = generateDiff(content, preview);
          console.log(diff);
        }
        continue;
      }

      if (automaticFixes.length > 0) {
        let shouldApply = this.yes;

        if (isInteractive && !this.yes) {
          console.log('');
          const confirmResult = await confirm({
            message: `Apply ${automaticFixes.length} automatic fix(es)?`,
            initialValue: true,
          });
          shouldApply = confirmResult === true;
        }

        if (shouldApply) {
          const fixed = applyFixes(content, automaticFixes);
          writeFileSync(filePath, fixed, 'utf-8');
          totalFixes += automaticFixes.length;
          filesFixed++;
          console.log(colors.success(`${symbols.success} Applied ${automaticFixes.length} fix(es)`));
        } else {
          console.log(colors.muted('Skipped'));
        }
      }

      if (manualFixes.length > 0) {
        console.log('');
        console.log(colors.muted('Manual fixes required:'));
        for (const fix of manualFixes) {
          if (fix.original) {
            console.log(`  ${colors.warning(symbols.bullet)} Replace "${fix.original}" with "${fix.replacement}"`);
          } else {
            console.log(`  ${colors.warning(symbols.bullet)} ${fix.description}`);
          }
        }
      }
    }

    console.log('');
    if (totalFixes > 0) {
      success(`Fixed ${totalFixes} issue(s) in ${filesFixed} file(s)`);
      console.log(colors.muted('Run "skillkit validate" to verify improvements'));
    } else if (!this.dryRun) {
      console.log(colors.muted('No fixes applied'));
    }

    return 0;
  }
}

function generateDiff(original: string, modified: string): string {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');

  const originalSet = new Set(originalLines);
  const modifiedSet = new Set(modifiedLines);

  const added = modifiedLines.filter(line => !originalSet.has(line));
  const removed = originalLines.filter(line => !modifiedSet.has(line));

  const diff: string[] = [];

  for (const line of removed.slice(0, 5)) {
    diff.push(colors.error(`- ${line}`));
  }
  if (removed.length > 5) {
    diff.push(colors.muted(`  ... and ${removed.length - 5} more removed`));
  }

  for (const line of added.slice(0, 10)) {
    diff.push(colors.success(`+ ${line}`));
  }
  if (added.length > 10) {
    diff.push(colors.muted(`  ... and ${added.length - 10} more added`));
  }

  if (diff.length === 0) {
    diff.push(colors.muted('  (no visible changes)'));
  }

  return diff.join('\n');
}
