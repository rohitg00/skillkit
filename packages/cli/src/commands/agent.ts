/**
 * Agent Command
 *
 * Manage custom AI sub-agents (e.g., .claude/agents/*.md)
 */

import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
  findAllAgents,
  findAgent,
  discoverAgents,
  validateAgent,
  translateAgent,
  getAgentTargetDirectory,
  type CustomAgent,
  type AgentType,
} from '@skillkit/core';
// Agent discovery uses root directories, not skill directories

export class AgentCommand extends Command {
  static override paths = [['agent']];

  static override usage = Command.Usage({
    description: 'Manage custom AI sub-agents',
    details: `
      This command manages custom AI sub-agents that can be used with
      Claude Code, Cursor, and other AI coding agents.

      Agents are specialized personas (like architects, testers, reviewers)
      that can be invoked with @mentions or the --agent flag.

      Sub-commands:
        agent list      - List all installed agents
        agent show      - Show agent details
        agent create    - Create a new agent
        agent translate - Translate agents between formats
        agent sync      - Sync agents to target AI agent
        agent validate  - Validate agent definitions
    `,
    examples: [
      ['List all agents', '$0 agent list'],
      ['Show agent details', '$0 agent show architect'],
      ['Create new agent', '$0 agent create security-reviewer'],
      ['Translate to Cursor format', '$0 agent translate --to cursor'],
      ['Sync agents', '$0 agent sync --agent claude-code'],
    ],
  });

  async execute(): Promise<number> {
    console.log(chalk.cyan('Agent management commands:\n'));
    console.log('  agent list              List all installed agents');
    console.log('  agent show <name>       Show agent details');
    console.log('  agent create <name>     Create a new agent');
    console.log('  agent translate         Translate agents between formats');
    console.log('  agent sync              Sync agents to target AI agent');
    console.log('  agent validate [path]   Validate agent definitions');
    console.log();
    console.log(chalk.dim('Run `skillkit agent <subcommand> --help` for more info'));
    return 0;
  }
}

export class AgentListCommand extends Command {
  static override paths = [['agent', 'list'], ['agent', 'ls']];

  static override usage = Command.Usage({
    description: 'List all installed agents',
    examples: [
      ['List all agents', '$0 agent list'],
      ['Show JSON output', '$0 agent list --json'],
      ['Show only project agents', '$0 agent list --project'],
    ],
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  project = Option.Boolean('--project,-p', false, {
    description: 'Show only project agents',
  });

  global = Option.Boolean('--global,-g', false, {
    description: 'Show only global agents',
  });

  async execute(): Promise<number> {
    const searchDirs = [process.cwd()];
    let agents = findAllAgents(searchDirs);

    if (this.project) {
      agents = agents.filter((a: CustomAgent) => a.location === 'project');
    } else if (this.global) {
      agents = agents.filter((a: CustomAgent) => a.location === 'global');
    }

    agents.sort((a: CustomAgent, b: CustomAgent) => {
      if (a.location !== b.location) {
        return a.location === 'project' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    if (this.json) {
      console.log(JSON.stringify(agents.map((a: CustomAgent) => ({
        name: a.name,
        description: a.description,
        path: a.path,
        location: a.location,
        enabled: a.enabled,
        model: a.frontmatter.model,
        permissionMode: a.frontmatter.permissionMode,
      })), null, 2));
      return 0;
    }

    if (agents.length === 0) {
      console.log(chalk.yellow('No agents found'));
      console.log(chalk.dim('Create an agent with: skillkit agent create <name>'));
      return 0;
    }

    console.log(chalk.cyan(`Installed agents (${agents.length}):\n`));

    const projectAgents = agents.filter((a: CustomAgent) => a.location === 'project');
    const globalAgents = agents.filter((a: CustomAgent) => a.location === 'global');

    if (projectAgents.length > 0) {
      console.log(chalk.blue('Project agents:'));
      for (const agent of projectAgents) {
        printAgent(agent);
      }
      console.log();
    }

    if (globalAgents.length > 0) {
      console.log(chalk.dim('Global agents:'));
      for (const agent of globalAgents) {
        printAgent(agent);
      }
      console.log();
    }

    console.log(
      chalk.dim(`${projectAgents.length} project, ${globalAgents.length} global`)
    );

    return 0;
  }
}

export class AgentShowCommand extends Command {
  static override paths = [['agent', 'show'], ['agent', 'info']];

  static override usage = Command.Usage({
    description: 'Show details for a specific agent',
    examples: [
      ['Show agent details', '$0 agent show architect'],
    ],
  });

  name = Option.String({ required: true });

  async execute(): Promise<number> {
    const searchDirs = [process.cwd()];
    const agent = findAgent(this.name, searchDirs);

    if (!agent) {
      console.log(chalk.red(`Agent not found: ${this.name}`));
      return 1;
    }

    console.log(chalk.cyan(`Agent: ${agent.name}\n`));
    console.log(`${chalk.dim('Description:')} ${agent.description}`);
    console.log(`${chalk.dim('Location:')} ${agent.location} (${agent.path})`);
    console.log(`${chalk.dim('Enabled:')} ${agent.enabled ? chalk.green('yes') : chalk.red('no')}`);

    const fm = agent.frontmatter;
    if (fm.model) {
      console.log(`${chalk.dim('Model:')} ${fm.model}`);
    }
    if (fm.permissionMode) {
      console.log(`${chalk.dim('Permission Mode:')} ${fm.permissionMode}`);
    }
    if (fm.context) {
      console.log(`${chalk.dim('Context:')} ${fm.context}`);
    }
    if (fm.disallowedTools && fm.disallowedTools.length > 0) {
      console.log(`${chalk.dim('Disallowed Tools:')} ${fm.disallowedTools.join(', ')}`);
    }
    if (fm.skills && fm.skills.length > 0) {
      console.log(`${chalk.dim('Skills:')} ${fm.skills.join(', ')}`);
    }
    if (fm.hooks && fm.hooks.length > 0) {
      console.log(`${chalk.dim('Hooks:')} ${fm.hooks.length} defined`);
    }
    if (fm.tags && fm.tags.length > 0) {
      console.log(`${chalk.dim('Tags:')} ${fm.tags.join(', ')}`);
    }
    if (fm.author) {
      console.log(`${chalk.dim('Author:')} ${fm.author}`);
    }
    if (fm.version) {
      console.log(`${chalk.dim('Version:')} ${fm.version}`);
    }

    console.log();
    console.log(chalk.dim('Content preview:'));
    console.log(chalk.dim('─'.repeat(40)));
    const preview = agent.content.slice(0, 500);
    console.log(preview + (agent.content.length > 500 ? '\n...' : ''));

    return 0;
  }
}

export class AgentCreateCommand extends Command {
  static override paths = [['agent', 'create'], ['agent', 'new']];

  static override usage = Command.Usage({
    description: 'Create a new agent',
    examples: [
      ['Create an agent', '$0 agent create security-reviewer'],
      ['Create with model', '$0 agent create architect --model opus'],
      ['Create globally', '$0 agent create my-agent --global'],
    ],
  });

  name = Option.String({ required: true });

  model = Option.String('--model,-m', {
    description: 'Model to use (opus, sonnet, haiku)',
  });

  description = Option.String('--description,-d', {
    description: 'Agent description',
  });

  global = Option.Boolean('--global,-g', false, {
    description: 'Create in global agents directory',
  });

  async execute(): Promise<number> {
    // Determine target directory
    let targetDir: string;
    if (this.global) {
      targetDir = join(homedir(), '.claude', 'agents');
    } else {
      targetDir = join(process.cwd(), '.claude', 'agents');
    }

    // Create directory if needed
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Check if agent already exists
    const agentPath = join(targetDir, `${this.name}.md`);
    if (existsSync(agentPath)) {
      console.log(chalk.red(`Agent already exists: ${agentPath}`));
      return 1;
    }

    // Generate content
    const description = this.description || `${this.name} agent`;
    const content = generateAgentTemplate(this.name, description, this.model);

    // Write file
    writeFileSync(agentPath, content);

    console.log(chalk.green(`Created agent: ${agentPath}`));
    console.log();
    console.log(chalk.dim('Edit the file to customize the agent system prompt.'));
    console.log(chalk.dim(`Invoke with: @${this.name}`));

    return 0;
  }
}

export class AgentTranslateCommand extends Command {
  static override paths = [['agent', 'translate']];

  static override usage = Command.Usage({
    description: 'Translate agents between AI coding agent formats',
    examples: [
      ['Translate all to Cursor', '$0 agent translate --to cursor'],
      ['Translate specific agent', '$0 agent translate architect --to cursor'],
      ['Dry run', '$0 agent translate --to cursor --dry-run'],
    ],
  });

  name = Option.String({ required: false });

  to = Option.String('--to,-t', {
    description: 'Target AI agent (claude-code, cursor, codex, etc.)',
    required: true,
  });

  output = Option.String('--output,-o', {
    description: 'Output directory',
  });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Show what would be done without writing files',
  });

  all = Option.Boolean('--all,-a', false, {
    description: 'Translate all agents',
  });

  async execute(): Promise<number> {
    const searchDirs = [process.cwd()];
    const targetAgent = this.to as AgentType;

    // Get agents to translate
    let agents: CustomAgent[];
    if (this.name) {
      const agent = findAgent(this.name, searchDirs);
      if (!agent) {
        console.log(chalk.red(`Agent not found: ${this.name}`));
        return 1;
      }
      agents = [agent];
    } else if (this.all) {
      agents = findAllAgents(searchDirs);
    } else {
      agents = discoverAgents(process.cwd());
    }

    if (agents.length === 0) {
      console.log(chalk.yellow('No agents found to translate'));
      return 0;
    }

    // Determine output directory
    const outputDir = this.output || getAgentTargetDirectory(process.cwd(), targetAgent);

    console.log(chalk.cyan(`Translating ${agents.length} agent(s) to ${targetAgent} format...\n`));

    let successCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      try {
        const result = translateAgent(agent, targetAgent, { addMetadata: true });

        if (!result.success) {
          console.log(chalk.red(`✗ ${agent.name}: Translation failed`));
          errorCount++;
          continue;
        }

        const outputPath = join(outputDir, result.filename);

        if (this.dryRun) {
          console.log(chalk.blue(`Would write: ${outputPath}`));
          if (result.warnings.length > 0) {
            for (const warning of result.warnings) {
              console.log(chalk.yellow(`  ⚠ ${warning}`));
            }
          }
          if (result.incompatible.length > 0) {
            for (const incompat of result.incompatible) {
              console.log(chalk.dim(`  ○ ${incompat}`));
            }
          }
        } else {
          // Create directory if needed
          if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
          }
          writeFileSync(outputPath, result.content);
          console.log(chalk.green(`✓ ${agent.name} → ${outputPath}`));
        }

        successCount++;
      } catch (error) {
        console.log(chalk.red(`✗ ${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`));
        errorCount++;
      }
    }

    console.log();
    if (this.dryRun) {
      console.log(chalk.dim(`Would translate ${successCount} agent(s)`));
    } else {
      console.log(chalk.dim(`Translated ${successCount} agent(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`));
    }

    return errorCount > 0 ? 1 : 0;
  }
}

export class AgentSyncCommand extends Command {
  static override paths = [['agent', 'sync']];

  static override usage = Command.Usage({
    description: 'Sync agents to target AI coding agent',
    examples: [
      ['Sync to Claude Code', '$0 agent sync --agent claude-code'],
      ['Sync to multiple agents', '$0 agent sync --agent claude-code,cursor'],
    ],
  });

  agent = Option.String('--agent,-a', {
    description: 'Target AI agent(s) (comma-separated)',
  });

  async execute(): Promise<number> {
    const searchDirs = [process.cwd()];
    const agents = findAllAgents(searchDirs);

    if (agents.length === 0) {
      console.log(chalk.yellow('No agents found to sync'));
      return 0;
    }

    const targetAgents = this.agent
      ? this.agent.split(',').map(a => a.trim() as AgentType)
      : ['claude-code' as AgentType];

    console.log(chalk.cyan(`Syncing ${agents.length} agent(s)...\n`));

    for (const targetAgent of targetAgents) {
      const outputDir = getAgentTargetDirectory(process.cwd(), targetAgent);

      console.log(chalk.blue(`→ ${targetAgent} (${outputDir})`));

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      for (const agent of agents) {
        const result = translateAgent(agent, targetAgent);
        if (result.success) {
          const outputPath = join(outputDir, result.filename);
          writeFileSync(outputPath, result.content);
          console.log(chalk.green(`  ✓ ${agent.name}`));
        } else {
          console.log(chalk.red(`  ✗ ${agent.name}`));
        }
      }
    }

    console.log();
    console.log(chalk.dim('Sync complete'));

    return 0;
  }
}

export class AgentValidateCommand extends Command {
  static override paths = [['agent', 'validate']];

  static override usage = Command.Usage({
    description: 'Validate agent definitions',
    examples: [
      ['Validate specific agent', '$0 agent validate ./my-agent.md'],
      ['Validate all agents', '$0 agent validate --all'],
    ],
  });

  agentPath = Option.String({ required: false });

  all = Option.Boolean('--all,-a', false, {
    description: 'Validate all discovered agents',
  });

  async execute(): Promise<number> {
    let hasErrors = false;

    if (this.agentPath) {
      // Validate specific path
      const result = validateAgent(this.agentPath);
      printValidationResult(this.agentPath, result);
      hasErrors = !result.valid;
    } else if (this.all) {
      // Validate all agents
      const searchDirs = [process.cwd()];
      const agents = findAllAgents(searchDirs);

      if (agents.length === 0) {
        console.log(chalk.yellow('No agents found'));
        return 0;
      }

      console.log(chalk.cyan(`Validating ${agents.length} agent(s)...\n`));

      for (const agent of agents) {
        const result = validateAgent(agent.path);
        printValidationResult(agent.name, result);
        if (!result.valid) hasErrors = true;
      }
    } else {
      console.log(chalk.yellow('Specify a path or use --all to validate all agents'));
      return 1;
    }

    return hasErrors ? 1 : 0;
  }
}

// Helper functions

function printAgent(agent: CustomAgent): void {
  const status = agent.enabled ? chalk.green('✓') : chalk.red('○');
  const name = agent.enabled ? agent.name : chalk.dim(agent.name);
  const model = agent.frontmatter.model ? chalk.blue(`[${agent.frontmatter.model}]`) : '';
  const desc = chalk.dim(truncate(agent.description, 40));

  console.log(`  ${status} ${name} ${model}`);
  if (agent.description) {
    console.log(`    ${desc}`);
  }
}

function printValidationResult(
  name: string,
  result: { valid: boolean; errors: string[]; warnings: string[] }
): void {
  if (result.valid) {
    console.log(chalk.green(`✓ ${name}`));
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warning}`));
    }
  } else {
    console.log(chalk.red(`✗ ${name}`));
    for (const error of result.errors) {
      console.log(chalk.red(`  • ${error}`));
    }
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warning}`));
    }
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

function generateAgentTemplate(name: string, description: string, model?: string): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push(`name: ${name}`);
  lines.push(`description: ${description}`);
  if (model) {
    lines.push(`model: ${model}`);
  }
  lines.push('# permissionMode: default');
  lines.push('# disallowedTools: []');
  lines.push('# skills: []');
  lines.push('# context: fork');
  lines.push('---');
  lines.push('');
  lines.push(`# ${formatAgentName(name)}`);
  lines.push('');
  lines.push('You are a specialized AI assistant.');
  lines.push('');
  lines.push('## Responsibilities');
  lines.push('');
  lines.push('- TODO: Define what this agent is responsible for');
  lines.push('- TODO: Add specific tasks and behaviors');
  lines.push('');
  lines.push('## Guidelines');
  lines.push('');
  lines.push('- TODO: Add guidelines for how this agent should behave');
  lines.push('- TODO: Define any constraints or preferences');
  lines.push('');

  return lines.join('\n');
}

function formatAgentName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
