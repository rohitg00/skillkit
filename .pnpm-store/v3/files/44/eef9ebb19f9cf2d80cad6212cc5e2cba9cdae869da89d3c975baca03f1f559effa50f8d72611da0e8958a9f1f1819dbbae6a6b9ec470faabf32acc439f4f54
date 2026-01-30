import v8 from 'node:v8';
import { c as createForksRpcOptions, u as unwrapSerializableConfig } from '../vendor/utils.0uYuCbzo.js';
import { r as runBaseTests } from '../vendor/base.Ybri3C14.js';
import '@vitest/utils';
import 'vite-node/client';
import '../vendor/global.CkGT_TMy.js';
import '../vendor/execute.fL3szUAI.js';
import 'node:vm';
import 'node:url';
import 'node:fs';
import 'vite-node/utils';
import 'pathe';
import '@vitest/utils/error';
import '../path.js';
import '../vendor/base.5NT-gWu5.js';

class ForksBaseWorker {
  getRpcOptions() {
    return createForksRpcOptions(v8);
  }
  async runTests(state) {
    const exit = process.exit;
    state.ctx.config = unwrapSerializableConfig(state.ctx.config);
    try {
      await runBaseTests(state);
    } finally {
      process.exit = exit;
    }
  }
}
var forks = new ForksBaseWorker();

export { forks as default };
