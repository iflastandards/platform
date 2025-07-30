import { defineConfig, devices } from '@playwright/test';

/**
 * Pre-push specific Playwright configuration
 * Tests against built files served via docusaurus serve
 * Filters tests based on AFFECTED_APPS and AFFECTED_SITES environment variables
 */

// Parse affected apps/sites from environment
const affectedApps = process.env.AFFECTED_APPS?.split(',').filter(Boolean) || [];
const affectedSites = process.env.AFFECTED_SITES?.split(',').filter(Boolean) || [];

// Build test filter pattern
let testMatch: string | string[] = '**/*.{spec,test}.{js,ts}';

if (affectedApps.length > 0 || affectedSites.length > 0) {
  const patterns: string[] = [];
  
  // Add smoke tests for affected sites
  if (affectedSites.length > 0) {
    patterns.push('**/portal-smoke.spec.ts', '**/standards-smoke.spec.ts');
  }
  
  // Add admin tests if admin is affected
  if (affectedApps.includes('admin')) {
    patterns.push('**/admin/**/*.{spec,test}.{js,ts}');
    patterns.push('**/admin-*.{spec,test}.{js,ts}');
  }
  
  // Add portal tests if portal is affected
  if (affectedApps.includes('portal') || affectedSites.includes('portal')) {
    patterns.push('**/portal-*.{spec,test}.{js,ts}');
    patterns.push('**/site-validation*.spec.ts');
  }
  
  // Add multi-site tests if multiple sites affected
  if (affectedSites.length > 1) {
    patterns.push('**/multi-site-*.spec.ts');
  }
  
  testMatch = patterns.length > 0 ? patterns : '**/*.{spec,test}.{js,ts}';
}

export default defineConfig({
  testDir: './e2e',
  testMatch,
  /* Global setup and teardown to manage development servers */
  globalSetup: process.env.SKIP_SERVER_SETUP ? undefined : require.resolve('./e2e/playwright/global-setup'),
  globalTeardown: process.env.SKIP_SERVER_SETUP ? undefined : require.resolve('./e2e/playwright/global-teardown'),
  fullyParallel: false, // Sequential for pre-push reliability
  forbidOnly: true,
  retries: 0, // No retries for pre-push - fail fast
  workers: 2, // Limited workers for balance of speed and stability
  maxFailures: 5, // Stop after 5 failures to fail fast
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
  
  /* Timeout adjustments for pre-push */
  timeout: 20 * 1000, // 20 seconds per test (reduced for fail-fast)
  expect: {
    timeout: 5 * 1000, // 5 seconds for expect assertions (reduced for fail-fast)
  },
});