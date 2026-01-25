import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: {
    compilerOptions: {
      composite: false,
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  },
  sourcemap: true,
  clean: true,
  external: ['react', '@opentui/core', '@opentui/react'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.jsxImportSource = '@opentui/react';
  },
});
