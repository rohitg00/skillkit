/// <reference types="node" />
/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { CommandBuilder } from '../core';
import { ColorFormat } from '../format';
import { CommandClass, Command, Definition } from './Command';
import { CommandOption } from './options/utils';
type MakeOptional<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>;
type VoidIfEmpty<T> = keyof T extends never ? void : never;
/**
 * The base context of the CLI.
 *
 * All Contexts have to extend it.
 */
export type BaseContext = {
    /**
     * Environment variables.
     *
     * @default
     * process.env
     */
    env: Record<string, string | undefined>;
    /**
     * The input stream of the CLI.
     *
     * @default
     * process.stdin
     */
    stdin: Readable;
    /**
     * The output stream of the CLI.
     *
     * @default
     * process.stdout
     */
    stdout: Writable;
    /**
     * The error stream of the CLI.
     *
     * @default
     * process.stderr
     */
    stderr: Writable;
    /**
     * Whether colors should be enabled.
     */
    colorDepth: number;
};
export type CliContext<Context extends BaseContext> = {
    commandClass: CommandClass<Context>;
};
export type UserContextKeys<Context extends BaseContext> = Exclude<keyof Context, keyof BaseContext>;
export type UserContext<Context extends BaseContext> = Pick<Context, UserContextKeys<Context>>;
export type PartialContext<Context extends BaseContext> = UserContextKeys<Context> extends never ? Partial<Pick<Context, keyof BaseContext>> | undefined | void : Partial<Pick<Context, keyof BaseContext>> & UserContext<Context>;
export type RunContext<Context extends BaseContext = BaseContext> = Partial<Pick<Context, keyof BaseContext>> & UserContext<Context>;
export type RunCommand<Context extends BaseContext = BaseContext> = Array<CommandClass<Context>> | CommandClass<Context>;
export type RunCommandNoContext<Context extends BaseContext = BaseContext> = UserContextKeys<Context> extends never ? RunCommand<Context> : never;
export type CliOptions = Readonly<{
    /**
     * The label of the binary.
     *
     * Shown at the top of the usage information.
     */
    binaryLabel?: string;
    /**
     * The name of the binary.
     *
     * Included in the path and the examples of the definitions.
     */
    binaryName: string;
    /**
     * The version of the binary.
     *
     * Shown at the top of the usage information.
     */
    binaryVersion?: string;
    /**
     * If `true`, the Cli will hook into the process standard streams to catch
     * the output produced by console.log and redirect them into the context
     * streams. Note: stdin isn't captured at the moment.
     *
     * @default
     * false
     */
    enableCapture: boolean;
    /**
     * If `true`, the Cli will use colors in the output. If `false`, it won't.
     * If `undefined`, Clipanion will infer the correct value from the env.
     */
    enableColors?: boolean;
}>;
export type MiniCli<Context extends BaseContext> = CliOptions & {
    /**
     * Returns an Array representing the definitions of all registered commands.
     */
    definitions(): Array<Definition>;
    /**
     * Get the definition of a particular command.
     */
    definition(command: CommandClass<Context>): Definition | null;
    /**
     * Formats errors using colors.
     *
     * @param error The error to format. If `error.name` is `'Error'`, it is replaced with `'Internal Error'`.
     * @param opts.command The command whose usage will be included in the formatted error.
     */
    error(error: Error, opts?: {
        command?: Command<Context> | null;
    }): string;
    /**
     * Returns a rich color format if colors are enabled, or a plain text format otherwise.
     *
     * @param colored Forcefully enable or disable colors.
     */
    format(colored?: boolean): ColorFormat;
    /**
     * Compiles a command and its arguments using the `CommandBuilder`.
     *
     * @param input An array containing the name of the command and its arguments
     *
     * @returns The compiled `Command`, with its properties populated with the arguments.
     */
    process(input: Array<string>, context?: Partial<Context>): Command<Context>;
    /**
     * Runs a command.
     *
     * @param input An array containing the name of the command and its arguments
     * @param context Overrides the Context of the main `Cli` instance
     *
     * @returns The exit code of the command
     */
    run(input: Array<string>, context?: Partial<Context>): Promise<number>;
    /**
     * Returns the usage of a command.
     *
     * @param command The `Command` whose usage will be returned or `null` to return the usage of all commands.
     * @param opts.detailed If `true`, the usage of a command will also include its description, details, and examples. Doesn't have any effect if `command` is `null` or doesn't have a `usage` property.
     * @param opts.prefix The prefix displayed before each command. Defaults to `$`.
     */
    usage(command?: CommandClass<Context> | Command<Context> | null, opts?: {
        detailed?: boolean;
        prefix?: string;
    }): string;
};
export type MandatoryContextKeys<Context extends BaseContext> = keyof MandatoryContext<Context>;
export type MandatoryContext<Context extends BaseContext> = {
    [K in Exclude<keyof Context, keyof BaseContext> as undefined extends Context[K] ? never : K]: Context[K];
};
export type UserProvidedContext<Context extends BaseContext> = MandatoryContext<Context> & Partial<Omit<Context, MandatoryContextKeys<Context>>>;
export type MaybeProvidedContext<Context extends BaseContext> = MandatoryContextKeys<Context> extends never ? {
    context?: UserProvidedContext<Context>;
} : {
    context: UserProvidedContext<Context>;
};
export type ProcessOptions<Context extends BaseContext> = MaybeProvidedContext<Context> & {
    input: Array<string>;
    /**
     * @deprecated Experimental setting, exact behavior may change
     */
    partial?: boolean;
};
/**
 * An all-in-one helper that simultaneously instantiate a CLI and immediately
 * executes it. All parameters are optional except the command classes and
 * will be filled by sensible values for the current environment (for example
 * the argv argument will default to `process.argv`, etc).
 *
 * Just like `Cli#runExit`, this function will set the `process.exitCode` value
 * before returning.
 */
export declare function runExit<Context extends BaseContext = BaseContext>(commandClasses: RunCommandNoContext<Context>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(commandClasses: RunCommand<Context>, context: RunContext<Context>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommandNoContext<Context>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommand<Context>, context: RunContext<Context>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(commandClasses: RunCommandNoContext<Context>, argv: Array<string>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(commandClasses: RunCommand<Context>, argv: Array<string>, context: RunContext<Context>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommandNoContext<Context>, argv: Array<string>): Promise<void>;
export declare function runExit<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommand<Context>, argv: Array<string>, context: RunContext<Context>): Promise<void>;
/**
 * An all-in-one helper that simultaneously instantiate a CLI and immediately
 * executes it. All parameters are optional except the command classes and
 * will be filled by sensible values for the current environment (for example
 * the argv argument will default to `process.argv`, etc).
 *
 * Unlike `runExit`, this function won't set the `process.exitCode` value
 * before returning.
 */
export declare function run<Context extends BaseContext = BaseContext>(commandClasses: RunCommandNoContext<Context>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(commandClasses: RunCommand<Context>, context: RunContext<Context>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommandNoContext<Context>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommand<Context>, context: RunContext<Context>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(commandClasses: RunCommandNoContext<Context>, argv: Array<string>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(commandClasses: RunCommand<Context>, argv: Array<string>, context: RunContext<Context>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommandNoContext<Context>, argv: Array<string>): Promise<number>;
export declare function run<Context extends BaseContext = BaseContext>(options: Partial<CliOptions>, commandClasses: RunCommand<Context>, argv: Array<string>, context: RunContext<Context>): Promise<number>;
/**
 * @template Context The context shared by all commands. Contexts are a set of values, defined when calling the `run`/`runExit` functions from the CLI instance, that will be made available to the commands via `this.context`.
 */
export declare class Cli<Context extends BaseContext = BaseContext> implements Omit<MiniCli<Context>, `process` | `run`> {
    /**
     * The default context of the CLI.
     *
     * Contains the stdio of the current `process`.
     */
    static defaultContext: {
        env: NodeJS.ProcessEnv;
        stdin: NodeJS.ReadStream & {
            fd: 0;
        };
        stdout: NodeJS.WriteStream & {
            fd: 1;
        };
        stderr: NodeJS.WriteStream & {
            fd: 2;
        };
        colorDepth: number;
    };
    private readonly builder;
    protected readonly registrations: Map<CommandClass<Context>, {
        index: number;
        builder: CommandBuilder<CliContext<Context>>;
        specs: Map<string, CommandOption<unknown>>;
    }>;
    readonly binaryLabel?: string;
    readonly binaryName: string;
    readonly binaryVersion?: string;
    readonly enableCapture: boolean;
    readonly enableColors?: boolean;
    /**
     * Creates a new Cli and registers all commands passed as parameters.
     *
     * @param commandClasses The Commands to register
     * @returns The created `Cli` instance
     */
    static from<Context extends BaseContext = BaseContext>(commandClasses: RunCommand<Context>, options?: Partial<CliOptions>): Cli<Context>;
    constructor({ binaryLabel, binaryName: binaryNameOpt, binaryVersion, enableCapture, enableColors }?: Partial<CliOptions>);
    /**
     * Registers a command inside the CLI.
     */
    register(commandClass: CommandClass<Context>): void;
    process(opts: ProcessOptions<Context>): Command<Context>;
    process(input: Array<string>, context: VoidIfEmpty<Omit<Context, keyof BaseContext>>): Command<Context>;
    process(input: Array<string>, context: MakeOptional<Context, keyof BaseContext>): Command<Context>;
    run(input: Command<Context> | Array<string>, context: VoidIfEmpty<Omit<Context, keyof BaseContext>>): Promise<number>;
    run(input: Command<Context> | Array<string>, context: MakeOptional<Context, keyof BaseContext>): Promise<number>;
    /**
     * Runs a command and exits the current `process` with the exit code returned by the command.
     *
     * @param input An array containing the name of the command and its arguments.
     *
     * @example
     * cli.runExit(process.argv.slice(2))
     */
    runExit(input: Command<Context> | Array<string>, context: VoidIfEmpty<Omit<Context, keyof BaseContext>>): Promise<void>;
    runExit(input: Command<Context> | Array<string>, context: MakeOptional<Context, keyof BaseContext>): Promise<void>;
    definition(commandClass: CommandClass<Context>, { colored }?: {
        colored?: boolean;
    }): Definition | null;
    definitions({ colored }?: {
        colored?: boolean;
    }): Array<Definition>;
    usage(command?: CommandClass<Context> | Command<Context> | null, { colored, detailed, prefix }?: {
        colored?: boolean;
        detailed?: boolean;
        prefix?: string;
    }): string;
    error(error: Error | any, { colored, command }?: {
        colored?: boolean;
        command?: Command<Context> | null;
    }): string;
    format(colored?: boolean): ColorFormat;
    protected getUsageByRegistration(klass: CommandClass<Context>, opts?: {
        detailed?: boolean;
        inlineOptions?: boolean;
    }): {
        usage: string;
        options: {
            preferredName: string;
            nameSet: string[];
            definition: string;
            description: string;
            required: boolean;
        }[];
    };
    protected getUsageByIndex(n: number, opts?: {
        detailed?: boolean;
        inlineOptions?: boolean;
    }): {
        usage: string;
        options: {
            preferredName: string;
            nameSet: string[];
            definition: string;
            description: string;
            required: boolean;
        }[];
    };
}
export {};
