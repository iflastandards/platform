import { test as base } from '@playwright/test';
import { TestTags, shouldRunInEnvironment, getTimeoutFromTags, getRetryCountFromTags } from './test-tags';

/**
 * Extended Playwright test with tagging support
 * We create a custom test runner that processes tags before each test
 */
export const test = base.extend({
  // Add a custom fixture that runs automatically
  _autoTagProcessor: [async ({}, use, testInfo) => {
    const tags = testInfo.title.match(/@[\w-]+/g) || [];
    
    // Check if test should run in current environment
    if (!shouldRunInEnvironment(tags)) {
      testInfo.skip();
      await use();
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

// The test object already has all these methods from base.extend()
// We don't need to reassign them

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
export const smokeTest = function(title: string, callback: any) {
  test(`${title} ${TestTags.SMOKE}`, callback);
};

smokeTest.describe = (title: string, callback: () => void) => {
  test.describe(`${title} ${TestTags.SMOKE}`, callback);
};
smokeTest.beforeEach = test.beforeEach;
smokeTest.afterEach = test.afterEach;
smokeTest.beforeAll = test.beforeAll;
smokeTest.afterAll = test.afterAll;
smokeTest.skip = (title: string, callback: any) => {
  test.skip(`${title} ${TestTags.SMOKE}`, callback);
};
smokeTest.only = (title: string, callback: any) => {
  test.only(`${title} ${TestTags.SMOKE}`, callback);
};
smokeTest.fixme = (title: string, callback: any) => {
  test.fixme(`${title} ${TestTags.SMOKE}`, callback);
};

/**
 * Helper to create an integration test
 */
export const integrationTest = function(title: string, callback: any) {
  test(`${title} ${TestTags.INTEGRATION}`, callback);
};

integrationTest.describe = (title: string, callback: () => void) => {
  test.describe(`${title} ${TestTags.INTEGRATION}`, callback);
};
integrationTest.beforeEach = test.beforeEach;
integrationTest.afterEach = test.afterEach;
integrationTest.beforeAll = test.beforeAll;
integrationTest.afterAll = test.afterAll;
integrationTest.skip = (title: string, callback: any) => {
  test.skip(`${title} ${TestTags.INTEGRATION}`, callback);
};
integrationTest.only = (title: string, callback: any) => {
  test.only(`${title} ${TestTags.INTEGRATION}`, callback);
};
integrationTest.fixme = (title: string, callback: any) => {
  test.fixme(`${title} ${TestTags.INTEGRATION}`, callback);
};

/**
 * Helper to create an e2e test
 */
export const e2eTest = function(title: string, callback: any) {
  test(`${title} ${TestTags.E2E}`, callback);
};

e2eTest.describe = (title: string, callback: () => void) => {
  test.describe(`${title} ${TestTags.E2E}`, callback);
};
e2eTest.beforeEach = test.beforeEach;
e2eTest.afterEach = test.afterEach;
e2eTest.beforeAll = test.beforeAll;
e2eTest.afterAll = test.afterAll;
e2eTest.skip = (title: string, callback: any) => {
  test.skip(`${title} ${TestTags.E2E}`, callback);
};
e2eTest.only = (title: string, callback: any) => {
  test.only(`${title} ${TestTags.E2E}`, callback);
};
e2eTest.fixme = (title: string, callback: any) => {
  test.fixme(`${title} ${TestTags.E2E}`, callback);
};

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

// Re-export expect and Page type for convenience
export { expect, type Page } from '@playwright/test';

// Re-export tags builder for convenience
export { tags } from './test-tags';