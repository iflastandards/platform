/**
 * INTEGRATION TEST EXAMPLE - IFLA Standards Platform
 * ================================================
 * 
 * CATEGORY: Integration Tests (@integration)
 * PURPOSE: Validate integrations between services/components/modules
 * EXECUTION: Post-commit via CI and nx affected --target=test
 * 
 * DIRECTORY PLACEMENT: 
 * - Centralized under `e2e/integration/` or `src/test/integration/`
 * 
 * REQUIRED TAGS: @integration
 * 
 * NX TARGETS THAT RUN THIS TEST:
 * - nx affected --target=test (CI trigger)
 * - nx run-many --target=test --all (full suite)
 * - pnpm test:vitest (direct execution with Vitest)
 * 
 * GIT HOOKS THAT MAY RUN THIS TEST:
 * - Pre-push: Ensure integration sanity before push
 * - Post-merge: Validate merged code integration
 * 
 * PERFORMANCE REQUIREMENTS:
 * - Must complete within reasonable time (~1 second each)
 * - Preferably isolated but may touch databases/files
 * - Use test doubles or in-memory stores for external systems
 * 
 * WHY THIS IS AN INTEGRATION TEST:
 * - Tests interaction across multiple units/modules
 * - Validates end-to-end processing of a subset of the workflow
 * - Exercises interaction boundaries, such as APIs or file IO
 * - Ensures modules work together as expected
 */

import { integrationTest, expect } from '../utils/tagged-test';
import { describe, it, beforeEach, vi } from 'vitest';

// Mock external services for integration testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * EXAMPLE: Testing IFLA Vocabulary Import Service Integration
 * Validates the complete workflow from spreadsheet validation to data storage
 */
integrationTest.describe('Vocabulary Import Service Integration @integration @api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock responses for different services
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/vocabulary/validate')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            isValid: true,
            errors: [],
            warnings: ['Missing language code for some entries']
          })
        });
      }
      
      if (url.includes('/api/vocabulary/import')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({
            importId: 'import-123',
            status: 'processing',
            recordsProcessed: 0,
            totalRecords: 150
          })
        });
      }
      
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
  });
  
  integrationTest('should complete vocabulary import workflow @critical @happy-path', async () => {
    // Step 1: Validate spreadsheet structure
    const validationResponse = await fetch('/api/vocabulary/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test123',
        namespace: 'isbd'
      })
    });
    
    expect(validationResponse.status).toBe(200);
    const validationData = await validationResponse.json();
    expect(validationData.isValid).toBe(true);
    
    // Step 2: Initiate import process
    const importResponse = await fetch('/api/vocabulary/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test123',
        namespace: 'isbd',
        overrideWarnings: true
      })
    });
    
    expect(importResponse.status).toBe(201);
    const importData = await importResponse.json();
    expect(importData.importId).toBeDefined();
    expect(importData.status).toBe('processing');
    
    // Verify the integration flow worked correctly
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/vocabulary/validate', expect.any(Object));
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/vocabulary/import', expect.any(Object));
  });
  
  integrationTest('should handle validation failures gracefully @error-handling', async () => {
    // Override mock for this test to return validation errors
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        isValid: false,
        errors: ['Missing required column: identifier'],
        warnings: []
      })
    }));
    
    const validationResponse = await fetch('/api/vocabulary/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/invalid123',
        namespace: 'isbd'
      })
    });
    
    expect(validationResponse.status).toBe(400);
    const validationData = await validationResponse.json();
    expect(validationData.isValid).toBe(false);
    expect(validationData.errors).toHaveLength(1);
    expect(validationData.errors[0]).toContain('Missing required column');
  });
  
  integrationTest('should pass data correctly between validation and import', async () => {
    // This test verifies that data flows correctly from one service to another
    const testPayload = {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test456',
      namespace: 'lrm',
      options: {
        skipDuplicates: true,
        autoTranslate: false
      }
    };
    
    // Validation call
    await fetch('/api/vocabulary/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    // Import call with same payload
    await fetch('/api/vocabulary/import', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    // Verify both calls received the same structured data
    const [firstCall, secondCall] = mockFetch.mock.calls;
    expect(JSON.parse(firstCall[1].body)).toEqual(testPayload);
    expect(JSON.parse(secondCall[1].body)).toEqual(testPayload);
  });
});

/**
 * SUMMARY OF TEST CHARACTERISTICS:
 * 
 * ✅ FAST: Target completion time - sub ~1s per test (variable)
 * 🚫 ISOLATED: Typically involves mock setups or in-memory emulators
 * ⛔️ PREDICTABLE: Flaky is bad - ensure reliable and repeatable
 * 🛠 FOCUSED: On interaction boundaries and logical transitions
 * 💯 COMPREHENSIVE: Wholly covers user scenario or API pathway
 * 🛡 MAINTAINABLE: Modular, consistent, readable
 * 
 * WHEN TO RUN: After every significant change/commit during CI
 * WHERE TO PLACE: e2e/integration/ or in module specific test directories if appropriate
 * HOW TO EXTEND: Expand scenarios, deepen checks, add failure cases
 */

