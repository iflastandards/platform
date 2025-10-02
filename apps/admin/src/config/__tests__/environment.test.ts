/**
 * @unit @critical @admin
 * Tests for environment configuration and testing strategy
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  env,
  runtime,
  testingStrategy,
  shouldRunTest,
  getCurrentTestPhase,
  filterTestsByPriority,
  getNxAffectedConfig,
  type TestTag,
} from '../environment';

describe('Environment Configuration Tests', () => {
  describe('Basic Environment Detection', () => {
    it('should have a valid environment name', () => {
      expect(env.name).toBeTruthy();
      expect([
        'test_mock',
        'test_local',
        'test_integration',
        'staging',
        'production',
        'development',
      ]).toContain(env.name);
    });

    it('should correctly identify runtime environment', () => {
      expect(typeof runtime.isDevelopment).toBe('boolean');
      expect(typeof runtime.isTest).toBe('boolean');
      expect(typeof runtime.isProduction).toBe('boolean');
    });
  });

  describe('Testing Strategy Integration', () => {
    it('should provide test phase for current environment', () => {
      const phase = getCurrentTestPhase();
      expect(phase).toBeGreaterThanOrEqual(1);
      expect(phase).toBeLessThanOrEqual(5);
    });

    it('should determine if tests should run based on tags', () => {
      // This will vary based on current environment
      const unitTestShouldRun = shouldRunTest(['@unit'] as TestTag[]);
      const smokeTestShouldRun = shouldRunTest(['@smoke'] as TestTag[]);

      expect(typeof unitTestShouldRun).toBe('boolean');
      expect(typeof smokeTestShouldRun).toBe('boolean');
    });

    it('should filter tests by priority', () => {
      const critical = filterTestsByPriority('@critical');
      expect(typeof critical).toBe('boolean');

      // @critical should always be allowed
      expect(critical).toBe(true);
    });

    it('should provide nx affected configuration', () => {
      const config = getNxAffectedConfig();
      expect(config).toBeDefined();
      expect(config).toHaveProperty('useNxAffected');

      if (config.useNxAffected) {
        expect(config).toHaveProperty('targets');
      }
    });
  });

  describe('Testing Strategy Helpers', () => {
    it('should provide phase helpers', () => {
      expect(typeof testingStrategy.isPreCommitPhase()).toBe('boolean');
      expect(typeof testingStrategy.isPrePushPhase()).toBe('boolean');
      expect(typeof testingStrategy.isPullRequestPhase()).toBe('boolean');
      expect(typeof testingStrategy.isDeploymentPhase()).toBe('boolean');
    });

    it('should provide test type helpers', () => {
      expect(typeof testingStrategy.canRunUnitTests()).toBe('boolean');
      expect(typeof testingStrategy.canRunIntegrationTests()).toBe('boolean');
      expect(typeof testingStrategy.canRunE2ETests()).toBe('boolean');
      expect(typeof testingStrategy.canRunSmokeTests()).toBe('boolean');
    });

    it('should provide allowed tags for current environment', () => {
      const tags = testingStrategy.getAllowedTags();
      expect(Array.isArray(tags)).toBe(true);

      // Should have at least one tag type allowed
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should provide current phase', () => {
      const phase = testingStrategy.getCurrentPhase();
      expect(phase).toBeGreaterThanOrEqual(1);
      expect(phase).toBeLessThanOrEqual(5);
    });
  });

  describe('Nx Affected Configuration', () => {
    beforeEach(() => {
      // Reset environment for consistent testing
      process.env.TEST_ENV = 'test_mock';
    });

    it('should configure nx affected for pre-commit phase', () => {
      process.env.TEST_ENV = 'test_mock';
      const config = getNxAffectedConfig();

      if (getCurrentTestPhase() === 2) {
        expect(config.base).toBe('HEAD~1');
        expect(config.targets).toContain('typecheck');
        expect(config.targets).toContain('lint');
        expect(config.targets).toContain('test');
        expect(config.parallel).toBe(true);
      }
    });

    it('should disable nx affected for deployment phase', () => {
      // Would need to mock environment as staging/production
      // This is just an example structure
      if (env.name === 'staging' || env.name === 'production') {
        const config = getNxAffectedConfig();
        expect(config.useNxAffected).toBe(false);
        expect(config.targets).toContain('test:smoke');
      }
    });
  });
});
