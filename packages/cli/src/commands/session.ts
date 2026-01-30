import { Command, Option } from 'clipanion';
import chalk from 'chalk';
import {
  loadSessionFile,
  saveSessionFile,
  createSessionFile,
  updateSessionFile,
  listSessions,
  getMostRecentSession,
  type SessionFile,
} from '@skillkit/core';

export class SessionCommand extends Command {
  static override paths = [['session']];

  static override usage = Command.Usage({
    description: 'Manage session state for context preservation',
    details: `
      Sessions track context across coding sessions, allowing you to
      preserve state across compactions and session restarts.
    `,
    examples: [
      ['Show current session', '$0 session'],
      ['Start new session', '$0 session start'],
      ['Load specific date', '$0 session load 2026-01-30'],
    ],
  });

  async execute(): Promise<number> {
    console.log(chalk.cyan('Session commands:\n'));
    console.log('  session status    Show current session state');
    console.log('  session start     Start a new session');
    console.log('  session load      Load session from specific date');
    console.log('  session list      List recent sessions');
    console.log('  session note      Add note to current session');
    console.log('  session complete  Mark task as completed');
    console.log();
    return 0;
  }
}

export class SessionStatusCommand extends Command {
  static override paths = [['session', 'status']];

  static override usage = Command.Usage({
    description: 'Show current session state',
    examples: [['Show status', '$0 session status']],
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const session = getMostRecentSession();

    if (!session) {
      console.log(chalk.yellow('No active session found'));
      console.log(chalk.dim('Start one with: skillkit session start'));
      return 0;
    }

    if (this.json) {
      console.log(JSON.stringify(session, null, 2));
      return 0;
    }

    this.printSession(session);
    return 0;
  }

  private printSession(session: SessionFile): void {
    console.log(chalk.cyan(`Session: ${session.date}\n`));
    console.log(`Agent: ${session.agent}`);
    console.log(`Project: ${session.projectPath}`);
    console.log(`Started: ${session.startedAt}`);
    console.log(`Last Updated: ${session.lastUpdated}`);
    console.log();

    if (session.completed.length > 0) {
      console.log(chalk.green('Completed:'));
      for (const task of session.completed) {
        console.log(`  ${chalk.green('✓')} ${task}`);
      }
      console.log();
    }

    if (session.inProgress.length > 0) {
      console.log(chalk.yellow('In Progress:'));
      for (const task of session.inProgress) {
        console.log(`  ${chalk.yellow('○')} ${task}`);
      }
      console.log();
    }

    if (session.notes.length > 0) {
      console.log(chalk.blue('Notes for Next Session:'));
      for (const note of session.notes) {
        console.log(`  ${chalk.dim('•')} ${note}`);
      }
      console.log();
    }

    if (session.contextToLoad.length > 0) {
      console.log(chalk.dim('Context to Load:'));
      for (const ctx of session.contextToLoad) {
        console.log(`  ${chalk.dim('•')} ${ctx}`);
      }
    }
  }
}

export class SessionStartCommand extends Command {
  static override paths = [['session', 'start']];

  static override usage = Command.Usage({
    description: 'Start a new session',
    examples: [
      ['Start session', '$0 session start'],
      ['Start with agent', '$0 session start --agent claude-code'],
    ],
  });

  agent = Option.String('--agent,-a', {
    description: 'AI agent being used',
  });

  async execute(): Promise<number> {
    const agent = this.agent || 'claude-code';
    const projectPath = process.cwd();

    const session = createSessionFile(agent, projectPath);
    const filepath = saveSessionFile(session);

    console.log(chalk.green(`✓ Session started: ${session.date}`));
    console.log(chalk.dim(`  Saved to: ${filepath}`));

    return 0;
  }
}

export class SessionLoadCommand extends Command {
  static override paths = [['session', 'load']];

  static override usage = Command.Usage({
    description: 'Load session from specific date',
    examples: [['Load session', '$0 session load 2026-01-30']],
  });

  date = Option.String({ required: false });

  async execute(): Promise<number> {
    const session = this.date ? loadSessionFile(this.date) : getMostRecentSession();

    if (!session) {
      console.log(chalk.yellow('Session not found'));
      return 1;
    }

    console.log(chalk.green(`✓ Loaded session: ${session.date}`));
    console.log();

    if (session.notes.length > 0) {
      console.log(chalk.cyan('Notes from previous session:'));
      for (const note of session.notes) {
        console.log(`  ${chalk.dim('•')} ${note}`);
      }
      console.log();
    }

    if (session.inProgress.length > 0) {
      console.log(chalk.yellow('Tasks still in progress:'));
      for (const task of session.inProgress) {
        console.log(`  ${chalk.yellow('○')} ${task}`);
      }
      console.log();
    }

    if (session.contextToLoad.length > 0) {
      console.log(chalk.dim('Context to load:'));
      for (const ctx of session.contextToLoad) {
        console.log(`  ${ctx}`);
      }
    }

    return 0;
  }
}

export class SessionListCommand extends Command {
  static override paths = [['session', 'list'], ['session', 'ls']];

  static override usage = Command.Usage({
    description: 'List recent sessions',
    examples: [['List sessions', '$0 session list']],
  });

  limit = Option.String('--limit,-l', {
    description: 'Number of sessions to show (default: 10)',
  });

  json = Option.Boolean('--json,-j', false, {
    description: 'Output as JSON',
  });

  async execute(): Promise<number> {
    const limit = this.limit ? parseInt(this.limit) : 10;
    const sessions = listSessions(limit);

    if (sessions.length === 0) {
      console.log(chalk.yellow('No sessions found'));
      return 0;
    }

    if (this.json) {
      console.log(JSON.stringify(sessions, null, 2));
      return 0;
    }

    console.log(chalk.cyan(`Recent Sessions (${sessions.length}):\n`));

    for (const session of sessions) {
      const progress = `${session.completedCount}/${session.taskCount}`;
      const notesIndicator = session.hasNotes ? chalk.blue(' [notes]') : '';
      console.log(`  ${chalk.bold(session.date)} - ${session.agent}`);
      console.log(`    ${chalk.dim(session.projectPath)}`);
      console.log(`    Tasks: ${progress}${notesIndicator}`);
      console.log();
    }

    return 0;
  }
}

export class SessionNoteCommand extends Command {
  static override paths = [['session', 'note']];

  static override usage = Command.Usage({
    description: 'Add note to current session',
    examples: [['Add note', '$0 session note "Remember to test edge cases"']],
  });

  note = Option.String({ required: true });

  async execute(): Promise<number> {
    let session = getMostRecentSession();

    if (!session) {
      session = createSessionFile('claude-code', process.cwd());
    }

    const updated = updateSessionFile(session, {
      notes: [this.note],
    });

    saveSessionFile(updated);

    console.log(chalk.green('✓ Note added'));
    return 0;
  }
}

export class SessionCompleteCommand extends Command {
  static override paths = [['session', 'complete']];

  static override usage = Command.Usage({
    description: 'Mark task as completed',
    examples: [['Mark completed', '$0 session complete "Implemented user auth"']],
  });

  task = Option.String({ required: true });

  async execute(): Promise<number> {
    let session = getMostRecentSession();

    if (!session) {
      session = createSessionFile('claude-code', process.cwd());
    }

    const updated = updateSessionFile(session, {
      completed: [this.task],
    });

    if (session.inProgress.includes(this.task)) {
      updated.inProgress = session.inProgress.filter(t => t !== this.task);
    }

    saveSessionFile(updated);

    console.log(chalk.green(`✓ Completed: ${this.task}`));
    return 0;
  }
}

export class SessionInProgressCommand extends Command {
  static override paths = [['session', 'wip'], ['session', 'progress']];

  static override usage = Command.Usage({
    description: 'Mark task as in progress',
    examples: [['Mark in progress', '$0 session wip "Working on auth flow"']],
  });

  task = Option.String({ required: true });

  async execute(): Promise<number> {
    let session = getMostRecentSession();

    if (!session) {
      session = createSessionFile('claude-code', process.cwd());
    }

    const updated = updateSessionFile(session, {
      inProgress: [...session.inProgress, this.task],
    });

    saveSessionFile(updated);

    console.log(chalk.yellow(`○ In progress: ${this.task}`));
    return 0;
  }
}
