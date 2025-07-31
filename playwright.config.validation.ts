import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright configuration for validation testing
 * No global setup, minimal configuration to test server optimization
 */
export default defineConfig({
  testDir: './e2e',
  
  // Basic configuration
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Fast timeouts for validation
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  
  // Single worker for simplicity
  workers: 1,
  
  // Simple reporting
  reporter: [['list']],
  
  // Only run on Chrome for speed
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
});
