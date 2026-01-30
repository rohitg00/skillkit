import { Command } from '../Command.mjs';
import { Proxy } from '../options/Proxy.mjs';

/**
 * A command that prints the clipanion tokens.
 */
class TokensCommand extends Command {
    constructor() {
        super(...arguments);
        this.args = Proxy();
    }
    async execute() {
        this.context.stdout.write(`${JSON.stringify(this.cli.process(this.args).tokens, null, 2)}\n`);
    }
}
TokensCommand.paths = [[`--clipanion=tokens`]];

export { TokensCommand };
