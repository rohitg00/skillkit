import { formatError, isOptionSymbol } from './options/utils.mjs';

/**
 * Base abstract class for CLI commands. The main thing to remember is to
 * declare an async `execute` member function that will be called when the
 * command is invoked from the CLI, and optionally a `paths` property to
 * declare the set of paths under which the command should be exposed.
 */
class Command {
    constructor() {
        /**
         * Predefined that will be set to true if `-h,--help` has been used, in
         * which case `Command#execute` won't be called.
         */
        this.help = false;
    }
    /**
     * Defines the usage information for the given command.
     */
    static Usage(usage) {
        return usage;
    }
    /**
     * Standard error handler which will simply rethrow the error. Can be used
     * to add custom logic to handle errors from the command or simply return
     * the parent class error handling.
     */
    async catch(error) {
        throw error;
    }
    async validateAndExecute() {
        const commandClass = this.constructor;
        const cascade = commandClass.schema;
        if (Array.isArray(cascade)) {
            const { isDict, isUnknown, applyCascade } = await import('typanion');
            const schema = applyCascade(isDict(isUnknown()), cascade);
            const errors = [];
            const coercions = [];
            const check = schema(this, { errors, coercions });
            if (!check)
                throw formatError(`Invalid option schema`, errors);
            for (const [, op] of coercions) {
                op();
            }
        }
        else if (cascade != null) {
            throw new Error(`Invalid command schema`);
        }
        const exitCode = await this.execute();
        if (typeof exitCode !== `undefined`) {
            return exitCode;
        }
        else {
            return 0;
        }
    }
}
/**
 * Used to detect option definitions.
 */
Command.isOption = isOptionSymbol;
/**
 * Just an helper to use along with the `paths` fields, to make it
 * clearer that a command is the default one.
 *
 * @example
 * class MyCommand extends Command {
 *   static paths = [Command.Default];
 * }
 */
Command.Default = [];

export { Command };
