import { SpecialToken } from './constants.mjs';

/**
 * A generic usage error with the name `UsageError`.
 *
 * It should be used over `Error` only when it's the user's fault.
 */
class UsageError extends Error {
    constructor(message) {
        super(message);
        this.clipanion = { type: `usage` };
        this.name = `UsageError`;
    }
}
class UnknownSyntaxError extends Error {
    constructor(input, candidates) {
        super();
        this.input = input;
        this.candidates = candidates;
        this.clipanion = { type: `none` };
        this.name = `UnknownSyntaxError`;
        if (this.candidates.length === 0) {
            this.message = `Command not found, but we're not sure what's the alternative.`;
        }
        else if (this.candidates.every(candidate => candidate.reason !== null && candidate.reason === candidates[0].reason)) {
            const [{ reason }] = this.candidates;
            this.message = `${reason}\n\n${this.candidates.map(({ usage }) => `$ ${usage}`).join(`\n`)}`;
        }
        else if (this.candidates.length === 1) {
            const [{ usage }] = this.candidates;
            this.message = `Command not found; did you mean:\n\n$ ${usage}\n${whileRunning(input)}`;
        }
        else {
            this.message = `Command not found; did you mean one of:\n\n${this.candidates.map(({ usage }, index) => {
                return `${`${index}.`.padStart(4)} ${usage}`;
            }).join(`\n`)}\n\n${whileRunning(input)}`;
        }
    }
}
class AmbiguousSyntaxError extends Error {
    constructor(input, usages) {
        super();
        this.input = input;
        this.usages = usages;
        this.clipanion = { type: `none` };
        this.name = `AmbiguousSyntaxError`;
        this.message = `Cannot find which to pick amongst the following alternatives:\n\n${this.usages.map((usage, index) => {
            return `${`${index}.`.padStart(4)} ${usage}`;
        }).join(`\n`)}\n\n${whileRunning(input)}`;
    }
}
const whileRunning = (input) => `While running ${input.filter(token => {
    return token !== SpecialToken.EndOfInput && token !== SpecialToken.EndOfPartialInput;
}).map(token => {
    const json = JSON.stringify(token);
    if (token.match(/\s/) || token.length === 0 || json !== `"${token}"`) {
        return json;
    }
    else {
        return token;
    }
}).join(` `)}`;

export { AmbiguousSyntaxError, UnknownSyntaxError, UsageError };
