/**
 * Agent Features Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PermissionManager,
  createPermissionManager,
  isAllowed,
  isDenied,
  needsConfirmation,
} from '../permissions.js';
import {
  GlobMatcher,
  createGlobMatcher,
  matchPattern,
  parseGlobsFromMDC,
  fromCommonPatterns,
  COMMON_PATTERNS,
} from '../globs.js';
import {
  BootstrapManager,
  createBootstrapManager,
  createBootstrapSet,
} from '../bootstrap.js';
import {
  ModeManager,
  createModeManager,
  createDefaultModeManager,
  ALL_MODES,
} from '../modes.js';
import type { PermissionConfig, GlobConfig, ModeConfig } from '../types.js';

describe('PermissionManager', () => {
  let manager: PermissionManager;

  beforeEach(() => {
    manager = createPermissionManager();
  });

  describe('checkFileAccess', () => {
    it('should return default permission for unmatched files', () => {
      manager.setConfig({ default: 'ask' });
      expect(manager.checkFileAccess('some/file.ts')).toBe('ask');
    });

    it('should match file patterns', () => {
      manager.setConfig({
        files: [
          { pattern: '*.ts', level: 'allow' },
          { pattern: 'secret/*', level: 'deny' },
        ],
        default: 'ask',
      });

      expect(manager.checkFileAccess('app.ts')).toBe('allow');
      expect(manager.checkFileAccess('secret/keys.json')).toBe('deny');
      expect(manager.checkFileAccess('random.json')).toBe('ask');
    });

    it('should use first matching pattern', () => {
      manager.setConfig({
        files: [
          { pattern: '*.ts', level: 'deny' },
          { pattern: 'src/*.ts', level: 'allow' },
        ],
      });

      expect(manager.checkFileAccess('app.ts')).toBe('deny');
    });
  });

  describe('checkCommandAccess', () => {
    it('should check command patterns', () => {
      manager.setConfig({
        commands: [
          { pattern: 'npm *', level: 'allow' },
          { pattern: 'rm *', level: 'deny' },
        ],
        default: 'ask',
      });

      expect(manager.checkCommandAccess('npm install')).toBe('allow');
      expect(manager.checkCommandAccess('rm -rf /')).toBe('deny');
      expect(manager.checkCommandAccess('git status')).toBe('ask');
    });
  });

  describe('addFilePattern', () => {
    it('should add file pattern', () => {
      manager.addFilePattern({ pattern: '*.js', level: 'allow' });

      expect(manager.checkFileAccess('app.js')).toBe('allow');
    });
  });

  describe('generateOpenCodeConfig', () => {
    it('should generate OpenCode-compatible config', () => {
      manager.setConfig({
        files: [{ pattern: 'src/*', level: 'allow' }],
        commands: [{ pattern: 'npm *', level: 'allow' }],
        default: 'ask',
      });

      const config = manager.generateOpenCodeConfig();

      expect(config).toContain('File Access');
      expect(config).toContain('allow: `src/*`');
      expect(config).toContain('Command Execution');
      expect(config).toContain('Default: ask');
    });
  });

  describe('generateSkillMetadata', () => {
    it('should generate skill metadata', () => {
      manager.setConfig({
        files: [{ pattern: '*.ts', level: 'allow' }],
        default: 'deny',
      });

      const metadata = manager.generateSkillMetadata();

      expect(metadata.filePermissions).toHaveLength(1);
      expect(metadata.defaultPermission).toBe('deny');
    });
  });

  describe('fromMetadata', () => {
    it('should parse permissions from metadata', () => {
      const metadata = {
        filePermissions: [{ pattern: '*.ts', level: 'allow' }],
        defaultPermission: 'ask',
      };

      const config = PermissionManager.fromMetadata(metadata);

      expect(config.files).toHaveLength(1);
      expect(config.default).toBe('ask');
    });
  });
});

describe('Permission helpers', () => {
  it('isAllowed should work correctly', () => {
    expect(isAllowed('allow')).toBe(true);
    expect(isAllowed('deny')).toBe(false);
    expect(isAllowed('ask')).toBe(false);
  });

  it('isDenied should work correctly', () => {
    expect(isDenied('deny')).toBe(true);
    expect(isDenied('allow')).toBe(false);
  });

  it('needsConfirmation should work correctly', () => {
    expect(needsConfirmation('ask')).toBe(true);
    expect(needsConfirmation('allow')).toBe(false);
  });
});

describe('GlobMatcher', () => {
  let matcher: GlobMatcher;

  describe('matches', () => {
    it('should match simple patterns', () => {
      matcher = createGlobMatcher({ include: ['*.ts'] });

      expect(matcher.matches('app.ts')).toBe(true);
      expect(matcher.matches('app.js')).toBe(false);
    });

    it('should match wildcard patterns', () => {
      matcher = createGlobMatcher({ include: ['src/**/*.ts'] });

      expect(matcher.matches('src/app.ts')).toBe(true);
      expect(matcher.matches('src/components/Button.ts')).toBe(true);
      expect(matcher.matches('lib/app.ts')).toBe(false);
    });

    it('should respect exclude patterns', () => {
      matcher = createGlobMatcher({
        include: ['**/*.ts'],
        exclude: ['**/*.test.ts'],
      });

      expect(matcher.matches('app.ts')).toBe(true);
      expect(matcher.matches('app.test.ts')).toBe(false);
    });

    it('should skip hidden files by default', () => {
      matcher = createGlobMatcher({ include: ['**/*'] });

      expect(matcher.matches('.hidden/file.ts')).toBe(false);
    });

    it('should match hidden files when enabled', () => {
      matcher = createGlobMatcher({
        include: ['**/*'],
        matchHidden: true,
      });

      expect(matcher.matches('.hidden/file.ts')).toBe(true);
    });
  });

  describe('filter', () => {
    it('should filter file list', () => {
      matcher = createGlobMatcher({ include: ['*.ts'] });

      const files = ['app.ts', 'app.js', 'index.ts'];
      const result = matcher.filter(files);

      expect(result).toEqual(['app.ts', 'index.ts']);
    });
  });

  describe('addInclude', () => {
    it('should add include pattern', () => {
      matcher = createGlobMatcher({ include: ['*.ts'] });
      matcher.addInclude('*.js');

      expect(matcher.matches('app.js')).toBe(true);
    });
  });

  describe('generateCursorGlobs', () => {
    it('should generate Cursor-compatible globs', () => {
      matcher = createGlobMatcher({
        include: ['src/**/*.ts'],
        exclude: ['**/*.test.ts'],
      });

      const globs = matcher.generateCursorGlobs();

      expect(globs).toContain('src/**/*.ts');
      expect(globs).toContain('!**/*.test.ts');
    });
  });
});

describe('matchPattern', () => {
  it('should create matcher from single pattern', () => {
    const matcher = matchPattern('*.ts');

    expect(matcher.matches('app.ts')).toBe(true);
  });
});

describe('parseGlobsFromMDC', () => {
  it('should parse globs from MDC content', () => {
    const content = `---
globs: ["**/*.ts", "!**/*.test.ts"]
---
Content here`;

    const config = parseGlobsFromMDC(content);

    expect(config?.include).toContain('**/*.ts');
    expect(config?.exclude).toContain('**/*.test.ts');
  });

  it('should return null for invalid content', () => {
    const result = parseGlobsFromMDC('no globs here');

    expect(result).toBeNull();
  });
});

describe('fromCommonPatterns', () => {
  it('should create config from common patterns', () => {
    const config = fromCommonPatterns(['typescript', 'source'], ['nodeModules']);

    expect(config.include).toContain('**/*.ts');
    expect(config.include).toContain('src/**/*');
    expect(config.exclude).toContain('**/node_modules/**');
  });
});

describe('COMMON_PATTERNS', () => {
  it('should have expected patterns', () => {
    expect(COMMON_PATTERNS.typescript).toContain('**/*.ts');
    expect(COMMON_PATTERNS.tests).toContain('**/*.test.*');
    expect(COMMON_PATTERNS.nodeModules).toContain('**/node_modules/**');
  });
});

describe('BootstrapManager', () => {
  let manager: BootstrapManager;

  beforeEach(() => {
    manager = createBootstrapManager();
  });

  describe('addFile/getFile', () => {
    it('should add and get files', () => {
      manager.addFile({
        type: 'agents',
        name: 'AGENTS.md',
        content: '# Agents',
        priority: 100,
      });

      const file = manager.getFile('agents');

      expect(file).toBeDefined();
      expect(file?.name).toBe('AGENTS.md');
    });
  });

  describe('getFilesByPriority', () => {
    it('should return files sorted by priority', () => {
      manager.addFile({ type: 'tools', name: 'TOOLS.md', content: '', priority: 10 });
      manager.addFile({ type: 'agents', name: 'AGENTS.md', content: '', priority: 100 });
      manager.addFile({ type: 'soul', name: 'SOUL.md', content: '', priority: 50 });

      const files = manager.getFilesByPriority();

      expect(files[0].type).toBe('agents');
      expect(files[1].type).toBe('soul');
      expect(files[2].type).toBe('tools');
    });
  });

  describe('createAgentsFile', () => {
    it('should create AGENTS.md', () => {
      manager.createAgentsFile([
        {
          name: 'Coder',
          description: 'A coding agent',
          capabilities: ['Write code', 'Debug'],
        },
      ]);

      const file = manager.getFile('agents');

      expect(file).toBeDefined();
      expect(file?.content).toContain('# Agents');
      expect(file?.content).toContain('## Coder');
      expect(file?.content).toContain('Write code');
    });
  });

  describe('createSoulFile', () => {
    it('should create SOUL.md', () => {
      manager.createSoulFile({
        personality: 'Helpful and precise',
        values: ['Accuracy', 'Efficiency'],
      });

      const file = manager.getFile('soul');

      expect(file).toBeDefined();
      expect(file?.content).toContain('Helpful and precise');
      expect(file?.content).toContain('Accuracy');
    });
  });

  describe('createToolsFile', () => {
    it('should create TOOLS.md', () => {
      manager.createToolsFile([
        {
          name: 'read_file',
          description: 'Read a file',
          usage: 'read_file(path)',
        },
      ]);

      const file = manager.getFile('tools');

      expect(file).toBeDefined();
      expect(file?.content).toContain('## read_file');
      expect(file?.content).toContain('read_file(path)');
    });
  });

  describe('generateCombinedContent', () => {
    it('should generate combined content', () => {
      manager.addFile({ type: 'agents', name: 'AGENTS.md', content: '# Agents', priority: 100 });
      manager.addFile({ type: 'soul', name: 'SOUL.md', content: '# Soul', priority: 50 });

      const combined = manager.generateCombinedContent();

      expect(combined).toContain('<!-- AGENTS.md -->');
      expect(combined).toContain('# Agents');
      expect(combined).toContain('<!-- SOUL.md -->');
    });
  });
});

describe('createBootstrapSet', () => {
  it('should create complete bootstrap set', () => {
    const manager = createBootstrapSet({
      agents: [{ name: 'Test Agent' }],
      soul: { personality: 'Friendly' },
      tools: [{ name: 'tool1' }],
    });

    expect(manager.hasFile('agents')).toBe(true);
    expect(manager.hasFile('soul')).toBe(true);
    expect(manager.hasFile('tools')).toBe(true);
  });
});

describe('ModeManager', () => {
  let manager: ModeManager;

  beforeEach(() => {
    manager = createModeManager([
      { mode: 'code', description: 'Coding mode', skills: ['tdd', 'debugging'] },
      { mode: 'architect', description: 'Architecture mode', skills: ['planning'] },
    ]);
  });

  describe('addMode/getMode', () => {
    it('should add and get modes', () => {
      const mode = manager.getMode('code');

      expect(mode).toBeDefined();
      expect(mode?.description).toBe('Coding mode');
      expect(mode?.skills).toContain('tdd');
    });
  });

  describe('getAvailableModes', () => {
    it('should return available modes', () => {
      const modes = manager.getAvailableModes();

      expect(modes).toContain('code');
      expect(modes).toContain('architect');
    });
  });

  describe('setMode/getCurrentMode', () => {
    it('should set and get current mode', () => {
      manager.setMode('architect');

      expect(manager.getCurrentMode()).toBe('architect');
    });

    it('should throw for unconfigured mode', () => {
      expect(() => manager.setMode('debug')).toThrow('Mode not configured');
    });
  });

  describe('getCurrentSkills', () => {
    it('should return skills for current mode', () => {
      manager.setMode('code');

      const skills = manager.getCurrentSkills();

      expect(skills).toContain('tdd');
      expect(skills).toContain('debugging');
    });
  });

  describe('isSkillAvailable', () => {
    it('should check if skill is available', () => {
      manager.setMode('code');

      expect(manager.isSkillAvailable('tdd')).toBe(true);
      expect(manager.isSkillAvailable('planning')).toBe(false);
    });
  });

  describe('isFileAllowed', () => {
    it('should return true when no patterns defined', () => {
      expect(manager.isFileAllowed('any/file.ts')).toBe(true);
    });

    it('should check file patterns when defined', () => {
      manager.addMode({
        mode: 'restricted',
        description: 'Restricted mode',
        skills: [],
        allowedFiles: ['src/**/*'],
      });
      manager.setMode('restricted');

      expect(manager.isFileAllowed('src/app.ts')).toBe(true);
      expect(manager.isFileAllowed('lib/util.ts')).toBe(false);
    });
  });

  describe('addModeListener', () => {
    it('should notify listeners on mode change', () => {
      let notified = false;
      let newModeValue = '';

      manager.addModeListener((newMode) => {
        notified = true;
        newModeValue = newMode;
      });

      manager.setMode('architect');

      expect(notified).toBe(true);
      expect(newModeValue).toBe('architect');
    });
  });

  describe('generateRooConfig', () => {
    it('should generate Roo-compatible config', () => {
      const config = manager.generateRooConfig();

      expect(config.defaultMode).toBe('code');
      expect(config.modes).toBeDefined();
    });
  });

  describe('generateModeDocumentation', () => {
    it('should generate mode documentation', () => {
      const docs = manager.generateModeDocumentation();

      expect(docs).toContain('# Available Modes');
      expect(docs).toContain('## code');
      expect(docs).toContain('## architect');
    });
  });
});

describe('createDefaultModeManager', () => {
  it('should create manager with default modes', () => {
    const manager = createDefaultModeManager({
      code: ['tdd'],
      debug: ['debugging'],
    });

    const modes = manager.getAvailableModes();

    expect(modes.length).toBe(7); // All default modes
    expect(manager.getMode('code')?.skills).toContain('tdd');
  });
});

describe('ALL_MODES', () => {
  it('should contain all mode types', () => {
    expect(ALL_MODES).toContain('code');
    expect(ALL_MODES).toContain('architect');
    expect(ALL_MODES).toContain('debug');
    expect(ALL_MODES).toContain('test');
  });
});
