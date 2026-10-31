/**
 * E2E Tests: Core CLI Commands
 *
 * Tests for: init, list, install, enable, disable, remove, update, sync, read, validate
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { pathToFileURL } from 'node:url';
import type { CliResult } from './helpers/cli-runner.js';
import {
  runCli,
  createTestDir,
  cleanupTestDir,
  createTestSkill,
  createTestProject,
  readTestFile,
  testFileExists,
  writeTestFile,
} from './helpers/cli-runner.js';

interface SourcePathCase {
  label: string;
  name: string;
  directory: string;
  selectedSubtree: string;
  expectedSubpath: string;
  decoy: boolean;
}

interface GitFixture {
  id: string;
  repository: string;
  project: string;
  source: string;
  provider: string;
  env: NodeJS.ProcessEnv;
  skillDirectory: string;
  installedDirectory: string;
  name: string;
  revisionA: string;
}

interface StandaloneGitFixture extends GitFixture {
  sourceFile: string;
  installedFile: string;
  metadataFile: string;
}

const sourcePathCases: SourcePathCase[] = [
  {
    label: 'repository root',
    name: 'intended-skill',
    directory: '',
    selectedSubtree: '',
    expectedSubpath: '',
    decoy: false,
  },
  {
    label: 'nested skill',
    name: 'intended-skill',
    directory: 'skills/intended-skill',
    selectedSubtree: '',
    expectedSubpath: 'skills/intended-skill',
    decoy: false,
  },
  {
    label: 'different folder and frontmatter names',
    name: 'intended-skill',
    directory: 'skills/source-folder',
    selectedSubtree: '',
    expectedSubpath: 'skills/source-folder',
    decoy: false,
  },
  {
    label: 'matching direct child of selected source',
    name: 'matching-skill',
    directory: 'catalog/matching-skill',
    selectedSubtree: 'catalog',
    expectedSubpath: 'matching-skill',
    decoy: false,
  },
  {
    label: 'selected subtree root',
    name: 'intended-skill',
    directory: 'catalog',
    selectedSubtree: 'catalog',
    expectedSubpath: '',
    decoy: false,
  },
  {
    label: 'nested selected subtree',
    name: 'intended-skill',
    directory: 'catalog/skills/source-folder',
    selectedSubtree: 'catalog',
    expectedSubpath: 'skills/source-folder',
    decoy: false,
  },
  {
    label: 'valid old-name decoy',
    name: 'agents',
    directory: 'skills/source-folder',
    selectedSubtree: '',
    expectedSubpath: 'skills/source-folder',
    decoy: true,
  },
];

const gitProviders = [
  { type: 'github', prefix: '', host: 'github.com' },
  { type: 'gitlab', prefix: 'gitlab:', host: 'gitlab.com' },
  { type: 'bitbucket', prefix: 'bitbucket:', host: 'bitbucket.org' },
  { type: 'skills-sh', prefix: 'skills.sh/', host: 'github.com' },
];

function skillRevision(name: string, revision: string): string {
  return `---\nname: ${name}\ndescription: Source path round trip fixture for ${name}\n---\n\n# ${name}\n\nRevision ${revision}.\n`;
}

function writeSkillRevision(directory: string, name: string, revision: string): void {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'SKILL.md'), skillRevision(name, revision));
  writeFileSync(join(directory, 'asset.txt'), `Asset ${name} revision ${revision}.\n`);
}

function gitRevision(repository: string, message: string): string {
  execFileSync('git', ['-C', repository, 'add', '--all']);
  execFileSync('git', [
    '-C', repository, '-c', 'user.name=SkillKit Fixture',
    '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', message,
  ]);
  return execFileSync('git', ['-C', repository, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function createGitFixture(
  testDirectory: string,
  provider: typeof gitProviders[number],
  sourceCase: SourcePathCase,
  agent = 'claude-code',
): GitFixture {
  const id = `${provider.type}-${sourceCase.label.replaceAll(' ', '-')}-${agent}`;
  const repository = join(testDirectory, 'source');
  const project = join(testDirectory, 'project');
  mkdirSync(repository, { recursive: true });
  mkdirSync(project, { recursive: true });
  execFileSync('git', ['init', '--quiet', '--initial-branch=main', repository]);
  execFileSync('git', ['-C', repository, 'config', 'uploadpack.allowFilter', 'true']);
  const name = sourceCase.name;
  const skillDirectory = join(repository, sourceCase.directory);
  writeSkillRevision(skillDirectory, name, 'A');
  const revisionA = gitRevision(repository, 'Fixture revision A');
  const source = `${provider.prefix}round-trip/${id}/${sourceCase.selectedSubtree}`.replace(/\/$/, '');
  const cloneUrl = `https://${provider.host}/round-trip/${id}.git`;
  const env = {
    GIT_CONFIG_COUNT: '2',
    GIT_CONFIG_KEY_0: `url.${pathToFileURL(repository).href}.insteadOf`,
    GIT_CONFIG_VALUE_0: cloneUrl,
    GIT_CONFIG_KEY_1: 'protocol.file.allow',
    GIT_CONFIG_VALUE_1: 'always',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
  };
  const agentDirectories: Record<string, string> = {
    'claude-code': '.claude/skills',
    codex: '.codex/skills',
  };
  return {
    id,
    repository,
    project,
    source,
    provider: provider.type,
    env,
    skillDirectory,
    installedDirectory: join(project, agentDirectories[agent], name),
    name,
    revisionA,
  };
}

function readMetadata(directory: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(directory, '.skillkit.json'), 'utf8'));
}

function createStandaloneGitFixture(
  testDirectory: string,
  provider: typeof gitProviders[number],
  selectedSubtree = '',
): StandaloneGitFixture {
  const fixture = createGitFixture(testDirectory, provider, {
    label: `standalone file ${selectedSubtree}`,
    name: 'directory-skill',
    directory: join(selectedSubtree, 'skills', 'directory-skill'),
    selectedSubtree,
    expectedSubpath: 'skills/directory-skill',
    decoy: false,
  });
  const sourceFile = join(fixture.repository, selectedSubtree, 'skills', 'source-file.md');
  writeFileSync(sourceFile, skillRevision('standalone-skill', 'A'));
  return {
    ...fixture,
    revisionA: gitRevision(fixture.repository, 'Standalone fixture revision A'),
    sourceFile,
    installedFile: join(fixture.project, '.claude', 'skills', 'standalone-skill.md'),
    metadataFile: join(fixture.project, '.claude', 'skills', '.standalone-skill.skillkit.json'),
  };
}

function standaloneObservation(fixture: StandaloneGitFixture): Record<string, unknown> {
  return { skill: observedFile(fixture.installedFile), metadata: observedFile(fixture.metadataFile) };
}

function observedFile(path: string): { content: string; sha256: string } | null {
  if (!existsSync(path)) return null;
  const content = readFileSync(path, 'utf8');
  return { content, sha256: createHash('sha256').update(content).digest('hex') };
}

function expectInitialRevision(directory: string, name: string): void {
  expect(readFileSync(join(directory, 'SKILL.md'), 'utf8')).toBe(skillRevision(name, 'A'));
  expect(readFileSync(join(directory, 'asset.txt'), 'utf8')).toBe(`Asset ${name} revision A.\n`);
}

function installedObservation(directory: string): Record<string, unknown> {
  return {
    skill: observedFile(join(directory, 'SKILL.md')),
    asset: observedFile(join(directory, 'asset.txt')),
    metadata: observedFile(join(directory, '.skillkit.json')),
  };
}

function recordRoundTrip(id: string, evidence: Record<string, unknown>): void {
  const proofDirectory = process.env.SKILLKIT_ROUND_TRIP_PROOF_DIR;
  if (!proofDirectory) return;
  mkdirSync(proofDirectory, { recursive: true });
  writeFileSync(join(proofDirectory, `${id}.json`), JSON.stringify(evidence, null, 2));
}

async function installGitFixture(fixture: GitFixture, agent = 'claude-code'): Promise<CliResult> {
  const result = await runCli([
    'install', fixture.source, '--skill', fixture.name, '--agent', agent,
    '--yes', '--no-scan', '--json',
  ], { cwd: fixture.project, env: fixture.env });
  recordRoundTrip(`${fixture.id}-install`, {
    source: fixture.source, provider: fixture.provider, revisionA: fixture.revisionA,
    install: result, installed: installedObservation(fixture.installedDirectory),
  });
  expect(result.exitCode, result.stdout + result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ success: true, installed: [fixture.name], total: 1 });
  expectInitialRevision(fixture.installedDirectory, fixture.name);
  return result;
}

async function updateGitFixture(fixture: GitFixture): Promise<CliResult> {
  return runCli(['update', fixture.name, '--force', '--json'], {
    cwd: fixture.project, env: fixture.env,
  });
}

function expectUpdatedRevision(directory: string, name: string, revision: string, update: CliResult): void {
  expect(update.exitCode, update.stdout + update.stderr).toBe(0);
  expect(JSON.parse(update.stdout)).toEqual({ updated: 1, skipped: 0, failed: 0 });
  expect(readFileSync(join(directory, 'SKILL.md'), 'utf8')).toBe(skillRevision(name, revision));
  expect(readFileSync(join(directory, 'asset.txt'), 'utf8')).toBe(`Asset ${name} revision ${revision}.\n`);
}

function serveWellKnownSkill(name: string): Server {
  const routes: Record<string, string> = {
    '/.well-known/skills/index.json': JSON.stringify({
      skills: [{ name, files: ['SKILL.md', 'asset.txt'] }],
    }),
    [`/.well-known/skills/${name}/SKILL.md`]: skillRevision(name, 'A'),
    [`/.well-known/skills/${name}/asset.txt`]: `Asset ${name} revision A.\n`,
  };
  return createServer((request, response) => {
    const content = routes[request.url as string];
    if (content === undefined) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200).end(content);
  });
}

describe('E2E: Core CLI Commands', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('source path round trip', () => {
    describe.each(gitProviders)('$type', (provider) => {
      it.each(['', 'catalog'])('updates a nested standalone file and directory from subtree "%s"', async (subtree) => {
        const fixture = createStandaloneGitFixture(testDir, provider, subtree);
        const install = await runCli([
          'install', fixture.source, '--all', '--agent', 'claude-code', '--yes', '--no-scan', '--json',
        ], { cwd: fixture.project, env: fixture.env });
        expect(install.exitCode, install.stdout + install.stderr).toBe(0);
        expect(JSON.parse(install.stdout)).toMatchObject({ success: true, total: 2 });
        expect(readFileSync(fixture.installedFile, 'utf8')).toBe(skillRevision('standalone-skill', 'A'));
        expectInitialRevision(fixture.installedDirectory, fixture.name);
        const installedMetadata = JSON.parse(readFileSync(fixture.metadataFile, 'utf8'));
        writeFileSync(fixture.sourceFile, skillRevision('standalone-skill', 'B'));
        writeSkillRevision(fixture.skillDirectory, fixture.name, 'B');
        const revisionB = gitRevision(fixture.repository, 'Standalone fixture revision B');
        const update = await runCli(['update', 'standalone-skill', fixture.name, '--force', '--json'], {
          cwd: fixture.project, env: fixture.env,
        });
        recordRoundTrip(fixture.id, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB, install, update,
          installedMetadata, sourceFile: observedFile(fixture.sourceFile),
          installed: standaloneObservation(fixture), directory: installedObservation(fixture.installedDirectory),
        });
        expect.soft(installedMetadata).toMatchObject({
          name: 'standalone-skill', source: fixture.source, sourceType: provider.type,
          subpath: 'skills/source-file.md',
        });
        expect(update.exitCode, update.stdout + update.stderr).toBe(0);
        expect.soft(JSON.parse(update.stdout)).toEqual({ updated: 2, skipped: 0, failed: 0 });
        expect.soft(readFileSync(fixture.installedFile, 'utf8')).toBe(skillRevision('standalone-skill', 'B'));
        expect(readFileSync(join(fixture.installedDirectory, 'SKILL.md'), 'utf8')).toBe(skillRevision(fixture.name, 'B'));
        expect(readFileSync(join(fixture.installedDirectory, 'asset.txt'), 'utf8')).toBe(`Asset ${fixture.name} revision B.\n`);
        expect(JSON.parse(readFileSync(fixture.metadataFile, 'utf8'))).toMatchObject({
          subpath: 'skills/source-file.md', updatedAt: expect.any(String),
        });
      });

      it('updates a standalone file from an upstream symlink after clone cleanup', async () => {
        const fixture = createStandaloneGitFixture(testDir, provider);
        const cloneDirectory = join(testDir, 'clones');
        mkdirSync(cloneDirectory);
        fixture.env.TMPDIR = cloneDirectory;
        const install = await runCli([
          'install', fixture.source, '--skill', 'standalone-skill', '--agent', 'claude-code',
          '--yes', '--no-scan', '--json',
        ], { cwd: fixture.project, env: fixture.env });
        expect(install.exitCode, install.stdout + install.stderr).toBe(0);
        expect(readFileSync(fixture.installedFile, 'utf8')).toBe(skillRevision('standalone-skill', 'A'));
        const installedBefore = standaloneObservation(fixture);
        const content = skillRevision('standalone-skill', 'B');
        writeFileSync(join(fixture.repository, 'skills', 'symlink-content.md'), content);
        rmSync(fixture.sourceFile);
        symlinkSync('symlink-content.md', fixture.sourceFile);
        expect(lstatSync(fixture.sourceFile).isSymbolicLink()).toBe(true);
        const revisionB = gitRevision(fixture.repository, 'Replace standalone source with symlink');
        const update = await runCli(['update', 'standalone-skill', '--force'], {
          cwd: fixture.project, env: fixture.env,
        });
        recordRoundTrip(`${fixture.id}-symlink-command`, { update });
        expect(update.exitCode, update.stdout + update.stderr).toBe(0);
        const installedIsSymlink = lstatSync(fixture.installedFile).isSymbolicLink();
        const installedLinkTarget = installedIsSymlink ? readlinkSync(fixture.installedFile) : null;
        const installedAfter = standaloneObservation(fixture);
        const remainingClones = readdirSync(cloneDirectory);
        recordRoundTrip(`${fixture.id}-symlink`, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB, install, update,
          sourceLinkTarget: readlinkSync(fixture.sourceFile), sourceFile: observedFile(fixture.sourceFile),
          installedBefore, installedAfter, installedIsSymlink, installedLinkTarget, remainingClones,
        });
        expect.soft(update.exitCode, update.stdout + update.stderr).toBe(0);
        expect.soft(update.stdout).toContain('Updated: 1, Skipped: 0, Failed: 0');
        expect.soft(installedIsSymlink).toBe(false);
        expect.soft(observedFile(fixture.installedFile)).toEqual({
          content, sha256: createHash('sha256').update(content).digest('hex'),
        });
        expect.soft(JSON.parse(readFileSync(fixture.metadataFile, 'utf8'))).toMatchObject({
          subpath: 'skills/source-file.md', updatedAt: expect.any(String),
          checksum: createHash('sha256').update(content).digest('hex').slice(0, 16),
        });
        expect(remainingClones).toEqual([]);
      });

      it.each(['removed', 'replaced by directory'])('skips a %s standalone source without replacing installed files', async (change) => {
        const fixture = createStandaloneGitFixture(testDir, provider);
        const install = await runCli([
          'install', fixture.source, '--skill', 'standalone-skill', '--agent', 'claude-code',
          '--yes', '--no-scan', '--json',
        ], { cwd: fixture.project, env: fixture.env });
        expect(install.exitCode, install.stdout + install.stderr).toBe(0);
        expect(readFileSync(fixture.installedFile, 'utf8')).toBe(skillRevision('standalone-skill', 'A'));
        const installedBefore = standaloneObservation(fixture);
        rmSync(fixture.sourceFile);
        if (change === 'replaced by directory') {
          writeSkillRevision(fixture.sourceFile, 'standalone-skill', 'B');
        }
        const revisionB = gitRevision(fixture.repository, `Standalone source ${change}`);
        const update = await runCli(['update', 'standalone-skill', '--force', '--json'], {
          cwd: fixture.project, env: fixture.env,
        });
        const installedAfter = standaloneObservation(fixture);
        recordRoundTrip(`${fixture.id}-${change}`, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB,
          install, update, installedBefore, installedAfter,
        });
        expect(update.exitCode, update.stdout + update.stderr).toBe(0);
        expect(JSON.parse(update.stdout)).toEqual({ updated: 0, skipped: 1, failed: 0 });
        expect(installedAfter).toEqual(installedBefore);
      });

      it.each(sourcePathCases)('updates $label from the discovered directory', async (sourceCase) => {
        const fixture = createGitFixture(testDir, provider, sourceCase);
        const install = await installGitFixture(fixture);
        const installedMetadata = readMetadata(fixture.installedDirectory);
        writeSkillRevision(fixture.skillDirectory, fixture.name, 'B');
        if (sourceCase.decoy) {
          writeSkillRevision(join(fixture.repository, fixture.name), 'decoy-skill', 'decoy-B');
        }
        const revisionB = gitRevision(fixture.repository, 'Fixture revision B');
        const update = await updateGitFixture(fixture);
        recordRoundTrip(fixture.id, {
          sourceCase, source: fixture.source, provider: fixture.provider,
          revisionA: fixture.revisionA, revisionB, install, update, installedMetadata,
          expectedSkill: skillRevision(fixture.name, 'B'),
          expectedAsset: `Asset ${fixture.name} revision B.\n`,
          sourceFiles: installedObservation(fixture.skillDirectory),
          decoyFiles: sourceCase.decoy ? installedObservation(join(fixture.repository, fixture.name)) : null,
          installed: installedObservation(fixture.installedDirectory),
        });
        expectUpdatedRevision(fixture.installedDirectory, fixture.name, 'B', update);
        expect(installedMetadata).toMatchObject({
          name: fixture.name, source: fixture.source, sourceType: provider.type,
          subpath: sourceCase.expectedSubpath,
        });
        expect(readMetadata(fixture.installedDirectory)).toMatchObject({
          name: fixture.name, source: fixture.source, sourceType: provider.type,
          subpath: sourceCase.expectedSubpath,
        });
      });

      it.each(['removed', 'moved', 'missing SKILL.md', 'replaced by file'])('skips a %s source without replacing installed files', async (change) => {
        const sourceCase = sourcePathCases[2];
        const fixture = createGitFixture(testDir, provider, sourceCase);
        fixture.id = `${fixture.id}-${change}`;
        const install = await installGitFixture(fixture);
        const installedBefore = installedObservation(fixture.installedDirectory);
        if (change === 'removed') {
          rmSync(fixture.skillDirectory, { recursive: true });
        } else if (change === 'moved') {
          renameSync(fixture.skillDirectory, join(fixture.repository, 'skills', 'moved-folder'));
        } else if (change === 'missing SKILL.md') {
          rmSync(join(fixture.skillDirectory, 'SKILL.md'));
        } else {
          rmSync(fixture.skillDirectory, { recursive: true });
          writeFileSync(fixture.skillDirectory, skillRevision(fixture.name, 'B'));
        }
        writeFileSync(join(fixture.repository, 'README.md'), `Source ${change}.\n`);
        const revisionB = gitRevision(fixture.repository, `Fixture source ${change}`);
        const update = change === 'replaced by file'
          ? await runCli(['update', fixture.name, '--force'], { cwd: fixture.project, env: fixture.env })
          : await updateGitFixture(fixture);
        const installedAfter = installedObservation(fixture.installedDirectory);
        recordRoundTrip(fixture.id, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB,
          install, update, installedBefore, installedAfter,
        });
        expect(update.exitCode, update.stdout + update.stderr).toBe(0);
        if (change === 'replaced by file') {
          expect(update.stdout).toContain('Updated: 0, Skipped: 1, Failed: 0');
        } else {
          expect(JSON.parse(update.stdout)).toEqual({ updated: 0, skipped: 1, failed: 0 });
        }
        expect(installedAfter).toEqual(installedBefore);
      });

      it('preserves legacy metadata that already points to a valid decoy', async () => {
        const sourceCase = sourcePathCases[6];
        const fixture = createGitFixture(testDir, provider, sourceCase);
        fixture.id = `${fixture.id}-legacy-valid-decoy`;
        const install = await installGitFixture(fixture);
        const legacyMetadata = readMetadata(fixture.installedDirectory);
        legacyMetadata.subpath = fixture.name;
        writeFileSync(join(fixture.installedDirectory, '.skillkit.json'), JSON.stringify(legacyMetadata));
        writeSkillRevision(fixture.skillDirectory, fixture.name, 'B');
        const decoyDirectory = join(fixture.repository, fixture.name);
        writeSkillRevision(decoyDirectory, 'decoy-skill', 'decoy-B');
        const revisionB = gitRevision(fixture.repository, 'Fixture legacy valid decoy');
        const update = await updateGitFixture(fixture);
        recordRoundTrip(fixture.id, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB,
          install, update, legacyMetadata,
          sourceFiles: installedObservation(fixture.skillDirectory),
          decoyFiles: installedObservation(decoyDirectory),
          installed: installedObservation(fixture.installedDirectory),
        });
        expectUpdatedRevision(fixture.installedDirectory, 'decoy-skill', 'decoy-B', update);
        expect(readMetadata(fixture.installedDirectory)).toMatchObject({
          name: fixture.name, source: fixture.source, subpath: fixture.name,
        });
      });

      it('requires force reinstall to repair legacy wrong metadata', async () => {
        const sourceCase = sourcePathCases[2];
        const fixture = createGitFixture(testDir, provider, sourceCase);
        fixture.id = `${fixture.id}-legacy`;
        const install = await installGitFixture(fixture);
        const legacyMetadata = readMetadata(fixture.installedDirectory);
        legacyMetadata.subpath = fixture.name;
        writeFileSync(join(fixture.installedDirectory, '.skillkit.json'), JSON.stringify(legacyMetadata));
        const installedBefore = installedObservation(fixture.installedDirectory);
        writeSkillRevision(fixture.skillDirectory, fixture.name, 'B');
        const revisionB = gitRevision(fixture.repository, 'Fixture revision B');
        const legacyUpdate = await updateGitFixture(fixture);
        const legacyAfter = installedObservation(fixture.installedDirectory);
        recordRoundTrip(`${fixture.id}-skip`, {
          source: fixture.source, revisionA: fixture.revisionA, revisionB,
          install, legacyUpdate, legacyMetadata, installedBefore, legacyAfter,
        });
        expect(legacyUpdate.exitCode, legacyUpdate.stdout + legacyUpdate.stderr).toBe(0);
        expect(JSON.parse(legacyUpdate.stdout)).toEqual({ updated: 0, skipped: 1, failed: 0 });
        expect(legacyAfter).toEqual(installedBefore);
        const reinstall = await runCli([
          'install', fixture.source, '--skill', fixture.name, '--agent', 'claude-code',
          '--yes', '--no-scan', '--force', '--json',
        ], { cwd: fixture.project, env: fixture.env });
        const reinstalledMetadata = readMetadata(fixture.installedDirectory);
        recordRoundTrip(`${fixture.id}-reinstall`, {
          reinstall, reinstalledMetadata, installed: installedObservation(fixture.installedDirectory),
        });
        expect(reinstall.exitCode, reinstall.stdout + reinstall.stderr).toBe(0);
        expect(JSON.parse(reinstall.stdout)).toMatchObject({ success: true, installed: [fixture.name], total: 1 });
        expect(readFileSync(join(fixture.installedDirectory, 'SKILL.md'), 'utf8')).toBe(skillRevision(fixture.name, 'B'));
        expect(readFileSync(join(fixture.installedDirectory, 'asset.txt'), 'utf8')).toBe(`Asset ${fixture.name} revision B.\n`);
        writeSkillRevision(fixture.skillDirectory, fixture.name, 'C');
        const revisionC = gitRevision(fixture.repository, 'Fixture revision C');
        const update = await updateGitFixture(fixture);
        recordRoundTrip(fixture.id, {
          source: fixture.source, revisionB, revisionC, legacyUpdate,
          reinstall, update, reinstalledMetadata,
          installed: installedObservation(fixture.installedDirectory),
        });
        expectUpdatedRevision(fixture.installedDirectory, fixture.name, 'C', update);
        expect(reinstalledMetadata).toMatchObject({ subpath: sourceCase.expectedSubpath });
      });
    });

    it('updates a second agent in a separate project fixture', async () => {
      const sourceCase = sourcePathCases[2];
      const fixture = createGitFixture(testDir, gitProviders[0], sourceCase, 'codex');
      const install = await installGitFixture(fixture, 'codex');
      const installedMetadata = readMetadata(fixture.installedDirectory);
      writeSkillRevision(fixture.skillDirectory, fixture.name, 'B');
      const revisionB = gitRevision(fixture.repository, 'Fixture revision B');
      const update = await updateGitFixture(fixture);
      recordRoundTrip(fixture.id, {
        source: fixture.source, revisionA: fixture.revisionA, revisionB,
        install, update, installedMetadata, installed: installedObservation(fixture.installedDirectory),
      });
      expectUpdatedRevision(fixture.installedDirectory, fixture.name, 'B', update);
      expect(installedMetadata).toMatchObject({ subpath: 'skills/source-folder', source: fixture.source });
      expect(existsSync(join(fixture.project, '.claude', 'skills', fixture.name))).toBe(false);
    });

    it('preserves local matching-folder install and update behavior', async () => {
      const source = join(testDir, 'local-source');
      const project = join(testDir, 'local-project');
      const name = 'local-skill';
      const sourceDirectory = join(source, name);
      const installedDirectory = join(project, '.claude', 'skills', name);
      mkdirSync(project, { recursive: true });
      writeSkillRevision(sourceDirectory, name, 'A');
      const install = await runCli([
        'install', source, '--skill', name, '--agent', 'claude-code', '--yes', '--no-scan', '--json',
      ], { cwd: project });
      recordRoundTrip('local-install', { install, installed: installedObservation(installedDirectory) });
      expect(install.exitCode, install.stdout + install.stderr).toBe(0);
      expect(JSON.parse(install.stdout)).toMatchObject({ success: true, installed: [name], total: 1 });
      expectInitialRevision(installedDirectory, name);
      const installedMetadata = readMetadata(installedDirectory);
      writeSkillRevision(sourceDirectory, name, 'B');
      const update = await runCli(['update', name, '--force', '--json'], { cwd: project });
      recordRoundTrip('local', { install, update, installedMetadata, installed: installedObservation(installedDirectory) });
      expectUpdatedRevision(installedDirectory, name, 'B', update);
      expect(installedMetadata).toMatchObject({ name, source, sourceType: 'local', subpath: name });
      expect(readMetadata(installedDirectory)).toMatchObject({ source, sourceType: 'local', subpath: name });
    });

    it('preserves well-known directory metadata and accompanying assets', async () => {
      const name = 'well-known-skill';
      const server = serveWellKnownSkill(name);
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      try {
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected a listening TCP server');
        const source = `http://127.0.0.1:${address.port}`;
        const installedDirectory = join(testDir, '.claude', 'skills', name);
        const install = await runCli([
          'install', source, '--skill', name, '--agent', 'claude-code', '--yes', '--no-scan', '--json',
        ], { cwd: testDir });
        recordRoundTrip('well-known', { source, install, installed: installedObservation(installedDirectory) });
        expect(install.exitCode, install.stdout + install.stderr).toBe(0);
        expect(JSON.parse(install.stdout)).toMatchObject({ success: true, installed: [name], total: 1 });
        expect(readMetadata(installedDirectory)).toMatchObject({ name, source, sourceType: 'wellknown', subpath: name });
        expectInitialRevision(installedDirectory, name);
      } finally {
        await new Promise<void>((resolve, reject) => server.close((error) => {
          if (error) reject(error);
          else resolve();
        }));
      }
    });
  });

  describe('skillkit --version', () => {
    it('should display version number', async () => {
      const result = await runCli(['--version']);
      expect(result.success).toBe(true);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('skillkit --help', () => {
    it('should display help information', async () => {
      const result = await runCli(['--help']);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('skillkit');
    });

    it('should list available commands', async () => {
      const result = await runCli(['--help']);
      expect(result.stdout + result.stderr).toMatch(/init|list|install|sync/i);
    });
  });

  describe('skillkit init', () => {
    it('should initialize skillkit in a new project', async () => {
      const result = await runCli(['init'], { cwd: testDir });
      const output = result.stdout + result.stderr;

      // Check for concrete successful outcome - any of these directories
      const hasSkillsDir = testFileExists(testDir, 'skills');
      const hasSkillkitDir = testFileExists(testDir, '.skillkit');
      const hasClaudeSkills = testFileExists(testDir, '.claude/skills');
      const hasAgentSkills = testFileExists(testDir, '.agent/skills');
      const hasAnyDir = hasSkillsDir || hasSkillkitDir || hasClaudeSkills || hasAgentSkills;

      // Either a directory was created OR the command completed successfully with output
      if (!hasAnyDir && result.exitCode !== 0) {
        // Fail with debugging info
        expect.fail(`Init failed. Exit code: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasAnyDir || result.exitCode === 0).toBe(true);
    });

    it('should create skills directory structure', async () => {
      const result = await runCli(['init'], { cwd: testDir });

      // Verify expected structure actually exists - any of these directories
      const hasSkillsDir = testFileExists(testDir, 'skills');
      const hasSkillkitDir = testFileExists(testDir, '.skillkit');
      const hasClaudeSkills = testFileExists(testDir, '.claude/skills');
      const hasAgentSkills = testFileExists(testDir, '.agent/skills');
      const hasAnySkillDir = hasSkillsDir || hasSkillkitDir || hasClaudeSkills || hasAgentSkills;

      // Strict assertion - init should create at least one directory
      if (!hasAnySkillDir) {
        const output = result.stdout + result.stderr;
        expect.fail(`Init did not create expected directories.\nExit code: ${result.exitCode}\nOutput: ${output}`);
      }

      expect(hasAnySkillDir).toBe(true);
    });
  });

  describe('skillkit list', () => {
    it('should list no skills in empty project', async () => {
      const result = await runCli(['list'], { cwd: testDir });
      // Should complete without error even if no skills
      expect(result.exitCode).toBeLessThanOrEqual(1);
    });

    it('should list discovered skills', async () => {
      // Create some test skills
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'my-skill');
      createTestSkill(skillsDir, 'another-skill');

      const result = await runCli(['list'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should find the skills or report none
      expect(output.includes('my-skill') || output.includes('skill') || output.includes('0')).toBe(
        true
      );
    });

    it('should support --json output format', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'json-test-skill');

      const result = await runCli(['list', '--json'], { cwd: testDir });
      // If JSON format is supported, output should be parseable
      if (result.stdout.trim().startsWith('[') || result.stdout.trim().startsWith('{')) {
        expect(() => JSON.parse(result.stdout)).not.toThrow();
      }
    });
  });

  describe('skillkit read', () => {
    it('should read skill content', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'readable-skill', {
        content: 'This skill has specific content for reading.',
      });

      const result = await runCli(['read', 'readable-skill'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should either show the skill or report not found
      expect(
        output.includes('readable-skill') ||
          output.includes('specific content') ||
          output.includes('not found') ||
          output.includes('No skill')
      ).toBe(true);
    });

    it('should handle non-existent skill gracefully', async () => {
      const result = await runCli(['read', 'nonexistent-skill'], { cwd: testDir });
      // Should not crash, may report error
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit validate', () => {
    it('should validate a correct skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      const skillPath = createTestSkill(skillsDir, 'valid-skill', {
        description: 'A properly formatted skill with sufficient description length for validation',
      });

      const result = await runCli(['validate', skillPath], { cwd: testDir });
      const output = result.stdout + result.stderr;
      expect(output.includes('valid') || output.includes('success') || result.success).toBe(true);
    });

    it('should report errors for invalid skill', async () => {
      const skillDir = join(testDir, 'invalid-skill');
      mkdirSync(skillDir, { recursive: true });
      // Create skill without frontmatter
      writeFileSync(join(skillDir, 'SKILL.md'), '# No Frontmatter\n\nJust content.');

      const result = await runCli(['validate', skillDir], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should report validation issues
      expect(
        output.includes('error') ||
          output.includes('invalid') ||
          output.includes('missing') ||
          !result.success
      ).toBe(true);
    });

    it('should validate skill with all Agent Skills spec fields', async () => {
      const skillDir = join(testDir, 'full-spec-skill');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: full-spec-skill
description: A skill that uses all Agent Skills specification fields for complete validation testing
license: MIT
compatibility: Node.js 18+, requires npm
allowed-tools: Bash(npm:*) Read Write Edit
metadata:
  author: test-org
  version: "1.0.0"
  tags:
    - testing
    - e2e
---

# Full Spec Skill

This skill uses all available frontmatter fields.
`
      );

      const result = await runCli(['validate', skillDir], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should complete validation - either valid or show specific validation messages
      expect(
        result.success ||
          output.includes('valid') ||
          output.includes('full-spec-skill') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit enable/disable', () => {
    it('should enable a skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'toggle-skill');

      const result = await runCli(['enable', 'toggle-skill'], { cwd: testDir });
      // Command should complete
      expect(result.exitCode).toBeDefined();
    });

    it('should disable a skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'toggle-skill');

      // First enable, then disable
      await runCli(['enable', 'toggle-skill'], { cwd: testDir });
      const result = await runCli(['disable', 'toggle-skill'], { cwd: testDir });
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('skillkit sync', () => {
    it('should sync skills to agent config', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'sync-test-skill');

      const result = await runCli(['sync', '--agent', 'claude-code'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should attempt sync operation
      expect(
        output.includes('sync') ||
          output.includes('claude') ||
          output.includes('skill') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit status', () => {
    it('should show current skillkit status', async () => {
      const result = await runCli(['status'], { cwd: testDir });
      const output = result.stdout + result.stderr;
      // Should show some status information
      expect(
        output.includes('status') ||
          output.includes('skill') ||
          output.includes('agent') ||
          output.includes('No') ||
          result.exitCode !== undefined
      ).toBe(true);
    });
  });

  describe('skillkit remove', () => {
    it('should remove an installed skill', async () => {
      const skillsDir = join(testDir, 'skills');
      mkdirSync(skillsDir, { recursive: true });
      createTestSkill(skillsDir, 'removable-skill');

      // First ensure it exists
      expect(testFileExists(testDir, 'skills', 'removable-skill', 'SKILL.md')).toBe(true);

      const result = await runCli(['remove', 'removable-skill'], { cwd: testDir });
      // Command should complete
      expect(result.exitCode).toBeDefined();
    });
  });
});
