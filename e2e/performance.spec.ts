/**
 * Performance Tests
 * Measure key performance metrics for critical pages
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests @e2e @performance @ui @high-priority', () => {
  test('portal homepage performance metrics', async ({ page }) => {
    // Start measuring performance
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Get performance metrics
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    const domContentLoadedTime = performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart;
    
    console.log(`Page Load Time: ${loadTime}ms`);
    console.log(`DOM Content Loaded Time: ${domContentLoadedTime}ms`);
    
    // Assert reasonable load times (3 seconds for full load)
    expect(loadTime).toBeLessThan(3000);
    expect(domContentLoadedTime).toBeLessThan(2000);
  });

  test('standards site performance metrics', async ({ page }) => {
    await page.goto('/ISBDM/', { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue = 0;
        let clsValue = 0;
        
        // Observe LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcpValue = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Observe CLS
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            clsValue += entry.value;
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait a bit for metrics to stabilize
        setTimeout(() => {
          resolve({
            lcp: lcpValue,
            cls: clsValue,
          });
        }, 2000);
      });
    });
    
    console.log(`LCP: ${metrics.lcp}ms`);
    console.log(`CLS: ${metrics.cls}`);
    
    // Assert Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500); // LCP should be under 2.5s
    expect(metrics.cls).toBeLessThan(0.1); // CLS should be under 0.1
  });

  test('resource loading performance', async ({ page }) => {
    const resourceTimings = [];
    
    // Monitor resource loading
    page.on('response', response => {
      const timing = response.timing();
      if (timing) {
        resourceTimings.push({
          url: response.url(),
          duration: timing.responseEnd - timing.requestStart,
        });
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Find slowest resources
    const slowResources = resourceTimings
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    console.log('Slowest resources:');
    slowResources.forEach(resource => {
      console.log(`${resource.url}: ${resource.duration}ms`);
    });
    
    // Check if any resource takes too long
    const slowestResource = slowResources[0];
    if (slowestResource) {
      expect(slowestResource.duration).toBeLessThan(5000); // No resource should take more than 5s
    }
  });
});