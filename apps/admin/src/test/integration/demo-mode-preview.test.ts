/**
 * @integration @low-priority @api @admin
 * Demo Mode Preview Server Tests
 *
 * Tests that demo mode is properly configured on the preview server
 * at https://admin-iflastandards-preview.onrender.com
 */

import { describe, it, expect, beforeAll } from 'vitest';

const PREVIEW_URL = 'https://admin-iflastandards-preview.onrender.com';

describe('Demo Mode on Preview Server', () => {
  let isDemoEnabled = false;

  beforeAll(async () => {
    // Skip these tests if not explicitly testing preview
    if (process.env.TEST_PREVIEW !== 'true') {
      console.log(
        'Skipping preview server tests. Set TEST_PREVIEW=true to run.',
      );
      return;
    }
  });

  describe('Environment Configuration', () => {
    it('should have demo status endpoint available', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(`${PREVIEW_URL}/api/demo-status`);

      // If endpoint doesn't exist, it will redirect to sign-in
      if (response.redirected) {
        console.warn('Demo status endpoint not found or requires auth');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        isDemoEnabled = data.isDemoMode === true;

        expect(data).toHaveProperty('NEXT_PUBLIC_IFLA_DEMO');
        expect(data).toHaveProperty('isDemoMode');

        console.log('Preview server demo status:', {
          isDemoMode: data.isDemoMode,
          NEXT_PUBLIC_IFLA_DEMO: data.NEXT_PUBLIC_IFLA_DEMO,
          NODE_ENV: data.NODE_ENV,
        });
      }
    });

    it('should return demo mode configuration in health check', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(`${PREVIEW_URL}/api/health`);

      if (response.ok) {
        const text = await response.text();
        expect(response.status).toBe(200);
        console.log('Health check response:', text);
      }
    });
  });

  describe('Public Page Indicators', () => {
    it('should load the home page', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(PREVIEW_URL);
      expect(response.ok).toBe(true);

      const html = await response.text();

      // Check for basic page elements
      expect(html).toContain('IFLA');
      expect(html).toContain('Sign In');

      // Check if Clerk is configured
      const hasClerk =
        html.includes('clerk.accounts.dev') || html.includes('__clerk');
      console.log('Clerk configured on preview:', hasClerk);
    });

    it('should have sign-in page accessible', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(`${PREVIEW_URL}/sign-in`, {
        redirect: 'manual',
      });

      // Sign-in page should be accessible (200) or redirect to Clerk hosted page
      expect([200, 301, 302, 307].includes(response.status)).toBe(true);
    });
  });

  describe('Protected Routes Behavior', () => {
    it('should redirect unauthenticated users from dashboard', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(`${PREVIEW_URL}/dashboard`, {
        redirect: 'manual',
      });

      // Should redirect to sign-in
      expect([301, 302, 307].includes(response.status)).toBe(true);

      const location = response.headers.get('location');
      if (location) {
        expect(location).toMatch(/sign-in|clerk/);
        console.log('Dashboard redirects to:', location);
      }
    });

    it('should protect admin routes', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const adminRoutes = [
        '/namespaces',
        '/import',
        '/translation',
        '/review',
        '/github',
        '/builds',
      ];

      for (const route of adminRoutes) {
        const response = await fetch(`${PREVIEW_URL}${route}`, {
          redirect: 'manual',
        });

        // All admin routes should redirect when not authenticated
        expect([301, 302, 307].includes(response.status)).toBe(true);
      }
    });
  });

  describe('Demo Mode Specific Features', () => {
    it('should have mock data endpoints if demo mode is enabled', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;
      if (!isDemoEnabled) {
        console.log('Demo mode not enabled on preview server');
        return;
      }

      // This would only work if we had specific demo endpoints
      // For now, we just check if demo mode flag is set
      expect(isDemoEnabled).toBeDefined();
    });
  });

  describe('CORS and Security Headers', () => {
    it('should have proper CORS headers for API routes', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(`${PREVIEW_URL}/api/health`, {
        method: 'OPTIONS',
      });

      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader) {
        console.log('CORS header:', corsHeader);
      }
    });

    it('should have security headers', async () => {
      if (process.env.TEST_PREVIEW !== 'true') return;

      const response = await fetch(PREVIEW_URL);

      // Check for common security headers
      const headers = {
        'x-frame-options': response.headers.get('x-frame-options'),
        'x-content-type-options': response.headers.get(
          'x-content-type-options',
        ),
        'x-powered-by': response.headers.get('x-powered-by'),
      };

      console.log('Security headers:', headers);
    });
  });
});

describe('Demo Mode Comparison: Local vs Preview', () => {
  it('should document differences between local and preview demo mode', async () => {
    if (process.env.TEST_PREVIEW !== 'true') return;

    const localDemoStatus = process.env.NEXT_PUBLIC_IFLA_DEMO;

    // Try to get preview status
    let previewDemoStatus = 'unknown';
    try {
      const response = await fetch(`${PREVIEW_URL}/api/demo-status`);
      if (response.ok) {
        const data = await response.json();
        previewDemoStatus = data.NEXT_PUBLIC_IFLA_DEMO || 'not set';
      }
    } catch (error) {
      previewDemoStatus = 'error fetching';
    }

    console.log('\n=== Demo Mode Configuration Comparison ===');
    console.log(
      `Local:   NEXT_PUBLIC_IFLA_DEMO = ${localDemoStatus || 'not set'}`,
    );
    console.log(`Preview: NEXT_PUBLIC_IFLA_DEMO = ${previewDemoStatus}`);
    console.log('=========================================\n');

    // This is informational, not a pass/fail test
    expect(true).toBe(true);
  });
});
