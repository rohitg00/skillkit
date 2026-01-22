#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Cli, Builtins } from 'clipanion';
import {
  InstallCommand,
  SyncCommand,
  ReadCommand,
  ListCommand,
  EnableCommand,
  DisableCommand,
  UpdateCommand,
  RemoveCommand,
  InitCommand,
  ValidateCommand,
  CreateCommand,
  UICommand,
} from './commands/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version || '1.2.0';

const cli = new Cli({
  binaryLabel: 'skillkit',
  binaryName: 'skillkit',
  binaryVersion: version,
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.register(InstallCommand);
cli.register(SyncCommand);
cli.register(ReadCommand);
cli.register(ListCommand);
cli.register(EnableCommand);
cli.register(DisableCommand);
cli.register(UpdateCommand);
cli.register(RemoveCommand);
cli.register(InitCommand);
cli.register(ValidateCommand);
cli.register(CreateCommand);
cli.register(UICommand);

cli.runExit(process.argv.slice(2));
