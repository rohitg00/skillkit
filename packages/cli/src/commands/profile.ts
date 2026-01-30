import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import {
  getActiveProfile,
  setActiveProfile,
  getProfile,
  getAllProfiles,
  addCustomProfile,
  removeCustomProfile,
  isBuiltinProfile,
  type ProfileName,
  type OperationalProfile,
} from '@skillkit/core';

export class ProfileCommand extends Command {
  static override paths = [['profile']];

  static override usage = Command.Usage({
    description: 'Manage operational profiles (dev, review, research modes)',
    details: `
      Profiles adjust agent behavior for different tasks.
      Switch between modes like development, code review, or research.
    `,
    examples: [
      ['Show current profile', '$0 profile'],
      ['Switch to review mode', '$0 profile review'],
      ['List all profiles', '$0 profile list'],
    ],
  });

  name = Option.String({ required: false });

  async execute(): Promise<number> {
    if (this.name) {
      const profile = getProfile(this.name as ProfileName);

      if (!profile) {
        console.log(chalk.red(`Profile not found: ${this.name}`));
        console.log(chalk.dim('Run `skillkit profile list` to see available profiles'));
        return 1;
      }

      setActiveProfile(this.name as ProfileName);
      console.log(chalk.green(`✓ Switched to ${profile.name} mode`));
      console.log(chalk.dim(`  Focus: ${profile.focus}`));
      return 0;
    }

    const active = getActiveProfile();
    const profile = getProfile(active);

    console.log(chalk.cyan(`Current Profile: ${active}\n`));

    if (profile) {
      console.log(`Description: ${profile.description}`);
      console.log(`Focus: ${profile.focus}`);
      console.log();
      console.log(chalk.bold('Behaviors:'));
      for (const behavior of profile.behaviors) {
        console.log(`  • ${behavior}`);
      }
      console.log();
      console.log(chalk.bold('Priorities:'));
      console.log(`  ${profile.priorities.join(' > ')}`);

      if (profile.preferredTools?.length) {
        console.log();
        console.log(chalk.bold('Preferred Tools:'));
        console.log(`  ${profile.preferredTools.join(', ')}`);
      }

      if (profile.avoidTools?.length) {
        console.log(chalk.bold('Avoid Tools:'));
        console.log(`  ${profile.avoidTools.join(', ')}`);
      }
    }

    console.log();
    console.log(chalk.dim('Switch with: skillkit profile <name>'));

    return 0;
  }
}

export class ProfileListCommand extends Command {
  static override paths = [['profile', 'list'], ['profile', 'ls']];

  static override usage = Command.Usage({
    description: 'List available profiles',
    examples: [['List profiles', '$0 profile list']],
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const profiles = getAllProfiles();
    const active = getActiveProfile();

    if (this.json) {
      console.log(JSON.stringify({ active, profiles }, null, 2));
      return 0;
    }

    console.log(chalk.cyan('Available Profiles:\n'));

    for (const profile of profiles) {
      const isActive = profile.name === active;
      const marker = isActive ? chalk.green('●') : chalk.dim('○');
      const name = isActive ? chalk.bold(profile.name) : profile.name;
      const type = isBuiltinProfile(profile.name) ? '' : chalk.dim(' (custom)');

      console.log(`  ${marker} ${name}${type}`);
      console.log(`    ${chalk.dim(profile.description)}`);
      console.log(`    Focus: ${profile.focus}`);
      console.log();
    }

    console.log(chalk.dim('Switch with: skillkit profile <name>'));

    return 0;
  }
}

export class ProfileCreateCommand extends Command {
  static override paths = [['profile', 'create']];

  static override usage = Command.Usage({
    description: 'Create a custom profile',
    examples: [
      ['Create profile', '$0 profile create --name my-profile --description "My custom profile"'],
    ],
  });

  name = Option.String('--name,-n', {
    description: 'Profile name',
    required: true,
  });

  description = Option.String('--description,-d', {
    description: 'Profile description',
    required: true,
  });

  focus = Option.String('--focus,-f', {
    description: 'Profile focus',
  });

  async execute(): Promise<number> {
    if (isBuiltinProfile(this.name as ProfileName)) {
      console.log(chalk.red(`Cannot create profile: ${this.name} is a built-in profile`));
      return 1;
    }

    const profile: OperationalProfile = {
      name: this.name as ProfileName,
      description: this.description,
      focus: this.focus || this.description,
      behaviors: [],
      priorities: [],
    };

    addCustomProfile(profile);

    console.log(chalk.green(`✓ Created profile: ${this.name}`));
    console.log(chalk.dim('Edit ~/.skillkit/profiles.yaml to customize'));

    return 0;
  }
}

export class ProfileRemoveCommand extends Command {
  static override paths = [['profile', 'remove'], ['profile', 'rm']];

  static override usage = Command.Usage({
    description: 'Remove a custom profile',
    examples: [['Remove profile', '$0 profile remove my-profile']],
  });

  name = Option.String({ required: true });

  async execute(): Promise<number> {
    if (isBuiltinProfile(this.name as ProfileName)) {
      console.log(chalk.red(`Cannot remove built-in profile: ${this.name}`));
      return 1;
    }

    const removed = removeCustomProfile(this.name as ProfileName);

    if (!removed) {
      console.log(chalk.yellow(`Profile not found: ${this.name}`));
      return 1;
    }

    console.log(chalk.green(`✓ Removed profile: ${this.name}`));

    return 0;
  }
}
