/**
 * @e2e @build @navigation @high-priority
 * 
 * Build validation tests for navbar theme components
 * Tests actual build processes and compilation validation
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * @integration @build @ui @high-priority @navigation
 */

describe('Navbar Theme Build Validation', () => {
  describe('Theme Package Build', () => {
    it('should build theme package with navbar components successfully', () => {
      // Only run this test if we're not in CI or if explicitly requested
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping theme build test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx build @ifla/theme', { 
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout
        });
      }).not.toThrow();
    });
  });

  describe('Site Build Integration', () => {
    it('should build newtest site successfully with navbar theme components', () => {
      // Only run this test if we're not in CI or if explicitly requested
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping newtest site build test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx build newtest', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minute timeout
        });
      }).not.toThrow();
    });

    it('should build with proper navbar component resolution', () => {
      // Only run if build integration tests are enabled
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping build integration validation in CI environment');
        return;
      }

      // This test verifies that the build process can resolve navbar components
      // from the central theme package without errors
      expect(() => {
        execSync('nx build newtest --verbose', { 
          stdio: 'pipe',
          timeout: 120000
        });
      }).not.toThrow();
    });
  });

  describe('TypeScript Compilation', () => {
    it('should compile navbar theme components without TypeScript errors', () => {
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping TypeScript compilation test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx typecheck @ifla/theme', { 
          stdio: 'pipe',
          timeout: 30000
        });
      }).not.toThrow();
    });

    it('should compile newtest site with navbar integration without errors', () => {
      if (process.env.CI && !process.env.TEST_BUILD_INTEGRATION) {
        console.log('Skipping newtest TypeScript compilation test in CI environment');
        return;
      }

      expect(() => {
        execSync('nx typecheck newtest', { 
          stdio: 'pipe',
          timeout: 30000
        });
      }).not.toThrow();
    });
  });
});