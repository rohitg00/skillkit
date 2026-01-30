export type ErrorMeta = {
    type: `none`;
} | {
    type: `usage`;
};
/**
 * An error with metadata telling clipanion how to print it
 *
 * Errors with this metadata property will have their name and message printed, but not the
 * stacktrace.
 *
 * This should be used for errors where the message is the part that's important but the stacktrace is useless.
 * Some examples of where this might be useful are:
 *
 * - Invalid input by the user (see `UsageError`)
 * - A HTTP connection fails, the user is shown "Failed To Fetch Data: Could not connect to server example.com" without stacktrace
 * - A command in which the user enters credentials doesn't want to show a stacktract when the user enters invalid credentials
 * - ...
 */
export interface ErrorWithMeta extends Error {
    /**
     * Metadata detailing how clipanion should print this error
     */
    readonly clipanion: ErrorMeta;
}
/**
 * A generic usage error with the name `UsageError`.
 *
 * It should be used over `Error` only when it's the user's fault.
 */
export declare class UsageError extends Error {
    clipanion: ErrorMeta;
    constructor(message: string);
}
export declare class UnknownSyntaxError extends Error {
    readonly input: Array<string>;
    readonly candidates: Array<{
        usage: string;
        reason: string | null;
    }>;
    clipanion: ErrorMeta;
    constructor(input: Array<string>, candidates: Array<{
        usage: string;
        reason: string | null;
    }>);
}
export declare class AmbiguousSyntaxError extends Error {
    readonly input: Array<string>;
    readonly usages: Array<string>;
    clipanion: ErrorMeta;
    constructor(input: Array<string>, usages: Array<string>);
}
