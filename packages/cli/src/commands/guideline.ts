import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import {
  getAllGuidelines,
  getEnabledGuidelines,
  getGuideline,
  enableGuideline,
  disableGuideline,
  isGuidelineEnabled,
  isBuiltinGuideline,
  addCustomGuideline,
  removeCustomGuideline,
  type Guideline,
  type GuidelineCategory,
} from '@skillkit/core';

export class GuidelineCommand extends Command {
  static override paths = [['guideline'], ['guide']];

  static override usage = Command.Usage({
    description: 'Manage coding guidelines (always-on rules)',
    details: `
      Guidelines are always-on coding standards that guide agent behavior.
      Enable or disable guidelines based on your project needs.
    `,
    examples: [
      ['List guidelines', '$0 guideline list'],
      ['Enable guideline', '$0 guideline enable security'],
      ['Disable guideline', '$0 guideline disable performance'],
    ],
  });

  async execute(): Promise<number> {
    console.log(chalk.cyan('Guideline commands:\n'));
    console.log('  guideline list        List all guidelines');
    console.log('  guideline show <id>   Show guideline content');
    console.log('  guideline enable      Enable a guideline');
    console.log('  guideline disable     Disable a guideline');
    console.log('  guideline create      Create custom guideline');
    console.log();
    return 0;
  }
}

export class GuidelineListCommand extends Command {
  static override paths = [['guideline', 'list'], ['guideline', 'ls']];

  static override usage = Command.Usage({
    description: 'List all guidelines',
    examples: [
      ['List all', '$0 guideline list'],
      ['Show only enabled', '$0 guideline list --enabled'],
    ],
  });

  enabled = Option.Boolean('--enabled,-e', false, {
    description: 'Show only enabled guidelines',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const guidelines = this.enabled ? getEnabledGuidelines() : getAllGuidelines();

    if (this.json) {
      console.log(JSON.stringify(guidelines, null, 2));
      return 0;
    }

    const title = this.enabled ? 'Enabled Guidelines' : 'All Guidelines';
    console.log(chalk.cyan(`${title} (${guidelines.length}):\n`));

    const byCategory = new Map<GuidelineCategory, Guideline[]>();
    for (const guideline of guidelines) {
      if (!byCategory.has(guideline.category)) {
        byCategory.set(guideline.category, []);
      }
      byCategory.get(guideline.category)!.push(guideline);
    }

    for (const [category, catGuidelines] of byCategory) {
      console.log(chalk.blue(`  ${formatCategoryName(category)}`));

      for (const guideline of catGuidelines) {
        const enabled = isGuidelineEnabled(guideline.id);
        const status = enabled ? chalk.green('●') : chalk.dim('○');
        const custom = isBuiltinGuideline(guideline.id) ? '' : chalk.dim(' (custom)');
        const priority = chalk.dim(`[${guideline.priority}]`);

        console.log(`    ${status} ${chalk.bold(guideline.id)} ${priority}${custom}`);
        console.log(`      ${chalk.dim(guideline.description)}`);
      }
      console.log();
    }

    console.log(chalk.dim('Enable with: skillkit guideline enable <id>'));
    console.log(chalk.dim('Show content: skillkit guideline show <id>'));

    return 0;
  }
}

export class GuidelineShowCommand extends Command {
  static override paths = [['guideline', 'show']];

  static override usage = Command.Usage({
    description: 'Show guideline content',
    examples: [['Show guideline', '$0 guideline show security']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const guideline = getGuideline(this.id);

    if (!guideline) {
      console.log(chalk.red(`Guideline not found: ${this.id}`));
      return 1;
    }

    const enabled = isGuidelineEnabled(this.id);
    const status = enabled ? chalk.green('enabled') : chalk.dim('disabled');

    console.log(chalk.cyan(`Guideline: ${guideline.name}\n`));
    console.log(`ID: ${guideline.id}`);
    console.log(`Category: ${guideline.category}`);
    console.log(`Priority: ${guideline.priority}`);
    console.log(`Status: ${status}`);
    console.log();
    console.log(chalk.bold('Content:'));
    console.log(guideline.content);

    return 0;
  }
}

export class GuidelineEnableCommand extends Command {
  static override paths = [['guideline', 'enable']];

  static override usage = Command.Usage({
    description: 'Enable a guideline',
    examples: [['Enable security', '$0 guideline enable security']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const success = enableGuideline(this.id);

    if (!success) {
      console.log(chalk.red(`Guideline not found: ${this.id}`));
      return 1;
    }

    console.log(chalk.green(`✓ Enabled guideline: ${this.id}`));
    return 0;
  }
}

export class GuidelineDisableCommand extends Command {
  static override paths = [['guideline', 'disable']];

  static override usage = Command.Usage({
    description: 'Disable a guideline',
    examples: [['Disable performance', '$0 guideline disable performance']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    const success = disableGuideline(this.id);

    if (!success) {
      console.log(chalk.yellow(`Guideline not found or already disabled: ${this.id}`));
      return 0;
    }

    console.log(chalk.green(`✓ Disabled guideline: ${this.id}`));
    return 0;
  }
}

export class GuidelineCreateCommand extends Command {
  static override paths = [['guideline', 'create']];

  static override usage = Command.Usage({
    description: 'Create a custom guideline',
    examples: [
      ['Create guideline', '$0 guideline create --id my-rules --name "My Rules" --category custom'],
    ],
  });

  id = Option.String('--id', {
    description: 'Guideline ID',
    required: true,
  });

  name = Option.String('--name,-n', {
    description: 'Guideline name',
    required: true,
  });

  description = Option.String('--description,-d', {
    description: 'Guideline description',
  });

  category = Option.String('--category,-c', {
    description: 'Category (security, code-style, testing, git, performance, custom)',
  });

  priority = Option.String('--priority,-p', {
    description: 'Priority (1-10, higher = more important)',
  });

  async execute(): Promise<number> {
    if (isBuiltinGuideline(this.id)) {
      console.log(chalk.red(`Cannot create: ${this.id} is a built-in guideline`));
      return 1;
    }

    const guideline: Guideline = {
      id: this.id,
      name: this.name,
      description: this.description || this.name,
      category: (this.category as GuidelineCategory) || 'custom',
      priority: this.priority ? parseInt(this.priority) : 5,
      enabled: true,
      scope: 'global',
      content: `## ${this.name}\n\nAdd your guidelines here.`,
    };

    addCustomGuideline(guideline);
    enableGuideline(this.id);

    console.log(chalk.green(`✓ Created guideline: ${this.id}`));
    console.log(chalk.dim('Edit ~/.skillkit/guidelines.yaml to customize content'));

    return 0;
  }
}

export class GuidelineRemoveCommand extends Command {
  static override paths = [['guideline', 'remove'], ['guideline', 'rm']];

  static override usage = Command.Usage({
    description: 'Remove a custom guideline',
    examples: [['Remove guideline', '$0 guideline remove my-rules']],
  });

  id = Option.String({ required: true });

  async execute(): Promise<number> {
    if (isBuiltinGuideline(this.id)) {
      console.log(chalk.red(`Cannot remove built-in guideline: ${this.id}`));
      return 1;
    }

    const removed = removeCustomGuideline(this.id);

    if (!removed) {
      console.log(chalk.yellow(`Guideline not found: ${this.id}`));
      return 1;
    }

    console.log(chalk.green(`✓ Removed guideline: ${this.id}`));
    return 0;
  }
}

function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
