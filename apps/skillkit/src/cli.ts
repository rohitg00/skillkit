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
  TranslateCommand,
  ContextCommand,
  RecommendCommand,
  StatusCommand,
  PauseCommand,
  ResumeCommand,
  WorkflowRunCommand,
  WorkflowListCommand,
  WorkflowCreateCommand,
  RunCommand,
  TestCommand,
  MarketplaceCommand,
  MemoryCommand,
} from '@skillkit/cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
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
cli.register(TranslateCommand);
cli.register(ContextCommand);
cli.register(RecommendCommand);
cli.register(StatusCommand);
cli.register(PauseCommand);
cli.register(ResumeCommand);
cli.register(WorkflowRunCommand);
cli.register(WorkflowListCommand);
cli.register(WorkflowCreateCommand);
cli.register(RunCommand);
cli.register(TestCommand);
cli.register(MarketplaceCommand);
cli.register(MemoryCommand);

cli.runExit(process.argv.slice(2));
