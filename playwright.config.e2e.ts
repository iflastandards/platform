import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config.base';

/**
 * Full E2E Test Configuration
 * Comprehensive end-to-end tests covering complete user journeys
 * Target: < 20 minutes execution time
 * Must Pass Rate: 90%
 */
export default defineConfig({
  ...baseConfig,
  
  // Only run tests tagged with @e2e
  grep: /@e2e/,
  
  // E2E tests need generous timeouts
  timeout: 60 * 1000,
  
  // Global timeout for entire E2E suite
  globalTimeout: 20 * 60 * 1000, // 20 minutes
  
  // Allow 2 retries for E2E tests due to potential flakiness
  retries: process.env.CI ? 2 : 1,
  
  // Run E2E tests sequentially by default to avoid conflicts
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  
  // E2E-specific configuration
  use: {
    ...(baseConfig.use || {}),
    // Generous timeouts for complex user journeys
    navigationTimeout: 30 * 1000,
    actionTimeout: 15 * 1000,
    
    // Capture more debugging information
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    
    // Slow down actions for better stability
    launchOptions: {
      slowMo: process.env.CI ? 100 : 0,
    },
  },
  
  // Use on-demand server startup (servers started only as needed)
  globalSetup: './e2e/global-setup.on-demand.ts',
  // No teardown - leave servers running for reuse
  globalTeardown: undefined,
  
  // Default to Chrome only for E2E tests
  // Use playwright.config.browsers.ts for comprehensive multi-browser testing
  projects: [
    {
      name: 'chromium',
      use: {
        ...(baseConfig.projects?.[0]?.use || {}),
        headless: true,
        // E2E specific browser settings
        contextOptions: {
          // Accept downloads
          acceptDownloads: true,
          // Record HAR for debugging
          recordHar: { path: './tmp/playwright-results/e2e/har/' },
        },
      },
    },
  ],
  
  // E2E test specific output
  outputDir: './tmp/playwright-results/e2e',
  
  // Comprehensive reporting for E2E tests
  reporter: [
    ['html', { outputFolder: './output/playwright-report/e2e', open: 'on-failure' }],
    ['json', { outputFile: './tmp/playwright-results/e2e-results.json' }],
    ['junit', { outputFile: './tmp/playwright-results/e2e-junit.xml' }],
    process.env.CI ? ['github'] : ['list', { printSteps: true }],
    // Custom reporter for flaky test detection
    ['./e2e/reporters/flaky-detector.ts'],
  ],
  
  // Shard configuration for parallel CI execution
  shard: process.env.CI && process.env.SHARD
    ? {
        current: parseInt(process.env.SHARD_CURRENT || '1'),
        total: parseInt(process.env.SHARD_TOTAL || '4'),
      }
    : undefined,
});