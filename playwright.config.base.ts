import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Base Playwright configuration shared by all test types
 * This provides common settings that can be extended by specific configs
 */
export const baseConfig: PlaywrightTestConfig = {
  // Base test directory
  testDir: './e2e',
  
  // Shared test configuration
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry' as const,
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure' as const,
    
    /* Video recording */
    video: 'retain-on-failure' as const,
    
    /* Run in headless mode for speed */
    headless: true,
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Locale settings */
    locale: 'en-US',
    
    /* Timezone */
    timezoneId: 'America/New_York',
  },
  
  /* Global timeout defaults */
  timeout: 30 * 1000,
  
  /* Assertion timeout */
  expect: {
    timeout: 5000,
  },
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Opt out of parallel tests on CI by default */
  workers: process.env.CI ? 1 : undefined,
  
  /* Enhanced reporting configuration */
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: './output/playwright-report' }],
        ['json', { outputFile: './tmp/playwright-results/results.json' }],
        ['junit', { outputFile: './tmp/playwright-results/junit.xml' }],
        ['github'],
        ['list'],
      ]
    : [
        ['html', { outputFolder: './output/playwright-report' }],
        ['list'],
      ],
  
  /* Output directory for test artifacts */
  outputDir: './tmp/playwright-results',
  
  /* Shared projects configuration */
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};

/**
 * Helper function to create environment-specific configurations
 */
export function createEnvironmentConfig(environment: 'local' | 'preview' | 'production') {
  const baseUrls = {
    local: 'http://localhost:3000',
    preview: process.env.PREVIEW_URL || 'https://iflastandards.github.io/platform',
    production: 'https://www.iflastandards.info',
  };
  
  return {
    use: {
      ...baseConfig.use,
      baseURL: baseUrls[environment],
    },
  };
}

/**
 * Helper function to create tag-based configurations
 */
export function createTagConfig(tag: string, options?: any) {
  return defineConfig({
    ...baseConfig,
    ...options,
    grep: new RegExp(`@${tag}`),
    grepInvert: undefined,
  });
}

export default defineConfig(baseConfig);