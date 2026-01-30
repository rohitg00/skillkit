import * as vite from 'vite';
import { ViteDevServer, TransformResult as TransformResult$1, UserConfig as UserConfig$1, ConfigEnv, ServerOptions, DepOptimizationConfig, AliasOptions } from 'vite';
import * as _vitest_runner from '@vitest/runner';
import { File, Test as Test$1, Suite, TaskResultPack, Task, CancelReason, Custom, SequenceHooks, SequenceSetupFiles } from '@vitest/runner';
import { RawSourceMap, FetchResult, ViteNodeResolveId, ModuleCacheMap, ViteNodeServerOptions } from 'vite-node';
import { SnapshotResult, SnapshotStateOptions, SnapshotState } from '@vitest/snapshot';
import { ExpectStatic } from '@vitest/expect';
import { ChainableFunction } from '@vitest/runner/utils';
import { ParsedStack, Awaitable as Awaitable$1, Arrayable as Arrayable$1 } from '@vitest/utils';
import { TaskResult, Bench, Options as Options$1 } from 'tinybench';
import { Writable } from 'node:stream';
import { ViteNodeRunner } from 'vite-node/client';
import { SnapshotManager } from '@vitest/snapshot/manager';
import { ViteNodeServer } from 'vite-node/server';
import { MessagePort } from 'node:worker_threads';
import { Stats } from 'node:fs';
import * as chai from 'chai';

declare const Modifier: unique symbol;
declare const Hint: unique symbol;
declare const Kind: unique symbol;
type Evaluate<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type TReadonly<T extends TSchema> = T & {
    [Modifier]: 'Readonly';
};
type TOptional<T extends TSchema> = T & {
    [Modifier]: 'Optional';
};
type TReadonlyOptional<T extends TSchema> = T & {
    [Modifier]: 'ReadonlyOptional';
};
interface SchemaOptions {
    $schema?: string;
    /** Id for this schema */
    $id?: string;
    /** Title of this schema */
    title?: string;
    /** Description of this schema */
    description?: string;
    /** Default value for this schema */
    default?: any;
    /** Example values matching this schema */
    examples?: any;
    [prop: string]: any;
}
interface TKind {
    [Kind]: string;
}
interface TSchema extends SchemaOptions, TKind {
    [Modifier]?: string;
    [Hint]?: string;
    params: unknown[];
    static: unknown;
}
interface NumericOptions<N extends number | bigint> extends SchemaOptions {
    exclusiveMaximum?: N;
    exclusiveMinimum?: N;
    maximum?: N;
    minimum?: N;
    multipleOf?: N;
}
interface TBoolean extends TSchema {
    [Kind]: 'Boolean';
    static: boolean;
    type: 'boolean';
}
interface TNull extends TSchema {
    [Kind]: 'Null';
    static: null;
    type: 'null';
}
interface TNumber extends TSchema, NumericOptions<number> {
    [Kind]: 'Number';
    static: number;
    type: 'number';
}
type ReadonlyOptionalPropertyKeys<T extends TProperties> = {
    [K in keyof T]: T[K] extends TReadonlyOptional<TSchema> ? K : never;
}[keyof T];
type ReadonlyPropertyKeys<T extends TProperties> = {
    [K in keyof T]: T[K] extends TReadonly<TSchema> ? K : never;
}[keyof T];
type OptionalPropertyKeys<T extends TProperties> = {
    [K in keyof T]: T[K] extends TOptional<TSchema> ? K : never;
}[keyof T];
type RequiredPropertyKeys<T extends TProperties> = keyof Omit<T, ReadonlyOptionalPropertyKeys<T> | ReadonlyPropertyKeys<T> | OptionalPropertyKeys<T>>;
type PropertiesReducer<T extends TProperties, R extends Record<keyof any, unknown>> = Evaluate<(Readonly<Partial<Pick<R, ReadonlyOptionalPropertyKeys<T>>>> & Readonly<Pick<R, ReadonlyPropertyKeys<T>>> & Partial<Pick<R, OptionalPropertyKeys<T>>> & Required<Pick<R, RequiredPropertyKeys<T>>>)>;
type PropertiesReduce<T extends TProperties, P extends unknown[]> = PropertiesReducer<T, {
    [K in keyof T]: Static<T[K], P>;
}>;
type TProperties = Record<keyof any, TSchema>;
type TAdditionalProperties = undefined | TSchema | boolean;
interface ObjectOptions extends SchemaOptions {
    additionalProperties?: TAdditionalProperties;
    minProperties?: number;
    maxProperties?: number;
}
interface TObject<T extends TProperties = TProperties> extends TSchema, ObjectOptions {
    [Kind]: 'Object';
    static: PropertiesReduce<T, this['params']>;
    additionalProperties?: TAdditionalProperties;
    type: 'object';
    properties: T;
    required?: string[];
}
interface StringOptions<Format extends string> extends SchemaOptions {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: Format;
    contentEncoding?: '7bit' | '8bit' | 'binary' | 'quoted-printable' | 'base64';
    contentMediaType?: string;
}
interface TString<Format extends string = string> extends TSchema, StringOptions<Format> {
    [Kind]: 'String';
    static: string;
    type: 'string';
}
/** Creates a TypeScript static type from a TypeBox type */
type Static<T extends TSchema, P extends unknown[] = []> = (T & {
    params: P;
})['static'];

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


declare const RawSnapshotFormat: TObject<{
  callToJSON: TReadonlyOptional<TBoolean>;
  compareKeys: TReadonlyOptional<TNull>;
  escapeRegex: TReadonlyOptional<TBoolean>;
  escapeString: TReadonlyOptional<TBoolean>;
  highlight: TReadonlyOptional<TBoolean>;
  indent: TReadonlyOptional<TNumber>;
  maxDepth: TReadonlyOptional<TNumber>;
  maxWidth: TReadonlyOptional<TNumber>;
  min: TReadonlyOptional<TBoolean>;
  printBasicPrototype: TReadonlyOptional<TBoolean>;
  printFunctionName: TReadonlyOptional<TBoolean>;
  theme: TReadonlyOptional<
    TObject<{
      comment: TReadonlyOptional<TString<string>>;
      content: TReadonlyOptional<TString<string>>;
      prop: TReadonlyOptional<TString<string>>;
      tag: TReadonlyOptional<TString<string>>;
      value: TReadonlyOptional<TString<string>>;
    }>
  >;
}>;

declare const SnapshotFormat: TObject<{
  callToJSON: TReadonlyOptional<TBoolean>;
  compareKeys: TReadonlyOptional<TNull>;
  escapeRegex: TReadonlyOptional<TBoolean>;
  escapeString: TReadonlyOptional<TBoolean>;
  highlight: TReadonlyOptional<TBoolean>;
  indent: TReadonlyOptional<TNumber>;
  maxDepth: TReadonlyOptional<TNumber>;
  maxWidth: TReadonlyOptional<TNumber>;
  min: TReadonlyOptional<TBoolean>;
  printBasicPrototype: TReadonlyOptional<TBoolean>;
  printFunctionName: TReadonlyOptional<TBoolean>;
  theme: TReadonlyOptional<
    TObject<{
      comment: TReadonlyOptional<TString<string>>;
      content: TReadonlyOptional<TString<string>>;
      prop: TReadonlyOptional<TString<string>>;
      tag: TReadonlyOptional<TString<string>>;
      value: TReadonlyOptional<TString<string>>;
    }>
  >;
}>;

declare type SnapshotFormat = Static<typeof RawSnapshotFormat>;

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


declare type Colors = {
  comment: {
    close: string;
    open: string;
  };
  content: {
    close: string;
    open: string;
  };
  prop: {
    close: string;
    open: string;
  };
  tag: {
    close: string;
    open: string;
  };
  value: {
    close: string;
    open: string;
  };
};

declare type CompareKeys =
  | ((a: string, b: string) => number)
  | null
  | undefined;

declare type Config = {
  callToJSON: boolean;
  compareKeys: CompareKeys;
  colors: Colors;
  escapeRegex: boolean;
  escapeString: boolean;
  indent: string;
  maxDepth: number;
  maxWidth: number;
  min: boolean;
  plugins: Plugins;
  printBasicPrototype: boolean;
  printFunctionName: boolean;
  spacingInner: string;
  spacingOuter: string;
};

declare type Indent = (arg0: string) => string;

declare type NewPlugin = {
  serialize: (
    val: any,
    config: Config,
    indentation: string,
    depth: number,
    refs: Refs,
    printer: Printer,
  ) => string;
  test: Test;
};

declare type OldPlugin = {
  print: (
    val: unknown,
    print: Print,
    indent: Indent,
    options: PluginOptions,
    colors: Colors,
  ) => string;
  test: Test;
};

declare type Plugin_2 = NewPlugin | OldPlugin;


declare type PluginOptions = {
  edgeSpacing: string;
  min: boolean;
  spacing: string;
};

declare type Plugins = Array<Plugin_2>;

declare interface PrettyFormatOptions
  extends Omit<SnapshotFormat, 'compareKeys'> {
  compareKeys?: CompareKeys;
  plugins?: Plugins;
}

declare type Print = (arg0: unknown) => string;

declare type Printer = (
  val: unknown,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  hasCalledToJSON?: boolean,
) => string;

declare type Refs = Array<unknown>;

declare type Test = (arg0: any) => boolean;

/**
 * Names of clock methods that may be faked by install.
 */
type FakeMethod =
    | "setTimeout"
    | "clearTimeout"
    | "setImmediate"
    | "clearImmediate"
    | "setInterval"
    | "clearInterval"
    | "Date"
    | "nextTick"
    | "hrtime"
    | "requestAnimationFrame"
    | "cancelAnimationFrame"
    | "requestIdleCallback"
    | "cancelIdleCallback"
    | "performance"
    | "queueMicrotask";

interface FakeTimerInstallOpts {
    /**
     * Installs fake timers with the specified unix epoch (default: 0)
     */
    now?: number | Date | undefined;

    /**
     * An array with names of global methods and APIs to fake.
     * For instance, `vi.useFakeTimer({ toFake: ['setTimeout', 'performance'] })` will fake only `setTimeout()` and `performance.now()`
     * @default ['setTimeout', 'clearTimeout', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval', 'Date']
     */
    toFake?: FakeMethod[] | undefined;

    /**
     * The maximum number of timers that will be run when calling runAll()
     * @default 10000
     */
    loopLimit?: number | undefined;

    /**
     * Tells @sinonjs/fake-timers to increment mocked time automatically based on the real system time shift (e.g. the mocked time will be incremented by
     * 20ms for every 20ms change in the real system time) (default: false)
     */
    shouldAdvanceTime?: boolean | undefined;

    /**
     * Relevant only when using with shouldAdvanceTime: true. increment mocked time by advanceTimeDelta ms every advanceTimeDelta ms change
     * in the real system time (default: 20)
     */
    advanceTimeDelta?: number | undefined;

    /**
     * Tells FakeTimers to clear 'native' (i.e. not fake) timers by delegating to their respective handlers.
     * @default true
     */
    shouldClearNativeTimers?: boolean | undefined;
}

type BuiltinPool = 'browser' | 'threads' | 'forks' | 'vmThreads' | 'vmForks' | 'typescript';
type Pool = BuiltinPool | (string & {});
interface PoolOptions extends Record<string, unknown> {
    /**
     * Run tests in `node:worker_threads`.
     *
     * Test isolation (when enabled) is done by spawning a new thread for each test file.
     *
     * This pool is used by default.
     */
    threads?: ThreadsOptions & WorkerContextOptions;
    /**
     * Run tests in `node:child_process` using [`fork()`](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options)
     *
     * Test isolation (when enabled) is done by spawning a new child process for each test file.
     */
    forks?: ForksOptions & WorkerContextOptions;
    /**
     * Run tests in isolated `node:vm`.
     * Test files are run parallel using `node:worker_threads`.
     *
     * This makes tests run faster, but VM module is unstable. Your tests might leak memory.
     */
    vmThreads?: ThreadsOptions & VmOptions;
    /**
     * Run tests in isolated `node:vm`.
     *
     * Test files are run parallel using `node:child_process` [`fork()`](https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options)
     *
     * This makes tests run faster, but VM module is unstable. Your tests might leak memory.
     */
    vmForks?: ForksOptions & VmOptions;
}
interface ThreadsOptions {
    /** Minimum amount of threads to use */
    minThreads?: number;
    /** Maximum amount of threads to use */
    maxThreads?: number;
    /**
     * Run tests inside a single thread.
     *
     * @default false
     */
    singleThread?: boolean;
    /**
     * Use Atomics to synchronize threads
     *
     * This can improve performance in some cases, but might cause segfault in older Node versions.
     *
     * @default false
     */
    useAtomics?: boolean;
}
interface ForksOptions {
    /** Minimum amount of child processes to use */
    minForks?: number;
    /** Maximum amount of child processes to use */
    maxForks?: number;
    /**
     * Run tests inside a single fork.
     *
     * @default false
     */
    singleFork?: boolean;
}
interface WorkerContextOptions {
    /**
     * Isolate test environment by recycling `worker_threads` or `child_process` after each test
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Pass additional arguments to `node` process when spawning `worker_threads` or `child_process`.
     *
     * See [Command-line API | Node.js](https://nodejs.org/docs/latest/api/cli.html) for more information.
     *
     * Set to `process.execArgv` to pass all arguments of the current process.
     *
     * Be careful when using, it as some options may crash worker, e.g. --prof, --title. See https://github.com/nodejs/node/issues/41103
     *
     * @default [] // no execution arguments are passed
     */
    execArgv?: string[];
}
interface VmOptions {
    /**
     * Specifies the memory limit for `worker_thread` or `child_process` before they are recycled.
     * If you see memory leaks, try to tinker this value.
     */
    memoryLimit?: string | number;
    /** Isolation is always enabled */
    isolate?: true;
    /**
     * Pass additional arguments to `node` process when spawning `worker_threads` or `child_process`.
     *
     * See [Command-line API | Node.js](https://nodejs.org/docs/latest/api/cli.html) for more information.
     *
     * Set to `process.execArgv` to pass all arguments of the current process.
     *
     * Be careful when using, it as some options may crash worker, e.g. --prof, --title. See https://github.com/nodejs/node/issues/41103
     *
     * @default [] // no execution arguments are passed
     */
    execArgv?: string[];
}

interface Options {
	/**
	Show the cursor. This can be useful when a CLI accepts input from a user.

	@example
	```
	import {createLogUpdate} from 'log-update';

	// Write output but don't hide the cursor
	const log = createLogUpdate(process.stdout, {
		showCursor: true
	});
	```
	*/
	readonly showCursor?: boolean;
}

type LogUpdateMethods = {
	/**
	Clear the logged output.
	*/
	clear(): void;

	/**
	Persist the logged output. Useful if you want to start a new log session below the current one.
	*/
	done(): void;
};

/**
Log to `stdout` by overwriting the previous output in the terminal.

@param text - The text to log to `stdout`.

@example
```
import logUpdate from 'log-update';

const frames = ['-', '\\', '|', '/'];
let index = 0;

setInterval(() => {
	const frame = frames[index = ++index % frames.length];

	logUpdate(
`
		♥♥
${frame} unicorns ${frame}
		♥♥
`
	);
}, 80);
```
*/
declare const logUpdate: ((...text: string[]) => void) & LogUpdateMethods;


/**
Get a `logUpdate` method that logs to the specified stream.

@param stream - The stream to log to.

@example
```
import {createLogUpdate} from 'log-update';

// Write output but don't hide the cursor
const log = createLogUpdate(process.stdout);
```
*/
declare function createLogUpdate(
	stream: NodeJS.WritableStream,
	options?: Options
): typeof logUpdate;

interface ParsedFile extends File {
    start: number;
    end: number;
}
interface ParsedTest extends Test$1 {
    start: number;
    end: number;
}
interface ParsedSuite extends Suite {
    start: number;
    end: number;
}
interface LocalCallDefinition {
    start: number;
    end: number;
    name: string;
    type: 'suite' | 'test';
    mode: 'run' | 'skip' | 'only' | 'todo';
    task: ParsedSuite | ParsedFile | ParsedTest;
}
interface FileInformation {
    file: File;
    filepath: string;
    parsed: string;
    map: RawSourceMap | null;
    definitions: LocalCallDefinition[];
}

declare class TypeCheckError extends Error {
    message: string;
    stacks: ParsedStack[];
    name: string;
    constructor(message: string, stacks: ParsedStack[]);
}
interface TypecheckResults {
    files: File[];
    sourceErrors: TypeCheckError[];
    time: number;
}
type Callback<Args extends Array<any> = []> = (...args: Args) => Awaitable<void>;
declare class Typechecker {
    protected ctx: WorkspaceProject;
    private _onParseStart?;
    private _onParseEnd?;
    private _onWatcherRerun?;
    private _result;
    private _startTime;
    private _output;
    private _tests;
    private tempConfigPath?;
    private allowJs?;
    private process?;
    protected files: string[];
    constructor(ctx: WorkspaceProject);
    setFiles(files: string[]): void;
    onParseStart(fn: Callback): void;
    onParseEnd(fn: Callback<[TypecheckResults]>): void;
    onWatcherRerun(fn: Callback): void;
    protected collectFileTests(filepath: string): Promise<FileInformation | null>;
    protected getFiles(): string[];
    collectTests(): Promise<Record<string, FileInformation>>;
    protected markPassed(file: File): void;
    protected prepareResults(output: string): Promise<{
        files: File[];
        sourceErrors: TypeCheckError[];
        time: number;
    }>;
    protected parseTscLikeOutput(output: string): Promise<Map<string, {
        error: TypeCheckError;
        originalError: TscErrorInfo;
    }[]>>;
    clear(): Promise<void>;
    stop(): Promise<void>;
    protected ensurePackageInstalled(ctx: Vitest, checker: string): Promise<void>;
    prepare(): Promise<void>;
    getExitCode(): number | false;
    getOutput(): string;
    start(): Promise<void>;
    getResult(): TypecheckResults;
    getTestFiles(): File[];
    getTestPacks(): TaskResultPack[];
}

interface ErrorOptions {
    type?: string;
    fullStack?: boolean;
    project?: WorkspaceProject;
}
declare class Logger {
    ctx: Vitest;
    outputStream: NodeJS.WriteStream | Writable;
    errorStream: NodeJS.WriteStream | Writable;
    logUpdate: ReturnType<typeof createLogUpdate>;
    private _clearScreenPending;
    private _highlights;
    console: Console;
    constructor(ctx: Vitest, outputStream?: NodeJS.WriteStream | Writable, errorStream?: NodeJS.WriteStream | Writable);
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    clearFullScreen(message: string): void;
    clearScreen(message: string, force?: boolean): void;
    private _clearScreen;
    printError(err: unknown, options?: ErrorOptions): Promise<void>;
    clearHighlightCache(filename?: string): void;
    highlight(filename: string, source: string): string;
    printNoTestFound(filters?: string[]): void;
    printBanner(): void;
    printUnhandledErrors(errors: unknown[]): Promise<void>;
    printSourceTypeErrors(errors: TypeCheckError[]): Promise<void>;
}

interface BrowserProviderInitializationOptions {
    browser: string;
    options?: BrowserProviderOptions;
}
interface BrowserProvider {
    name: string;
    getSupportedBrowsers: () => readonly string[];
    openPage: (url: string) => Awaitable$1<void>;
    close: () => Awaitable$1<void>;
    initialize(ctx: WorkspaceProject, options: BrowserProviderInitializationOptions): Awaitable$1<void>;
}
interface BrowserProviderOptions {
}
interface BrowserConfigOptions {
    /**
     * if running tests in the browser should be the default
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * Name of the browser
     */
    name: string;
    /**
     * Browser provider
     *
     * @default 'webdriverio'
     */
    provider?: 'webdriverio' | 'playwright' | 'none' | (string & {});
    /**
     * Options that are passed down to a browser provider.
     * To support type hinting, add one of the types to your tsconfig.json "compilerOptions.types" field:
     *
     * - for webdriverio: `@vitest/browser/providers/webdriverio`
     * - for playwright: `@vitest/browser/providers/playwright`
     *
     * @example
     * { playwright: { launch: { devtools: true } }
     */
    providerOptions?: BrowserProviderOptions;
    /**
     * enable headless mode
     *
     * @default process.env.CI
     */
    headless?: boolean;
    /**
     * Serve API options.
     *
     * The default port is 63315.
     */
    api?: ApiConfig | number;
    /**
     * Update ESM imports so they can be spied/stubbed with vi.spyOn.
     * Enabled by default when running in browser.
     *
     * @default false
     * @experimental
     */
    slowHijackESM?: boolean;
    /**
     * Isolate test environment after each test
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Run test files in parallel. Fallbacks to `test.fileParallelism`.
     *
     * @default test.fileParallelism
     */
    fileParallelism?: boolean;
    /**
     * Scripts injected into the tester iframe.
     */
    testerScripts?: BrowserScript[];
    /**
     * Scripts injected into the main window.
     */
    indexScripts?: BrowserScript[];
}
interface BrowserScript {
    /**
     * If "content" is provided and type is "module", this will be its identifier.
     *
     * If you are using TypeScript, you can add `.ts` extension here for example.
     * @default `injected-${index}.js`
     */
    id?: string;
    /**
     * JavaScript content to be injected. This string is processed by Vite plugins if type is "module".
     *
     * You can use `id` to give Vite a hint about the file extension.
     */
    content?: string;
    /**
     * Path to the script. This value is resolved by Vite so it can be a node module or a file path.
     */
    src?: string;
    /**
     * If the script should be loaded asynchronously.
     */
    async?: boolean;
    /**
     * Script type.
     * @default 'module'
     */
    type?: string;
}
interface ResolvedBrowserOptions extends BrowserConfigOptions {
    enabled: boolean;
    headless: boolean;
    isolate: boolean;
    api: ApiConfig;
}

interface InitializeProjectOptions extends UserWorkspaceConfig {
    workspaceConfigPath: string;
    extends?: string;
}
declare class WorkspaceProject {
    path: string | number;
    ctx: Vitest;
    options?: InitializeProjectOptions | undefined;
    configOverride: Partial<ResolvedConfig> | undefined;
    config: ResolvedConfig;
    server: ViteDevServer;
    vitenode: ViteNodeServer;
    runner: ViteNodeRunner;
    browser?: ViteDevServer;
    typechecker?: Typechecker;
    closingPromise: Promise<unknown> | undefined;
    browserProvider: BrowserProvider | undefined;
    browserState: {
        files: string[];
        resolve: () => void;
        reject: (v: unknown) => void;
    } | undefined;
    testFilesList: string[] | null;
    readonly id: string;
    readonly tmpDir: string;
    private _globalSetups;
    private _provided;
    constructor(path: string | number, ctx: Vitest, options?: InitializeProjectOptions | undefined);
    getName(): string;
    isCore(): boolean;
    provide: <T extends never>(key: T, value: ProvidedContext[T]) => void;
    getProvidedContext(): ProvidedContext;
    initializeGlobalSetup(): Promise<void>;
    teardownGlobalSetup(): Promise<void>;
    get logger(): Logger;
    getModulesByFilepath(file: string): Set<vite.ModuleNode>;
    getModuleById(id: string): vite.ModuleNode | undefined;
    getSourceMapModuleById(id: string): TransformResult$1['map'] | undefined;
    getBrowserSourceMapModuleById(id: string): TransformResult$1['map'] | undefined;
    get reporters(): Reporter[];
    globTestFiles(filters?: string[]): Promise<string[]>;
    globAllTestFiles(include: string[], exclude: string[], includeSource: string[] | undefined, cwd: string): Promise<string[]>;
    isTestFile(id: string): boolean | null;
    globFiles(include: string[], exclude: string[], cwd: string): Promise<string[]>;
    isTargetFile(id: string, source?: string): Promise<boolean>;
    isInSourceTestFile(code: string): boolean;
    filterFiles(testFiles: string[], filters: string[], dir: string): string[];
    initBrowserServer(configFile: string | undefined): Promise<void>;
    static createBasicProject(ctx: Vitest): WorkspaceProject;
    static createCoreProject(ctx: Vitest): Promise<WorkspaceProject>;
    setServer(options: UserConfig, server: ViteDevServer): Promise<void>;
    isBrowserEnabled(): boolean;
    getSerializableConfig(): ResolvedConfig;
    close(): Promise<unknown>;
    private clearTmpDir;
    initBrowserProvider(): Promise<void>;
}

type WorkspaceSpec = [project: WorkspaceProject, testFile: string];
type RunWithFiles = (files: WorkspaceSpec[], invalidates?: string[]) => Awaitable$1<void>;
interface ProcessPool {
    name: string;
    runTests: RunWithFiles;
    close?: () => Awaitable$1<void>;
}

type Awaitable<T> = T | PromiseLike<T>;
type Nullable<T> = T | null | undefined;
type Arrayable<T> = T | Array<T>;
type ArgumentsType$1<T> = T extends (...args: infer U) => any ? U : never;
type MutableArray<T extends readonly any[]> = {
    -readonly [k in keyof T]: T[k];
};
interface Constructable {
    new (...args: any[]): any;
}
interface ModuleCache {
    promise?: Promise<any>;
    exports?: any;
    code?: string;
}
interface EnvironmentReturn {
    teardown: (global: any) => Awaitable<void>;
}
interface VmEnvironmentReturn {
    getVmContext: () => {
        [key: string]: any;
    };
    teardown: () => Awaitable<void>;
}
interface Environment {
    name: string;
    transformMode: 'web' | 'ssr';
    setupVM?: (options: Record<string, any>) => Awaitable<VmEnvironmentReturn>;
    setup: (global: any, options: Record<string, any>) => Awaitable<EnvironmentReturn>;
}
interface UserConsoleLog {
    content: string;
    type: 'stdout' | 'stderr';
    taskId?: string;
    time: number;
    size: number;
}
interface ModuleGraphData {
    graph: Record<string, string[]>;
    externalized: string[];
    inlined: string[];
}
type OnServerRestartHandler = (reason?: string) => Promise<void> | void;
interface ProvidedContext {
}

declare class StateManager {
    filesMap: Map<string, File[]>;
    pathsSet: Set<string>;
    idMap: Map<string, Task>;
    taskFileMap: WeakMap<Task, File>;
    errorsSet: Set<unknown>;
    processTimeoutCauses: Set<string>;
    catchError(err: unknown, type: string): void;
    clearErrors(): void;
    getUnhandledErrors(): unknown[];
    addProcessTimeoutCause(cause: string): void;
    getProcessTimeoutCauses(): string[];
    getPaths(): string[];
    getFiles(keys?: string[]): File[];
    getFilepaths(): string[];
    getFailedFilepaths(): string[];
    collectPaths(paths?: string[]): void;
    collectFiles(files?: File[]): void;
    clearFiles(_project: {
        config: {
            name: string;
        };
    }, paths?: string[]): void;
    updateId(task: Task): void;
    updateTasks(packs: TaskResultPack[]): void;
    updateUserLog(log: UserConsoleLog): void;
    getCountOfFailedTests(): number;
    cancelFiles(files: string[], root: string, projectName: string): void;
}

interface SuiteResultCache {
    failed: boolean;
    duration: number;
}
declare class ResultsCache {
    private cache;
    private workspacesKeyMap;
    private cachePath;
    private version;
    private root;
    getCachePath(): string | null;
    setConfig(root: string, config: ResolvedConfig['cache']): void;
    getResults(key: string): SuiteResultCache | undefined;
    readFromCache(): Promise<void>;
    updateResults(files: File[]): void;
    removeFromCache(filepath: string): void;
    writeToCache(): Promise<void>;
}

type FileStatsCache = Pick<Stats, 'size'>;
declare class FilesStatsCache {
    cache: Map<string, FileStatsCache>;
    getStats(key: string): FileStatsCache | undefined;
    populateStats(root: string, specs: WorkspaceSpec[]): Promise<void>;
    updateStats(fsPath: string, key: string): Promise<void>;
    removeStats(fsPath: string): void;
}

declare class VitestCache {
    results: ResultsCache;
    stats: FilesStatsCache;
    getFileTestResults(key: string): SuiteResultCache | undefined;
    getFileStats(key: string): {
        size: number;
    } | undefined;
    static resolveCacheDir(root: string, dir?: string, projectName?: string): string;
}

declare class VitestPackageInstaller {
    ensureInstalled(dependency: string, root: string): Promise<boolean>;
}

interface VitestOptions {
    packageInstaller?: VitestPackageInstaller;
    stdin?: NodeJS.ReadStream;
    stdout?: NodeJS.WriteStream | Writable;
    stderr?: NodeJS.WriteStream | Writable;
}
declare class Vitest {
    readonly mode: VitestRunMode;
    config: ResolvedConfig;
    configOverride: Partial<ResolvedConfig>;
    server: ViteDevServer;
    state: StateManager;
    snapshot: SnapshotManager;
    cache: VitestCache;
    reporters: Reporter[];
    coverageProvider: CoverageProvider | null | undefined;
    logger: Logger;
    pool: ProcessPool | undefined;
    vitenode: ViteNodeServer;
    invalidates: Set<string>;
    changedTests: Set<string>;
    watchedTests: Set<string>;
    filenamePattern?: string;
    runningPromise?: Promise<void>;
    closingPromise?: Promise<void>;
    isCancelling: boolean;
    isFirstRun: boolean;
    restartsCount: number;
    runner: ViteNodeRunner;
    packageInstaller: VitestPackageInstaller;
    private coreWorkspaceProject;
    private resolvedProjects;
    projects: WorkspaceProject[];
    private projectsTestFiles;
    distPath: string;
    constructor(mode: VitestRunMode, options?: VitestOptions);
    private _onRestartListeners;
    private _onClose;
    private _onSetServer;
    private _onCancelListeners;
    setServer(options: UserConfig, server: ViteDevServer, cliOptions: UserConfig): Promise<void>;
    private createCoreProject;
    getCoreWorkspaceProject(): WorkspaceProject;
    getProjectByTaskId(taskId: string): WorkspaceProject;
    private getWorkspaceConfigPath;
    private resolveWorkspace;
    private initCoverageProvider;
    private initBrowserProviders;
    start(filters?: string[]): Promise<void>;
    init(): Promise<void>;
    private getTestDependencies;
    filterTestsBySource(specs: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
    getProjectsByTestFile(file: string): WorkspaceSpec[];
    initializeGlobalSetup(paths: WorkspaceSpec[]): Promise<void>;
    private initializeDistPath;
    runFiles(paths: WorkspaceSpec[], allTestsRun: boolean): Promise<void>;
    cancelCurrentRun(reason: CancelReason): Promise<void>;
    rerunFiles(files?: string[], trigger?: string): Promise<void>;
    changeProjectName(pattern: string): Promise<void>;
    changeNamePattern(pattern: string, files?: string[], trigger?: string): Promise<void>;
    changeFilenamePattern(pattern: string, files?: string[]): Promise<void>;
    rerunFailed(): Promise<void>;
    updateSnapshot(files?: string[]): Promise<void>;
    private _rerunTimer;
    private scheduleRerun;
    getModuleProjects(filepath: string): WorkspaceProject[];
    /**
     * Watch only the specified tests. If no tests are provided, all tests will be watched.
     */
    watchTests(tests: string[]): void;
    private unregisterWatcher;
    private registerWatcher;
    /**
     * @returns A value indicating whether rerun is needed (changedTests was mutated)
     */
    private handleFileChanged;
    private reportCoverage;
    close(): Promise<void>;
    /**
     * Close the thread pool and exit the process
     */
    exit(force?: boolean): Promise<void>;
    report<T extends keyof Reporter>(name: T, ...args: ArgumentsType$1<Reporter[T]>): Promise<void>;
    getTestFilepaths(): Promise<string[]>;
    globTestFiles(filters?: string[]): Promise<WorkspaceSpec[]>;
    shouldKeepServer(): boolean;
    onServerRestart(fn: OnServerRestartHandler): void;
    onAfterSetServer(fn: OnServerRestartHandler): void;
    onCancel(fn: (reason: CancelReason) => void): void;
    onClose(fn: () => void): void;
}

interface TestSequencer {
    /**
     * Slicing tests into shards. Will be run before `sort`.
     * Only run, if `shard` is defined.
     */
    shard: (files: WorkspaceSpec[]) => Awaitable<WorkspaceSpec[]>;
    sort: (files: WorkspaceSpec[]) => Awaitable<WorkspaceSpec[]>;
}
interface TestSequencerConstructor {
    new (ctx: Vitest): TestSequencer;
}

declare abstract class BaseReporter implements Reporter {
    start: number;
    end: number;
    watchFilters?: string[];
    isTTY: boolean;
    ctx: Vitest;
    private _filesInWatchMode;
    private _lastRunTimeout;
    private _lastRunTimer;
    private _lastRunCount;
    private _timeStart;
    private _offUnhandledRejection?;
    constructor();
    get mode(): VitestRunMode;
    onInit(ctx: Vitest): void;
    relative(path: string): string;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onWatcherStart(files?: File[], errors?: unknown[]): Promise<void>;
    private resetLastRunLog;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
    shouldLog(log: UserConsoleLog): boolean;
    onServerRestart(reason?: string): void;
    reportSummary(files: File[], errors: unknown[]): Promise<void>;
    reportTestSummary(files: File[], errors: unknown[]): Promise<void>;
    private printErrorsSummary;
    reportBenchmarkSummary(files: File[]): Promise<void>;
    private printTaskErrors;
    registerUnhandledRejection(): void;
}

declare class BasicReporter extends BaseReporter {
    isTTY: boolean;
    reportSummary(files: File[], errors: unknown[]): Promise<void>;
}

interface ListRendererOptions {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
    slowTestThreshold: number;
    mode: VitestRunMode;
}
declare function createListRenderer(_tasks: Task[], options: ListRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class DefaultReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    rendererOptions: ListRendererOptions;
    private renderSucceedDefault?;
    onPathsCollected(paths?: string[]): void;
    onTestRemoved(trigger?: string): Promise<void>;
    onCollected(): void;
    onFinished(files?: _vitest_runner.File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(files?: _vitest_runner.File[], errors?: unknown[]): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

interface DotRendererOptions {
    logger: Logger;
}
declare function createDotRenderer(_tasks: Task[], options: DotRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class DotReporter extends BaseReporter {
    renderer?: ReturnType<typeof createDotRenderer>;
    onCollected(): void;
    onFinished(files?: _vitest_runner.File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

type Status = 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'disabled';
type Milliseconds = number;
interface Callsite {
    line: number;
    column: number;
}
interface JsonAssertionResult {
    ancestorTitles: Array<string>;
    fullName: string;
    status: Status;
    title: string;
    duration?: Milliseconds | null;
    failureMessages: Array<string>;
    location?: Callsite | null;
}
interface JsonTestResult {
    message: string;
    name: string;
    status: 'failed' | 'passed';
    startTime: number;
    endTime: number;
    assertionResults: Array<JsonAssertionResult>;
}
interface JsonTestResults {
    numFailedTests: number;
    numFailedTestSuites: number;
    numPassedTests: number;
    numPassedTestSuites: number;
    numPendingTests: number;
    numPendingTestSuites: number;
    numTodoTests: number;
    numTotalTests: number;
    numTotalTestSuites: number;
    startTime: number;
    success: boolean;
    testResults: Array<JsonTestResult>;
}
interface JsonOptions$1 {
    outputFile?: string;
}
declare class JsonReporter implements Reporter {
    start: number;
    ctx: Vitest;
    options: JsonOptions$1;
    constructor(options: JsonOptions$1);
    onInit(ctx: Vitest): void;
    protected logTasks(files: File[]): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    /**
     * Writes the report to an output file if specified in the config,
     * or logs it to the console otherwise.
     * @param report
     */
    writeReport(report: string): Promise<void>;
    protected getFailureLocation(test: Task): Promise<Callsite | undefined>;
}

declare class VerboseReporter extends DefaultReporter {
    constructor();
    onTaskUpdate(packs: TaskResultPack[]): void;
}

interface Reporter {
    onInit?: (ctx: Vitest) => void;
    onPathsCollected?: (paths?: string[]) => Awaitable<void>;
    onCollected?: (files?: File[]) => Awaitable<void>;
    onFinished?: (files?: File[], errors?: unknown[]) => Awaitable<void>;
    onTaskUpdate?: (packs: TaskResultPack[]) => Awaitable<void>;
    onTestRemoved?: (trigger?: string) => Awaitable<void>;
    onWatcherStart?: (files?: File[], errors?: unknown[]) => Awaitable<void>;
    onWatcherRerun?: (files: string[], trigger?: string) => Awaitable<void>;
    onServerRestart?: (reason?: string) => Awaitable<void>;
    onUserConsoleLog?: (log: UserConsoleLog) => Awaitable<void>;
    onProcessTimeout?: () => Awaitable<void>;
}

declare class TapReporter implements Reporter {
    protected ctx: Vitest;
    private logger;
    onInit(ctx: Vitest): void;
    static getComment(task: Task): string;
    private logErrorDetails;
    protected logTasks(tasks: Task[]): void;
    onFinished(files?: _vitest_runner.File[]): Promise<void>;
}

interface JUnitOptions {
    outputFile?: string;
    classname?: string;
    suiteName?: string;
    /**
     * Write <system-out> and <system-err> for console output
     * @default true
     */
    includeConsoleOutput?: boolean;
    /**
     * Add <testcase file="..."> attribute (validated on CIRCLE CI and GitLab CI)
     * @default false
     */
    addFileAttribute?: boolean;
}
declare class JUnitReporter implements Reporter {
    private ctx;
    private reportFile?;
    private baseLog;
    private logger;
    private _timeStart;
    private fileFd?;
    private options;
    constructor(options: JUnitOptions);
    onInit(ctx: Vitest): Promise<void>;
    writeElement(name: string, attrs: Record<string, any>, children: () => Promise<void>): Promise<void>;
    writeLogs(task: Task, type: 'err' | 'out'): Promise<void>;
    writeTasks(tasks: Task[], filename: string): Promise<void>;
    onFinished(files?: _vitest_runner.File[]): Promise<void>;
}

declare class TapFlatReporter extends TapReporter {
    onInit(ctx: Vitest): void;
    onFinished(files?: _vitest_runner.File[]): Promise<void>;
}

declare class HangingProcessReporter implements Reporter {
    whyRunning: (() => void) | undefined;
    onInit(): void;
    onProcessTimeout(): void;
}

declare class GithubActionsReporter implements Reporter {
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
}

interface TableRendererOptions {
    renderSucceed?: boolean;
    logger: Logger;
    showHeap: boolean;
    slowTestThreshold: number;
    compare?: FlatBenchmarkReport;
}
declare function createTableRenderer(_tasks: Task[], options: TableRendererOptions): {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class TableReporter extends BaseReporter {
    renderer?: ReturnType<typeof createTableRenderer>;
    rendererOptions: TableRendererOptions;
    onTestRemoved(trigger?: string): Promise<void>;
    onCollected(): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onFinished(files?: File[], errors?: unknown[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}
interface FlatBenchmarkReport {
    [id: string]: FormattedBenchmarkResult;
}
type FormattedBenchmarkResult = Omit<BenchmarkResult, 'samples'> & {
    id: string;
    sampleCount: number;
};

declare const BenchmarkReportsMap: {
    default: typeof TableReporter;
    verbose: typeof VerboseReporter;
};
type BenchmarkBuiltinReporters = keyof typeof BenchmarkReportsMap;

declare const ReportersMap: {
    default: typeof DefaultReporter;
    basic: typeof BasicReporter;
    verbose: typeof VerboseReporter;
    dot: typeof DotReporter;
    json: typeof JsonReporter;
    tap: typeof TapReporter;
    'tap-flat': typeof TapFlatReporter;
    junit: typeof JUnitReporter;
    'hanging-process': typeof HangingProcessReporter;
    'github-actions': typeof GithubActionsReporter;
};
type BuiltinReporters = keyof typeof ReportersMap;
interface BuiltinReporterOptions {
    'default': never;
    'basic': never;
    'verbose': never;
    'dot': never;
    'json': JsonOptions$1;
    'tap': never;
    'tap-flat': never;
    'junit': JUnitOptions;
    'hanging-process': never;
    'html': {
        outputFile?: string;
    };
}

type ChaiConfig = Omit<Partial<typeof chai.config>, 'useProxy' | 'proxyExcludedKeys'>;

interface Node {
    isRoot(): boolean;
    visit(visitor: Visitor, state: any): void;
}

interface Visitor<N extends Node = Node> {
    onStart(root: N, state: any): void;
    onSummary(root: N, state: any): void;
    onDetail(root: N, state: any): void;
    onSummaryEnd(root: N, state: any): void;
    onEnd(root: N, state: any): void;
}

interface FileOptions {
    file: string;
}

interface ProjectOptions {
    projectRoot: string;
}

interface ReportOptions {
    clover: CloverOptions;
    cobertura: CoberturaOptions;
    "html-spa": HtmlSpaOptions;
    html: HtmlOptions;
    json: JsonOptions;
    "json-summary": JsonSummaryOptions;
    lcov: LcovOptions;
    lcovonly: LcovOnlyOptions;
    none: never;
    teamcity: TeamcityOptions;
    text: TextOptions;
    "text-lcov": TextLcovOptions;
    "text-summary": TextSummaryOptions;
}

interface CloverOptions extends FileOptions, ProjectOptions {}

interface CoberturaOptions extends FileOptions, ProjectOptions {}

interface HtmlSpaOptions extends HtmlOptions {
    metricsToShow: Array<"lines" | "branches" | "functions" | "statements">;
}
interface HtmlOptions {
    verbose: boolean;
    skipEmpty: boolean;
    subdir: string;
    linkMapper: LinkMapper;
}

type JsonOptions = FileOptions;
type JsonSummaryOptions = FileOptions;

interface LcovOptions extends FileOptions, ProjectOptions {}
interface LcovOnlyOptions extends FileOptions, ProjectOptions {}

interface TeamcityOptions extends FileOptions {
    blockName: string;
}

interface TextOptions extends FileOptions {
    maxCols: number;
    skipEmpty: boolean;
    skipFull: boolean;
}
type TextLcovOptions = ProjectOptions;
type TextSummaryOptions = FileOptions;

interface LinkMapper {
    getPath(node: string | Node): string;
    relativePath(source: string | Node, target: string | Node): string;
    assetPath(node: Node, name: string): string;
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never;
type ReturnType$1<T> = T extends (...args: any) => infer R ? R : never;
type PromisifyFn<T> = ReturnType$1<T> extends Promise<any> ? T : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType$1<T>>>;
type BirpcResolver = (name: string, resolved: (...args: unknown[]) => unknown) => ((...args: unknown[]) => unknown) | undefined;
interface ChannelOptions {
    /**
     * Function to post raw message
     */
    post: (data: any, ...extras: any[]) => any | Promise<any>;
    /**
     * Listener to receive raw message
     */
    on: (fn: (data: any, ...extras: any[]) => void) => any | Promise<any>;
    /**
     * Custom function to serialize data
     *
     * by default it passes the data as-is
     */
    serialize?: (data: any) => any;
    /**
     * Custom function to deserialize data
     *
     * by default it passes the data as-is
     */
    deserialize?: (data: any) => any;
}
interface EventOptions<Remote> {
    /**
     * Names of remote functions that do not need response.
     */
    eventNames?: (keyof Remote)[];
    /**
     * Maximum timeout for waiting for response, in milliseconds.
     *
     * @default 60_000
     */
    timeout?: number;
    /**
     * Custom resolver to resolve function to be called
     *
     * For advanced use cases only
     */
    resolver?: BirpcResolver;
    /**
     * Custom error handler
     */
    onError?: (error: Error, functionName: string, args: any[]) => boolean | void;
    /**
     * Custom error handler for timeouts
     */
    onTimeoutError?: (functionName: string, args: any[]) => boolean | void;
}
type BirpcOptions<Remote> = EventOptions<Remote> & ChannelOptions;
type BirpcFn<T> = PromisifyFn<T> & {
    /**
     * Send event without asking for response
     */
    asEvent(...args: ArgumentsType<T>): void;
};
type BirpcReturn<RemoteFunctions, LocalFunctions = Record<string, never>> = {
    [K in keyof RemoteFunctions]: BirpcFn<RemoteFunctions[K]>;
} & {
    $functions: LocalFunctions;
};

type MockFactoryWithHelper = (importOriginal: <T = unknown>() => Promise<T>) => any;
type MockFactory = () => any;
type MockMap = Map<string, Record<string, string | null | MockFactory>>;
interface PendingSuiteMock {
    id: string;
    importer: string;
    type: 'mock' | 'unmock';
    throwIfCached: boolean;
    factory?: MockFactory;
}

type TransformMode = 'web' | 'ssr';
interface RuntimeRPC {
    fetch: (id: string, environment: TransformMode) => Promise<{
        externalize?: string;
        id?: string;
    }>;
    transform: (id: string, environment: TransformMode) => Promise<FetchResult>;
    resolveId: (id: string, importer: string | undefined, environment: TransformMode) => Promise<ViteNodeResolveId | null>;
    getSourceMap: (id: string, force?: boolean) => Promise<RawSourceMap | undefined>;
    onFinished: (files: File[], errors?: unknown[]) => void;
    onPathsCollected: (paths: string[]) => void;
    onUserConsoleLog: (log: UserConsoleLog) => void;
    onUnhandledError: (err: unknown, type: string) => void;
    onCollected: (files: File[]) => Promise<void>;
    onAfterSuiteRun: (meta: AfterSuiteRunMeta) => void;
    onTaskUpdate: (pack: TaskResultPack[]) => Promise<void>;
    onCancel: (reason: CancelReason) => void;
    getCountOfFailedTests: () => number;
    snapshotSaved: (snapshot: SnapshotResult) => void;
    resolveSnapshotPath: (testPath: string) => string;
}
interface RunnerRPC {
    onCancel: (reason: CancelReason) => void;
}
interface ContextTestEnvironment {
    name: VitestEnvironment;
    transformMode?: TransformMode;
    options: EnvironmentOptions | null;
}
interface ResolvedTestEnvironment {
    environment: Environment;
    options: EnvironmentOptions | null;
}
interface ContextRPC {
    pool: Pool;
    worker: string;
    workerId: number;
    config: ResolvedConfig;
    projectName: string;
    files: string[];
    environment: ContextTestEnvironment;
    providedContext: Record<string, any>;
    invalidates?: string[];
}

interface WorkerContext extends ContextRPC {
    port: MessagePort;
}
type ResolveIdFunction = (id: string, importer?: string) => Promise<ViteNodeResolveId | null>;
interface AfterSuiteRunMeta {
    coverage?: unknown;
    transformMode: Environment['transformMode'];
    projectName?: string;
}
type WorkerRPC = BirpcReturn<RuntimeRPC, RunnerRPC>;
interface WorkerGlobalState {
    ctx: ContextRPC;
    config: ResolvedConfig;
    rpc: WorkerRPC;
    current?: Task;
    filepath?: string;
    environment: Environment;
    environmentTeardownRun?: boolean;
    onCancel: Promise<CancelReason>;
    moduleCache: ModuleCacheMap;
    mockMap: MockMap;
    providedContext: Record<string, any>;
    durations: {
        environment: number;
        prepare: number;
    };
}

type TransformResult = string | Partial<TransformResult$1> | undefined | null | void;
interface CoverageProvider {
    name: string;
    initialize: (ctx: Vitest) => Promise<void> | void;
    resolveOptions: () => ResolvedCoverageOptions;
    clean: (clean?: boolean) => void | Promise<void>;
    onAfterSuiteRun: (meta: AfterSuiteRunMeta) => void | Promise<void>;
    reportCoverage: (reportContext?: ReportContext) => void | Promise<void>;
    onFileTransform?: (sourceCode: string, id: string, pluginCtx: any) => TransformResult | Promise<TransformResult>;
}
interface ReportContext {
    /** Indicates whether all tests were run. False when only specific tests were run. */
    allTestsRun?: boolean;
}
interface CoverageProviderModule {
    /**
     * Factory for creating a new coverage provider
     */
    getProvider: () => CoverageProvider | Promise<CoverageProvider>;
    /**
     * Executed before tests are run in the worker thread.
     */
    startCoverage?: () => unknown | Promise<unknown>;
    /**
     * Executed on after each run in the worker thread. Possible to return a payload passed to the provider
     */
    takeCoverage?: () => unknown | Promise<unknown>;
    /**
     * Executed after all tests have been run in the worker thread.
     */
    stopCoverage?: () => unknown | Promise<unknown>;
}
type CoverageReporter = keyof ReportOptions | (string & {});
type CoverageReporterWithOptions<ReporterName extends CoverageReporter = CoverageReporter> = ReporterName extends keyof ReportOptions ? ReportOptions[ReporterName] extends never ? [ReporterName, {}] : [ReporterName, Partial<ReportOptions[ReporterName]>] : [ReporterName, Record<string, unknown>];
type Provider = 'v8' | 'istanbul' | 'custom' | undefined;
type CoverageOptions<T extends Provider = Provider> = T extends 'istanbul' ? ({
    provider: T;
} & CoverageIstanbulOptions) : T extends 'v8' ? ({
    /**
     * Provider to use for coverage collection.
     *
     * @default 'v8'
     */
    provider: T;
} & CoverageV8Options) : T extends 'custom' ? ({
    provider: T;
} & CustomProviderOptions) : ({
    provider?: T;
} & (CoverageV8Options));
/** Fields that have default values. Internally these will always be defined. */
type FieldsWithDefaultValues = 'enabled' | 'clean' | 'cleanOnRerun' | 'reportsDirectory' | 'exclude' | 'extension' | 'reportOnFailure' | 'allowExternal' | 'processingConcurrency';
type ResolvedCoverageOptions<T extends Provider = Provider> = CoverageOptions<T> & Required<Pick<CoverageOptions<T>, FieldsWithDefaultValues>> & {
    reporter: CoverageReporterWithOptions[];
};
interface BaseCoverageOptions {
    /**
     * Enables coverage collection. Can be overridden using `--coverage` CLI option.
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * List of files included in coverage as glob patterns
     *
     * @default ['**']
     */
    include?: string[];
    /**
     * Extensions for files to be included in coverage
     *
     * @default ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte', '.marko']
     */
    extension?: string | string[];
    /**
     * List of files excluded from coverage as glob patterns
     *
     * @default ['coverage/**', 'dist/**', '**\/[.]**', 'packages/*\/test?(s)/**', '**\/*.d.ts', '**\/virtual:*', '**\/__x00__*', '**\/\x00*', 'cypress/**', 'test?(s)/**', 'test?(-*).?(c|m)[jt]s?(x)', '**\/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)', '**\/__tests__/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*', '**\/vitest.{workspace,projects}.[jt]s?(on)', '**\/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}']
     */
    exclude?: string[];
    /**
     * Whether to include all files, including the untested ones into report
     *
     * @default true
     */
    all?: boolean;
    /**
     * Clean coverage results before running tests
     *
     * @default true
     */
    clean?: boolean;
    /**
     * Clean coverage report on watch rerun
     *
     * @default true
     */
    cleanOnRerun?: boolean;
    /**
     * Directory to write coverage report to
     *
     * @default './coverage'
     */
    reportsDirectory?: string;
    /**
     * Coverage reporters to use.
     * See [istanbul documentation](https://istanbul.js.org/docs/advanced/alternative-reporters/) for detailed list of all reporters.
     *
     * @default ['text', 'html', 'clover', 'json']
     */
    reporter?: Arrayable<CoverageReporter> | (CoverageReporter | [CoverageReporter] | CoverageReporterWithOptions)[];
    /**
     * Do not show files with 100% statement, branch, and function coverage
     *
     * @default false
     */
    skipFull?: boolean;
    /**
     * Configurations for thresholds
     *
     * @example
     *
     * ```ts
     * {
     *   // Thresholds for all files
     *   functions: 95,
     *   branches: 70,
     *   perFile: true,
     *   autoUpdate: true,
     *
     *   // Thresholds for utilities
     *   'src/utils/**.ts': {
     *     lines: 100,
     *     statements: 95,
     *   }
     * }
     * ```
     */
    thresholds?: Thresholds | ({
        [glob: string]: Pick<Thresholds, 'statements' | 'functions' | 'branches' | 'lines'>;
    } & Thresholds);
    /**
     * Watermarks for statements, lines, branches and functions.
     *
     * Default value is `[50,80]` for each property.
     */
    watermarks?: {
        statements?: [number, number];
        functions?: [number, number];
        branches?: [number, number];
        lines?: [number, number];
    };
    /**
     * Generate coverage report even when tests fail.
     *
     * @default false
     */
    reportOnFailure?: boolean;
    /**
     * Collect coverage of files outside the project `root`.
     *
     * @default false
     */
    allowExternal?: boolean;
    /**
     * Concurrency limit used when processing the coverage results.
     * Defaults to `Math.min(20, os.availableParallelism?.() ?? os.cpus().length)`
     */
    processingConcurrency?: number;
}
interface CoverageIstanbulOptions extends BaseCoverageOptions {
    /**
     * Set to array of class method names to ignore for coverage
     *
     * @default []
     */
    ignoreClassMethods?: string[];
}
interface CoverageV8Options extends BaseCoverageOptions {
    /**
     * Ignore empty lines, comments and other non-runtime code, e.g. Typescript types
     */
    ignoreEmptyLines?: boolean;
}
interface CustomProviderOptions extends Pick<BaseCoverageOptions, FieldsWithDefaultValues> {
    /** Name of the module or path to a file to load the custom provider from */
    customProviderModule: string;
}
interface Thresholds {
    /** Set global thresholds to `100` */
    100?: boolean;
    /** Check thresholds per file. */
    perFile?: boolean;
    /**
     * Update threshold values automatically when current coverage is higher than earlier thresholds
     *
     * @default false
     */
    autoUpdate?: boolean;
    /** Thresholds for statements */
    statements?: number;
    /** Thresholds for functions */
    functions?: number;
    /** Thresholds for branches */
    branches?: number;
    /** Thresholds for lines */
    lines?: number;
}

interface JSDOMOptions {
    /**
     * The html content for the test.
     *
     * @default '<!DOCTYPE html>'
     */
    html?: string | Buffer | ArrayBufferLike;
    /**
     * referrer just affects the value read from document.referrer.
     * It defaults to no referrer (which reflects as the empty string).
     */
    referrer?: string;
    /**
     * userAgent affects the value read from navigator.userAgent, as well as the User-Agent header sent while fetching subresources.
     *
     * @default `Mozilla/5.0 (${process.platform}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/${jsdomVersion}`
     */
    userAgent?: string;
    /**
     * url sets the value returned by window.location, document.URL, and document.documentURI,
     * and affects things like resolution of relative URLs within the document
     * and the same-origin restrictions and referrer used while fetching subresources.
     *
     * @default 'http://localhost:3000'.
     */
    url?: string;
    /**
     * contentType affects the value read from document.contentType, and how the document is parsed: as HTML or as XML.
     * Values that are not "text/html" or an XML mime type will throw.
     *
     * @default 'text/html'.
     */
    contentType?: string;
    /**
     * The maximum size in code units for the separate storage areas used by localStorage and sessionStorage.
     * Attempts to store data larger than this limit will cause a DOMException to be thrown. By default, it is set
     * to 5,000,000 code units per origin, as inspired by the HTML specification.
     *
     * @default 5_000_000
     */
    storageQuota?: number;
    /**
     * Enable console?
     *
     * @default false
     */
    console?: boolean;
    /**
     * jsdom does not have the capability to render visual content, and will act like a headless browser by default.
     * It provides hints to web pages through APIs such as document.hidden that their content is not visible.
     *
     * When the `pretendToBeVisual` option is set to `true`, jsdom will pretend that it is rendering and displaying
     * content.
     *
     * @default true
     */
    pretendToBeVisual?: boolean;
    /**
     * `includeNodeLocations` preserves the location info produced by the HTML parser,
     * allowing you to retrieve it with the nodeLocation() method (described below).
     *
     * It defaults to false to give the best performance,
     * and cannot be used with an XML content type since our XML parser does not support location info.
     *
     * @default false
     */
    includeNodeLocations?: boolean | undefined;
    /**
     * @default 'dangerously'
     */
    runScripts?: 'dangerously' | 'outside-only';
    /**
     * Enable CookieJar
     *
     * @default false
     */
    cookieJar?: boolean;
    resources?: 'usable' | any;
}

/**
 * Happy DOM options.
 */
interface HappyDOMOptions {
    width?: number;
    height?: number;
    url?: string;
    settings?: {
        disableJavaScriptEvaluation?: boolean;
        disableJavaScriptFileLoading?: boolean;
        disableCSSFileLoading?: boolean;
        disableIframePageLoading?: boolean;
        disableComputedStyleRendering?: boolean;
        enableFileSystemHttpRequests?: boolean;
        navigator?: {
            userAgent?: string;
        };
        device?: {
            prefersColorScheme?: string;
            mediaType?: string;
        };
    };
}

interface BenchmarkUserOptions {
    /**
     * Include globs for benchmark test files
     *
     * @default ['**\/*.{bench,benchmark}.?(c|m)[jt]s?(x)']
     */
    include?: string[];
    /**
     * Exclude globs for benchmark test files
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude?: string[];
    /**
     * Include globs for in-source benchmark test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters
     *
     * @default ['default']
     */
    reporters?: Arrayable$1<BenchmarkBuiltinReporters | Reporter>;
    /**
     * Write test results to a file when the `--reporter=json` option is also specified.
     * Also definable individually per reporter by using an object instead.
     */
    outputFile?: string | (Partial<Record<BenchmarkBuiltinReporters, string>> & Record<string, string>);
    /**
     * benchmark output file to compare against
     */
    compare?: string;
    /**
     * benchmark output file
     */
    outputJson?: string;
}
interface Benchmark extends Custom {
    meta: {
        benchmark: true;
        result?: TaskResult;
    };
}
interface BenchmarkResult extends TaskResult {
    name: string;
    rank: number;
}
type BenchFunction = (this: Bench) => Promise<void> | void;
type ChainableBenchmarkAPI = ChainableFunction<'skip' | 'only' | 'todo', (name: string | Function, fn?: BenchFunction, options?: Options$1) => void>;
type BenchmarkAPI = ChainableBenchmarkAPI & {
    skipIf: (condition: any) => ChainableBenchmarkAPI;
    runIf: (condition: any) => ChainableBenchmarkAPI;
};

declare const defaultInclude: string[];
declare const defaultExclude: string[];
declare const coverageConfigDefaults: ResolvedCoverageOptions;
declare const configDefaults: Readonly<{
    allowOnly: boolean;
    isolate: true;
    watch: boolean;
    globals: false;
    environment: "node";
    pool: "threads";
    clearMocks: false;
    restoreMocks: false;
    mockReset: false;
    include: string[];
    exclude: string[];
    testTimeout: number;
    hookTimeout: number;
    teardownTimeout: number;
    watchExclude: string[];
    forceRerunTriggers: string[];
    update: false;
    reporters: never[];
    silent: false;
    hideSkippedTests: false;
    api: false;
    ui: false;
    uiBase: string;
    open: boolean;
    css: {
        include: never[];
    };
    coverage: CoverageV8Options;
    fakeTimers: {
        loopLimit: number;
        shouldClearNativeTimers: true;
        toFake: ("setTimeout" | "setInterval" | "clearInterval" | "clearTimeout" | "setImmediate" | "clearImmediate" | "Date")[];
    };
    maxConcurrency: number;
    dangerouslyIgnoreUnhandledErrors: false;
    typecheck: {
        checker: "tsc";
        include: string[];
        exclude: string[];
    };
    slowTestThreshold: number;
    disableConsoleIntercept: false;
}>;

declare const extraInlineDeps: (string | RegExp)[];

interface UserWorkspaceConfig extends UserConfig$1 {
    test?: ProjectConfig;
}

type UserConfigFnObject = (env: ConfigEnv) => UserConfig$1;
type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig$1>;
type UserConfigFn = (env: ConfigEnv) => UserConfig$1 | Promise<UserConfig$1>;
type UserConfigExport = UserConfig$1 | Promise<UserConfig$1> | UserConfigFnObject | UserConfigFnPromise | UserConfigFn;
type UserProjectConfigFn = (env: ConfigEnv) => UserWorkspaceConfig | Promise<UserWorkspaceConfig>;
type UserProjectConfigExport = UserWorkspaceConfig | Promise<UserWorkspaceConfig> | UserProjectConfigFn;
declare function defineConfig(config: UserConfig$1): UserConfig$1;
declare function defineConfig(config: Promise<UserConfig$1>): Promise<UserConfig$1>;
declare function defineConfig(config: UserConfigFnObject): UserConfigFnObject;
declare function defineConfig(config: UserConfigExport): UserConfigExport;
declare function defineProject<T extends UserProjectConfigExport>(config: T): T;
type Workspace = (string | (UserProjectConfigExport & {
    extends?: string;
}));
declare function defineWorkspace(config: Workspace[]): Workspace[];

type BuiltinEnvironment = 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';
type VitestEnvironment = BuiltinEnvironment | (string & Record<never, never>);

type CSSModuleScopeStrategy = 'stable' | 'scoped' | 'non-scoped';
type ApiConfig = Pick<ServerOptions, 'port' | 'strictPort' | 'host' | 'middlewareMode'>;

interface EnvironmentOptions {
    /**
     * jsdom options.
     */
    jsdom?: JSDOMOptions;
    happyDOM?: HappyDOMOptions;
    [x: string]: unknown;
}
type VitestRunMode = 'test' | 'benchmark';
interface SequenceOptions {
    /**
     * Class that handles sorting and sharding algorithm.
     * If you only need to change sorting, you can extend
     * your custom sequencer from `BaseSequencer` from `vitest/node`.
     * @default BaseSequencer
     */
    sequencer?: TestSequencerConstructor;
    /**
     * Should files and tests run in random order.
     * @default false
     */
    shuffle?: boolean | {
        /**
         * Should files run in random order. Long running tests will not start
         * earlier if you enable this option.
         * @default false
         */
        files?: boolean;
        /**
         * Should tests run in random order.
         * @default false
         */
        tests?: boolean;
    };
    /**
     * Should tests run in parallel.
     * @default false
     */
    concurrent?: boolean;
    /**
     * Defines how setup files should be ordered
     * - 'parallel' will run all setup files in parallel
     * - 'list' will run all setup files in the order they are defined in the config file
     * @default 'parallel'
     */
    setupFiles?: SequenceSetupFiles;
    /**
     * Seed for the random number generator.
     * @default Date.now()
     */
    seed?: number;
    /**
     * Defines how hooks should be ordered
     * - `stack` will order "after" hooks in reverse order, "before" hooks will run sequentially
     * - `list` will order hooks in the order they are defined
     * - `parallel` will run hooks in a single group in parallel
     * @default 'parallel'
     */
    hooks?: SequenceHooks;
}
type DepsOptimizationOptions = Omit<DepOptimizationConfig, 'disabled' | 'noDiscovery'> & {
    enabled?: boolean;
};
interface TransformModePatterns {
    /**
     * Use SSR transform pipeline for all modules inside specified tests.
     * Vite plugins will receive `ssr: true` flag when processing those files.
     *
     * @default tests with node or edge environment
     */
    ssr?: string[];
    /**
     * First do a normal transform pipeline (targeting browser),
     * then then do a SSR rewrite to run the code in Node.
     * Vite plugins will receive `ssr: false` flag when processing those files.
     *
     * @default tests with jsdom or happy-dom environment
     */
    web?: string[];
}
interface DepsOptions {
    /**
     * Enable dependency optimization. This can improve the performance of your tests.
     */
    optimizer?: {
        web?: DepsOptimizationOptions;
        ssr?: DepsOptimizationOptions;
    };
    web?: {
        /**
         * Should Vitest process assets (.png, .svg, .jpg, etc) files and resolve them like Vite does in the browser.
         *
         * These module will have a default export equal to the path to the asset, if no query is specified.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default true
         */
        transformAssets?: boolean;
        /**
         * Should Vitest process CSS (.css, .scss, .sass, etc) files and resolve them like Vite does in the browser.
         *
         * If CSS files are disabled with `css` options, this option will just silence UNKNOWN_EXTENSION errors.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default true
         */
        transformCss?: boolean;
        /**
         * Regexp pattern to match external files that should be transformed.
         *
         * By default, files inside `node_modules` are externalized and not transformed.
         *
         * **At the moment, this option only works with `{ pool: 'vmThreads' }`.**
         *
         * @default []
         */
        transformGlobPattern?: RegExp | RegExp[];
    };
    /**
     * Externalize means that Vite will bypass the package to native Node.
     *
     * Externalized dependencies will not be applied Vite's transformers and resolvers.
     * And does not support HMR on reload.
     *
     * Typically, packages under `node_modules` are externalized.
     *
     * @deprecated If you rely on vite-node directly, use `server.deps.external` instead. Otherwise, consider using `deps.optimizer.{web,ssr}.exclude`.
     */
    external?: (string | RegExp)[];
    /**
     * Vite will process inlined modules.
     *
     * This could be helpful to handle packages that ship `.js` in ESM format (that Node can't handle).
     *
     * If `true`, every dependency will be inlined
     *
     * @deprecated If you rely on vite-node directly, use `server.deps.inline` instead. Otherwise, consider using `deps.optimizer.{web,ssr}.include`.
     */
    inline?: (string | RegExp)[] | true;
    /**
     * Interpret CJS module's default as named exports
     *
     * @default true
     */
    interopDefault?: boolean;
    /**
     * When a dependency is a valid ESM package, try to guess the cjs version based on the path.
     * This will significantly improve the performance in huge repo, but might potentially
     * cause some misalignment if a package have different logic in ESM and CJS mode.
     *
     * @default false
     *
     * @deprecated Use `server.deps.fallbackCJS` instead.
     */
    fallbackCJS?: boolean;
    /**
     * A list of directories relative to the config file that should be treated as module directories.
     *
     * @default ['node_modules']
     */
    moduleDirectories?: string[];
}
type InlineReporter = Reporter;
type ReporterName = BuiltinReporters | 'html' | (string & {});
type ReporterWithOptions<Name extends ReporterName = ReporterName> = Name extends keyof BuiltinReporterOptions ? BuiltinReporterOptions[Name] extends never ? [Name, {}] : [Name, Partial<BuiltinReporterOptions[Name]>] : [Name, Record<string, unknown>];
interface InlineConfig {
    /**
     * Name of the project. Will be used to display in the reporter.
     */
    name?: string;
    /**
     * Benchmark options.
     *
     * @default {}
     */
    benchmark?: BenchmarkUserOptions;
    /**
     * Include globs for test files
     *
     * @default ['**\/*.{test,spec}.?(c|m)[jt]s?(x)']
     */
    include?: string[];
    /**
     * Exclude globs for test files
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude?: string[];
    /**
     * Include globs for in-source test files
     *
     * @default []
     */
    includeSource?: string[];
    /**
     * Handling for dependencies inlining or externalizing
     *
     */
    deps?: DepsOptions;
    /**
     * Vite-node server options
     */
    server?: Omit<ViteNodeServerOptions, 'transformMode'>;
    /**
     * Base directory to scan for the test files
     *
     * @default `config.root`
     */
    dir?: string;
    /**
     * Register apis globally
     *
     * @default false
     */
    globals?: boolean;
    /**
     * Running environment
     *
     * Supports 'node', 'jsdom', 'happy-dom', 'edge-runtime'
     *
     * If used unsupported string, will try to load the package `vitest-environment-${env}`
     *
     * @default 'node'
     */
    environment?: VitestEnvironment;
    /**
     * Environment options.
     */
    environmentOptions?: EnvironmentOptions;
    /**
     * Automatically assign environment based on globs. The first match will be used.
     * This has effect only when running tests inside Node.js.
     *
     * Format: [glob, environment-name]
     *
     * @default []
     * @example [
     *   // all tests in tests/dom will run in jsdom
     *   ['tests/dom/**', 'jsdom'],
     *   // all tests in tests/ with .edge.test.ts will run in edge-runtime
     *   ['**\/*.edge.test.ts', 'edge-runtime'],
     *   // ...
     * ]
     */
    environmentMatchGlobs?: [string, VitestEnvironment][];
    /**
     * Run tests in an isolated environment. This option has no effect on vmThreads pool.
     *
     * Disabling this option might improve performance if your code doesn't rely on side effects.
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Pool used to run tests in.
     *
     * Supports 'threads', 'forks', 'vmThreads'
     *
     * @default 'threads'
     */
    pool?: Exclude<Pool, 'browser'>;
    /**
     * Pool options
     */
    poolOptions?: PoolOptions;
    /**
     * Maximum number of workers to run tests in. `poolOptions.{threads,vmThreads}.maxThreads`/`poolOptions.forks.maxForks` has higher priority.
     */
    maxWorkers?: number;
    /**
     * Minimum number of workers to run tests in. `poolOptions.{threads,vmThreads}.minThreads`/`poolOptions.forks.minForks` has higher priority.
     */
    minWorkers?: number;
    /**
     * Should all test files run in parallel. Doesn't affect tests running in the same file.
     * Setting this to `false` will override `maxWorkers` and `minWorkers` options to `1`.
     *
     * @default true
     */
    fileParallelism?: boolean;
    /**
     * Automatically assign pool based on globs. The first match will be used.
     *
     * Format: [glob, pool-name]
     *
     * @default []
     * @example [
     *   // all tests in "forks" directory will run using "poolOptions.forks" API
     *   ['tests/forks/**', 'forks'],
     *   // all other tests will run based on "poolOptions.threads" option, if you didn't specify other globs
     *   // ...
     * ]
     */
    poolMatchGlobs?: [string, Exclude<Pool, 'browser'>][];
    /**
     * Path to a workspace configuration file
     */
    workspace?: string;
    /**
     * Update snapshot
     *
     * @default false
     */
    update?: boolean;
    /**
     * Watch mode
     *
     * @default !process.env.CI
     */
    watch?: boolean;
    /**
     * Project root
     *
     * @default process.cwd()
     */
    root?: string;
    /**
     * Custom reporter for output. Can contain one or more built-in report names, reporter instances,
     * and/or paths to custom reporters.
     *
     * @default []
     */
    reporters?: Arrayable<ReporterName | InlineReporter> | ((ReporterName | InlineReporter) | [ReporterName] | ReporterWithOptions)[];
    /**
     * Write test results to a file when the --reporter=json` or `--reporter=junit` option is also specified.
     * Also definable individually per reporter by using an object instead.
     */
    outputFile?: string | (Partial<Record<BuiltinReporters, string>> & Record<string, string>);
    /**
     * Default timeout of a test in milliseconds
     *
     * @default 5000
     */
    testTimeout?: number;
    /**
     * Default timeout of a hook in milliseconds
     *
     * @default 10000
     */
    hookTimeout?: number;
    /**
     * Default timeout to wait for close when Vitest shuts down, in milliseconds
     *
     * @default 10000
     */
    teardownTimeout?: number;
    /**
     * Silent mode
     *
     * @default false
     */
    silent?: boolean;
    /**
     * Hide logs for skipped tests
     *
     * @default false
     */
    hideSkippedTests?: boolean;
    /**
     * Path to setup files
     */
    setupFiles?: string | string[];
    /**
     * Path to global setup files
     */
    globalSetup?: string | string[];
    /**
     * Glob pattern of file paths to be ignore from triggering watch rerun
     * @deprecated Use server.watch.ignored instead
     */
    watchExclude?: string[];
    /**
     * Glob patter of file paths that will trigger the whole suite rerun
     *
     * Useful if you are testing calling CLI commands
     *
     * @default ['**\/package.json/**', '**\/{vitest,vite}.config.*\/**']
     */
    forceRerunTriggers?: string[];
    /**
     * Coverage options
     */
    coverage?: CoverageOptions;
    /**
     * run test names with the specified pattern
     */
    testNamePattern?: string | RegExp;
    /**
     * Will call `.mockClear()` on all spies before each test
     * @default false
     */
    clearMocks?: boolean;
    /**
     * Will call `.mockReset()` on all spies before each test
     * @default false
     */
    mockReset?: boolean;
    /**
     * Will call `.mockRestore()` on all spies before each test
     * @default false
     */
    restoreMocks?: boolean;
    /**
     * Will restore all global stubs to their original values before each test
     * @default false
     */
    unstubGlobals?: boolean;
    /**
     * Will restore all env stubs to their original values before each test
     * @default false
     */
    unstubEnvs?: boolean;
    /**
     * Serve API options.
     *
     * When set to true, the default port is 51204.
     *
     * @default false
     */
    api?: boolean | number | ApiConfig;
    /**
     * Enable Vitest UI
     *
     * @default false
     */
    ui?: boolean;
    /**
     * options for test in a browser environment
     * @experimental
     *
     * @default false
     */
    browser?: BrowserConfigOptions;
    /**
     * Open UI automatically.
     *
     * @default !process.env.CI
     */
    open?: boolean;
    /**
     * Base url for the UI
     *
     * @default '/__vitest__/'
     */
    uiBase?: string;
    /**
     * Determine the transform method for all modules imported inside a test that matches the glob pattern.
     */
    testTransformMode?: TransformModePatterns;
    /**
     * Format options for snapshot testing.
     */
    snapshotFormat?: Omit<PrettyFormatOptions, 'plugins'>;
    /**
     * Path to a module which has a default export of diff config.
     */
    diff?: string;
    /**
     * Paths to snapshot serializer modules.
     */
    snapshotSerializers?: string[];
    /**
     * Resolve custom snapshot path
     */
    resolveSnapshotPath?: (path: string, extension: string) => string;
    /**
     * Path to a custom snapshot environment module that has a defualt export of `SnapshotEnvironment` object.
     */
    snapshotEnvironment?: string;
    /**
     * Pass with no tests
     */
    passWithNoTests?: boolean;
    /**
     * Allow tests and suites that are marked as only
     *
     * @default !process.env.CI
     */
    allowOnly?: boolean;
    /**
     * Show heap usage after each test. Useful for debugging memory leaks.
     */
    logHeapUsage?: boolean;
    /**
     * Custom environment variables assigned to `process.env` before running tests.
     */
    env?: Record<string, string>;
    /**
     * Options for @sinon/fake-timers
     */
    fakeTimers?: FakeTimerInstallOpts;
    /**
     * Custom handler for console.log in tests.
     *
     * Return `false` to ignore the log.
     */
    onConsoleLog?: (log: string, type: 'stdout' | 'stderr') => boolean | void;
    /**
     * Enable stack trace filtering. If absent, all stack trace frames
     * will be shown.
     *
     * Return `false` to omit the frame.
     */
    onStackTrace?: (error: Error, frame: ParsedStack) => boolean | void;
    /**
     * Indicates if CSS files should be processed.
     *
     * When excluded, the CSS files will be replaced with empty strings to bypass the subsequent processing.
     *
     * @default { include: [], modules: { classNameStrategy: false } }
     */
    css?: boolean | {
        include?: RegExp | RegExp[];
        exclude?: RegExp | RegExp[];
        modules?: {
            classNameStrategy?: CSSModuleScopeStrategy;
        };
    };
    /**
     * A number of tests that are allowed to run at the same time marked with `test.concurrent`.
     * @default 5
     */
    maxConcurrency?: number;
    /**
     * Options for configuring cache policy.
     * @default { dir: 'node_modules/.vite/vitest' }
     */
    cache?: false | {
        /**
         * @deprecated Use Vite's "cacheDir" instead if you want to change the cache director. Note caches will be written to "cacheDir\/vitest".
         */
        dir: string;
    };
    /**
     * Options for configuring the order of running tests.
     */
    sequence?: SequenceOptions;
    /**
     * Specifies an `Object`, or an `Array` of `Object`,
     * which defines aliases used to replace values in `import` or `require` statements.
     * Will be merged with the default aliases inside `resolve.alias`.
     */
    alias?: AliasOptions;
    /**
     * Ignore any unhandled errors that occur
     *
     * @default false
     */
    dangerouslyIgnoreUnhandledErrors?: boolean;
    /**
     * Options for configuring typechecking test environment.
     */
    typecheck?: Partial<TypecheckConfig>;
    /**
     * The number of milliseconds after which a test is considered slow and reported as such in the results.
     *
     * @default 300
     */
    slowTestThreshold?: number;
    /**
     * Path to a custom test runner.
     */
    runner?: string;
    /**
     * Debug tests by opening `node:inspector` in worker / child process.
     * Provides similar experience as `--inspect` Node CLI argument.
     *
     * Requires `poolOptions.threads.singleThread: true` OR `poolOptions.forks.singleFork: true`.
     */
    inspect?: boolean | string;
    /**
     * Debug tests by opening `node:inspector` in worker / child process and wait for debugger to connect.
     * Provides similar experience as `--inspect-brk` Node CLI argument.
     *
     * Requires `poolOptions.threads.singleThread: true` OR `poolOptions.forks.singleFork: true`.
     */
    inspectBrk?: boolean | string;
    /**
     * Inspector options. If `--inspect` or `--inspect-brk` is enabled, these options will be passed to the inspector.
     */
    inspector?: {
        /**
         * Enable inspector
         */
        enabled?: boolean;
        /**
         * Port to run inspector on
         */
        port?: number;
        /**
         * Host to run inspector on
         */
        host?: string;
        /**
         * Wait for debugger to connect before running tests
         */
        waitForDebugger?: boolean;
    };
    /**
     * Modify default Chai config. Vitest uses Chai for `expect` and `assert` matches.
     * https://github.com/chaijs/chai/blob/4.x.x/lib/chai/config.js
     */
    chaiConfig?: ChaiConfig;
    /**
     * Stop test execution when given number of tests have failed.
     */
    bail?: number;
    /**
     * Retry the test specific number of times if it fails.
     *
     * @default 0
     */
    retry?: number;
    /**
     * Show full diff when snapshot fails instead of a patch.
     */
    expandSnapshotDiff?: boolean;
    /**
     * By default, Vitest automatically intercepts console logging during tests for extra formatting of test file, test title, etc...
     * This is also required for console log preview on Vitest UI.
     * However, disabling such interception might help when you want to debug a code with normal synchronus terminal console logging.
     *
     * This option has no effect on browser pool since Vitest preserves original logging on browser devtools.
     *
     * @default false
     */
    disableConsoleIntercept?: boolean;
    /**
     * Include "location" property inside the test definition
     *
     * @default false
     */
    includeTaskLocation?: boolean;
}
interface TypecheckConfig {
    /**
     * Run typechecking tests alongisde regular tests.
     */
    enabled?: boolean;
    /**
     * When typechecking is enabled, only run typechecking tests.
     */
    only?: boolean;
    /**
     * What tools to use for type checking.
     *
     * @default 'tsc'
     */
    checker: 'tsc' | 'vue-tsc' | (string & Record<never, never>);
    /**
     * Pattern for files that should be treated as test files
     *
     * @default ['**\/*.{test,spec}-d.?(c|m)[jt]s?(x)']
     */
    include: string[];
    /**
     * Pattern for files that should not be treated as test files
     *
     * @default ['**\/node_modules/**', '**\/dist/**', '**\/cypress/**', '**\/.{idea,git,cache,output,temp}/**', '**\/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*']
     */
    exclude: string[];
    /**
     * Check JS files that have `@ts-check` comment.
     * If you have it enabled in tsconfig, this will not overwrite it.
     */
    allowJs?: boolean;
    /**
     * Do not fail, if Vitest found errors outside the test files.
     */
    ignoreSourceErrors?: boolean;
    /**
     * Path to tsconfig, relative to the project root.
     */
    tsconfig?: string;
}
interface UserConfig extends InlineConfig {
    /**
     * Path to the config file.
     *
     * Default resolving to `vitest.config.*`, `vite.config.*`
     *
     * Setting to `false` will disable config resolving.
     */
    config?: string | false | undefined;
    /**
     * Do not run tests when Vitest starts.
     *
     * Vitest will only run tests if it's called programmatically or the test file changes.
     *
     * CLI file filters will be ignored.
     */
    standalone?: boolean;
    /**
     * Use happy-dom
     */
    dom?: boolean;
    /**
     * Run tests that cover a list of source files
     */
    related?: string[] | string;
    /**
     * Overrides Vite mode
     * @default 'test'
     */
    mode?: string;
    /**
     * Runs tests that are affected by the changes in the repository, or between specified branch or commit hash
     * Requires initialized git repository
     * @default false
     */
    changed?: boolean | string;
    /**
     * Test suite shard to execute in a format of <index>/<count>.
     * Will divide tests into a `count` numbers, and run only the `indexed` part.
     * Cannot be used with enabled watch.
     * @example --shard=2/3
     */
    shard?: string;
    /**
     * Name of the project or projects to run.
     */
    project?: string | string[];
    /**
     * Additional exclude patterns
     */
    cliExclude?: string[];
    /**
     * Override vite config's clearScreen from cli
     */
    clearScreen?: boolean;
    /**
     * benchmark.compare option exposed at the top level for cli
     */
    compare?: string;
    /**
     * benchmark.outputJson option exposed at the top level for cli
     */
    outputJson?: string;
}
interface ResolvedConfig extends Omit<Required<UserConfig>, 'config' | 'filters' | 'browser' | 'coverage' | 'testNamePattern' | 'related' | 'api' | 'reporters' | 'resolveSnapshotPath' | 'benchmark' | 'shard' | 'cache' | 'sequence' | 'typecheck' | 'runner' | 'poolOptions' | 'pool' | 'cliExclude'> {
    mode: VitestRunMode;
    base?: string;
    config?: string;
    filters?: string[];
    testNamePattern?: RegExp;
    related?: string[];
    coverage: ResolvedCoverageOptions;
    snapshotOptions: SnapshotStateOptions;
    browser: ResolvedBrowserOptions;
    pool: Pool;
    poolOptions?: PoolOptions;
    reporters: (InlineReporter | ReporterWithOptions)[];
    defines: Record<string, any>;
    api: ApiConfig & {
        token: string;
    };
    cliExclude?: string[];
    benchmark?: Required<Omit<BenchmarkUserOptions, 'outputFile' | 'compare' | 'outputJson'>> & Pick<BenchmarkUserOptions, 'outputFile' | 'compare' | 'outputJson'>;
    shard?: {
        index: number;
        count: number;
    };
    cache: {
        /**
         * @deprecated
         */
        dir: string;
    } | false;
    sequence: {
        sequencer: TestSequencerConstructor;
        hooks: SequenceHooks;
        setupFiles: SequenceSetupFiles;
        shuffle?: boolean;
        concurrent?: boolean;
        seed: number;
    };
    typecheck: Omit<TypecheckConfig, 'enabled'> & {
        enabled: boolean;
    };
    runner?: string;
}
type ProjectConfig = Omit<UserConfig, 'sequencer' | 'shard' | 'watch' | 'run' | 'cache' | 'update' | 'reporters' | 'outputFile' | 'poolOptions' | 'teardownTimeout' | 'silent' | 'watchExclude' | 'forceRerunTriggers' | 'testNamePattern' | 'ui' | 'open' | 'uiBase' | 'snapshotFormat' | 'resolveSnapshotPath' | 'passWithNoTests' | 'onConsoleLog' | 'onStackTrace' | 'dangerouslyIgnoreUnhandledErrors' | 'slowTestThreshold' | 'inspect' | 'inspectBrk' | 'deps' | 'coverage'> & {
    sequencer?: Omit<SequenceOptions, 'sequencer' | 'seed'>;
    deps?: Omit<DepsOptions, 'moduleDirectories'>;
    poolOptions?: {
        threads?: Pick<NonNullable<PoolOptions['threads']>, 'singleThread' | 'isolate'>;
        vmThreads?: Pick<NonNullable<PoolOptions['vmThreads']>, 'singleThread'>;
        forks?: Pick<NonNullable<PoolOptions['forks']>, 'singleFork' | 'isolate'>;
    };
};
type RuntimeConfig = Pick<UserConfig, 'allowOnly' | 'testTimeout' | 'hookTimeout' | 'clearMocks' | 'mockReset' | 'restoreMocks' | 'fakeTimers' | 'maxConcurrency'> & {
    sequence?: {
        concurrent?: boolean;
        hooks?: SequenceHooks;
    };
};

type VitestInlineConfig = InlineConfig;
declare module 'vite' {
    interface UserConfig {
        /**
         * Options for Vitest
         */
        test?: VitestInlineConfig;
    }
}

declare global {
    namespace Chai {
        interface Assertion {
            containSubset: (expected: any) => Assertion;
        }
        interface Assert {
            containSubset: (val: any, exp: any, msg?: string) => void;
        }
    }
}
interface SnapshotMatcher<T> {
    <U extends {
        [P in keyof T]: any;
    }>(snapshot: Partial<U>, message?: string): void;
    (message?: string): void;
}
interface InlineSnapshotMatcher<T> {
    <U extends {
        [P in keyof T]: any;
    }>(properties: Partial<U>, snapshot?: string, message?: string): void;
    (message?: string): void;
}
declare module '@vitest/expect' {
    interface MatcherState {
        environment: VitestEnvironment;
        snapshotState: SnapshotState;
    }
    interface ExpectStatic {
        addSnapshotSerializer: (plugin: Plugin_2) => void;
    }
    interface Assertion<T> {
        matchSnapshot: SnapshotMatcher<T>;
        toMatchSnapshot: SnapshotMatcher<T>;
        toMatchInlineSnapshot: InlineSnapshotMatcher<T>;
        toThrowErrorMatchingSnapshot: (message?: string) => void;
        toThrowErrorMatchingInlineSnapshot: (snapshot?: string, message?: string) => void;
        toMatchFileSnapshot: (filepath: string, message?: string) => Promise<void>;
    }
}
declare module '@vitest/runner' {
    interface TestContext {
        expect: ExpectStatic;
    }
    interface TaskMeta {
        typecheck?: boolean;
        benchmark?: boolean;
    }
    interface File {
        prepareDuration?: number;
        environmentLoad?: number;
    }
    interface TaskBase {
        logs?: UserConsoleLog[];
    }
    interface TaskResult {
        benchmark?: BenchmarkResult;
    }
}

type RawErrsMap = Map<string, TscErrorInfo[]>;
interface TscErrorInfo {
    filePath: string;
    errCode: number;
    errMsg: string;
    line: number;
    column: number;
}
interface CollectLineNumbers {
    target: number;
    next: number;
    prev?: number;
}
type CollectLines = {
    [key in keyof CollectLineNumbers]: string;
};
interface RootAndTarget {
    root: string;
    targetAbsPath: string;
}
type Context = RootAndTarget & {
    rawErrsMap: RawErrsMap;
    openedDirs: Set<string>;
    lastActivePath?: string;
};

export { type ProjectConfig as $, type AfterSuiteRunMeta as A, type BaseCoverageOptions as B, type CoverageOptions as C, type RootAndTarget as D, type Environment as E, type FakeTimerInstallOpts as F, type Context as G, type Pool as H, type PoolOptions as I, type JSDOMOptions as J, type HappyDOMOptions as K, type BuiltinEnvironment as L, type MockFactoryWithHelper as M, type VitestEnvironment as N, type CSSModuleScopeStrategy as O, type ProvidedContext as P, type ApiConfig as Q, type ResolvedConfig as R, type EnvironmentOptions as S, type TestSequencer as T, type UserConfig as U, type VitestRunMode as V, type WorkerGlobalState as W, type DepsOptimizationOptions as X, type TransformModePatterns as Y, type InlineConfig as Z, type TypecheckConfig as _, type ResolvedCoverageOptions as a, type BrowserConfigOptions as a0, type UserWorkspaceConfig as a1, type RunnerRPC as a2, type ContextTestEnvironment as a3, type ResolvedTestEnvironment as a4, type ResolveIdFunction as a5, type WorkerRPC as a6, type Awaitable as a7, type Nullable as a8, type Arrayable as a9, defineConfig as aA, defineProject as aB, defineWorkspace as aC, configDefaults as aD, defaultInclude as aE, defaultExclude as aF, coverageConfigDefaults as aG, extraInlineDeps as aH, DefaultReporter as aI, BasicReporter as aJ, DotReporter as aK, JsonReporter as aL, VerboseReporter as aM, TapReporter as aN, JUnitReporter as aO, TapFlatReporter as aP, HangingProcessReporter as aQ, GithubActionsReporter as aR, BaseReporter as aS, ReportersMap as aT, type BuiltinReporters as aU, type BuiltinReporterOptions as aV, type JsonAssertionResult as aW, type JsonTestResult as aX, type JsonTestResults as aY, BenchmarkReportsMap as aZ, type BenchmarkBuiltinReporters as a_, type ArgumentsType$1 as aa, type MutableArray as ab, type Constructable as ac, type ModuleCache as ad, type EnvironmentReturn as ae, type VmEnvironmentReturn as af, type OnServerRestartHandler as ag, type ReportContext as ah, type CoverageReporter as ai, type CoverageIstanbulOptions as aj, type CoverageV8Options as ak, type CustomProviderOptions as al, type BenchmarkUserOptions as am, type Benchmark as an, type BenchmarkResult as ao, type BenchFunction as ap, type BenchmarkAPI as aq, type PendingSuiteMock as ar, type MockFactory as as, type MockMap as at, type UserConfigFnObject as au, type UserConfigFnPromise as av, type UserConfigFn as aw, type UserConfigExport as ax, type UserProjectConfigFn as ay, type UserProjectConfigExport as az, type CoverageProvider as b, type CoverageProviderModule as c, type BirpcOptions as d, type RuntimeRPC as e, type ContextRPC as f, type WorkerContext as g, type VitestOptions as h, Vitest as i, WorkspaceProject as j, type WorkspaceSpec as k, type ProcessPool as l, VitestPackageInstaller as m, type TestSequencerConstructor as n, type BrowserProviderInitializationOptions as o, type BrowserProvider as p, type BrowserProviderOptions as q, type BrowserScript as r, type RuntimeConfig as s, type UserConsoleLog as t, type ModuleGraphData as u, type Reporter as v, type RawErrsMap as w, type TscErrorInfo as x, type CollectLineNumbers as y, type CollectLines as z };
