import { defineConfig } from '@playwright/test';
import { baseConfig, createTagConfig } from './playwright.config.base';

/**
 * Smoke Test Configuration
 * Quick tests that verify critical functionality
 * Target: < 5 minutes execution time
 * Must Pass Rate: 100%
 */
export default defineConfig({
  ...baseConfig,
  
  // Only run tests tagged with @smoke
  grep: /@smoke/,
  
  // Smoke tests should be fast - strict timeout
  timeout: 15 * 1000,
  
  // Global timeout for entire smoke suite
  globalTimeout: 5 * 60 * 1000, // 5 minutes
  
  // No retries for smoke tests - they should be stable
  retries: 0,
  
  // Run tests in parallel for speed
  fullyParallel: true,
  
  // More workers for smoke tests since they're quick and isolated
  workers: process.env.CI ? 2 : 4,
  
  // Smoke-specific configuration
  use: {
    ...(baseConfig.use || {}),
    // Faster animations for smoke tests
    navigationTimeout: 10 * 1000,
    actionTimeout: 5 * 1000,
  },
  
  // Only test on Chrome for smoke tests (fast feedback)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...(baseConfig.projects?.[0]?.use || {}),
        // Smoke tests specific browser options
        headless: true,
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
        },
      },
    },
  ],
  
  // Smoke test specific output
  outputDir: './tmp/playwright-results/smoke',
  
  // Simplified reporting for smoke tests
  reporter: process.env.CI
    ? [
        ['json', { outputFile: './tmp/playwright-results/smoke-results.json' }],
        ['github'],
        ['list'],
      ]
    : [['list']],
});