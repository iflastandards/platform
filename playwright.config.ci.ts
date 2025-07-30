import { defineConfig } from '@playwright/test';
import { baseConfig, createEnvironmentConfig } from './playwright.config.base';

/**
 * CI-Specific Test Configuration
 * Optimized for GitHub Actions and other CI environments
 * Includes environment-specific settings and optimizations
 */
export default defineConfig({
  ...baseConfig,
  
  // Determine which tests to run based on CI context
  grep: process.env.TEST_TAG ? new RegExp(`@${process.env.TEST_TAG}`) : undefined,
  
  // CI-specific timeouts
  timeout: 45 * 1000,
  globalTimeout: parseInt(process.env.TEST_TIMEOUT || '1800000'), // 30 minutes default
  
  // Always retry on CI
  retries: 2,
  
  // CI parallelization settings
  fullyParallel: true,
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : 4,
  
  // Fail fast in CI to save resources
  maxFailures: process.env.MAX_FAILURES ? parseInt(process.env.MAX_FAILURES) : 10,
  
  // CI-specific configuration
  use: {
    ...(baseConfig.use || {}),
    // Use environment-specific base URL
    baseURL: process.env.BASE_URL || process.env.VERCEL_URL || baseConfig.use?.baseURL,
    
    // CI performance optimizations
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
    },
    
    // Artifacts for debugging CI failures
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // CI-specific headers
    extraHTTPHeaders: {
      'x-ci-run': process.env.GITHUB_RUN_ID || 'unknown',
      'x-ci-branch': process.env.GITHUB_REF_NAME || 'unknown',
    },
  },
  
  // Default to Chrome only in CI for speed and consistency
  projects: [
    {
      name: 'chromium',
      use: {
        ...(baseConfig.projects?.[0]?.use || {}),
        headless: true,
        // CI-optimized Chrome settings
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
  ],
  
  // CI output configuration
  outputDir: './tmp/playwright-results/ci',
  
  // CI reporting with artifact uploads
  reporter: [
    ['github'],
    ['json', { outputFile: './tmp/playwright-results/ci-results.json' }],
    ['junit', { outputFile: './tmp/playwright-results/ci-junit.xml' }],
    ['html', { outputFolder: './output/playwright-report/ci', open: 'never' }],
    // Custom reporter for CI metrics
    ['./e2e/reporters/ci-metrics.ts'],
  ],
  
  // Preserve test results between shards
  preserveOutput: 'always',
  
  // Update snapshots only on main branch
  updateSnapshots: process.env.GITHUB_REF === 'refs/heads/main' ? 'all' : 'none',
  
  // Use global setup only for non-sharded runs
  globalSetup: !process.env.SHARD ? require.resolve('./e2e/playwright/global-setup') : undefined,
  globalTeardown: !process.env.SHARD ? require.resolve('./e2e/playwright/global-teardown') : undefined,
});