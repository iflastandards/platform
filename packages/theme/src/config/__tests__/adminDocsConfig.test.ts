/**
 * @tags @unit @critical @admin @docs @config
 * @description Tests for getAdminDocsConfig and getAdminDocsConfigAuto functions 
 * that ensure Admin Docs configuration returns correct URLs and auto-detects 
 * environment based on hostname
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getAdminDocsConfig, 
  getAdminDocsConfigAuto,
  ADMIN_DOCS_CONFIG
} from '../siteConfig';
import type { Environment, AdminDocsConfig } from '../siteConfig';

describe('getAdminDocsConfig', () => {
  it('should return the correct config for local environment', () => {
    const config = getAdminDocsConfig('local');
    
    expect(config.url).toBe('http://localhost:3030');
    expect(config.signinUrl).toBe('http://localhost:3030/sign-in');
    expect(config.dashboardUrl).toBe('http://localhost:3030');
    expect(config.signoutUrl).toBe('http://localhost:3030/api/auth/signout');
    expect(config.sessionApiUrl).toBe('http://localhost:3030/api/auth/session');
    expect(config.port).toBe(3030);
  });

  it('should return the correct config for preview environment', () => {
    const config = getAdminDocsConfig('preview');
    
    expect(config.url).toBe('https://docs-iflastandards-preview.onrender.com');
    expect(config.signinUrl).toBe('https://docs-iflastandards-preview.onrender.com/sign-in');
    expect(config.dashboardUrl).toBe('https://docs-iflastandards-preview.onrender.com');
    expect(config.signoutUrl).toBe('https://docs-iflastandards-preview.onrender.com/api/auth/signout');
    expect(config.sessionApiUrl).toBe('https://docs-iflastandards-preview.onrender.com/api/auth/session');
    expect(config.port).toBeUndefined();
  });

  it('should return the correct config for production environment', () => {
    const config = getAdminDocsConfig('production');
    
    expect(config.url).toBe('https://docs.iflastandards.info');
    expect(config.signinUrl).toBe('https://docs.iflastandards.info/sign-in');
    expect(config.dashboardUrl).toBe('https://docs.iflastandards.info');
    expect(config.signoutUrl).toBe('https://docs.iflastandards.info/api/auth/signout');
    expect(config.sessionApiUrl).toBe('https://docs.iflastandards.info/api/auth/session');
    expect(config.port).toBeUndefined();
  });

  it('should return a new object instance to avoid shared references', () => {
    const config1 = getAdminDocsConfig('local');
    const config2 = getAdminDocsConfig('local');
    
    expect(config1).not.toBe(config2); // Different object instances
    expect(config1).toEqual(config2); // Same content
  });

  it('should handle all valid environment types', () => {
    const environments: Environment[] = ['local', 'preview', 'production'];
    
    environments.forEach((env) => {
      expect(() => getAdminDocsConfig(env)).not.toThrow();
      const config = getAdminDocsConfig(env);
      expect(typeof config.url).toBe('string');
      expect(typeof config.signinUrl).toBe('string');
      expect(typeof config.dashboardUrl).toBe('string');
      expect(typeof config.signoutUrl).toBe('string');
      expect(typeof config.sessionApiUrl).toBe('string');
      expect(config.url.length).toBeGreaterThan(0);
    });
  });

  it('should throw an error for invalid environment', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getAdminDocsConfig('invalid')).toThrow('Admin docs configuration missing for invalid');
  });
});

describe('getAdminDocsConfigAuto', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset window object mock
    if (typeof window !== 'undefined') {
      delete (global as any).window;
    }
  });

  it('should return local config when window is undefined (server-side)', () => {
    // Ensure window is undefined
    expect(typeof window).toBe('undefined');
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('local');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should return production config for docs.iflastandards.info hostname', () => {
    // Mock window.location
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'docs.iflastandards.info'
        }
      },
      writable: true,
      configurable: true
    });
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('production');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should return preview config for docs-iflastandards-preview.onrender.com hostname', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'docs-iflastandards-preview.onrender.com'
        }
      },
      writable: true,
      configurable: true
    });
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('preview');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should return production config for general ifla.org domains', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'standards.ifla.org'
        }
      },
      writable: true,
      configurable: true
    });
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('production');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should return preview config for GitHub Pages hosting', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'iflastandards.github.io'
        }
      },
      writable: true,
      configurable: true
    });
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('preview');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should return preview config for other hosting providers', () => {
    const hostnames = [
      'app.netlify.com',
      'some-app.onrender.com',
      'my-site.github.io'
    ];

    hostnames.forEach((hostname) => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          location: { hostname }
        },
        writable: true,
        configurable: true
      });
      
      const config = getAdminDocsConfigAuto();
      const expectedConfig = getAdminDocsConfig('preview');
      
      expect(config).toEqual(expectedConfig);
    });
  });

  it('should default to local config for unrecognized hostnames', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          hostname: 'localhost'
        }
      },
      writable: true,
      configurable: true
    });
    
    const config = getAdminDocsConfigAuto();
    const expectedConfig = getAdminDocsConfig('local');
    
    expect(config).toEqual(expectedConfig);
  });

  it('should default to local config for localhost variants', () => {
    const localhostVariants = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ];

    localhostVariants.forEach((hostname) => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          location: { hostname }
        },
        writable: true,
        configurable: true
      });
      
      const config = getAdminDocsConfigAuto();
      const expectedConfig = getAdminDocsConfig('local');
      
      expect(config).toEqual(expectedConfig);
    });
  });
});

describe('ADMIN_DOCS_CONFIG constant', () => {
  it('should have configurations for all environments', () => {
    expect(ADMIN_DOCS_CONFIG).toHaveProperty('local');
    expect(ADMIN_DOCS_CONFIG).toHaveProperty('preview');
    expect(ADMIN_DOCS_CONFIG).toHaveProperty('production');
  });

  it('should have consistent structure across environments', () => {
    const environments: Environment[] = ['local', 'preview', 'production'];
    
    environments.forEach((env) => {
      const config = ADMIN_DOCS_CONFIG[env];
      expect(config).toHaveProperty('url');
      expect(config).toHaveProperty('signinUrl');
      expect(config).toHaveProperty('dashboardUrl');
      expect(config).toHaveProperty('signoutUrl');
      expect(config).toHaveProperty('sessionApiUrl');
      
      // Only local should have port
      if (env === 'local') {
        expect(config).toHaveProperty('port', 3030);
      } else {
        expect(config.port).toBeUndefined();
      }
    });
  });

  it('should use HTTPS for non-local environments', () => {
    expect(ADMIN_DOCS_CONFIG.preview.url).toMatch(/^https:/);
    expect(ADMIN_DOCS_CONFIG.production.url).toMatch(/^https:/);
  });

  it('should use HTTP for local environment', () => {
    expect(ADMIN_DOCS_CONFIG.local.url).toMatch(/^http:/);
  });
});
