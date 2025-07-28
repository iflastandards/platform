import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'admin-server-dependent',
    root: resolve(__dirname),
    environment: 'node',
    watch: false, // Ensure tests don't run in watch mode and exit properly
    testTimeout: 180000, // 3 minutes for server-dependent tests
    hookTimeout: 180000, // 3 minutes for setup/teardown
    include: ['src/test/integration/server-dependent/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.next/**'],
    globals: true,
    setupFiles: ['src/test/setup-server-dependent.ts'],
    reporters: ['verbose'],
    logHeapUsage: true,
    pool: 'forks', // Use separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to avoid port conflicts
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
