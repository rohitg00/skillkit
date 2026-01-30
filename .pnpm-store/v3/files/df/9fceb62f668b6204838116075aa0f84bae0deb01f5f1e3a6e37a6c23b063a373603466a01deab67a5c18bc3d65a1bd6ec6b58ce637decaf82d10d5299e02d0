import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { ViteNodeRunner, DEFAULT_REQUEST_STUBS } from 'vite-node/client';
import { isNodeBuiltin, isInternalRequest, toFilePath, isPrimitive } from 'vite-node/utils';
import { resolve, isAbsolute, dirname, join, basename, extname, normalize, relative } from 'pathe';
import { processError } from '@vitest/utils/error';
import { distDir } from '../path.js';
import { highlight, getType } from '@vitest/utils';
import { g as getAllMockableProperties } from './base.5NT-gWu5.js';

const spyModulePath = resolve(distDir, "spy.js");
class RefTracker {
  idMap = /* @__PURE__ */ new Map();
  mockedValueMap = /* @__PURE__ */ new Map();
  getId(value) {
    return this.idMap.get(value);
  }
  getMockedValue(id) {
    return this.mockedValueMap.get(id);
  }
  track(originalValue, mockedValue) {
    const newId = this.idMap.size;
    this.idMap.set(originalValue, newId);
    this.mockedValueMap.set(newId, mockedValue);
    return newId;
  }
}
function isSpecialProp(prop, parentType) {
  return parentType.includes("Function") && typeof prop === "string" && ["arguments", "callee", "caller", "length", "name"].includes(prop);
}
class VitestMocker {
  constructor(executor) {
    this.executor = executor;
    const context = this.executor.options.context;
    if (context)
      this.primitives = vm.runInContext("({ Object, Error, Function, RegExp, Symbol, Array, Map })", context);
    else
      this.primitives = { Object, Error, Function, RegExp, Symbol: globalThis.Symbol, Array, Map };
    const Symbol2 = this.primitives.Symbol;
    this.filterPublicKeys = ["__esModule", Symbol2.asyncIterator, Symbol2.hasInstance, Symbol2.isConcatSpreadable, Symbol2.iterator, Symbol2.match, Symbol2.matchAll, Symbol2.replace, Symbol2.search, Symbol2.split, Symbol2.species, Symbol2.toPrimitive, Symbol2.toStringTag, Symbol2.unscopables];
  }
  static pendingIds = [];
  spyModule;
  resolveCache = /* @__PURE__ */ new Map();
  primitives;
  filterPublicKeys;
  mockContext = {
    callstack: null
  };
  get root() {
    return this.executor.options.root;
  }
  get mockMap() {
    return this.executor.options.mockMap;
  }
  get moduleCache() {
    return this.executor.moduleCache;
  }
  get moduleDirectories() {
    return this.executor.options.moduleDirectories || [];
  }
  async initializeSpyModule() {
    this.spyModule = await this.executor.executeId(spyModulePath);
  }
  deleteCachedItem(id) {
    const mockId = this.getMockPath(id);
    if (this.moduleCache.has(mockId))
      this.moduleCache.delete(mockId);
  }
  isAModuleDirectory(path) {
    return this.moduleDirectories.some((dir) => path.includes(dir));
  }
  getSuiteFilepath() {
    return this.executor.state.filepath || "global";
  }
  createError(message, codeFrame) {
    const Error2 = this.primitives.Error;
    const error = new Error2(message);
    Object.assign(error, { codeFrame });
    return error;
  }
  getMocks() {
    const suite = this.getSuiteFilepath();
    const suiteMocks = this.mockMap.get(suite);
    const globalMocks = this.mockMap.get("global");
    return {
      ...globalMocks,
      ...suiteMocks
    };
  }
  async resolvePath(rawId, importer) {
    let id;
    let fsPath;
    try {
      [id, fsPath] = await this.executor.originalResolveUrl(rawId, importer);
    } catch (error) {
      if (error.code === "ERR_MODULE_NOT_FOUND") {
        const { id: unresolvedId } = error[Symbol.for("vitest.error.not_found.data")];
        id = unresolvedId;
        fsPath = unresolvedId;
      } else {
        throw error;
      }
    }
    const external = !isAbsolute(fsPath) || this.isAModuleDirectory(fsPath) ? rawId : null;
    return {
      id,
      fsPath,
      external
    };
  }
  async resolveMocks() {
    if (!VitestMocker.pendingIds.length)
      return;
    await Promise.all(VitestMocker.pendingIds.map(async (mock) => {
      const { fsPath, external } = await this.resolvePath(mock.id, mock.importer);
      if (mock.type === "unmock")
        this.unmockPath(fsPath);
      if (mock.type === "mock")
        this.mockPath(mock.id, fsPath, external, mock.factory);
    }));
    VitestMocker.pendingIds = [];
  }
  async callFunctionMock(dep, mock) {
    var _a, _b;
    const cached = (_a = this.moduleCache.get(dep)) == null ? void 0 : _a.exports;
    if (cached)
      return cached;
    let exports;
    try {
      exports = await mock();
    } catch (err) {
      const vitestError = this.createError(
        '[vitest] There was an error when mocking a module. If you are using "vi.mock" factory, make sure there are no top level variables inside, since this call is hoisted to top of the file. Read more: https://vitest.dev/api/vi.html#vi-mock'
      );
      vitestError.cause = err;
      throw vitestError;
    }
    const filepath = dep.slice(5);
    const mockpath = ((_b = this.resolveCache.get(this.getSuiteFilepath())) == null ? void 0 : _b[filepath]) || filepath;
    if (exports === null || typeof exports !== "object")
      throw this.createError(`[vitest] vi.mock("${mockpath}", factory?: () => unknown) is not returning an object. Did you mean to return an object with a "default" key?`);
    const moduleExports = new Proxy(exports, {
      get: (target, prop) => {
        const val = target[prop];
        if (prop === "then") {
          if (target instanceof Promise)
            return target.then.bind(target);
        } else if (!(prop in target)) {
          if (this.filterPublicKeys.includes(prop))
            return void 0;
          throw this.createError(
            `[vitest] No "${String(prop)}" export is defined on the "${mockpath}" mock. Did you forget to return it from "vi.mock"?
If you need to partially mock a module, you can use "importOriginal" helper inside:
`,
            highlight(`vi.mock("${mockpath}", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // your mocked methods
  }
})`)
          );
        }
        return val;
      }
    });
    this.moduleCache.set(dep, { exports: moduleExports });
    return moduleExports;
  }
  getMockContext() {
    return this.mockContext;
  }
  getMockPath(dep) {
    return `mock:${dep}`;
  }
  getDependencyMock(id) {
    return this.getMocks()[id];
  }
  normalizePath(path) {
    return this.moduleCache.normalizePath(path);
  }
  resolveMockPath(mockPath, external) {
    const path = external || mockPath;
    if (external || isNodeBuiltin(mockPath) || !existsSync(mockPath)) {
      const mockDirname = dirname(path);
      const mockFolder = join(this.root, "__mocks__", mockDirname);
      if (!existsSync(mockFolder))
        return null;
      const files = readdirSync(mockFolder);
      const baseOriginal = basename(path);
      for (const file of files) {
        const baseFile = basename(file, extname(file));
        if (baseFile === baseOriginal)
          return resolve(mockFolder, file);
      }
      return null;
    }
    const dir = dirname(path);
    const baseId = basename(path);
    const fullPath = resolve(dir, "__mocks__", baseId);
    return existsSync(fullPath) ? fullPath : null;
  }
  mockObject(object, mockExports = {}) {
    const finalizers = new Array();
    const refs = new RefTracker();
    const define = (container, key, value) => {
      try {
        container[key] = value;
        return true;
      } catch {
        return false;
      }
    };
    const mockPropertiesOf = (container, newContainer) => {
      const containerType = getType(container);
      const isModule = containerType === "Module" || !!container.__esModule;
      for (const { key: property, descriptor } of getAllMockableProperties(container, isModule, this.primitives)) {
        if (!isModule && descriptor.get) {
          try {
            Object.defineProperty(newContainer, property, descriptor);
          } catch (error) {
          }
          continue;
        }
        if (isSpecialProp(property, containerType))
          continue;
        const value = container[property];
        const refId = refs.getId(value);
        if (refId !== void 0) {
          finalizers.push(() => define(newContainer, property, refs.getMockedValue(refId)));
          continue;
        }
        const type = getType(value);
        if (Array.isArray(value)) {
          define(newContainer, property, []);
          continue;
        }
        const isFunction = type.includes("Function") && typeof value === "function";
        if ((!isFunction || value.__isMockFunction) && type !== "Object" && type !== "Module") {
          define(newContainer, property, value);
          continue;
        }
        if (!define(newContainer, property, isFunction ? value : {}))
          continue;
        if (isFunction) {
          let mockFunction2 = function() {
            if (this instanceof newContainer[property]) {
              for (const { key, descriptor: descriptor2 } of getAllMockableProperties(this, false, primitives)) {
                if (descriptor2.get)
                  continue;
                const value2 = this[key];
                const type2 = getType(value2);
                const isFunction2 = type2.includes("Function") && typeof value2 === "function";
                if (isFunction2) {
                  const original = this[key];
                  const mock2 = spyModule.spyOn(this, key).mockImplementation(original);
                  mock2.mockRestore = () => {
                    mock2.mockReset();
                    mock2.mockImplementation(original);
                    return mock2;
                  };
                }
              }
            }
          };
          if (!this.spyModule)
            throw this.createError("[vitest] `spyModule` is not defined. This is Vitest error. Please open a new issue with reproduction.");
          const spyModule = this.spyModule;
          const primitives = this.primitives;
          const mock = spyModule.spyOn(newContainer, property).mockImplementation(mockFunction2);
          mock.mockRestore = () => {
            mock.mockReset();
            mock.mockImplementation(mockFunction2);
            return mock;
          };
          Object.defineProperty(newContainer[property], "length", { value: 0 });
        }
        refs.track(value, newContainer[property]);
        mockPropertiesOf(value, newContainer[property]);
      }
    };
    const mockedObject = mockExports;
    mockPropertiesOf(object, mockedObject);
    for (const finalizer of finalizers)
      finalizer();
    return mockedObject;
  }
  unmockPath(path) {
    const suitefile = this.getSuiteFilepath();
    const id = this.normalizePath(path);
    const mock = this.mockMap.get(suitefile);
    if (mock && id in mock)
      delete mock[id];
    this.deleteCachedItem(id);
  }
  mockPath(originalId, path, external, factory) {
    const id = this.normalizePath(path);
    const suitefile = this.getSuiteFilepath();
    const mocks = this.mockMap.get(suitefile) || {};
    const resolves = this.resolveCache.get(suitefile) || {};
    mocks[id] = factory || this.resolveMockPath(path, external);
    resolves[id] = originalId;
    this.mockMap.set(suitefile, mocks);
    this.resolveCache.set(suitefile, resolves);
    this.deleteCachedItem(id);
  }
  async importActual(rawId, importer, callstack) {
    const { id, fsPath } = await this.resolvePath(rawId, importer);
    const result = await this.executor.cachedRequest(id, fsPath, callstack || [importer]);
    return result;
  }
  async importMock(rawId, importee) {
    const { id, fsPath, external } = await this.resolvePath(rawId, importee);
    const normalizedId = this.normalizePath(fsPath);
    let mock = this.getDependencyMock(normalizedId);
    if (mock === void 0)
      mock = this.resolveMockPath(fsPath, external);
    if (mock === null) {
      const mod = await this.executor.cachedRequest(id, fsPath, [importee]);
      return this.mockObject(mod);
    }
    if (typeof mock === "function")
      return this.callFunctionMock(fsPath, mock);
    return this.executor.dependencyRequest(mock, mock, [importee]);
  }
  async requestWithMock(url, callstack) {
    const id = this.normalizePath(url);
    const mock = this.getDependencyMock(id);
    const mockPath = this.getMockPath(id);
    if (mock === null) {
      const cache = this.moduleCache.get(mockPath);
      if (cache.exports)
        return cache.exports;
      const exports = {};
      this.moduleCache.set(mockPath, { exports });
      const mod = await this.executor.directRequest(url, url, callstack);
      this.mockObject(mod, exports);
      return exports;
    }
    if (typeof mock === "function" && !callstack.includes(mockPath) && !callstack.includes(url)) {
      try {
        callstack.push(mockPath);
        this.mockContext.callstack = callstack;
        return await this.callFunctionMock(mockPath, mock);
      } finally {
        this.mockContext.callstack = null;
        const indexMock = callstack.indexOf(mockPath);
        callstack.splice(indexMock, 1);
      }
    }
    if (typeof mock === "string" && !callstack.includes(mock))
      return mock;
  }
  queueMock(id, importer, factory, throwIfCached = false) {
    VitestMocker.pendingIds.push({ type: "mock", id, importer, factory, throwIfCached });
  }
  queueUnmock(id, importer, throwIfCached = false) {
    VitestMocker.pendingIds.push({ type: "unmock", id, importer, throwIfCached });
  }
}

async function createVitestExecutor(options) {
  const runner = new VitestExecutor(options);
  await runner.executeId("/@vite/env");
  await runner.mocker.initializeSpyModule();
  return runner;
}
const externalizeMap = /* @__PURE__ */ new Map();
const bareVitestRegexp = /^@?vitest(\/|$)/;
const dispose = [];
function listenForErrors(state) {
  dispose.forEach((fn) => fn());
  dispose.length = 0;
  function catchError(err, type) {
    var _a;
    const worker = state();
    const error = processError(err);
    if (!isPrimitive(error)) {
      error.VITEST_TEST_NAME = (_a = worker.current) == null ? void 0 : _a.name;
      if (worker.filepath)
        error.VITEST_TEST_PATH = relative(state().config.root, worker.filepath);
      error.VITEST_AFTER_ENV_TEARDOWN = worker.environmentTeardownRun;
    }
    state().rpc.onUnhandledError(error, type);
  }
  const uncaughtException = (e) => catchError(e, "Uncaught Exception");
  const unhandledRejection = (e) => catchError(e, "Unhandled Rejection");
  process.on("uncaughtException", uncaughtException);
  process.on("unhandledRejection", unhandledRejection);
  dispose.push(() => {
    process.off("uncaughtException", uncaughtException);
    process.off("unhandledRejection", unhandledRejection);
  });
}
async function startVitestExecutor(options) {
  const state = () => globalThis.__vitest_worker__ || options.state;
  const rpc = () => state().rpc;
  process.exit = (code = process.exitCode || 0) => {
    throw new Error(`process.exit unexpectedly called with "${code}"`);
  };
  listenForErrors(state);
  const getTransformMode = () => {
    return state().environment.transformMode ?? "ssr";
  };
  return await createVitestExecutor({
    async fetchModule(id) {
      if (externalizeMap.has(id))
        return { externalize: externalizeMap.get(id) };
      if (id.includes(distDir)) {
        const { path } = toFilePath(id, state().config.root);
        const externalize = pathToFileURL(path).toString();
        externalizeMap.set(id, externalize);
        return { externalize };
      }
      if (bareVitestRegexp.test(id)) {
        externalizeMap.set(id, id);
        return { externalize: id };
      }
      const result = await rpc().fetch(id, getTransformMode());
      if (result.id && !result.externalize) {
        const code = readFileSync(result.id, "utf-8");
        return { code };
      }
      return result;
    },
    resolveId(id, importer) {
      return rpc().resolveId(id, importer, getTransformMode());
    },
    get moduleCache() {
      return state().moduleCache;
    },
    get mockMap() {
      return state().mockMap;
    },
    get interopDefault() {
      return state().config.deps.interopDefault;
    },
    get moduleDirectories() {
      return state().config.deps.moduleDirectories;
    },
    get root() {
      return state().config.root;
    },
    get base() {
      return state().config.base;
    },
    ...options
  });
}
function updateStyle(id, css) {
  if (typeof document === "undefined")
    return;
  const element = document.querySelector(`[data-vite-dev-id="${id}"]`);
  if (element) {
    element.textContent = css;
    return;
  }
  const head = document.querySelector("head");
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.setAttribute("data-vite-dev-id", id);
  style.textContent = css;
  head == null ? void 0 : head.appendChild(style);
}
function removeStyle(id) {
  if (typeof document === "undefined")
    return;
  const sheet = document.querySelector(`[data-vite-dev-id="${id}"]`);
  if (sheet)
    document.head.removeChild(sheet);
}
function getDefaultRequestStubs(context) {
  if (!context) {
    const clientStub2 = { ...DEFAULT_REQUEST_STUBS["@vite/client"], updateStyle, removeStyle };
    return {
      "/@vite/client": clientStub2,
      "@vite/client": clientStub2
    };
  }
  const clientStub = vm.runInContext(
    `(defaultClient) => ({ ...defaultClient, updateStyle: ${updateStyle.toString()}, removeStyle: ${removeStyle.toString()} })`,
    context
  )(DEFAULT_REQUEST_STUBS["@vite/client"]);
  return {
    "/@vite/client": clientStub,
    "@vite/client": clientStub
  };
}
class VitestExecutor extends ViteNodeRunner {
  constructor(options) {
    super({
      ...options,
      // interop is done inside the external executor instead
      interopDefault: options.context ? false : options.interopDefault
    });
    this.options = options;
    this.mocker = new VitestMocker(this);
    if (!options.context) {
      Object.defineProperty(globalThis, "__vitest_mocker__", {
        value: this.mocker,
        writable: true,
        configurable: true
      });
      this.primitives = { Object, Reflect, Symbol };
    } else if (options.externalModulesExecutor) {
      this.primitives = vm.runInContext("({ Object, Reflect, Symbol })", options.context);
      this.externalModules = options.externalModulesExecutor;
    } else {
      throw new Error("When context is provided, externalModulesExecutor must be provided as well.");
    }
  }
  mocker;
  externalModules;
  primitives;
  getContextPrimitives() {
    return this.primitives;
  }
  get state() {
    return globalThis.__vitest_worker__ || this.options.state;
  }
  shouldResolveId(id, _importee) {
    var _a;
    if (isInternalRequest(id) || id.startsWith("data:"))
      return false;
    const transformMode = ((_a = this.state.environment) == null ? void 0 : _a.transformMode) ?? "ssr";
    return transformMode === "ssr" ? !isNodeBuiltin(id) : !id.startsWith("node:");
  }
  async originalResolveUrl(id, importer) {
    return super.resolveUrl(id, importer);
  }
  async resolveUrl(id, importer) {
    if (VitestMocker.pendingIds.length)
      await this.mocker.resolveMocks();
    if (importer && importer.startsWith("mock:"))
      importer = importer.slice(5);
    try {
      return await super.resolveUrl(id, importer);
    } catch (error) {
      if (error.code === "ERR_MODULE_NOT_FOUND") {
        const { id: id2 } = error[Symbol.for("vitest.error.not_found.data")];
        const path = this.mocker.normalizePath(id2);
        const mock = this.mocker.getDependencyMock(path);
        if (mock !== void 0)
          return [id2, id2];
      }
      throw error;
    }
  }
  async runModule(context, transformed) {
    const vmContext = this.options.context;
    if (!vmContext || !this.externalModules)
      return super.runModule(context, transformed);
    const codeDefinition = `'use strict';async (${Object.keys(context).join(",")})=>{{`;
    const code = `${codeDefinition}${transformed}
}}`;
    const options = {
      filename: context.__filename,
      lineOffset: 0,
      columnOffset: -codeDefinition.length
    };
    const fn = vm.runInContext(code, vmContext, {
      ...options,
      // if we encountered an import, it's not inlined
      importModuleDynamically: this.externalModules.importModuleDynamically
    });
    await fn(...Object.values(context));
  }
  async importExternalModule(path) {
    if (this.externalModules)
      return this.externalModules.import(path);
    return super.importExternalModule(path);
  }
  async dependencyRequest(id, fsPath, callstack) {
    const mocked = await this.mocker.requestWithMock(fsPath, callstack);
    if (typeof mocked === "string")
      return super.dependencyRequest(mocked, mocked, callstack);
    if (mocked && typeof mocked === "object")
      return mocked;
    return super.dependencyRequest(id, fsPath, callstack);
  }
  prepareContext(context) {
    if (this.state.filepath && normalize(this.state.filepath) === normalize(context.__filename)) {
      const globalNamespace = this.options.context || globalThis;
      Object.defineProperty(context.__vite_ssr_import_meta__, "vitest", { get: () => globalNamespace.__vitest_index__ });
    }
    if (this.options.context && this.externalModules)
      context.require = this.externalModules.createRequire(context.__filename);
    return context;
  }
}

export { VitestExecutor as V, getDefaultRequestStubs as g, startVitestExecutor as s };
