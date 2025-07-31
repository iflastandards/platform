import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CI Configuration Tests
 * 
 * These tests ONLY verify CI-specific configuration
 * They do NOT test application functionality
 */

describe('CI Configuration Validation @unit @deployment', () => {
  it('should skip in non-CI environments', () => {
    if (!process.env.CI) {
      expect(true).toBe(true);
      return;
    }
  });

  describe('Build Environment', () => {
    it('should have production NODE_ENV in CI', () => {
      if (!process.env.CI) return;
      
      // CI builds should always use production mode for optimized builds
      // regardless of whether it's preview or production deployment
      expect(process.env.NODE_ENV).toBe('production');
    });

    it('should have DOCS_ENV set for deployment', () => {
      if (!process.env.CI) return;
      
      // DOCS_ENV differentiates between preview and production
      expect(process.env.DOCS_ENV).toBeDefined();
      expect(['preview', 'production']).toContain(process.env.DOCS_ENV);
    });

    it('should have correct build paths', () => {
      if (!process.env.CI) return;
      
      // Check that build output directories are writable
      const buildPaths = [
        'build',
        'dist',
        '.next',
        '.docusaurus'
      ];
      
      buildPaths.forEach(buildPath => {
        try {
          // Just check if we can access the parent directory
          const parentDir = path.dirname(buildPath);
          fs.accessSync(parentDir, fs.constants.W_OK);
        } catch (error) {
          // It's OK if the directory doesn't exist yet
          expect(error.code).toBe('ENOENT');
        }
      });
    });
  });

  describe('GitHub Actions Specific', () => {
    it('should have GitHub Actions environment variables', () => {
      if (!process.env.CI || !process.env.GITHUB_ACTIONS) return;
      
      expect(process.env.GITHUB_WORKSPACE).toBeDefined();
      expect(process.env.GITHUB_REPOSITORY).toBeDefined();
      expect(process.env.GITHUB_REF).toBeDefined();
      expect(process.env.GITHUB_SHA).toBeDefined();
    });

    it('should have correct permissions for artifact upload', () => {
      if (!process.env.CI || !process.env.GITHUB_ACTIONS) return;
      
      // Check that we can write to the artifacts directory
      const artifactDir = process.env.RUNNER_TEMP || '/tmp';
      expect(artifactDir).toBeDefined();
      
      try {
        fs.accessSync(artifactDir, fs.constants.W_OK);
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  describe('Vercel Specific', () => {
    it('should have Vercel environment variables', () => {
      if (!process.env.CI || !process.env.VERCEL) return;
      
      expect(process.env.VERCEL_URL).toBeDefined();
      expect(process.env.VERCEL_ENV).toMatch(/production|preview|development/);
      expect(process.env.VERCEL_GIT_COMMIT_SHA).toBeDefined();
    });
  });

  describe('Nx Cloud', () => {
    it('should have Nx Cloud token if enabled', () => {
      if (!process.env.CI) return;
      
      // Nx Cloud is optional but if enabled, should have token
      if (process.env.NX_CLOUD_DISTRIBUTED_EXECUTION === 'true') {
        expect(process.env.NX_CLOUD_ACCESS_TOKEN).toBeDefined();
        expect(process.env.NX_CLOUD_ACCESS_TOKEN).not.toBe('');
      }
    });
  });
});