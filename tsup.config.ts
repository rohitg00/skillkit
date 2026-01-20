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
  // Remove banner - npm handles shebang via package.json bin field
  // For local dev, use: node dist/cli.js
});
