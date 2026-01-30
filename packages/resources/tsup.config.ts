import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/agents/index.ts',
    'src/commands/index.ts',
    'src/profiles/index.ts',
    'src/guidelines/index.ts',
    'src/hooks/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
});
