import { e2eTest, expect } from '../../utils/tagged-test';

// Performance testing for core pages and functionality
e2eTest.describe('Performance Testing @performance @slow', () => {
  e2eTest('Portal homepage loads within performance budget @critical', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to portal
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for portal homepage
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals using page.evaluate
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              vitals[entry.name] = entry.startTime;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 2000);
      });
    });
    
    console.log('Performance metrics:', { loadTime, vitals });
  });

  e2eTest('Standards site loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/ISBDM/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for standards sites
    expect(loadTime).toBeLessThan(3000);
  });

  e2eTest('Admin dashboard loads within performance budget @admin', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for admin dashboard
    expect(loadTime).toBeLessThan(3000);
  });

  e2eTest('Measures bundle sizes and resource loading', async ({ page }) => {
    await page.goto('/');
    
    // Collect resource timing data
    const resourceData = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const summary = {
        totalResources: resources.length,
        jsFiles: 0,
        cssFiles: 0,
        imageFiles: 0,
        totalJsSize: 0,
        totalCssSize: 0,
        totalImageSize: 0,
        slowestResource: { name: '', duration: 0 }
      };
      
      resources.forEach((resource: any) => {
        if (resource.name.endsWith('.js')) {
          summary.jsFiles++;
          summary.totalJsSize += resource.transferSize || 0;
        } else if (resource.name.endsWith('.css')) {
          summary.cssFiles++;
          summary.totalCssSize += resource.transferSize || 0;
        } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
          summary.imageFiles++;
          summary.totalImageSize += resource.transferSize || 0;
        }
        
        if (resource.duration > summary.slowestResource.duration) {
          summary.slowestResource = {
            name: resource.name.split('/').pop() || resource.name,
            duration: resource.duration
          };
        }
      });
      
      return summary;
    });
    
    console.log('Resource loading summary:', resourceData);
    
    // Check bundle sizes are reasonable
    expect(resourceData.totalJsSize).toBeLessThan(2 * 1024 * 1024); // 2MB JS budget
    expect(resourceData.totalCssSize).toBeLessThan(500 * 1024); // 500KB CSS budget
  });

  e2eTest('Tests performance across different viewport sizes @ui', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`${viewport.name} load time: ${loadTime}ms`);
      
      // All viewports should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
    }
  });
});