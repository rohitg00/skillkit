/**
 * Skill to Subagent Converter
 *
 * Converts SkillKit skills into Claude Code native subagent format (.md files).
 * Supports both reference mode (skills: [skill-name]) and inline mode (embedded content).
 */

import type { Skill, SkillFrontmatter } from '../types.js';
import type { CanonicalAgent, AgentPermissionMode } from './types.js';
import { extractFrontmatter, readSkillContent } from '../skills.js';

/**
 * Options for skill-to-subagent conversion
 */
export interface SkillToSubagentOptions {
  /** Embed full skill content in system prompt (default: false - use skills reference) */
  inline?: boolean;
  /** Model to use (sonnet, opus, haiku, inherit) */
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  /** Permission mode for the agent */
  permissionMode?: AgentPermissionMode;
  /** Tools the agent is allowed to use */
  tools?: string[];
  /** Tools the agent cannot use */
  disallowedTools?: string[];
}

/**
 * Convert a skill to a CanonicalAgent representation
 */
export function skillToSubagent(
  skill: Skill,
  skillContent: string,
  options?: SkillToSubagentOptions
): CanonicalAgent {
  const frontmatter = extractFrontmatter(skillContent) as Partial<SkillFrontmatter> | null;
  const inline = options?.inline ?? false;

  const allowedTools = parseAllowedTools(frontmatter, options?.tools);
  const content = inline
    ? generateInlineContent(skill, skillContent)
    : generateReferenceContent(skill, frontmatter);

  return {
    name: skill.name,
    description: skill.description,
    model: options?.model === 'inherit' ? undefined : options?.model,
    permissionMode: options?.permissionMode,
    disallowedTools: options?.disallowedTools,
    allowedTools,
    skills: inline ? undefined : [skill.name],
    content,
    sourceFormat: 'claude-agent',
    sourceAgent: 'claude-code',
    version: frontmatter?.version,
    author: frontmatter?.author,
    tags: frontmatter?.tags,
    userInvocable: true,
  };
}

/**
 * Generate the markdown content for a Claude Code subagent from a skill
 */
export function generateSubagentFromSkill(
  skill: Skill,
  skillContent: string,
  options?: SkillToSubagentOptions
): string {
  const canonical = skillToSubagent(skill, skillContent, options);
  return generateSubagentMarkdown(canonical, options?.inline ?? false);
}

/**
 * Parse allowed-tools from skill frontmatter
 * Handles both string (comma or space-separated) and array formats
 */
function parseAllowedTools(
  frontmatter: Partial<SkillFrontmatter> | null,
  optionTools?: string[]
): string[] | undefined {
  if (optionTools && optionTools.length > 0) {
    return optionTools;
  }

  const allowedTools = frontmatter?.['allowed-tools'];
  if (!allowedTools) {
    return undefined;
  }

  if (Array.isArray(allowedTools)) {
    const result = allowedTools
      .map(t => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean);
    return result.length > 0 ? result : undefined;
  }

  if (typeof allowedTools === 'string') {
    const result = allowedTools
      .split(/[,\s]+/)
      .map(t => t.trim())
      .filter(Boolean);
    return result.length > 0 ? result : undefined;
  }

  return undefined;
}

/**
 * Generate inline content (full skill embedded)
 */
function generateInlineContent(skill: Skill, skillContent: string): string {
  const bodyContent = extractBodyContent(skillContent);

  const lines: string[] = [];
  lines.push(`# ${formatAgentName(skill.name)}`);
  lines.push('');
  lines.push('You are a specialized assistant powered by the following skill.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(bodyContent.trim());

  return lines.join('\n');
}

/**
 * Generate reference content (skill referenced by name)
 */
function generateReferenceContent(
  skill: Skill,
  frontmatter: Partial<SkillFrontmatter> | null
): string {
  const lines: string[] = [];
  lines.push(`# ${formatAgentName(skill.name)}`);
  lines.push('');
  lines.push(`You are a specialized assistant that uses the "${skill.name}" skill.`);
  lines.push('');
  lines.push('## Skill Description');
  lines.push('');
  lines.push(skill.description);
  lines.push('');
  lines.push('## Usage');
  lines.push('');
  lines.push(`This agent automatically loads the "${skill.name}" skill.`);
  lines.push('Follow the skill instructions to complete tasks effectively.');

  if (frontmatter?.tags && frontmatter.tags.length > 0) {
    lines.push('');
    lines.push('## Related Topics');
    lines.push('');
    lines.push(frontmatter.tags.map(t => `- ${t}`).join('\n'));
  }

  return lines.join('\n');
}

/**
 * Generate full subagent markdown file content
 */
function generateSubagentMarkdown(
  canonical: CanonicalAgent,
  isInline: boolean
): string {
  const lines: string[] = ['---'];

  lines.push(`name: ${escapeYamlString(canonical.name)}`);
  lines.push(`description: ${escapeYamlString(canonical.description)}`);

  if (canonical.model) {
    lines.push(`model: ${canonical.model}`);
  }
  if (canonical.permissionMode) {
    lines.push(`permissionMode: ${canonical.permissionMode}`);
  }

  appendYamlList(lines, 'tools', canonical.allowedTools);
  appendYamlList(lines, 'disallowedTools', canonical.disallowedTools);

  if (!isInline) {
    appendYamlList(lines, 'skills', canonical.skills);
  }

  if (canonical.version) {
    lines.push(`version: "${canonical.version}"`);
  }
  if (canonical.author) {
    lines.push(`author: ${escapeYamlString(canonical.author)}`);
  }
  if (canonical.tags && canonical.tags.length > 0) {
    lines.push(`tags: [${canonical.tags.map(t => escapeYamlString(t)).join(', ')}]`);
  }
  if (canonical.userInvocable !== undefined) {
    lines.push(`user-invocable: ${canonical.userInvocable}`);
  }

  lines.push('---', '', canonical.content);

  return lines.join('\n');
}

function appendYamlList(lines: string[], key: string, items?: string[]): void {
  if (!items || items.length === 0) return;
  lines.push(`${key}:`);
  for (const item of items) {
    lines.push(`  - ${escapeYamlString(item)}`);
  }
}

/**
 * Extract body content from skill markdown (without frontmatter)
 * Handles both Unix (LF) and Windows (CRLF) line endings
 */
function extractBodyContent(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
  if (match) {
    return match[1];
  }
  return content;
}

/**
 * Format agent name for display (kebab-case to Title Case)
 */
function formatAgentName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape special characters in YAML strings
 */
function escapeYamlString(str: string): string {
  if (/[:\{\}\[\],&*#?|\-<>=!%@`]/.test(str) || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return str;
}

/**
 * Load a skill and generate subagent content
 * Convenience function that reads skill content and generates subagent markdown
 */
export function loadAndConvertSkill(
  skill: Skill,
  options?: SkillToSubagentOptions
): { success: boolean; content?: string; error?: string } {
  const skillContent = readSkillContent(skill.path);

  if (!skillContent) {
    return {
      success: false,
      error: `Could not read skill content from: ${skill.path}`,
    };
  }

  try {
    const content = generateSubagentFromSkill(skill, skillContent, options);
    return { success: true, content };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
