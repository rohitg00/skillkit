import { setState, GLOBAL_EXPECT, getState } from '@vitest/expect';
import { g as getSnapshotClient, c as createExpect, v as vi } from './vendor/vi.YFlodzP_.js';
import 'pathe';
import { g as getFullName } from './vendor/tasks.IknbGB2n.js';
import { createDefer, getSafeTimers } from '@vitest/utils';
import { g as getWorkerState } from './vendor/global.CkGT_TMy.js';
import './vendor/env.AtSIuHFg.js';
import { r as rpc } from './vendor/rpc.joBhAkyK.js';
import { getTests, getNames } from '@vitest/runner/utils';
import { updateTask } from '@vitest/runner';
import { a as getBenchOptions, g as getBenchFn } from './vendor/benchmark.yGkUTKnC.js';
import 'chai';
import './vendor/_commonjsHelpers.jjO7Zipk.js';
import '@vitest/snapshot';
import '@vitest/utils/error';
import '@vitest/utils/source-map';
import './vendor/base.5NT-gWu5.js';
import './vendor/date.Ns1pGd_X.js';
import '@vitest/spy';
import 'std-env';
import './vendor/index.8bPxjt7g.js';
import './vendor/index.SMVOaj7F.js';

class VitestTestRunner {
  constructor(config) {
    this.config = config;
  }
  snapshotClient = getSnapshotClient();
  workerState = getWorkerState();
  __vitest_executor;
  cancelRun = false;
  importFile(filepath, source) {
    if (source === "setup")
      this.workerState.moduleCache.delete(filepath);
    return this.__vitest_executor.executeId(filepath);
  }
  onBeforeRunFiles() {
    this.snapshotClient.clear();
  }
  onAfterRunFiles() {
    this.workerState.current = void 0;
  }
  async onAfterRunSuite(suite) {
    if (this.config.logHeapUsage && typeof process !== "undefined")
      suite.result.heap = process.memoryUsage().heapUsed;
    if (suite.mode !== "skip" && typeof suite.filepath !== "undefined") {
      for (const test of getTests(suite)) {
        if (test.mode === "skip") {
          const name = getNames(test).slice(1).join(" > ");
          this.snapshotClient.skipTestSnapshots(name);
        }
      }
      const result = await this.snapshotClient.finishCurrentRun();
      if (result)
        await rpc().snapshotSaved(result);
    }
    this.workerState.current = suite.suite;
  }
  onAfterRunTask(test) {
    this.snapshotClient.clearTest();
    if (this.config.logHeapUsage && typeof process !== "undefined")
      test.result.heap = process.memoryUsage().heapUsed;
    this.workerState.current = test.suite;
  }
  onCancel(_reason) {
    this.cancelRun = true;
  }
  async onBeforeRunTask(test) {
    if (this.cancelRun)
      test.mode = "skip";
    if (test.mode !== "run")
      return;
    clearModuleMocks(this.config);
    this.workerState.current = test;
  }
  async onBeforeRunSuite(suite) {
    if (this.cancelRun)
      suite.mode = "skip";
    if (suite.mode !== "skip" && typeof suite.filepath !== "undefined") {
      await this.snapshotClient.startCurrentRun(suite.filepath, "__default_name_", this.workerState.config.snapshotOptions);
    }
    this.workerState.current = suite;
  }
  onBeforeTryTask(test) {
    var _a, _b;
    setState({
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberErrorGen: null,
      testPath: (_b = (_a = test.suite) == null ? void 0 : _a.file) == null ? void 0 : _b.filepath,
      currentTestName: getFullName(test),
      snapshotState: this.snapshotClient.snapshotState
    }, globalThis[GLOBAL_EXPECT]);
  }
  onAfterTryTask(test) {
    const {
      assertionCalls,
      expectedAssertionsNumber,
      expectedAssertionsNumberErrorGen,
      isExpectingAssertions,
      isExpectingAssertionsError
      // @ts-expect-error _local is untyped
    } = "context" in test && test.context._local ? test.context.expect.getState() : getState(globalThis[GLOBAL_EXPECT]);
    if (expectedAssertionsNumber !== null && assertionCalls !== expectedAssertionsNumber)
      throw expectedAssertionsNumberErrorGen();
    if (isExpectingAssertions === true && assertionCalls === 0)
      throw isExpectingAssertionsError;
  }
  extendTaskContext(context) {
    let _expect;
    Object.defineProperty(context, "expect", {
      get() {
        if (!_expect)
          _expect = createExpect(context.task);
        return _expect;
      }
    });
    Object.defineProperty(context, "_local", {
      get() {
        return _expect != null;
      }
    });
    return context;
  }
}
function clearModuleMocks(config) {
  const { clearMocks, mockReset, restoreMocks, unstubEnvs, unstubGlobals } = config;
  if (restoreMocks)
    vi.restoreAllMocks();
  else if (mockReset)
    vi.resetAllMocks();
  else if (clearMocks)
    vi.clearAllMocks();
  if (unstubEnvs)
    vi.unstubAllEnvs();
  if (unstubGlobals)
    vi.unstubAllGlobals();
}

function createBenchmarkResult(name) {
  return {
    name,
    rank: 0,
    rme: 0,
    samples: []
  };
}
const benchmarkTasks = /* @__PURE__ */ new WeakMap();
async function runBenchmarkSuite(suite, runner) {
  var _a;
  const { Task, Bench } = await runner.importTinybench();
  const start = performance.now();
  const benchmarkGroup = [];
  const benchmarkSuiteGroup = [];
  for (const task of suite.tasks) {
    if (task.mode !== "run")
      continue;
    if ((_a = task.meta) == null ? void 0 : _a.benchmark)
      benchmarkGroup.push(task);
    else if (task.type === "suite")
      benchmarkSuiteGroup.push(task);
  }
  for (const subSuite of benchmarkSuiteGroup)
    await runBenchmarkSuite(subSuite, runner);
  if (benchmarkGroup.length) {
    const defer = createDefer();
    suite.result = {
      state: "run",
      startTime: start,
      benchmark: createBenchmarkResult(suite.name)
    };
    updateTask$1(suite);
    const addBenchTaskListener = (task, benchmark) => {
      task.addEventListener("complete", (e) => {
        const task2 = e.task;
        const taskRes = task2.result;
        const result = benchmark.result.benchmark;
        Object.assign(result, taskRes);
        updateTask$1(benchmark);
      }, {
        once: true
      });
      task.addEventListener("error", (e) => {
        const task2 = e.task;
        defer.reject(benchmark ? task2.result.error : e);
      }, {
        once: true
      });
    };
    benchmarkGroup.forEach((benchmark) => {
      const options = getBenchOptions(benchmark);
      const benchmarkInstance = new Bench(options);
      const benchmarkFn = getBenchFn(benchmark);
      benchmark.result = {
        state: "run",
        startTime: start,
        benchmark: createBenchmarkResult(benchmark.name)
      };
      const task = new Task(benchmarkInstance, benchmark.name, benchmarkFn);
      benchmarkTasks.set(benchmark, task);
      addBenchTaskListener(task, benchmark);
      updateTask$1(benchmark);
    });
    const { setTimeout } = getSafeTimers();
    const tasks = [];
    for (const benchmark of benchmarkGroup) {
      const task = benchmarkTasks.get(benchmark);
      await task.warmup();
      tasks.push([
        await new Promise((resolve) => setTimeout(async () => {
          resolve(await task.run());
        })),
        benchmark
      ]);
    }
    suite.result.duration = performance.now() - start;
    suite.result.state = "pass";
    tasks.sort(([taskA], [taskB]) => taskA.result.mean - taskB.result.mean).forEach(([, benchmark], idx) => {
      benchmark.result.state = "pass";
      if (benchmark) {
        const result = benchmark.result.benchmark;
        result.rank = Number(idx) + 1;
        updateTask$1(benchmark);
      }
    });
    updateTask$1(suite);
    defer.resolve(null);
    await defer;
  }
  function updateTask$1(task) {
    updateTask(task, runner);
  }
}
class NodeBenchmarkRunner {
  constructor(config) {
    this.config = config;
  }
  __vitest_executor;
  async importTinybench() {
    return await import('tinybench');
  }
  importFile(filepath, source) {
    if (source === "setup")
      getWorkerState().moduleCache.delete(filepath);
    return this.__vitest_executor.executeId(filepath);
  }
  async runSuite(suite) {
    await runBenchmarkSuite(suite, this);
  }
  async runTask() {
    throw new Error("`test()` and `it()` is only available in test mode.");
  }
}

export { NodeBenchmarkRunner, VitestTestRunner };
