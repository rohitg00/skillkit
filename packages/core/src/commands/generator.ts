/**
 * Command Generator
 *
 * Generates agent-specific slash commands from skills.
 */

import type { AgentType } from '../types.js';
import type { CanonicalSkill } from '../translator/types.js';
import type {
  SlashCommand,
  CommandGeneratorOptions,
  AgentCommandFormat,
  RegisteredCommand,
} from './types.js';

/**
 * Agent command formats
 */
const AGENT_FORMATS: Record<AgentType, AgentCommandFormat> = {
  'claude-code': {
    agent: 'claude-code',
    extension: '.md',
    directory: '.claude/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  cursor: {
    agent: 'cursor',
    extension: '.mdc',
    directory: '.cursor/rules',
    supportsSlashCommands: false,
    supportsCommandFiles: true,
  },
  codex: {
    agent: 'codex',
    extension: '.md',
    directory: '.codex/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  'gemini-cli': {
    agent: 'gemini-cli',
    extension: '.md',
    directory: '.gemini/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  opencode: {
    agent: 'opencode',
    extension: '.md',
    directory: '.opencode/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  antigravity: {
    agent: 'antigravity',
    extension: '.md',
    directory: '.antigravity/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  amp: {
    agent: 'amp',
    extension: '.md',
    directory: '.amp/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  clawdbot: {
    agent: 'clawdbot',
    extension: '.md',
    directory: '.clawdbot/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  droid: {
    agent: 'droid',
    extension: '.md',
    directory: '.factory/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  'github-copilot': {
    agent: 'github-copilot',
    extension: '.md',
    directory: '.github/copilot/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  goose: {
    agent: 'goose',
    extension: '.md',
    directory: '.goose/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  kilo: {
    agent: 'kilo',
    extension: '.md',
    directory: '.kilocode/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  'kiro-cli': {
    agent: 'kiro-cli',
    extension: '.md',
    directory: '.kiro/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  roo: {
    agent: 'roo',
    extension: '.md',
    directory: '.roo/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  trae: {
    agent: 'trae',
    extension: '.md',
    directory: '.trae/commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
  windsurf: {
    agent: 'windsurf',
    extension: '.md',
    directory: '.windsurf/commands',
    supportsSlashCommands: false,
    supportsCommandFiles: true,
  },
  universal: {
    agent: 'universal',
    extension: '.md',
    directory: 'commands',
    supportsSlashCommands: true,
    supportsCommandFiles: true,
  },
};

/**
 * CommandGenerator - Generate agent-specific commands
 */
export class CommandGenerator {
  private options: Partial<CommandGeneratorOptions>;

  constructor(options?: Partial<CommandGeneratorOptions>) {
    this.options = options || {};
  }

  /**
   * Get agent command format
   */
  getAgentFormat(agent: AgentType): AgentCommandFormat {
    return AGENT_FORMATS[agent] || AGENT_FORMATS.universal;
  }

  /**
   * Generate command from skill
   */
  fromSkill(skill: CanonicalSkill, commandName?: string): SlashCommand {
    return {
      name: commandName || this.slugify(skill.name),
      description: skill.description || `Execute ${skill.name} skill`,
      skill: skill.name,
      tags: skill.tags,
      category: this.inferCategory(skill),
      examples: this.generateExamples(skill, commandName || this.slugify(skill.name)),
    };
  }

  /**
   * Generate commands from multiple skills
   */
  fromSkills(skills: CanonicalSkill[]): SlashCommand[] {
    return skills.map((skill) => this.fromSkill(skill));
  }

  /**
   * Generate Claude Code command file
   */
  generateClaudeCommand(command: SlashCommand | RegisteredCommand): string {
    const lines: string[] = [];

    // Frontmatter
    lines.push('---');
    lines.push(`name: ${command.name}`);
    lines.push(`description: ${command.description}`);
    if (command.aliases && command.aliases.length > 0) {
      lines.push(`aliases: [${command.aliases.join(', ')}]`);
    }
    if (command.disableModelInvocation) {
      lines.push('disableModelInvocation: true');
    }
    if (command.args && command.args.length > 0) {
      lines.push('args:');
      for (const arg of command.args) {
        lines.push(`  - name: ${arg.name}`);
        lines.push(`    description: ${arg.description}`);
        if (arg.required) lines.push(`    required: true`);
        if (arg.default) lines.push(`    default: "${arg.default}"`);
      }
    }
    lines.push('---');
    lines.push('');

    // Command content
    lines.push(`# /${command.name}`);
    lines.push('');
    lines.push(command.description);
    lines.push('');

    // Usage examples
    if (command.examples && command.examples.length > 0) {
      lines.push('## Usage');
      lines.push('');
      for (const example of command.examples) {
        lines.push(`- ${example}`);
      }
      lines.push('');
    }

    // Skill reference
    lines.push('## Skill');
    lines.push('');
    lines.push(`This command invokes the \`${command.skill}\` skill.`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate Claude Code commands
   */
  generateClaudeCommands(commands: (SlashCommand | RegisteredCommand)[]): Map<string, string> {
    const files = new Map<string, string>();
    for (const command of commands) {
      if (this.shouldInclude(command)) {
        const filename = `${command.name}.md`;
        files.set(filename, this.generateClaudeCommand(command));
      }
    }
    return files;
  }

  /**
   * Generate Cursor rules with @-mention syntax
   */
  generateCursorRules(commands: (SlashCommand | RegisteredCommand)[]): string {
    const lines: string[] = [];

    lines.push('---');
    lines.push('description: Available commands');
    lines.push('globs: ["**/*"]');
    lines.push('---');
    lines.push('');
    lines.push('# Available Commands');
    lines.push('');
    lines.push('You can invoke the following commands using @-mentions:');
    lines.push('');

    for (const command of commands) {
      if (this.shouldInclude(command)) {
        lines.push(`## @${command.name}`);
        lines.push('');
        lines.push(command.description);
        lines.push('');
        if (command.examples && command.examples.length > 0) {
          lines.push('**Usage:**');
          for (const example of command.examples) {
            lines.push(`- ${example}`);
          }
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate OpenCode commands
   */
  generateOpenCodeCommands(commands: (SlashCommand | RegisteredCommand)[]): Map<string, string> {
    const files = new Map<string, string>();

    for (const command of commands) {
      if (this.shouldInclude(command)) {
        const lines: string[] = [];

        // SKILL.md format with command metadata
        lines.push('---');
        lines.push(`name: ${command.name}`);
        lines.push(`description: ${command.description}`);
        lines.push('type: command');
        if (command.aliases && command.aliases.length > 0) {
          lines.push(`aliases: [${command.aliases.join(', ')}]`);
        }
        lines.push('---');
        lines.push('');
        lines.push(`# ${command.name}`);
        lines.push('');
        lines.push(command.description);
        lines.push('');

        if (command.args && command.args.length > 0) {
          lines.push('## Arguments');
          lines.push('');
          for (const arg of command.args) {
            const required = arg.required ? '(required)' : '(optional)';
            lines.push(`- \`${arg.name}\` ${required}: ${arg.description}`);
          }
          lines.push('');
        }

        if (command.examples && command.examples.length > 0) {
          lines.push('## Examples');
          lines.push('');
          for (const example of command.examples) {
            lines.push(`- ${example}`);
          }
          lines.push('');
        }

        lines.push('## Skill Reference');
        lines.push('');
        lines.push(`Invokes: \`${command.skill}\``);
        lines.push('');

        const filename = `${command.name}.md`;
        files.set(filename, lines.join('\n'));
      }
    }

    return files;
  }

  /**
   * Generate Copilot commands (agent skills format)
   */
  generateCopilotCommands(commands: (SlashCommand | RegisteredCommand)[]): Map<string, string> {
    const files = new Map<string, string>();

    for (const command of commands) {
      if (this.shouldInclude(command)) {
        const lines: string[] = [];

        lines.push(`# ${command.name}`);
        lines.push('');
        lines.push(`> ${command.description}`);
        lines.push('');

        if (command.args && command.args.length > 0) {
          lines.push('## Parameters');
          lines.push('');
          lines.push('| Name | Required | Description |');
          lines.push('|------|----------|-------------|');
          for (const arg of command.args) {
            lines.push(`| ${arg.name} | ${arg.required ? 'Yes' : 'No'} | ${arg.description} |`);
          }
          lines.push('');
        }

        if (command.examples && command.examples.length > 0) {
          lines.push('## Examples');
          lines.push('');
          for (const example of command.examples) {
            lines.push(`\`\`\`\n${example}\n\`\`\``);
          }
          lines.push('');
        }

        lines.push('## Implementation');
        lines.push('');
        lines.push(`This command is powered by the \`${command.skill}\` skill.`);
        lines.push('');

        const filename = `${command.name}.md`;
        files.set(filename, lines.join('\n'));
      }
    }

    return files;
  }

  /**
   * Generate commands for any agent
   */
  generate(
    commands: (SlashCommand | RegisteredCommand)[],
    agent: AgentType
  ): Map<string, string> | string {
    switch (agent) {
      case 'claude-code':
      case 'codex':
      case 'gemini-cli':
      case 'amp':
      case 'roo':
      case 'kiro-cli':
        return this.generateClaudeCommands(commands);

      case 'cursor':
        return this.generateCursorRules(commands);

      case 'opencode':
        return this.generateOpenCodeCommands(commands);

      case 'github-copilot':
        return this.generateCopilotCommands(commands);

      default:
        // Use Claude Code format as default
        return this.generateClaudeCommands(commands);
    }
  }

  /**
   * Generate JSON manifest of commands
   */
  generateManifest(commands: (SlashCommand | RegisteredCommand)[]): string {
    const manifest = {
      version: '1.0.0',
      commands: commands.filter((c) => this.shouldInclude(c)).map((c) => ({
        name: c.name,
        description: c.description,
        skill: c.skill,
        aliases: c.aliases,
        args: c.args,
        category: c.category,
        tags: c.tags,
      })),
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Check if command should be included
   */
  private shouldInclude(command: SlashCommand | RegisteredCommand): boolean {
    // Check hidden
    if (command.hidden && !this.options.includeHidden) {
      return false;
    }

    // Check enabled (for RegisteredCommand)
    if ('enabled' in command && !command.enabled && !this.options.includeDisabled) {
      return false;
    }

    return true;
  }

  /**
   * Slugify a string for command name
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Infer category from skill
   */
  private inferCategory(skill: CanonicalSkill): string | undefined {
    const tags = skill.tags || [];
    const name = skill.name.toLowerCase();

    if (tags.includes('testing') || name.includes('test')) {
      return 'testing';
    }
    if (tags.includes('debugging') || name.includes('debug')) {
      return 'debugging';
    }
    if (tags.includes('planning') || name.includes('plan')) {
      return 'planning';
    }
    if (tags.includes('collaboration') || name.includes('review')) {
      return 'collaboration';
    }
    if (tags.includes('git') || name.includes('commit') || name.includes('branch')) {
      return 'git';
    }

    return undefined;
  }

  /**
   * Generate usage examples
   */
  private generateExamples(skill: CanonicalSkill, commandName: string): string[] {
    const examples: string[] = [];

    examples.push(`/${commandName}`);

    // Add examples based on skill content
    if (skill.content.toLowerCase().includes('file')) {
      examples.push(`/${commandName} path/to/file.ts`);
    }

    if (skill.content.toLowerCase().includes('test')) {
      examples.push(`/${commandName} --run-tests`);
    }

    return examples;
  }
}

/**
 * Create a CommandGenerator instance
 */
export function createCommandGenerator(options?: Partial<CommandGeneratorOptions>): CommandGenerator {
  return new CommandGenerator(options);
}

/**
 * Get agent format info
 */
export function getAgentFormat(agent: AgentType): AgentCommandFormat {
  return AGENT_FORMATS[agent] || AGENT_FORMATS.universal;
}

/**
 * Check if agent supports slash commands
 */
export function supportsSlashCommands(agent: AgentType): boolean {
  const format = AGENT_FORMATS[agent];
  return format?.supportsSlashCommands ?? true;
}
