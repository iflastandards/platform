import { defineConfig } from 'vitest/config';

/**
 * Platform-specific Vitest configuration
 * Only runs cross-cutting tests that don't belong to specific packages:
 * - E2E tests
 * - Visual regression tests
 * - Cross-package integration tests
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Platform tests typically don't need jsdom
    watch: false,
    // Only include platform-level tests
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // E2E tests are platform-level
// Exclude Playwright E2E tests from Vitest collection; they run via Playwright
// 'e2e/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.nx/**',
      '**/.docusaurus/**',
      '**/coverage/**',
      // Exclude package-specific tests
      'packages/**',
      'apps/**',
      'standards/**',
      'scripts/**',
      // Exclude visual regression for unit tests (run separately)
      '**/visual-regression.spec.ts',
    ],
    // Allow platform to pass if no tests (in case all are in packages)
    passWithNoTests: true,
    // Reasonable timeouts for platform tests
    testTimeout: 60000, // E2E tests may take longer
    hookTimeout: 30000,
    // Simple reporters
    reporters: ['default'],
    // Coverage for platform-level code only
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage/platform',
      include: ['test/**/*.ts', 'tests/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/__mocks__/**',
      ],
    },
  },
});
