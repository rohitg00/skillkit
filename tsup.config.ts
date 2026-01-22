import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  skipNodeModulesBundle: true,
  platform: 'node',
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  loader: {
    '.tsx': 'tsx',
  },
});
