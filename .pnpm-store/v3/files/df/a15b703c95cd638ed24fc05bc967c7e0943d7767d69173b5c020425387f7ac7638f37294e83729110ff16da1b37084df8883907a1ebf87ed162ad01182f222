import { parseRegexp } from '@vitest/utils';

var _a, _b;
const REGEXP_WRAP_PREFIX = "$$vitest:";
const processSend = (_a = process.send) == null ? void 0 : _a.bind(process);
const processOn = (_b = process.on) == null ? void 0 : _b.bind(process);
function createThreadsRpcOptions({ port }) {
  return {
    post: (v) => {
      port.postMessage(v);
    },
    on: (fn) => {
      port.addListener("message", fn);
    }
  };
}
function createForksRpcOptions(nodeV8) {
  return {
    serialize: nodeV8.serialize,
    deserialize: (v) => nodeV8.deserialize(Buffer.from(v)),
    post(v) {
      processSend(v);
    },
    on(fn) {
      processOn("message", (message, ...extras) => {
        if (message == null ? void 0 : message.__tinypool_worker_message__)
          return;
        return fn(message, ...extras);
      });
    }
  };
}
function unwrapSerializableConfig(config) {
  if (config.testNamePattern && typeof config.testNamePattern === "string") {
    const testNamePattern = config.testNamePattern;
    if (testNamePattern.startsWith(REGEXP_WRAP_PREFIX))
      config.testNamePattern = parseRegexp(testNamePattern.slice(REGEXP_WRAP_PREFIX.length));
  }
  if (config.defines && Array.isArray(config.defines.keys) && config.defines.original) {
    const { keys, original } = config.defines;
    const defines = {};
    for (const key of keys)
      defines[key] = original[key];
    config.defines = defines;
  }
  return config;
}

export { createThreadsRpcOptions as a, createForksRpcOptions as c, unwrapSerializableConfig as u };
