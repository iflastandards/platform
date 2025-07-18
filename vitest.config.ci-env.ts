import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * CI Environment-Specific Vitest Configuration
 * 
 * ONLY runs tests that validate environment-dependent functionality:
 * - Environment variables and secrets
 * - File paths and permissions
 * - External service connectivity (API keys, tokens)
 * - Configuration that changes between local/CI environments
 * 
 * ASSUMES all other tests (unit, integration, lint, typecheck) have passed locally
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      resolve(__dirname, 'packages/theme/src/tests/setup.ts'),
    ],
    // Only include environment-specific tests
    include: [
      // Environment variable tests
      '**/tests/**/env-*.test.{ts,tsx,js,jsx}',
      '**/tests/**/environment-*.test.{ts,tsx,js,jsx}',
      '**/tests/**/deployment/*.test.{ts,tsx,js,jsx}',
      
      // External service connectivity tests
      '**/tests/**/external-services.test.{ts,tsx,js,jsx}',
      '**/tests/**/api-connectivity.test.{ts,tsx,js,jsx}',
      
      // Path and file system tests specific to CI
      '**/tests/**/ci-paths.test.{ts,tsx,js,jsx}',
      '**/tests/**/deployment-paths.test.{ts,tsx,js,jsx}',
      
      // Authentication/token validation
      '**/tests/**/auth-tokens.test.{ts,tsx,js,jsx}',
      '**/tests/**/github-token.test.{ts,tsx,js,jsx}',
      
      // CI-specific configuration validation
      '**/tests/**/ci-config.test.{ts,tsx,js,jsx}',
      '**/tests/**/production-config.test.{ts,tsx,js,jsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.nx/**',
      '**/.docusaurus/**',
      // Exclude ALL unit tests - already validated locally
      '**/unit/**',
      '**/components/**',
      '**/utils/**',
      '**/hooks/**',
      // Exclude ALL integration tests except environment-specific ones
      '**/integration/**',
      '!**/integration/env-*.test.{ts,tsx,js,jsx}',
      // Exclude ALL e2e tests - too expensive for CI
      '**/e2e/**',
    ],
    // Fast CI execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      }
    },
    // Quick timeout for environment checks
    testTimeout: 15000,
    hookTimeout: 10000,
    // Don't retry - environment tests should be deterministic
    retry: 0,
  },
});