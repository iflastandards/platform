import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Nx-optimized Vitest configuration
 * This configuration is designed to work with nx affected commands
 * and exclude build artifacts properly.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Map @ifla/theme to source during tests
      '@ifla/theme/components': path.resolve(__dirname, 'packages/theme/src/components'),
      '@ifla/theme/utils': path.resolve(__dirname, 'packages/theme/src/utils'),
      '@ifla/theme/config': path.resolve(__dirname, 'packages/theme/src/config'),
      '@ifla/theme/hooks': path.resolve(__dirname, 'packages/theme/src/hooks'),
      '@ifla/theme': path.resolve(__dirname, 'packages/theme/src'),
      // Docusaurus mocks for theme package
      '@docusaurus/Link': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/DocusaurusLinkMock.tsx'),
      '@docusaurus/useDocusaurusContext': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/useDocusaurusContext.ts'),
      '@docusaurus/useBaseUrl': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/useBaseUrl.ts'),
      '@docusaurus/theme-common': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/theme-common.ts'),
      '@theme/Tabs': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/tabs.tsx'),
      '@theme/TabItem': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/TabItem.tsx'),
      '@theme/CodeBlock': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/CodeBlock.tsx'),
      '@theme/Heading': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/Heading.tsx'),
      '@docusaurus/router': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/router.ts'),
      '@docusaurus/BrowserOnly': path.resolve(__dirname, 'packages/theme/src/tests/__mocks__/BrowserOnly.tsx'),
      // Admin app alias
      '@': path.resolve(__dirname, 'apps/admin/src'),
    },
  },
  test: {
    // Override with Nx-optimized settings
    globals: true,
    environment: 'jsdom',
    watch: false, // Ensure tests don't run in watch mode and exit properly
    setupFiles: [
      path.resolve(__dirname, 'packages/theme/src/tests/setup.ts'),
    ],
    // Use glob patterns that work well with nx affected
    include: [
      '{packages,apps,standards}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/theme/src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      '**/tests/visual-regression.spec.ts',
      '**/navbarComponentIntegration.test.ts',
      '**/VocabularyTable-improved.test.tsx',
      '**/multilingual-vocabulary.test.tsx',
      // CRITICAL: Exclude integration tests for pre-commit phase
      '**/*.integration.test.{ts,tsx,js,jsx}',
      '**/tests/integration/**',
      '**/test/integration/**',
      // Exclude server-dependent tests
      '**/server-dependent/**',
      // Exclude environment tests (CI only)
      '**/tests/deployment/**',
      // Exclude dev-servers tests (run on-demand only due to mocking issues in global test environment)
      '**/packages/dev-servers/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
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