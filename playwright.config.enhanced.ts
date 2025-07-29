import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Enhanced Playwright configuration with advanced Chrome options
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Global setup and teardown to manage development servers
  globalSetup: require.resolve('./e2e/playwright/global-setup'),
  globalTeardown: require.resolve('./e2e/playwright/global-teardown'),
  
  // Output directories
  outputDir: './tmp/playwright-results',
  
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: './output/playwright-report' }],
    ['json', { outputFile: './tmp/playwright-results/e2e-results.json' }],
    ['junit', { outputFile: './tmp/playwright-results/e2e-junit.xml' }],
    ...(process.env.CI ? [['github' as const, {}] as const] : []),
  ],
  
  use: {
    // Base URL configuration
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Always run headless for speed
    headless: true,
    
    // Enhanced Chrome launch options
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled', // Avoid detection
        '--disable-dev-shm-usage', // Overcome limited resource problems
        '--disable-gpu', // Applicable to headless mode
        '--disable-setuid-sandbox',
        '--no-sandbox', // Bypass OS security model
        '--disable-web-security', // For testing CORS scenarios
        '--allow-insecure-localhost', // For self-signed certificates
        '--ignore-certificate-errors',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--disable-features=TranslateUI',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--password-store=basic',
        '--use-mock-keychain',
      ],
      
      // Chrome-specific preferences
      ignoreDefaultArgs: ['--enable-automation'],
      
      // Download handling
      downloadsPath: './tmp/downloads',
    },
    
    // Context options
    contextOptions: {
      // Accept downloads
      acceptDownloads: true,
      
      // Ignore HTTPS errors (useful for local dev)
      ignoreHTTPSErrors: true,
      
      // Permissions
      permissions: ['geolocation', 'notifications', 'camera'],
      
      // Locale and timezone
      locale: 'en-US',
      timezoneId: 'America/New_York',
      
      // Record video for debugging
      recordVideo: {
        dir: './tmp/videos',
        size: { width: 1920, height: 1080 },
      },
    },
    
    // Screenshot options
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Trace options for debugging
    trace: 'retain-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1920, height: 1080 },
    
    // Action timeout
    actionTimeout: 15000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },
  
  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    },
  },
  
  // Project configurations
  projects: [
    // Chrome with specific configuration
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific options
        channel: 'chrome', // Use stable Chrome instead of Chromium
        launchOptions: {
          // Additional Chrome-specific args
          args: [
            '--window-size=1920,1080',
            '--start-maximized',
          ],
        },
      },
    },
    
    // Chrome in incognito mode
    {
      name: 'chrome-incognito',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--incognito'],
        },
      },
    },
    
    // Chrome with mobile emulation
    {
      name: 'chrome-mobile',
      use: {
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // Integration tests with extended timeouts
    {
      name: 'integration',
      use: {
        ...devices['Desktop Chrome'],
        // Longer timeouts for integration tests
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
      testMatch: '**/integration/**/*.spec.ts',
    },
    
    // Server-dependent tests
    {
      name: 'server-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Base URL for API tests
        baseURL: process.env.API_BASE_URL || 'http://localhost:3200',
        // Extra HTTP headers
        extraHTTPHeaders: {
          'X-Test-Suite': 'playwright-e2e',
        },
      },
      testMatch: '**/server-dependent/**/*.spec.ts',
    },
    
    // Performance tests with DevTools
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-precise-memory-info'],
          devtools: true, // Enable DevTools for performance profiling
        },
      },
      testMatch: '**/performance/**/*.spec.ts',
    },
  ],
  
  // Web server configuration (alternative to globalSetup)
  webServer: [
    {
      command: 'nx start portal',
      port: 3000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'nx dev admin --turbopack',
      port: 3200,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});