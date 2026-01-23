import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'ink', 'ink-text-input'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
