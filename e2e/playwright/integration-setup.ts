/**
 * Integration Test Global Setup
 * Prepares the environment for integration tests
 */

import { FullConfig } from '@playwright/test';
import { databaseFixture } from '../fixtures/database.fixture';

export default async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Integration Test Setup\n');
  
  try {
    // Set up environment variables for integration tests
    process.env.TEST_TYPE = 'integration';
    process.env.NODE_ENV = 'test';
    
    // Seed database with test data
    console.log('Seeding database for integration tests...');
    await databaseFixture.seed();
    
    // Start any required services
    await startRequiredServices();
    
    // Warm up API endpoints
    await warmUpAPIs();
    
    console.log('✅ Integration test setup completed\n');
  } catch (error) {
    console.error('❌ Integration test setup failed:', error);
    throw error;
  }
}

/**
 * Start required services for integration tests
 */
async function startRequiredServices(): Promise<void> {
  console.log('Starting required services...');
  
  // TODO: Start any mock services or test servers needed
  // Examples:
  // - Mock authentication server
  // - Test database server
  // - Mock external APIs
  
  // For now, we'll just ensure the main services are accessible
  const services = [
    { name: 'Portal', url: 'http://localhost:3000', required: true },
    { name: 'Admin', url: 'http://localhost:3007/admin', required: true },
    { name: 'API', url: 'http://localhost:3007/admin/api/health', required: false },
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      
      if (response?.ok) {
        console.log(`  ✅ ${service.name} is accessible at ${service.url}`);
      } else if (service.required) {
        throw new Error(`Required service ${service.name} is not accessible at ${service.url}`);
      } else {
        console.log(`  ⚠️  ${service.name} is not accessible at ${service.url} (optional)`);
      }
    } catch (error) {
      if (service.required) {
        throw error;
      }
      console.log(`  ⚠️  ${service.name} check failed (optional): ${error}`);
    }
  }
}

/**
 * Warm up API endpoints to ensure they're ready
 */
async function warmUpAPIs(): Promise<void> {
  console.log('Warming up API endpoints...');
  
  const endpoints = [
    '/api/health',
    '/api/auth/session',
    '/api/vocabularies',
  ];
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3007/admin';
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      }).catch(() => null);
      
      if (response) {
        console.log(`  ✅ Warmed up ${endpoint} (${response.status})`);
      } else {
        console.log(`  ⚠️  Could not warm up ${endpoint}`);
      }
    } catch (error) {
      console.log(`  ⚠️  Failed to warm up ${endpoint}:`, error);
    }
  }
}