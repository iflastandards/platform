import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Restrict Vitest to the scripts/ directory only
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    watch: false, // Ensure tests don't run in watch mode and exit properly
    include: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js'
    ],
    // Be extra-safe: exclude anything outside scripts and any e2e folders if referenced
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.nx/**',
      '**/e2e/**',
      '**/tests/e2e/**',
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
    
    // Reporters - include json and junit for file output when needed
    reporters: process.env.CI || process.env.VITEST_JSON_REPORT ? ['default', 'json', 'junit'] : ['default'],
    
    // Output test results to /tmp to avoid cluttering project
    outputFile: {
      json: '/tmp/test-results/scripts-vitest-results.json',
      junit: '/tmp/test-results/scripts-vitest-junit.xml',
    },
    
    // Coverage settings (optional, only when requested)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '/tmp/test-results/scripts-coverage',
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