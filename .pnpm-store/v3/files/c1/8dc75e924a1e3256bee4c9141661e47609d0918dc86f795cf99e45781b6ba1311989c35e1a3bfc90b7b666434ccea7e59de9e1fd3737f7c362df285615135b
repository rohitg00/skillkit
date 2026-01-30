import { ModuleCacheMap } from 'vite-node/client';
import { p as provideWorkerState } from './global.CkGT_TMy.js';
import { g as getDefaultRequestStubs, s as startVitestExecutor } from './execute.fL3szUAI.js';

let _viteNode;
const moduleCache = new ModuleCacheMap();
const mockMap = /* @__PURE__ */ new Map();
async function startViteNode(options) {
  if (_viteNode)
    return _viteNode;
  _viteNode = await startVitestExecutor(options);
  return _viteNode;
}
async function runBaseTests(state) {
  const { ctx } = state;
  state.moduleCache = moduleCache;
  state.mockMap = mockMap;
  provideWorkerState(globalThis, state);
  if (ctx.invalidates) {
    ctx.invalidates.forEach((fsPath) => {
      moduleCache.delete(fsPath);
      moduleCache.delete(`mock:${fsPath}`);
    });
  }
  ctx.files.forEach((i) => state.moduleCache.delete(i));
  const [executor, { run }] = await Promise.all([
    startViteNode({ state, requestStubs: getDefaultRequestStubs() }),
    import('../chunks/runtime-runBaseTests.oAvMKtQC.js')
  ]);
  await run(
    ctx.files,
    ctx.config,
    { environment: state.environment, options: ctx.environment.options },
    executor
  );
}

export { runBaseTests as r };
