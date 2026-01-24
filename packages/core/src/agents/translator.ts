/**
 * Agent Translator
 *
 * Translates agent definitions between different AI coding agent formats.
 */

import {
  type CanonicalAgent,
  type AgentFormatCategory,
  type AgentTranslationResult,
  type AgentTranslationOptions,
  type CustomAgent,
  CUSTOM_AGENT_FORMAT_MAP,
  AGENT_DISCOVERY_PATHS,
} from './types.js';
import { toCanonicalAgent, fromCanonicalAgent } from './parser.js';
import type { AgentType } from '../types.js';
import { join } from 'node:path';

/**
 * Translate an agent to a target AI coding agent format
 */
export function translateAgent(
  agent: CustomAgent,
  targetAgent: AgentType,
  options?: AgentTranslationOptions
): AgentTranslationResult {
  const canonical = toCanonicalAgent(agent);
  return translateCanonicalAgent(canonical, targetAgent, options);
}

/**
 * Translate a canonical agent to a target format
 */
export function translateCanonicalAgent(
  canonical: CanonicalAgent,
  targetAgent: AgentType,
  options?: AgentTranslationOptions
): AgentTranslationResult {
  const targetFormat = CUSTOM_AGENT_FORMAT_MAP[targetAgent];
  const warnings: string[] = [];
  const incompatible: string[] = [];

  // Track incompatible features
  if (targetFormat === 'universal') {
    // Universal format has limited support
    if (canonical.hooks && canonical.hooks.length > 0) {
      incompatible.push('hooks (not supported in universal format)');
    }
    if (canonical.permissionMode) {
      incompatible.push('permissionMode (not supported in universal format)');
    }
  }

  if (targetFormat === 'cursor-agent') {
    // Cursor may have different hook syntax
    if (canonical.hooks && canonical.hooks.length > 0) {
      warnings.push('Hooks may require manual adjustment for Cursor');
    }
  }

  // Generate content based on target format
  let content: string;

  switch (targetFormat) {
    case 'claude-agent':
      content = generateClaudeAgent(canonical, options);
      break;
    case 'cursor-agent':
      content = generateCursorAgent(canonical, options);
      break;
    case 'universal':
      content = generateUniversalAgent(canonical, options);
      break;
    default:
      content = fromCanonicalAgent(canonical, targetFormat);
  }

  // Determine filename
  const filename = options?.outputFilename || getAgentFilename(canonical.name, targetAgent);

  return {
    success: true,
    content,
    filename,
    warnings,
    incompatible,
    targetFormat,
    targetAgent,
  };
}

/**
 * Translate agent content directly
 */
export function translateAgentContent(
  content: string,
  _sourceAgent: AgentType,
  targetAgent: AgentType,
  options?: AgentTranslationOptions
): AgentTranslationResult {
  // Note: _sourceAgent reserved for future format-specific parsing
  const agent = parseAgentFromContent(content);

  if (!agent) {
    return {
      success: false,
      content: '',
      filename: '',
      warnings: ['Failed to parse agent content'],
      incompatible: [],
      targetFormat: CUSTOM_AGENT_FORMAT_MAP[targetAgent],
      targetAgent,
    };
  }

  return translateAgent(agent, targetAgent, options);
}

/**
 * Parse agent from raw content
 */
function parseAgentFromContent(content: string): CustomAgent | null {
  const { extractAgentFrontmatter, extractAgentContent } = require('./parser.js');
  const { AgentFrontmatter } = require('./types.js');

  const rawFrontmatter = extractAgentFrontmatter(content);
  const agentContent = extractAgentContent(content);

  if (!rawFrontmatter) {
    return null;
  }

  const parsed = AgentFrontmatter.safeParse(rawFrontmatter);
  const frontmatter = parsed.success ? parsed.data : {
    name: (rawFrontmatter.name as string) || 'unnamed-agent',
    description: (rawFrontmatter.description as string) || 'No description',
    ...rawFrontmatter,
  };

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    path: '',
    location: 'project',
    frontmatter,
    content: agentContent,
    enabled: true,
  };
}

/**
 * Generate Claude Code agent format
 */
function generateClaudeAgent(
  canonical: CanonicalAgent,
  options?: AgentTranslationOptions
): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push(`name: ${canonical.name}`);
  lines.push(`description: ${escapeYamlString(canonical.description)}`);

  if (canonical.model) {
    lines.push(`model: ${canonical.model}`);
  }

  if (canonical.permissionMode) {
    lines.push(`permissionMode: ${canonical.permissionMode}`);
  }

  if (canonical.disallowedTools && canonical.disallowedTools.length > 0) {
    lines.push('disallowedTools:');
    for (const tool of canonical.disallowedTools) {
      lines.push(`  - ${tool}`);
    }
  }

  if (canonical.allowedTools && canonical.allowedTools.length > 0) {
    lines.push('allowed-tools:');
    for (const tool of canonical.allowedTools) {
      lines.push(`  - ${tool}`);
    }
  }

  if (canonical.hooks && canonical.hooks.length > 0) {
    lines.push('hooks:');
    for (const hook of canonical.hooks) {
      lines.push(`  - type: ${hook.type}`);
      lines.push(`    command: "${escapeYamlString(hook.command)}"`);
      if (hook.timeout) lines.push(`    timeout: ${hook.timeout}`);
      if (hook.once) lines.push(`    once: true`);
      if (hook.matcher) lines.push(`    matcher: "${hook.matcher}"`);
    }
  }

  if (canonical.skills && canonical.skills.length > 0) {
    lines.push('skills:');
    for (const skill of canonical.skills) {
      lines.push(`  - ${skill}`);
    }
  }

  if (canonical.context) {
    lines.push(`context: ${canonical.context}`);
  }

  if (canonical.version) {
    lines.push(`version: "${canonical.version}"`);
  }

  if (canonical.author) {
    lines.push(`author: ${canonical.author}`);
  }

  if (canonical.tags && canonical.tags.length > 0) {
    lines.push(`tags: [${canonical.tags.join(', ')}]`);
  }

  if (canonical.userInvocable !== undefined) {
    lines.push(`user-invocable: ${canonical.userInvocable}`);
  }

  if (canonical.argumentHint) {
    lines.push(`argument-hint: "${escapeYamlString(canonical.argumentHint)}"`);
  }

  if (options?.addMetadata) {
    lines.push(`# Translated by SkillKit from ${canonical.sourceAgent || 'unknown'}`);
  }

  lines.push('---');
  lines.push('');

  // Content
  lines.push(canonical.content);

  return lines.join('\n');
}

/**
 * Generate Cursor agent format
 */
function generateCursorAgent(
  canonical: CanonicalAgent,
  options?: AgentTranslationOptions
): string {
  const lines: string[] = [];

  // Cursor uses .mdc format for rules, but agents might be markdown
  lines.push('---');
  lines.push(`name: ${canonical.name}`);
  lines.push(`description: ${escapeYamlString(canonical.description)}`);

  if (canonical.model) {
    lines.push(`model: ${canonical.model}`);
  }

  // Cursor-specific: may use different permission syntax
  if (canonical.allowedTools && canonical.allowedTools.length > 0) {
    lines.push(`tools: [${canonical.allowedTools.join(', ')}]`);
  }

  if (canonical.version) {
    lines.push(`version: "${canonical.version}"`);
  }

  if (canonical.tags && canonical.tags.length > 0) {
    lines.push(`tags: [${canonical.tags.join(', ')}]`);
  }

  if (options?.addMetadata) {
    lines.push(`# Translated by SkillKit from ${canonical.sourceAgent || 'unknown'}`);
  }

  lines.push('---');
  lines.push('');

  // Content
  lines.push(canonical.content);

  // Add note about incompatible features
  if (canonical.hooks && canonical.hooks.length > 0) {
    lines.push('');
    lines.push('<!-- Note: Hooks from original agent may need manual configuration -->');
  }

  return lines.join('\n');
}

/**
 * Generate universal agent format
 */
function generateUniversalAgent(
  canonical: CanonicalAgent,
  options?: AgentTranslationOptions
): string {
  const lines: string[] = [];

  // Universal format: simplified, portable
  lines.push('---');
  lines.push(`name: ${canonical.name}`);
  lines.push(`description: ${escapeYamlString(canonical.description)}`);

  if (canonical.model) {
    lines.push(`model: ${canonical.model}`);
  }

  if (canonical.version) {
    lines.push(`version: "${canonical.version}"`);
  }

  if (canonical.author) {
    lines.push(`author: ${canonical.author}`);
  }

  if (canonical.tags && canonical.tags.length > 0) {
    lines.push(`tags: [${canonical.tags.join(', ')}]`);
  }

  if (options?.addMetadata) {
    lines.push(`# Translated by SkillKit`);
    if (canonical.sourceAgent) {
      lines.push(`# Original format: ${canonical.sourceAgent}`);
    }
  }

  lines.push('---');
  lines.push('');

  // Content
  lines.push(`# ${canonical.name}`);
  lines.push('');
  lines.push(canonical.content);

  return lines.join('\n');
}

/**
 * Get the expected filename for an agent
 */
export function getAgentFilename(
  agentName: string,
  targetAgent: AgentType
): string {
  const format = CUSTOM_AGENT_FORMAT_MAP[targetAgent];

  switch (format) {
    case 'cursor-agent':
      return `${agentName}.md`; // Or .mdc if Cursor uses that for agents
    default:
      return `${agentName}.md`;
  }
}

/**
 * Get the target directory for an agent
 */
export function getAgentTargetDirectory(
  rootDir: string,
  targetAgent: AgentType
): string {
  const paths = AGENT_DISCOVERY_PATHS[targetAgent];
  if (paths && paths.length > 0) {
    return join(rootDir, paths[0]);
  }
  return join(rootDir, 'agents');
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
 * Translate multiple agents
 */
export function translateAgents(
  agents: CustomAgent[],
  targetAgent: AgentType,
  options?: AgentTranslationOptions
): AgentTranslationResult[] {
  return agents.map(agent => translateAgent(agent, targetAgent, options));
}

/**
 * Check if agent format is compatible with target
 */
export function isAgentCompatible(
  sourceFormat: AgentFormatCategory,
  targetFormat: AgentFormatCategory
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (sourceFormat === targetFormat) {
    return { compatible: true, warnings };
  }

  // All formats can translate to claude-agent (most feature-rich)
  if (targetFormat === 'claude-agent') {
    return { compatible: true, warnings };
  }

  // Universal format loses some features
  if (targetFormat === 'universal') {
    if (sourceFormat === 'claude-agent') {
      warnings.push('Hooks, permissionMode, and disallowedTools will be lost');
    }
    return { compatible: true, warnings };
  }

  // Cursor format has partial support
  if (targetFormat === 'cursor-agent') {
    if (sourceFormat === 'claude-agent') {
      warnings.push('Some Claude-specific features may not translate perfectly');
    }
    return { compatible: true, warnings };
  }

  return { compatible: true, warnings };
}
