import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: !process.env.FAIL_FAST, // Disable parallel when fail-fast is enabled
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Global timeout - fail fast if things take too long */
  globalTimeout: process.env.FAIL_FAST ? 5 * 60 * 1000 : undefined, // 5 minutes for fail-fast
  /* Enhanced test sharding configuration */
  shard: process.env.SHARD
    ? {
        current: parseInt(process.env.SHARD_CURRENT || '1'),
        total: parseInt(process.env.SHARD_TOTAL || '1'),
      }
    : undefined,
  /* Redirect test results and reports to tmp and output directories */
  outputDir: './tmp/playwright-results',
  /* Enhanced reporting with multiple formats */
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: './output/playwright-report' }],
        ['json', { outputFile: './tmp/playwright-results/e2e-results.json' }],
        ['junit', { outputFile: './tmp/playwright-results/e2e-junit.xml' }],
        ['github'],
      ]
    : [
        ['html', { outputFolder: './output/playwright-report' }],
        ['json', { outputFile: './tmp/playwright-results/e2e-results.json' }],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording */
    video: 'retain-on-failure',
    /* Run in headless mode for speed */
    headless: true,
  },

  /* Set a shorter timeout for assertions */
  expect: {
    timeout: 5000, // 5 seconds
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Admin Portal specific tests */
    {
      name: 'portal-e2e',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/e2e/admin/**/*.spec.ts',
    },
  ],

  
});
