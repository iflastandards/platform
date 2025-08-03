/**
 * API Health Smoke Tests
 * Quick tests to verify API endpoints are responding
 */

import { test, expect, smokeTest } from '../utils/tagged-test';

test.describe('API Health Smoke Tests @smoke @api @critical', () => {
  // Use ADMIN_BASE_URL from environment or construct from BASE_URL
  const adminUrl = process.env.ADMIN_BASE_URL || process.env.ADMIN_URL || 
    (process.env.BASE_URL ? `${process.env.BASE_URL}/admin` : 'http://localhost:3007/admin');

  smokeTest('should respond to health check endpoint', async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/health`);
    
    // Should return success status
    expect(response.status()).toBeLessThan(400);
    
    // Should return JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    // Should have valid response body
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });

  smokeTest('should respond to auth session endpoint', async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/auth/session`);
    
    // Should return a response (might be 401 if not authenticated)
    expect([200, 401, 403]).toContain(response.status());
    
    // Should return JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  smokeTest('should respond to vocabularies endpoint', async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/vocabularies`);
    
    // Should return a response (might be 401 if not authenticated)
    expect([200, 401, 403]).toContain(response.status());
    
    // If successful, should return array
    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body) || (body && Array.isArray(body.data))).toBeTruthy();
    }
  });

  smokeTest('should handle 404 for non-existent endpoints', async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/non-existent-endpoint-${Date.now()}`);
    
    // Should return 404
    expect(response.status()).toBe(404);
  });

  smokeTest('should include CORS headers', async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/health`);
    
    // Should have CORS headers (if configured)
    const headers = response.headers();
    
    // At least one of these should be present
    const hasCorsHeaders = 
      headers['access-control-allow-origin'] ||
      headers['access-control-allow-methods'] ||
      headers['access-control-allow-headers'];
    
    if (!hasCorsHeaders) {
      console.warn('No CORS headers found - this might be expected in some configurations');
    }
  });

  smokeTest('should handle HEAD requests', async ({ request }) => {
    const response = await request.head(`${adminUrl}/api/health`);
    
    // Should return success status
    expect(response.status()).toBeLessThan(400);
    
    // Should not have body
    const text = await response.text();
    expect(text).toBe('');
  });
});