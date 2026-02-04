import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  skipNodeModulesBundle: true,
  platform: 'node',
  banner: {
    js: '#!/usr/bin/env node',
  },
});
