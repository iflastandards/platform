import { describe, it, expect } from 'vitest';
import { testServerManager } from '../../utils/test-server-manager';

describe('Basic Server Test', () => {
  it('should be able to start and stop admin server', async () => {
    console.log('Starting basic server test...');

    try {
      await testServerManager.startServer('admin');
      console.log('Admin server started successfully');

      // Simple health check
      const response = await fetch('http://localhost:3007/api/auth/session');
      console.log('Health check response status:', response.status);

      expect(response.status).toBeLessThan(500);

      await testServerManager.stopServer('admin');
      console.log('Admin server stopped successfully');
    } catch (error) {
      console.error('Server test failed:', error);
      throw error;
    }
  }, 60000); // 60 second timeout
});
