import vm, { isContext } from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, basename, extname, normalize, join, resolve } from 'pathe';
import { createCustomConsole } from '../chunks/runtime-console.EO5ha7qv.js';
import { g as getDefaultRequestStubs, s as startVitestExecutor } from './execute.fL3szUAI.js';
import { distDir } from '../path.js';
import { dirname as dirname$1 } from 'node:path';
import { statSync, existsSync, readFileSync } from 'node:fs';
import { isNodeBuiltin, isPrimitive, toArray, getCachedData, setCacheData } from 'vite-node/utils';
import { createRequire, Module } from 'node:module';
import { CSS_LANGS_RE, KNOWN_ASSET_RE } from 'vite-node/constants';
import '@vitest/runner/utils';
import '@vitest/utils';
import { p as provideWorkerState } from './global.CkGT_TMy.js';
import './env.AtSIuHFg.js';

const _require = createRequire(import.meta.url);
const requiresCache = /* @__PURE__ */ new WeakMap();
class CommonjsExecutor {
  context;
  requireCache = /* @__PURE__ */ new Map();
  publicRequireCache = this.createProxyCache();
  moduleCache = /* @__PURE__ */ new Map();
  builtinCache = /* @__PURE__ */ Object.create(null);
  extensions = /* @__PURE__ */ Object.create(null);
  fs;
  Module;
  constructor(options) {
    this.context = options.context;
    this.fs = options.fileMap;
    const primitives = vm.runInContext("({ Object, Array, Error })", this.context);
    const executor = this;
    this.Module = class Module$1 {
      exports;
      isPreloading = false;
      id;
      filename;
      loaded;
      parent;
      children = [];
      path;
      paths = [];
      constructor(id = "", parent) {
        this.exports = primitives.Object.create(Object.prototype);
        this.path = dirname(id);
        this.id = id;
        this.filename = id;
        this.loaded = false;
        this.parent = parent;
      }
      get require() {
        const require = requiresCache.get(this);
        if (require)
          return require;
        const _require2 = Module$1.createRequire(this.id);
        requiresCache.set(this, _require2);
        return _require2;
      }
      static register = () => {
        throw new Error(`[vitest] "register" is not available when running in Vitest.`);
      };
      _compile(code, filename) {
        const cjsModule = Module$1.wrap(code);
        const script = new vm.Script(cjsModule, {
          filename,
          importModuleDynamically: options.importModuleDynamically
        });
        script.identifier = filename;
        const fn = script.runInContext(executor.context);
        const __dirname = dirname(filename);
        executor.requireCache.set(filename, this);
        try {
          fn(this.exports, this.require, this, filename, __dirname);
          return this.exports;
        } finally {
          this.loaded = true;
        }
      }
      // exposed for external use, Node.js does the opposite
      static _load = (request, parent, _isMain) => {
        const require = Module$1.createRequire((parent == null ? void 0 : parent.filename) ?? request);
        return require(request);
      };
      static wrap = (script) => {
        return Module$1.wrapper[0] + script + Module$1.wrapper[1];
      };
      static wrapper = new primitives.Array(
        "(function (exports, require, module, __filename, __dirname) { ",
        "\n});"
      );
      static builtinModules = Module.builtinModules;
      static findSourceMap = Module.findSourceMap;
      static SourceMap = Module.SourceMap;
      static syncBuiltinESMExports = Module.syncBuiltinESMExports;
      static _cache = executor.moduleCache;
      static _extensions = executor.extensions;
      static createRequire = (filename) => {
        return executor.createRequire(filename);
      };
      static runMain = () => {
        throw new primitives.Error('[vitest] "runMain" is not implemented.');
      };
      // @ts-expect-error not typed
      static _resolveFilename = Module._resolveFilename;
      // @ts-expect-error not typed
      static _findPath = Module._findPath;
      // @ts-expect-error not typed
      static _initPaths = Module._initPaths;
      // @ts-expect-error not typed
      static _preloadModules = Module._preloadModules;
      // @ts-expect-error not typed
      static _resolveLookupPaths = Module._resolveLookupPaths;
      // @ts-expect-error not typed
      static globalPaths = Module.globalPaths;
      static isBuiltin = Module.isBuiltin;
      static Module = Module$1;
    };
    this.extensions[".js"] = this.requireJs;
    this.extensions[".json"] = this.requireJson;
  }
  requireJs = (m, filename) => {
    const content = this.fs.readFile(filename);
    m._compile(content, filename);
  };
  requireJson = (m, filename) => {
    const code = this.fs.readFile(filename);
    m.exports = JSON.parse(code);
  };
  createRequire = (filename) => {
    const _require2 = createRequire(filename);
    const require = (id) => {
      const resolved = _require2.resolve(id);
      const ext = extname(resolved);
      if (ext === ".node" || isNodeBuiltin(resolved))
        return this.requireCoreModule(resolved);
      const module = new this.Module(resolved);
      return this.loadCommonJSModule(module, resolved);
    };
    require.resolve = _require2.resolve;
    Object.defineProperty(require, "extensions", {
      get: () => this.extensions,
      set: () => {
      },
      configurable: true
    });
    require.main = void 0;
    require.cache = this.publicRequireCache;
    return require;
  };
  createProxyCache() {
    return new Proxy(/* @__PURE__ */ Object.create(null), {
      defineProperty: () => true,
      deleteProperty: () => true,
      set: () => true,
      get: (_, key) => this.requireCache.get(key),
      has: (_, key) => this.requireCache.has(key),
      ownKeys: () => Array.from(this.requireCache.keys()),
      getOwnPropertyDescriptor() {
        return {
          configurable: true,
          enumerable: true
        };
      }
    });
  }
  // very naive implementation for Node.js require
  loadCommonJSModule(module, filename) {
    const cached = this.requireCache.get(filename);
    if (cached)
      return cached.exports;
    const extension = this.findLongestRegisteredExtension(filename);
    const loader = this.extensions[extension] || this.extensions[".js"];
    loader(module, filename);
    return module.exports;
  }
  findLongestRegisteredExtension(filename) {
    const name = basename(filename);
    let currentExtension;
    let index;
    let startIndex = 0;
    while ((index = name.indexOf(".", startIndex)) !== -1) {
      startIndex = index + 1;
      if (index === 0)
        continue;
      currentExtension = name.slice(index);
      if (this.extensions[currentExtension])
        return currentExtension;
    }
    return ".js";
  }
  require(identifier) {
    const ext = extname(identifier);
    if (ext === ".node" || isNodeBuiltin(identifier))
      return this.requireCoreModule(identifier);
    const module = new this.Module(identifier);
    return this.loadCommonJSModule(module, identifier);
  }
  requireCoreModule(identifier) {
    const normalized = identifier.replace(/^node:/, "");
    if (this.builtinCache[normalized])
      return this.builtinCache[normalized].exports;
    const moduleExports = _require(identifier);
    if (identifier === "node:module" || identifier === "module") {
      const module = new this.Module("/module.js");
      module.exports = this.Module;
      this.builtinCache[normalized] = module;
      return module.exports;
    }
    this.builtinCache[normalized] = _require.cache[normalized];
    return moduleExports;
  }
}

function interopCommonJsModule(interopDefault, mod) {
  if (isPrimitive(mod) || Array.isArray(mod) || mod instanceof Promise) {
    return {
      keys: [],
      moduleExports: {},
      defaultExport: mod
    };
  }
  if (interopDefault !== false && "__esModule" in mod && !isPrimitive(mod.default)) {
    const defaultKets = Object.keys(mod.default);
    const moduleKeys = Object.keys(mod);
    const allKeys = /* @__PURE__ */ new Set([...defaultKets, ...moduleKeys]);
    allKeys.delete("default");
    return {
      keys: Array.from(allKeys),
      moduleExports: new Proxy(mod, {
        get(mod2, prop) {
          var _a;
          return mod2[prop] ?? ((_a = mod2.default) == null ? void 0 : _a[prop]);
        }
      }),
      defaultExport: mod
    };
  }
  return {
    keys: Object.keys(mod).filter((key) => key !== "default"),
    moduleExports: mod,
    defaultExport: mod
  };
}
const SyntheticModule$1 = vm.SyntheticModule;
const SourceTextModule = vm.SourceTextModule;

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck$1 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet$1 = (obj, member, getter) => {
  __accessCheck$1(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd$1 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var _httpIp;
const dataURIRegex = /^data:(?<mime>text\/javascript|application\/json|application\/wasm)(?:;(?<encoding>charset=utf-8|base64))?,(?<code>.*)$/;
class EsmExecutor {
  constructor(executor, options) {
    this.executor = executor;
    __publicField$1(this, "moduleCache", /* @__PURE__ */ new Map());
    __publicField$1(this, "esmLinkMap", /* @__PURE__ */ new WeakMap());
    __publicField$1(this, "context");
    __privateAdd$1(this, _httpIp, IPnumber("127.0.0.0"));
    this.context = options.context;
  }
  async evaluateModule(m) {
    if (m.status === "unlinked") {
      this.esmLinkMap.set(
        m,
        m.link((identifier, referencer) => this.executor.resolveModule(identifier, referencer.identifier))
      );
    }
    await this.esmLinkMap.get(m);
    if (m.status === "linked")
      await m.evaluate();
    return m;
  }
  async createEsModule(fileUrl, getCode) {
    const cached = this.moduleCache.get(fileUrl);
    if (cached)
      return cached;
    const code = await getCode();
    if (fileUrl.endsWith(".json")) {
      const m2 = new SyntheticModule$1(
        ["default"],
        () => {
          const result = JSON.parse(code);
          m2.setExport("default", result);
        }
      );
      this.moduleCache.set(fileUrl, m2);
      return m2;
    }
    const m = new SourceTextModule(
      code,
      {
        identifier: fileUrl,
        context: this.context,
        importModuleDynamically: this.executor.importModuleDynamically,
        initializeImportMeta: (meta, mod) => {
          meta.url = mod.identifier;
          if (mod.identifier.startsWith("file:")) {
            const filename = fileURLToPath(mod.identifier);
            meta.filename = filename;
            meta.dirname = dirname$1(filename);
          }
          meta.resolve = (specifier, importer) => {
            return this.executor.resolve(specifier, importer != null ? importer.toString() : mod.identifier);
          };
        }
      }
    );
    this.moduleCache.set(fileUrl, m);
    return m;
  }
  async createWebAssemblyModule(fileUrl, getCode) {
    const cached = this.moduleCache.get(fileUrl);
    if (cached)
      return cached;
    const m = this.loadWebAssemblyModule(getCode(), fileUrl);
    this.moduleCache.set(fileUrl, m);
    return m;
  }
  async createNetworkModule(fileUrl) {
    if (fileUrl.startsWith("http:")) {
      const url = new URL(fileUrl);
      if (url.hostname !== "localhost" && url.hostname !== "::1" && (IPnumber(url.hostname) & IPmask(8)) !== __privateGet$1(this, _httpIp)) {
        throw new Error(
          // we don't know the importer, so it's undefined (the same happens in --pool=threads)
          `import of '${fileUrl}' by undefined is not supported: http can only be used to load local resources (use https instead).`
        );
      }
    }
    return this.createEsModule(fileUrl, () => fetch(fileUrl).then((r) => r.text()));
  }
  async loadWebAssemblyModule(source, identifier) {
    const cached = this.moduleCache.get(identifier);
    if (cached)
      return cached;
    const wasmModule = await WebAssembly.compile(source);
    const exports = WebAssembly.Module.exports(wasmModule);
    const imports = WebAssembly.Module.imports(wasmModule);
    const moduleLookup = {};
    for (const { module } of imports) {
      if (moduleLookup[module] === void 0) {
        moduleLookup[module] = await this.executor.resolveModule(
          module,
          identifier
        );
      }
    }
    const syntheticModule = new SyntheticModule$1(
      exports.map(({ name }) => name),
      async () => {
        const importsObject = {};
        for (const { module, name } of imports) {
          if (!importsObject[module])
            importsObject[module] = {};
          await this.evaluateModule(moduleLookup[module]);
          importsObject[module][name] = moduleLookup[module].namespace[name];
        }
        const wasmInstance = new WebAssembly.Instance(
          wasmModule,
          importsObject
        );
        for (const { name } of exports)
          syntheticModule.setExport(name, wasmInstance.exports[name]);
      },
      { context: this.context, identifier }
    );
    return syntheticModule;
  }
  cacheModule(identifier, module) {
    this.moduleCache.set(identifier, module);
  }
  resolveCachedModule(identifier) {
    return this.moduleCache.get(identifier);
  }
  async createDataModule(identifier) {
    const cached = this.moduleCache.get(identifier);
    if (cached)
      return cached;
    const match = identifier.match(dataURIRegex);
    if (!match || !match.groups)
      throw new Error("Invalid data URI");
    const mime = match.groups.mime;
    const encoding = match.groups.encoding;
    if (mime === "application/wasm") {
      if (!encoding)
        throw new Error("Missing data URI encoding");
      if (encoding !== "base64")
        throw new Error(`Invalid data URI encoding: ${encoding}`);
      const module = this.loadWebAssemblyModule(
        Buffer.from(match.groups.code, "base64"),
        identifier
      );
      this.moduleCache.set(identifier, module);
      return module;
    }
    let code = match.groups.code;
    if (!encoding || encoding === "charset=utf-8")
      code = decodeURIComponent(code);
    else if (encoding === "base64")
      code = Buffer.from(code, "base64").toString();
    else
      throw new Error(`Invalid data URI encoding: ${encoding}`);
    if (mime === "application/json") {
      const module = new SyntheticModule$1(
        ["default"],
        () => {
          const obj = JSON.parse(code);
          module.setExport("default", obj);
        },
        { context: this.context, identifier }
      );
      this.moduleCache.set(identifier, module);
      return module;
    }
    return this.createEsModule(identifier, () => code);
  }
}
_httpIp = new WeakMap();
function IPnumber(address) {
  const ip = address.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ip)
    return (+ip[1] << 24) + (+ip[2] << 16) + (+ip[3] << 8) + +ip[4];
  throw new Error(`Expected IP address, received ${address}`);
}
function IPmask(maskSize) {
  return -1 << 32 - maskSize;
}

const CLIENT_ID = "/@vite/client";
const CLIENT_FILE = pathToFileURL(CLIENT_ID).href;
class ViteExecutor {
  constructor(options) {
    this.options = options;
    this.esm = options.esmExecutor;
  }
  esm;
  resolve = (identifier, parent) => {
    if (identifier === CLIENT_ID) {
      if (this.workerState.environment.transformMode === "web")
        return identifier;
      const packageName = this.getPackageName(parent);
      throw new Error(
        `[vitest] Vitest cannot handle ${CLIENT_ID} imported in ${parent} when running in SSR environment. Add "${packageName}" to "ssr.noExternal" if you are using Vite SSR, or to "server.deps.inline" if you are using Vite Node.`
      );
    }
  };
  get workerState() {
    return this.options.context.__vitest_worker__;
  }
  getPackageName(modulePath) {
    const path = normalize(modulePath);
    let name = path.split("/node_modules/").pop() || "";
    if (name == null ? void 0 : name.startsWith("@"))
      name = name.split("/").slice(0, 2).join("/");
    else
      name = name.split("/")[0];
    return name;
  }
  async createViteModule(fileUrl) {
    if (fileUrl === CLIENT_FILE)
      return this.createViteClientModule();
    const cached = this.esm.resolveCachedModule(fileUrl);
    if (cached)
      return cached;
    return this.esm.createEsModule(fileUrl, async () => {
      const result = await this.options.transform(fileUrl, "web");
      if (!result.code)
        throw new Error(`[vitest] Failed to transform ${fileUrl}. Does the file exist?`);
      return result.code;
    });
  }
  createViteClientModule() {
    const identifier = CLIENT_ID;
    const cached = this.esm.resolveCachedModule(identifier);
    if (cached)
      return cached;
    const stub = this.options.viteClientModule;
    const moduleKeys = Object.keys(stub);
    const module = new SyntheticModule$1(
      moduleKeys,
      () => {
        moduleKeys.forEach((key) => {
          module.setExport(key, stub[key]);
        });
      },
      { context: this.options.context, identifier }
    );
    this.esm.cacheModule(identifier, module);
    return module;
  }
  canResolve = (fileUrl) => {
    var _a;
    const transformMode = this.workerState.environment.transformMode;
    if (transformMode !== "web")
      return false;
    if (fileUrl === CLIENT_FILE)
      return true;
    const config = ((_a = this.workerState.config.deps) == null ? void 0 : _a.web) || {};
    const [modulePath] = fileUrl.split("?");
    if (config.transformCss && CSS_LANGS_RE.test(modulePath))
      return true;
    if (config.transformAssets && KNOWN_ASSET_RE.test(modulePath))
      return true;
    if (toArray(config.transformGlobPattern).some((pattern) => pattern.test(modulePath)))
      return true;
    return false;
  };
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _networkSupported;
const SyntheticModule = vm.SyntheticModule;
const nativeResolve = import.meta.resolve;
class ExternalModulesExecutor {
  constructor(options) {
    this.options = options;
    __publicField(this, "cjs");
    __publicField(this, "esm");
    __publicField(this, "vite");
    __publicField(this, "context");
    __publicField(this, "fs");
    __publicField(this, "resolvers", []);
    __privateAdd(this, _networkSupported, null);
    // dynamic import can be used in both ESM and CJS, so we have it in the executor
    __publicField(this, "importModuleDynamically", async (specifier, referencer) => {
      const module = await this.resolveModule(specifier, referencer.identifier);
      return this.esm.evaluateModule(module);
    });
    __publicField(this, "resolveModule", async (specifier, referencer) => {
      let identifier = this.resolve(specifier, referencer);
      if (identifier instanceof Promise)
        identifier = await identifier;
      return await this.createModule(identifier);
    });
    this.context = options.context;
    this.fs = options.fileMap;
    this.esm = new EsmExecutor(this, {
      context: this.context
    });
    this.cjs = new CommonjsExecutor({
      context: this.context,
      importModuleDynamically: this.importModuleDynamically,
      fileMap: options.fileMap
    });
    this.vite = new ViteExecutor({
      esmExecutor: this.esm,
      context: this.context,
      transform: options.transform,
      viteClientModule: options.viteClientModule
    });
    this.resolvers = [this.vite.resolve];
  }
  async import(identifier) {
    const module = await this.createModule(identifier);
    await this.esm.evaluateModule(module);
    return module.namespace;
  }
  require(identifier) {
    return this.cjs.require(identifier);
  }
  createRequire(identifier) {
    return this.cjs.createRequire(identifier);
  }
  resolve(specifier, parent) {
    for (const resolver of this.resolvers) {
      const id = resolver(specifier, parent);
      if (id)
        return id;
    }
    return nativeResolve(specifier, parent);
  }
  findNearestPackageData(basedir) {
    var _a;
    const originalBasedir = basedir;
    const packageCache = this.options.packageCache;
    while (basedir) {
      const cached = getCachedData(packageCache, basedir, originalBasedir);
      if (cached)
        return cached;
      const pkgPath = join(basedir, "package.json");
      try {
        if ((_a = statSync(pkgPath, { throwIfNoEntry: false })) == null ? void 0 : _a.isFile()) {
          const pkgData = JSON.parse(this.fs.readFile(pkgPath));
          if (packageCache)
            setCacheData(packageCache, pkgData, basedir, originalBasedir);
          return pkgData;
        }
      } catch {
      }
      const nextBasedir = dirname$1(basedir);
      if (nextBasedir === basedir)
        break;
      basedir = nextBasedir;
    }
    return {};
  }
  wrapCoreSynteticModule(identifier, exports) {
    const moduleKeys = Object.keys(exports);
    const m = new SyntheticModule(
      [...moduleKeys, "default"],
      () => {
        for (const key of moduleKeys)
          m.setExport(key, exports[key]);
        m.setExport("default", exports);
      },
      {
        context: this.context,
        identifier
      }
    );
    return m;
  }
  wrapCommonJsSynteticModule(identifier, exports) {
    const { keys, moduleExports, defaultExport } = interopCommonJsModule(this.options.interopDefault, exports);
    const m = new SyntheticModule(
      [...keys, "default"],
      () => {
        for (const key of keys)
          m.setExport(key, moduleExports[key]);
        m.setExport("default", defaultExport);
      },
      {
        context: this.context,
        identifier
      }
    );
    return m;
  }
  getModuleInformation(identifier) {
    if (identifier.startsWith("data:"))
      return { type: "data", url: identifier, path: identifier };
    const extension = extname(identifier);
    if (extension === ".node" || isNodeBuiltin(identifier))
      return { type: "builtin", url: identifier, path: identifier };
    if (this.isNetworkSupported && (identifier.startsWith("http:") || identifier.startsWith("https:")))
      return { type: "network", url: identifier, path: identifier };
    const isFileUrl = identifier.startsWith("file://");
    const pathUrl = isFileUrl ? fileURLToPath(identifier.split("?")[0]) : identifier;
    const fileUrl = isFileUrl ? identifier : pathToFileURL(pathUrl).toString();
    let type;
    if (this.vite.canResolve(fileUrl)) {
      type = "vite";
    } else if (extension === ".mjs") {
      type = "module";
    } else if (extension === ".cjs") {
      type = "commonjs";
    } else if (extension === ".wasm") {
      type = "wasm";
    } else {
      const pkgData = this.findNearestPackageData(normalize(pathUrl));
      type = pkgData.type === "module" ? "module" : "commonjs";
    }
    return { type, path: pathUrl, url: fileUrl };
  }
  async createModule(identifier) {
    const { type, url, path } = this.getModuleInformation(identifier);
    if ((type === "module" || type === "commonjs" || type === "wasm") && !existsSync(path)) {
      const error = new Error(`Cannot find module '${path}'`);
      error.code = "ERR_MODULE_NOT_FOUND";
      throw error;
    }
    switch (type) {
      case "data":
        return this.esm.createDataModule(identifier);
      case "builtin": {
        const exports = this.require(identifier);
        return this.wrapCoreSynteticModule(identifier, exports);
      }
      case "vite":
        return await this.vite.createViteModule(url);
      case "wasm":
        return await this.esm.createWebAssemblyModule(url, () => this.fs.readBuffer(path));
      case "module":
        return await this.esm.createEsModule(url, () => this.fs.readFile(path));
      case "commonjs": {
        const exports = this.require(path);
        return this.wrapCommonJsSynteticModule(identifier, exports);
      }
      case "network": {
        return this.esm.createNetworkModule(url);
      }
      default: {
        const _deadend = type;
        return _deadend;
      }
    }
  }
  get isNetworkSupported() {
    var _a;
    if (__privateGet(this, _networkSupported) == null) {
      if (process.execArgv.includes("--experimental-network-imports"))
        __privateSet(this, _networkSupported, true);
      else if ((_a = process.env.NODE_OPTIONS) == null ? void 0 : _a.includes("--experimental-network-imports"))
        __privateSet(this, _networkSupported, true);
      else
        __privateSet(this, _networkSupported, false);
    }
    return __privateGet(this, _networkSupported);
  }
}
_networkSupported = new WeakMap();

class FileMap {
  fsCache = /* @__PURE__ */ new Map();
  fsBufferCache = /* @__PURE__ */ new Map();
  readFile(path) {
    const cached = this.fsCache.get(path);
    if (cached)
      return cached;
    const source = readFileSync(path, "utf-8");
    this.fsCache.set(path, source);
    return source;
  }
  readBuffer(path) {
    const cached = this.fsBufferCache.get(path);
    if (cached)
      return cached;
    const buffer = readFileSync(path);
    this.fsBufferCache.set(path, buffer);
    return buffer;
  }
}

const entryFile = pathToFileURL(resolve(distDir, "workers/runVmTests.js")).href;
const fileMap = new FileMap();
const packageCache = /* @__PURE__ */ new Map();
async function runVmTests(state) {
  var _a;
  const { environment, ctx, rpc } = state;
  if (!environment.setupVM) {
    const envName = ctx.environment.name;
    const packageId = envName[0] === "." ? envName : `vitest-environment-${envName}`;
    throw new TypeError(
      `Environment "${ctx.environment.name}" is not a valid environment. Path "${packageId}" doesn't support vm environment because it doesn't provide "setupVM" method.`
    );
  }
  const vm = await environment.setupVM(ctx.environment.options || ctx.config.environmentOptions || {});
  state.durations.environment = performance.now() - state.durations.environment;
  process.env.VITEST_VM_POOL = "1";
  if (!vm.getVmContext)
    throw new TypeError(`Environment ${environment.name} doesn't provide "getVmContext" method. It should return a context created by "vm.createContext" method.`);
  const context = vm.getVmContext();
  if (!isContext(context))
    throw new TypeError(`Environment ${environment.name} doesn't provide a valid context. It should be created by "vm.createContext" method.`);
  provideWorkerState(context, state);
  context.process = process;
  context.global = context;
  context.console = state.config.disableConsoleIntercept ? console : createCustomConsole();
  context.setImmediate = setImmediate;
  context.clearImmediate = clearImmediate;
  const stubs = getDefaultRequestStubs(context);
  const externalModulesExecutor = new ExternalModulesExecutor({
    context,
    fileMap,
    packageCache,
    transform: rpc.transform,
    viteClientModule: stubs["/@vite/client"]
  });
  const executor = await startVitestExecutor({
    context,
    moduleCache: state.moduleCache,
    mockMap: state.mockMap,
    state,
    externalModulesExecutor,
    requestStubs: stubs
  });
  context.__vitest_mocker__ = executor.mocker;
  const { run } = await executor.importExternalModule(entryFile);
  try {
    await run(ctx.files, ctx.config, executor);
  } finally {
    await ((_a = vm.teardown) == null ? void 0 : _a.call(vm));
    state.environmentTeardownRun = true;
  }
}

export { runVmTests as r };
