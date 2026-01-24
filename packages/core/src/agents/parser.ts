/**
 * Agent Parser
 *
 * Parses agent definition files (e.g., .claude/agents/*.md)
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  AgentFrontmatter,
  AgentMetadata,
  type CustomAgent,
  type AgentLocation,
  type CanonicalAgent,
  type AgentFormatCategory,
} from './types.js';
import type { AgentType } from '../types.js';

/**
 * Extract YAML frontmatter from markdown content
 */
export function extractAgentFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!match) {
    return null;
  }

  try {
    return parseYaml(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extract content after frontmatter
 */
export function extractAgentContent(content: string): string {
  const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
  return withoutFrontmatter.trim();
}

/**
 * Parse an agent file (.md)
 */
export function parseAgentFile(
  filePath: string,
  location: AgentLocation = 'project'
): CustomAgent | null {
  if (!existsSync(filePath)) {
    return null;
  }

  // Only parse .md files
  if (extname(filePath) !== '.md') {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const rawFrontmatter = extractAgentFrontmatter(content);
    const agentContent = extractAgentContent(content);

    // If no frontmatter, use filename as name
    if (!rawFrontmatter) {
      const name = basename(filePath, '.md');
      return {
        name,
        description: 'No description available',
        path: filePath,
        location,
        frontmatter: {
          name,
          description: 'No description available',
        },
        content: agentContent,
        enabled: true,
      };
    }

    // Parse frontmatter with validation
    const parsed = AgentFrontmatter.safeParse(rawFrontmatter);

    if (!parsed.success) {
      // Fallback to basic parsing
      const name = (rawFrontmatter.name as string) || basename(filePath, '.md');
      return {
        name,
        description: (rawFrontmatter.description as string) || 'No description available',
        path: filePath,
        location,
        frontmatter: {
          name,
          description: (rawFrontmatter.description as string) || 'No description available',
          ...rawFrontmatter,
        } as AgentFrontmatter,
        content: agentContent,
        enabled: true,
      };
    }

    // Load metadata if exists
    const metadataPath = filePath.replace(/\.md$/, '.skillkit-agent.json');
    const metadata = loadAgentMetadata(metadataPath);

    return {
      name: parsed.data.name,
      description: parsed.data.description,
      path: filePath,
      location,
      frontmatter: parsed.data,
      content: agentContent,
      metadata: metadata ?? undefined,
      enabled: metadata?.enabled ?? true,
    };
  } catch {
    return null;
  }
}

/**
 * Parse an agent from a directory (containing AGENT.md)
 */
export function parseAgentDir(
  dirPath: string,
  location: AgentLocation = 'project'
): CustomAgent | null {
  const agentMdPath = join(dirPath, 'AGENT.md');

  if (existsSync(agentMdPath)) {
    const agent = parseAgentFile(agentMdPath, location);
    if (agent) {
      // Update path to directory
      agent.path = dirPath;
    }
    return agent;
  }

  // Try index.md
  const indexMdPath = join(dirPath, 'index.md');
  if (existsSync(indexMdPath)) {
    const agent = parseAgentFile(indexMdPath, location);
    if (agent) {
      agent.path = dirPath;
    }
    return agent;
  }

  return null;
}

/**
 * Load agent metadata from JSON file
 */
export function loadAgentMetadata(metadataPath: string): AgentMetadata | null {
  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = readFileSync(metadataPath, 'utf-8');
    const data = JSON.parse(content);
    const parsed = AgentMetadata.safeParse(data);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Convert parsed agent to canonical format for translation
 */
export function toCanonicalAgent(
  agent: CustomAgent,
  sourceAgent?: AgentType
): CanonicalAgent {
  const fm = agent.frontmatter;

  // Handle allowed-tools (can be string or array)
  let allowedTools: string[] | undefined;
  if (fm.allowedTools) {
    if (typeof fm.allowedTools === 'string') {
      // Parse YAML-style list
      allowedTools = fm.allowedTools.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
    } else {
      allowedTools = fm.allowedTools;
    }
  }

  return {
    name: agent.name,
    description: agent.description,
    model: fm.model,
    permissionMode: fm.permissionMode,
    disallowedTools: fm.disallowedTools,
    allowedTools,
    hooks: fm.hooks,
    skills: fm.skills,
    context: fm.context,
    version: fm.version,
    author: fm.author,
    tags: fm.tags,
    userInvocable: fm['user-invocable'],
    argumentHint: fm['argument-hint'],
    content: agent.content,
    sourceFormat: 'claude-agent',
    sourceAgent,
  };
}

/**
 * Generate agent markdown from canonical format
 */
export function fromCanonicalAgent(
  canonical: CanonicalAgent,
  _targetFormat: AgentFormatCategory = 'claude-agent'
): string {
  // Note: _targetFormat reserved for format-specific output in future
  const lines: string[] = [];

  // Generate frontmatter
  lines.push('---');
  lines.push(`name: ${canonical.name}`);
  lines.push(`description: ${canonical.description}`);

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
      lines.push(`    command: ${hook.command}`);
      if (hook.timeout) lines.push(`    timeout: ${hook.timeout}`);
      if (hook.once) lines.push(`    once: ${hook.once}`);
      if (hook.matcher) lines.push(`    matcher: ${hook.matcher}`);
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
    lines.push(`argument-hint: "${canonical.argumentHint}"`);
  }

  lines.push('---');
  lines.push('');

  // Add content
  lines.push(canonical.content);

  return lines.join('\n');
}

/**
 * Read raw agent content
 */
export function readAgentContent(agentPath: string): string | null {
  // If it's a file
  if (existsSync(agentPath) && extname(agentPath) === '.md') {
    try {
      return readFileSync(agentPath, 'utf-8');
    } catch {
      return null;
    }
  }

  // If it's a directory
  const agentMdPath = join(agentPath, 'AGENT.md');
  if (existsSync(agentMdPath)) {
    try {
      return readFileSync(agentMdPath, 'utf-8');
    } catch {
      return null;
    }
  }

  // Try index.md
  const indexMdPath = join(agentPath, 'index.md');
  if (existsSync(indexMdPath)) {
    try {
      return readFileSync(indexMdPath, 'utf-8');
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Validate an agent file
 */
export function validateAgent(
  agentPath: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file exists
  let filePath = agentPath;
  if (!existsSync(agentPath)) {
    errors.push(`Agent file not found: ${agentPath}`);
    return { valid: false, errors, warnings };
  }

  // If directory, look for AGENT.md
  const stats = require('node:fs').statSync(agentPath);
  if (stats.isDirectory()) {
    const agentMd = join(agentPath, 'AGENT.md');
    const indexMd = join(agentPath, 'index.md');
    if (existsSync(agentMd)) {
      filePath = agentMd;
    } else if (existsSync(indexMd)) {
      filePath = indexMd;
    } else {
      errors.push('Directory must contain AGENT.md or index.md');
      return { valid: false, errors, warnings };
    }
  }

  // Read content
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    errors.push(`Cannot read file: ${filePath}`);
    return { valid: false, errors, warnings };
  }

  // Check frontmatter
  const frontmatter = extractAgentFrontmatter(content);
  if (!frontmatter) {
    errors.push('Missing YAML frontmatter');
    return { valid: false, errors, warnings };
  }

  // Validate frontmatter
  const parsed = AgentFrontmatter.safeParse(frontmatter);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join('.') || 'frontmatter'}: ${issue.message}`);
    }
  }

  // Warnings
  if (parsed.success) {
    const data = parsed.data;
    const fileName = basename(filePath, '.md');

    if (data.name !== fileName && fileName !== 'AGENT' && fileName !== 'index') {
      warnings.push(`name "${data.name}" does not match filename "${fileName}"`);
    }

    if (data.description && data.description.length < 20) {
      warnings.push('description is short; consider adding more detail');
    }

    if (data.permissionMode === 'full-auto' || data.permissionMode === 'bypassPermissions') {
      warnings.push(`permissionMode "${data.permissionMode}" is potentially dangerous`);
    }
  }

  // Check content
  const agentContent = extractAgentContent(content);
  if (agentContent.length < 50) {
    warnings.push('Agent system prompt is very short');
  }

  return { valid: errors.length === 0, errors, warnings };
}
