'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var advanced_Command = require('../Command.js');

/**
 * A command that prints the usage of all commands.
 *
 * Paths: `-h`, `--help`
 */
class HelpCommand extends advanced_Command.Command {
    async execute() {
        this.context.stdout.write(this.cli.usage());
    }
}
HelpCommand.paths = [[`-h`], [`--help`]];

exports.HelpCommand = HelpCommand;
