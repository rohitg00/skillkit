import { defineConfig } from 'tsup';
import { solidPlugin } from 'esbuild-plugin-solid';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const solidPath = require.resolve('solid-js').replace(/dist\/server\.(cjs|js)$/, 'dist/solid.js');
const solidWebPath = require.resolve('solid-js/web').replace(/dist\/server\.(cjs|js)$/, 'dist/web.js');

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
  external: ['@opentui/core'],
  noExternal: ['solid-js', '@opentui/solid'],
  esbuildPlugins: [
    solidPlugin({
      solid: {
        generate: 'universal',
        moduleName: '@opentui/solid',
      },
    }),
  ],
  esbuildOptions(options) {
    options.alias = {
      'solid-js': solidPath,
      'solid-js/web': solidWebPath,
    };
  },
});
