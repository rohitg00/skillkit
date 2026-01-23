import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { AgentType } from '../../types.js';
import type {
  FormatTranslator,
  CanonicalSkill,
  TranslationResult,
  TranslationOptions,
  FormatCategory,
} from '../types.js';

/**
 * Agents that use the standard SKILL.md format
 */
const SKILL_MD_AGENTS: AgentType[] = [
  'claude-code',
  'codex',
  'gemini-cli',
  'opencode',
  'antigravity',
  'amp',
  'clawdbot',
  'droid',
  'goose',
  'kilo',
  'kiro-cli',
  'roo',
  'trae',
  'universal',
];

/**
 * Extract YAML frontmatter from markdown content
 */
function extractFrontmatter(content: string): { frontmatter: Record<string, unknown> | null; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)/);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  try {
    const frontmatter = parseYaml(match[1]) as Record<string, unknown>;
    return { frontmatter, body: match[2] || '' };
  } catch {
    return { frontmatter: null, body: content };
  }
}

/**
 * SKILL.md Format Translator
 *
 * This is the canonical format used by most AI coding agents.
 * Format:
 * ```
 * ---
 * name: skill-name
 * description: What it does
 * version: 1.0.0
 * tags: [tag1, tag2]
 * ---
 * # Instructions
 * Markdown content here...
 * ```
 */
export class SkillMdTranslator implements FormatTranslator {
  readonly format: FormatCategory = 'skill-md';
  readonly agents: AgentType[] = SKILL_MD_AGENTS;

  /**
   * Parse SKILL.md content into canonical format
   */
  parse(content: string, filename?: string): CanonicalSkill | null {
    const { frontmatter, body } = extractFrontmatter(content);

    if (!frontmatter) {
      // Try to infer from content if no frontmatter
      const nameMatch = content.match(/^#\s+(.+)$/m);
      const name = nameMatch
        ? nameMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : filename?.replace(/\.md$/i, '').replace(/^SKILL$/i, 'unnamed-skill') || 'unnamed-skill';

      return {
        name,
        description: 'Skill without frontmatter',
        content: body.trim(),
        sourceFormat: 'skill-md',
      };
    }

    const name = (frontmatter.name as string) || 'unnamed-skill';
    const description = (frontmatter.description as string) || 'No description';

    return {
      name,
      description,
      version: frontmatter.version as string | undefined,
      author: frontmatter.author as string | undefined,
      license: frontmatter.license as string | undefined,
      tags: frontmatter.tags as string[] | undefined,
      compatibility: frontmatter.compatibility as string | undefined,
      allowedTools: frontmatter['allowed-tools'] as string | undefined,
      metadata: frontmatter.metadata as Record<string, string> | undefined,
      content: body.trim(),
      sourceFormat: 'skill-md',
      sourceAgent: frontmatter.sourceAgent as AgentType | undefined,
      globs: frontmatter.globs as string[] | undefined,
      alwaysApply: frontmatter.alwaysApply as boolean | undefined,
      agentHints: frontmatter.agents as { optimized?: string[]; compatible?: string[] } | undefined,
    };
  }

  /**
   * Check if content is SKILL.md format
   */
  detect(content: string, filename?: string): boolean {
    // Check filename
    if (filename && /SKILL\.md$/i.test(filename)) {
      return true;
    }

    // Check for YAML frontmatter with expected fields
    const { frontmatter } = extractFrontmatter(content);
    if (frontmatter && ('name' in frontmatter || 'description' in frontmatter)) {
      return true;
    }

    return false;
  }

  /**
   * Generate SKILL.md content for target agent
   */
  generate(
    skill: CanonicalSkill,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    const warnings: string[] = [];
    const incompatible: string[] = [];

    // Build frontmatter object
    const frontmatter: Record<string, unknown> = {
      name: skill.name,
      description: skill.description,
    };

    // Add optional fields
    if (skill.version) frontmatter.version = skill.version;
    if (skill.author) frontmatter.author = skill.author;
    if (skill.license) frontmatter.license = skill.license;
    if (skill.tags?.length) frontmatter.tags = skill.tags;
    if (skill.compatibility) frontmatter.compatibility = skill.compatibility;
    if (skill.allowedTools) frontmatter['allowed-tools'] = skill.allowedTools;
    if (skill.metadata && Object.keys(skill.metadata).length > 0) {
      frontmatter.metadata = skill.metadata;
    }

    // Handle Cursor-specific fields (store for reverse translation)
    if (skill.globs?.length) {
      frontmatter.globs = skill.globs;
      warnings.push('Cursor globs preserved but may not be used by target agent');
    }
    if (skill.alwaysApply !== undefined) {
      frontmatter.alwaysApply = skill.alwaysApply;
      warnings.push('Cursor alwaysApply preserved but may not be used by target agent');
    }

    // Add translation metadata if requested
    if (options.addMetadata) {
      frontmatter.translatedFrom = skill.sourceFormat;
      frontmatter.translatedAt = new Date().toISOString();
      frontmatter.targetAgent = targetAgent;
    }

    // Generate YAML frontmatter
    const yamlContent = stringifyYaml(frontmatter, {
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
      defaultStringType: 'QUOTE_DOUBLE',
    }).trim();

    // Combine frontmatter and content
    const content = `---\n${yamlContent}\n---\n\n${skill.content}`;

    return {
      success: true,
      content,
      filename: this.getFilename(skill.name, targetAgent),
      warnings,
      incompatible,
      targetFormat: 'skill-md',
      targetAgent,
    };
  }

  /**
   * Get the expected filename for SKILL.md format
   */
  getFilename(_skillName: string, _targetAgent: AgentType): string {
    return 'SKILL.md';
  }
}

/**
 * Singleton instance
 */
export const skillMdTranslator = new SkillMdTranslator();
