import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Integration Testing Configuration (Phase 3: Pre-Push)
 * This configuration is specifically for integration tests that:
 * - Test multiple components working together
 * - Use real I/O, files, APIs
 * - Include scripts and deployment validation
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
    globals: true,
    environment: 'jsdom',
    watch: false,
    setupFiles: [
      path.resolve(__dirname, 'packages/theme/src/tests/setup.ts'),
    ],
    // ONLY include integration tests (Phase 3)
    include: [
      // Integration test patterns
      '**/*.integration.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Scripts tests (these are integration tests)
      '**/tests/scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Deployment tests (Phase 3 validation)
      '**/tests/deployment/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Additional patterns for when run from within package directories
      'src/tests/scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/tests/deployment/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      // Exclude unit tests (they run in Phase 2)
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/tests/components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/tests/config/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/tests/utils/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Build artifacts
      '**/.next/**',
      '**/apps/*/.next/**',
      '**/dist/**/.next/**',
      '**/.nx/**',
      '**/.docusaurus/**',
      '**/coverage/**',
      '**/.idea/**',
      '**/.vscode/**',
      '**/*.tmp',
      '**/*.temp',
      '**/tmp/**',
      '**/temp/**',
    ],
    passWithNoTests: true,
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
    testTimeout: 30000,
    hookTimeout: 10000,
    bail: 0,
    forceRerunTriggers: [],
    reporters: ['default'],
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
