import { Command, Option } from 'clipanion';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';
import {
  type AgentType,
  type ProjectContext,
  ContextManager,
  createContextSync,
  analyzeProject,
  getStackTags,
} from '@skillkit/core';
import { getAllAdapters } from '@skillkit/agents';

/**
 * Context command - manage project context for multi-agent sync
 */
export class ContextCommand extends Command {
  static override paths = [['context']];

  static override usage = Command.Usage({
    description: 'Manage project context for multi-agent skill synchronization',
    details: `
      The context command helps you configure your project once and sync skills
      across all AI coding agents.

      Subcommands:
      - init:   Initialize project context with auto-detection
      - show:   Display current project context
      - export: Export context to a file
      - import: Import context from a file
      - sync:   Sync skills to all configured agents
      - detect: Run project detection
    `,
    examples: [
      ['Initialize project context', '$0 context init'],
      ['Show current context', '$0 context show'],
      ['Sync skills to all agents', '$0 context sync'],
      ['Sync to specific agent', '$0 context sync --agent cursor'],
      ['Export context', '$0 context export --output context.yaml'],
    ],
  });

  // Subcommand (init, show, export, import, sync, detect)
  action = Option.String({ required: false });

  // Agent filter
  agent = Option.String('--agent,-a', {
    description: 'Target agent for sync',
  });

  // Output file for export
  output = Option.String('--output,-o', {
    description: 'Output file path',
  });

  // Input file for import
  input = Option.String('--input,-i', {
    description: 'Input file path',
  });

  // Force overwrite
  force = Option.Boolean('--force,-f', false, {
    description: 'Force overwrite existing files',
  });

  // Dry run
  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Preview without making changes',
  });

  // Merge on import
  merge = Option.Boolean('--merge,-m', false, {
    description: 'Merge with existing context on import',
  });

  // JSON output
  json = Option.Boolean('--json,-j', false, {
    description: 'Output in JSON format',
  });

  // Verbose output
  verbose = Option.Boolean('--verbose,-v', false, {
    description: 'Show detailed output',
  });

  async execute(): Promise<number> {
    const action = this.action || 'show';

    switch (action) {
      case 'init':
        return this.initContext();
      case 'show':
        return this.showContext();
      case 'export':
        return this.exportContext();
      case 'import':
        return this.importContext();
      case 'sync':
        return this.syncContext();
      case 'detect':
        return this.detectProject();
      case 'agents':
        return this.listAgents();
      default:
        console.error(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.gray('Available actions: init, show, export, import, sync, detect, agents'));
        return 1;
    }
  }

  /**
   * Initialize project context
   */
  private async initContext(): Promise<number> {
    const manager = new ContextManager(process.cwd());

    if (manager.exists() && !this.force) {
      console.log(chalk.yellow('Context already exists. Use --force to reinitialize.'));
      return this.showContext();
    }

    console.log(chalk.cyan('Initializing project context...\n'));

    const context = manager.init({ force: this.force });

    console.log(chalk.green('✓ Context initialized\n'));
    console.log(chalk.gray(`  Location: .skillkit/context.yaml\n`));

    // Show summary
    this.printContextSummary(context);

    // Detect agents
    const sync = createContextSync(process.cwd());
    const detected = sync.detectAgents();
    if (detected.length > 0) {
      console.log(chalk.cyan('\nDetected agents:'));
      for (const agent of detected) {
        console.log(`  ${chalk.green('•')} ${agent}`);
      }

      // Update context with detected agents
      manager.updateAgents({
        detected,
        synced: detected,
      });
    }

    console.log(chalk.gray('\nRun `skillkit context sync` to sync skills to all agents.'));

    return 0;
  }

  /**
   * Show current context
   */
  private async showContext(): Promise<number> {
    const manager = new ContextManager(process.cwd());
    const context = manager.load();

    if (!context) {
      console.log(chalk.yellow('No context found. Run `skillkit context init` first.'));
      return 1;
    }

    if (this.json) {
      console.log(JSON.stringify(context, null, 2));
      return 0;
    }

    this.printContextSummary(context);

    if (this.verbose) {
      console.log(chalk.gray('\nFull context:'));
      console.log(chalk.gray(JSON.stringify(context, null, 2)));
    }

    return 0;
  }

  /**
   * Export context to file
   */
  private async exportContext(): Promise<number> {
    const manager = new ContextManager(process.cwd());
    const context = manager.get();

    if (!context) {
      console.error(chalk.red('No context found. Run `skillkit context init` first.'));
      return 1;
    }

    const format = this.json ? 'json' : 'yaml';
    const content = manager.export({
      format,
      includeSkills: true,
      includeAgents: true,
    });

    if (this.output) {
      const outputPath = resolve(this.output);
      if (existsSync(outputPath) && !this.force) {
        console.error(chalk.red(`File exists: ${outputPath}. Use --force to overwrite.`));
        return 1;
      }

      writeFileSync(outputPath, content, 'utf-8');
      console.log(chalk.green(`✓ Context exported to ${outputPath}`));
    } else {
      // Print to stdout
      console.log(content);
    }

    return 0;
  }

  /**
   * Import context from file
   */
  private async importContext(): Promise<number> {
    if (!this.input) {
      console.error(chalk.red('Error: --input/-i file path is required'));
      return 1;
    }

    const inputPath = resolve(this.input);
    if (!existsSync(inputPath)) {
      console.error(chalk.red(`File not found: ${inputPath}`));
      return 1;
    }

    const manager = new ContextManager(process.cwd());
    const content = readFileSync(inputPath, 'utf-8');

    try {
      const context = manager.import(content, {
        merge: this.merge,
        overwrite: this.force,
      });

      console.log(chalk.green('✓ Context imported successfully'));
      this.printContextSummary(context);
      return 0;
    } catch (error) {
      console.error(chalk.red(`Import failed: ${error}`));
      return 1;
    }
  }

  /**
   * Sync skills to all configured agents
   */
  private async syncContext(): Promise<number> {
    const manager = new ContextManager(process.cwd());
    const context = manager.get();

    if (!context) {
      console.log(chalk.yellow('No context found. Initializing...'));
      manager.init();
    }

    const sync = createContextSync(process.cwd());

    console.log(chalk.cyan('Syncing skills across agents...\n'));

    // Determine target agents
    const agents = this.agent ? [this.agent as AgentType] : undefined;

    const report = await sync.syncAll({
      agents,
      force: this.force,
      dryRun: this.dryRun,
    });

    // Print results
    for (const result of report.results) {
      const status = result.success ? chalk.green('✓') : chalk.red('✗');
      console.log(`${status} ${result.agent}: ${result.skillsSynced} synced, ${result.skillsSkipped} skipped`);

      if (this.verbose && result.files.length > 0) {
        for (const file of result.files) {
          console.log(chalk.gray(`    → ${file}`));
        }
      }

      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.log(chalk.yellow(`    ⚠ ${warning}`));
        }
      }

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.log(chalk.red(`    ✗ ${error}`));
        }
      }
    }

    console.log();
    console.log(chalk.bold(`Summary: ${report.successfulAgents}/${report.totalAgents} agents, ${report.totalSkills} skills`));

    if (this.dryRun) {
      console.log(chalk.gray('\n(Dry run - no files were written)'));
    }

    return report.successfulAgents === report.totalAgents ? 0 : 1;
  }

  /**
   * Detect project stack
   */
  private async detectProject(): Promise<number> {
    console.log(chalk.cyan('Analyzing project...\n'));

    const stack = analyzeProject(process.cwd());
    const tags = getStackTags(stack);

    // Languages
    if (stack.languages.length > 0) {
      console.log(chalk.bold('Languages:'));
      for (const lang of stack.languages) {
        const version = lang.version ? ` (${lang.version})` : '';
        console.log(`  ${chalk.green('•')} ${lang.name}${version}`);
      }
      console.log();
    }

    // Frameworks
    if (stack.frameworks.length > 0) {
      console.log(chalk.bold('Frameworks:'));
      for (const fw of stack.frameworks) {
        const version = fw.version ? ` (${fw.version})` : '';
        console.log(`  ${chalk.green('•')} ${fw.name}${version}`);
      }
      console.log();
    }

    // Libraries
    if (stack.libraries.length > 0) {
      console.log(chalk.bold('Libraries:'));
      for (const lib of stack.libraries) {
        const version = lib.version ? ` (${lib.version})` : '';
        console.log(`  ${chalk.green('•')} ${lib.name}${version}`);
      }
      console.log();
    }

    // Styling
    if (stack.styling.length > 0) {
      console.log(chalk.bold('Styling:'));
      for (const style of stack.styling) {
        console.log(`  ${chalk.green('•')} ${style.name}`);
      }
      console.log();
    }

    // Testing
    if (stack.testing.length > 0) {
      console.log(chalk.bold('Testing:'));
      for (const test of stack.testing) {
        console.log(`  ${chalk.green('•')} ${test.name}`);
      }
      console.log();
    }

    // Databases
    if (stack.databases.length > 0) {
      console.log(chalk.bold('Databases:'));
      for (const db of stack.databases) {
        console.log(`  ${chalk.green('•')} ${db.name}`);
      }
      console.log();
    }

    // Tools
    if (stack.tools.length > 0) {
      console.log(chalk.bold('Tools:'));
      for (const tool of stack.tools) {
        console.log(`  ${chalk.green('•')} ${tool.name}`);
      }
      console.log();
    }

    // Tags
    if (tags.length > 0) {
      console.log(chalk.bold('Recommended skill tags:'));
      console.log(`  ${chalk.cyan(tags.join(', '))}`);
      console.log();
    }

    if (this.json) {
      console.log(chalk.gray('\nJSON:'));
      console.log(JSON.stringify(stack, null, 2));
    }

    return 0;
  }

  /**
   * List detected agents
   */
  private async listAgents(): Promise<number> {
    const sync = createContextSync(process.cwd());
    const detected = sync.detectAgents();
    const status = sync.checkStatus();
    const adapters = getAllAdapters();

    console.log(chalk.bold('\nAgent Status:\n'));

    for (const [agent, info] of Object.entries(status)) {
      const adapter = adapters.find(a => a.type === agent);
      const name = adapter?.name || agent;
      const isDetected = detected.includes(agent as AgentType);

      const statusIcon = info.hasSkills ? chalk.green('●') : isDetected ? chalk.yellow('○') : chalk.gray('○');
      const skillInfo = info.skillCount > 0 ? chalk.gray(` (${info.skillCount} skills)`) : '';

      console.log(`  ${statusIcon} ${name.padEnd(20)} ${chalk.gray(agent)}${skillInfo}`);

      if (this.verbose && info.skills.length > 0) {
        for (const skill of info.skills) {
          console.log(chalk.gray(`      └─ ${skill}`));
        }
      }
    }

    console.log();
    console.log(chalk.gray('Legend: ● has skills, ○ detected/configured, ○ not detected'));
    console.log();

    return 0;
  }

  /**
   * Print context summary
   */
  private printContextSummary(context: ProjectContext): void {
    console.log(chalk.bold('Project:'));
    console.log(`  Name: ${chalk.cyan(context.project.name)}`);
    if (context.project.type) {
      console.log(`  Type: ${context.project.type}`);
    }
    if (context.project.description) {
      console.log(`  Description: ${context.project.description}`);
    }

    // Stack summary
    const stackItems: string[] = [];
    if (context.stack.languages.length > 0) {
      stackItems.push(`${context.stack.languages.length} languages`);
    }
    if (context.stack.frameworks.length > 0) {
      stackItems.push(`${context.stack.frameworks.length} frameworks`);
    }
    if (context.stack.libraries.length > 0) {
      stackItems.push(`${context.stack.libraries.length} libraries`);
    }
    if (context.stack.databases.length > 0) {
      stackItems.push(`${context.stack.databases.length} databases`);
    }

    if (stackItems.length > 0) {
      console.log(`\n${chalk.bold('Stack:')} ${stackItems.join(', ')}`);

      // Show top items
      const topFrameworks = context.stack.frameworks.slice(0, 3).map(f => f.name);
      if (topFrameworks.length > 0) {
        console.log(`  Frameworks: ${chalk.cyan(topFrameworks.join(', '))}`);
      }

      const topLibs = context.stack.libraries.slice(0, 3).map(l => l.name);
      if (topLibs.length > 0) {
        console.log(`  Libraries: ${chalk.cyan(topLibs.join(', '))}`);
      }
    }

    // Skills summary
    if (context.skills) {
      console.log(`\n${chalk.bold('Skills:')}`);
      console.log(`  Installed: ${context.skills.installed?.length || 0}`);
      console.log(`  Auto-sync: ${context.skills.autoSync ? 'enabled' : 'disabled'}`);
    }

    // Agents summary
    if (context.agents) {
      console.log(`\n${chalk.bold('Agents:')}`);
      if (context.agents.primary) {
        console.log(`  Primary: ${chalk.cyan(context.agents.primary)}`);
      }
      if (context.agents.synced?.length) {
        console.log(`  Synced: ${context.agents.synced.join(', ')}`);
      }
    }
  }
}
