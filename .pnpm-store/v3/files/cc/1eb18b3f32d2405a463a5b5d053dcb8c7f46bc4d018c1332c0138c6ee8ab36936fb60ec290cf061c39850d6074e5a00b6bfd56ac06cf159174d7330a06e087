import { RunState } from '../core';
import { BaseContext, CliContext } from './Cli';
import { Command } from './Command';
export declare class HelpCommand<Context extends BaseContext> extends Command<Context> {
    private readonly contexts;
    private commands;
    private index?;
    static from<Context extends BaseContext>(state: RunState, contexts: Array<CliContext<Context>>): HelpCommand<Context>;
    constructor(contexts: Array<CliContext<Context>>);
    execute(): Promise<void>;
}
