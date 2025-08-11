import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config.base';

/**
 * Smoke Test Configuration
 * Quick tests that verify critical functionality on deployed sites
 * Target: < 5 minutes execution time
 * Must Pass Rate: 100%
 * 
 * Only runs against deployed environments (preview/production)
 */

// Get environment from DOCS_ENV (preview or production)
const environment = process.env.DOCS_ENV || 'preview';
if (environment !== 'preview' && environment !== 'production') {
  throw new Error(`Invalid DOCS_ENV: ${environment}. Must be 'preview' or 'production'`);
}

// Set admin URLs based on environment
const adminUrls = {
  preview: 'https://admin-iflastandards-preview.onrender.com',
  production: 'https://admin.iflastandards.info',
};

// Set environment variables for tests to use
process.env.ADMIN_BASE_URL = adminUrls[environment as keyof typeof adminUrls];
process.env.ADMIN_URL = adminUrls[environment as keyof typeof adminUrls];

export default defineConfig({
  ...baseConfig,
  
  // No global setup for smoke tests (tests deployed sites)
  globalSetup: undefined,
  globalTeardown: undefined,
  
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
  
  // Smoke-specific configuration with environment-specific baseURL
  use: {
    ...(baseConfig.use || {}),
    // Faster animations for smoke tests
    navigationTimeout: 10 * 1000,
    actionTimeout: 5 * 1000,
    // Override baseURL for deployed environment (must be last to override env vars)
    baseURL: environment === 'production' 
      ? 'https://www.iflastandards.info'
      : 'https://iflastandards.github.io/platform',
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