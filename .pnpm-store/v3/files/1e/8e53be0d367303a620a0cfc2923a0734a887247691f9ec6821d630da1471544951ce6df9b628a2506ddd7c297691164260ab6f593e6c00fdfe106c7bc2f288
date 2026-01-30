import { V as VitestRunMode, U as UserConfig, h as VitestOptions, i as Vitest, R as ResolvedConfig, P as ProvidedContext, j as WorkspaceProject, e as RuntimeRPC, T as TestSequencer, k as WorkspaceSpec } from './reporters-w_64AS5f.js';
export { p as BrowserProvider, o as BrowserProviderInitializationOptions, q as BrowserProviderOptions, r as BrowserScript, l as ProcessPool, n as TestSequencerConstructor, m as VitestPackageInstaller } from './reporters-w_64AS5f.js';
import { UserConfig as UserConfig$1, Plugin } from 'vite';
import { Writable } from 'node:stream';
import '@vitest/runner';
import 'vite-node';
import '@vitest/snapshot';
import '@vitest/expect';
import '@vitest/runner/utils';
import '@vitest/utils';
import 'tinybench';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';
import 'chai';

declare function createVitest(mode: VitestRunMode, options: UserConfig, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

declare function VitestPlugin(options?: UserConfig, ctx?: Vitest): Promise<Plugin[]>;

interface CliOptions extends UserConfig {
    /**
     * Override the watch mode
     */
    run?: boolean;
    /**
     * Retry the test suite if it crashes due to a segfault (default: true)
     */
    segfaultRetry?: number;
    /**
     * Removes colors from the console output
     */
    color?: boolean;
}
/**
 * Start Vitest programmatically
 *
 * Returns a Vitest instance if initialized successfully.
 */
declare function startVitest(mode: VitestRunMode, cliFilters?: string[], options?: CliOptions, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest | undefined>;

interface CLIOptions {
    allowUnknownOptions?: boolean;
}
declare function parseCLI(argv: string | string[], config?: CLIOptions): {
    filter: string[];
    options: CliOptions;
};

declare function registerConsoleShortcuts(ctx: Vitest, stdin: NodeJS.ReadStream | undefined, stdout: NodeJS.WriteStream | Writable): () => void;

interface GlobalSetupContext {
    config: ResolvedConfig;
    provide: <T extends keyof ProvidedContext>(key: T, value: ProvidedContext[T]) => void;
}

declare function createMethodsRPC(project: WorkspaceProject): RuntimeRPC;

declare class BaseSequencer implements TestSequencer {
    protected ctx: Vitest;
    constructor(ctx: Vitest);
    shard(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
    sort(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
}

export { BaseSequencer, type GlobalSetupContext, TestSequencer, Vitest, VitestPlugin, WorkspaceProject, WorkspaceSpec, createMethodsRPC, createVitest, parseCLI, registerConsoleShortcuts, startVitest };
