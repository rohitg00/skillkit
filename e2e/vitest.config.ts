import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.e2e.test.ts'],
    testTimeout: 60000, // E2E tests need more time
    hookTimeout: 30000,
    retry: 1, // Retry failed tests once for flaky network/fs operations
    sequence: {
      shuffle: false, // Run tests in order for debugging
    },
    pool: 'forks', // Use forks for better isolation
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },
  },
  resolve: {
    alias: {
      '@skillkit/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@skillkit/agents': resolve(__dirname, '../packages/agents/src/index.ts'),
    },
  },
});
