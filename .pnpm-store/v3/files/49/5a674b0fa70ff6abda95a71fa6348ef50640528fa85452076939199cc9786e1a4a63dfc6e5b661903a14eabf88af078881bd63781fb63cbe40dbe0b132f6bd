import { performance } from 'node:perf_hooks';
import { startTests } from '@vitest/runner';
import 'pathe';
import '@vitest/runner/utils';
import { setupColors, createColors, getSafeTimers } from '@vitest/utils';
import { g as getWorkerState } from '../vendor/global.CkGT_TMy.js';
import '../vendor/env.AtSIuHFg.js';
import { a as globalExpect, r as resetModules, v as vi } from '../vendor/vi.YFlodzP_.js';
import { a as startCoverageInsideWorker, s as stopCoverageInsideWorker } from '../vendor/coverage.E7sG1b3r.js';
import { a as resolveSnapshotEnvironment, s as setupChaiConfig, r as resolveTestRunner } from '../vendor/index.DpVgvm2P.js';
import { createRequire } from 'node:module';
import util from 'node:util';
import timers from 'node:timers';
import { isatty } from 'node:tty';
import { installSourcemapsSupport } from 'vite-node/source-map';
import { V as VitestIndex } from '../vendor/index.dI9lHwVn.js';
import { s as setupCommonEnv } from '../vendor/setup-common.8nJLd4ay.js';
import { c as closeInspector } from '../vendor/inspector.IgLX3ur5.js';
import 'std-env';
import 'chai';
import '../vendor/_commonjsHelpers.jjO7Zipk.js';
import '@vitest/expect';
import '@vitest/snapshot';
import '@vitest/utils/error';
import '../vendor/tasks.IknbGB2n.js';
import '@vitest/utils/source-map';
import '../vendor/base.5NT-gWu5.js';
import '../vendor/date.Ns1pGd_X.js';
import '@vitest/spy';
import '../path.js';
import 'node:url';
import '../vendor/rpc.joBhAkyK.js';
import '../vendor/index.8bPxjt7g.js';
import '../vendor/benchmark.yGkUTKnC.js';
import '../vendor/index.SMVOaj7F.js';
import '../vendor/run-once.Olz_Zkd8.js';

let globalSetup = false;
async function setupGlobalEnv(config, { environment }, executor) {
  await setupCommonEnv(config);
  Object.defineProperty(globalThis, "__vitest_index__", {
    value: VitestIndex,
    enumerable: false
  });
  const state = getWorkerState();
  if (!state.config.snapshotOptions.snapshotEnvironment)
    state.config.snapshotOptions.snapshotEnvironment = await resolveSnapshotEnvironment(config, executor);
  if (globalSetup)
    return;
  globalSetup = true;
  setupColors(createColors(isatty(1)));
  if (environment.transformMode === "web") {
    const _require = createRequire(import.meta.url);
    _require.extensions[".css"] = () => ({});
    _require.extensions[".scss"] = () => ({});
    _require.extensions[".sass"] = () => ({});
    _require.extensions[".less"] = () => ({});
    process.env.SSR = "";
  } else {
    process.env.SSR = "1";
  }
  globalThis.__vitest_required__ = {
    util,
    timers
  };
  installSourcemapsSupport({
    getSourceMap: (source) => state.moduleCache.getSourceMap(source)
  });
  if (!config.disableConsoleIntercept)
    await setupConsoleLogSpy();
}
async function setupConsoleLogSpy() {
  const { createCustomConsole } = await import('./runtime-console.EO5ha7qv.js');
  globalThis.console = createCustomConsole();
}
async function withEnv({ environment }, options, fn) {
  globalThis.__vitest_environment__ = environment.name;
  globalExpect.setState({
    environment: environment.name
  });
  const env = await environment.setup(globalThis, options);
  try {
    await fn();
  } finally {
    const { setTimeout } = getSafeTimers();
    await new Promise((resolve) => setTimeout(resolve));
    await env.teardown(globalThis);
  }
}

async function run(files, config, environment, executor) {
  const workerState = getWorkerState();
  await setupGlobalEnv(config, environment, executor);
  await startCoverageInsideWorker(config.coverage, executor);
  if (config.chaiConfig)
    setupChaiConfig(config.chaiConfig);
  const runner = await resolveTestRunner(config, executor);
  workerState.onCancel.then((reason) => {
    var _a;
    closeInspector(config);
    (_a = runner.onCancel) == null ? void 0 : _a.call(runner, reason);
  });
  workerState.durations.prepare = performance.now() - workerState.durations.prepare;
  workerState.durations.environment = performance.now();
  await withEnv(environment, environment.options || config.environmentOptions || {}, async () => {
    var _a, _b, _c, _d;
    workerState.durations.environment = performance.now() - workerState.durations.environment;
    for (const file of files) {
      const isIsolatedThreads = config.pool === "threads" && (((_b = (_a = config.poolOptions) == null ? void 0 : _a.threads) == null ? void 0 : _b.isolate) ?? true);
      const isIsolatedForks = config.pool === "forks" && (((_d = (_c = config.poolOptions) == null ? void 0 : _c.forks) == null ? void 0 : _d.isolate) ?? true);
      if (isIsolatedThreads || isIsolatedForks) {
        workerState.mockMap.clear();
        resetModules(workerState.moduleCache, true);
      }
      workerState.filepath = file;
      await startTests([file], runner);
      vi.resetConfig();
      vi.restoreAllMocks();
    }
    await stopCoverageInsideWorker(config.coverage, executor);
  });
  workerState.environmentTeardownRun = true;
}

export { run };
