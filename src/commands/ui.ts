import { Command } from 'clipanion';

export class UICommand extends Command {
  static override paths = [['ui'], ['tui']];

  static override usage = Command.Usage({
    description: 'Launch the interactive TUI (Terminal User Interface)',
    examples: [
      ['Open interactive TUI', '$0 ui'],
      ['Alias for TUI', '$0 tui'],
    ],
  });

  async execute(): Promise<number> {
    const { startTUI } = await import('../tui/index.js');
    await startTUI();
    return 0;
  }
}
