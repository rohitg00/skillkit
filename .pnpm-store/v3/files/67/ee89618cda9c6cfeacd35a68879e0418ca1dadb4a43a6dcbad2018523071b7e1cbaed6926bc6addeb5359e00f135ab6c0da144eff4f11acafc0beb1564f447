'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var advanced_Command = require('../Command.js');
var advanced_options_Proxy = require('../options/Proxy.js');

/**
 * A command that prints the clipanion tokens.
 */
class TokensCommand extends advanced_Command.Command {
    constructor() {
        super(...arguments);
        this.args = advanced_options_Proxy.Proxy();
    }
    async execute() {
        this.context.stdout.write(`${JSON.stringify(this.cli.process(this.args).tokens, null, 2)}\n`);
    }
}
TokensCommand.paths = [[`--clipanion=tokens`]];

exports.TokensCommand = TokensCommand;
