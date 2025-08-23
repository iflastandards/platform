import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Output test results to /tmp to avoid cluttering project
    outputFile: {
      json: '/tmp/test-results/dev-servers-vitest-results.json',
      junit: '/tmp/test-results/dev-servers-vitest-junit.xml',
    },
    globals: true,
    environment: 'node', // Force node environment for dev-servers tests
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.test.ts'],
    // Ensure tests run in isolated environment
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        isolate: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '/tmp/test-results/dev-servers-coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
