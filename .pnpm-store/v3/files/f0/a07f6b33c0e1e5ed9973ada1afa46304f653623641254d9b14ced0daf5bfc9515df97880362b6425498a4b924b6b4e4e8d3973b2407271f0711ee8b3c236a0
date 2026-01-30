import { getDefaultColorDepth, getCaptureActivator } from '../platform/node.mjs';
import { HELP_COMMAND_INDEX } from '../constants.mjs';
import { CliBuilder } from '../core.mjs';
import { formatMarkdownish, richFormat, textFormat } from '../format.mjs';
import { Command } from './Command.mjs';
import { HelpCommand } from './HelpCommand.mjs';

const errorCommandSymbol = Symbol(`clipanion/errorCommand`);
async function runExit(...args) {
    const { resolvedOptions, resolvedCommandClasses, resolvedArgv, resolvedContext, } = resolveRunParameters(args);
    const cli = Cli.from(resolvedCommandClasses, resolvedOptions);
    return cli.runExit(resolvedArgv, resolvedContext);
}
async function run(...args) {
    const { resolvedOptions, resolvedCommandClasses, resolvedArgv, resolvedContext, } = resolveRunParameters(args);
    const cli = Cli.from(resolvedCommandClasses, resolvedOptions);
    return cli.run(resolvedArgv, resolvedContext);
}
function resolveRunParameters(args) {
    let resolvedOptions;
    let resolvedCommandClasses;
    let resolvedArgv;
    let resolvedContext;
    if (typeof process !== `undefined` && typeof process.argv !== `undefined`)
        resolvedArgv = process.argv.slice(2);
    switch (args.length) {
        case 1:
            {
                resolvedCommandClasses = args[0];
            }
            break;
        case 2:
            {
                if (args[0] && (args[0].prototype instanceof Command) || Array.isArray(args[0])) {
                    resolvedCommandClasses = args[0];
                    if (Array.isArray(args[1])) {
                        resolvedArgv = args[1];
                    }
                    else {
                        resolvedContext = args[1];
                    }
                }
                else {
                    resolvedOptions = args[0];
                    resolvedCommandClasses = args[1];
                }
            }
            break;
        case 3:
            {
                if (Array.isArray(args[2])) {
                    resolvedOptions = args[0];
                    resolvedCommandClasses = args[1];
                    resolvedArgv = args[2];
                }
                else if (args[0] && (args[0].prototype instanceof Command) || Array.isArray(args[0])) {
                    resolvedCommandClasses = args[0];
                    resolvedArgv = args[1];
                    resolvedContext = args[2];
                }
                else {
                    resolvedOptions = args[0];
                    resolvedCommandClasses = args[1];
                    resolvedContext = args[2];
                }
            }
            break;
        default:
            {
                resolvedOptions = args[0];
                resolvedCommandClasses = args[1];
                resolvedArgv = args[2];
                resolvedContext = args[3];
            }
            break;
    }
    if (typeof resolvedArgv === `undefined`)
        throw new Error(`The argv parameter must be provided when running Clipanion outside of a Node context`);
    return {
        resolvedOptions,
        resolvedCommandClasses,
        resolvedArgv,
        resolvedContext,
    };
}
/**
 * @template Context The context shared by all commands. Contexts are a set of values, defined when calling the `run`/`runExit` functions from the CLI instance, that will be made available to the commands via `this.context`.
 */
class Cli {
    /**
     * Creates a new Cli and registers all commands passed as parameters.
     *
     * @param commandClasses The Commands to register
     * @returns The created `Cli` instance
     */
    static from(commandClasses, options = {}) {
        const cli = new Cli(options);
        const resolvedCommandClasses = Array.isArray(commandClasses)
            ? commandClasses
            : [commandClasses];
        for (const commandClass of resolvedCommandClasses)
            cli.register(commandClass);
        return cli;
    }
    constructor({ binaryLabel, binaryName: binaryNameOpt = `...`, binaryVersion, enableCapture = false, enableColors } = {}) {
        this.registrations = new Map();
        this.builder = new CliBuilder({ binaryName: binaryNameOpt });
        this.binaryLabel = binaryLabel;
        this.binaryName = binaryNameOpt;
        this.binaryVersion = binaryVersion;
        this.enableCapture = enableCapture;
        this.enableColors = enableColors;
    }
    /**
     * Registers a command inside the CLI.
     */
    register(commandClass) {
        var _a;
        if (this.registrations.has(commandClass))
            throw new RangeError(`${commandClass.name} has already been registered`);
        const specs = new Map();
        const command = new commandClass();
        for (const key in command) {
            const value = command[key];
            if (typeof value === `object` && value !== null && value[Command.isOption]) {
                specs.set(key, value);
            }
        }
        const builder = this.builder.command();
        const index = builder.cliIndex;
        const paths = (_a = commandClass.paths) !== null && _a !== void 0 ? _a : command.paths;
        if (typeof paths !== `undefined`)
            for (const path of paths)
                builder.addPath(path);
        this.registrations.set(commandClass, { specs, builder, index });
        for (const [key, { definition }] of specs.entries())
            definition(builder, key);
        builder.setContext({
            commandClass,
        });
    }
    process(opts, contextArg) {
        const { input, context: userContext, partial } = typeof opts === `object` && Array.isArray(opts)
            ? { input: opts, context: contextArg }
            : opts;
        const { contexts, process } = this.builder.compile();
        const state = process(input, { partial });
        const context = {
            ...Cli.defaultContext,
            ...userContext,
        };
        switch (state.selectedIndex) {
            case HELP_COMMAND_INDEX:
                {
                    const command = HelpCommand.from(state, contexts);
                    command.context = context;
                    command.tokens = state.tokens;
                    return command;
                }
            default:
                {
                    const { commandClass } = contexts[state.selectedIndex];
                    const record = this.registrations.get(commandClass);
                    if (typeof record === `undefined`)
                        throw new Error(`Assertion failed: Expected the command class to have been registered.`);
                    const command = new commandClass();
                    command.context = context;
                    command.tokens = state.tokens;
                    command.path = state.path;
                    try {
                        for (const [key, { transformer }] of record.specs.entries())
                            command[key] = transformer(record.builder, key, state, context);
                        return command;
                    }
                    catch (error) {
                        error[errorCommandSymbol] = command;
                        throw error;
                    }
                }
                break;
        }
    }
    async run(input, userContext) {
        var _a, _b;
        let command;
        const context = {
            ...Cli.defaultContext,
            ...userContext,
        };
        const colored = (_a = this.enableColors) !== null && _a !== void 0 ? _a : context.colorDepth > 1;
        if (!Array.isArray(input)) {
            command = input;
        }
        else {
            try {
                command = this.process(input, context);
            }
            catch (error) {
                context.stdout.write(this.error(error, { colored }));
                return 1;
            }
        }
        if (command.help) {
            context.stdout.write(this.usage(command, { colored, detailed: true }));
            return 0;
        }
        command.context = context;
        command.cli = {
            binaryLabel: this.binaryLabel,
            binaryName: this.binaryName,
            binaryVersion: this.binaryVersion,
            enableCapture: this.enableCapture,
            enableColors: this.enableColors,
            definitions: () => this.definitions(),
            definition: command => this.definition(command),
            error: (error, opts) => this.error(error, opts),
            format: colored => this.format(colored),
            process: (input, subContext) => this.process(input, { ...context, ...subContext }),
            run: (input, subContext) => this.run(input, { ...context, ...subContext }),
            usage: (command, opts) => this.usage(command, opts),
        };
        const activate = this.enableCapture
            ? (_b = getCaptureActivator(context)) !== null && _b !== void 0 ? _b : noopCaptureActivator
            : noopCaptureActivator;
        let exitCode;
        try {
            exitCode = await activate(() => command.validateAndExecute().catch(error => command.catch(error).then(() => 0)));
        }
        catch (error) {
            context.stdout.write(this.error(error, { colored, command }));
            return 1;
        }
        return exitCode;
    }
    async runExit(input, context) {
        process.exitCode = await this.run(input, context);
    }
    definition(commandClass, { colored = false } = {}) {
        if (!commandClass.usage)
            return null;
        const { usage: path } = this.getUsageByRegistration(commandClass, { detailed: false });
        const { usage, options } = this.getUsageByRegistration(commandClass, { detailed: true, inlineOptions: false });
        const category = typeof commandClass.usage.category !== `undefined`
            ? formatMarkdownish(commandClass.usage.category, { format: this.format(colored), paragraphs: false })
            : undefined;
        const description = typeof commandClass.usage.description !== `undefined`
            ? formatMarkdownish(commandClass.usage.description, { format: this.format(colored), paragraphs: false })
            : undefined;
        const details = typeof commandClass.usage.details !== `undefined`
            ? formatMarkdownish(commandClass.usage.details, { format: this.format(colored), paragraphs: true })
            : undefined;
        const examples = typeof commandClass.usage.examples !== `undefined`
            ? commandClass.usage.examples.map(([label, cli]) => [formatMarkdownish(label, { format: this.format(colored), paragraphs: false }), cli.replace(/\$0/g, this.binaryName)])
            : undefined;
        return { path, usage, category, description, details, examples, options };
    }
    definitions({ colored = false } = {}) {
        const data = [];
        for (const commandClass of this.registrations.keys()) {
            const usage = this.definition(commandClass, { colored });
            if (!usage)
                continue;
            data.push(usage);
        }
        return data;
    }
    usage(command = null, { colored, detailed = false, prefix = `$ ` } = {}) {
        var _a;
        // In case the default command is the only one, we can just show the command help rather than the general one
        if (command === null) {
            for (const commandClass of this.registrations.keys()) {
                const paths = commandClass.paths;
                const isDocumented = typeof commandClass.usage !== `undefined`;
                const isExclusivelyDefault = !paths || paths.length === 0 || (paths.length === 1 && paths[0].length === 0);
                const isDefault = isExclusivelyDefault || ((_a = paths === null || paths === void 0 ? void 0 : paths.some(path => path.length === 0)) !== null && _a !== void 0 ? _a : false);
                if (isDefault) {
                    if (command) {
                        command = null;
                        break;
                    }
                    else {
                        command = commandClass;
                    }
                }
                else {
                    if (isDocumented) {
                        command = null;
                        continue;
                    }
                }
            }
            if (command) {
                detailed = true;
            }
        }
        // @ts-ignore
        const commandClass = command !== null && command instanceof Command
            ? command.constructor
            : command;
        let result = ``;
        if (!commandClass) {
            const commandsByCategories = new Map();
            for (const [commandClass, { index }] of this.registrations.entries()) {
                if (typeof commandClass.usage === `undefined`)
                    continue;
                const category = typeof commandClass.usage.category !== `undefined`
                    ? formatMarkdownish(commandClass.usage.category, { format: this.format(colored), paragraphs: false })
                    : null;
                let categoryCommands = commandsByCategories.get(category);
                if (typeof categoryCommands === `undefined`)
                    commandsByCategories.set(category, categoryCommands = []);
                const { usage } = this.getUsageByIndex(index);
                categoryCommands.push({ commandClass, usage });
            }
            const categoryNames = Array.from(commandsByCategories.keys()).sort((a, b) => {
                if (a === null)
                    return -1;
                if (b === null)
                    return +1;
                return a.localeCompare(b, `en`, { usage: `sort`, caseFirst: `upper` });
            });
            const hasLabel = typeof this.binaryLabel !== `undefined`;
            const hasVersion = typeof this.binaryVersion !== `undefined`;
            if (hasLabel || hasVersion) {
                if (hasLabel && hasVersion)
                    result += `${this.format(colored).header(`${this.binaryLabel} - ${this.binaryVersion}`)}\n\n`;
                else if (hasLabel)
                    result += `${this.format(colored).header(`${this.binaryLabel}`)}\n`;
                else
                    result += `${this.format(colored).header(`${this.binaryVersion}`)}\n`;
                result += `  ${this.format(colored).bold(prefix)}${this.binaryName} <command>\n`;
            }
            else {
                result += `${this.format(colored).bold(prefix)}${this.binaryName} <command>\n`;
            }
            for (const categoryName of categoryNames) {
                const commands = commandsByCategories.get(categoryName).slice().sort((a, b) => {
                    return a.usage.localeCompare(b.usage, `en`, { usage: `sort`, caseFirst: `upper` });
                });
                const header = categoryName !== null
                    ? categoryName.trim()
                    : `General commands`;
                result += `\n`;
                result += `${this.format(colored).header(`${header}`)}\n`;
                for (const { commandClass, usage } of commands) {
                    const doc = commandClass.usage.description || `undocumented`;
                    result += `\n`;
                    result += `  ${this.format(colored).bold(usage)}\n`;
                    result += `    ${formatMarkdownish(doc, { format: this.format(colored), paragraphs: false })}`;
                }
            }
            result += `\n`;
            result += formatMarkdownish(`You can also print more details about any of these commands by calling them with the \`-h,--help\` flag right after the command name.`, { format: this.format(colored), paragraphs: true });
        }
        else {
            if (!detailed) {
                const { usage } = this.getUsageByRegistration(commandClass);
                result += `${this.format(colored).bold(prefix)}${usage}\n`;
            }
            else {
                const { description = ``, details = ``, examples = [], } = commandClass.usage || {};
                if (description !== ``) {
                    result += formatMarkdownish(description, { format: this.format(colored), paragraphs: false }).replace(/^./, $0 => $0.toUpperCase());
                    result += `\n`;
                }
                if (details !== `` || examples.length > 0) {
                    result += `${this.format(colored).header(`Usage`)}\n`;
                    result += `\n`;
                }
                const { usage, options } = this.getUsageByRegistration(commandClass, { inlineOptions: false });
                result += `${this.format(colored).bold(prefix)}${usage}\n`;
                if (options.length > 0) {
                    result += `\n`;
                    result += `${this.format(colored).header(`Options`)}\n`;
                    const maxDefinitionLength = options.reduce((length, option) => {
                        return Math.max(length, option.definition.length);
                    }, 0);
                    result += `\n`;
                    for (const { definition, description } of options) {
                        result += `  ${this.format(colored).bold(definition.padEnd(maxDefinitionLength))}    ${formatMarkdownish(description, { format: this.format(colored), paragraphs: false })}`;
                    }
                }
                if (details !== ``) {
                    result += `\n`;
                    result += `${this.format(colored).header(`Details`)}\n`;
                    result += `\n`;
                    result += formatMarkdownish(details, { format: this.format(colored), paragraphs: true });
                }
                if (examples.length > 0) {
                    result += `\n`;
                    result += `${this.format(colored).header(`Examples`)}\n`;
                    for (const [description, example] of examples) {
                        result += `\n`;
                        result += formatMarkdownish(description, { format: this.format(colored), paragraphs: false });
                        result += `${example
                            .replace(/^/m, `  ${this.format(colored).bold(prefix)}`)
                            .replace(/\$0/g, this.binaryName)}\n`;
                    }
                }
            }
        }
        return result;
    }
    error(error, _a) {
        var _b;
        var { colored, command = (_b = error[errorCommandSymbol]) !== null && _b !== void 0 ? _b : null } = _a === void 0 ? {} : _a;
        if (!error || typeof error !== `object` || !(`stack` in error))
            error = new Error(`Execution failed with a non-error rejection (rejected value: ${JSON.stringify(error)})`);
        let result = ``;
        let name = error.name.replace(/([a-z])([A-Z])/g, `$1 $2`);
        if (name === `Error`)
            name = `Internal Error`;
        result += `${this.format(colored).error(name)}: ${error.message}\n`;
        const meta = error.clipanion;
        if (typeof meta !== `undefined`) {
            if (meta.type === `usage`) {
                result += `\n`;
                result += this.usage(command);
            }
        }
        else {
            if (error.stack) {
                result += `${error.stack.replace(/^.*\n/, ``)}\n`;
            }
        }
        return result;
    }
    format(colored) {
        var _a;
        return ((_a = colored !== null && colored !== void 0 ? colored : this.enableColors) !== null && _a !== void 0 ? _a : Cli.defaultContext.colorDepth > 1) ? richFormat : textFormat;
    }
    getUsageByRegistration(klass, opts) {
        const record = this.registrations.get(klass);
        if (typeof record === `undefined`)
            throw new Error(`Assertion failed: Unregistered command`);
        return this.getUsageByIndex(record.index, opts);
    }
    getUsageByIndex(n, opts) {
        return this.builder.getBuilderByIndex(n).usage(opts);
    }
}
/**
 * The default context of the CLI.
 *
 * Contains the stdio of the current `process`.
 */
Cli.defaultContext = {
    env: process.env,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    colorDepth: getDefaultColorDepth(),
};
function noopCaptureActivator(fn) {
    return fn();
}

export { Cli, run, runExit };
