import { defineConfig } from '@playwright/test';
import { baseConfig, allBrowserProjects } from './playwright.config.base';

/**
 * Multi-Browser Test Configuration
 * For comprehensive cross-browser testing
 * Run with: pnpm test:e2e:browsers
 */
export default defineConfig({
  ...baseConfig,
  
  // Use all browser configurations
  projects: allBrowserProjects,
  
  // Longer timeout for cross-browser testing
  timeout: 60 * 1000,
  
  // Global timeout for entire suite
  globalTimeout: 60 * 60 * 1000, // 60 minutes
  
  // Allow retries for browser-specific issues
  retries: 1,
  
  // Run tests in parallel but limit workers to prevent resource exhaustion
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  
  // Multi-browser specific output
  outputDir: './tmp/playwright-results/browsers',
  
  // Comprehensive reporting for all browsers
  reporter: process.env.CI
    ? [
        ['json', { outputFile: './tmp/playwright-results/browsers-results.json' }],
        ['junit', { outputFile: './tmp/playwright-results/browsers-junit.xml' }],
        ['html', { outputFolder: './output/playwright-report/browsers' }],
        ['github'],
        ['list'],
      ]
    : [
        ['html', { outputFolder: './output/playwright-report/browsers' }],
        ['list'],
      ],
});