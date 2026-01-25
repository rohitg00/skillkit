/**
 * Skill Translator
 *
 * Translates SKILL.md files between different AI coding agent formats.
 * This is the core functionality for SkillKit's cross-agent skill ecosystem.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, dirname, resolve, relative, isAbsolute } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { AgentType, Skill } from './types.js';
import {
  AGENT_CONFIG,
  type AgentDirectoryConfig,
  getSkillsDir,
  getConfigFile,
  getAllSkillsDirs as getAgentAllSkillsDirs,
  getGlobalSkillsDir as getAgentGlobalSkillsDir,
  supportsAutoDiscovery as agentSupportsAutoDiscovery,
} from './agent-config.js';

/**
 * Extended skill format for translation (includes invokeCommand)
 */
export interface AgentSkillFormat extends AgentDirectoryConfig {
  invokeCommand: string;
}

/**
 * Agent-specific skill format configurations
 * Extends AGENT_CONFIG with invokeCommand for all agents
 */
export const AGENT_SKILL_FORMATS: Record<AgentType, AgentSkillFormat> = Object.fromEntries(
  Object.entries(AGENT_CONFIG).map(([agent, config]) => [
    agent,
    { ...config, invokeCommand: 'skillkit read' },
  ])
) as Record<AgentType, AgentSkillFormat>;

/**
 * Canonical skill representation for cross-agent translation
 */
export interface CrossAgentSkill {
  name: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
  sourcePath: string;
  sourceAgent?: AgentType;
  version?: string;
  author?: string;
  tags?: string[];
  allowedTools?: string[];
  /** Agent-specific fields preserved during translation */
  agentFields?: Record<string, unknown>;
}

/**
 * Skill translation result
 */
export interface SkillTranslationResult {
  success: boolean;
  content: string;
  filename: string;
  targetDir: string;
  warnings: string[];
  incompatible: string[];
  targetAgent: AgentType;
}

/**
 * Skill translation options
 */
export interface SkillTranslationOptions {
  /** Preserve original comments and formatting */
  preserveComments?: boolean;
  /** Add translation metadata comment */
  addMetadata?: boolean;
  /** Custom output filename */
  outputFilename?: string;
  /** Overwrite existing files */
  overwrite?: boolean;
  /** Write to disk */
  write?: boolean;
  /** Output directory override */
  outputDir?: string;
}

/**
 * Parse a SKILL.md file into canonical format
 */
export function parseSkillToCanonical(
  skillPath: string,
  sourceAgent?: AgentType
): CrossAgentSkill | null {
  const skillMdPath = skillPath.endsWith('SKILL.md')
    ? skillPath
    : join(skillPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    return null;
  }

  try {
    const content = readFileSync(skillMdPath, 'utf-8');
    return parseSkillContentToCanonical(content, skillPath, sourceAgent);
  } catch {
    return null;
  }
}

/**
 * Parse skill content string into canonical format
 */
export function parseSkillContentToCanonical(
  content: string,
  sourcePath: string,
  sourceAgent?: AgentType
): CrossAgentSkill | null {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

  let frontmatter: Record<string, unknown> = {};
  let bodyContent = content;

  if (frontmatterMatch) {
    try {
      frontmatter = parseYaml(frontmatterMatch[1]) as Record<string, unknown>;
      bodyContent = content.slice(frontmatterMatch[0].length).trim();
    } catch {
      // Continue without frontmatter
    }
  }

  // If sourcePath is a directory (skill folder), use its basename
  // If sourcePath is a file (SKILL.md), use the parent directory's basename
  const name = (frontmatter.name as string) || basename(sourcePath.endsWith('.md') ? dirname(sourcePath) : sourcePath);
  const description = (frontmatter.description as string) || extractDescriptionFromContent(bodyContent);

  return {
    name,
    description,
    content: bodyContent,
    frontmatter,
    sourcePath,
    sourceAgent,
    version: frontmatter.version as string | undefined,
    author: frontmatter.author as string | undefined,
    tags: frontmatter.tags as string[] | undefined,
    allowedTools: parseAllowedTools(frontmatter['allowed-tools']),
    agentFields: extractAgentSpecificFields(frontmatter, sourceAgent),
  };
}

/**
 * Extract description from markdown content if not in frontmatter
 */
function extractDescriptionFromContent(content: string): string {
  // Try to find first paragraph or first heading
  const lines = content.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headings
    if (trimmed.startsWith('#')) continue;
    // Skip code blocks
    if (trimmed.startsWith('```')) continue;
    // Return first substantive line
    if (trimmed.length > 10) {
      return trimmed.slice(0, 200) + (trimmed.length > 200 ? '...' : '');
    }
  }

  return 'No description available';
}

/**
 * Parse allowed-tools field (can be string or array)
 */
function parseAllowedTools(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map(t => t.trim()).filter(Boolean);
  }
  return undefined;
}

/**
 * Extract agent-specific fields from frontmatter
 */
function extractAgentSpecificFields(
  frontmatter: Record<string, unknown>,
  _sourceAgent?: AgentType
): Record<string, unknown> {
  const agentFields: Record<string, unknown> = {};

  // Preserve special fields that might be agent-specific
  const specialFields = [
    'disable-model-invocation',
    'user-invocable',
    'argument-hint',
    'model',
    'context',
    'agent',
    'globs',
    'alwaysApply',
    'applyTo',
    'mode',
    'hooks',
    'permissionMode',
  ];

  for (const field of specialFields) {
    if (field in frontmatter) {
      agentFields[field] = frontmatter[field];
    }
  }

  return agentFields;
}

/**
 * Translate a cross-agent skill to target agent format
 */
export function translateSkillToAgent(
  canonical: CrossAgentSkill,
  targetAgent: AgentType,
  options?: SkillTranslationOptions
): SkillTranslationResult {
  const format = AGENT_SKILL_FORMATS[targetAgent];
  const warnings: string[] = [];
  const incompatible: string[] = [];

  // Check for incompatible features
  if (canonical.agentFields?.['hooks'] && targetAgent !== 'claude-code') {
    incompatible.push('hooks (only supported in Claude Code)');
  }

  if (canonical.agentFields?.['permissionMode'] && !['claude-code', 'roo'].includes(targetAgent)) {
    warnings.push('permissionMode may not be fully supported');
  }

  // Generate SKILL.md content for target agent
  const content = generateSkillContent(canonical, targetAgent, format, options);

  // Determine output filename and directory
  const filename = options?.outputFilename || 'SKILL.md';
  const targetDir = options?.outputDir || join(format.skillsDir, canonical.name);

  return {
    success: true,
    content,
    filename,
    targetDir,
    warnings,
    incompatible,
    targetAgent,
  };
}

/**
 * Generate SKILL.md content for target agent
 */
function generateSkillContent(
  canonical: CrossAgentSkill,
  targetAgent: AgentType,
  format: AgentSkillFormat,
  options?: SkillTranslationOptions
): string {
  const lines: string[] = [];

  // Build frontmatter
  const frontmatter: Record<string, unknown> = {
    name: canonical.name,
    description: canonical.description,
  };

  // Add version and author if present
  if (canonical.version) {
    frontmatter.version = canonical.version;
  }
  if (canonical.author) {
    frontmatter.author = canonical.author;
  }
  if (canonical.tags && canonical.tags.length > 0) {
    frontmatter.tags = canonical.tags;
  }

  // Add allowed-tools if present
  if (canonical.allowedTools && canonical.allowedTools.length > 0) {
    frontmatter['allowed-tools'] = canonical.allowedTools.join(', ');
  }

  // Add agent-specific fields based on target
  addAgentSpecificFields(frontmatter, canonical, targetAgent, format);

  // Add translation metadata if requested
  if (options?.addMetadata && canonical.sourceAgent) {
    frontmatter['_translated-from'] = canonical.sourceAgent;
    frontmatter['_translated-at'] = new Date().toISOString();
  }

  // Generate YAML frontmatter
  lines.push('---');
  lines.push(stringifyYaml(frontmatter).trim());
  lines.push('---');
  lines.push('');

  // Add content
  lines.push(canonical.content);

  return lines.join('\n');
}

/**
 * Add agent-specific fields to frontmatter
 */
function addAgentSpecificFields(
  frontmatter: Record<string, unknown>,
  canonical: CrossAgentSkill,
  targetAgent: AgentType,
  _format: AgentSkillFormat
): void {
  // Claude Code specific
  if (targetAgent === 'claude-code') {
    if ('model' in (canonical.agentFields ?? {})) {
      frontmatter.model = canonical.agentFields!['model'];
    }
    if ('context' in (canonical.agentFields ?? {})) {
      frontmatter.context = canonical.agentFields!['context'];
    }
    if ('agent' in (canonical.agentFields ?? {})) {
      frontmatter.agent = canonical.agentFields!['agent'];
    }
    if ('disable-model-invocation' in (canonical.agentFields ?? {})) {
      frontmatter['disable-model-invocation'] = canonical.agentFields!['disable-model-invocation'];
    }
    if ('user-invocable' in (canonical.agentFields ?? {})) {
      frontmatter['user-invocable'] = canonical.agentFields!['user-invocable'];
    }
    if ('argument-hint' in (canonical.agentFields ?? {})) {
      frontmatter['argument-hint'] = canonical.agentFields!['argument-hint'];
    }
    if ('hooks' in (canonical.agentFields ?? {})) {
      frontmatter.hooks = canonical.agentFields!['hooks'];
    }
    if ('permissionMode' in (canonical.agentFields ?? {})) {
      frontmatter.permissionMode = canonical.agentFields!['permissionMode'];
    }
  }

  // Cursor/Trae/Windsurf specific (MDC-style)
  if (['cursor', 'trae', 'windsurf'].includes(targetAgent)) {
    if ('globs' in (canonical.agentFields ?? {})) {
      frontmatter.globs = canonical.agentFields!['globs'];
    }
    if ('alwaysApply' in (canonical.agentFields ?? {})) {
      frontmatter.alwaysApply = canonical.agentFields!['alwaysApply'];
    }
    if (targetAgent === 'windsurf' && 'mode' in (canonical.agentFields ?? {})) {
      frontmatter.mode = canonical.agentFields!['mode'];
    }
  }

  // GitHub Copilot specific
  if (targetAgent === 'github-copilot') {
    if ('applyTo' in (canonical.agentFields ?? {})) {
      frontmatter.applyTo = canonical.agentFields!['applyTo'];
    }
  }

  // Roo specific
  if (targetAgent === 'roo') {
    if ('disable-model-invocation' in (canonical.agentFields ?? {})) {
      frontmatter['disable-model-invocation'] = canonical.agentFields!['disable-model-invocation'];
    }
    if ('user-invocable' in (canonical.agentFields ?? {})) {
      frontmatter['user-invocable'] = canonical.agentFields!['user-invocable'];
    }
    if ('permissionMode' in (canonical.agentFields ?? {})) {
      frontmatter.permissionMode = canonical.agentFields!['permissionMode'];
    }
  }
}

/**
 * Translate a skill file to multiple target agents
 */
export function translateSkillToAll(
  skillPath: string,
  sourceAgent?: AgentType,
  options?: SkillTranslationOptions
): Map<AgentType, SkillTranslationResult> {
  const canonical = parseSkillToCanonical(skillPath, sourceAgent);
  if (!canonical) {
    return new Map();
  }

  const results = new Map<AgentType, SkillTranslationResult>();
  const agents: AgentType[] = [
    'claude-code', 'cursor', 'codex', 'gemini-cli', 'opencode',
    'antigravity', 'amp', 'clawdbot', 'droid', 'github-copilot',
    'goose', 'kilo', 'kiro-cli', 'roo', 'trae', 'windsurf', 'universal',
  ];

  for (const agent of agents) {
    if (agent !== sourceAgent) {
      results.set(agent, translateSkillToAgent(canonical, agent, options));
    }
  }

  return results;
}

/**
 * Write translated skill to disk
 */
export function writeTranslatedSkill(
  result: SkillTranslationResult,
  rootDir: string,
  options?: { overwrite?: boolean }
): { success: boolean; path: string; error?: string; skipped?: boolean } {
  // Don't write if translation failed
  if (!result.success) {
    return {
      success: false,
      path: '',
      error: 'Translation failed',
    };
  }

  try {
    const rootPath = resolve(rootDir);
    const filePath = resolve(rootDir, result.targetDir, result.filename);
    const targetPath = dirname(filePath);

    // Guard against path traversal
    const relPath = relative(rootPath, filePath);
    if (relPath.startsWith('..') || isAbsolute(relPath)) {
      return {
        success: false,
        path: filePath,
        error: 'Resolved output path escapes rootDir',
      };
    }

    // Check if file exists and overwrite is disabled
    if (existsSync(filePath) && options?.overwrite === false) {
      return {
        success: false,
        path: filePath,
        error: 'File exists and overwrite=false',
        skipped: true,
      };
    }

    // Create directory if needed
    if (!existsSync(targetPath)) {
      mkdirSync(targetPath, { recursive: true });
    }

    writeFileSync(filePath, result.content, 'utf-8');

    return { success: true, path: filePath };
  } catch (error) {
    return {
      success: false,
      path: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate config file content that references skills
 * This generates the agent-specific config format (AGENTS.md, .cursorrules, etc.)
 */
export function generateSkillsConfig(
  skills: Skill[],
  targetAgent: AgentType
): string {
  const format = AGENT_SKILL_FORMATS[targetAgent];
  const enabledSkills = skills.filter(s => s.enabled);

  if (enabledSkills.length === 0) {
    return '';
  }

  switch (format.configFormat) {
    case 'xml':
      return generateXmlConfig(enabledSkills, format);
    case 'mdc':
      return generateMdcConfig(enabledSkills, format);
    case 'markdown-table':
      return generateMarkdownTableConfig(enabledSkills, format);
    case 'json':
      return generateJsonConfig(enabledSkills, format);
    case 'markdown':
      return generateMarkdownConfig(enabledSkills, format);
    default:
      return generateMarkdownConfig(enabledSkills, format);
  }
}

/**
 * Generate XML-style config (Claude Code, OpenCode, etc.)
 */
function generateXmlConfig(skills: Skill[], format: AgentSkillFormat): string {
  const skillsXml = skills.map(s => `<skill>
<name>${escapeXml(s.name)}</name>
<description>${escapeXml(s.description)}</description>
<location>${escapeXml(s.path)}</location>
</skill>`).join('\n\n');

  return `<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: \`${format.invokeCommand} <skill-name>\` or \`npx ${format.invokeCommand} <skill-name>\`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

${skillsXml}

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>`;
}

/**
 * Generate MDC-style config (Cursor)
 */
function generateMdcConfig(skills: Skill[], format: AgentSkillFormat): string {
  const skillsList = skills
    .map(s => `- **${s.name}**: ${s.description}`)
    .join('\n');

  const skillsXml = skills.map(s => `<skill>
<name>${escapeXml(s.name)}</name>
<description>${escapeXml(s.description)}</description>
<location>${escapeXml(s.path)}</location>
</skill>`).join('\n\n');

  return `---
description: SkillKit skills integration - provides specialized capabilities and domain knowledge
globs: "**/*"
alwaysApply: true
---
# Skills System

You have access to specialized skills that can help complete tasks. Use the skillkit CLI to load skill instructions when needed.

## Available Skills

${skillsList}

## How to Use Skills

When a task matches a skill's description, load it with:
\`\`\`bash
${format.invokeCommand} <skill-name>
\`\`\`

The skill will provide detailed instructions for completing the task.

<!-- SKILLS_DATA_START -->
${skillsXml}
<!-- SKILLS_DATA_END -->
`;
}

/**
 * Generate Markdown table config (Codex)
 */
function generateMarkdownTableConfig(skills: Skill[], format: AgentSkillFormat): string {
  const skillsList = skills
    .map(s => `| ${s.name} | ${s.description} | \`${format.invokeCommand} ${s.name}\` |`)
    .join('\n');

  return `# Skills

You have access to specialized skills for completing complex tasks.

| Skill | Description | Command |
|-------|-------------|---------|
${skillsList}

## Usage

When a task matches a skill's capability, run the command to load detailed instructions:

\`\`\`bash
${format.invokeCommand} <skill-name>
\`\`\`

Skills are loaded on-demand to keep context clean. Only load skills when relevant to the current task.
`;
}

/**
 * Generate JSON config (Gemini CLI)
 */
function generateJsonConfig(skills: Skill[], format: AgentSkillFormat): string {
  const skillsJson = skills.map(s => ({
    name: s.name,
    description: s.description,
    invoke: `${format.invokeCommand} ${s.name}`,
    location: s.path,
  }));

  return `# Skills Configuration

You have access to specialized skills that extend your capabilities.

## Available Skills

${skills.map(s => `### ${s.name}\n${s.description}\n\nInvoke: \`${format.invokeCommand} ${s.name}\``).join('\n\n')}

## Skills Data

\`\`\`json
${JSON.stringify(skillsJson, null, 2)}
\`\`\`

## Usage Instructions

1. When a task matches a skill's description, load it using the invoke command
2. Skills provide step-by-step instructions for complex tasks
3. Each skill is self-contained with its own resources
`;
}

/**
 * Generate Markdown config (Windsurf, Trae, GitHub Copilot)
 */
function generateMarkdownConfig(skills: Skill[], format: AgentSkillFormat): string {
  const skillsList = skills
    .map(s => `### ${s.name}\n\n${s.description}\n\n**Invoke:** \`${format.invokeCommand} ${s.name}\``)
    .join('\n\n');

  return `# Skills System

You have access to specialized skills that can help complete tasks.

## Available Skills

${skillsList}

## How to Use Skills

When a task matches a skill's description, load it:

\`\`\`bash
${format.invokeCommand} <skill-name>
\`\`\`

Skills provide detailed instructions for completing complex tasks.
`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Re-export utility functions from centralized config with legacy names for backwards compatibility
export const getAgentSkillsDir = getSkillsDir;
export const getAgentConfigFile = getConfigFile;
export { agentSupportsAutoDiscovery as supportsAutoDiscovery };
export { getAgentAllSkillsDirs as getAllSkillsDirs };
export { getAgentGlobalSkillsDir as getGlobalSkillsDir };
