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
 * Extract YAML frontmatter from MDC content
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
 * Infer glob patterns from skill content and tags
 */
function inferGlobs(skill: CanonicalSkill): string[] {
  const globs: string[] = [];
  const content = skill.content.toLowerCase();
  const tags = skill.tags || [];

  // Infer from tags
  const tagExtensions: Record<string, string[]> = {
    'react': ['**/*.tsx', '**/*.jsx'],
    'typescript': ['**/*.ts', '**/*.tsx'],
    'javascript': ['**/*.js', '**/*.jsx'],
    'python': ['**/*.py'],
    'rust': ['**/*.rs'],
    'go': ['**/*.go'],
    'css': ['**/*.css', '**/*.scss', '**/*.sass'],
    'html': ['**/*.html', '**/*.htm'],
    'vue': ['**/*.vue'],
    'svelte': ['**/*.svelte'],
    'angular': ['**/*.ts', '**/*.html'],
    'nextjs': ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
    'testing': ['**/*.test.*', '**/*.spec.*'],
    'api': ['**/api/**/*', '**/routes/**/*'],
  };

  for (const tag of tags) {
    const normalized = tag.toLowerCase();
    if (tagExtensions[normalized]) {
      globs.push(...tagExtensions[normalized]);
    }
  }

  // Infer from content mentions
  if (content.includes('component') || content.includes('jsx') || content.includes('tsx')) {
    if (!globs.includes('**/*.tsx')) globs.push('**/*.tsx');
    if (!globs.includes('**/*.jsx')) globs.push('**/*.jsx');
  }

  if (content.includes('.py') || content.includes('python')) {
    if (!globs.includes('**/*.py')) globs.push('**/*.py');
  }

  // Remove duplicates
  return [...new Set(globs)];
}

/**
 * Cursor MDC Format Translator
 *
 * Cursor uses two formats:
 * 1. .cursorrules - Global rules file in project root
 * 2. .cursor/rules/*.mdc - Individual rule files with frontmatter
 *
 * MDC Format:
 * ```
 * ---
 * description: What this rule does
 * globs: ["**\/*.tsx", "**\/*.jsx"]
 * alwaysApply: false
 * ---
 * Instructions here...
 * ```
 */
export class CursorTranslator implements FormatTranslator {
  readonly format: FormatCategory = 'cursor-mdc';
  readonly agents: AgentType[] = ['cursor'];

  /**
   * Parse Cursor MDC content into canonical format
   */
  parse(content: string, filename?: string): CanonicalSkill | null {
    const { frontmatter, body } = extractFrontmatter(content);

    // Extract name from filename
    let name = 'unnamed-skill';
    if (filename) {
      name = filename
        .replace(/\.(mdc|md|cursorrules)$/i, '')
        .replace(/^\./, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }

    if (!frontmatter) {
      // Plain .cursorrules file without frontmatter
      return {
        name,
        description: 'Cursor rules',
        content: body.trim(),
        sourceFormat: 'cursor-mdc',
        sourceAgent: 'cursor',
      };
    }

    const description = (frontmatter.description as string) || 'Cursor rule';

    return {
      name: (frontmatter.name as string) || name,
      description,
      content: body.trim(),
      sourceFormat: 'cursor-mdc',
      sourceAgent: 'cursor',
      globs: frontmatter.globs as string[] | undefined,
      alwaysApply: frontmatter.alwaysApply as boolean | undefined,
      tags: frontmatter.tags as string[] | undefined,
      version: frontmatter.version as string | undefined,
      author: frontmatter.author as string | undefined,
    };
  }

  /**
   * Check if content is Cursor MDC format
   */
  detect(content: string, filename?: string): boolean {
    // Check filename
    if (filename) {
      if (/\.mdc$/i.test(filename)) return true;
      if (/\.cursorrules$/i.test(filename)) return true;
      if (/cursorrules/i.test(filename)) return true;
    }

    // Check for MDC-specific frontmatter fields
    const { frontmatter } = extractFrontmatter(content);
    if (frontmatter) {
      if ('globs' in frontmatter || 'alwaysApply' in frontmatter) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate Cursor MDC content
   */
  generate(
    skill: CanonicalSkill,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    const warnings: string[] = [];
    const incompatible: string[] = [];

    // Build frontmatter
    const frontmatter: Record<string, unknown> = {
      description: skill.description,
    };

    // Handle globs
    let globs = options.globs || skill.globs;
    if (!globs?.length) {
      // Try to infer globs from skill metadata
      globs = inferGlobs(skill);
      if (globs.length > 0) {
        warnings.push(`Inferred glob patterns: ${globs.join(', ')}`);
      }
    }
    if (globs?.length) {
      frontmatter.globs = globs;
    }

    // Handle alwaysApply
    const alwaysApply = options.alwaysApply ?? skill.alwaysApply;
    if (alwaysApply !== undefined) {
      frontmatter.alwaysApply = alwaysApply;
    }

    // Note features that don't translate well
    if (skill.allowedTools) {
      incompatible.push('allowed-tools: Cursor does not support tool restrictions');
    }
    if (skill.compatibility) {
      // Add as comment in content
      warnings.push('compatibility info added as comment');
    }

    // Add translation metadata if requested
    if (options.addMetadata) {
      frontmatter.translatedFrom = skill.sourceFormat;
      frontmatter.originalName = skill.name;
    }

    // Generate YAML frontmatter
    const yamlContent = stringifyYaml(frontmatter, {
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
    }).trim();

    // Build content with optional compatibility note
    let body = skill.content;
    if (skill.compatibility && options.preserveComments !== false) {
      body = `<!-- Compatibility: ${skill.compatibility} -->\n\n${body}`;
    }

    const content = `---\n${yamlContent}\n---\n\n${body}`;

    return {
      success: true,
      content,
      filename: this.getFilename(skill.name, targetAgent),
      warnings,
      incompatible,
      targetFormat: 'cursor-mdc',
      targetAgent,
    };
  }

  /**
   * Generate .cursorrules content (alternative format)
   */
  generateCursorrules(skill: CanonicalSkill): string {
    // .cursorrules is just plain markdown without frontmatter
    let content = '';

    // Add header comment
    content += `# ${skill.name}\n`;
    content += `# ${skill.description}\n\n`;

    // Add main content
    content += skill.content;

    return content;
  }

  /**
   * Get the expected filename for Cursor format
   */
  getFilename(skillName: string, _targetAgent: AgentType): string {
    // Convert to valid MDC filename
    const safeName = skillName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${safeName}.mdc`;
  }
}

/**
 * Singleton instance
 */
export const cursorTranslator = new CursorTranslator();
