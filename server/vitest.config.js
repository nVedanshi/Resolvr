import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    // Database round trips are slower than the default 5s on cold machines.
    testTimeout: 20000,
    hookTimeout: 20000,
    // Each file gets its own process so the Prisma client is never shared
    // between concurrent test files.
    pool: 'forks',
    fileParallelism: false,
  },
});