import { defineConfig } from 'vitest/config';

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
});
