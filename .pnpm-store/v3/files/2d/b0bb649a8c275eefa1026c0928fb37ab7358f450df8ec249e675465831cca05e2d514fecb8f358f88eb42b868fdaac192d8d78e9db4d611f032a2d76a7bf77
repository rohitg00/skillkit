import { Command } from '../Command.mjs';

/**
 * A command that prints the version of the binary (`cli.binaryVersion`).
 *
 * Paths: `-v`, `--version`
 */
class VersionCommand extends Command {
    async execute() {
        var _a;
        this.context.stdout.write(`${(_a = this.cli.binaryVersion) !== null && _a !== void 0 ? _a : `<unknown>`}\n`);
    }
}
VersionCommand.paths = [[`-v`], [`--version`]];

export { VersionCommand };
