#!/usr/bin/env node
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

const cli = new Cli({
  binaryLabel: 'skillkit',
  binaryName: 'skillkit',
  binaryVersion: '1.1.0',
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
