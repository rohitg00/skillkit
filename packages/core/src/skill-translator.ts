/**
 * Skill Translator
 *
 * Translates SKILL.md files between different AI coding agent formats.
 * This is the core functionality for SkillKit's cross-agent skill ecosystem.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { AgentType, Skill } from './types.js';

/**
 * Skill format configuration for each agent
 */
export interface AgentSkillFormat {
  /** Primary skills directory path */
  skillsDir: string;
  /** Config file that references skills (e.g., AGENTS.md, .cursorrules) */
  configFile: string;
  /** Whether agent uses YAML frontmatter in SKILL.md */
  usesFrontmatter: boolean;
  /** Config format: xml, markdown-table, json, yaml-list, mdc */
  configFormat: 'xml' | 'markdown-table' | 'json' | 'yaml-list' | 'mdc' | 'markdown';
  /** How to invoke skills */
  invokeCommand: string;
  /** Additional frontmatter fields supported */
  frontmatterFields?: string[];
  /** Whether agent supports skill auto-discovery */
  supportsAutoDiscovery: boolean;
  /** Alternative skills directories */
  altSkillsDirs?: string[];
  /** Global skills path */
  globalSkillsDir?: string;
}

/**
 * Agent-specific skill format configurations (2026 latest)
 */
export const AGENT_SKILL_FORMATS: Record<AgentType, AgentSkillFormat> = {
  'claude-code': {
    skillsDir: '.claude/skills',
    configFile: 'CLAUDE.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['name', 'description', 'allowed-tools', 'model', 'context', 'agent', 'disable-model-invocation', 'user-invocable', 'argument-hint'],
    supportsAutoDiscovery: true,
    globalSkillsDir: '~/.claude/skills',
  },
  cursor: {
    skillsDir: '.cursor/skills',
    configFile: '.cursor/rules/skills.mdc',
    usesFrontmatter: true,
    configFormat: 'mdc',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['description', 'globs', 'alwaysApply'],
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.cursor/commands'],
    globalSkillsDir: '~/.cursor/skills',
  },
  codex: {
    skillsDir: '.codex/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'markdown-table',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    globalSkillsDir: '~/.codex/skills',
  },
  'gemini-cli': {
    skillsDir: '.gemini/skills',
    configFile: 'GEMINI.md',
    usesFrontmatter: true,
    configFormat: 'json',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    globalSkillsDir: '~/.gemini/skills',
  },
  opencode: {
    skillsDir: '.opencode/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    globalSkillsDir: '~/.config/opencode/skills',
  },
  antigravity: {
    skillsDir: '.antigravity/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
  },
  amp: {
    skillsDir: '.amp/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
  },
  clawdbot: {
    skillsDir: '.clawdbot/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    altSkillsDirs: ['agents'],
  },
  droid: {
    skillsDir: '.factory/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
  },
  'github-copilot': {
    skillsDir: '.github/skills',
    configFile: '.github/copilot-instructions.md',
    usesFrontmatter: true,
    configFormat: 'markdown',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['applyTo'],
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.github/instructions'],
  },
  goose: {
    skillsDir: '.goose/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    globalSkillsDir: '~/.config/goose/skills',
  },
  kilo: {
    skillsDir: '.kilocode/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.kilocode/rules'],
  },
  'kiro-cli': {
    skillsDir: '.kiro/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
  },
  roo: {
    skillsDir: '.roo/skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'xml',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['name', 'description', 'disable-model-invocation', 'user-invocable'],
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.roo/rules'],
    globalSkillsDir: '~/.roo/skills',
  },
  trae: {
    skillsDir: '.trae/skills',
    configFile: '.trae/rules/project_rules.md',
    usesFrontmatter: true,
    configFormat: 'markdown',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['alwaysApply', 'description', 'globs'],
    supportsAutoDiscovery: true,
  },
  windsurf: {
    skillsDir: '.windsurf/skills',
    configFile: '.windsurf/rules/skills.md',
    usesFrontmatter: true,
    configFormat: 'markdown',
    invokeCommand: 'skillkit read',
    frontmatterFields: ['name', 'description', 'mode'],
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.windsurf/workflows'],
    globalSkillsDir: '~/.codeium/windsurf/skills',
  },
  universal: {
    skillsDir: 'skills',
    configFile: 'AGENTS.md',
    usesFrontmatter: true,
    configFormat: 'markdown',
    invokeCommand: 'skillkit read',
    supportsAutoDiscovery: true,
    altSkillsDirs: ['.agents/skills', '.agent/skills'],
  },
};

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
    if (canonical.agentFields?.['model']) {
      frontmatter.model = canonical.agentFields['model'];
    }
    if (canonical.agentFields?.['context']) {
      frontmatter.context = canonical.agentFields['context'];
    }
    if (canonical.agentFields?.['agent']) {
      frontmatter.agent = canonical.agentFields['agent'];
    }
    if (canonical.agentFields?.['disable-model-invocation']) {
      frontmatter['disable-model-invocation'] = canonical.agentFields['disable-model-invocation'];
    }
    if (canonical.agentFields?.['user-invocable']) {
      frontmatter['user-invocable'] = canonical.agentFields['user-invocable'];
    }
    if (canonical.agentFields?.['argument-hint']) {
      frontmatter['argument-hint'] = canonical.agentFields['argument-hint'];
    }
  }

  // Cursor/Trae/Windsurf specific (MDC-style)
  if (['cursor', 'trae', 'windsurf'].includes(targetAgent)) {
    if (canonical.agentFields?.['globs']) {
      frontmatter.globs = canonical.agentFields['globs'];
    }
    if (canonical.agentFields?.['alwaysApply']) {
      frontmatter.alwaysApply = canonical.agentFields['alwaysApply'];
    }
  }

  // GitHub Copilot specific
  if (targetAgent === 'github-copilot') {
    if (canonical.agentFields?.['applyTo']) {
      frontmatter.applyTo = canonical.agentFields['applyTo'];
    }
  }

  // Roo specific
  if (targetAgent === 'roo') {
    if (canonical.agentFields?.['disable-model-invocation']) {
      frontmatter['disable-model-invocation'] = canonical.agentFields['disable-model-invocation'];
    }
    if (canonical.agentFields?.['user-invocable']) {
      frontmatter['user-invocable'] = canonical.agentFields['user-invocable'];
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
    'windsurf', 'kilo', 'roo', 'trae', 'github-copilot', 'goose',
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
  rootDir: string
): { success: boolean; path: string; error?: string } {
  try {
    const targetPath = join(rootDir, result.targetDir);
    const filePath = join(targetPath, result.filename);

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

/**
 * Get the skills directory for an agent from the format configuration
 */
export function getAgentSkillsDir(agent: AgentType): string {
  return AGENT_SKILL_FORMATS[agent].skillsDir;
}

/**
 * Get the config file for an agent from the format configuration
 */
export function getAgentConfigFile(agent: AgentType): string {
  return AGENT_SKILL_FORMATS[agent].configFile;
}

/**
 * Check if an agent supports auto-discovery of skills
 */
export function supportsAutoDiscovery(agent: AgentType): boolean {
  return AGENT_SKILL_FORMATS[agent].supportsAutoDiscovery;
}

/**
 * Get all skills directories for an agent (primary + alternatives)
 */
export function getAllSkillsDirs(agent: AgentType): string[] {
  const format = AGENT_SKILL_FORMATS[agent];
  const dirs = [format.skillsDir];
  if (format.altSkillsDirs) {
    dirs.push(...format.altSkillsDirs);
  }
  return dirs;
}

/**
 * Get global skills directory for an agent
 */
export function getGlobalSkillsDir(agent: AgentType): string | undefined {
  return AGENT_SKILL_FORMATS[agent].globalSkillsDir;
}
