import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: './tmp/playwright-results-snapshots',
  reporter: [['html', { outputFolder: './output/playwright-report-snapshots' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  
  // Custom snapshot directory
  snapshotPathTemplate: '{testDir}/baseline-snapshots/{testFilePath}/{arg}{ext}',
  
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 }
      },
    },
  ],
});