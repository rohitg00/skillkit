import { ErrorWithDiff, Awaitable } from '@vitest/utils';

type ChainableFunction<T extends string, F extends (...args: any) => any, C = {}> = F & {
    [x in T]: ChainableFunction<T, F, C>;
} & {
    fn: (this: Record<T, any>, ...args: Parameters<F>) => ReturnType<F>;
} & C;
declare function createChainable<T extends string, Args extends any[], R = any>(keys: T[], fn: (this: Record<T, any>, ...args: Args) => R): ChainableFunction<T, (...args: Args) => R>;

interface FixtureItem extends FixtureOptions {
    prop: string;
    value: any;
    /**
     * Indicates whether the fixture is a function
     */
    isFn: boolean;
    /**
     * The dependencies(fixtures) of current fixture function.
     */
    deps?: FixtureItem[];
}

type RunMode = 'run' | 'skip' | 'only' | 'todo';
type TaskState = RunMode | 'pass' | 'fail';
interface TaskBase {
    id: string;
    name: string;
    mode: RunMode;
    meta: TaskMeta;
    each?: boolean;
    concurrent?: boolean;
    shuffle?: boolean;
    suite?: Suite;
    file?: File;
    result?: TaskResult;
    retry?: number;
    repeats?: number;
    location?: {
        line: number;
        column: number;
    };
}
interface TaskPopulated extends TaskBase {
    suite: Suite;
    pending?: boolean;
    result?: TaskResult;
    fails?: boolean;
    onFailed?: OnTestFailedHandler[];
    onFinished?: OnTestFinishedHandler[];
    /**
     * Store promises (from async expects) to wait for them before finishing the test
     */
    promises?: Promise<any>[];
}
interface TaskMeta {
}
interface TaskResult {
    state: TaskState;
    duration?: number;
    startTime?: number;
    heap?: number;
    errors?: ErrorWithDiff[];
    htmlError?: string;
    hooks?: Partial<Record<keyof SuiteHooks, TaskState>>;
    retryCount?: number;
    repeatCount?: number;
}
type TaskResultPack = [id: string, result: TaskResult | undefined, meta: TaskMeta];
interface Suite extends TaskBase {
    type: 'suite';
    tasks: Task[];
    filepath?: string;
    projectName: string;
}
interface File extends Suite {
    filepath: string;
    collectDuration?: number;
    setupDuration?: number;
}
interface Test<ExtraContext = {}> extends TaskPopulated {
    type: 'test';
    context: TaskContext<Test> & ExtraContext & TestContext;
}
interface Custom<ExtraContext = {}> extends TaskPopulated {
    type: 'custom';
    context: TaskContext<Custom> & ExtraContext & TestContext;
}
type Task = Test | Suite | Custom | File;
type DoneCallback = (error?: any) => void;
type TestFunction<ExtraContext = {}> = (context: ExtendedContext<Test> & ExtraContext) => Awaitable<any> | void;
type ExtractEachCallbackArgs<T extends ReadonlyArray<any>> = {
    1: [T[0]];
    2: [T[0], T[1]];
    3: [T[0], T[1], T[2]];
    4: [T[0], T[1], T[2], T[3]];
    5: [T[0], T[1], T[2], T[3], T[4]];
    6: [T[0], T[1], T[2], T[3], T[4], T[5]];
    7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6]];
    8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7]];
    9: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8]];
    10: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]];
    fallback: Array<T extends ReadonlyArray<infer U> ? U : any>;
}[T extends Readonly<[any]> ? 1 : T extends Readonly<[any, any]> ? 2 : T extends Readonly<[any, any, any]> ? 3 : T extends Readonly<[any, any, any, any]> ? 4 : T extends Readonly<[any, any, any, any, any]> ? 5 : T extends Readonly<[any, any, any, any, any, any]> ? 6 : T extends Readonly<[any, any, any, any, any, any, any]> ? 7 : T extends Readonly<[any, any, any, any, any, any, any, any]> ? 8 : T extends Readonly<[any, any, any, any, any, any, any, any, any]> ? 9 : T extends Readonly<[any, any, any, any, any, any, any, any, any, any]> ? 10 : 'fallback'];
interface EachFunctionReturn<T extends any[]> {
    /**
     * @deprecated Use options as the second argument instead
     */
    (name: string | Function, fn: (...args: T) => Awaitable<void>, options: TestOptions): void;
    (name: string | Function, fn: (...args: T) => Awaitable<void>, options?: number | TestOptions): void;
    (name: string | Function, options: TestOptions, fn: (...args: T) => Awaitable<void>): void;
}
interface TestEachFunction {
    <T extends any[] | [any]>(cases: ReadonlyArray<T>): EachFunctionReturn<T>;
    <T extends ReadonlyArray<any>>(cases: ReadonlyArray<T>): EachFunctionReturn<ExtractEachCallbackArgs<T>>;
    <T>(cases: ReadonlyArray<T>): EachFunctionReturn<T[]>;
    (...args: [TemplateStringsArray, ...any]): EachFunctionReturn<any[]>;
}
interface TestCollectorCallable<C = {}> {
    /**
     * @deprecated Use options as the second argument instead
     */
    <ExtraContext extends C>(name: string | Function, fn: TestFunction<ExtraContext>, options: TestOptions): void;
    <ExtraContext extends C>(name: string | Function, fn?: TestFunction<ExtraContext>, options?: number | TestOptions): void;
    <ExtraContext extends C>(name: string | Function, options?: TestOptions, fn?: TestFunction<ExtraContext>): void;
}
type ChainableTestAPI<ExtraContext = {}> = ChainableFunction<'concurrent' | 'sequential' | 'only' | 'skip' | 'todo' | 'fails', TestCollectorCallable<ExtraContext>, {
    each: TestEachFunction;
}>;
interface TestOptions {
    /**
     * Test timeout.
     */
    timeout?: number;
    /**
     * Times to retry the test if fails. Useful for making flaky tests more stable.
     * When retries is up, the last test error will be thrown.
     *
     * @default 0
     */
    retry?: number;
    /**
     * How many times the test will run.
     * Only inner tests will repeat if set on `describe()`, nested `describe()` will inherit parent's repeat by default.
     *
     * @default 0
     */
    repeats?: number;
    /**
     * Whether tests run concurrently.
     * Tests inherit `concurrent` from `describe()` and nested `describe()` will inherit from parent's `concurrent`.
     */
    concurrent?: boolean;
    /**
     * Whether tests run sequentially.
     * Tests inherit `sequential` from `describe()` and nested `describe()` will inherit from parent's `sequential`.
     */
    sequential?: boolean;
    /**
     * Whether the test should be skipped.
     */
    skip?: boolean;
    /**
     * Should this test be the only one running in a suite.
     */
    only?: boolean;
    /**
     * Whether the test should be skipped and marked as a todo.
     */
    todo?: boolean;
    /**
     * Whether the test is expected to fail. If it does, the test will pass, otherwise it will fail.
     */
    fails?: boolean;
}
interface ExtendedAPI<ExtraContext> {
    skipIf: (condition: any) => ChainableTestAPI<ExtraContext>;
    runIf: (condition: any) => ChainableTestAPI<ExtraContext>;
}
type CustomAPI<ExtraContext = {}> = ChainableTestAPI<ExtraContext> & ExtendedAPI<ExtraContext> & {
    extend: <T extends Record<string, any> = {}>(fixtures: Fixtures<T, ExtraContext>) => CustomAPI<{
        [K in keyof T | keyof ExtraContext]: K extends keyof T ? T[K] : K extends keyof ExtraContext ? ExtraContext[K] : never;
    }>;
};
type TestAPI<ExtraContext = {}> = ChainableTestAPI<ExtraContext> & ExtendedAPI<ExtraContext> & {
    extend: <T extends Record<string, any> = {}>(fixtures: Fixtures<T, ExtraContext>) => TestAPI<{
        [K in keyof T | keyof ExtraContext]: K extends keyof T ? T[K] : K extends keyof ExtraContext ? ExtraContext[K] : never;
    }>;
};
interface FixtureOptions {
    /**
     * Whether to automatically set up current fixture, even though it's not being used in tests.
     */
    auto?: boolean;
}
type Use<T> = (value: T) => Promise<void>;
type FixtureFn<T, K extends keyof T, ExtraContext> = (context: Omit<T, K> & ExtraContext, use: Use<T[K]>) => Promise<void>;
type Fixture<T, K extends keyof T, ExtraContext = {}> = ((...args: any) => any) extends T[K] ? (T[K] extends any ? FixtureFn<T, K, Omit<ExtraContext, Exclude<keyof T, K>>> : never) : T[K] | (T[K] extends any ? FixtureFn<T, K, Omit<ExtraContext, Exclude<keyof T, K>>> : never);
type Fixtures<T extends Record<string, any>, ExtraContext = {}> = {
    [K in keyof T]: Fixture<T, K, ExtraContext & ExtendedContext<Test>> | [Fixture<T, K, ExtraContext & ExtendedContext<Test>>, FixtureOptions?];
};
type InferFixturesTypes<T> = T extends TestAPI<infer C> ? C : T;
interface SuiteCollectorCallable<ExtraContext = {}> {
    /**
     * @deprecated Use options as the second argument instead
     */
    <OverrideExtraContext extends ExtraContext = ExtraContext>(name: string | Function, fn: SuiteFactory<OverrideExtraContext>, options: TestOptions): SuiteCollector<OverrideExtraContext>;
    <OverrideExtraContext extends ExtraContext = ExtraContext>(name: string | Function, fn?: SuiteFactory<OverrideExtraContext>, options?: number | TestOptions): SuiteCollector<OverrideExtraContext>;
    <OverrideExtraContext extends ExtraContext = ExtraContext>(name: string | Function, options: TestOptions, fn?: SuiteFactory<OverrideExtraContext>): SuiteCollector<OverrideExtraContext>;
}
type ChainableSuiteAPI<ExtraContext = {}> = ChainableFunction<'concurrent' | 'sequential' | 'only' | 'skip' | 'todo' | 'shuffle', SuiteCollectorCallable<ExtraContext>, {
    each: TestEachFunction;
}>;
type SuiteAPI<ExtraContext = {}> = ChainableSuiteAPI<ExtraContext> & {
    skipIf: (condition: any) => ChainableSuiteAPI<ExtraContext>;
    runIf: (condition: any) => ChainableSuiteAPI<ExtraContext>;
};
type HookListener<T extends any[], Return = void> = (...args: T) => Awaitable<Return>;
type HookCleanupCallback = (() => Awaitable<unknown>) | void;
interface SuiteHooks<ExtraContext = {}> {
    beforeAll: HookListener<[Readonly<Suite | File>], HookCleanupCallback>[];
    afterAll: HookListener<[Readonly<Suite | File>]>[];
    beforeEach: HookListener<[ExtendedContext<Test | Custom> & ExtraContext, Readonly<Suite>], HookCleanupCallback>[];
    afterEach: HookListener<[ExtendedContext<Test | Custom> & ExtraContext, Readonly<Suite>]>[];
}
interface TaskCustomOptions extends TestOptions {
    concurrent?: boolean;
    sequential?: boolean;
    skip?: boolean;
    only?: boolean;
    todo?: boolean;
    fails?: boolean;
    each?: boolean;
    meta?: Record<string, unknown>;
    fixtures?: FixtureItem[];
    handler?: (context: TaskContext<Custom>) => Awaitable<void>;
}
interface SuiteCollector<ExtraContext = {}> {
    readonly name: string;
    readonly mode: RunMode;
    options?: TestOptions;
    type: 'collector';
    test: TestAPI<ExtraContext>;
    tasks: (Suite | Custom<ExtraContext> | Test<ExtraContext> | SuiteCollector<ExtraContext>)[];
    task: (name: string, options?: TaskCustomOptions) => Custom<ExtraContext>;
    collect: (file?: File) => Promise<Suite>;
    clear: () => void;
    on: <T extends keyof SuiteHooks<ExtraContext>>(name: T, ...fn: SuiteHooks<ExtraContext>[T]) => void;
}
type SuiteFactory<ExtraContext = {}> = (test: TestAPI<ExtraContext>) => Awaitable<void>;
interface RuntimeContext {
    tasks: (SuiteCollector | Test)[];
    currentSuite: SuiteCollector | null;
}
interface TestContext {
}
interface TaskContext<Task extends Custom | Test = Custom | Test> {
    /**
     * Metadata of the current test
     */
    task: Readonly<Task>;
    /**
     * Extract hooks on test failed
     */
    onTestFailed: (fn: OnTestFailedHandler) => void;
    /**
     * Extract hooks on test failed
     */
    onTestFinished: (fn: OnTestFinishedHandler) => void;
    /**
     * Mark tests as skipped. All execution after this call will be skipped.
     */
    skip: () => void;
}
type ExtendedContext<T extends Custom | Test> = TaskContext<T> & TestContext;
type OnTestFailedHandler = (result: TaskResult) => Awaitable<void>;
type OnTestFinishedHandler = (result: TaskResult) => Awaitable<void>;
type SequenceHooks = 'stack' | 'list' | 'parallel';
type SequenceSetupFiles = 'list' | 'parallel';

export { type TaskContext as A, type SequenceHooks as B, type Custom as C, type DoneCallback as D, type ExtendedContext as E, type File as F, type SequenceSetupFiles as G, type HookListener as H, type InferFixturesTypes as I, type OnTestFailedHandler as O, type RunMode as R, type Suite as S, type Task as T, type Use as U, type Test as a, type ChainableFunction as b, createChainable as c, type SuiteAPI as d, type TestAPI as e, type SuiteCollector as f, type CustomAPI as g, type SuiteHooks as h, type OnTestFinishedHandler as i, type TaskState as j, type TaskBase as k, type TaskPopulated as l, type TaskMeta as m, type TaskResult as n, type TaskResultPack as o, type TestFunction as p, type TestOptions as q, type FixtureOptions as r, type FixtureFn as s, type Fixture as t, type Fixtures as u, type HookCleanupCallback as v, type TaskCustomOptions as w, type SuiteFactory as x, type RuntimeContext as y, type TestContext as z };
