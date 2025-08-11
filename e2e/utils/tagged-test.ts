import { test as base } from '@playwright/test';
import { TestTags, shouldRunInEnvironment, getTimeoutFromTags, getRetryCountFromTags, tags } from './test-tags';

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

// Ensure test has all the expected methods from base
test.describe = base.describe;
test.beforeEach = base.beforeEach;
test.afterEach = base.afterEach;
test.beforeAll = base.beforeAll;
test.afterAll = base.afterAll;
test.skip = base.skip;
test.only = base.only;
test.fixme = base.fixme;

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
export const smokeTest = Object.assign(
  function(title: string, callback: any) {
    test(`${title} ${TestTags.SMOKE}`, callback);
  },
  {
    describe: (title: string, callback: () => void) => {
      test.describe(`${title} ${TestTags.SMOKE}`, callback);
    },
    beforeEach: test.beforeEach,
    afterEach: test.afterEach,
    beforeAll: test.beforeAll,
    afterAll: test.afterAll,
    skip: (title: string, callback: any) => {
      test.skip(`${title} ${TestTags.SMOKE}`, callback);
    },
    only: (title: string, callback: any) => {
      test.only(`${title} ${TestTags.SMOKE}`, callback);
    },
    fixme: (title: string, callback: any) => {
      test.fixme(`${title} ${TestTags.SMOKE}`, callback);
    },
  }
);

/**
 * Helper to create an integration test
 */
export const integrationTest = Object.assign(
  function(title: string, callback: any) {
    test(`${title} ${TestTags.INTEGRATION}`, callback);
  },
  {
    describe: (title: string, callback: () => void) => {
      test.describe(`${title} ${TestTags.INTEGRATION}`, callback);
    },
    beforeEach: test.beforeEach,
    afterEach: test.afterEach,
    beforeAll: test.beforeAll,
    afterAll: test.afterAll,
    skip: (title: string, callback: any) => {
      test.skip(`${title} ${TestTags.INTEGRATION}`, callback);
    },
    only: (title: string, callback: any) => {
      test.only(`${title} ${TestTags.INTEGRATION}`, callback);
    },
    fixme: (title: string, callback: any) => {
      test.fixme(`${title} ${TestTags.INTEGRATION}`, callback);
    },
  }
);

/**
 * Helper to create an e2e test
 */
export const e2eTest = Object.assign(
  function(title: string, callback: any) {
    test(`${title} ${TestTags.E2E}`, callback);
  },
  {
    describe: (title: string, callback: () => void) => {
      test.describe(`${title} ${TestTags.E2E}`, callback);
    },
    beforeEach: test.beforeEach,
    afterEach: test.afterEach,
    beforeAll: test.beforeAll,
    afterAll: test.afterAll,
    skip: (title: string, callback: any) => {
      test.skip(`${title} ${TestTags.E2E}`, callback);
    },
    only: (title: string, callback: any) => {
      test.only(`${title} ${TestTags.E2E}`, callback);
    },
    fixme: (title: string, callback: any) => {
      test.fixme(`${title} ${TestTags.E2E}`, callback);
    },
  }
);

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