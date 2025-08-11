/**
 * Global Setup for Smoke Tests
 * Validates deployed sites are accessible
 * Only runs against preview/production environments
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  console.log('🚀 Setting up smoke test environment...');
  
  // Get environment from DOCS_ENV (preview or production only)
  const environment = process.env.DOCS_ENV || 'preview';
  if (environment !== 'preview' && environment !== 'production') {
    throw new Error(`Invalid DOCS_ENV: ${environment}. Smoke tests only run against 'preview' or 'production'`);
  }
  
  const baseURL = environment === 'production' 
    ? 'https://www.iflastandards.info'
    : 'https://iflastandards.github.io/platform';
  
  console.log(`🎯 Testing environment: ${environment}`);
  console.log(`🌐 Base URL: ${baseURL}`);
  
  // Verify the deployed site is responding
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`🔍 Performing health check on ${baseURL}...`);
    await page.goto(baseURL, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('✅ Health check passed - deployed site is accessible');
  } catch (error) {
    console.error('❌ Health check failed - deployed site is not accessible:', error);
    throw error; // Fail fast if deployed site is not accessible
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
  
  console.log('✅ Smoke test environment ready!');
}

export default globalSetup;
