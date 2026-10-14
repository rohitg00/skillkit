import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { AgentType } from '@skillkit/core';
import { InstallCommand } from '../commands/install.js';
import type { InstallResult } from '../onboarding/index.js';
import { saveSkillMetadata } from '../helpers.js';

const characterization = vi.hoisted(() => ({
  installRoot: '',
  addSkillToLock: vi.fn(),
  execFile: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('@skillkit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@skillkit/core')>();
  return { ...actual, addSkillToLock: characterization.addSkillToLock };
});

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return { ...actual, execFile: characterization.execFile };
});

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return { ...actual, cpSync: vi.fn(actual.cpSync), symlinkSync: vi.fn(actual.symlinkSync) };
});

vi.mock('../helpers.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers.js')>();
  return {
    ...actual,
    getInstallDir: vi.fn((_global: boolean, agent: string) => join(characterization.installRoot, agent)),
    saveSkillMetadata: vi.fn(actual.saveSkillMetadata),
  };
});

vi.mock('../onboarding/index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../onboarding/index.js')>();
  return { ...actual, error: characterization.error, warn: characterization.warn };
});

interface CharacterizationSkill {
  name: string;
  dirName: string;
  path: string;
}

interface InstallerBoundary {
  performInstall(
    skills: CharacterizationSkill[],
    agents: AgentType[],
    method: 'copy' | 'symlink',
    provider: { type: 'local' },
    clone: { path: string; tempRoot?: string },
    progress: {
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      message: ReturnType<typeof vi.fn>;
    },
  ): Promise<InstallResult[]>;
}

function characterizationSkill(directory: string, name = 'fixture-skill'): CharacterizationSkill {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(join(directory, 'SKILL.md'), `---\nname: ${name}\ndescription: Installer characterization fixture\n---\n\nFixture content.\n`);
  fs.writeFileSync(join(directory, 'asset.txt'), 'Fixture asset.\n');
  return { name, dirName: 'source-folder', path: directory };
}

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

      expect(commands.ActivityCommand).toBeDefined();
      expect(commands.DoctorCommand).toBeDefined();
      expect(commands.IssuePlanCommand).toBeDefined();
      expect(commands.IssueListCommand).toBeDefined();
      expect(commands.SessionSnapshotSaveCommand).toBeDefined();
      expect(commands.SessionSnapshotRestoreCommand).toBeDefined();
      expect(commands.SessionSnapshotListCommand).toBeDefined();
      expect(commands.SessionSnapshotDeleteCommand).toBeDefined();
      expect(commands.SessionExplainCommand).toBeDefined();
    });
  });

  describe('installer controlled characterization (not CLI E2E)', () => {
    let fixtureRoot: string;
    let sourceRoot: string;
    let skill: CharacterizationSkill;
    let command: InstallCommand;
    let results: InstallResult[];
    const progress = { start: vi.fn(), stop: vi.fn(), message: vi.fn() };

    beforeEach(async () => {
      const actualFs = await vi.importActual<typeof import('node:fs')>('node:fs');
      const actualHelpers = await vi.importActual<typeof import('../helpers.js')>('../helpers.js');
      vi.mocked(fs.cpSync).mockReset().mockImplementation(actualFs.cpSync);
      vi.mocked(fs.symlinkSync).mockReset().mockImplementation(actualFs.symlinkSync);
      vi.mocked(saveSkillMetadata).mockReset().mockImplementation(actualHelpers.saveSkillMetadata);
      characterization.addSkillToLock.mockReset();
      characterization.error.mockReset();
      characterization.warn.mockReset();
      characterization.execFile.mockReset().mockImplementation((_file, _args, _options, callback) => {
        callback(null, '', '');
      });
      progress.start.mockReset();
      progress.stop.mockReset();
      progress.message.mockReset();
      vi.spyOn(console, 'log').mockImplementation(() => {});
      fixtureRoot = fs.mkdtempSync(join(tmpdir(), 'skillkit-install-characterization-'));
      sourceRoot = join(fixtureRoot, 'source');
      characterization.installRoot = join(fixtureRoot, 'installed');
      skill = characterizationSkill(join(sourceRoot, 'source-folder'));
      command = new InstallCommand();
      command.force = false;
      command.global = false;
      command.source = sourceRoot;
      command.quiet = true;
      results = [];
    });

    afterEach(() => {
      const proofDirectory = process.env.SKILLKIT_CHARACTERIZATION_PROOF_DIR;
      if (proofDirectory) {
        const testName = expect.getState().currentTestName as string;
        fs.mkdirSync(proofDirectory, { recursive: true });
        fs.writeFileSync(join(proofDirectory, `${testName.replace(/[^a-zA-Z0-9-]/g, '_')}.json`), JSON.stringify({
          testName, evidenceType: 'controlled characterization, not CLI E2E', results,
          copies: vi.mocked(fs.cpSync).mock.calls,
          symlinks: vi.mocked(fs.symlinkSync).mock.calls,
          lockWrites: characterization.addSkillToLock.mock.calls,
          npm: characterization.execFile.mock.calls.map((call) => call.slice(0, 3)),
          progress: { starts: progress.start.mock.calls, stops: progress.stop.mock.calls },
          errors: characterization.error.mock.calls,
          warnings: characterization.warn.mock.calls,
          console: vi.mocked(console.log).mock.calls,
        }, null, 2));
      }
      vi.restoreAllMocks();
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    });

    async function installSkills(
      skills: CharacterizationSkill[] = [skill],
      agents: AgentType[] = ['claude-code'],
      method: 'copy' | 'symlink' = 'copy',
      clone: { path: string; tempRoot?: string } = { path: sourceRoot },
    ): Promise<InstallResult[]> {
      const boundary = command as unknown as InstallerBoundary;
      results = await boundary.performInstall(skills, agents, method, { type: 'local' }, clone, progress);
      return results;
    }

    function targetFor(agent: AgentType): string {
      return join(characterization.installRoot, agent, skill.name);
    }

    it('copies directory content and assets before recording metadata and lock', async () => {
      const installed = await installSkills();
      const target = targetFor('claude-code');
      expect(fs.readFileSync(join(target, 'SKILL.md'), 'utf8')).toBe(fs.readFileSync(join(skill.path, 'SKILL.md'), 'utf8'));
      expect(fs.readFileSync(join(target, 'asset.txt'), 'utf8')).toBe('Fixture asset.\n');
      expect(fs.cpSync).toHaveBeenCalledWith(skill.path, target, { recursive: true, dereference: true });
      expect(saveSkillMetadata).toHaveBeenCalledWith(target, expect.objectContaining({
        name: skill.name, source: sourceRoot, sourceType: 'local', subpath: skill.name, enabled: true,
      }));
      expect(installed).toEqual([{ skillName: skill.name, method: 'copy', agents: ['claude-code'], path: target }]);
      expect(characterization.addSkillToLock).toHaveBeenCalledWith(skill.name, expect.objectContaining({
        source: sourceRoot, sourceType: 'local', agents: ['claude-code'], path: target,
      }));
    });

    it.each([
      { name: 'note', targetName: 'note.md' },
      { name: 'note.md', targetName: 'note.md' },
    ])('copies standalone $name to $targetName without directory options', async ({ name, targetName }) => {
      const source = join(sourceRoot, 'standalone.md');
      fs.writeFileSync(source, '# Standalone fixture\n');
      const standalone = { name, dirName: 'standalone.md', path: source };
      const installed = await installSkills([standalone]);
      const target = join(characterization.installRoot, 'claude-code', targetName);
      expect(fs.readFileSync(target, 'utf8')).toBe('# Standalone fixture\n');
      expect(fs.cpSync).toHaveBeenCalledWith(source, target);
      expect(characterization.execFile).not.toHaveBeenCalled();
      expect(installed).toEqual([{ skillName: name, method: 'copy', agents: ['claude-code'], path: target }]);
    });

    it('skips an existing target without force or metadata and lock writes', async () => {
      const target = targetFor('claude-code');
      characterizationSkill(target);
      fs.writeFileSync(join(target, 'asset.txt'), 'Keep installed edits.\n');
      command.quiet = false;
      expect(await installSkills()).toEqual([]);
      expect(fs.readFileSync(join(target, 'asset.txt'), 'utf8')).toBe('Keep installed edits.\n');
      expect(fs.cpSync).not.toHaveBeenCalled();
      expect(saveSkillMetadata).not.toHaveBeenCalled();
      expect(characterization.addSkillToLock).not.toHaveBeenCalled();
      expect(characterization.warn).toHaveBeenCalledWith(expect.stringContaining('already exists, use --force'));
    });

    it('replaces an existing target and removes stale files with force', async () => {
      const target = targetFor('claude-code');
      characterizationSkill(target);
      fs.writeFileSync(join(target, 'stale.txt'), 'Old installed file.\n');
      fs.writeFileSync(join(target, 'asset.txt'), 'Old asset.\n');
      command.force = true;
      const installed = await installSkills();
      expect(installed).toHaveLength(1);
      expect(fs.existsSync(join(target, 'stale.txt'))).toBe(false);
      expect(fs.readFileSync(join(target, 'asset.txt'), 'utf8')).toBe('Fixture asset.\n');
      expect(saveSkillMetadata).toHaveBeenCalledTimes(1);
      expect(characterization.addSkillToLock).toHaveBeenCalledTimes(1);
    });

    it('skips an inaccessible source before copying or recording it', async () => {
      fs.rmSync(skill.path, { recursive: true });
      command.quiet = false;
      expect(await installSkills()).toEqual([]);
      expect(fs.existsSync(targetFor('claude-code'))).toBe(false);
      expect(fs.cpSync).not.toHaveBeenCalled();
      expect(saveSkillMetadata).not.toHaveBeenCalled();
      expect(characterization.addSkillToLock).not.toHaveBeenCalled();
      expect(characterization.warn).toHaveBeenCalledWith(expect.stringContaining('source not accessible'));
    });

    it('rejects a source outside the clone containment boundary', async () => {
      const outside = characterizationSkill(join(fixtureRoot, 'outside'));
      expect(await installSkills([outside])).toEqual([]);
      expect(fs.cpSync).not.toHaveBeenCalled();
      expect(saveSkillMetadata).not.toHaveBeenCalled();
      expect(characterization.addSkillToLock).not.toHaveBeenCalled();
      expect(characterization.error).toHaveBeenCalledWith(expect.stringContaining('path traversal detected'));
    });

    it('uses tempRoot for containment when path is a selected subtree', async () => {
      const sibling = characterizationSkill(join(fixtureRoot, 'sibling'));
      const installed = await installSkills([sibling], ['claude-code'], 'copy', {
        path: sourceRoot, tempRoot: fixtureRoot,
      });
      expect(installed).toHaveLength(1);
      expect(fs.cpSync).toHaveBeenCalledWith(sibling.path, targetFor('claude-code'), { recursive: true, dereference: true });
    });

    it('copies the primary directory and symlinks later agents to it', async () => {
      const installed = await installSkills([skill], ['claude-code', 'cursor', 'codex'], 'symlink');
      const primary = targetFor('claude-code');
      expect(fs.lstatSync(primary).isSymbolicLink()).toBe(false);
      expect(fs.readlinkSync(targetFor('cursor'))).toBe(primary);
      expect(fs.readlinkSync(targetFor('codex'))).toBe(primary);
      expect(fs.readFileSync(join(targetFor('cursor'), 'asset.txt'), 'utf8')).toBe('Fixture asset.\n');
      expect(fs.cpSync).toHaveBeenCalledTimes(1);
      expect(fs.symlinkSync).toHaveBeenCalledWith(primary, targetFor('cursor'), 'dir');
      expect(installed[0].agents).toEqual(['claude-code', 'cursor', 'codex']);
      expect(characterization.addSkillToLock).toHaveBeenCalledTimes(1);
    });

    it('copies for a single agent even when symlink mode was selected', async () => {
      const installed = await installSkills([skill], ['claude-code'], 'symlink');
      expect(installed).toHaveLength(1);
      expect(fs.lstatSync(targetFor('claude-code')).isSymbolicLink()).toBe(false);
      expect(fs.cpSync).toHaveBeenCalledTimes(1);
      expect(fs.symlinkSync).not.toHaveBeenCalled();
    });

    it('makes the next agent primary when the first target was skipped', async () => {
      characterizationSkill(targetFor('claude-code'));
      fs.writeFileSync(join(targetFor('claude-code'), 'asset.txt'), 'Keep first agent edits.\n');
      const installed = await installSkills([skill], ['claude-code', 'cursor', 'codex'], 'symlink');
      expect(fs.readFileSync(join(targetFor('claude-code'), 'asset.txt'), 'utf8')).toBe('Keep first agent edits.\n');
      expect(fs.lstatSync(targetFor('cursor')).isSymbolicLink()).toBe(false);
      expect(fs.readlinkSync(targetFor('codex'))).toBe(targetFor('cursor'));
      expect(fs.cpSync).toHaveBeenCalledTimes(1);
      expect(installed).toEqual([{
        skillName: skill.name, method: 'symlink', agents: ['cursor', 'codex'], path: targetFor('cursor'),
      }]);
    });

    it('continues after a secondary symlink failure using the original primary', async () => {
      vi.mocked(fs.symlinkSync).mockImplementationOnce(() => {
        throw new Error('Controlled secondary symlink failure');
      });
      const installed = await installSkills([skill], ['claude-code', 'cursor', 'codex'], 'symlink');
      expect(fs.existsSync(targetFor('cursor'))).toBe(false);
      expect(fs.readlinkSync(targetFor('codex'))).toBe(targetFor('claude-code'));
      expect(fs.cpSync).toHaveBeenCalledTimes(1);
      expect(fs.symlinkSync).toHaveBeenCalledTimes(2);
      expect(installed).toEqual([{
        skillName: skill.name, method: 'symlink', agents: ['claude-code', 'codex'], path: targetFor('claude-code'),
      }]);
    });

    it('symlinks standalone files using the file link type', async () => {
      const source = join(sourceRoot, 'standalone.md');
      fs.writeFileSync(source, '# Standalone fixture\n');
      const standalone = { name: 'note', dirName: 'standalone.md', path: source };
      const installed = await installSkills([standalone], ['claude-code', 'cursor'], 'symlink');
      const primary = join(characterization.installRoot, 'claude-code', 'note.md');
      const secondary = join(characterization.installRoot, 'cursor', 'note.md');
      expect(fs.readlinkSync(secondary)).toBe(primary);
      expect(fs.symlinkSync).toHaveBeenCalledWith(primary, secondary, 'file');
      expect(fs.readFileSync(secondary, 'utf8')).toBe('# Standalone fixture\n');
      expect(installed[0].agents).toEqual(['claude-code', 'cursor']);
    });

    it('sets the primary target after copy even when its metadata write fails', async () => {
      vi.mocked(saveSkillMetadata).mockImplementationOnce(() => {
        throw new Error('Controlled primary metadata failure');
      });
      const installed = await installSkills([skill], ['claude-code', 'cursor'], 'symlink');
      expect(fs.cpSync).toHaveBeenCalledTimes(1);
      expect(fs.readlinkSync(targetFor('cursor'))).toBe(targetFor('claude-code'));
      expect(installed).toEqual([{
        skillName: skill.name, method: 'symlink', agents: ['cursor'], path: targetFor('cursor'),
      }]);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Controlled primary metadata failure'));
    });

    it('continues after an agent copy failure and makes the next copy primary', async () => {
      vi.mocked(fs.cpSync).mockImplementationOnce(() => {
        throw new Error('Controlled first agent copy failure');
      });
      const installed = await installSkills([skill], ['claude-code', 'cursor', 'codex'], 'symlink');
      expect(fs.existsSync(targetFor('claude-code'))).toBe(false);
      expect(fs.lstatSync(targetFor('cursor')).isSymbolicLink()).toBe(false);
      expect(fs.readlinkSync(targetFor('codex'))).toBe(targetFor('cursor'));
      expect(fs.cpSync).toHaveBeenCalledTimes(2);
      expect(installed).toEqual([{
        skillName: skill.name, method: 'symlink', agents: ['cursor', 'codex'], path: targetFor('cursor'),
      }]);
      expect(characterization.addSkillToLock).toHaveBeenCalledWith(skill.name, expect.objectContaining({
        agents: ['cursor', 'codex'], path: targetFor('cursor'),
      }));
    });

    it.each([false, true])('records installation when controlled npm failure is %s', async (fails) => {
      fs.writeFileSync(join(skill.path, 'package.json'), JSON.stringify({ name: 'fixture-package', version: '1.0.0' }));
      characterization.execFile.mockImplementation((_file, _args, _options, callback) => {
        if (fails) callback(new Error('Controlled npm failure'), '', '');
        else callback(null, '', '');
      });
      const installed = await installSkills([skill], ['claude-code', 'cursor'], 'symlink');
      expect(characterization.execFile).toHaveBeenCalledTimes(1);
      expect(characterization.execFile).toHaveBeenCalledWith('npm', ['install', '--omit=dev'], {
        cwd: targetFor('claude-code'),
      }, expect.any(Function));
      expect(progress.start).toHaveBeenNthCalledWith(2, `Installing npm dependencies for ${skill.name}...`);
      expect(progress.start).toHaveBeenNthCalledWith(3, `Finishing ${skill.name} installation...`);
      expect(fs.readlinkSync(targetFor('cursor'))).toBe(targetFor('claude-code'));
      expect(fs.readFileSync(join(targetFor('cursor'), 'asset.txt'), 'utf8')).toBe('Fixture asset.\n');
      expect(installed[0].agents).toEqual(['claude-code', 'cursor']);
      expect(characterization.addSkillToLock).toHaveBeenCalledTimes(1);
      if (fails) {
        expect(progress.stop).toHaveBeenCalledWith(expect.stringContaining('Dependencies failed'));
      } else {
        expect(progress.stop).toHaveBeenCalledWith(`Installed dependencies for ${skill.name}`);
      }
    });
  });
});
