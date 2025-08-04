import { test, expect, describe } from '../utils/tagged-test';
import { DocsEnv, sites } from '../utils/siteConfig';
import { getPortalUrl, mapDocsEnvToEnvironment } from '@ifla/theme/config';

// Determine the current environment from env variable or default to localhost
// Map environment variable values to our enum
const envMapping: Record<string, DocsEnv> = {
  'local': DocsEnv.Localhost,
  'localhost': DocsEnv.Localhost,
  'preview': DocsEnv.Preview,
  'dev': DocsEnv.Dev,
  'development': DocsEnv.Dev,
  'production': DocsEnv.Production,
};

const currentEnv = envMapping[process.env.DOCS_ENV?.toLowerCase() || 'local'] || DocsEnv.Localhost;

// Define expected URL patterns for each environment
const URL_PATTERNS: Record<DocsEnv, RegExp> = {
  [DocsEnv.Localhost]: /^(http:\/\/localhost:\d+|\/)/,
  [DocsEnv.Preview]: /^(https:\/\/iflastandards\.github\.io\/standards-dev|\/standards-dev)/,
  [DocsEnv.Dev]: /^(https:\/\/jonphipps\.github\.io\/standards-dev|\/standards-dev)/,
  [DocsEnv.Production]: /^(https:\/\/www\.iflastandards\.info|\/)/,
};

// Known external links that are allowed
const ALLOWED_EXTERNAL_DOMAINS = [
  'ifla.org',
  'github.com',
  'twitter.com',
  'linkedin.com',
  'facebook.com',
  'youtube.com',
  'doi.org',
  'orcid.org',
  'creativecommons.org',
];

/**
 * Get the expected Portal URL for the current environment using the same helper
 * function that the application uses to avoid hardcoding URLs.
 */
function getExpectedPortalUrl(env: DocsEnv): string {
  // Map from DocsEnv to the Environment type used by the theme config
  const environment = mapDocsEnvToEnvironment(env);
  return getPortalUrl(environment);
}

describe('Site Validation Tests', '@sites @validation @integration', () => {
  // Test each site
  Object.entries(sites).forEach(([siteKey, siteConfigs]) => {
    const siteConfig = siteConfigs[currentEnv];
    const baseUrl = siteConfig.url + siteConfig.baseUrl;

    describe(`${siteKey} site validation`, '@integration', () => {
      test.beforeEach(async ({ page }) => {
        // Navigate to the specific site's home page
        // For localhost, we need to ensure we're using the right port
        const fullUrl = currentEnv === DocsEnv.Localhost && siteConfig.port 
          ? `http://localhost:${siteConfig.port}${siteConfig.baseUrl}`
          : baseUrl;
        
        await page.goto(fullUrl);
        await page.waitForLoadState('networkidle');
      });

      test(`should validate navigation structure for ${siteKey} @critical @integration`, async ({ page }) => {
        // Check main navigation exists
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();
        
        // Verify navigation links
        const navLinks = nav.locator('a');
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(0);
        
        // Validate all internal links point to correct environment
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('http') && !href.startsWith('//')) {
            // Internal link - should match expected pattern
            expect(href).toMatch(URL_PATTERNS[currentEnv]);
          }
        }
      });

      test(`should validate footer links for ${siteKey} @integration`, async ({ page }) => {
        // Check footer exists
        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible();
        
        // Validate footer links
        const footerLinks = footer.locator('a');
        const linkCount = await footerLinks.count();
        
        for (let i = 0; i < linkCount; i++) {
          const link = footerLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && href.startsWith('http')) {
            // External link - check if it's allowed
            const isAllowed = ALLOWED_EXTERNAL_DOMAINS.some(domain => href.includes(domain));
            if (!isAllowed && !href.includes(siteConfig.url)) {
              console.warn(`Unexpected external link in ${siteKey} footer: ${href}`);
            }
          }
        }
      });

      test(`should validate page metadata for ${siteKey} @integration`, async ({ page }) => {
        // Check title
        await expect(page).toHaveTitle(/.+/); // Should have a non-empty title
        
        // Check meta description
        const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
        expect(metaDescription).toBeTruthy();
        
        // Check Open Graph tags
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        expect(ogTitle).toBeTruthy();
      });

      test(`should validate accessibility basics for ${siteKey} @accessibility @integration`, async ({ page }) => {
        // Check for lang attribute
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBeTruthy();
        
        // Check for main landmark
        await expect(page.locator('main')).toBeVisible();
        
        // Check for skip to content link
        const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-to-content');
        const skipLinkCount = await skipLink.count();
        expect(skipLinkCount).toBeGreaterThan(0);
      });
      
      test(`should validate footer Portal link for ${siteKey} @navigation @integration`, async ({ page }) => {
        // Wait for footer to be visible
        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible();
        
        // Find the Portal link in the footer
        const portalLink = footer.locator('a:has-text("Portal")');
        await expect(portalLink).toBeVisible();
        
        // Get the href attribute
        const href = await portalLink.getAttribute('href');
        expect(href).toBeTruthy();
        
        // Determine expected Portal URL based on current environment
        const expectedPortalUrl = getExpectedPortalUrl(currentEnv);
        
        // Assert the href matches the expected Portal URL
        expect(href).toBe(expectedPortalUrl);
      });
    });
  });
});