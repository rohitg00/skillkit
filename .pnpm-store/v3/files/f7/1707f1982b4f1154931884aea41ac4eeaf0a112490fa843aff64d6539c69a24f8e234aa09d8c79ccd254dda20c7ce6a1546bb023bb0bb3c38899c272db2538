import limit from 'p-limit';
import { getSafeTimers, isObject, createDefer, format, objDisplay, objectAttr, toArray, shuffle } from '@vitest/utils';
import { processError } from '@vitest/utils/error';
export { processError } from '@vitest/utils/error';
import { j as createChainable, g as generateHash, c as calculateSuiteHash, s as someTasksAreOnly, i as interpretTaskModes, p as partitionSuiteChildren, h as hasTests, e as hasFailed } from './chunk-tasks.js';
import { relative } from 'pathe';
import { parseSingleStack } from '@vitest/utils/source-map';

const fnMap = /* @__PURE__ */ new WeakMap();
const fixtureMap = /* @__PURE__ */ new WeakMap();
const hooksMap = /* @__PURE__ */ new WeakMap();
function setFn(key, fn) {
  fnMap.set(key, fn);
}
function getFn(key) {
  return fnMap.get(key);
}
function setFixture(key, fixture) {
  fixtureMap.set(key, fixture);
}
function getFixture(key) {
  return fixtureMap.get(key);
}
function setHooks(key, hooks) {
  hooksMap.set(key, hooks);
}
function getHooks(key) {
  return hooksMap.get(key);
}

class PendingError extends Error {
  constructor(message, task) {
    super(message);
    this.message = message;
    this.taskId = task.id;
  }
  code = "VITEST_PENDING";
  taskId;
}

const collectorContext = {
  tasks: [],
  currentSuite: null
};
function collectTask(task) {
  var _a;
  (_a = collectorContext.currentSuite) == null ? void 0 : _a.tasks.push(task);
}
async function runWithSuite(suite, fn) {
  const prev = collectorContext.currentSuite;
  collectorContext.currentSuite = suite;
  await fn();
  collectorContext.currentSuite = prev;
}
function withTimeout(fn, timeout, isHook = false) {
  if (timeout <= 0 || timeout === Number.POSITIVE_INFINITY)
    return fn;
  const { setTimeout, clearTimeout } = getSafeTimers();
  return (...args) => {
    return Promise.race([fn(...args), new Promise((resolve, reject) => {
      var _a;
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(makeTimeoutMsg(isHook, timeout)));
      }, timeout);
      (_a = timer.unref) == null ? void 0 : _a.call(timer);
    })]);
  };
}
function createTestContext(test, runner) {
  var _a;
  const context = function() {
    throw new Error("done() callback is deprecated, use promise instead");
  };
  context.task = test;
  context.skip = () => {
    test.pending = true;
    throw new PendingError("test is skipped; abort execution", test);
  };
  context.onTestFailed = (fn) => {
    test.onFailed || (test.onFailed = []);
    test.onFailed.push(fn);
  };
  context.onTestFinished = (fn) => {
    test.onFinished || (test.onFinished = []);
    test.onFinished.push(fn);
  };
  return ((_a = runner.extendTaskContext) == null ? void 0 : _a.call(runner, context)) || context;
}
function makeTimeoutMsg(isHook, timeout) {
  return `${isHook ? "Hook" : "Test"} timed out in ${timeout}ms.
If this is a long-running ${isHook ? "hook" : "test"}, pass a timeout value as the last argument or configure it globally with "${isHook ? "hookTimeout" : "testTimeout"}".`;
}

function mergeContextFixtures(fixtures, context = {}) {
  const fixtureOptionKeys = ["auto"];
  const fixtureArray = Object.entries(fixtures).map(([prop, value]) => {
    const fixtureItem = { value };
    if (Array.isArray(value) && value.length >= 2 && isObject(value[1]) && Object.keys(value[1]).some((key) => fixtureOptionKeys.includes(key))) {
      Object.assign(fixtureItem, value[1]);
      fixtureItem.value = value[0];
    }
    fixtureItem.prop = prop;
    fixtureItem.isFn = typeof fixtureItem.value === "function";
    return fixtureItem;
  });
  if (Array.isArray(context.fixtures))
    context.fixtures = context.fixtures.concat(fixtureArray);
  else
    context.fixtures = fixtureArray;
  fixtureArray.forEach((fixture) => {
    if (fixture.isFn) {
      const usedProps = getUsedProps(fixture.value);
      if (usedProps.length)
        fixture.deps = context.fixtures.filter(({ prop }) => prop !== fixture.prop && usedProps.includes(prop));
    }
  });
  return context;
}
const fixtureValueMaps = /* @__PURE__ */ new Map();
const cleanupFnArrayMap = /* @__PURE__ */ new Map();
async function callFixtureCleanup(context) {
  const cleanupFnArray = cleanupFnArrayMap.get(context) ?? [];
  for (const cleanup of cleanupFnArray.reverse())
    await cleanup();
  cleanupFnArrayMap.delete(context);
}
function withFixtures(fn, testContext) {
  return (hookContext) => {
    const context = hookContext || testContext;
    if (!context)
      return fn({});
    const fixtures = getFixture(context);
    if (!(fixtures == null ? void 0 : fixtures.length))
      return fn(context);
    const usedProps = getUsedProps(fn);
    const hasAutoFixture = fixtures.some(({ auto }) => auto);
    if (!usedProps.length && !hasAutoFixture)
      return fn(context);
    if (!fixtureValueMaps.get(context))
      fixtureValueMaps.set(context, /* @__PURE__ */ new Map());
    const fixtureValueMap = fixtureValueMaps.get(context);
    if (!cleanupFnArrayMap.has(context))
      cleanupFnArrayMap.set(context, []);
    const cleanupFnArray = cleanupFnArrayMap.get(context);
    const usedFixtures = fixtures.filter(({ prop, auto }) => auto || usedProps.includes(prop));
    const pendingFixtures = resolveDeps(usedFixtures);
    if (!pendingFixtures.length)
      return fn(context);
    async function resolveFixtures() {
      for (const fixture of pendingFixtures) {
        if (fixtureValueMap.has(fixture))
          continue;
        const resolvedValue = fixture.isFn ? await resolveFixtureFunction(fixture.value, context, cleanupFnArray) : fixture.value;
        context[fixture.prop] = resolvedValue;
        fixtureValueMap.set(fixture, resolvedValue);
        cleanupFnArray.unshift(() => {
          fixtureValueMap.delete(fixture);
        });
      }
    }
    return resolveFixtures().then(() => fn(context));
  };
}
async function resolveFixtureFunction(fixtureFn, context, cleanupFnArray) {
  const useFnArgPromise = createDefer();
  let isUseFnArgResolved = false;
  const fixtureReturn = fixtureFn(context, async (useFnArg) => {
    isUseFnArgResolved = true;
    useFnArgPromise.resolve(useFnArg);
    const useReturnPromise = createDefer();
    cleanupFnArray.push(async () => {
      useReturnPromise.resolve();
      await fixtureReturn;
    });
    await useReturnPromise;
  }).catch((e) => {
    if (!isUseFnArgResolved) {
      useFnArgPromise.reject(e);
      return;
    }
    throw e;
  });
  return useFnArgPromise;
}
function resolveDeps(fixtures, depSet = /* @__PURE__ */ new Set(), pendingFixtures = []) {
  fixtures.forEach((fixture) => {
    if (pendingFixtures.includes(fixture))
      return;
    if (!fixture.isFn || !fixture.deps) {
      pendingFixtures.push(fixture);
      return;
    }
    if (depSet.has(fixture))
      throw new Error(`Circular fixture dependency detected: ${fixture.prop} <- ${[...depSet].reverse().map((d) => d.prop).join(" <- ")}`);
    depSet.add(fixture);
    resolveDeps(fixture.deps, depSet, pendingFixtures);
    pendingFixtures.push(fixture);
    depSet.clear();
  });
  return pendingFixtures;
}
function getUsedProps(fn) {
  const match = fn.toString().match(/[^(]*\(([^)]*)/);
  if (!match)
    return [];
  const args = splitByComma(match[1]);
  if (!args.length)
    return [];
  const first = args[0];
  if (!(first.startsWith("{") && first.endsWith("}")))
    throw new Error(`The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "${first}".`);
  const _first = first.slice(1, -1).replace(/\s/g, "");
  const props = splitByComma(_first).map((prop) => {
    return prop.replace(/\:.*|\=.*/g, "");
  });
  const last = props.at(-1);
  if (last && last.startsWith("..."))
    throw new Error(`Rest parameters are not supported in fixtures, received "${last}".`);
  return props;
}
function splitByComma(s) {
  const result = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{" || s[i] === "[") {
      stack.push(s[i] === "{" ? "}" : "]");
    } else if (s[i] === stack[stack.length - 1]) {
      stack.pop();
    } else if (!stack.length && s[i] === ",") {
      const token = s.substring(start, i).trim();
      if (token)
        result.push(token);
      start = i + 1;
    }
  }
  const lastToken = s.substring(start).trim();
  if (lastToken)
    result.push(lastToken);
  return result;
}

let _test;
function setCurrentTest(test) {
  _test = test;
}
function getCurrentTest() {
  return _test;
}

const suite = createSuite();
const test = createTest(
  function(name, optionsOrFn, optionsOrTest) {
    if (getCurrentTest())
      throw new Error('Calling the test function inside another test function is not allowed. Please put it inside "describe" or "suite" so it can be properly collected.');
    getCurrentSuite().test.fn.call(this, formatName(name), optionsOrFn, optionsOrTest);
  }
);
const describe = suite;
const it = test;
let runner;
let defaultSuite;
let currentTestFilepath;
function getDefaultSuite() {
  return defaultSuite;
}
function getTestFilepath() {
  return currentTestFilepath;
}
function getRunner() {
  return runner;
}
function clearCollectorContext(filepath, currentRunner) {
  if (!defaultSuite)
    defaultSuite = currentRunner.config.sequence.shuffle ? suite.shuffle("") : currentRunner.config.sequence.concurrent ? suite.concurrent("") : suite("");
  runner = currentRunner;
  currentTestFilepath = filepath;
  collectorContext.tasks.length = 0;
  defaultSuite.clear();
  collectorContext.currentSuite = defaultSuite;
}
function getCurrentSuite() {
  return collectorContext.currentSuite || defaultSuite;
}
function createSuiteHooks() {
  return {
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: []
  };
}
function parseArguments(optionsOrFn, optionsOrTest) {
  let options = {};
  let fn = () => {
  };
  if (typeof optionsOrTest === "object") {
    if (typeof optionsOrFn === "object")
      throw new TypeError("Cannot use two objects as arguments. Please provide options and a function callback in that order.");
    options = optionsOrTest;
  } else if (typeof optionsOrTest === "number") {
    options = { timeout: optionsOrTest };
  } else if (typeof optionsOrFn === "object") {
    options = optionsOrFn;
  }
  if (typeof optionsOrFn === "function") {
    if (typeof optionsOrTest === "function")
      throw new TypeError("Cannot use two functions as arguments. Please use the second argument for options.");
    fn = optionsOrFn;
  } else if (typeof optionsOrTest === "function") {
    fn = optionsOrTest;
  }
  return {
    options,
    handler: fn
  };
}
function createSuiteCollector(name, factory = () => {
}, mode, shuffle, each, suiteOptions) {
  const tasks = [];
  const factoryQueue = [];
  let suite2;
  initSuite(true);
  const task = function(name2 = "", options = {}) {
    const task2 = {
      id: "",
      name: name2,
      suite: void 0,
      each: options.each,
      fails: options.fails,
      context: void 0,
      type: "custom",
      retry: options.retry ?? runner.config.retry,
      repeats: options.repeats,
      mode: options.only ? "only" : options.skip ? "skip" : options.todo ? "todo" : "run",
      meta: options.meta ?? /* @__PURE__ */ Object.create(null)
    };
    const handler = options.handler;
    if (options.concurrent || !options.sequential && runner.config.sequence.concurrent)
      task2.concurrent = true;
    if (shuffle)
      task2.shuffle = true;
    const context = createTestContext(task2, runner);
    Object.defineProperty(task2, "context", {
      value: context,
      enumerable: false
    });
    setFixture(context, options.fixtures);
    if (handler) {
      setFn(task2, withTimeout(
        withFixtures(handler, context),
        (options == null ? void 0 : options.timeout) ?? runner.config.testTimeout
      ));
    }
    if (runner.config.includeTaskLocation) {
      const limit = Error.stackTraceLimit;
      Error.stackTraceLimit = 15;
      const error = new Error("stacktrace").stack;
      Error.stackTraceLimit = limit;
      const stack = findTestFileStackTrace(error, task2.each ?? false);
      if (stack)
        task2.location = stack;
    }
    tasks.push(task2);
    return task2;
  };
  const test2 = createTest(function(name2, optionsOrFn, optionsOrTest) {
    let { options, handler } = parseArguments(
      optionsOrFn,
      optionsOrTest
    );
    if (typeof suiteOptions === "object")
      options = Object.assign({}, suiteOptions, options);
    options.concurrent = this.concurrent || !this.sequential && (options == null ? void 0 : options.concurrent);
    options.sequential = this.sequential || !this.concurrent && (options == null ? void 0 : options.sequential);
    const test3 = task(
      formatName(name2),
      { ...this, ...options, handler }
    );
    test3.type = "test";
  });
  const collector = {
    type: "collector",
    name,
    mode,
    options: suiteOptions,
    test: test2,
    tasks,
    collect,
    task,
    clear,
    on: addHook
  };
  function addHook(name2, ...fn) {
    getHooks(suite2)[name2].push(...fn);
  }
  function initSuite(includeLocation) {
    if (typeof suiteOptions === "number")
      suiteOptions = { timeout: suiteOptions };
    suite2 = {
      id: "",
      type: "suite",
      name,
      mode,
      each,
      shuffle,
      tasks: [],
      meta: /* @__PURE__ */ Object.create(null),
      projectName: ""
    };
    if (runner && includeLocation && runner.config.includeTaskLocation) {
      const limit = Error.stackTraceLimit;
      Error.stackTraceLimit = 15;
      const error = new Error("stacktrace").stack;
      Error.stackTraceLimit = limit;
      const stack = findTestFileStackTrace(error, suite2.each ?? false);
      if (stack)
        suite2.location = stack;
    }
    setHooks(suite2, createSuiteHooks());
  }
  function clear() {
    tasks.length = 0;
    factoryQueue.length = 0;
    initSuite(false);
  }
  async function collect(file) {
    factoryQueue.length = 0;
    if (factory)
      await runWithSuite(collector, () => factory(test2));
    const allChildren = [];
    for (const i of [...factoryQueue, ...tasks])
      allChildren.push(i.type === "collector" ? await i.collect(file) : i);
    suite2.file = file;
    suite2.tasks = allChildren;
    allChildren.forEach((task2) => {
      task2.suite = suite2;
      if (file)
        task2.file = file;
    });
    return suite2;
  }
  collectTask(collector);
  return collector;
}
function createSuite() {
  function suiteFn(name, factoryOrOptions, optionsOrFactory = {}) {
    const mode = this.only ? "only" : this.skip ? "skip" : this.todo ? "todo" : "run";
    const currentSuite = getCurrentSuite();
    let { options, handler: factory } = parseArguments(
      factoryOrOptions,
      optionsOrFactory
    );
    if (currentSuite == null ? void 0 : currentSuite.options)
      options = { ...currentSuite.options, ...options };
    options.concurrent = this.concurrent || !this.sequential && (options == null ? void 0 : options.concurrent);
    options.sequential = this.sequential || !this.concurrent && (options == null ? void 0 : options.sequential);
    return createSuiteCollector(formatName(name), factory, mode, this.shuffle, this.each, options);
  }
  suiteFn.each = function(cases, ...args) {
    const suite2 = this.withContext();
    this.setContext("each", true);
    if (Array.isArray(cases) && args.length)
      cases = formatTemplateString(cases, args);
    return (name, optionsOrFn, fnOrOptions) => {
      const _name = formatName(name);
      const arrayOnlyCases = cases.every(Array.isArray);
      const { options, handler } = parseArguments(
        optionsOrFn,
        fnOrOptions
      );
      const fnFirst = typeof optionsOrFn === "function";
      cases.forEach((i, idx) => {
        const items = Array.isArray(i) ? i : [i];
        if (fnFirst) {
          arrayOnlyCases ? suite2(formatTitle(_name, items, idx), () => handler(...items), options) : suite2(formatTitle(_name, items, idx), () => handler(i), options);
        } else {
          arrayOnlyCases ? suite2(formatTitle(_name, items, idx), options, () => handler(...items)) : suite2(formatTitle(_name, items, idx), options, () => handler(i));
        }
      });
      this.setContext("each", void 0);
    };
  };
  suiteFn.skipIf = (condition) => condition ? suite.skip : suite;
  suiteFn.runIf = (condition) => condition ? suite : suite.skip;
  return createChainable(
    ["concurrent", "sequential", "shuffle", "skip", "only", "todo"],
    suiteFn
  );
}
function createTaskCollector(fn, context) {
  const taskFn = fn;
  taskFn.each = function(cases, ...args) {
    const test2 = this.withContext();
    this.setContext("each", true);
    if (Array.isArray(cases) && args.length)
      cases = formatTemplateString(cases, args);
    return (name, optionsOrFn, fnOrOptions) => {
      const _name = formatName(name);
      const arrayOnlyCases = cases.every(Array.isArray);
      const { options, handler } = parseArguments(
        optionsOrFn,
        fnOrOptions
      );
      const fnFirst = typeof optionsOrFn === "function";
      cases.forEach((i, idx) => {
        const items = Array.isArray(i) ? i : [i];
        if (fnFirst) {
          arrayOnlyCases ? test2(formatTitle(_name, items, idx), () => handler(...items), options) : test2(formatTitle(_name, items, idx), () => handler(i), options);
        } else {
          arrayOnlyCases ? test2(formatTitle(_name, items, idx), options, () => handler(...items)) : test2(formatTitle(_name, items, idx), options, () => handler(i));
        }
      });
      this.setContext("each", void 0);
    };
  };
  taskFn.skipIf = function(condition) {
    return condition ? this.skip : this;
  };
  taskFn.runIf = function(condition) {
    return condition ? this : this.skip;
  };
  taskFn.extend = function(fixtures) {
    const _context = mergeContextFixtures(fixtures, context);
    return createTest(function fn2(name, optionsOrFn, optionsOrTest) {
      getCurrentSuite().test.fn.call(this, formatName(name), optionsOrFn, optionsOrTest);
    }, _context);
  };
  const _test = createChainable(
    ["concurrent", "sequential", "skip", "only", "todo", "fails"],
    taskFn
  );
  if (context)
    _test.mergeContext(context);
  return _test;
}
function createTest(fn, context) {
  return createTaskCollector(fn, context);
}
function formatName(name) {
  return typeof name === "string" ? name : name instanceof Function ? name.name || "<anonymous>" : String(name);
}
function formatTitle(template, items, idx) {
  if (template.includes("%#")) {
    template = template.replace(/%%/g, "__vitest_escaped_%__").replace(/%#/g, `${idx}`).replace(/__vitest_escaped_%__/g, "%%");
  }
  const count = template.split("%").length - 1;
  let formatted = format(template, ...items.slice(0, count));
  if (isObject(items[0])) {
    formatted = formatted.replace(
      /\$([$\w_.]+)/g,
      // https://github.com/chaijs/chai/pull/1490
      (_, key) => {
        var _a, _b;
        return objDisplay(objectAttr(items[0], key), { truncate: (_b = (_a = runner == null ? void 0 : runner.config) == null ? void 0 : _a.chaiConfig) == null ? void 0 : _b.truncateThreshold });
      }
    );
  }
  return formatted;
}
function formatTemplateString(cases, args) {
  const header = cases.join("").trim().replace(/ /g, "").split("\n").map((i) => i.split("|"))[0];
  const res = [];
  for (let i = 0; i < Math.floor(args.length / header.length); i++) {
    const oneCase = {};
    for (let j = 0; j < header.length; j++)
      oneCase[header[j]] = args[i * header.length + j];
    res.push(oneCase);
  }
  return res;
}
function findTestFileStackTrace(error, each) {
  const lines = error.split("\n").slice(1);
  for (const line of lines) {
    const stack = parseSingleStack(line);
    if (stack && stack.file === getTestFilepath()) {
      return {
        line: stack.line,
        /**
         * test.each([1, 2])('name')
         *                 ^ leads here, but should
         *                  ^ lead here
         * in source maps it's the same boundary, so it just points to the start of it
         */
        column: each ? stack.column + 1 : stack.column
      };
    }
  }
}

async function runSetupFiles(config, runner) {
  const files = toArray(config.setupFiles);
  if (config.sequence.setupFiles === "parallel") {
    await Promise.all(
      files.map(async (fsPath) => {
        await runner.importFile(fsPath, "setup");
      })
    );
  } else {
    for (const fsPath of files)
      await runner.importFile(fsPath, "setup");
  }
}

const now$1 = Date.now;
async function collectTests(paths, runner) {
  const files = [];
  const config = runner.config;
  for (const filepath of paths) {
    const path = relative(config.root, filepath);
    const file = {
      id: generateHash(`${path}${config.name || ""}`),
      name: path,
      type: "suite",
      mode: "run",
      filepath,
      tasks: [],
      meta: /* @__PURE__ */ Object.create(null),
      projectName: config.name
    };
    clearCollectorContext(filepath, runner);
    try {
      const setupStart = now$1();
      await runSetupFiles(config, runner);
      const collectStart = now$1();
      file.setupDuration = collectStart - setupStart;
      await runner.importFile(filepath, "collect");
      const defaultTasks = await getDefaultSuite().collect(file);
      setHooks(file, getHooks(defaultTasks));
      for (const c of [...defaultTasks.tasks, ...collectorContext.tasks]) {
        if (c.type === "test") {
          file.tasks.push(c);
        } else if (c.type === "custom") {
          file.tasks.push(c);
        } else if (c.type === "suite") {
          file.tasks.push(c);
        } else if (c.type === "collector") {
          const suite = await c.collect(file);
          if (suite.name || suite.tasks.length)
            file.tasks.push(suite);
        }
      }
      file.collectDuration = now$1() - collectStart;
    } catch (e) {
      const error = processError(e);
      file.result = {
        state: "fail",
        errors: [error]
      };
    }
    calculateSuiteHash(file);
    const hasOnlyTasks = someTasksAreOnly(file);
    interpretTaskModes(file, config.testNamePattern, hasOnlyTasks, false, config.allowOnly);
    files.push(file);
  }
  return files;
}

const now = Date.now;
function updateSuiteHookState(suite, name, state, runner) {
  var _a;
  if (!suite.result)
    suite.result = { state: "run" };
  if (!((_a = suite.result) == null ? void 0 : _a.hooks))
    suite.result.hooks = {};
  const suiteHooks = suite.result.hooks;
  if (suiteHooks) {
    suiteHooks[name] = state;
    updateTask(suite, runner);
  }
}
function getSuiteHooks(suite, name, sequence) {
  const hooks = getHooks(suite)[name];
  if (sequence === "stack" && (name === "afterAll" || name === "afterEach"))
    return hooks.slice().reverse();
  return hooks;
}
async function callTaskHooks(task, hooks, sequence) {
  if (sequence === "stack")
    hooks = hooks.slice().reverse();
  if (sequence === "parallel") {
    await Promise.all(hooks.map((fn) => fn(task.result)));
  } else {
    for (const fn of hooks)
      await fn(task.result);
  }
}
async function callSuiteHook(suite, currentTask, name, runner, args) {
  const sequence = runner.config.sequence.hooks;
  const callbacks = [];
  if (name === "beforeEach" && suite.suite) {
    callbacks.push(
      ...await callSuiteHook(suite.suite, currentTask, name, runner, args)
    );
  }
  updateSuiteHookState(currentTask, name, "run", runner);
  const hooks = getSuiteHooks(suite, name, sequence);
  if (sequence === "parallel") {
    callbacks.push(...await Promise.all(hooks.map((fn) => fn(...args))));
  } else {
    for (const hook of hooks)
      callbacks.push(await hook(...args));
  }
  updateSuiteHookState(currentTask, name, "pass", runner);
  if (name === "afterEach" && suite.suite) {
    callbacks.push(
      ...await callSuiteHook(suite.suite, currentTask, name, runner, args)
    );
  }
  return callbacks;
}
const packs = /* @__PURE__ */ new Map();
let updateTimer;
let previousUpdate;
function updateTask(task, runner) {
  packs.set(task.id, [task.result, task.meta]);
  const { clearTimeout, setTimeout } = getSafeTimers();
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    previousUpdate = sendTasksUpdate(runner);
  }, 10);
}
async function sendTasksUpdate(runner) {
  var _a;
  const { clearTimeout } = getSafeTimers();
  clearTimeout(updateTimer);
  await previousUpdate;
  if (packs.size) {
    const taskPacks = Array.from(packs).map(([id, task]) => {
      return [
        id,
        task[0],
        task[1]
      ];
    });
    const p = (_a = runner.onTaskUpdate) == null ? void 0 : _a.call(runner, taskPacks);
    packs.clear();
    return p;
  }
}
async function callCleanupHooks(cleanups) {
  await Promise.all(cleanups.map(async (fn) => {
    if (typeof fn !== "function")
      return;
    await fn();
  }));
}
async function runTest(test, runner) {
  var _a, _b, _c, _d, _e, _f;
  await ((_a = runner.onBeforeRunTask) == null ? void 0 : _a.call(runner, test));
  if (test.mode !== "run")
    return;
  if (((_b = test.result) == null ? void 0 : _b.state) === "fail") {
    updateTask(test, runner);
    return;
  }
  const start = now();
  test.result = {
    state: "run",
    startTime: start,
    retryCount: 0
  };
  updateTask(test, runner);
  setCurrentTest(test);
  const repeats = test.repeats ?? 0;
  for (let repeatCount = 0; repeatCount <= repeats; repeatCount++) {
    const retry = test.retry ?? 0;
    for (let retryCount = 0; retryCount <= retry; retryCount++) {
      let beforeEachCleanups = [];
      try {
        await ((_c = runner.onBeforeTryTask) == null ? void 0 : _c.call(runner, test, { retry: retryCount, repeats: repeatCount }));
        test.result.repeatCount = repeatCount;
        beforeEachCleanups = await callSuiteHook(test.suite, test, "beforeEach", runner, [test.context, test.suite]);
        if (runner.runTask) {
          await runner.runTask(test);
        } else {
          const fn = getFn(test);
          if (!fn)
            throw new Error("Test function is not found. Did you add it using `setFn`?");
          await fn();
        }
        if (test.promises) {
          const result = await Promise.allSettled(test.promises);
          const errors = result.map((r) => r.status === "rejected" ? r.reason : void 0).filter(Boolean);
          if (errors.length)
            throw errors;
        }
        await ((_d = runner.onAfterTryTask) == null ? void 0 : _d.call(runner, test, { retry: retryCount, repeats: repeatCount }));
        if (test.result.state !== "fail") {
          if (!test.repeats)
            test.result.state = "pass";
          else if (test.repeats && retry === retryCount)
            test.result.state = "pass";
        }
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
      if (test.pending || ((_e = test.result) == null ? void 0 : _e.state) === "skip") {
        test.mode = "skip";
        test.result = { state: "skip" };
        updateTask(test, runner);
        setCurrentTest(void 0);
        return;
      }
      try {
        await callSuiteHook(test.suite, test, "afterEach", runner, [test.context, test.suite]);
        await callCleanupHooks(beforeEachCleanups);
        await callFixtureCleanup(test.context);
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
      if (test.result.state === "pass")
        break;
      if (retryCount < retry) {
        test.result.state = "run";
        test.result.retryCount = (test.result.retryCount ?? 0) + 1;
      }
      updateTask(test, runner);
    }
  }
  try {
    await callTaskHooks(test, test.onFinished || [], "stack");
  } catch (e) {
    failTask(test.result, e, runner.config.diffOptions);
  }
  if (test.result.state === "fail") {
    try {
      await callTaskHooks(test, test.onFailed || [], runner.config.sequence.hooks);
    } catch (e) {
      failTask(test.result, e, runner.config.diffOptions);
    }
  }
  if (test.fails) {
    if (test.result.state === "pass") {
      const error = processError(new Error("Expect test to fail"));
      test.result.state = "fail";
      test.result.errors = [error];
    } else {
      test.result.state = "pass";
      test.result.errors = void 0;
    }
  }
  setCurrentTest(void 0);
  test.result.duration = now() - start;
  await ((_f = runner.onAfterRunTask) == null ? void 0 : _f.call(runner, test));
  updateTask(test, runner);
}
function failTask(result, err, diffOptions) {
  if (err instanceof PendingError) {
    result.state = "skip";
    return;
  }
  result.state = "fail";
  const errors = Array.isArray(err) ? err : [err];
  for (const e of errors) {
    const error = processError(e, diffOptions);
    result.errors ?? (result.errors = []);
    result.errors.push(error);
  }
}
function markTasksAsSkipped(suite, runner) {
  suite.tasks.forEach((t) => {
    t.mode = "skip";
    t.result = { ...t.result, state: "skip" };
    updateTask(t, runner);
    if (t.type === "suite")
      markTasksAsSkipped(t, runner);
  });
}
async function runSuite(suite, runner) {
  var _a, _b, _c, _d;
  await ((_a = runner.onBeforeRunSuite) == null ? void 0 : _a.call(runner, suite));
  if (((_b = suite.result) == null ? void 0 : _b.state) === "fail") {
    markTasksAsSkipped(suite, runner);
    updateTask(suite, runner);
    return;
  }
  const start = now();
  suite.result = {
    state: "run",
    startTime: start
  };
  updateTask(suite, runner);
  let beforeAllCleanups = [];
  if (suite.mode === "skip") {
    suite.result.state = "skip";
  } else if (suite.mode === "todo") {
    suite.result.state = "todo";
  } else {
    try {
      beforeAllCleanups = await callSuiteHook(suite, suite, "beforeAll", runner, [suite]);
      if (runner.runSuite) {
        await runner.runSuite(suite);
      } else {
        for (let tasksGroup of partitionSuiteChildren(suite)) {
          if (tasksGroup[0].concurrent === true) {
            const mutex = limit(runner.config.maxConcurrency);
            await Promise.all(tasksGroup.map((c) => mutex(() => runSuiteChild(c, runner))));
          } else {
            const { sequence } = runner.config;
            if (sequence.shuffle || suite.shuffle) {
              const suites = tasksGroup.filter((group) => group.type === "suite");
              const tests = tasksGroup.filter((group) => group.type === "test");
              const groups = shuffle([suites, tests], sequence.seed);
              tasksGroup = groups.flatMap((group) => shuffle(group, sequence.seed));
            }
            for (const c of tasksGroup)
              await runSuiteChild(c, runner);
          }
        }
      }
    } catch (e) {
      failTask(suite.result, e, runner.config.diffOptions);
    }
    try {
      await callSuiteHook(suite, suite, "afterAll", runner, [suite]);
      await callCleanupHooks(beforeAllCleanups);
    } catch (e) {
      failTask(suite.result, e, runner.config.diffOptions);
    }
    if (suite.mode === "run") {
      if (!runner.config.passWithNoTests && !hasTests(suite)) {
        suite.result.state = "fail";
        if (!((_c = suite.result.errors) == null ? void 0 : _c.length)) {
          const error = processError(new Error(`No test found in suite ${suite.name}`));
          suite.result.errors = [error];
        }
      } else if (hasFailed(suite)) {
        suite.result.state = "fail";
      } else {
        suite.result.state = "pass";
      }
    }
    updateTask(suite, runner);
    suite.result.duration = now() - start;
    await ((_d = runner.onAfterRunSuite) == null ? void 0 : _d.call(runner, suite));
  }
}
async function runSuiteChild(c, runner) {
  if (c.type === "test" || c.type === "custom")
    return runTest(c, runner);
  else if (c.type === "suite")
    return runSuite(c, runner);
}
async function runFiles(files, runner) {
  var _a, _b;
  for (const file of files) {
    if (!file.tasks.length && !runner.config.passWithNoTests) {
      if (!((_b = (_a = file.result) == null ? void 0 : _a.errors) == null ? void 0 : _b.length)) {
        const error = processError(new Error(`No test suite found in file ${file.filepath}`));
        file.result = {
          state: "fail",
          errors: [error]
        };
      }
    }
    await runSuite(file, runner);
  }
}
async function startTests(paths, runner) {
  var _a, _b, _c, _d;
  await ((_a = runner.onBeforeCollect) == null ? void 0 : _a.call(runner, paths));
  const files = await collectTests(paths, runner);
  await ((_b = runner.onCollected) == null ? void 0 : _b.call(runner, files));
  await ((_c = runner.onBeforeRunFiles) == null ? void 0 : _c.call(runner, files));
  await runFiles(files, runner);
  await ((_d = runner.onAfterRunFiles) == null ? void 0 : _d.call(runner, files));
  await sendTasksUpdate(runner);
  return files;
}

function getDefaultHookTimeout() {
  return getRunner().config.hookTimeout;
}
function beforeAll(fn, timeout) {
  return getCurrentSuite().on("beforeAll", withTimeout(fn, timeout ?? getDefaultHookTimeout(), true));
}
function afterAll(fn, timeout) {
  return getCurrentSuite().on("afterAll", withTimeout(fn, timeout ?? getDefaultHookTimeout(), true));
}
function beforeEach(fn, timeout) {
  return getCurrentSuite().on("beforeEach", withTimeout(withFixtures(fn), timeout ?? getDefaultHookTimeout(), true));
}
function afterEach(fn, timeout) {
  return getCurrentSuite().on("afterEach", withTimeout(withFixtures(fn), timeout ?? getDefaultHookTimeout(), true));
}
const onTestFailed = createTestHook("onTestFailed", (test, handler) => {
  test.onFailed || (test.onFailed = []);
  test.onFailed.push(handler);
});
const onTestFinished = createTestHook("onTestFinished", (test, handler) => {
  test.onFinished || (test.onFinished = []);
  test.onFinished.push(handler);
});
function createTestHook(name, handler) {
  return (fn) => {
    const current = getCurrentTest();
    if (!current)
      throw new Error(`Hook ${name}() can only be called inside a test`);
    return handler(current, fn);
  };
}

export { afterAll, afterEach, beforeAll, beforeEach, createTaskCollector, describe, getCurrentSuite, getCurrentTest, getFn, getHooks, it, onTestFailed, onTestFinished, setFn, setHooks, startTests, suite, test, updateTask };
