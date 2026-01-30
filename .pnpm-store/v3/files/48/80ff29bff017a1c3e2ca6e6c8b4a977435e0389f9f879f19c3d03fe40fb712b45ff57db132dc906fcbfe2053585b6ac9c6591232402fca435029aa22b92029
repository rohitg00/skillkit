import { Command } from '../Command.mjs';

/**
 * A command that prints the usage of all commands.
 *
 * Paths: `-h`, `--help`
 */
class HelpCommand extends Command {
    async execute() {
        this.context.stdout.write(this.cli.usage());
    }
}
HelpCommand.paths = [[`-h`], [`--help`]];

export { HelpCommand };
