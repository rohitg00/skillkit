import { createRequire } from 'node:module';

const __require = createRequire(import.meta.url);
let inspector;
let session;
function setupInspect(ctx) {
  const config = ctx.config;
  const isEnabled = config.inspector.enabled;
  if (isEnabled) {
    inspector = __require("node:inspector");
    const isOpen = inspector.url() !== void 0;
    if (!isOpen) {
      inspector.open(
        config.inspector.port,
        config.inspector.host,
        config.inspector.waitForDebugger
      );
      if (config.inspectBrk) {
        const firstTestFile = ctx.files[0];
        if (firstTestFile) {
          session = new inspector.Session();
          session.connect();
          session.post("Debugger.enable");
          session.post("Debugger.setBreakpointByUrl", {
            lineNumber: 0,
            url: new URL(firstTestFile, import.meta.url).href
          });
        }
      }
    }
  }
  const keepOpen = shouldKeepOpen(config);
  return function cleanup() {
    if (isEnabled && !keepOpen && inspector) {
      inspector.close();
      session == null ? void 0 : session.disconnect();
    }
  };
}
function closeInspector(config) {
  const keepOpen = shouldKeepOpen(config);
  if (inspector && !keepOpen) {
    inspector.close();
    session == null ? void 0 : session.disconnect();
  }
}
function shouldKeepOpen(config) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const isIsolatedSingleThread = config.pool === "threads" && ((_b = (_a = config.poolOptions) == null ? void 0 : _a.threads) == null ? void 0 : _b.isolate) === false && ((_d = (_c = config.poolOptions) == null ? void 0 : _c.threads) == null ? void 0 : _d.singleThread);
  const isIsolatedSingleFork = config.pool === "forks" && ((_f = (_e = config.poolOptions) == null ? void 0 : _e.forks) == null ? void 0 : _f.isolate) === false && ((_h = (_g = config.poolOptions) == null ? void 0 : _g.forks) == null ? void 0 : _h.singleFork);
  return config.watch && (isIsolatedSingleFork || isIsolatedSingleThread);
}

export { closeInspector as c, setupInspect as s };
