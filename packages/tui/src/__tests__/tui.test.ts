import { describe, it, expect } from 'vitest';
import {
  NAV_KEYS,
  SIDEBAR_NAV,
  STATUS_BAR_SHORTCUTS,
  type Screen,
  type SkillItem,
} from '../state/types.js';
import { terminalColors } from '../theme/colors.js';
import { symbols, AGENT_LOGOS } from '../theme/symbols.js';
import { getVersion, getSearchDirs, getInstallDir } from '../utils/helpers.js';

describe('@skillkit/tui', () => {
  describe('state/types', () => {
    it('should export NAV_KEYS with all screens', () => {
      expect(NAV_KEYS).toBeDefined();
      expect(NAV_KEYS.h).toBe('home');
      expect(NAV_KEYS.b).toBe('browse');
      expect(NAV_KEYS.m).toBe('marketplace');
      expect(NAV_KEYS['/']).toBe('help');
      expect(NAV_KEYS.q).toBeUndefined(); // q is quit, not a screen
    });

    it('should export SIDEBAR_NAV with sections', () => {
      expect(SIDEBAR_NAV).toBeDefined();
      expect(Array.isArray(SIDEBAR_NAV)).toBe(true);
      expect(SIDEBAR_NAV.length).toBeGreaterThan(0);

      const sections = SIDEBAR_NAV.map(s => s.section);
      expect(sections).toContain('Discover');
      expect(sections).toContain('Manage');
      expect(sections).toContain('Execute');
    });

    it('should export STATUS_BAR_SHORTCUTS', () => {
      expect(STATUS_BAR_SHORTCUTS).toBeDefined();
      expect(STATUS_BAR_SHORTCUTS).toContain('browse');
      expect(STATUS_BAR_SHORTCUTS).toContain('help');
      expect(STATUS_BAR_SHORTCUTS).toContain('quit');
    });
  });

  describe('theme/colors', () => {
    it('should export terminalColors', () => {
      expect(terminalColors).toBeDefined();
      expect(terminalColors.text).toBeDefined();
      expect(terminalColors.textMuted).toBeDefined();
      expect(terminalColors.accent).toBeDefined();
    });
  });

  describe('theme/symbols', () => {
    it('should export symbols', () => {
      expect(symbols).toBeDefined();
      expect(symbols.brandIcon).toBeDefined();
      expect(symbols.pointer).toBeDefined();
      expect(symbols.horizontalLine).toBeDefined();
    });

    it('should export AGENT_LOGOS', () => {
      expect(AGENT_LOGOS).toBeDefined();
      expect(AGENT_LOGOS['claude-code']).toBeDefined();
      expect(AGENT_LOGOS['claude-code'].name).toBe('Claude Code');
    });
  });

  describe('utils/helpers', () => {
    it('should return version string', () => {
      const version = getVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });

    it('should return search directories', () => {
      const dirs = getSearchDirs();
      expect(Array.isArray(dirs)).toBe(true);
    });

    it('should return install directory', () => {
      const dir = getInstallDir();
      expect(typeof dir).toBe('string');
    });
  });
});
