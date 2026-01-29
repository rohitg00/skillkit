import { Command } from 'clipanion';

/**
 * UI Command - Launch the SkillKit TUI
 * Uses the unified OpenTUI-based interface
 */
export class UICommand extends Command {
  static override paths = [['ui'], ['tui']];

  static override usage = Command.Usage({
    description: 'Launch the interactive TUI (Terminal User Interface)',
    details: `
      Launches the SkillKit TUI with a beautiful monochromatic design.
      
      Features:
      - Browse and discover skills from the marketplace
      - Manage installed skills across 32 AI coding agents
      - Sync skills between agents
      - AI-powered recommendations
      - Team collaboration
      
      Requires Bun runtime (>=1.2.0) for optimal performance.
    `,
    examples: [
      ['Open interactive TUI', '$0 ui'],
      ['Alias for TUI', '$0 tui'],
    ],
  });

  async execute(): Promise<number> {
    try {
      const { startTUI } = await import('@skillkit/tui');
      await startTUI();
      return 0;
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error launching TUI:', err.message);
        console.error('');
        console.error('The TUI requires Bun runtime (>=1.2.0). Run with:');
        console.error('  bun $(which skillkit) ui');
        console.error('');
        console.error('Or from source directory:');
        console.error('  bun ./apps/skillkit/dist/cli.js ui');
        console.error('');
        console.error('Install Bun from: https://bun.sh');
      }
      return 1;
    }
  }
}
