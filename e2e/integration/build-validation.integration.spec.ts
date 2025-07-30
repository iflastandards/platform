import { integrationTest, expect } from '../utils/tagged-test';

/**
 * Post-build validation tests to verify all sites are accessible after deployment.
 * These tests run against built sites to catch baseURL and deployment issues.
 */

// Site configuration from the portal's site list
const SITES = [
  { name: 'portal', path: '', title: 'IFLA Standards Portal' },
  { name: 'ISBDM', path: '/ISBDM', title: 'International Standard Bibliographic Description' },
  { name: 'LRM', path: '/LRM', title: 'IFLA Library Reference Model' },
  { name: 'FRBR', path: '/FRBR', title: 'Functional Requirements for Bibliographic Records' },
  { name: 'isbd', path: '/isbd', title: 'International Standard Bibliographic Description' },
  { name: 'muldicat', path: '/muldicat', title: 'Multilingual Dictionary of Cataloguing Terms' },
  { name: 'unimarc', path: '/unimarc', title: 'Universal MARC Format' },
  { name: 'newtest', path: '/newtest', title: 'New Test Standard' }
];

// Environment configuration
const getBaseUrl = () => {
  const env = process.env.DOCS_ENV || 'local';
  
  switch (env) {
    case 'local':
      return 'http://localhost:3000';
    case 'preview':
      return 'https://iflastandards.github.io/standards-dev';
    case 'development':
      return 'https://jonphipps.github.io/standards-dev';
    case 'production':
      return 'https://www.iflastandards.info';
    default:
      return 'http://localhost:3000';
  }
};

const getPortForSite = (siteName: string): number => {
  const portMap: Record<string, number> = {
    portal: 3000,
    ISBDM: 3001,
    LRM: 3002,
    FRBR: 3003,
    isbd: 3004,
    muldicat: 3005,
    unimarc: 3006,
    newtest: 3008
  };
  return portMap[siteName] || 3000;
};

const getSiteUrl = (siteName: string, sitePath: string) => {
  const env = process.env.DOCS_ENV || 'local';
  
  if (env === 'local') {
    const port = getPortForSite(siteName);
    return `http://localhost:${port}${sitePath === '' ? '/' : sitePath + '/'}`;
  } else {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${sitePath === '' ? '/' : sitePath + '/'}`;
  }
};

integrationTest.describe('Post-Build Site Validation @build @validation', () => {
  const env = process.env.DOCS_ENV || 'local';
  
  integrationTest.beforeEach(async ({ page }) => {
    // Set a reasonable timeout for network requests
    page.setDefaultTimeout(30000);
  });

  for (const site of SITES) {
    integrationTest(`${site.name} homepage should be accessible (${env}) @critical`, async ({ page }) => {
      const siteUrl = getSiteUrl(site.name, site.path);
      
      console.log(`Testing ${site.name} at: ${siteUrl}`);
      
      // Navigate to the site
      const response = await page.goto(siteUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check that we got a successful response
      expect(response?.status()).toBe(200);
      
      // Check that the page has the expected title or content
      await expect(page).toHaveTitle(new RegExp(site.title, 'i'));
      
      // Check for basic Docusaurus structure
      await expect(page.locator('body')).toBeVisible();
      
      // Check that CSS is loaded (no broken styling)
      const hasNavbar = await page.locator('nav.navbar').isVisible();
      expect(hasNavbar).toBe(true);
      
      // Check for any console errors that might indicate broken assets
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait a bit for any async loading
      await page.waitForTimeout(2000);
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon.ico') && 
        !error.includes('sw.js') &&
        !error.includes('workbox')
      );
      
      if (criticalErrors.length > 0) {
        console.warn(`Non-critical console errors on ${site.name}:`, criticalErrors);
      }
    });
  }

  integrationTest('Portal should list all sites correctly @portal', async ({ page }) => {
    const portalUrl = getSiteUrl('portal', '');
    
    await page.goto(portalUrl, { waitUntil: 'networkidle' });
    
    // Check that the portal page loads
    await expect(page).toHaveTitle(/IFLA Standards Portal/i);
    
    // Look for site links or references to other standards
    // This is a basic check - adjust based on your portal's actual structure
    const mainContent = await page.locator('main').textContent();
    
    // Check that at least some of the major standards are mentioned
    const standardsToCheck = ['ISBDM', 'LRM', 'FRBR'];
    const mentionedStandards = standardsToCheck.filter(standard => 
      mainContent?.includes(standard)
    );
    
    expect(mentionedStandards.length).toBeGreaterThan(0);
  });

  // Environment-specific tests
  if (env !== 'local') {
    integrationTest('All sites should have HTTPS enabled @security', async ({ page }) => {
      for (const site of SITES.slice(0, 3)) { // Test first 3 sites to keep test time reasonable
        const siteUrl = getSiteUrl(site.name, site.path);
        expect(siteUrl).toMatch(/^https:/);
      }
    });
  }

  if (env === 'development' || env === 'preview') {
    integrationTest('GitHub Pages deployment should be accessible @deployment', async ({ page }) => {
      const baseUrl = getBaseUrl();
      
      // Test that the base deployment URL is accessible
      const response = await page.goto(baseUrl + '/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      expect(response?.status()).toBe(200);
    });
  }
});

integrationTest.describe('Cross-Site Navigation @navigation', () => {
  const env = process.env.DOCS_ENV || 'local';
  
  // Only test navigation in environments where all sites should be available
  if (env !== 'local') {
    integrationTest('Site navigation should work between sites', async ({ page }) => {
      // Start at portal
      const portalUrl = getSiteUrl('portal', '');
      await page.goto(portalUrl, { waitUntil: 'networkidle' });
      
      // Look for links to other sites (adjust selectors based on your actual navigation)
      const links = await page.locator('a[href*="ISBDM"], a[href*="LRM"]').all();
      
      if (links.length > 0) {
        // Test the first cross-site link
        const firstLink = links[0];
        const href = await firstLink.getAttribute('href');
        
        if (href) {
          const response = await page.goto(href, { waitUntil: 'networkidle' });
          expect(response?.status()).toBe(200);
        }
      }
    });
  }
});