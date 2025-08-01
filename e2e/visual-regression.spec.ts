/**
 * Visual Regression Tests
 * Screenshot comparison tests for key pages
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests @e2e @visual @ui @low-priority', () => {
  test('portal homepage visual test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of full page
    await expect(page).toHaveScreenshot('portal-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('standards page visual test', async ({ page }) => {
    await page.goto('/ISBDM/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of full page
    await expect(page).toHaveScreenshot('isbdm-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile viewport visual test', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile view
    await expect(page).toHaveScreenshot('portal-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});