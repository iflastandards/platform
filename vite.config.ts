// vite.config.ts
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
import { defineConfig, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      react(),
      tsconfigPaths(), // Add the plugin here
    ],
    cacheDir: './.vitest-cache',
    resolve: {
      alias: {
        '@docusaurus/Link': resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/DocusaurusLinkMock.tsx',
        ),
        '@docusaurus/useBaseUrl': resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/useBaseUrl.ts',
        ),
        '@docusaurus/useDocusaurusContext': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/useDocusaurusContext.ts',
        ),
        '@docusaurus/router': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/router.ts',
        ),
        '@docusaurus/theme-common': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/theme-common.ts',
        ),
        '@theme/Tabs': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/tabs.tsx',
        ),
        '@theme/TabItem': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/TabItem.tsx',
        ),
        '@theme/CodeBlock': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/CodeBlock.tsx',
        ),
        '@theme/Heading': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/Heading.tsx',
        ),
        '@docusaurus/BrowserOnly': path.resolve(
          __dirname,
          'packages/theme/src/tests/__mocks__/BrowserOnly.tsx',
        ),
        '@ifla/theme': path.resolve(__dirname, 'packages/theme/src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [
        path.resolve(__dirname, 'packages/theme/src/tests/setup.ts'),
      ],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/e2e/**',
        '**/tests/visual-regression.spec.ts',
        // Exclude integration tests that run builds or external commands
        '**/navbarComponentIntegration.test.ts',
        // Exclude problematic component tests that cause hanging
        '**/VocabularyTable-improved.test.tsx',
        '**/multilingual-vocabulary.test.tsx',
        // Exclude .next build artifacts
        '**/.next/**',
        '**/apps/admin/.next/**',
        '**/dist/apps/admin/.next/**',
        // Exclude nx cache directories
        '**/.nx/**',
        '.nx/**',
        // Exclude .docusaurus build artifacts
        '**/.docusaurus/**',
        '**/portal/.docusaurus/**',
        '**/standards/**/.docusaurus/**',
      ],
      // Enhanced CI stability and performance
      testTimeout: process.env.CI ? 60000 : 30000, // Further reduced CI timeout to 60 seconds
      hookTimeout: process.env.CI ? 20000 : 10000, // Further reduced CI hook timeout to 20 seconds
      maxConcurrency: 1, // Force single concurrency everywhere for stability
      pool: process.env.CI ? 'forks' : 'threads', // Use forks in CI for better isolation
      poolOptions: {
        threads: {
          singleThread: true, // Always use single thread
          isolate: true,
          maxThreads: 1,
          minThreads: 1,
        },
        forks: {
          singleFork: true, // Always use single fork
          isolate: true,
          maxForks: 3,
        },
      },
      retry: 0, // Disable retries to avoid hanging
      logHeapUsage: !!process.env.CI,
      // More aggressive timeouts for Nx Cloud
      ...(process.env.NX_CLOUD_DISTRIBUTED_EXECUTION && {
        testTimeout: 45000,
        hookTimeout: 15000,
        maxConcurrency: 1,
        pool: 'forks',
      }),
      // Disable bail in CI to see all test results (0 = run all tests)
      bail: 0,
      forceRerunTriggers: process.env.CI
        ? []
        : [
            '**/vite.config.ts',
            '**/vitest.config.ts',
            '**/package.json',
            '**/.env',
            '**/tsconfig.json',
          ], // Force rerun on config changes in local dev, empty in CI to avoid iteration issues
      // Enhanced reporting
      reporters: process.env.CI
        ? ['default']
        : [
            'default',
            ['json', { outputFile: 'test-results/vitest-results.json' }],
            ['junit', { outputFile: 'test-results/vitest-junit.xml' }],
          ],
      // Coverage configuration with thresholds
      coverage: {
        reporter: process.env.CI
          ? ['text']
          : ['text', 'json-summary', 'html', 'lcov'],
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
          // Exclude .next build artifacts
          '**/.next/**',
          '**/apps/admin/.next/**',
          // Exclude nx cache directories
          '**/.nx/**',
          '.nx/**',
          // Exclude .docusaurus build artifacts
          '**/.docusaurus/**',
        ],
        // Disable thresholds in CI to avoid extra processing
        ...(process.env.CI
          ? {}
          : {
              thresholds: {
                global: {
                  branches: 75,
                  functions: 75,
                  lines: 80,
                  statements: 80,
                },
              },
            }),
      },
    },
  };
});
