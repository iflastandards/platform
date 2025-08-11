import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config.base';

/**
 * Main Playwright configuration
 * This file determines which configuration to use based on environment variables
 * 
 * Note: We use static imports instead of dynamic imports to avoid CommonJS/ESM issues
 */

// Import all configs statically
import ciConfig from './playwright.config.ci';
import smokeConfig from './playwright.config.smoke';
import integrationConfig from './playwright.config.integration';
import e2eConfig from './playwright.config.e2e';

// Determine which configuration to use
function getConfig() {
  // CI environment uses CI-specific config
  if (process.env.CI) {
    return ciConfig;
  }
  
  // Test type specific configs
  const testType = process.env.TEST_TYPE || process.env.PLAYWRIGHT_TEST_TYPE;
  switch (testType) {
    case 'smoke':
      return smokeConfig;
    case 'integration':
      return integrationConfig;
    case 'e2e':
      return e2eConfig;
    default:
      // Default to base config for general use
      return defineConfig(baseConfig);
  }
}

export default getConfig();
