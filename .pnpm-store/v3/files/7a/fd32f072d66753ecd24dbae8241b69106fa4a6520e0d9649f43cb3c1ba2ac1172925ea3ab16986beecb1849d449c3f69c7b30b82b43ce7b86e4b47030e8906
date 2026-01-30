// @bun
import {
  __require,
  __toESM
} from "./chunk-e11q5a3p.js";

// src/reconciler/devtools-polyfill.ts
var g = globalThis;
if (typeof g.WebSocket === "undefined") {
  try {
    const ws = await import("ws");
    g.WebSocket = ws.default;
  } catch {}
}
g.window ||= globalThis;
g.self ||= globalThis;
g.window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = [
  {
    type: 2,
    value: "ErrorBoundary",
    isEnabled: true,
    isValid: true
  }
];

// src/reconciler/devtools.ts
import devtools from "react-devtools-core";
devtools.initialize();
devtools.connectToDevTools();
