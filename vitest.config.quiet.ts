import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.nx';

/**
 * Quiet Vitest configuration for pre-commit and CI contexts
 * Reduces verbosity and suppresses build output
 */
export default mergeConfig(baseConfig, defineConfig({
  test: {
    // Quiet reporter - only show errors and summary
    reporters: process.env.CI || process.env.QUIET_MODE 
      ? ['basic'] 
      : ['default'],
    
    // Disable verbose output
    silent: false, // Still show test results
    hideSkippedTests: true, // Don't show skipped tests
    
    // Optimize output for CI/pre-commit
    outputFile: undefined, // Don't write output files
    
    // Disable coverage in quiet mode to reduce output
    coverage: undefined,
    
    // Environment variables for quiet mode
    env: {
      CI: 'true',
      QUIET_MODE: 'true',
      NODE_NO_WARNINGS: '1',
    },
    
    // Use onConsoleLog to filter output
    onConsoleLog: (log) => {
      // Filter out verbose build output
      if (log.includes('tsup') || 
          log.includes('Building') || 
          log.includes('Bundling') ||
          log.includes('⚡') ||
          log.includes('📦') ||
          log.includes('🔧')) {
        return false; // Don't log
      }
      return undefined; // Use default behavior
    },
  },
  
  // Suppress Vite build output
  logLevel: 'error', // Only show errors
}));