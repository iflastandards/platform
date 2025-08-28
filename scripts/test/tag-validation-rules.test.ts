/**
 * @unit @testing @validation @rules
 * @ai-reviewed by:test-suite on:2024-01-15 tags:[@unit,@testing,@validation,@rules]
 * 
 * Tests for tag validation rules enforcement
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedTestTagger } from '../auto-tag-tests-v2';

describe('Tag Validation Rules @unit @validation', () => {
  let tagger: EnhancedTestTagger;

  beforeEach(() => {
    tagger = new EnhancedTestTagger();
  });

  describe('Rule: Unit tests CANNOT be server-dependent', () => {
    it('should remove @server-dependent from unit tests', () => {
      const tags = new Set(['@unit', '@server-dependent', '@local-only', '@api']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@unit')).toBe(true);
      expect(tags.has('@api')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(false);
      expect(tags.has('@local-only')).toBe(false);
    });

    it('should not affect unit tests without server dependencies', () => {
      const tags = new Set(['@unit', '@ui', '@validation']);
      const originalSize = tags.size;
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.size).toBe(originalSize);
      expect(tags.has('@unit')).toBe(true);
      expect(tags.has('@ui')).toBe(true);
      expect(tags.has('@validation')).toBe(true);
    });

    it('should keep server-dependent if no unit tag', () => {
      const tags = new Set(['@integration', '@server-dependent', '@local-only']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@integration')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });
  });

  describe('Rule: Smoke tests MUST be post-deploy', () => {
    it('should add required tags to smoke tests', () => {
      const tags = new Set(['@smoke']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@smoke')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@critical')).toBe(true);
    });

    it('should remove conflicting tags from smoke tests', () => {
      const tags = new Set(['@smoke', '@server-dependent', '@local-only']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@smoke')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@critical')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(false);
      expect(tags.has('@local-only')).toBe(false);
    });

    it('should not duplicate existing tags', () => {
      const tags = new Set(['@smoke', '@post-deploy', '@critical']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.size).toBe(3);
      expect(tags.has('@smoke')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@critical')).toBe(true);
    });
  });

  describe('Rule: Server-dependent tests MUST be local-only', () => {
    it('should add @local-only to server-dependent tests', () => {
      const tags = new Set(['@integration', '@server-dependent']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@integration')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });

    it('should not add @local-only to post-deploy server tests', () => {
      const tags = new Set(['@e2e', '@server-dependent', '@post-deploy']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@e2e')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@local-only')).toBe(false);
    });

    it('should not duplicate @local-only if already present', () => {
      const tags = new Set(['@integration', '@server-dependent', '@local-only']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(Array.from(tags).filter(t => t === '@local-only')).toHaveLength(1);
    });
  });

  describe('Rule: E2E tests MUST specify environment', () => {
    it('should add environment tags to E2E tests', () => {
      const tags = new Set(['@e2e']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@e2e')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });

    it('should not modify E2E tests with post-deploy', () => {
      const tags = new Set(['@e2e', '@post-deploy']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@e2e')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(false);
      expect(tags.has('@local-only')).toBe(false);
    });

    it('should keep existing environment specification', () => {
      const tags = new Set(['@e2e', '@server-dependent', '@local-only']);
      const originalSize = tags.size;
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.size).toBe(originalSize);
      expect(tags.has('@e2e')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });
  });

  describe('Multiple Rule Application', () => {
    it('should apply all relevant rules in correct order', () => {
      // Test that smoke test rules override others
      const smokeWithConflicts = new Set(['@smoke', '@unit', '@server-dependent']);
      
      tagger['applyTagValidationRules'](smokeWithConflicts);
      
      expect(smokeWithConflicts.has('@smoke')).toBe(true);
      expect(smokeWithConflicts.has('@post-deploy')).toBe(true);
      expect(smokeWithConflicts.has('@critical')).toBe(true);
      expect(smokeWithConflicts.has('@unit')).toBe(true); // Unit tag stays
      expect(smokeWithConflicts.has('@server-dependent')).toBe(false); // Removed by smoke rule
      expect(smokeWithConflicts.has('@local-only')).toBe(false); // Not added due to smoke
    });

    it('should handle complex tag combinations', () => {
      const complex = new Set([
        '@integration', 
        '@api', 
        '@server-dependent',
        '@auth',
        '@validation'
      ]);
      
      tagger['applyTagValidationRules'](complex);
      
      expect(complex.has('@integration')).toBe(true);
      expect(complex.has('@api')).toBe(true);
      expect(complex.has('@server-dependent')).toBe(true);
      expect(complex.has('@local-only')).toBe(true); // Added by rule
      expect(complex.has('@auth')).toBe(true);
      expect(complex.has('@validation')).toBe(true);
    });

    it('should preserve functional area tags', () => {
      const functional = new Set([
        '@unit',
        '@auth',
        '@api',
        '@validation',
        '@security',
        '@cache',
        '@rbac'
      ]);
      
      const originalFunctionalTags = Array.from(functional).filter(
        t => ['@auth', '@api', '@validation', '@security', '@cache', '@rbac'].includes(t)
      );
      
      tagger['applyTagValidationRules'](functional);
      
      originalFunctionalTags.forEach(tag => {
        expect(functional.has(tag)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tag sets', () => {
      const tags = new Set<string>();
      
      expect(() => tagger['applyTagValidationRules'](tags)).not.toThrow();
      expect(tags.size).toBe(0);
    });

    it('should handle single tags', () => {
      const justUnit = new Set(['@unit']);
      tagger['applyTagValidationRules'](justUnit);
      expect(justUnit.size).toBe(1);
      expect(justUnit.has('@unit')).toBe(true);

      const justIntegration = new Set(['@integration']);
      tagger['applyTagValidationRules'](justIntegration);
      expect(justIntegration.size).toBe(1);
      expect(justIntegration.has('@integration')).toBe(true);

      const justSmoke = new Set(['@smoke']);
      tagger['applyTagValidationRules'](justSmoke);
      expect(justSmoke.size).toBe(3); // smoke + post-deploy + critical
    });

    it('should handle duplicate prevention', () => {
      const withDuplicateRisk = new Set([
        '@integration',
        '@server-dependent',
        '@local-only' // Already has it
      ]);
      
      tagger['applyTagValidationRules'](withDuplicateRisk);
      
      const localOnlyCount = Array.from(withDuplicateRisk).filter(
        t => t === '@local-only'
      ).length;
      expect(localOnlyCount).toBe(1);
    });
  });

  describe('Pattern-Based Tag Analysis', () => {
    it('should identify unit test patterns', () => {
      const unitContent = `
import { render } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
  });
});`;

      const tags = tagger['analyzeTestContent'](unitContent, 'Component.test.tsx');
      
      expect(tags).toContain('@unit');
      expect(tags).toContain('@ui');
      expect(tags).not.toContain('@server-dependent');
    });

    it('should identify integration test patterns', () => {
      const integrationContent = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users', handler)
);

describe('User Service', () => {
  beforeAll(() => server.listen());
});`;

      const tags = tagger['analyzeTestContent'](integrationContent, 'UserService.test.ts');
      
      expect(tags).toContain('@integration');
      expect(tags).toContain('@api');
      expect(tags).not.toContain('@server-dependent'); // MSW doesn't need server
    });

    it('should identify E2E test patterns', () => {
      const e2eContent = `
import { test, expect } from '@playwright/test';

test('complete user journey', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button[data-testid="login"]');
});`;

      const tags = tagger['analyzeTestContent'](e2eContent, 'journey.e2e.spec.ts');
      
      expect(tags).toContain('@e2e');
      expect(tags).toContain('@server-dependent');
      expect(tags).toContain('@local-only');
    });

    it('should identify server-dependent patterns', () => {
      const serverDependentContent = `
describe('API Integration', () => {
  it('calls localhost API', async () => {
    const response = await fetch('http://localhost:3007/api/data');
    expect(response.ok).toBe(true);
  });
});`;

      const tags = tagger['analyzeTestContent'](serverDependentContent, 'api.test.ts');
      
      expect(tags).toContain('@server-dependent');
      expect(tags).toContain('@local-only');
      expect(tags).toContain('@api');
    });

    it('should identify smoke test patterns', () => {
      const smokeContent = `
describe('Production Health Check', () => {
  it('critical path validation', async () => {
    const health = await checkHealth(process.env.PROD_URL);
    expect(health.status).toBe('ok');
  });
});`;

      const tags = tagger['analyzeTestContent'](smokeContent, 'health.smoke.spec.ts');
      
      expect(tags).toContain('@smoke');
      expect(tags).toContain('@post-deploy');
      expect(tags).toContain('@critical');
      expect(tags).not.toContain('@server-dependent');
    });

    it('should identify functional area patterns', () => {
      const authContent = `
describe('Authentication', () => {
  it('validates user login with role-based access', () => {
    const user = authenticate('user', 'password');
    expect(user.role).toBe('admin');
    expect(user.permissions).toContain('write');
  });
});`;

      const tags = tagger['analyzeTestContent'](authContent, 'auth.test.ts');
      
      expect(tags).toContain('@auth');
      expect(tags).toContain('@rbac');
      expect(tags).toContain('@validation');
    });

    it('should combine multiple patterns correctly', () => {
      const complexContent = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/auth/login', loginHandler),
  rest.get('/api/users/:id', userHandler)
);

describe('User Authentication API @integration', () => {
  beforeAll(() => server.listen());
  
  it('authenticates and validates user data', async () => {
    const token = await login('user@test.com', 'password');
    expect(token).toMatch(/^Bearer /);
    
    const user = await fetchUser(token);
    validateUserSchema(user);
  });
});`;

      const tags = tagger['analyzeTestContent'](complexContent, 'auth-api.test.ts');
      
      expect(tags).toContain('@integration');
      expect(tags).toContain('@api');
      expect(tags).toContain('@auth');
      expect(tags).toContain('@validation');
      expect(tags).not.toContain('@server-dependent'); // MSW mock
      expect(tags).not.toContain('@unit'); // Has MSW setup
    });
  });
});