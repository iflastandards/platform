import { test as base } from '@playwright/test';
import { TestTags, shouldRunInEnvironment, getTimeoutFromTags, getRetryCountFromTags } from './test-tags';

/**
 * Extended Playwright test with tagging support
 */
export const test = base.extend({
  // Auto-skip tests based on environment tags
  auto: [async ({}, use, testInfo) => {
    const tags = testInfo.title.match(/@[\w-]+/g) || [];
    
    // Check if test should run in current environment
    if (!shouldRunInEnvironment(tags)) {
      testInfo.skip();
      return;
    }
    
    // Apply timeout based on tags
    const timeout = getTimeoutFromTags(tags, testInfo.timeout);
    testInfo.setTimeout(timeout);
    
    // Apply retry count based on tags
    const retries = getRetryCountFromTags(tags, testInfo.retry);
    if (retries > testInfo.retry) {
      // Note: We can't dynamically change retry count, but we can log it
      console.log(`Test ${testInfo.title} should have ${retries} retries based on tags`);
    }
    
    await use();
  }, { auto: true }],
});

/**
 * Helper to create a describe block with tags
 */
export function describe(title: string, tags: string | string[], callback: () => void) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  base.describe(`${title} ${tagString}`, callback);
}

/**
 * Helper to create a smoke test
 */
export function smokeTest(title: string, callback: any) {
  test(`${title} ${TestTags.SMOKE}`, callback);
}

/**
 * Helper to create an integration test
 */
export function integrationTest(title: string, callback: any) {
  test(`${title} ${TestTags.INTEGRATION}`, callback);
}

/**
 * Helper to create an e2e test
 */
export function e2eTest(title: string, callback: any) {
  test(`${title} ${TestTags.E2E}`, callback);
}

/**
 * Helper to create a critical test
 */
export function criticalTest(title: string, tags: string | string[], callback: any) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  test(`${title} ${TestTags.CRITICAL} ${tagString}`, callback);
}

/**
 * Helper to create a test that only runs in CI
 */
export function ciOnlyTest(title: string, tags: string | string[], callback: any) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  test(`${title} ${TestTags.CI_ONLY} ${tagString}`, callback);
}

/**
 * Helper to create a test that only runs locally
 */
export function localOnlyTest(title: string, tags: string | string[], callback: any) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  test(`${title} ${TestTags.LOCAL_ONLY} ${tagString}`, callback);
}

/**
 * Helper to skip a test with tags
 */
export function skipTest(title: string, tags: string | string[], callback: any) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  test.skip(`${title} ${TestTags.SKIP} ${tagString}`, callback);
}

/**
 * Helper to create a flaky test with automatic retries
 */
export function flakyTest(title: string, tags: string | string[], callback: any) {
  const tagString = Array.isArray(tags) ? tags.join(' ') : tags;
  test(`${title} ${TestTags.FLAKY} ${tagString}`, callback);
}

// Re-export expect for convenience
export { expect } from '@playwright/test';