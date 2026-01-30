import { E as Environment } from './reporters-w_64AS5f.js';
import 'vite';
import '@vitest/runner';
import 'vite-node';
import '@vitest/snapshot';
import '@vitest/expect';
import '@vitest/runner/utils';
import '@vitest/utils';
import 'tinybench';
import 'node:stream';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';
import 'chai';

declare const environments: {
    node: Environment;
    jsdom: Environment;
    'happy-dom': Environment;
    'edge-runtime': Environment;
};

interface PopulateOptions {
    bindFunctions?: boolean;
    additionalKeys?: string[];
}
declare function populateGlobal(global: any, win: any, options?: PopulateOptions): {
    keys: Set<string>;
    skipKeys: string[];
    originals: Map<string | symbol, any>;
};

export { environments as builtinEnvironments, populateGlobal };
