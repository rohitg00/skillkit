import { describe, it, expect } from 'vitest';

describe('CLI Commands', () => {
  describe('exports', () => {
    it('should export all commands', async () => {
      const commands = await import('../commands/index.js');

      expect(commands.ListCommand).toBeDefined();
      expect(commands.ReadCommand).toBeDefined();
      expect(commands.SyncCommand).toBeDefined();
      expect(commands.InitCommand).toBeDefined();
      expect(commands.EnableCommand).toBeDefined();
      expect(commands.DisableCommand).toBeDefined();
      expect(commands.RemoveCommand).toBeDefined();
      expect(commands.InstallCommand).toBeDefined();
      expect(commands.UpdateCommand).toBeDefined();
      expect(commands.ValidateCommand).toBeDefined();
      expect(commands.CreateCommand).toBeDefined();
      expect(commands.UICommand).toBeDefined();
      expect(commands.TranslateCommand).toBeDefined();
      expect(commands.ContextCommand).toBeDefined();
      expect(commands.RecommendCommand).toBeDefined();
    });
  });
});
