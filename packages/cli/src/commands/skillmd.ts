import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, basename, relative } from 'node:path';
import { Command, Option } from 'clipanion';
import {
  colors,
  symbols,
  spinner,
  step,
  success,
  error,
  warn,
  header,
} from '../onboarding/index.js';

interface SkillMdValidation {
  path: string;
  exists: boolean;
  hasName: boolean;
  hasDescription: boolean;
  hasTriggers: boolean;
  hasCapabilities: boolean;
  triggerCount: number;
  capabilityCount: number;
  score: number;
  issues: string[];
}

function validateSkillMd(filePath: string): SkillMdValidation {
  const result: SkillMdValidation = {
    path: filePath,
    exists: false,
    hasName: false,
    hasDescription: false,
    hasTriggers: false,
    hasCapabilities: false,
    triggerCount: 0,
    capabilityCount: 0,
    score: 0,
    issues: [],
  };

  if (!existsSync(filePath)) {
    result.issues.push('File does not exist');
    return result;
  }

  result.exists = true;
  const content = readFileSync(filePath, 'utf-8');

  if (!content.trim()) {
    result.issues.push('File is empty');
    return result;
  }

  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const bodyContent = frontmatterMatch
    ? content.slice(frontmatterMatch[0].length)
    : content;

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    if (/^name:\s*.+$/m.test(frontmatter)) result.hasName = true;
    if (/^description:\s*.+$/m.test(frontmatter)) result.hasDescription = true;
  }

  if (!result.hasName) {
    if (/^#\s+.+$/m.test(bodyContent)) result.hasName = true;
  }

  if (!result.hasDescription) {
    if (/^##?\s*(description|about|overview)\b/im.test(bodyContent)) {
      result.hasDescription = true;
    } else {
      const lines = bodyContent.split(/\r?\n/).filter(l => l.trim());
      const nonHeaderLines = lines.filter(l => !l.startsWith('#'));
      if (nonHeaderLines.length >= 2) result.hasDescription = true;
    }
  }

  const triggerPatterns = [
    /triggers?\s*when/i,
    /when\s*to\s*use/i,
    /use\s*this\s*when/i,
    /\*\*triggers?\b/i,
    /^[-*]\s+.+(when|if|pattern|trigger)/im,
    /glob:/i,
  ];

  for (const pattern of triggerPatterns) {
    if (pattern.test(content)) {
      result.hasTriggers = true;
      break;
    }
  }

  if (result.hasTriggers) {
    const triggerSection = content.match(/triggers?\s*when[:\s]*\n((?:[-*]\s+.+\n?)+)/i);
    result.triggerCount = triggerSection
      ? (triggerSection[1].match(/^[-*]\s+/gm) || []).length
      : 1;
  }

  const capabilityPatterns = [
    /capabilities?[:\s]/i,
    /features?[:\s]/i,
    /what\s*(it|this)\s*(does|can)/i,
    /^##?\s*capabilities/im,
    /^##?\s*features/im,
  ];

  for (const pattern of capabilityPatterns) {
    if (pattern.test(content)) {
      result.hasCapabilities = true;
      break;
    }
  }

  if (result.hasCapabilities) {
    const capSection = content.match(/(?:capabilities?|features?)[:\s]*\n((?:[-*]\s+.+\n?)+)/i);
    result.capabilityCount = capSection
      ? (capSection[1].match(/^[-*]\s+/gm) || []).length
      : 1;
  }

  if (!result.hasName) result.issues.push('Missing name field');
  if (!result.hasDescription) result.issues.push('Missing description section');
  if (!result.hasTriggers) result.issues.push('No trigger patterns found');
  if (!result.hasCapabilities) result.issues.push('No capabilities list found');

  let score = 0;
  if (result.exists) score += 10;
  if (result.hasName) score += 20;
  if (result.hasDescription) score += 25;
  if (result.hasTriggers) score += 20;
  if (result.hasCapabilities) score += 15;
  if (result.triggerCount >= 3) score += 5;
  if (result.capabilityCount >= 3) score += 5;

  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    if (/^version:/m.test(fm)) score += 3;
    if (/^license:/m.test(fm)) score += 2;
    if (/^tags:/m.test(fm)) score += 3;
    if (/^metadata:/m.test(fm)) score += 2;
  }

  result.score = Math.min(100, score);
  return result;
}

function printValidation(validation: SkillMdValidation, verbose = false): void {
  const scoreColor = validation.score >= 80
    ? colors.success
    : validation.score >= 60
      ? colors.warning
      : colors.error;

  console.log(`  ${colors.muted('Score:')} ${scoreColor(`${validation.score}`)}/100`);
  console.log(`  ${validation.hasName ? colors.success(symbols.success) : colors.error(symbols.error)} Name field`);
  console.log(`  ${validation.hasDescription ? colors.success(symbols.success) : colors.error(symbols.error)} Description section`);
  console.log(`  ${validation.hasTriggers ? colors.success(symbols.success) : colors.error(symbols.error)} Trigger patterns${validation.triggerCount > 0 ? ` (${validation.triggerCount})` : ''}`);
  console.log(`  ${validation.hasCapabilities ? colors.success(symbols.success) : colors.error(symbols.error)} Capabilities list${validation.capabilityCount > 0 ? ` (${validation.capabilityCount})` : ''}`);

  if (verbose && validation.issues.length > 0) {
    console.log('');
    console.log(`  ${colors.warning('Issues:')}`);
    for (const issue of validation.issues) {
      console.log(`    ${colors.warning(symbols.warning)} ${issue}`);
    }
  }
}

export class SkillMdValidateCommand extends Command {
  static override paths = [['skillmd', 'validate'], ['skill-md', 'validate']];

  static override usage = Command.Usage({
    description: 'Validate a SKILL.md file against the standard',
    examples: [
      ['Validate SKILL.md in current directory', '$0 skillmd validate'],
      ['Validate specific file', '$0 skillmd validate ./path/to/SKILL.md'],
    ],
  });

  targetPath = Option.String({ required: false, name: 'path' });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed validation results',
  });

  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const targetPath = this.targetPath || join(process.cwd(), 'SKILL.md');
    const resolvedPath = resolve(targetPath);
    const filePath = resolvedPath.endsWith('SKILL.md') ? resolvedPath : join(resolvedPath, 'SKILL.md');

    if (!this.json) {
      header('SKILL.md Validation');
      step(`Validating: ${colors.cyan(filePath)}`);
      console.log('');
    }

    const validation = validateSkillMd(filePath);

    if (this.json) {
      console.log(JSON.stringify(validation, null, 2));
      return validation.score >= 60 ? 0 : 1;
    }

    console.log(colors.primary(basename(filePath)));
    printValidation(validation, this.verbose);
    console.log('');

    if (validation.score >= 80) {
      success(`SKILL.md is compliant (score: ${validation.score}/100)`);
    } else if (validation.score >= 60) {
      warn(`SKILL.md needs improvement (score: ${validation.score}/100)`);
    } else {
      error(`SKILL.md does not meet minimum standard (score: ${validation.score}/100)`);
    }

    return validation.score >= 60 ? 0 : 1;
  }
}

export class SkillMdInitCommand extends Command {
  static override paths = [['skillmd', 'init'], ['skill-md', 'init']];

  static override usage = Command.Usage({
    description: 'Create a template SKILL.md in the current directory',
    examples: [
      ['Create SKILL.md template', '$0 skillmd init'],
      ['Create with custom name', '$0 skillmd init --name my-skill'],
    ],
  });

  name = Option.String('--name,-n', {
    description: 'Skill name',
  });

  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing SKILL.md',
  });

  async execute(): Promise<number> {
    const outputPath = join(process.cwd(), 'SKILL.md');

    if (existsSync(outputPath) && !this.force) {
      warn('SKILL.md already exists');
      console.log(colors.muted('Use --force to overwrite'));
      return 1;
    }

    const skillName = this.name || basename(process.cwd());
    const formattedName = skillName
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const template = [
      '---',
      `name: ${skillName}`,
      'description: What this skill does and when to use it',
      'version: "1.0"',
      'license: MIT',
      'tags: [general]',
      'metadata:',
      '  author: your-name',
      '---',
      '',
      `# ${formattedName}`,
      '',
      'Brief description of what this skill provides to AI coding agents.',
      '',
      '## Triggers when:',
      `- User asks about ${skillName} related tasks`,
      `- Project contains ${skillName} configuration files`,
      `- Code changes involve ${skillName} patterns`,
      '',
      '## Capabilities:',
      `- Provides best practices for ${skillName}`,
      '- Generates boilerplate code and configurations',
      '- Validates existing implementations',
      '- Suggests improvements and optimizations',
      '',
      '## Steps',
      '1. First step the AI agent should take',
      '2. Second step with specific instructions',
      '3. Third step with expected outcome',
      '',
      '## Examples',
      '',
      '```',
      'Example code or configuration here',
      '```',
      '',
    ].join('\n');

    writeFileSync(outputPath, template);
    success(`Created SKILL.md for "${skillName}"`);
    console.log('');
    console.log(colors.muted('Next steps:'));
    console.log(`  ${colors.cyan('1.')} Edit SKILL.md with your skill instructions`);
    console.log(`  ${colors.cyan('2.')} Run ${colors.cyan('skillkit skillmd validate')} to check compliance`);
    console.log(`  ${colors.cyan('3.')} Run ${colors.cyan('skillkit publish submit')} to share with the marketplace`);

    return 0;
  }
}

export class SkillMdCheckCommand extends Command {
  static override paths = [['skillmd', 'check'], ['skill-md', 'check']];

  static override usage = Command.Usage({
    description: 'Check all SKILL.md files in the project for compliance',
    examples: [
      ['Check current directory', '$0 skillmd check'],
      ['Check specific directory', '$0 skillmd check ./skills'],
    ],
  });

  targetPath = Option.String({ required: false, name: 'path' });

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed validation results',
  });

  async execute(): Promise<number> {
    const targetPath = resolve(this.targetPath || process.cwd());

    header('SKILL.md Compliance Check');

    const s = spinner();
    s.start('Scanning for SKILL.md files...');
    const skillMdFiles = this.findSkillMdFiles(targetPath);
    s.stop(`Found ${skillMdFiles.length} SKILL.md file(s)`);

    if (skillMdFiles.length === 0) {
      warn('No SKILL.md files found');
      console.log(colors.muted(`Searched: ${targetPath}`));
      console.log('');
      console.log(colors.muted('Create one with:'));
      console.log(`  ${colors.cyan('skillkit skillmd init')}`);
      return 0;
    }

    const validations: SkillMdValidation[] = skillMdFiles.map(f => validateSkillMd(f));
    validations.sort((a, b) => b.score - a.score);

    console.log('');

    for (const validation of validations) {
      const relativePath = relative(targetPath, validation.path);
      const scoreColor = validation.score >= 80 ? colors.success : validation.score >= 60 ? colors.warning : colors.error;
      console.log(`${scoreColor(symbols.bullet)} ${colors.primary(relativePath)} ${colors.muted(`(${validation.score}/100)`)}`);
      if (this.verbose) {
        printValidation(validation, true);
        console.log('');
      }
    }

    console.log('');

    const passing = validations.filter(v => v.score >= 60).length;
    const failing = validations.filter(v => v.score < 60).length;
    const avgScore = Math.round(validations.reduce((sum, v) => sum + v.score, 0) / validations.length);

    console.log(colors.muted('Summary:'));
    console.log(`  ${colors.muted('Total:')} ${validations.length}`);
    console.log(`  ${colors.success(symbols.success)} Passing (60+): ${passing}`);
    if (failing > 0) {
      console.log(`  ${colors.error(symbols.error)} Failing: ${failing}`);
    }
    console.log(`  ${colors.muted('Average score:')} ${avgScore}/100`);
    console.log('');

    if (failing > 0) {
      error(`${failing} SKILL.md file(s) below minimum standard`);
      return 1;
    }

    success('All SKILL.md files are compliant');
    return 0;
  }

  private findSkillMdFiles(dir: string): string[] {
    const results: string[] = [];
    const directFile = join(dir, 'SKILL.md');
    if (existsSync(directFile)) results.push(directFile);

    const searchDirs = [
      join(dir, 'skills'),
      join(dir, '.claude', 'skills'),
      join(dir, '.cursor', 'skills'),
      join(dir, '.codex', 'skills'),
      join(dir, '.github', 'skills'),
    ];

    for (const searchDir of searchDirs) {
      if (!existsSync(searchDir)) continue;
      this.scanDir(searchDir, results, 0);
    }

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const entrySkillMd = join(dir, entry.name, 'SKILL.md');
        if (existsSync(entrySkillMd) && !results.includes(entrySkillMd)) {
          results.push(entrySkillMd);
        }
      }
    } catch {
      // ignore read errors
    }

    return results;
  }

  private scanDir(dir: string, results: string[], depth: number): void {
    if (depth > 3) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = join(dir, entry.name);
        if (entry.isFile() && entry.name === 'SKILL.md') {
          if (!results.includes(entryPath)) results.push(entryPath);
        }
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.scanDir(entryPath, results, depth + 1);
        }
      }
    } catch {
      // ignore read errors
    }
  }
}
