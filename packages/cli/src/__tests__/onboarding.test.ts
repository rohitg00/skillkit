/**
 * Unit Tests: Onboarding Module
 *
 * Tests for the CLI onboarding experience components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';

describe('Onboarding Module', () => {
  describe('theme', () => {
    it('should export agent icons', async () => {
      const { AGENT_ICONS, AGENT_NAMES } = await import('../onboarding/theme.js');

      expect(AGENT_ICONS).toBeDefined();
      expect(AGENT_ICONS['claude-code']).toBe('\u27c1'); // ⟁
      expect(AGENT_ICONS['cursor']).toBe('\u25eb'); // ◫
      expect(AGENT_ICONS['codex']).toBe('\u25ce'); // ◎

      expect(AGENT_NAMES).toBeDefined();
      expect(AGENT_NAMES['claude-code']).toBe('Claude Code');
      expect(AGENT_NAMES['cursor']).toBe('Cursor');
    });

    it('should export symbols', async () => {
      const { symbols } = await import('../onboarding/theme.js');

      expect(symbols).toBeDefined();
      expect(symbols.stepPending).toBe('\u25cb'); // ○
      expect(symbols.stepActive).toBe('\u25cf'); // ●
      expect(symbols.success).toBe('\u2713'); // ✓
      expect(symbols.error).toBe('\u2717'); // ✗
    });

    it('should export color utilities', async () => {
      const { colors } = await import('../onboarding/theme.js');

      expect(colors).toBeDefined();
      expect(typeof colors.accent).toBe('function');
      expect(typeof colors.primary).toBe('function');
      expect(typeof colors.success).toBe('function');
      expect(typeof colors.error).toBe('function');
    });

    it('should format agent with icon', async () => {
      const { formatAgent, getAgentIcon } = await import('../onboarding/theme.js');

      const formatted = formatAgent('claude-code');
      expect(formatted).toContain('\u27c1'); // ⟁
      expect(formatted).toContain('Claude Code');

      const icon = getAgentIcon('cursor');
      expect(icon).toBe('\u25eb'); // ◫
    });

    it('should generate progress bars', async () => {
      const { progressBar } = await import('../onboarding/theme.js');

      const bar50 = progressBar(50, 100, 10);
      expect(bar50).toContain('\u2588'); // █ (filled)
      expect(bar50).toContain('\u2591'); // ░ (empty)
      expect(bar50.length).toBe(10);

      const bar100 = progressBar(100, 100, 6);
      expect(bar100).toBe('\u2588'.repeat(6));

      const bar0 = progressBar(0, 100, 6);
      expect(bar0).toBe('\u2591'.repeat(6));
    });

    it('should format score with visual bar', async () => {
      const { formatScore } = await import('../onboarding/theme.js');

      const score = formatScore(75);
      expect(score).toContain('75%');
      expect(score).toContain('\u2588'); // progress bar
    });
  });

  describe('logo', () => {
    it('should export logo functions', async () => {
      const { getLogo, getFullLogo, getCompactLogo, getMinimalLogo, getHeader, getDivider } =
        await import('../onboarding/logo.js');

      expect(typeof getLogo).toBe('function');
      expect(typeof getFullLogo).toBe('function');
      expect(typeof getCompactLogo).toBe('function');
      expect(typeof getMinimalLogo).toBe('function');
      expect(typeof getHeader).toBe('function');
      expect(typeof getDivider).toBe('function');
    });

    it('should generate full logo with version', async () => {
      const { getFullLogo } = await import('../onboarding/logo.js');

      const logo = getFullLogo('1.7.2', 32);
      // Full logo uses block characters (███), not literal text
      expect(logo).toContain('\u2588'); // █ block character
      expect(logo).toContain('v1.7.2');
      expect(logo).toContain('32 agents');
    });

    it('should generate compact logo', async () => {
      const { getCompactLogo } = await import('../onboarding/logo.js');

      const logo = getCompactLogo('1.7.2');
      // Compact logo has spaced letters: S K I L L K I T
      expect(logo).toContain('S K I L L K I T');
      expect(logo).toContain('v1.7.2');
    });

    it('should generate minimal logo', async () => {
      const { getMinimalLogo } = await import('../onboarding/logo.js');

      const logo = getMinimalLogo('1.7.2');
      expect(logo).toContain('SKILLKIT');
      expect(logo).toContain('\u25c7'); // ◇ diamond
    });

    it('should generate header', async () => {
      const { getHeader } = await import('../onboarding/logo.js');

      const header = getHeader('Test Title');
      expect(header).toContain('SkillKit');
      expect(header).toContain('Test Title');
    });

    it('should generate divider', async () => {
      const { getDivider } = await import('../onboarding/logo.js');

      const divider = getDivider(20);
      expect(divider).toContain('\u2500'); // ─
    });
  });

  describe('preferences', () => {
    let testDir: string;
    let originalHome: string | undefined;
    let originalUserProfile: string | undefined;

    beforeEach(() => {
      vi.resetModules();
      testDir = mkdtempSync(join(tmpdir(), 'skillkit-prefs-test-'));
      originalHome = process.env.HOME;
      originalUserProfile = process.env.USERPROFILE;
      process.env.HOME = testDir;
      process.env.USERPROFILE = testDir;
    });

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
      if (originalHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = originalHome;
      }
      if (originalUserProfile === undefined) {
        delete process.env.USERPROFILE;
      } else {
        process.env.USERPROFILE = originalUserProfile;
      }
      vi.resetModules();
    });

    it('should export preference functions', async () => {
      const {
        loadPreferences,
        savePreferences,
        isOnboardingComplete,
        completeOnboarding,
        saveLastAgents,
        getLastAgents,
        saveInstallMethod,
        getInstallMethod,
      } = await import('../onboarding/preferences.js');

      expect(typeof loadPreferences).toBe('function');
      expect(typeof savePreferences).toBe('function');
      expect(typeof isOnboardingComplete).toBe('function');
      expect(typeof completeOnboarding).toBe('function');
      expect(typeof saveLastAgents).toBe('function');
      expect(typeof getLastAgents).toBe('function');
      expect(typeof saveInstallMethod).toBe('function');
      expect(typeof getInstallMethod).toBe('function');
    });

    it('should return default preferences when file does not exist', async () => {
      const { loadPreferences } = await import('../onboarding/preferences.js');

      const prefs = loadPreferences();
      expect(prefs).toBeDefined();
      expect(prefs.onboardingComplete).toBe(false);
      expect(prefs.lastSelectedAgents).toEqual([]);
      expect(prefs.defaultInstallMethod).toBe('symlink');
    });
  });

  describe('summary', () => {
    it('should export summary functions', async () => {
      const {
        showInstallSummary,
        showNextSteps,
        showAgentSummary,
        showProjectSummary,
        showSyncSummary,
        showSkillList,
        showMarketplaceInfo,
      } = await import('../onboarding/summary.js');

      expect(typeof showInstallSummary).toBe('function');
      expect(typeof showNextSteps).toBe('function');
      expect(typeof showAgentSummary).toBe('function');
      expect(typeof showProjectSummary).toBe('function');
      expect(typeof showSyncSummary).toBe('function');
      expect(typeof showSkillList).toBe('function');
      expect(typeof showMarketplaceInfo).toBe('function');
    });
  });

  describe('prompts', () => {
    it('should export prompt functions', async () => {
      const {
        isCancel,
        intro,
        outro,
        cancel,
        note,
        log,
        step,
        success,
        warn,
        error,
        spinner,
        text,
        password,
        confirm,
        select,
        agentMultiselect,
        skillMultiselect,
        stepTrail,
        selectInstallMethod,
      } = await import('../onboarding/prompts.js');

      expect(typeof isCancel).toBe('function');
      expect(typeof intro).toBe('function');
      expect(typeof outro).toBe('function');
      expect(typeof cancel).toBe('function');
      expect(typeof note).toBe('function');
      expect(typeof log).toBe('function');
      expect(typeof step).toBe('function');
      expect(typeof success).toBe('function');
      expect(typeof warn).toBe('function');
      expect(typeof error).toBe('function');
      expect(typeof spinner).toBe('function');
      expect(typeof text).toBe('function');
      expect(typeof password).toBe('function');
      expect(typeof confirm).toBe('function');
      expect(typeof select).toBe('function');
      expect(typeof agentMultiselect).toBe('function');
      expect(typeof skillMultiselect).toBe('function');
      expect(typeof stepTrail).toBe('function');
      expect(typeof selectInstallMethod).toBe('function');
    });

    it('should generate step trail', async () => {
      const { stepTrail } = await import('../onboarding/prompts.js');

      const trail = stepTrail([
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'active' },
        { label: 'Step 3', status: 'pending' },
      ]);

      expect(trail).toContain('Step 1');
      expect(trail).toContain('Step 2');
      expect(trail).toContain('Step 3');
      expect(trail).toContain('\u25cf'); // ● (filled circle)
      expect(trail).toContain('\u25cb'); // ○ (empty circle)
    });
  });

  describe('index exports', () => {
    it('should re-export all modules', async () => {
      const onboarding = await import('../onboarding/index.js');

      // Theme exports
      expect(onboarding.AGENT_ICONS).toBeDefined();
      expect(onboarding.AGENT_NAMES).toBeDefined();
      expect(onboarding.symbols).toBeDefined();
      expect(onboarding.colors).toBeDefined();
      expect(onboarding.formatAgent).toBeDefined();
      expect(onboarding.getAgentIcon).toBeDefined();
      expect(onboarding.progressBar).toBeDefined();
      expect(onboarding.formatScore).toBeDefined();

      // Logo exports
      expect(onboarding.getLogo).toBeDefined();
      expect(onboarding.getHeader).toBeDefined();
      expect(onboarding.getDivider).toBeDefined();

      // Prompts exports
      expect(onboarding.isCancel).toBeDefined();
      expect(onboarding.spinner).toBeDefined();
      expect(onboarding.agentMultiselect).toBeDefined();
      expect(onboarding.skillMultiselect).toBeDefined();

      // Summary exports
      expect(onboarding.showInstallSummary).toBeDefined();
      expect(onboarding.showNextSteps).toBeDefined();

      // Preferences exports
      expect(onboarding.loadPreferences).toBeDefined();
      expect(onboarding.savePreferences).toBeDefined();

      // Main functions
      expect(onboarding.welcome).toBeDefined();
      expect(onboarding.header).toBeDefined();
      expect(onboarding.showCompletion).toBeDefined();
    });
  });
});
