import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Nx-optimized Vitest configuration
 * This configuration is designed to work with nx affected commands
 * and exclude build artifacts properly.
 */
export default defineConfig({
  test: {
    // Override with Nx-optimized settings
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      path.resolve(__dirname, 'packages/theme/src/tests/setup.ts'),
    ],
    // Use glob patterns that work well with nx affected
    include: [
      '{packages,apps,standards}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      '**/tests/visual-regression.spec.ts',
      '**/scripts/**/*.test.ts',
      '**/navbarComponentIntegration.test.ts',
      '**/VocabularyTable-improved.test.tsx',
      '**/multilingual-vocabulary.test.tsx',
      // CRITICAL: Exclude integration tests for pre-commit phase
      '**/*.integration.test.{ts,tsx,js,jsx}',
      '**/tests/integration/**',
      // Exclude environment tests (CI only)
      '**/tests/deployment/**',
      // Comprehensive exclusion of build artifacts
      '**/.next/**',
      '**/apps/*/.next/**',
      '**/dist/**/.next/**',
      '**/.nx/**',
      '**/.docusaurus/**',
      '**/standards/*/.docusaurus/**',
      '**/portal/.docusaurus/**',
      // Exclude coverage directories
      '**/coverage/**',
      // Exclude IDE directories
      '**/.idea/**',
      '**/.vscode/**',
      // Exclude temporary files
      '**/*.tmp',
      '**/*.temp',
      '**/tmp/**',
      '**/temp/**',
    ],
    // Optimize for nx affected
    passWithNoTests: true, // Allow projects without tests
    // Use a single thread for more predictable behavior with nx
    maxConcurrency: 1,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true,
        maxThreads: 1,
        minThreads: 1,
      },
    },
    // Reasonable timeouts
    testTimeout: 30000,
    hookTimeout: 10000,
    // Disable bail to see all test results
    bail: 0,
    // Disable force rerun triggers in nx context
    forceRerunTriggers: [],
    // Simple reporters for nx
    reporters: ['default'],
    // Coverage configuration
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/e2e/**',
        '**/*.config.*',
        '**/tests/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/.next/**',
        '**/.nx/**',
        '**/.docusaurus/**',
        '**/coverage/**',
      ],
    },
  },
});