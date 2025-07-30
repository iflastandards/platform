import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config.base';

/**
 * Integration Test Configuration
 * Tests that verify cross-service functionality and RBAC scenarios
 * Target: < 15 minutes execution time
 * Must Pass Rate: 95%
 */
export default defineConfig({
  ...baseConfig,
  
  // Only run tests tagged with @integration
  grep: /@integration/,
  
  // Integration tests may take longer
  timeout: 30 * 1000,
  
  // Global timeout for entire integration suite
  globalTimeout: 15 * 60 * 1000, // 15 minutes
  
  // Allow 1 retry for integration tests
  retries: process.env.CI ? 1 : 0,
  
  // Run tests in parallel but be more conservative
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  
  // Integration-specific configuration
  use: {
    ...(baseConfig.use || {}),
    // More generous timeouts for integration scenarios
    navigationTimeout: 20 * 1000,
    actionTimeout: 10 * 1000,
    
    // Additional headers for API integration
    extraHTTPHeaders: {
      'x-test-type': 'integration',
    },
  },
  
  // Global setup for integration tests (database seeding, etc.)
  globalSetup: require.resolve('./e2e/playwright/integration-setup'),
  globalTeardown: require.resolve('./e2e/playwright/integration-teardown'),
  
  // Default to Chrome only for integration tests
  // Use playwright.config.browsers.ts for multi-browser testing
  projects: [
    {
      name: 'chromium',
      use: {
        ...(baseConfig.projects?.[0]?.use || {}),
        headless: true,
      },
    },
  ],
  
  // Integration test specific output
  outputDir: './tmp/playwright-results/integration',
  
  // More detailed reporting for integration tests
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: './output/playwright-report/integration' }],
        ['json', { outputFile: './tmp/playwright-results/integration-results.json' }],
        ['junit', { outputFile: './tmp/playwright-results/integration-junit.xml' }],
        ['github'],
      ]
    : [
        ['html', { outputFolder: './output/playwright-report/integration', open: 'never' }],
        ['list'],
      ],
});