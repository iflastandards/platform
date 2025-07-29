import { defineConfig, devices } from '@playwright/test';

/**
 * Pre-push specific Playwright configuration
 * Tests against built files served via docusaurus serve
 */
export default defineConfig({
  testDir: './e2e',
  /* Global setup and teardown to manage development servers */
  globalSetup: require.resolve('./e2e/playwright/global-setup'),
  globalTeardown: require.resolve('./e2e/playwright/global-teardown'),
  fullyParallel: false, // Sequential for pre-push reliability
  forbidOnly: true,
  retries: 1, // One retry for flaky tests
  workers: 1, // Single worker for stability
  outputDir: './tmp/playwright-results-pre-push',
  reporter: [
    ['list'],
    ['json', { outputFile: './tmp/playwright-results-pre-push/e2e-pre-push-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Test only Chrome headless for pre-push - fast and reliable */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true, // Ensure headless mode
        launchOptions: {
          args: [
            '--disable-dev-shm-usage', // Prevents Chrome crashes
            '--no-sandbox', // Required for some CI environments
            '--disable-setuid-sandbox',
            '--disable-gpu', // Helps with headless stability
          ],
        },
      },
    },
  ],

  /* No automatic server - we'll manage it manually in pre-push hook */
  // webServer: undefined,
});