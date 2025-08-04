/**
 * @tags @unit @critical @navigation @sites
 * @description Tests for getPortalUrl helper function that ensures Portal links 
 * point to correct URLs across all environments
 */
import { describe, it, expect } from 'vitest';
import { getPortalUrl } from '../siteConfig';
import type { Environment } from '../siteConfig';

describe('getPortalUrl', () => {
  it('should return the correct URL for local environment', () => {
    const url = getPortalUrl('local');
    expect(url).toBe('http://localhost:3000/');
  });

  it('should return the correct URL for preview environment', () => {
    const url = getPortalUrl('preview');
    expect(url).toBe('https://iflastandards.github.io/platform/');
  });

  it('should return the correct URL for production environment', () => {
    const url = getPortalUrl('production');
    expect(url).toBe('https://www.iflastandards.info/');
  });

  it('should handle all valid environment types', () => {
    const environments: Environment[] = ['local', 'preview', 'production'];
    
    environments.forEach((env) => {
      expect(() => getPortalUrl(env)).not.toThrow();
      expect(typeof getPortalUrl(env)).toBe('string');
      expect(getPortalUrl(env).length).toBeGreaterThan(0);
    });
  });

  it('should throw an error for invalid environment', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getPortalUrl('invalid')).toThrow();
  });
});
