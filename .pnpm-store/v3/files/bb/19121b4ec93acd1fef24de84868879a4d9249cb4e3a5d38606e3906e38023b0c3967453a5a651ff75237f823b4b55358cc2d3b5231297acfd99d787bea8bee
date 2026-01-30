'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var advanced_Command = require('./Command.js');

class HelpCommand extends advanced_Command.Command {
    static from(state, contexts) {
        const command = new HelpCommand(contexts);
        command.path = state.path;
        for (const opt of state.options) {
            switch (opt.name) {
                case `-c`:
                    {
                        command.commands.push(Number(opt.value));
                    }
                    break;
                case `-i`:
                    {
                        command.index = Number(opt.value);
                    }
                    break;
            }
        }
        return command;
    }
    constructor(contexts) {
        super();
        this.contexts = contexts;
        this.commands = [];
    }
    async execute() {
        let commands = this.commands;
        if (typeof this.index !== `undefined` && this.index >= 0 && this.index < commands.length)
            commands = [commands[this.index]];
        if (commands.length === 0) {
            this.context.stdout.write(this.cli.usage());
        }
        else if (commands.length === 1) {
            this.context.stdout.write(this.cli.usage(this.contexts[commands[0]].commandClass, { detailed: true }));
        }
        else if (commands.length > 1) {
            this.context.stdout.write(`Multiple commands match your selection:\n`);
            this.context.stdout.write(`\n`);
            let index = 0;
            for (const command of this.commands)
                this.context.stdout.write(this.cli.usage(this.contexts[command].commandClass, { prefix: `${index++}. `.padStart(5) }));
            this.context.stdout.write(`\n`);
            this.context.stdout.write(`Run again with -h=<index> to see the longer details of any of those commands.\n`);
        }
    }
}

exports.HelpCommand = HelpCommand;
