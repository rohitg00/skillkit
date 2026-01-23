import { describe, it, expect } from 'vitest';

describe('TUI Components', () => {
  describe('exports', () => {
    it('should export App component', async () => {
      const { App } = await import('../App.js');
      expect(App).toBeDefined();
      expect(typeof App).toBe('function');
    });

    it('should export theme configuration', async () => {
      const { colors, symbols } = await import('../theme.js');
      expect(colors).toBeDefined();
      expect(symbols).toBeDefined();
    });

    it('should export all screens', async () => {
      const screens = await import('../screens/index.js');
      expect(screens.Home).toBeDefined();
      expect(screens.Browse).toBeDefined();
      expect(screens.Installed).toBeDefined();
      expect(screens.Sync).toBeDefined();
      expect(screens.Settings).toBeDefined();
      expect(screens.Recommend).toBeDefined();
    });

    it('should export all hooks', async () => {
      const hooks = await import('../hooks/index.js');
      expect(hooks.useSkills).toBeDefined();
      expect(hooks.useMarketplace).toBeDefined();
      expect(hooks.useKeyboard).toBeDefined();
      expect(hooks.useRecommend).toBeDefined();
    });
  });
});
