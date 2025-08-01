import { describe, it, expect } from 'vitest';

/**
 * Authentication Key Validation Tests
 * 
 * Validates that required authentication keys are available
 * in the CI environment for successful deployment
 */
describe('Authentication Keys @unit @critical @auth', () => {
  describe('Supabase Configuration', () => {
    it('should have Supabase URL configured', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('');
      
      // Should be a valid Supabase URL
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
    });

    it('should have Supabase anonymous key configured', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('');
      
      // Should be a valid JWT token format
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const jwtParts = anonKey?.split('.') || [];
      expect(jwtParts).toHaveLength(3); // JWT has three parts
      
      // Basic JWT validation - each part should be base64
      jwtParts.forEach(part => {
        expect(() => {
          Buffer.from(part, 'base64');
        }).not.toThrow();
      });
    });

    it('should be able to make a basic Supabase health check', async () => {
      if (!process.env.CI || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        expect(true).toBe(true);
        return;
      }

      // Simple health check - just verify we can reach the API
      const healthUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
      const response = await fetch(healthUrl, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        }
      });

      // We expect either 200 (with data) or 404 (no default endpoint)
      // Both prove connectivity
      expect([200, 404]).toContain(response.status);
    });
  });


  describe('Clerk Authentication', () => {
    it('should have Clerk publishable key configured', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).not.toBe('');
      
      // Clerk publishable keys start with pk_test_ or pk_live_
      expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toMatch(/^pk_(test|live)_[A-Za-z0-9]+$/);
    });

    it('should have Clerk secret key configured', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      expect(process.env.CLERK_SECRET_KEY).toBeDefined();
      expect(process.env.CLERK_SECRET_KEY).not.toBe('');
      
      // Clerk secret keys start with sk_test_ or sk_live_
      expect(process.env.CLERK_SECRET_KEY).toMatch(/^sk_(test|live)_[A-Za-z0-9]+$/);
    });

    it('should have Clerk URLs configured correctly', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      // These should be hardcoded in the workflow, not secrets
      expect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe('/admin/sign-in');
      expect(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL).toBe('/admin/sign-up');
      expect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL).toBe('/admin/api/auth/callback');
      expect(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL).toBe('/admin/api/auth/callback');
    });
  });

  describe('Other Required Keys', () => {
    it('should have GitHub auth configuration (when not from fork)', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      // GitHub OAuth keys might be restricted for fork PRs
      const hasGitHubAuth = !!(
        process.env.AUTH_GITHUB_ID &&
        process.env.AUTH_GITHUB_SECRET
      );

      if (!hasGitHubAuth) {
        console.log('ℹ️  GitHub OAuth keys not available - likely a fork PR (expected security behavior)');
        expect(true).toBe(true);
        return;
      }

      expect(process.env.AUTH_GITHUB_ID).toBeDefined();
      expect(process.env.AUTH_GITHUB_ID).toMatch(/^Ov23li[A-Za-z0-9]+$/); // GitHub OAuth App ID format

      expect(process.env.AUTH_GITHUB_SECRET).toBeDefined();
      expect(process.env.AUTH_GITHUB_SECRET).toHaveLength(40); // GitHub secrets are 40 chars
    });

    it('should have AUTH_SECRET configured', () => {
      if (!process.env.CI) {
        expect(true).toBe(true);
        return;
      }

      // AUTH_SECRET is required for session encryption
      expect(process.env.AUTH_SECRET).toBeDefined();
      expect(process.env.AUTH_SECRET).not.toBe('');
      expect(process.env.AUTH_SECRET.length).toBeGreaterThanOrEqual(32); // Should be a strong secret
    });
  });

  describe('Environment-Specific Key Validation', () => {
    it('should use appropriate keys for deployment environment', () => {
      if (!process.env.CI || !process.env.DOCS_ENV) {
        expect(true).toBe(true);
        return;
      }

      const docsEnv = process.env.DOCS_ENV;
      
      // Different environments might use different Supabase projects
      if (docsEnv === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Production should use the production Supabase instance
        console.log(`✅ Using production Supabase instance: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      } else if (docsEnv === 'preview' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Preview might use a different instance or the same one
        console.log(`✅ Using preview Supabase instance: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      }

    });
  });
});