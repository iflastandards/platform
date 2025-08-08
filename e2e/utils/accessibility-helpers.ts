import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility testing utilities for Playwright E2E tests
 * Provides comprehensive accessibility validation using axe-core
 */

export interface AccessibilityTestOptions {
  /** Include specific accessibility rules */
  include?: string[];
  /** Exclude specific accessibility rules */
  exclude?: string[];
  /** Disable specific accessibility rules */
  disableRules?: string[];
  /** Tags to include (e.g., 'wcag2a', 'wcag2aa', 'wcag21aa') */
  tags?: string[];
}

/**
 * Run comprehensive accessibility scan on the current page
 */
export async function runAccessibilityScan(
  page: any, // Use any to avoid type conflicts between Playwright versions
  options: AccessibilityTestOptions = {}
): Promise<void> {
  const {
    include,
    exclude,
    disableRules = [],
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa']
  } = options;

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Build axe configuration
  let axeBuilder = new AxeBuilder({ page }).withTags(tags);

  // Apply include/exclude selectors
  if (include) {
    axeBuilder = axeBuilder.include(include);
  }
  if (exclude) {
    axeBuilder = axeBuilder.exclude(exclude);
  }

  // Disable specific rules if needed
  if (disableRules.length > 0) {
    axeBuilder = axeBuilder.disableRules(disableRules);
  }

  // Run the accessibility scan
  const accessibilityScanResults = await axeBuilder.analyze();

  // Assert no violations
  expect(accessibilityScanResults.violations).toEqual([]);

  // Log any incomplete tests (for debugging)
  if (accessibilityScanResults.incomplete.length > 0) {
    console.warn('Accessibility scan incomplete tests:', 
      accessibilityScanResults.incomplete.map(item => ({
        id: item.id,
        description: item.description,
        nodes: item.nodes.length
      }))
    );
  }
}

/**
 * Test basic keyboard navigation
 */
export async function testKeyboardNavigation(page: any): Promise<void> {
  // Test Tab navigation
  await page.keyboard.press('Tab');
  
  // Verify focus is visible
  const focusedElement = page.locator(':focus').first();
  await expect(focusedElement).toBeVisible();
}

/**
 * Test basic screen reader compatibility
 */
export async function testScreenReaderCompatibility(page: any): Promise<void> {
  // Verify h1 exists
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThanOrEqual(1);
}

/**
 * Comprehensive accessibility test suite
 */
export async function runFullAccessibilityTest(
  page: any,
  options: AccessibilityTestOptions & {
    skipKeyboard?: boolean;
    skipScreenReader?: boolean;
  } = {}
): Promise<void> {
  const {
    skipKeyboard = false,
    skipScreenReader = false,
    ...axeOptions
  } = options;

  // Run axe-core accessibility scan (most important)
  await runAccessibilityScan(page, axeOptions);

  // Run additional basic accessibility tests
  if (!skipKeyboard) {
    await testKeyboardNavigation(page);
  }

  if (!skipScreenReader) {
    await testScreenReaderCompatibility(page);
  }
}

/**
 * Generate accessibility report
 */
export async function generateAccessibilityReport(
  page: any,
  options: AccessibilityTestOptions = {}
): Promise<{
  violations: any[];
  passes: number;
  incomplete: number;
  url: string;
  timestamp: string;
}> {
  const axeBuilder = new AxeBuilder({ page })
    .withTags(options.tags || ['wcag2a', 'wcag2aa', 'wcag21aa']);

  const results = await axeBuilder.analyze();

  return {
    violations: results.violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    url: page.url(),
    timestamp: new Date().toISOString(),
  };
}