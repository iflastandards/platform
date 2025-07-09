import { describe, it, expect, beforeAll } from 'vitest';

describe('CORS Integration', () => {
  const adminBaseUrl = 'http://localhost:3007/admin';
  const portalOrigin = 'http://localhost:3000';

  // Helper function to check if admin server is running
  const isServerRunning = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${adminBaseUrl}/api/auth/session`);
      return response !== undefined;
    } catch {
      return false;
    }
  };

  beforeAll(async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn(
        'Admin server not running at http://localhost:3007/admin - skipping CORS integration tests',
      );
      console.warn(
        'To run these tests, start the admin server with: nx dev admin',
      );
    }
  });

  it('should allow CORS requests from portal origin', async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn('Skipping test - admin server not running');
      return;
    }

    const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        Origin: portalOrigin,
        Accept: 'application/json',
      },
    });

    // Check that CORS headers are present
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      portalOrigin,
    );
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
      'true',
    );
  });

  it('should handle preflight OPTIONS requests', async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn('Skipping test - admin server not running');
      return;
    }

    const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
      method: 'OPTIONS',
      headers: {
        Origin: portalOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      portalOrigin,
    );
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
      'true',
    );
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'GET',
    );
  });

  it('should reject requests from unauthorized origins', async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn('Skipping test - admin server not running');
      return;
    }

    const unauthorizedOrigin = 'http://malicious-site.com';

    const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        Origin: unauthorizedOrigin,
        Accept: 'application/json',
      },
    });

    // Should not include CORS headers for unauthorized origin
    expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe(
      unauthorizedOrigin,
    );
  });

  it('should allow requests from all configured local origins', async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn('Skipping test - admin server not running');
      return;
    }

    const allowedOrigins = [
      'http://localhost:3000', // Portal
      'http://localhost:3001', // ISBDM
      'http://localhost:3008', // NewTest
    ];

    for (const origin of allowedOrigins) {
      const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
        method: 'GET',
        headers: {
          Origin: origin,
          Accept: 'application/json',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true',
      );
    }
  });
});
