import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config.base';

/**
 * Main Playwright configuration
 * This file determines which configuration to use based on environment variables
 */

// Determine which configuration to use
function getConfig() {
  // CI environment uses CI-specific config
  if (process.env.CI) {
    return require('./playwright.config.ci');
  }
  
  // Test type specific configs
  const testType = process.env.TEST_TYPE || process.env.PLAYWRIGHT_TEST_TYPE;
  switch (testType) {
    case 'smoke':
      return require('./playwright.config.smoke');
    case 'integration':
      return require('./playwright.config.integration');
    case 'e2e':
      return require('./playwright.config.e2e');
    default:
      // Default to base config for general use
      return defineConfig(baseConfig);
  }
}

export default getConfig();
