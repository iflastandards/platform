import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false, // Ensure tests don't run in watch mode and exit properly
    setupFiles: ['./src/test/setup.ts', './src/test/setup-msw.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',
      'src/test/integration/server-dependent/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/test/_deprecated/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/*.deprecated',
    ],
    // Output test results to /tmp to avoid cluttering project
    outputFile: {
      json: '/tmp/test-results/admin-vitest-results.json',
      junit: '/tmp/test-results/admin-vitest-junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '/tmp/test-results/admin-coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/*.mock.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test': resolve(__dirname, './src/test'),
      // Map workspace packages for Vitest resolution
      '@ifla/contracts': resolve(__dirname, '../../packages/contracts/dist/index.js'),
      '@ifla/fixtures': resolve(__dirname, '../../packages/fixtures/dist/index.js'),
    },
  },
});
