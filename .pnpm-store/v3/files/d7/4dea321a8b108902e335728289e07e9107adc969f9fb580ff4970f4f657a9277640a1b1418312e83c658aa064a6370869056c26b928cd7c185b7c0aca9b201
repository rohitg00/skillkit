import { Command } from '../Command.mjs';

/**
 * A command that prints the clipanion definitions.
 */
class DefinitionsCommand extends Command {
    async execute() {
        this.context.stdout.write(`${JSON.stringify(this.cli.definitions(), null, 2)}\n`);
    }
}
DefinitionsCommand.paths = [[`--clipanion=definitions`]];

export { DefinitionsCommand };
