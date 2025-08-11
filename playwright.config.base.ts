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
  
  // No global setup in base - let specific configs handle server management
  // globalSetup is defined in specific configs (integration, e2e, etc.)
  
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
  
  /* Default project configuration - Chrome only for speed */
  projects: [
    // Setup project runs first
    { name: 'setup', testMatch: /global.*setup\.ts/ },
    
    // Tests that don't require authentication
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Ensure headless mode
        headless: true,
      },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
    
    // Authenticated tests with different user roles
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'chromium-editor',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        storageState: 'playwright/.auth/editor.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
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
 * All browser configurations for comprehensive testing
 */
export const allBrowserProjects = [
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      headless: true,
    },
  },
  {
    name: 'firefox',
    use: { 
      ...devices['Desktop Firefox'],
      headless: true,
    },
  },
  {
    name: 'webkit',
    use: { 
      ...devices['Desktop Safari'],
      headless: true,
    },
  },
  {
    name: 'mobile-chrome',
    use: { 
      ...devices['Pixel 5'],
      headless: true,
    },
  },
  {
    name: 'mobile-safari',
    use: { 
      ...devices['iPhone 12'],
      headless: true,
    },
  },
];

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

/**
 * Helper function to create multi-browser configurations
 */
export function createMultiBrowserConfig(options?: any) {
  return defineConfig({
    ...baseConfig,
    ...options,
    projects: allBrowserProjects,
  });
}

export default defineConfig(baseConfig);