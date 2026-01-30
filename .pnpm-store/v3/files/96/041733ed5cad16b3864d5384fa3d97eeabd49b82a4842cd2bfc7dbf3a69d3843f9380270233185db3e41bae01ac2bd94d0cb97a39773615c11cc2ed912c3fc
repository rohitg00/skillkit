import { TaskPopulated, File, TaskResultPack, CancelReason } from '@vitest/runner';
export { Custom, DoneCallback, ExtendedContext, File, HookCleanupCallback, HookListener, OnTestFailedHandler, RunMode, RuntimeContext, SequenceHooks, SequenceSetupFiles, Suite, SuiteAPI, SuiteCollector, SuiteFactory, SuiteHooks, Task, TaskBase, TaskContext, TaskCustomOptions, TaskMeta, TaskResult, TaskResultPack, TaskState, Test, TestAPI, TestContext, TestFunction, TestOptions, afterAll, afterEach, beforeAll, beforeEach, describe, it, onTestFailed, onTestFinished, suite, test } from '@vitest/runner';
export { b as bench } from './suite-dWqIFb_-.js';
import { ExpectStatic } from '@vitest/expect';
export { Assertion, AsymmetricMatchersContaining, ExpectStatic, JestAssertion } from '@vitest/expect';
import { F as FakeTimerInstallOpts, M as MockFactoryWithHelper, s as RuntimeConfig, P as ProvidedContext, A as AfterSuiteRunMeta, t as UserConsoleLog, R as ResolvedConfig, u as ModuleGraphData, v as Reporter } from './reporters-w_64AS5f.js';
export { Q as ApiConfig, aa as ArgumentsType, a9 as Arrayable, a7 as Awaitable, B as BaseCoverageOptions, ap as BenchFunction, an as Benchmark, aq as BenchmarkAPI, ao as BenchmarkResult, am as BenchmarkUserOptions, a0 as BrowserConfigOptions, r as BrowserScript, L as BuiltinEnvironment, O as CSSModuleScopeStrategy, y as CollectLineNumbers, z as CollectLines, ac as Constructable, G as Context, f as ContextRPC, a3 as ContextTestEnvironment, aj as CoverageIstanbulOptions, C as CoverageOptions, b as CoverageProvider, c as CoverageProviderModule, ai as CoverageReporter, ak as CoverageV8Options, al as CustomProviderOptions, X as DepsOptimizationOptions, E as Environment, S as EnvironmentOptions, ae as EnvironmentReturn, K as HappyDOMOptions, Z as InlineConfig, J as JSDOMOptions, ad as ModuleCache, ab as MutableArray, a8 as Nullable, ag as OnServerRestartHandler, H as Pool, I as PoolOptions, $ as ProjectConfig, w as RawErrsMap, ah as ReportContext, a5 as ResolveIdFunction, a as ResolvedCoverageOptions, a4 as ResolvedTestEnvironment, D as RootAndTarget, a2 as RunnerRPC, e as RuntimeRPC, Y as TransformModePatterns, x as TscErrorInfo, _ as TypecheckConfig, U as UserConfig, a1 as UserWorkspaceConfig, i as Vitest, N as VitestEnvironment, V as VitestRunMode, af as VmEnvironmentReturn, g as WorkerContext, W as WorkerGlobalState, a6 as WorkerRPC } from './reporters-w_64AS5f.js';
import { spyOn, fn, MaybeMockedDeep, MaybeMocked, MaybePartiallyMocked, MaybePartiallyMockedDeep, MockInstance } from '@vitest/spy';
export { Mock, MockContext, MockInstance, Mocked, MockedClass, MockedFunction, MockedObject, SpyInstance } from '@vitest/spy';
export { SnapshotEnvironment } from '@vitest/snapshot/environment';
import { SnapshotResult } from '@vitest/snapshot';
export { SnapshotData, SnapshotMatchOptions, SnapshotResult, SnapshotSerializer, SnapshotStateOptions, SnapshotSummary, SnapshotUpdateState, UncheckedSnapshot } from '@vitest/snapshot';
export { DiffOptions } from '@vitest/utils/diff';
import { TransformResult } from 'vite';
import * as chai from 'chai';
export { chai };
export { assert, should } from 'chai';
export { ErrorWithDiff, ParsedStack } from '@vitest/utils';
export { Bench as BenchFactory, Options as BenchOptions, Task as BenchTask, TaskResult as BenchTaskResult } from 'tinybench';
import '@vitest/runner/utils';
import 'vite-node';
import 'node:stream';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';

declare type Not<T extends boolean> = T extends true ? false : true;
declare type And<Types extends boolean[]> = Types[number] extends true ? true : false;
declare type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>;
declare const secret: unique symbol;
declare type Secret = typeof secret;
declare type IsNever<T> = [T] extends [never] ? true : false;
declare type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false;
declare type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false;
declare type PrintType<T> = IsUnknown<T> extends true ? 'unknown' : IsNever<T> extends true ? 'never' : IsAny<T> extends true ? never : boolean extends T ? 'boolean' : T extends boolean ? `literal boolean: ${T}` : string extends T ? 'string' : T extends string ? `literal string: ${T}` : number extends T ? 'number' : T extends number ? `literal number: ${T}` : T extends null ? 'null' : T extends undefined ? 'undefined' : T extends (...args: any[]) => any ? 'function' : '...';
/** Subjective "useful" keys from a type. For objects it's just `keyof` but for tuples/arrays it's the number keys
 * @example
 * UsefulKeys<{a: 1; b: 2}> // 'a' | 'b'
 * UsefulKeys<['a', 'b']> // '0' | '1'
 * UsefulKeys<string[]> // number
 */
declare type UsefulKeys<T> = T extends any[] ? {
    [K in keyof T]: K;
}[number] : keyof T;
declare type MismatchInfo<Actual, Expected> = And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true ? And<[Extends<any[], Actual>, Extends<any[], Expected>]> extends true ? Array<MismatchInfo<Extract<Actual, any[]>[number], Extract<Expected, any[]>[number]>> : {
    [K in UsefulKeys<Actual> | UsefulKeys<Expected>]: MismatchInfo<K extends keyof Actual ? Actual[K] : never, K extends keyof Expected ? Expected[K] : never>;
} : StrictEqualUsingBranding<Actual, Expected> extends true ? Actual : `Expected: ${PrintType<Expected>}, Actual: ${PrintType<Exclude<Actual, Expected>>}`;
/**
 * Recursively walk a type and replace it with a branded type related to the original. This is useful for
 * equality-checking stricter than `A extends B ? B extends A ? true : false : false`, because it detects
 * the difference between a few edge-case types that vanilla typescript doesn't by default:
 * - `any` vs `unknown`
 * - `{ readonly a: string }` vs `{ a: string }`
 * - `{ a?: string }` vs `{ a: string | undefined }`
 *
 * Note: not very performant for complex types - this should only be used when you know you need it. If doing
 * an equality check, it's almost always better to use `StrictEqualUsingTSInternalIdenticalToOperator`.
 */
declare type DeepBrand<T> = IsNever<T> extends true ? {
    type: 'never';
} : IsAny<T> extends true ? {
    type: 'any';
} : IsUnknown<T> extends true ? {
    type: 'unknown';
} : T extends string | number | boolean | symbol | bigint | null | undefined | void ? {
    type: 'primitive';
    value: T;
} : T extends new (...args: any[]) => any ? {
    type: 'constructor';
    params: ConstructorParams<T>;
    instance: DeepBrand<InstanceType<Extract<T, new (...args: any) => any>>>;
} : T extends (...args: infer P) => infer R ? {
    type: 'function';
    params: DeepBrand<P>;
    return: DeepBrand<R>;
    this: DeepBrand<ThisParameterType<T>>;
    props: DeepBrand<Omit<T, keyof Function>>;
} : T extends any[] ? {
    type: 'array';
    items: {
        [K in keyof T]: T[K];
    };
} : {
    type: 'object';
    properties: {
        [K in keyof T]: DeepBrand<T[K]>;
    };
    readonly: ReadonlyKeys<T>;
    required: RequiredKeys<T>;
    optional: OptionalKeys<T>;
    constructorParams: DeepBrand<ConstructorParams<T>>;
};
declare type RequiredKeys<T> = Extract<{
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T], keyof T>;
declare type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
declare type ReadonlyKeys<T> = Extract<{
    [K in keyof T]-?: ReadonlyEquivalent<{
        [_K in K]: T[K];
    }, {
        -readonly [_K in K]: T[K];
    }> extends true ? never : K;
}[keyof T], keyof T>;
declare type ReadonlyEquivalent<X, Y> = Extends<(<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)>;
/** Returns true if `L extends R`. Explicitly checks for `never` since that can give unexpected results. */
declare type Extends<L, R> = IsNever<L> extends true ? IsNever<R> : [L] extends [R] ? true : false;
declare type ExtendsUsingBranding<L, R> = Extends<DeepBrand<L>, DeepBrand<R>>;
declare type ExtendsExcludingAnyOrNever<L, R> = IsAny<L> extends true ? IsAny<R> : Extends<L, R>;
declare type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <T>() => T extends (R & T) | T ? true : false ? IsNever<L> extends IsNever<R> ? true : false : false;
declare type StrictEqualUsingBranding<Left, Right> = And<[
    ExtendsUsingBranding<Left, Right>,
    ExtendsUsingBranding<Right, Left>
]>;
declare type Params<Actual> = Actual extends (...args: infer P) => any ? P : never;
declare type ConstructorParams<Actual> = Actual extends new (...args: infer P) => any ? Actual extends new () => any ? P | [] : P : never;
declare const mismatch: unique symbol;
declare type Mismatch = {
    [mismatch]: 'mismatch';
};
/** A type which should match anything passed as a value but *doesn't* match `Mismatch` - helps TypeScript select the right overload for `toEqualTypeOf` and `toMatchTypeOf`. */
declare const avalue: unique symbol;
declare type AValue = {
    [avalue]?: undefined;
} | string | number | boolean | symbol | bigint | null | undefined | void;
declare type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<ActualResult, ExpectedResult> extends true ? [] : [Mismatch];
declare const inverted: unique symbol;
declare type Inverted<T> = {
    [inverted]: T;
};
declare const expectNull: unique symbol;
declare type ExpectNull<T> = {
    [expectNull]: T;
    result: ExtendsExcludingAnyOrNever<T, null>;
};
declare const expectUndefined: unique symbol;
declare type ExpectUndefined<T> = {
    [expectUndefined]: T;
    result: ExtendsExcludingAnyOrNever<T, undefined>;
};
declare const expectNumber: unique symbol;
declare type ExpectNumber<T> = {
    [expectNumber]: T;
    result: ExtendsExcludingAnyOrNever<T, number>;
};
declare const expectString: unique symbol;
declare type ExpectString<T> = {
    [expectString]: T;
    result: ExtendsExcludingAnyOrNever<T, string>;
};
declare const expectBoolean: unique symbol;
declare type ExpectBoolean<T> = {
    [expectBoolean]: T;
    result: ExtendsExcludingAnyOrNever<T, boolean>;
};
declare const expectVoid: unique symbol;
declare type ExpectVoid<T> = {
    [expectVoid]: T;
    result: ExtendsExcludingAnyOrNever<T, void>;
};
declare const expectFunction: unique symbol;
declare type ExpectFunction<T> = {
    [expectFunction]: T;
    result: ExtendsExcludingAnyOrNever<T, (...args: any[]) => any>;
};
declare const expectObject: unique symbol;
declare type ExpectObject<T> = {
    [expectObject]: T;
    result: ExtendsExcludingAnyOrNever<T, object>;
};
declare const expectArray: unique symbol;
declare type ExpectArray<T> = {
    [expectArray]: T;
    result: ExtendsExcludingAnyOrNever<T, any[]>;
};
declare const expectSymbol: unique symbol;
declare type ExpectSymbol<T> = {
    [expectSymbol]: T;
    result: ExtendsExcludingAnyOrNever<T, symbol>;
};
declare const expectAny: unique symbol;
declare type ExpectAny<T> = {
    [expectAny]: T;
    result: IsAny<T>;
};
declare const expectUnknown: unique symbol;
declare type ExpectUnknown<T> = {
    [expectUnknown]: T;
    result: IsUnknown<T>;
};
declare const expectNever: unique symbol;
declare type ExpectNever<T> = {
    [expectNever]: T;
    result: IsNever<T>;
};
declare const expectNullable: unique symbol;
declare type ExpectNullable<T> = {
    [expectNullable]: T;
    result: Not<StrictEqualUsingBranding<T, NonNullable<T>>>;
};
declare type Scolder<Expecter extends {
    result: boolean;
}, Options extends {
    positive: boolean;
}> = Expecter['result'] extends Options['positive'] ? () => true : Options['positive'] extends true ? Expecter : Inverted<Expecter>;
interface PositiveExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {
    positive: true;
    branded: false;
}> {
    toEqualTypeOf: {
        <Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
        ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>): true;
        <Expected extends StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, true>): true;
    };
    toMatchTypeOf: {
        <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
        ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>): true;
        <Expected extends Extends<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, true>): true;
    };
    toHaveProperty: <K extends keyof Actual>(key: K, ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, true>) => K extends keyof Actual ? PositiveExpectTypeOf<Actual[K]> : true;
    not: NegativeExpectTypeOf<Actual>;
    branded: {
        toEqualTypeOf: <Expected extends StrictEqualUsingBranding<Actual, Expected> extends true ? unknown : MismatchInfo<Actual, Expected>>(...MISMATCH: MismatchArgs<StrictEqualUsingBranding<Actual, Expected>, true>) => true;
    };
}
interface NegativeExpectTypeOf<Actual> extends BaseExpectTypeOf<Actual, {
    positive: false;
}> {
    toEqualTypeOf: {
        <Expected>(value: Expected & AValue, ...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>): true;
        <Expected>(...MISMATCH: MismatchArgs<StrictEqualUsingTSInternalIdenticalToOperator<Actual, Expected>, false>): true;
    };
    toMatchTypeOf: {
        <Expected>(value: Expected & AValue, // reason for `& AValue`: make sure this is only the selected overload when the end-user passes a value for an inferred typearg. The `Mismatch` type does match `AValue`.
        ...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>): true;
        <Expected>(...MISMATCH: MismatchArgs<Extends<Actual, Expected>, false>): true;
    };
    toHaveProperty: <K extends string | number | symbol>(key: K, ...MISMATCH: MismatchArgs<Extends<K, keyof Actual>, false>) => true;
}
declare type ExpectTypeOf<Actual, Options extends {
    positive: boolean;
}> = Options['positive'] extends true ? PositiveExpectTypeOf<Actual> : NegativeExpectTypeOf<Actual>;
interface BaseExpectTypeOf<Actual, Options extends {
    positive: boolean;
}> {
    toBeAny: Scolder<ExpectAny<Actual>, Options>;
    toBeUnknown: Scolder<ExpectUnknown<Actual>, Options>;
    toBeNever: Scolder<ExpectNever<Actual>, Options>;
    toBeFunction: Scolder<ExpectFunction<Actual>, Options>;
    toBeObject: Scolder<ExpectObject<Actual>, Options>;
    toBeArray: Scolder<ExpectArray<Actual>, Options>;
    toBeNumber: Scolder<ExpectNumber<Actual>, Options>;
    toBeString: Scolder<ExpectString<Actual>, Options>;
    toBeBoolean: Scolder<ExpectBoolean<Actual>, Options>;
    toBeVoid: Scolder<ExpectVoid<Actual>, Options>;
    toBeSymbol: Scolder<ExpectSymbol<Actual>, Options>;
    toBeNull: Scolder<ExpectNull<Actual>, Options>;
    toBeUndefined: Scolder<ExpectUndefined<Actual>, Options>;
    toBeNullable: Scolder<ExpectNullable<Actual>, Options>;
    toBeCallableWith: Options['positive'] extends true ? (...args: Params<Actual>) => true : never;
    toBeConstructibleWith: Options['positive'] extends true ? (...args: ConstructorParams<Actual>) => true : never;
    extract: <V>(v?: V) => ExpectTypeOf<Extract<Actual, V>, Options>;
    exclude: <V>(v?: V) => ExpectTypeOf<Exclude<Actual, V>, Options>;
    parameter: <K extends keyof Params<Actual>>(number: K) => ExpectTypeOf<Params<Actual>[K], Options>;
    parameters: ExpectTypeOf<Params<Actual>, Options>;
    constructorParameters: ExpectTypeOf<ConstructorParams<Actual>, Options>;
    thisParameter: ExpectTypeOf<ThisParameterType<Actual>, Options>;
    instance: Actual extends new (...args: any[]) => infer I ? ExpectTypeOf<I, Options> : never;
    returns: Actual extends (...args: any[]) => infer R ? ExpectTypeOf<R, Options> : never;
    resolves: Actual extends PromiseLike<infer R> ? ExpectTypeOf<R, Options> : never;
    items: Actual extends ArrayLike<infer R> ? ExpectTypeOf<R, Options> : never;
    guards: Actual extends (v: any, ...args: any[]) => v is infer T ? ExpectTypeOf<T, Options> : never;
    asserts: Actual extends (v: any, ...args: any[]) => asserts v is infer T ? unknown extends T ? never : ExpectTypeOf<T, Options> : never;
}
declare type _ExpectTypeOf = {
    <Actual>(actual: Actual): ExpectTypeOf<Actual, {
        positive: true;
        branded: false;
    }>;
    <Actual>(): ExpectTypeOf<Actual, {
        positive: true;
        branded: false;
    }>;
};
/**
 * Similar to Jest's `expect`, but with type-awareness.
 * Gives you access to a number of type-matchers that let you make assertions about the
 * form of a reference or generic type parameter.
 *
 * @example
 * import {foo, bar} from '../foo'
 * import {expectTypeOf} from 'expect-type'
 *
 * test('foo types', () => {
 *   // make sure `foo` has type {a: number}
 *   expectTypeOf(foo).toMatchTypeOf({a: 1})
 *   expectTypeOf(foo).toHaveProperty('a').toBeNumber()
 *
 *   // make sure `bar` is a function taking a string:
 *   expectTypeOf(bar).parameter(0).toBeString()
 *   expectTypeOf(bar).returns.not.toBeAny()
 * })
 *
 * @description
 * See the [full docs](https://npmjs.com/package/expect-type#documentation) for lots more examples.
 */
declare const expectTypeOf: _ExpectTypeOf;

interface AssertType {
    <T>(value: T): void;
}
declare const assertType: AssertType;

/**
 * This utils allows computational intensive tasks to only be ran once
 * across test reruns to improve the watch mode performance.
 *
 * Currently only works with `poolOptions.<pool>.isolate: false`
 *
 * @experimental
 */
declare function runOnce<T>(fn: (() => T), key?: string): T;
/**
 * Get a boolean indicates whether the task is running in the first time.
 * Could only be `false` in watch mode.
 *
 * Currently only works with `isolate: false`
 *
 * @experimental
 */
declare function isFirstRun(): boolean;

declare function createExpect(test?: TaskPopulated): ExpectStatic;
declare const globalExpect: ExpectStatic;

type WaitForCallback<T> = () => T | Promise<T>;
interface WaitForOptions {
    /**
     * @description Time in ms between each check callback
     * @default 50ms
     */
    interval?: number;
    /**
     * @description Time in ms after which the throw a timeout error
     * @default 1000ms
     */
    timeout?: number;
}
declare function waitFor<T>(callback: WaitForCallback<T>, options?: number | WaitForOptions): Promise<T>;
type WaitUntilCallback<T> = () => T | Promise<T>;
interface WaitUntilOptions extends Pick<WaitForOptions, 'interval' | 'timeout'> {
}
type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
declare function waitUntil<T>(callback: WaitUntilCallback<T>, options?: number | WaitUntilOptions): Promise<Truthy<T>>;

type ESModuleExports = Record<string, unknown>;
interface VitestUtils {
    /**
     * Checks if fake timers are enabled.
     */
    isFakeTimers: () => boolean;
    /**
     * This method wraps all further calls to timers until [`vi.useRealTimers()`](https://vitest.dev/api/vi#vi-userealtimers) is called.
     */
    useFakeTimers: (config?: FakeTimerInstallOpts) => VitestUtils;
    /**
     * Restores mocked timers to their original implementations. All timers that were scheduled before will be discarded.
     */
    useRealTimers: () => VitestUtils;
    /**
     * This method will call every timer that was initiated after [`vi.useFakeTimers`](https://vitest.dev/api/vi#vi-usefaketimers) call.
     * It will not fire any timer that was initiated during its call.
     */
    runOnlyPendingTimers: () => VitestUtils;
    /**
     * This method will asynchronously call every timer that was initiated after [`vi.useFakeTimers`](https://vitest.dev/api/vi#vi-usefaketimers) call, even asynchronous ones.
     * It will not fire any timer that was initiated during its call.
     */
    runOnlyPendingTimersAsync: () => Promise<VitestUtils>;
    /**
     * This method will invoke every initiated timer until the timer queue is empty. It means that every timer called during `runAllTimers` will be fired.
     * If you have an infinite interval, it will throw after 10,000 tries (can be configured with [`fakeTimers.loopLimit`](https://vitest.dev/config/#faketimers-looplimit)).
     */
    runAllTimers: () => VitestUtils;
    /**
     * This method will asynchronously invoke every initiated timer until the timer queue is empty. It means that every timer called during `runAllTimersAsync` will be fired even asynchronous timers.
     * If you have an infinite interval, it will throw after 10 000 tries (can be configured with [`fakeTimers.loopLimit`](https://vitest.dev/config/#faketimers-looplimit)).
     */
    runAllTimersAsync: () => Promise<VitestUtils>;
    /**
     * Calls every microtask that was queued by `process.nextTick`. This will also run all microtasks scheduled by themselves.
     */
    runAllTicks: () => VitestUtils;
    /**
     * This method will invoke every initiated timer until the specified number of milliseconds is passed or the queue is empty - whatever comes first.
     */
    advanceTimersByTime: (ms: number) => VitestUtils;
    /**
     * This method will invoke every initiated timer until the specified number of milliseconds is passed or the queue is empty - whatever comes first. This will include and await asynchronously set timers.
     */
    advanceTimersByTimeAsync: (ms: number) => Promise<VitestUtils>;
    /**
     * Will call next available timer. Useful to make assertions between each timer call. You can chain call it to manage timers by yourself.
     */
    advanceTimersToNextTimer: () => VitestUtils;
    /**
     * Will call next available timer and wait until it's resolved if it was set asynchronously. Useful to make assertions between each timer call.
     */
    advanceTimersToNextTimerAsync: () => Promise<VitestUtils>;
    /**
     * Get the number of waiting timers.
     */
    getTimerCount: () => number;
    /**
     * If fake timers are enabled, this method simulates a user changing the system clock (will affect date related API like `hrtime`, `performance.now` or `new Date()`) - however, it will not fire any timers.
     * If fake timers are not enabled, this method will only mock `Date.*` and `new Date()` calls.
     */
    setSystemTime: (time: number | string | Date) => VitestUtils;
    /**
     * Returns mocked current date that was set using `setSystemTime`. If date is not mocked the method will return `null`.
     */
    getMockedSystemTime: () => Date | null;
    /**
     * When using `vi.useFakeTimers`, `Date.now` calls are mocked. If you need to get real time in milliseconds, you can call this function.
     */
    getRealSystemTime: () => number;
    /**
     * Removes all timers that are scheduled to run. These timers will never run in the future.
     */
    clearAllTimers: () => VitestUtils;
    /**
     * Creates a spy on a method or getter/setter of an object similar to [`vi.fn()`](https://vitest.dev/api/vi#vi-fn). It returns a [mock function](https://vitest.dev/api/mock).
     *
     * @example
     * const cart = {
     *   getApples: () => 42
     * }
     *
     * const spy = vi.spyOn(cart, 'getApples').mockReturnValue(10)
     *
     * expect(cart.getApples()).toBe(10)
     * expect(spy).toHaveBeenCalled()
     * expect(spy).toHaveReturnedWith(10)
     */
    spyOn: typeof spyOn;
    /**
     * Creates a spy on a function, though can be initiated without one. Every time a function is invoked, it stores its call arguments, returns, and instances. Also, you can manipulate its behavior with [methods](https://vitest.dev/api/mock).
     *
     * If no function is given, mock will return `undefined`, when invoked.
     *
     * @example
     * const getApples = vi.fn(() => 0)
     *
     * getApples()
     *
     * expect(getApples).toHaveBeenCalled()
     * expect(getApples).toHaveReturnedWith(0)
     *
     * getApples.mockReturnValueOnce(5)
     *
     * expect(getApples()).toBe(5)
     * expect(getApples).toHaveNthReturnedWith(2, 5)
     */
    fn: typeof fn;
    /**
     * Wait for the callback to execute successfully. If the callback throws an error or returns a rejected promise it will continue to wait until it succeeds or times out.
     *
     * This is very useful when you need to wait for some asynchronous action to complete, for example, when you start a server and need to wait for it to start.
     *
     * @example
     * const server = createServer()
     *
     * await vi.waitFor(
     *   () => {
     *     if (!server.isReady)
     *       throw new Error('Server not started')
     *
     *     console.log('Server started')
     *   }, {
     *     timeout: 500, // default is 1000
     *     interval: 20, // default is 50
     *   }
     * )
     */
    waitFor: typeof waitFor;
    /**
     * This is similar to [`vi.waitFor`](https://vitest.dev/api/vi#vi-waitfor), but if the callback throws any errors, execution is immediately interrupted and an error message is received.
     *
     * If the callback returns a falsy value, the next check will continue until a truthy value is returned. This is useful when you need to wait for something to exist before taking the next step.
     *
     * @example
     * const element = await vi.waitUntil(
     *   () => document.querySelector('.element'),
     *   {
     *     timeout: 500, // default is 1000
     *     interval: 20, // default is 50
     *   }
     * )
     *
     * // do something with the element
     * expect(element.querySelector('.element-child')).toBeTruthy()
     */
    waitUntil: typeof waitUntil;
    /**
     * Run the factory before imports are evaluated. You can return a value from the factory
     * to reuse it inside your [`vi.mock`](https://vitest.dev/api/vi#vi-mock) factory and tests.
     *
     * If used with [`vi.mock`](https://vitest.dev/api/vi#vi-mock), both will be hoisted in the order they are defined in.
     */
    hoisted: <T>(factory: () => T) => T;
    /**
     * Mocks every import call to the module even if it was already statically imported.
     *
     * The call to `vi.mock` is hoisted to the top of the file, so you don't have access to variables declared in the global file scope
     * unless they are defined with [`vi.hoisted`](https://vitest.dev/api/vi#vi-hoisted) before this call.
     *
     * Mocking algorithm is described in [documentation](https://vitest.dev/guide/mocking#modules).
     * @param path Path to the module. Can be aliased, if your Vitest config supports it
     * @param factory Mocked module factory. The result of this function will be an exports object
     */
    mock: (path: string, factory?: MockFactoryWithHelper) => void;
    /**
     * Removes module from mocked registry. All calls to import will return the original module even if it was mocked before.
     *
     * This call is hoisted to the top of the file, so it will only unmock modules that were defined in `setupFiles`, for example.
     * @param path Path to the module. Can be aliased, if your Vitest config supports it
     */
    unmock: (path: string) => void;
    /**
     * Mocks every subsequent [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) call.
     *
     * Unlike [`vi.mock`](https://vitest.dev/api/vi#vi-mock), this method will not mock statically imported modules because it is not hoisted to the top of the file.
     *
     * Mocking algorithm is described in [documentation](https://vitest.dev/guide/mocking#modules).
     * @param path Path to the module. Can be aliased, if your Vitest config supports it
     * @param factory Mocked module factory. The result of this function will be an exports object
     */
    doMock: (path: string, factory?: MockFactoryWithHelper) => void;
    /**
     * Removes module from mocked registry. All subsequent calls to import will return original module.
     *
     * Unlike [`vi.unmock`](https://vitest.dev/api/vi#vi-unmock), this method is not hoisted to the top of the file.
     * @param path Path to the module. Can be aliased, if your Vitest config supports it
     */
    doUnmock: (path: string) => void;
    /**
     * Imports module, bypassing all checks if it should be mocked.
     * Can be useful if you want to mock module partially.
     * @example
     * vi.mock('./example.js', async () => {
     *  const axios = await vi.importActual<typeof import('./example.js')>('./example.js')
     *
     *  return { ...axios, get: vi.fn() }
     * })
     * @param path Path to the module. Can be aliased, if your config supports it
     */
    importActual: <T = ESModuleExports>(path: string) => Promise<T>;
    /**
     * Imports a module with all of its properties and nested properties mocked.
     *
     * Mocking algorithm is described in [documentation](https://vitest.dev/guide/mocking#modules).
     * @example
     * const example = await vi.importMock<typeof import('./example.js')>('./example.js')
     * example.calc.mockReturnValue(10)
     * expect(example.calc()).toBe(10)
     * @param path Path to the module. Can be aliased, if your config supports it
     * @returns Fully mocked module
     */
    importMock: <T = ESModuleExports>(path: string) => Promise<MaybeMockedDeep<T>>;
    /**
     * Type helper for TypeScript. Just returns the object that was passed.
     *
     * When `partial` is `true` it will expect a `Partial<T>` as a return value. By default, this will only make TypeScript believe that
     * the first level values are mocked. You can pass down `{ deep: true }` as a second argument to tell TypeScript that the whole object is mocked, if it actually is.
     * @example
     * import example from './example.js'
     * vi.mock('./example.js')
     *
     * test('1 + 1 equals 10' async () => {
     *  vi.mocked(example.calc).mockReturnValue(10)
     *  expect(example.calc(1, '+', 1)).toBe(10)
     * })
     * @param item Anything that can be mocked
     * @param deep If the object is deeply mocked
     * @param options If the object is partially or deeply mocked
     */
    mocked: (<T>(item: T, deep?: false) => MaybeMocked<T>) & (<T>(item: T, deep: true) => MaybeMockedDeep<T>) & (<T>(item: T, options: {
        partial?: false;
        deep?: false;
    }) => MaybeMocked<T>) & (<T>(item: T, options: {
        partial?: false;
        deep: true;
    }) => MaybeMockedDeep<T>) & (<T>(item: T, options: {
        partial: true;
        deep?: false;
    }) => MaybePartiallyMocked<T>) & (<T>(item: T, options: {
        partial: true;
        deep: true;
    }) => MaybePartiallyMockedDeep<T>) & (<T>(item: T) => MaybeMocked<T>);
    /**
     * Checks that a given parameter is a mock function. If you are using TypeScript, it will also narrow down its type.
     */
    isMockFunction: (fn: any) => fn is MockInstance;
    /**
     * Calls [`.mockClear()`](https://vitest.dev/api/mock#mockclear) on every mocked function. This will only empty `.mock` state, it will not reset implementation.
     *
     * It is useful if you need to clean up mock between different assertions.
     */
    clearAllMocks: () => VitestUtils;
    /**
     * Calls [`.mockReset()`](https://vitest.dev/api/mock#mockreset) on every mocked function. This will empty `.mock` state, reset "once" implementations and force the base implementation to return `undefined` when invoked.
     *
     * This is useful when you want to completely reset a mock to the default state.
     */
    resetAllMocks: () => VitestUtils;
    /**
     * Calls [`.mockRestore()`](https://vitest.dev/api/mock#mockrestore) on every mocked function. This will restore all original implementations.
     */
    restoreAllMocks: () => VitestUtils;
    /**
     * Makes value available on global namespace.
     * Useful, if you want to have global variables available, like `IntersectionObserver`.
     * You can return it back to original value with `vi.unstubAllGlobals`, or by enabling `unstubGlobals` config option.
     */
    stubGlobal: (name: string | symbol | number, value: unknown) => VitestUtils;
    /**
     * Changes the value of `import.meta.env` and `process.env`.
     * You can return it back to original value with `vi.unstubAllEnvs`, or by enabling `unstubEnvs` config option.
     */
    stubEnv: <T extends string>(name: T, value: T extends 'PROD' | 'DEV' | 'SSR' ? boolean : string) => VitestUtils;
    /**
     * Reset the value to original value that was available before first `vi.stubGlobal` was called.
     */
    unstubAllGlobals: () => VitestUtils;
    /**
     * Reset environmental variables to the ones that were available before first `vi.stubEnv` was called.
     */
    unstubAllEnvs: () => VitestUtils;
    /**
     * Resets modules registry by clearing the cache of all modules. This allows modules to be reevaluated when reimported.
     * Top-level imports cannot be re-evaluated. Might be useful to isolate modules where local state conflicts between tests.
     *
     * This method does not reset mocks registry. To clear mocks registry, use [`vi.unmock`](https://vitest.dev/api/vi#vi-unmock) or [`vi.doUnmock`](https://vitest.dev/api/vi#vi-dounmock).
     */
    resetModules: () => VitestUtils;
    /**
     * Wait for all imports to load. Useful, if you have a synchronous call that starts
     * importing a module that you cannot await otherwise.
     * Will also wait for new imports, started during the wait.
     */
    dynamicImportSettled: () => Promise<void>;
    /**
     * Updates runtime config. You can only change values that are used when executing tests.
     */
    setConfig: (config: RuntimeConfig) => void;
    /**
     * If config was changed with `vi.setConfig`, this will reset it to the original state.
     */
    resetConfig: () => void;
}
declare const vitest: VitestUtils;
declare const vi: VitestUtils;

declare function getRunningMode(): "run" | "watch";
declare function isWatchMode(): boolean;

/**
 * Gives access to injected context provided from the main thread.
 * This usually returns a value provided by `globalSetup` or an external library.
 */
declare function inject<T extends keyof ProvidedContext>(key: T): ProvidedContext[T];

interface TransformResultWithSource extends TransformResult {
    source?: string;
}
interface WebSocketHandlers {
    onUnhandledError: (error: unknown, type: string) => Promise<void>;
    onCollected: (files?: File[]) => Promise<void>;
    onTaskUpdate: (packs: TaskResultPack[]) => void;
    onAfterSuiteRun: (meta: AfterSuiteRunMeta) => void;
    onCancel: (reason: CancelReason) => void;
    getCountOfFailedTests: () => number;
    sendLog: (log: UserConsoleLog) => void;
    getFiles: () => File[];
    getTestFiles: () => Promise<[name: string, file: string][]>;
    getPaths: () => string[];
    getConfig: () => ResolvedConfig;
    resolveSnapshotPath: (testPath: string) => string;
    resolveSnapshotRawPath: (testPath: string, rawPath: string) => string;
    getModuleGraph: (id: string) => Promise<ModuleGraphData>;
    getBrowserFileSourceMap: (id: string) => Promise<TransformResult['map'] | undefined>;
    getTransformResult: (id: string) => Promise<TransformResultWithSource | undefined>;
    readSnapshotFile: (id: string) => Promise<string | null>;
    readTestFile: (id: string) => Promise<string | null>;
    saveTestFile: (id: string, content: string) => Promise<void>;
    saveSnapshotFile: (id: string, content: string) => Promise<void>;
    removeSnapshotFile: (id: string) => Promise<void>;
    snapshotSaved: (snapshot: SnapshotResult) => void;
    rerun: (files: string[]) => Promise<void>;
    updateSnapshot: (file?: File) => Promise<void>;
    getProvidedContext: () => ProvidedContext;
    getUnhandledErrors: () => unknown[];
    finishBrowserTests: () => void;
    getBrowserFiles: () => string[];
    debug: (...args: string[]) => void;
}
interface WebSocketEvents extends Pick<Reporter, 'onCollected' | 'onFinished' | 'onTaskUpdate' | 'onUserConsoleLog' | 'onPathsCollected'> {
    onCancel: (reason: CancelReason) => void;
    onFinishedReportCoverage: () => void;
}

export { AfterSuiteRunMeta, type AssertType, type ExpectTypeOf, ModuleGraphData, ProvidedContext, Reporter, ResolvedConfig, RuntimeConfig, type TransformResultWithSource, UserConsoleLog, type VitestUtils, type WebSocketEvents, type WebSocketHandlers, assertType, createExpect, globalExpect as expect, expectTypeOf, getRunningMode, inject, isFirstRun, isWatchMode, runOnce, vi, vitest };
