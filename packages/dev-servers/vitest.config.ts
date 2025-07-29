import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
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
