import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    watch: false, // Ensure tests don't run in watch mode and exit properly
    include: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.nx/**',
      '**/server-dependent/**',
      '**/test/integration/**',
      '**/tests/integration/**',
      '**/*.integration.test.{ts,tsx,js,jsx}'
    ],
    // Don't run all tests by default - let Nx affected handle this
    passWithNoTests: true,
    
    // Faster test execution for utility scripts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    
    // Timeout for script tests that might do file I/O
    testTimeout: 30000,
    
    // Coverage settings (optional, only when requested)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-*.ts',
        '**/build-*.ts'
      ]
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@utils': path.resolve(__dirname, './utils')
    }
  }
});