// Types
export {
  type FormatCategory,
  type CanonicalSkill,
  type TranslationResult,
  type TranslationOptions,
  type FormatTranslator,
  type TranslationPath,
  type TranslatableSkillFrontmatter,
  AGENT_FORMAT_MAP,
} from './types.js';

// Format translators
export {
  SkillMdTranslator,
  skillMdTranslator,
  CursorTranslator,
  cursorTranslator,
  WindsurfTranslator,
  windsurfTranslator,
  CopilotTranslator,
  copilotTranslator,
} from './formats/index.js';

// Registry
export { TranslatorRegistry, translatorRegistry } from './registry.js';

// Convenience functions
import { translatorRegistry } from './registry.js';
import type { AgentType } from '../types.js';
import type { CanonicalSkill, TranslationResult, TranslationOptions } from './types.js';

/**
 * Translate skill content from one agent format to another
 *
 * @example
 * ```ts
 * import { translateSkill } from '@skillkit/core';
 *
 * const result = translateSkill(skillMdContent, 'cursor');
 * console.log(result.content); // Cursor MDC format
 * ```
 */
export function translateSkill(
  content: string,
  targetAgent: AgentType,
  options?: TranslationOptions & { sourceFilename?: string }
): TranslationResult {
  return translatorRegistry.translateContent(content, targetAgent, options);
}

/**
 * Translate a skill file to target agent format
 *
 * @example
 * ```ts
 * import { translateSkillFile } from '@skillkit/core';
 *
 * const result = translateSkillFile('./skills/my-skill/SKILL.md', 'cursor');
 * console.log(result.filename); // 'my-skill.mdc'
 * ```
 */
export function translateSkillFile(
  sourcePath: string,
  targetAgent: AgentType,
  options?: TranslationOptions
): TranslationResult {
  return translatorRegistry.translateFile(sourcePath, targetAgent, options);
}

/**
 * Parse skill content into canonical format
 *
 * @example
 * ```ts
 * import { parseSkillContent } from '@skillkit/core';
 *
 * const skill = parseSkillContent(cursorMdcContent, 'my-rule.mdc');
 * console.log(skill.name); // 'my-rule'
 * ```
 */
export function parseSkillContent(content: string, filename?: string): CanonicalSkill | null {
  return translatorRegistry.parse(content, filename);
}

/**
 * Detect the format of skill content
 *
 * @example
 * ```ts
 * import { detectSkillFormat } from '@skillkit/core';
 *
 * const format = detectSkillFormat(content, 'SKILL.md');
 * console.log(format); // 'skill-md'
 * ```
 */
export function detectSkillFormat(content: string, filename?: string): string | null {
  return translatorRegistry.detectFormat(content, filename);
}

/**
 * Get all supported agent types for translation
 */
export function getSupportedTranslationAgents(): AgentType[] {
  return translatorRegistry.getSupportedAgents();
}

/**
 * Check if translation is possible between two agents
 */
export function canTranslate(from: AgentType, to: AgentType): boolean {
  return translatorRegistry.canTranslate(from, to);
}
