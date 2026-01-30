/**
 * Hook Command
 *
 * Manage skill hooks for automatic triggering
 */

import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import { createHookManager, type HookEvent, type InjectionMode } from '@skillkit/core';
import {
  getHookTemplates,
  getHookTemplate,
  getHookTemplatesByCategory,
  type HookTemplate,
  type HookTemplateCategory,
} from '@skillkit/resources';

export class HookCommand extends Command {
  static override paths = [['hook']];

  static override usage = Command.Usage({
    description: 'Manage skill hooks for automatic triggering',
    examples: [
      ['List all hooks', '$0 hook list'],
      ['Add a session start hook', '$0 hook add session:start tdd-workflow'],
      ['Add a file save hook with pattern', '$0 hook add file:save code-review --pattern "*.ts"'],
      ['Remove a hook', '$0 hook remove <hook-id>'],
      ['Enable a hook', '$0 hook enable <hook-id>'],
      ['Disable a hook', '$0 hook disable <hook-id>'],
      ['Generate agent hooks', '$0 hook generate --agent claude-code'],
    ],
  });

  action = Option.String({ required: true });
  target = Option.String({ required: false });
  skill = Option.String({ required: false });
  pattern = Option.String('--pattern,-p', { description: 'File pattern matcher' });
  agent = Option.String('--agent,-a', { description: 'Target agent for generation' });
  inject = Option.String('--inject,-i', { description: 'Injection mode: content, reference, prompt' });
  priority = Option.String('--priority', { description: 'Hook priority (higher = earlier)' });
  verbose = Option.Boolean('--verbose,-v', { description: 'Show detailed output' });

  async execute(): Promise<number> {
    const projectPath = process.cwd();

    try {
      switch (this.action) {
        case 'list':
          return await this.listHooks(projectPath);
        case 'add':
          return await this.addHook(projectPath);
        case 'remove':
          return await this.removeHook(projectPath);
        case 'enable':
          return await this.enableHook(projectPath);
        case 'disable':
          return await this.disableHook(projectPath);
        case 'generate':
          return await this.generateHooks(projectPath);
        case 'info':
          return await this.showHookInfo(projectPath);
        default:
          this.context.stderr.write(chalk.red(`Unknown action: ${this.action}\n`));
          this.context.stderr.write('Available actions: list, add, remove, enable, disable, generate, info\n');
          return 1;
      }
    } catch (err) {
      this.context.stderr.write(chalk.red(`✗ ${err instanceof Error ? err.message : 'Unknown error'}\n`));
      return 1;
    }
  }

  private async listHooks(projectPath: string): Promise<number> {
    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();

    if (hooks.length === 0) {
      this.context.stdout.write('No hooks configured.\n');
      this.context.stdout.write(chalk.gray('Run `skillkit hook add <event> <skill>` to add a hook.\n'));
      return 0;
    }

    this.context.stdout.write(chalk.cyan('Configured Hooks:\n\n'));

    // Group by event
    const eventGroups = new Map<string, typeof hooks>();
    for (const hook of hooks) {
      const group = eventGroups.get(hook.event) || [];
      group.push(hook);
      eventGroups.set(hook.event, group);
    }

    for (const [event, eventHooks] of eventGroups) {
      this.context.stdout.write(chalk.yellow(`${event}:\n`));
      for (const hook of eventHooks) {
        const status = hook.enabled ? chalk.green('●') : chalk.gray('○');
        this.context.stdout.write(`  ${status} ${chalk.white(hook.id.slice(0, 8))} → ${hook.skills.join(', ')}\n`);
        if (hook.matcher) {
          this.context.stdout.write(chalk.gray(`    Pattern: ${hook.matcher}\n`));
        }
        if (this.verbose) {
          this.context.stdout.write(chalk.gray(`    Inject: ${hook.inject}, Priority: ${hook.priority || 0}\n`));
        }
      }
    }

    this.context.stdout.write(`\nTotal: ${hooks.length} hooks\n`);
    return 0;
  }

  private async addHook(projectPath: string): Promise<number> {
    if (!this.target) {
      this.context.stderr.write(chalk.red('Event type required.\n'));
      this.context.stderr.write('Usage: skillkit hook add <event> <skill>\n');
      this.context.stderr.write('Events: session:start, session:end, file:save, file:open, task:start, commit:pre, commit:post, error:occur, test:fail, build:fail\n');
      return 1;
    }

    if (!this.skill) {
      this.context.stderr.write(chalk.red('Skill name required.\n'));
      this.context.stderr.write('Usage: skillkit hook add <event> <skill>\n');
      return 1;
    }

    const event = this.target as HookEvent;
    const validEvents: HookEvent[] = [
      'session:start', 'session:resume', 'session:end',
      'file:open', 'file:save', 'file:create', 'file:delete',
      'task:start', 'task:complete',
      'commit:pre', 'commit:post',
      'error:occur', 'test:fail', 'test:pass',
      'build:start', 'build:fail', 'build:success',
    ];

    if (!validEvents.includes(event)) {
      this.context.stderr.write(chalk.red(`Invalid event: ${this.target}\n`));
      this.context.stderr.write(`Valid events: ${validEvents.join(', ')}\n`);
      return 1;
    }

    const manager = createHookManager({ projectPath });

    const hook = manager.registerHook({
      event,
      skills: [this.skill],
      inject: (this.inject as InjectionMode) || 'reference',
      matcher: this.pattern,
      priority: this.priority ? parseInt(this.priority, 10) : 0,
      enabled: true,
    });

    manager.save();

    this.context.stdout.write(chalk.green(`✓ Hook added: ${hook.id.slice(0, 8)}\n`));
    this.context.stdout.write(`  Event: ${event}\n`);
    this.context.stdout.write(`  Skill: ${this.skill}\n`);
    if (this.pattern) {
      this.context.stdout.write(`  Pattern: ${this.pattern}\n`);
    }

    return 0;
  }

  private async removeHook(projectPath: string): Promise<number> {
    if (!this.target) {
      this.context.stderr.write(chalk.red('Hook ID required.\n'));
      this.context.stderr.write('Usage: skillkit hook remove <hook-id>\n');
      return 1;
    }

    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();

    // Find hook by ID prefix
    const hook = hooks.find((h) => h.id.startsWith(this.target!));
    if (!hook) {
      this.context.stderr.write(chalk.red(`Hook not found: ${this.target}\n`));
      return 1;
    }

    manager.unregisterHook(hook.id);
    manager.save();

    this.context.stdout.write(chalk.green(`✓ Hook removed: ${hook.id.slice(0, 8)}\n`));
    return 0;
  }

  private async enableHook(projectPath: string): Promise<number> {
    if (!this.target) {
      this.context.stderr.write(chalk.red('Hook ID required.\n'));
      return 1;
    }

    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();
    const hook = hooks.find((h) => h.id.startsWith(this.target!));

    if (!hook) {
      this.context.stderr.write(chalk.red(`Hook not found: ${this.target}\n`));
      return 1;
    }

    manager.enableHook(hook.id);
    manager.save();

    this.context.stdout.write(chalk.green(`✓ Hook enabled: ${hook.id.slice(0, 8)}\n`));
    return 0;
  }

  private async disableHook(projectPath: string): Promise<number> {
    if (!this.target) {
      this.context.stderr.write(chalk.red('Hook ID required.\n'));
      return 1;
    }

    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();
    const hook = hooks.find((h) => h.id.startsWith(this.target!));

    if (!hook) {
      this.context.stderr.write(chalk.red(`Hook not found: ${this.target}\n`));
      return 1;
    }

    manager.disableHook(hook.id);
    manager.save();

    this.context.stdout.write(chalk.yellow(`○ Hook disabled: ${hook.id.slice(0, 8)}\n`));
    return 0;
  }

  private async generateHooks(projectPath: string): Promise<number> {
    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();

    if (hooks.length === 0) {
      this.context.stdout.write('No hooks configured to generate.\n');
      return 0;
    }

    const agent = this.agent || 'claude-code';
    const generated = manager.generateAgentHooks(agent as any);

    this.context.stdout.write(chalk.cyan(`Generated hooks for ${agent}:\n\n`));

    if (typeof generated === 'string') {
      this.context.stdout.write(generated);
    } else {
      this.context.stdout.write(JSON.stringify(generated, null, 2));
    }

    this.context.stdout.write('\n');
    return 0;
  }

  private async showHookInfo(projectPath: string): Promise<number> {
    if (!this.target) {
      this.context.stderr.write(chalk.red('Hook ID required.\n'));
      return 1;
    }

    const manager = createHookManager({ projectPath });
    const hooks = manager.getAllHooks();
    const hook = hooks.find((h) => h.id.startsWith(this.target!));

    if (!hook) {
      this.context.stderr.write(chalk.red(`Hook not found: ${this.target}\n`));
      return 1;
    }

    this.context.stdout.write(chalk.cyan(`\nHook: ${hook.id}\n`));
    this.context.stdout.write(`Event: ${hook.event}\n`);
    this.context.stdout.write(`Skills: ${hook.skills.join(', ')}\n`);
    this.context.stdout.write(`Enabled: ${hook.enabled ? 'Yes' : 'No'}\n`);
    this.context.stdout.write(`Inject: ${hook.inject}\n`);
    this.context.stdout.write(`Priority: ${hook.priority || 0}\n`);
    if (hook.matcher) {
      this.context.stdout.write(`Pattern: ${hook.matcher}\n`);
    }
    if (hook.condition) {
      this.context.stdout.write(`Condition: ${hook.condition}\n`);
    }
    if (hook.agentOverrides) {
      this.context.stdout.write(`Agent Overrides: ${Object.keys(hook.agentOverrides).join(', ')}\n`);
    }

    return 0;
  }
}

export class HookTemplateListCommand extends Command {
  static override paths = [['hook', 'template', 'list']];

  static override usage = Command.Usage({
    description: 'List available hook templates',
    examples: [
      ['List all templates', '$0 hook template list'],
      ['Filter by category', '$0 hook template list --category quality'],
    ],
  });

  category = Option.String('--category,-c', {
    description: 'Filter by category (security, quality, workflow, productivity)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    let templates = this.category
      ? getHookTemplatesByCategory(this.category as HookTemplateCategory)
      : getHookTemplates();

    if (this.json) {
      console.log(JSON.stringify(templates, null, 2));
      return 0;
    }

    console.log(chalk.cyan(`Hook Templates (${templates.length}):\n`));

    const byCategory = new Map<HookTemplateCategory, HookTemplate[]>();
    for (const template of templates) {
      if (!byCategory.has(template.category)) {
        byCategory.set(template.category, []);
      }
      byCategory.get(template.category)!.push(template);
    }

    for (const [category, catTemplates] of byCategory) {
      console.log(chalk.blue(`  ${formatCategory(category)}`));
      for (const template of catTemplates) {
        const blocking = template.blocking ? chalk.yellow(' [blocking]') : '';
        console.log(`    ${chalk.bold(template.id)}${blocking}`);
        console.log(`      ${chalk.dim(template.description)}`);
        console.log(`      Event: ${template.event}`);
      }
      console.log();
    }

    console.log(chalk.dim('Apply with: skillkit hook template apply <id>'));

    return 0;
  }
}

export class HookTemplateApplyCommand extends Command {
  static override paths = [['hook', 'template', 'apply']];

  static override usage = Command.Usage({
    description: 'Apply a hook template',
    examples: [
      ['Apply typescript-check', '$0 hook template apply typescript-check'],
      ['Apply security-scan', '$0 hook template apply security-scan'],
    ],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const template = getHookTemplate(this.id);

    if (!template) {
      console.log(chalk.red(`Template not found: ${this.id}`));
      console.log(chalk.dim('Run `skillkit hook template list` to see available templates'));
      return 1;
    }

    const projectPath = process.cwd();
    const manager = createHookManager({ projectPath });

    const hook = manager.registerHook({
      event: template.event as HookEvent,
      skills: [`template:${template.id}`],
      inject: 'content',
      matcher: template.matcher,
      enabled: true,
      metadata: {
        templateId: template.id,
        command: template.command,
        timeout: template.timeout,
        blocking: template.blocking,
      },
    });

    manager.save();

    console.log(chalk.green(`✓ Applied template: ${template.name}`));
    console.log(`  Hook ID: ${hook.id.slice(0, 8)}`);
    console.log(`  Event: ${template.event}`);
    console.log(`  Command: ${chalk.dim(template.command)}`);
    if (template.blocking) {
      console.log(chalk.yellow(`  Blocking: yes`));
    }

    return 0;
  }
}

export class HookTemplateShowCommand extends Command {
  static override paths = [['hook', 'template', 'show']];

  static override usage = Command.Usage({
    description: 'Show hook template details',
    examples: [['Show template', '$0 hook template show typescript-check']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const template = getHookTemplate(this.id);

    if (!template) {
      console.log(chalk.red(`Template not found: ${this.id}`));
      return 1;
    }

    console.log(chalk.cyan(`Template: ${template.name}\n`));
    console.log(`ID: ${template.id}`);
    console.log(`Category: ${template.category}`);
    console.log(`Description: ${template.description}`);
    console.log(`Event: ${template.event}`);
    if (template.matcher) {
      console.log(`Matcher: ${template.matcher}`);
    }
    console.log(`Blocking: ${template.blocking ? 'yes' : 'no'}`);
    console.log(`Timeout: ${template.timeout || 30000}ms`);
    console.log();
    console.log(chalk.bold('Command:'));
    console.log(`  ${template.command}`);

    return 0;
  }
}

function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
