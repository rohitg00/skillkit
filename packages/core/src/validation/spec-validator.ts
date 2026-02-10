import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { stripFrontmatter } from '../parser/index.js';
import type { SpecValidationResult, SpecCheck, SpecValidationOptions } from './types.js';

const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SPEC_VERSION = '1.0';

export class SpecValidator {
  validate(skillPath: string, options?: SpecValidationOptions): SpecValidationResult {
    const checks: SpecCheck[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const skillMdPath = skillPath.endsWith('.md') ? skillPath : join(skillPath, 'SKILL.md');
    if (!existsSync(skillMdPath)) {
      errors.push(`SKILL.md not found at ${skillMdPath}`);
      return { valid: false, errors, warnings, specVersion: SPEC_VERSION, checks };
    }

    const raw = readFileSync(skillMdPath, 'utf-8');
    const { frontmatter, body } = stripFrontmatter(raw);

    const hasName = typeof frontmatter.name === 'string' && frontmatter.name.length > 0;
    checks.push({
      name: 'name-present',
      passed: hasName,
      message: hasName ? 'Name field is present' : 'Missing required "name" field in frontmatter',
      severity: hasName ? 'info' : 'error',
    });
    if (!hasName) errors.push('Missing required "name" field in frontmatter');

    const hasDescription = typeof frontmatter.description === 'string' && frontmatter.description.length > 0;
    checks.push({
      name: 'description-present',
      passed: hasDescription,
      message: hasDescription ? 'Description field is present' : 'Missing required "description" field in frontmatter',
      severity: hasDescription ? 'info' : 'error',
    });
    if (!hasDescription) errors.push('Missing required "description" field in frontmatter');

    if (hasName) {
      const nameStr = frontmatter.name as string;
      const nameValid = NAME_PATTERN.test(nameStr);
      checks.push({
        name: 'name-format',
        passed: nameValid,
        message: nameValid ? 'Name matches required pattern' : `Name "${nameStr}" does not match pattern: lowercase alphanumeric with hyphens`,
        severity: nameValid ? 'info' : 'error',
      });
      if (!nameValid) errors.push(`Name "${nameStr}" does not match pattern: lowercase alphanumeric with hyphens`);
    }

    if (options?.strict) {
      if (frontmatter.version !== undefined) {
        warnings.push('version should be under metadata.skillkit-version');
        checks.push({
          name: 'version-placement',
          passed: false,
          message: 'version should be under metadata.skillkit-version',
          severity: 'warning',
        });
      }

      if (frontmatter.author !== undefined) {
        warnings.push('author should be under metadata.skillkit-author');
        checks.push({
          name: 'author-placement',
          passed: false,
          message: 'author should be under metadata.skillkit-author',
          severity: 'warning',
        });
      }

      if (frontmatter.tags !== undefined) {
        warnings.push('tags should be under metadata.skillkit-tags');
        checks.push({
          name: 'tags-placement',
          passed: false,
          message: 'tags should be under metadata.skillkit-tags',
          severity: 'warning',
        });
      }

      if (frontmatter.agents !== undefined) {
        warnings.push('agents should be under metadata.skillkit-agents');
        checks.push({
          name: 'agents-placement',
          passed: false,
          message: 'agents should be under metadata.skillkit-agents',
          severity: 'warning',
        });
      }

      if (hasName) {
        const skillDir = skillPath.endsWith('.md') ? join(skillPath, '..') : skillPath;
        const dirName = basename(skillDir);
        const nameStr = frontmatter.name as string;
        const nameMatchesDir = nameStr === dirName;
        checks.push({
          name: 'name-directory-match',
          passed: nameMatchesDir,
          message: nameMatchesDir ? 'Name matches directory' : `Name "${nameStr}" does not match directory "${dirName}"`,
          severity: nameMatchesDir ? 'info' : 'warning',
        });
        if (!nameMatchesDir) warnings.push(`Name "${nameStr}" does not match directory "${dirName}"`);
      }

      const bodyLines = body.split('\n').length;
      const bodyWithinLimit = bodyLines <= 500;
      checks.push({
        name: 'body-length',
        passed: bodyWithinLimit,
        message: bodyWithinLimit ? `Body is ${bodyLines} lines` : `Body is ${bodyLines} lines (exceeds 500). Consider moving content to references/ directory`,
        severity: bodyWithinLimit ? 'info' : 'warning',
      });
      if (!bodyWithinLimit) warnings.push(`Body is ${bodyLines} lines (exceeds 500). Consider moving content to references/ directory`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      specVersion: SPEC_VERSION,
      checks,
    };
  }
}
