import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment';
import 'pathe';
import '@vitest/runner/utils';
import '@vitest/utils';
import { g as getWorkerState } from '../vendor/global.CkGT_TMy.js';
import '../vendor/env.AtSIuHFg.js';
import 'std-env';

class VitestNodeSnapshotEnvironment extends NodeSnapshotEnvironment {
  getHeader() {
    return `// Vitest Snapshot v${this.getVersion()}, https://vitest.dev/guide/snapshot.html`;
  }
  resolvePath(filepath) {
    const rpc = getWorkerState().rpc;
    return rpc.resolveSnapshotPath(filepath);
  }
}

export { VitestNodeSnapshotEnvironment };
