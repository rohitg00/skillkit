import { existsSync, readdirSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { Command, Option } from 'clipanion';
import {
  validateSkill,
  evaluateSkillFile,
  evaluateSkillDirectory,
  getQualityGrade,
  isHighQuality,
  findAllSkills,
  type QualityScore,
} from '@skillkit/core';
import { getSearchDirs } from '../helpers.js';
import {
  colors,
  symbols,
  spinner,
  success,
  warn,
  error,
  header,
} from '../onboarding/index.js';

function formatScore(score: number): string {
  if (score >= 80) return colors.success(`${score}`);
  if (score >= 60) return colors.warning(`${score}`);
  return colors.error(`${score}`);
}

function formatGrade(grade: string): string {
  switch (grade) {
    case 'A':
    case 'B':
      return colors.success(grade);
    case 'C':
    case 'D':
      return colors.warning(grade);
    default:
      return colors.error(grade);
  }
}

function printQualityReport(name: string, quality: QualityScore, verbose: boolean): void {
  const grade = getQualityGrade(quality.overall);
  const gradeDisplay = formatGrade(grade);
  const scoreDisplay = formatScore(quality.overall);

  console.log(`\n${colors.primary(name)}`);
  console.log(`  Grade: ${gradeDisplay}  Score: ${scoreDisplay}/100`);

  if (verbose) {
    console.log('');
    console.log(`  ${colors.muted('Structure:')} ${formatScore(quality.structure.score)}/100`);
    console.log(`    ${quality.structure.hasMetadata ? colors.success(symbols.success) : colors.error(symbols.error)} Metadata`);
    console.log(`    ${quality.structure.hasDescription ? colors.success(symbols.success) : colors.error(symbols.error)} Description`);
    console.log(`    ${quality.structure.hasTriggers ? colors.success(symbols.success) : colors.error(symbols.error)} Trigger conditions`);
    console.log(`    ${quality.structure.hasExamples ? colors.success(symbols.success) : colors.error(symbols.error)} Code examples`);
    console.log(`    ${quality.structure.hasBoundaries ? colors.success(symbols.success) : colors.error(symbols.error)} Boundaries defined`);

    console.log('');
    console.log(`  ${colors.muted('Clarity:')} ${formatScore(quality.clarity.score)}/100`);
    console.log(`    Lines: ${quality.clarity.lineCount}${quality.clarity.lineCount > 300 ? colors.warning(' (consider splitting)') : ''}`);
    console.log(`    Tokens: ${quality.clarity.tokenCount}${quality.clarity.tokenCount > 2000 ? colors.warning(' (high)') : ''}`);
    console.log(`    ${quality.clarity.hasHeaders ? colors.success(symbols.success) : colors.error(symbols.error)} Uses headers`);

    console.log('');
    console.log(`  ${colors.muted('Specificity:')} ${formatScore(quality.specificity.score)}/100`);
    console.log(`    ${quality.specificity.hasConcreteCommands ? colors.success(symbols.success) : colors.error(symbols.error)} Concrete commands`);
    console.log(`    ${quality.specificity.hasFilePatterns ? colors.success(symbols.success) : colors.error(symbols.error)} File patterns`);
    console.log(`    ${quality.specificity.hasCodeExamples ? colors.success(symbols.success) : colors.error(symbols.error)} Multiple code examples`);
    if (quality.specificity.vagueTermCount > 0) {
      console.log(`    ${colors.warning(symbols.warning)} ${quality.specificity.vagueTermCount} vague term(s)`);
    }
  }

  if (quality.warnings.length > 0) {
    console.log('');
    console.log(`  ${colors.warning('Warnings:')}`);
    for (const w of quality.warnings) {
      console.log(`    ${colors.warning(symbols.warning)} ${w}`);
    }
  }

  if (quality.suggestions.length > 0 && verbose) {
    console.log('');
    console.log(`  ${colors.muted('Suggestions:')}`);
    for (const s of quality.suggestions) {
      console.log(`    ${colors.muted(symbols.bullet)} ${s}`);
    }
  }
}

export class ValidateCommand extends Command {
  static override paths = [['validate']];

  static override usage = Command.Usage({
    description: 'Validate skill format and quality',
    details: `
      Validates skills against the specification and evaluates quality.
      Quality scores are based on structure, clarity, and specificity.
    `,
    examples: [
      ['Validate all installed skills', '$0 validate'],
      ['Validate specific skill', '$0 validate my-skill'],
      ['Validate skill file', '$0 validate ./path/to/SKILL.md'],
      ['Detailed quality report', '$0 validate --verbose'],
      ['Only show issues', '$0 validate --issues'],
      ['Quality check only', '$0 validate --quality'],
      ['JSON output', '$0 validate --json'],
    ],
  });

  targets = Option.Rest();

  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed quality breakdown',
  });

  quality = Option.Boolean('--quality,-q', false, {
    description: 'Only check quality (skip format validation)',
  });

  issues = Option.Boolean('--issues,-i', false, {
    description: 'Only show skills with issues',
  });

  minScore = Option.String('--min-score,-m', {
    description: 'Minimum acceptable score (default: 60)',
  });

  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  all = Option.Boolean('--all,-a', false, {
    description: 'Validate all skills in directory',
  });

  async execute(): Promise<number> {
    const minScore = this.minScore ? parseInt(this.minScore, 10) : 60;
    const results: Array<{ name: string; quality: QualityScore | null; formatValid: boolean; formatErrors: string[]; path?: string }> = [];

    if (this.targets.length > 0) {
      for (const target of this.targets) {
        const resolved = resolve(target);

        if (existsSync(resolved)) {
          if (this.all) {
            const entries = readdirSync(resolved, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory()) {
                const skillPath = join(resolved, entry.name);
                if (existsSync(join(skillPath, 'SKILL.md'))) {
                  const formatResult = this.quality ? { valid: true, errors: [] } : validateSkill(skillPath);
                  const quality = evaluateSkillDirectory(skillPath);
                  results.push({
                    name: entry.name,
                    quality,
                    formatValid: formatResult.valid,
                    formatErrors: formatResult.errors || [],
                    path: skillPath,
                  });
                }
              }
            }
          } else {
            const isFile = resolved.endsWith('.md') || resolved.endsWith('.mdc');
            const formatResult = this.quality ? { valid: true, errors: [] } : validateSkill(resolved);
            const quality = isFile ? evaluateSkillFile(resolved) : evaluateSkillDirectory(resolved);
            results.push({
              name: basename(target),
              quality,
              formatValid: formatResult.valid,
              formatErrors: formatResult.errors || [],
              path: resolved,
            });
          }
        } else {
          const searchDirs = getSearchDirs();
          const skills = findAllSkills(searchDirs);
          const found = skills.find(s => s.name === target);

          if (found) {
            const formatResult = this.quality ? { valid: true, errors: [] } : validateSkill(found.path);
            const quality = evaluateSkillDirectory(found.path);
            results.push({
              name: found.name,
              quality,
              formatValid: formatResult.valid,
              formatErrors: formatResult.errors || [],
              path: found.path,
            });
          } else {
            if (!this.json) {
              warn(`Skill not found: ${target}`);
            }
          }
        }
      }
    } else {
      const searchDirs = getSearchDirs();
      const skills = findAllSkills(searchDirs);

      if (skills.length === 0) {
        if (!this.json) {
          warn('No installed skills found');
        }
        return 0;
      }

      const s = spinner();
      if (!this.json) {
        s.start(`Evaluating ${skills.length} skill(s)...`);
      }

      for (const skill of skills) {
        const formatResult = this.quality ? { valid: true, errors: [] } : validateSkill(skill.path);
        const quality = evaluateSkillDirectory(skill.path);
        results.push({
          name: skill.name,
          quality,
          formatValid: formatResult.valid,
          formatErrors: formatResult.errors || [],
          path: skill.path,
        });
      }

      if (!this.json) {
        s.stop(`Evaluated ${results.length} skill(s)`);
      }
    }

    if (results.length === 0) {
      if (!this.json) {
        error('No skills to validate');
      }
      return 1;
    }

    if (this.json) {
      const output = results.map(r => ({
        name: r.name,
        path: r.path,
        formatValid: r.formatValid,
        formatErrors: r.formatErrors,
        score: r.quality?.overall ?? null,
        grade: r.quality ? getQualityGrade(r.quality.overall) : null,
        highQuality: r.quality ? isHighQuality(r.quality) : false,
        structure: r.quality?.structure ?? null,
        clarity: r.quality?.clarity ?? null,
        specificity: r.quality?.specificity ?? null,
        warnings: r.quality?.warnings ?? [],
        suggestions: r.quality?.suggestions ?? [],
      }));
      console.log(JSON.stringify(output, null, 2));
      return 0;
    }

    header('Skill Validation Report');

    let filteredResults = results;
    if (this.issues) {
      filteredResults = results.filter(r =>
        !r.formatValid ||
        (r.quality && r.quality.overall < minScore) ||
        (r.quality && r.quality.warnings.length > 0)
      );
    }

    filteredResults.sort((a, b) => (b.quality?.overall ?? 0) - (a.quality?.overall ?? 0));

    for (const { name, quality, formatValid, formatErrors } of filteredResults) {
      if (!formatValid) {
        console.log(`\n${colors.error(symbols.error)} ${colors.primary(name)}`);
        console.log(`  ${colors.error('Format validation failed:')}`);
        for (const err of formatErrors) {
          console.log(`    ${colors.error(symbols.bullet)} ${err}`);
        }
      }

      if (quality) {
        printQualityReport(name, quality, this.verbose);
      }
    }

    console.log('');

    const formatFailed = results.filter(r => !r.formatValid).length;
    const withQuality = results.filter(r => r.quality !== null);
    const highQuality = withQuality.filter(r => r.quality!.overall >= 80).length;
    const passing = withQuality.filter(r => r.quality!.overall >= minScore).length;
    const failing = withQuality.filter(r => r.quality!.overall < minScore).length;

    console.log(colors.muted('Summary:'));

    if (!this.quality) {
      console.log(`  ${formatFailed === 0 ? colors.success(symbols.success) : colors.error(symbols.error)} Format valid: ${results.length - formatFailed}/${results.length}`);
    }

    console.log(`  ${colors.success(symbols.success)} High quality (80+): ${highQuality}`);
    console.log(`  ${colors.primary(symbols.bullet)} Passing (${minScore}+): ${passing}`);

    if (failing > 0) {
      console.log(`  ${colors.error(symbols.error)} Below threshold: ${failing}`);
    }

    if (withQuality.length > 0) {
      const avgScore = Math.round(withQuality.reduce((sum, r) => sum + r.quality!.overall, 0) / withQuality.length);
      console.log(`  ${colors.muted('Average score:')} ${formatScore(avgScore)}/100`);
    }

    if (formatFailed > 0 || failing > 0) {
      console.log('');
      if (formatFailed > 0) {
        warn(`${formatFailed} skill(s) failed format validation`);
      }
      if (failing > 0) {
        warn(`${failing} skill(s) below quality threshold`);
      }
      return 1;
    }

    console.log('');
    success('All skills validated successfully');
    return 0;
  }
}
