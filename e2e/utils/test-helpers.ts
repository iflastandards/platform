import { Page, BrowserContext, expect } from '@playwright/test';

/**
 * Helper utilities for Playwright tests
 */

/**
 * Wait for all development servers to be ready
 */
export async function waitForServers(page: Page, sites: { name: string; url: string }[]) {
  for (const site of sites) {
    let retries = 30; // 30 seconds timeout
    let serverReady = false;
    
    while (retries > 0 && !serverReady) {
      try {
        const response = await page.request.get(site.url, { timeout: 1000 });
        if (response.ok()) {
          serverReady = true;
          console.log(`✅ ${site.name} server is ready at ${site.url}`);
        }
      } catch (error) {
        retries--;
        await page.waitForTimeout(1000);
      }
    }
    
    if (!serverReady) {
      throw new Error(`Server ${site.name} failed to start at ${site.url}`);
    }
  }
}

/**
 * Setup authentication for admin tests
 */
export async function setupAuth(context: BrowserContext, user = {
  id: 'test-user',
  email: 'test@example.com',
  roles: ['admin'],
}) {
  // Add auth cookies or localStorage
  await context.addCookies([
    {
      name: 'auth-token',
      value: 'test-jwt-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  
  // Set localStorage for all pages in this context
  await context.addInitScript((user) => {
    localStorage.setItem('auth-token', 'test-jwt-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, user);
}

/**
 * Mock API responses
 */
export async function mockAPI(page: Page, mocks: Array<{
  url: string | RegExp;
  response: any;
  status?: number;
}>) {
  for (const mock of mocks) {
    await page.route(mock.url, (route) => {
      route.fulfill({
        status: mock.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(mock.response),
      });
    });
  }
}

/**
 * Wait for React/Next.js hydration
 */
export async function waitForHydration(page: Page) {
  // Wait for React to hydrate
  await page.waitForFunction(() => {
    const root = document.querySelector('#__next') || document.querySelector('#root');
    return root && root.children.length > 0;
  });
  
  // Additional wait for Next.js
  await page.waitForFunction(() => {
    return window['__NEXT_DATA__'] !== undefined || window['React'] !== undefined;
  });
}

/**
 * Take screenshot with consistent naming
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `./tmp/playwright-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Check for console errors
 */
export function attachConsoleLogger(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return {
    getErrors: () => errors,
    assertNoErrors: () => {
      expect(errors, `Console errors found: ${errors.join(', ')}`).toHaveLength(0);
    },
  };
}

/**
 * Load site with retries
 */
export async function loadSiteWithRetry(
  page: Page,
  url: string,
  options = { retries: 3, timeout: 30000 }
) {
  let lastError: Error | null = null;
  
  for (let i = 0; i < options.retries; i++) {
    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout,
      });
      return;
    } catch (error) {
      lastError = error as Error;
      console.log(`Retry ${i + 1}/${options.retries} for ${url}`);
      await page.waitForTimeout(2000);
    }
  }
  
  throw lastError;
}

/**
 * Performance metrics helper
 */
export async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      // Navigation timings
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Core Web Vitals
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Resource timings
      totalRequests: performance.getEntriesByType('resource').length,
      totalSize: performance.getEntriesByType('resource').reduce((sum, r: any) => {
        return sum + (r.transferSize || 0);
      }, 0),
    };
  });
}

/**
 * Visual regression helper
 */
export async function compareScreenshots(page: Page, name: string, options = {}) {
  // Wait for animations to complete
  await page.waitForTimeout(500);
  
  // Disable animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixels: 100,
    animations: 'disabled',
    ...options,
  });
}