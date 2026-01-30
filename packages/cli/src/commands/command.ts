/**
 * Command CLI
 *
 * Manage slash commands and agent integration.
 */

import { Command, Option } from 'clipanion';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname, extname } from 'node:path';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  createCommandRegistry,
  createCommandGenerator,
  getAgentFormat,
  supportsSlashCommands,
} from '@skillkit/core';
import type { SlashCommand, AgentType } from '@skillkit/core';
import {
  getCommandTemplates,
  getCommandTemplate,
  getCommandTemplatesByCategory,
  type CommandTemplate,
  type CommandCategory,
} from '@skillkit/resources';

export class CommandCmd extends Command {
  static paths = [['command']];

  static usage = Command.Usage({
    category: 'Commands',
    description: 'Manage slash commands and agent integration',
    details: `
      This command provides tools for working with slash commands.

      Actions:
      - list:     List registered commands
      - create:   Create a new command from a skill
      - generate: Generate agent-specific command files
      - validate: Validate command definitions
      - export:   Export commands to a bundle
      - import:   Import commands from a bundle

      Examples:
        $ skillkit command list
        $ skillkit command create my-skill --name my-command
        $ skillkit command generate --agent claude-code
        $ skillkit command validate ./commands.json
    `,
    examples: [
      ['List all commands', '$0 command list'],
      ['Create command from skill', '$0 command create tdd --name run-tdd'],
      ['Generate for Claude Code', '$0 command generate --agent claude-code'],
      ['Export commands', '$0 command export --output commands.json'],
    ],
  });

  action = Option.String({ required: true });

  skill = Option.String('--skill,-s', {
    description: 'Skill to create command from',
  });

  name = Option.String('--name,-n', {
    description: 'Command name',
  });

  description = Option.String('--description,-d', {
    description: 'Command description',
  });

  agent = Option.String('--agent,-a', {
    description: 'Target agent for generation',
  });

  output = Option.String('--output,-o', {
    description: 'Output file or directory',
  });

  input = Option.String('--input,-i', {
    description: 'Input file',
  });

  category = Option.String('--category,-c', {
    description: 'Command category',
  });

  all = Option.Boolean('--all', false, {
    description: 'Include all commands (hidden and disabled)',
  });

  json = Option.Boolean('--json', false, {
    description: 'Output as JSON',
  });

  dryRun = Option.Boolean('--dry-run', false, {
    description: 'Show what would be generated without writing files',
  });

  async execute(): Promise<number> {
    try {
      switch (this.action) {
        case 'list':
          return await this.listCommands();
        case 'create':
          return await this.createCommand();
        case 'generate':
          return await this.generateCommands();
        case 'validate':
          return await this.validateCommands();
        case 'export':
          return await this.exportCommands();
        case 'import':
          return await this.importCommands();
        case 'info':
          return await this.showInfo();
        default:
          this.context.stderr.write(
            `Unknown action: ${this.action}\n` +
              `Available actions: list, create, generate, validate, export, import, info\n`
          );
          return 1;
      }
    } catch (error) {
      this.context.stderr.write(`Error: ${(error as Error).message}\n`);
      return 1;
    }
  }

  private async listCommands(): Promise<number> {
    const registry = createCommandRegistry();

    // Load commands from local config
    await this.loadCommandsFromConfig(registry);

    const commands = registry.search({
      category: this.category,
      includeHidden: this.all,
      includeDisabled: this.all,
    });

    if (this.json) {
      this.context.stdout.write(JSON.stringify(commands, null, 2) + '\n');
    } else {
      if (commands.length === 0) {
        this.context.stdout.write('No commands registered.\n');
        this.context.stdout.write('Use "skillkit command create" to create commands from skills.\n');
        return 0;
      }

      this.context.stdout.write(`Registered Commands (${commands.length}):\n\n`);

      // Group by category
      const categories = new Map<string, typeof commands>();
      for (const cmd of commands) {
        const cat = cmd.category || 'uncategorized';
        if (!categories.has(cat)) {
          categories.set(cat, []);
        }
        categories.get(cat)!.push(cmd);
      }

      for (const [category, cmds] of categories) {
        this.context.stdout.write(`  ${category.toUpperCase()}\n`);
        for (const cmd of cmds) {
          const status = cmd.enabled ? '' : ' (disabled)';
          const hidden = cmd.hidden ? ' (hidden)' : '';
          this.context.stdout.write(`    /${cmd.name}${status}${hidden}\n`);
          this.context.stdout.write(`      ${cmd.description}\n`);
          if (cmd.aliases && cmd.aliases.length > 0) {
            this.context.stdout.write(`      Aliases: ${cmd.aliases.join(', ')}\n`);
          }
        }
        this.context.stdout.write('\n');
      }
    }

    return 0;
  }

  private async createCommand(): Promise<number> {
    if (!this.skill) {
      this.context.stderr.write('Error: --skill is required for create action\n');
      return 1;
    }

    const commandName = this.name || this.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const command: SlashCommand = {
      name: commandName,
      description: this.description || `Execute ${this.skill} skill`,
      skill: this.skill,
      category: this.category,
      examples: [`/${commandName}`],
    };

    // Save to commands config
    const configPath = resolve(process.cwd(), '.skillkit', 'commands.json');
    let commands: SlashCommand[] = [];

    if (existsSync(configPath)) {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      commands = config.commands || [];
    }

    // Check if command already exists
    const existing = commands.findIndex((c) => c.name === commandName);
    if (existing >= 0) {
      // Merge new properties with existing command to preserve metadata
      const previous = commands[existing];
      commands[existing] = {
        ...previous,
        name: commandName,
        skill: this.skill,
        description: this.description ?? previous.description ?? command.description,
        category: this.category ?? previous.category,
        examples: command.examples?.length ? command.examples : previous.examples,
        // Preserve existing metadata if not provided
        aliases: previous.aliases,
        args: previous.args,
        tags: previous.tags,
        hidden: previous.hidden,
        metadata: previous.metadata,
      };
      this.context.stdout.write(`Updated command: /${commandName}\n`);
    } else {
      commands.push(command);
      this.context.stdout.write(`Created command: /${commandName}\n`);
    }

    // Ensure directory exists
    await mkdir(dirname(configPath), { recursive: true });

    // Save config
    await writeFile(
      configPath,
      JSON.stringify({ version: '1.0.0', commands }, null, 2)
    );

    this.context.stdout.write(`Saved to: ${configPath}\n`);

    return 0;
  }

  private async generateCommands(): Promise<number> {
    const agent = (this.agent || 'claude-code') as AgentType;

    if (!supportsSlashCommands(agent)) {
      this.context.stdout.write(`Note: ${agent} has limited slash command support.\n`);
    }

    const registry = createCommandRegistry();
    await this.loadCommandsFromConfig(registry);

    const commands = registry.getAll(this.all);

    if (commands.length === 0) {
      this.context.stderr.write('No commands to generate. Create commands first.\n');
      return 1;
    }

    const generator = createCommandGenerator({
      includeHidden: this.all,
      includeDisabled: this.all,
    });

    const format = getAgentFormat(agent);
    const outputTarget = this.output
      ? resolve(this.output)
      : resolve(process.cwd(), format.directory);
    const outputDir = extname(outputTarget) ? dirname(outputTarget) : outputTarget;

    const result = generator.generate(commands, agent);

    if (typeof result === 'string') {
      // Single file output (e.g., Cursor rules)
      const extension = format.extension
        ? format.extension.startsWith('.') ? format.extension : `.${format.extension}`
        : '.mdc';
      const filePath = extname(outputTarget)
        ? outputTarget
        : join(outputTarget, `commands${extension}`);

      if (this.dryRun) {
        this.context.stdout.write('Would write to: ' + filePath + '\n\n');
        this.context.stdout.write(result);
      } else {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, result);
        this.context.stdout.write(`Generated: ${filePath}\n`);
      }
    } else {
      // Multiple file output
      if (extname(outputTarget)) {
        this.context.stderr.write(
          'Error: --output must be a directory for multi-file formats\n'
        );
        return 1;
      }

      if (this.dryRun) {
        this.context.stdout.write('Would write to: ' + outputDir + '\n\n');
        for (const [filename, content] of result) {
          this.context.stdout.write(`--- ${filename} ---\n`);
          this.context.stdout.write(content.substring(0, 500));
          if (content.length > 500) {
            this.context.stdout.write('\n... (truncated)\n');
          }
          this.context.stdout.write('\n');
        }
      } else {
        await mkdir(outputDir, { recursive: true });
        for (const [filename, content] of result) {
          const filePath = join(outputDir, filename);
          await writeFile(filePath, content);
          this.context.stdout.write(`Generated: ${filePath}\n`);
        }
      }
    }

    // Generate manifest
    const manifestPath = join(outputDir, 'manifest.json');
    const manifest = generator.generateManifest(commands);

    if (!this.dryRun) {
      await writeFile(manifestPath, manifest);
      this.context.stdout.write(`Generated: ${manifestPath}\n`);
    }

    this.context.stdout.write(`\nGenerated ${commands.length} commands for ${agent}\n`);

    return 0;
  }

  private async validateCommands(): Promise<number> {
    const inputPath = this.input || resolve(process.cwd(), '.skillkit', 'commands.json');

    if (!existsSync(inputPath)) {
      this.context.stderr.write(`File not found: ${inputPath}\n`);
      return 1;
    }

    const content = await readFile(inputPath, 'utf-8');
    const config = JSON.parse(content);
    const commands: SlashCommand[] = config.commands || [];

    const registry = createCommandRegistry({ validateOnRegister: false });
    let valid = 0;
    let invalid = 0;

    this.context.stdout.write(`Validating ${commands.length} commands...\n\n`);

    for (const command of commands) {
      const result = registry.validate(command);

      if (result.valid) {
        valid++;
        if (!this.json) {
          this.context.stdout.write(`\u2713 /${command.name}\n`);
        }
      } else {
        invalid++;
        if (!this.json) {
          this.context.stdout.write(`\u2717 /${command.name}\n`);
          for (const error of result.errors) {
            this.context.stdout.write(`    Error: ${error}\n`);
          }
        }
      }

      if (!this.json && result.warnings.length > 0) {
        for (const warning of result.warnings) {
          this.context.stdout.write(`    Warning: ${warning}\n`);
        }
      }
    }

    if (this.json) {
      this.context.stdout.write(
        JSON.stringify({
          total: commands.length,
          valid,
          invalid,
        }) + '\n'
      );
    } else {
      this.context.stdout.write(`\nValidation complete: ${valid} valid, ${invalid} invalid\n`);
    }

    return invalid > 0 ? 1 : 0;
  }

  private async exportCommands(): Promise<number> {
    const registry = createCommandRegistry();
    await this.loadCommandsFromConfig(registry);

    const bundle = registry.export(this.all);

    if (this.output) {
      let outputPath = resolve(this.output);

      // Check if output is a directory or ends with path separator
      const stat = await fs.stat(outputPath).catch(() => null);
      if ((stat && stat.isDirectory()) || this.output.endsWith(path.sep)) {
        outputPath = path.join(outputPath, 'commands.json');
      }

      // Ensure parent directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(bundle, null, 2));
      this.context.stdout.write(`Exported ${bundle.commands.length} commands to: ${outputPath}\n`);
    } else {
      this.context.stdout.write(JSON.stringify(bundle, null, 2) + '\n');
    }

    return 0;
  }

  private async importCommands(): Promise<number> {
    if (!this.input) {
      this.context.stderr.write('Error: --input is required for import action\n');
      return 1;
    }

    const inputPath = resolve(this.input);
    if (!existsSync(inputPath)) {
      this.context.stderr.write(`File not found: ${inputPath}\n`);
      return 1;
    }

    const content = await readFile(inputPath, 'utf-8');
    const bundle = JSON.parse(content);

    // Load existing commands
    const configPath = resolve(process.cwd(), '.skillkit', 'commands.json');
    let existingCommands: SlashCommand[] = [];

    if (existsSync(configPath)) {
      const existingContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(existingContent);
      existingCommands = config.commands || [];
    }

    // Merge commands
    const commandMap = new Map<string, SlashCommand>();
    for (const cmd of existingCommands) {
      commandMap.set(cmd.name, cmd);
    }
    for (const cmd of bundle.commands) {
      commandMap.set(cmd.name, cmd);
    }

    const mergedCommands = Array.from(commandMap.values());

    // Save
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(
      configPath,
      JSON.stringify({ version: '1.0.0', commands: mergedCommands }, null, 2)
    );

    const imported = bundle.commands.length;
    this.context.stdout.write(`Imported ${imported} commands\n`);
    this.context.stdout.write(`Total commands: ${mergedCommands.length}\n`);
    this.context.stdout.write(`Saved to: ${configPath}\n`);

    return 0;
  }

  private async showInfo(): Promise<number> {
    const agent = (this.agent || 'claude-code') as AgentType;
    const format = getAgentFormat(agent);

    if (this.json) {
      this.context.stdout.write(JSON.stringify(format, null, 2) + '\n');
    } else {
      this.context.stdout.write(`Agent: ${agent}\n`);
      this.context.stdout.write(`Directory: ${format.directory}\n`);
      this.context.stdout.write(`Extension: ${format.extension}\n`);
      this.context.stdout.write(`Supports Slash Commands: ${format.supportsSlashCommands}\n`);
      this.context.stdout.write(`Supports Command Files: ${format.supportsCommandFiles}\n`);
    }

    return 0;
  }

  private async loadCommandsFromConfig(
    registry: ReturnType<typeof createCommandRegistry>
  ): Promise<void> {
    const configPath = resolve(process.cwd(), '.skillkit', 'commands.json');

    if (existsSync(configPath)) {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      const commands: SlashCommand[] = config.commands || [];

      for (const command of commands) {
        try {
          registry.register(command);
        } catch {
          // Skip invalid commands
        }
      }
    }
  }
}

export class CommandAvailableCommand extends Command {
  static override paths = [['command', 'available']];

  static override usage = Command.Usage({
    category: 'Commands',
    description: 'List available bundled command templates',
    examples: [
      ['List all available', '$0 command available'],
      ['Filter by category', '$0 command available --category testing'],
    ],
  });

  category = Option.String('--category,-c', {
    description: 'Filter by category (testing, planning, development, review, workflow, learning)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const templates = this.category
      ? getCommandTemplatesByCategory(this.category as CommandCategory)
      : getCommandTemplates();

    if (this.json) {
      this.context.stdout.write(JSON.stringify(templates, null, 2) + '\n');
      return 0;
    }

    this.context.stdout.write(`Available Command Templates (${templates.length}):\n\n`);

    const byCategory = new Map<string, CommandTemplate[]>();
    for (const template of templates) {
      const cat = template.category || 'general';
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(template);
    }

    for (const [category, catTemplates] of byCategory) {
      this.context.stdout.write(`  ${category.toUpperCase()}\n`);
      for (const template of catTemplates) {
        const agent = template.agent ? ` [${template.agent}]` : '';
        this.context.stdout.write(`    ${template.trigger}${agent}\n`);
        this.context.stdout.write(`      ${template.description}\n`);
      }
      this.context.stdout.write('\n');
    }

    this.context.stdout.write('Install with: skillkit command install <id>\n');

    return 0;
  }
}

export class CommandInstallCommand extends Command {
  static override paths = [['command', 'install']];

  static override usage = Command.Usage({
    category: 'Commands',
    description: 'Install a bundled command template',
    examples: [
      ['Install TDD command', '$0 command install tdd'],
      ['Install code review', '$0 command install code-review'],
    ],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const template = getCommandTemplate(this.id);

    if (!template) {
      this.context.stderr.write(`Command template not found: ${this.id}\n`);
      this.context.stderr.write('Run "skillkit command available" to see available templates.\n');
      return 1;
    }

    const command: SlashCommand = {
      name: template.id,
      description: template.description,
      skill: `template:${template.id}`,
      category: template.category,
      examples: template.examples,
      metadata: {
        templateId: template.id,
        trigger: template.trigger,
        agent: template.agent,
        prompt: template.prompt,
      },
    };

    const configPath = resolve(process.cwd(), '.skillkit', 'commands.json');
    let commands: SlashCommand[] = [];

    if (existsSync(configPath)) {
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      commands = config.commands || [];
    }

    const existing = commands.findIndex((c) => c.name === template.id);
    if (existing >= 0) {
      commands[existing] = command;
      this.context.stdout.write(`Updated command: ${template.trigger}\n`);
    } else {
      commands.push(command);
      this.context.stdout.write(`Installed command: ${template.trigger}\n`);
    }

    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(
      configPath,
      JSON.stringify({ version: '1.0.0', commands }, null, 2)
    );

    this.context.stdout.write(`  Name: ${template.name}\n`);
    this.context.stdout.write(`  Description: ${template.description}\n`);
    if (template.agent) {
      this.context.stdout.write(`  Agent: ${template.agent}\n`);
    }
    this.context.stdout.write(`\nSaved to: ${configPath}\n`);

    return 0;
  }
}
