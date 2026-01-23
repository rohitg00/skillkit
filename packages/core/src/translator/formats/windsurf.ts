import type { AgentType } from '../../types.js';
import type {
  FormatTranslator,
  CanonicalSkill,
  TranslationResult,
  TranslationOptions,
  FormatCategory,
} from '../types.js';

/**
 * Parse metadata from markdown comments
 */
function parseMetadataComments(content: string): { metadata: Record<string, string>; body: string } {
  const metadata: Record<string, string> = {};
  const lines = content.split('\n');
  const bodyLines: string[] = [];
  let inMetadata = true;

  for (const line of lines) {
    if (inMetadata) {
      const match = line.match(/^<!--\s*(\w+):\s*(.+?)\s*-->$/);
      if (match) {
        metadata[match[1].toLowerCase()] = match[2];
        continue;
      }
      // Stop parsing metadata on first non-comment, non-empty line
      if (line.trim() && !line.startsWith('<!--')) {
        inMetadata = false;
      }
    }
    bodyLines.push(line);
  }

  return {
    metadata,
    body: bodyLines.join('\n').trim(),
  };
}

/**
 * Windsurf Rules Format Translator
 *
 * Windsurf uses plain markdown files (.windsurfrules) without YAML frontmatter.
 * Metadata can be embedded in HTML comments at the top.
 *
 * Format:
 * ```
 * <!-- name: skill-name -->
 * <!-- description: What it does -->
 *
 * # Guidelines
 *
 * Instructions here...
 * ```
 */
export class WindsurfTranslator implements FormatTranslator {
  readonly format: FormatCategory = 'markdown-rules';
  readonly agents: AgentType[] = ['windsurf'];

  /**
   * Parse Windsurf rules content into canonical format
   */
  parse(content: string, filename?: string): CanonicalSkill | null {
    const { metadata, body } = parseMetadataComments(content);

    // Try to extract name from first heading if not in metadata
    let name = metadata.name;
    if (!name) {
      const headingMatch = body.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        name = headingMatch[1]
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      } else if (filename) {
        name = filename
          .replace(/\.(windsurfrules|md)$/i, '')
          .replace(/^\./, '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      } else {
        name = 'unnamed-skill';
      }
    }

    // Try to extract description from metadata or first paragraph
    let description = metadata.description;
    if (!description) {
      // Get first non-heading paragraph
      const paragraphMatch = body.match(/^(?!#)[^\n]+/m);
      if (paragraphMatch) {
        description = paragraphMatch[0].substring(0, 200);
        if (description.length === 200) description += '...';
      } else {
        description = 'Windsurf rules';
      }
    }

    return {
      name,
      description,
      content: body,
      sourceFormat: 'markdown-rules',
      sourceAgent: 'windsurf',
      version: metadata.version,
      author: metadata.author,
      tags: metadata.tags?.split(',').map((t) => t.trim()),
    };
  }

  /**
   * Check if content is Windsurf format
   */
  detect(content: string, filename?: string): boolean {
    // Check filename
    if (filename) {
      if (/\.windsurfrules$/i.test(filename)) return true;
      if (/windsurfrules/i.test(filename)) return true;
    }

    // Check for metadata comments
    if (content.startsWith('<!--') && content.includes('-->')) {
      const { metadata } = parseMetadataComments(content);
      if (Object.keys(metadata).length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate Windsurf rules content
   */
  generate(
    skill: CanonicalSkill,
    targetAgent: AgentType,
    options: TranslationOptions = {}
  ): TranslationResult {
    const warnings: string[] = [];
    const incompatible: string[] = [];
    const lines: string[] = [];

    // Add metadata as HTML comments
    if (options.addMetadata !== false) {
      lines.push(`<!-- name: ${skill.name} -->`);
      lines.push(`<!-- description: ${skill.description} -->`);
      if (skill.version) lines.push(`<!-- version: ${skill.version} -->`);
      if (skill.author) lines.push(`<!-- author: ${skill.author} -->`);
      if (skill.tags?.length) lines.push(`<!-- tags: ${skill.tags.join(', ')} -->`);
      if (options.addMetadata) {
        lines.push(`<!-- translatedFrom: ${skill.sourceFormat} -->`);
        lines.push(`<!-- translatedAt: ${new Date().toISOString()} -->`);
      }
      lines.push('');
    }

    // Note incompatible features
    if (skill.globs?.length) {
      incompatible.push('globs: Windsurf does not support file pattern matching');
    }
    if (skill.alwaysApply !== undefined) {
      incompatible.push('alwaysApply: Windsurf does not support conditional application');
    }
    if (skill.allowedTools) {
      incompatible.push('allowed-tools: Windsurf does not support tool restrictions');
    }

    // Add main content
    lines.push(skill.content);

    return {
      success: true,
      content: lines.join('\n'),
      filename: this.getFilename(skill.name, targetAgent),
      warnings,
      incompatible,
      targetFormat: 'markdown-rules',
      targetAgent,
    };
  }

  /**
   * Get the expected filename for Windsurf format
   */
  getFilename(_skillName: string, _targetAgent: AgentType): string {
    return '.windsurfrules';
  }
}

/**
 * Singleton instance
 */
export const windsurfTranslator = new WindsurfTranslator();
