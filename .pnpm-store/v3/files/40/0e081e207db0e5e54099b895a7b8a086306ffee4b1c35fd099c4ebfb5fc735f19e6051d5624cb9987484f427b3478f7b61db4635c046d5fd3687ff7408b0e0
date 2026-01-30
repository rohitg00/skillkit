import v8 from 'node:v8';
import { c as createForksRpcOptions, u as unwrapSerializableConfig } from '../vendor/utils.0uYuCbzo.js';
import { r as runVmTests } from '../vendor/vm.QEE48c0T.js';
import '@vitest/utils';
import 'node:vm';
import 'node:url';
import 'pathe';
import '../chunks/runtime-console.EO5ha7qv.js';
import 'node:stream';
import 'node:console';
import 'node:path';
import '../vendor/date.Ns1pGd_X.js';
import '@vitest/runner/utils';
import '../vendor/global.CkGT_TMy.js';
import '../vendor/env.AtSIuHFg.js';
import 'std-env';
import '../vendor/execute.fL3szUAI.js';
import 'node:fs';
import 'vite-node/client';
import 'vite-node/utils';
import '@vitest/utils/error';
import '../path.js';
import '../vendor/base.5NT-gWu5.js';
import 'node:module';
import 'vite-node/constants';

class ForksVmWorker {
  getRpcOptions() {
    return createForksRpcOptions(v8);
  }
  async runTests(state) {
    const exit = process.exit;
    state.ctx.config = unwrapSerializableConfig(state.ctx.config);
    try {
      await runVmTests(state);
    } finally {
      process.exit = exit;
    }
  }
}
var vmForks = new ForksVmWorker();

export { vmForks as default };
