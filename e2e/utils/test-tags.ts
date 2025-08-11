/**
 * Test Tagging System for Playwright Tests
 * Provides utilities for tagging and organizing tests by category
 */

/**
 * Available test tags for categorizing tests
 */
export const TestTags = {
  // Test level tags
  UNIT: '@unit',
  SMOKE: '@smoke',
  INTEGRATION: '@integration',
  E2E: '@e2e',
  ENV: '@env',
  
  // Priority tags
  CRITICAL: '@critical',
  HIGH_PRIORITY: '@high-priority',
  LOW_PRIORITY: '@low-priority',
  
  // Feature area tags
  AUTH: '@auth',
  RBAC: '@rbac',
  API: '@api',
  UI: '@ui',
  DASHBOARD: '@dashboard',
  ADMIN: '@admin',
  DOCS: '@docs',
  NAVIGATION: '@navigation',
  SEARCH: '@search',
  VOCABULARY: '@vocabulary',
  
  // Environment tags
  LOCAL_ONLY: '@local-only',
  CI_ONLY: '@ci-only',
  PREVIEW_ONLY: '@preview-only',
  PRODUCTION_ONLY: '@production-only',
  
  // Browser-specific tags
  CHROMIUM_ONLY: '@chromium-only',
  FIREFOX_ONLY: '@firefox-only',
  WEBKIT_ONLY: '@webkit-only',
  MOBILE_ONLY: '@mobile-only',
  
  // Special tags
  FLAKY: '@flaky',
  SKIP: '@skip',
  SLOW: '@slow',
  FAST: '@fast',
  VISUAL: '@visual',
  PERFORMANCE: '@performance',
} as const;

/**
 * Helper function to create a tagged test description
 */
export function taggedTest(...tags: string[]): string {
  return tags.join(' ');
}

/**
 * Helper function to create test title with tags
 */
export function testWithTags(title: string, ...tags: string[]): string {
  return `${title} ${taggedTest(...tags)}`;
}

/**
 * Type-safe test tag builder
 */
export class TestTagBuilder {
  private tags: Set<string> = new Set();
  
  unit(): this {
    this.tags.add(TestTags.UNIT);
    return this;
  }
  
  smoke(): this {
    this.tags.add(TestTags.SMOKE);
    return this;
  }
  
  integration(): this {
    this.tags.add(TestTags.INTEGRATION);
    return this;
  }
  
  e2e(): this {
    this.tags.add(TestTags.E2E);
    return this;
  }
  
  env(): this {
    this.tags.add(TestTags.ENV);
    return this;
  }
  
  critical(): this {
    this.tags.add(TestTags.CRITICAL);
    return this;
  }
  
  auth(): this {
    this.tags.add(TestTags.AUTH);
    return this;
  }
  
  rbac(): this {
    this.tags.add(TestTags.RBAC);
    return this;
  }
  
  api(): this {
    this.tags.add(TestTags.API);
    return this;
  }
  
  ui(): this {
    this.tags.add(TestTags.UI);
    return this;
  }
  
  admin(): this {
    this.tags.add(TestTags.ADMIN);
    return this;
  }
  
  dashboard(): this {
    this.tags.add(TestTags.DASHBOARD);
    return this;
  }
  
  flaky(): this {
    this.tags.add(TestTags.FLAKY);
    return this;
  }
  
  slow(): this {
    this.tags.add(TestTags.SLOW);
    return this;
  }
  
  mobile(): this {
    this.tags.add(TestTags.MOBILE_ONLY);
    return this;
  }
  
  ciOnly(): this {
    this.tags.add(TestTags.CI_ONLY);
    return this;
  }
  
  localOnly(): this {
    this.tags.add(TestTags.LOCAL_ONLY);
    return this;
  }
  
  performance(): this {
    this.tags.add(TestTags.PERFORMANCE);
    return this;
  }
  
  security(): this {
    this.tags.add('@security');
    return this;
  }
  
  navigation(): this {
    this.tags.add(TestTags.NAVIGATION);
    return this;
  }
  
  validation(): this {
    this.tags.add('@validation');
    return this;
  }
  
  authentication(): this {
    this.tags.add('@authentication');
    return this;
  }
  
  buildTag(): this {
    this.tags.add('@build');
    return this;
  }
  
  standards(): this {
    this.tags.add('@standards');
    return this;
  }
  
  portal(): this {
    this.tags.add('@portal');
    return this;
  }
  
  custom(tag: string): this {
    this.tags.add(tag.startsWith('@') ? tag : `@${tag}`);
    return this;
  }
  
  build(): string {
    return Array.from(this.tags).join(' ');
  }
  
  buildArray(): string[] {
    return Array.from(this.tags);
  }
}

/**
 * Factory function to create a new tag builder
 */
export function tags(): TestTagBuilder {
  return new TestTagBuilder();
}

/**
 * Helper to check if test should run in current environment
 */
export function shouldRunInEnvironment(tags: string[], environment?: string): boolean {
  const isCI = process.env.CI === 'true';
  const currentEnv = environment || process.env.TEST_ENV || (isCI ? 'ci' : 'local');
  
  // Check for environment-specific exclusions
  if (tags.includes(TestTags.CI_ONLY) && currentEnv !== 'ci') {
    return false;
  }
  
  if (tags.includes(TestTags.LOCAL_ONLY) && currentEnv === 'ci') {
    return false;
  }
  
  if (tags.includes(TestTags.PREVIEW_ONLY) && currentEnv !== 'preview') {
    return false;
  }
  
  if (tags.includes(TestTags.PRODUCTION_ONLY) && currentEnv !== 'production') {
    return false;
  }
  
  return true;
}

/**
 * Helper to get timeout based on tags
 */
export function getTimeoutFromTags(tags: string[], defaultTimeout: number = 30000): number {
  if (tags.includes(TestTags.SLOW)) {
    return defaultTimeout * 3;
  }
  
  if (tags.includes(TestTags.FAST)) {
    return defaultTimeout / 2;
  }
  
  if (tags.includes(TestTags.PERFORMANCE)) {
    return defaultTimeout * 2;
  }
  
  return defaultTimeout;
}

/**
 * Helper to get retry count based on tags
 */
export function getRetryCountFromTags(tags: string[], defaultRetries: number = 0): number {
  if (tags.includes(TestTags.FLAKY)) {
    return Math.max(defaultRetries, 3);
  }
  
  if (tags.includes(TestTags.CRITICAL)) {
    return Math.max(defaultRetries, 2);
  }
  
  return defaultRetries;
}