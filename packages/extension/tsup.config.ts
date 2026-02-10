import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    background: 'src/background.ts',
    content: 'src/content.ts',
    popup: 'src/popup.ts',
  },
  format: ['iife'],
  target: 'es2020',
  platform: 'browser',
  outDir: 'dist',
  clean: true,
  noExternal: [/.*/],
});
