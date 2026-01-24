/**
 * Methodology Validator
 *
 * Validates methodology packs and skills for correctness and completeness.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type {
  MethodologyPack,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types.js';

/**
 * Validates a methodology pack manifest
 */
export function validatePackManifest(pack: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Type check
  if (!pack || typeof pack !== 'object') {
    errors.push({
      code: 'INVALID_TYPE',
      message: 'Pack manifest must be an object',
    });
    return { valid: false, errors, warnings };
  }

  const p = pack as Record<string, unknown>;

  // Required fields
  if (!p.name || typeof p.name !== 'string') {
    errors.push({
      code: 'MISSING_NAME',
      message: 'Pack must have a "name" field (string)',
    });
  } else if (!/^[a-z][a-z0-9-]*$/.test(p.name)) {
    errors.push({
      code: 'INVALID_NAME',
      message: 'Pack name must be lowercase, start with a letter, and contain only a-z, 0-9, and hyphens',
    });
  }

  if (!p.version || typeof p.version !== 'string') {
    errors.push({
      code: 'MISSING_VERSION',
      message: 'Pack must have a "version" field (string)',
    });
  } else if (!/^\d+\.\d+\.\d+/.test(p.version)) {
    errors.push({
      code: 'INVALID_VERSION',
      message: 'Pack version must follow semver (e.g., "1.0.0")',
    });
  }

  if (!p.description || typeof p.description !== 'string') {
    errors.push({
      code: 'MISSING_DESCRIPTION',
      message: 'Pack must have a "description" field (string)',
    });
  } else if (p.description.length < 10) {
    warnings.push({
      code: 'SHORT_DESCRIPTION',
      message: 'Pack description should be at least 10 characters',
      recommendation: 'Add a more detailed description to help users understand the pack',
    });
  }

  if (!p.skills || !Array.isArray(p.skills)) {
    errors.push({
      code: 'MISSING_SKILLS',
      message: 'Pack must have a "skills" array',
    });
  } else if (p.skills.length === 0) {
    errors.push({
      code: 'EMPTY_SKILLS',
      message: 'Pack must contain at least one skill',
    });
  } else {
    for (const skill of p.skills) {
      if (typeof skill !== 'string') {
        errors.push({
          code: 'INVALID_SKILL_ENTRY',
          message: `Skill entries must be strings, found: ${typeof skill}`,
        });
      }
    }
  }

  if (!p.tags || !Array.isArray(p.tags)) {
    warnings.push({
      code: 'MISSING_TAGS',
      message: 'Pack should have a "tags" array for better discoverability',
      recommendation: 'Add relevant tags like "tdd", "testing", "debugging"',
    });
  }

  if (!p.compatibility || !Array.isArray(p.compatibility)) {
    warnings.push({
      code: 'MISSING_COMPATIBILITY',
      message: 'Pack should specify agent compatibility',
      recommendation: 'Add "compatibility": ["all"] for universal support',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates SKILL.md content
 */
export function validateSkillContent(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!content || content.trim().length === 0) {
    errors.push({
      code: 'EMPTY_CONTENT',
      message: 'Skill content cannot be empty',
    });
    return { valid: false, errors, warnings };
  }

  const lines = content.split('\n');

  // Check for frontmatter
  const hasFrontmatter = lines[0] === '---';
  if (hasFrontmatter) {
    const frontmatterEnd = lines.slice(1).findIndex((l) => l === '---');
    if (frontmatterEnd === -1) {
      errors.push({
        code: 'UNCLOSED_FRONTMATTER',
        message: 'Frontmatter opened but not closed',
        line: 1,
      });
    }
  } else {
    warnings.push({
      code: 'NO_FRONTMATTER',
      message: 'Skill should have YAML frontmatter with metadata',
      recommendation: 'Add frontmatter with triggers, tags, and description',
    });
  }

  // Check for required sections
  const hasDescription = /^#+\s*(Description|Overview)/im.test(content);
  const hasInstructions = /^#+\s*(Instructions|Workflow|Steps|Process)/im.test(content);

  if (!hasDescription && !hasInstructions) {
    warnings.push({
      code: 'MISSING_STRUCTURE',
      message: 'Skill should have clear sections (Description, Instructions)',
      recommendation: 'Structure skill with ## Description and ## Instructions sections',
    });
  }

  // Check minimum content length
  const contentWithoutFrontmatter = content
    .replace(/^---[\s\S]*?---/, '')
    .trim();
  if (contentWithoutFrontmatter.length < 100) {
    warnings.push({
      code: 'SHORT_CONTENT',
      message: 'Skill content seems brief',
      recommendation: 'Provide detailed instructions for AI agents to follow',
    });
  }

  // Check for actionable instructions
  const hasActionableContent =
    /\b(must|should|always|never|do not|ensure|verify|check|create|implement)\b/i.test(
      content
    );
  if (!hasActionableContent) {
    warnings.push({
      code: 'NO_ACTIONABLE_CONTENT',
      message: 'Skill may lack clear actionable instructions',
      recommendation: 'Include directive language (must, should, always, never) for AI agents',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a pack directory structure
 */
export function validatePackDirectory(packPath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check directory exists
  if (!existsSync(packPath)) {
    errors.push({
      code: 'DIR_NOT_FOUND',
      message: `Pack directory not found: ${packPath}`,
    });
    return { valid: false, errors, warnings };
  }

  // Check pack.json exists
  const manifestPath = join(packPath, 'pack.json');
  if (!existsSync(manifestPath)) {
    errors.push({
      code: 'MANIFEST_NOT_FOUND',
      message: 'Pack must have a pack.json manifest',
      path: manifestPath,
    });
    return { valid: false, errors, warnings };
  }

  // Validate manifest
  let manifest: MethodologyPack;
  try {
    const raw = readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(raw);
    const manifestResult = validatePackManifest(manifest);
    errors.push(...manifestResult.errors);
    warnings.push(...manifestResult.warnings);
  } catch (e) {
    errors.push({
      code: 'INVALID_MANIFEST',
      message: `Failed to parse pack.json: ${e instanceof Error ? e.message : 'Unknown error'}`,
      path: manifestPath,
    });
    return { valid: false, errors, warnings };
  }

  // Check skill directories
  if (manifest.skills) {
    for (const skillName of manifest.skills) {
      const skillDir = join(packPath, skillName);

      if (!existsSync(skillDir)) {
        errors.push({
          code: 'SKILL_DIR_NOT_FOUND',
          message: `Skill directory not found: ${skillName}`,
          path: skillDir,
        });
        continue;
      }

      if (!statSync(skillDir).isDirectory()) {
        errors.push({
          code: 'SKILL_NOT_DIRECTORY',
          message: `Skill must be a directory: ${skillName}`,
          path: skillDir,
        });
        continue;
      }

      // Check SKILL.md exists
      const skillFile = join(skillDir, 'SKILL.md');
      if (!existsSync(skillFile)) {
        errors.push({
          code: 'SKILL_FILE_NOT_FOUND',
          message: `Skill must have a SKILL.md file: ${skillName}`,
          path: skillFile,
        });
        continue;
      }

      // Validate skill content
      const skillContent = readFileSync(skillFile, 'utf-8');
      const skillResult = validateSkillContent(skillContent);
      for (const err of skillResult.errors) {
        errors.push({
          ...err,
          path: skillFile,
        });
      }
      for (const warn of skillResult.warnings) {
        warnings.push({
          ...warn,
          code: `${skillName}:${warn.code}`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates all built-in packs
 */
export function validateBuiltinPacks(packsDir: string): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  if (!existsSync(packsDir)) {
    return results;
  }

  const packDirs = readdirSync(packsDir).filter((name) => {
    const packPath = join(packsDir, name);
    return statSync(packPath).isDirectory();
  });

  for (const packName of packDirs) {
    const packPath = join(packsDir, packName);
    results.set(packName, validatePackDirectory(packPath));
  }

  return results;
}

/**
 * Extract skill metadata from SKILL.md frontmatter
 */
export function extractSkillMetadata(content: string): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  const lines = content.split('\n');
  if (lines[0] !== '---') {
    return metadata;
  }

  const frontmatterEnd = lines.slice(1).findIndex((l) => l === '---');
  if (frontmatterEnd === -1) {
    return metadata;
  }

  const frontmatterLines = lines.slice(1, frontmatterEnd + 1);
  let currentKey: string | null = null;
  let currentArrayValues: string[] = [];
  let inArray = false;

  for (const line of frontmatterLines) {
    // Handle array items
    if (inArray && line.startsWith('  - ')) {
      currentArrayValues.push(line.slice(4).trim());
      continue;
    }

    // Close array
    if (inArray && !line.startsWith('  - ')) {
      if (currentKey) {
        metadata[currentKey] = currentArrayValues;
      }
      inArray = false;
      currentArrayValues = [];
      currentKey = null;
    }

    // Key: value pairs
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (value.trim() === '') {
        // Start of array
        currentKey = key;
        inArray = true;
        currentArrayValues = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        metadata[key] = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
      } else if (value === 'true' || value === 'false') {
        metadata[key] = value === 'true';
      } else if (/^\d+$/.test(value)) {
        metadata[key] = parseInt(value, 10);
      } else {
        metadata[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  // Handle final array
  if (inArray && currentKey) {
    metadata[currentKey] = currentArrayValues;
  }

  return metadata;
}
