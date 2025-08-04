#!/usr/bin/env node

/**
 * Check deployed documentation sites for accessibility and broken links
 * This script verifies sites that are already deployed to the web
 */

const { chromium } = require('playwright');

// Configuration for deployed sites
const DEPLOYMENT_CONFIGS = {
  preview: {
    baseUrl: 'https://iflastandards.github.io/platform',
    sites: {
      portal: '/portal',
      isbdm: '/ISBDM',
      lrm: '/LRM',
      frbr: '/FRBR',
      isbd: '/ISBD',
      muldicat: '/MULDICAT',
      unimarc: '/UNIMARC'
    }
  },
  production: {
    baseUrl: 'https://www.iflastandards.info',
    sites: {
      portal: '/',
      isbdm: '/ISBDM',
      lrm: '/LRM',
      frbr: '/FRBR',
      isbd: '/ISBD',
      muldicat: '/MULDICAT',
      unimarc: '/UNIMARC'
    }
  }
};

// Sites that have onBrokenLinks: 'ignore' and need link checking
const SITES_WITH_IGNORED_LINKS = ['isbdm'];

class DeployedSiteChecker {
  constructor(environment = 'preview') {
    this.environment = environment;
    this.config = DEPLOYMENT_CONFIGS[environment];
    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}. Use 'preview' or 'production'`);
    }
  }

  /**
   * Run smoke test for a single site
   */
  async runSmokeTest(siteName, siteUrl) {
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        // Set a realistic user agent
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      const page = await context.newPage();
      
      // Collect console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Try to load the page
      console.log(`  🔍 Loading ${siteUrl}...`);
      const startTime = Date.now();
      
      const response = await page.goto(siteUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      const loadTime = Date.now() - startTime;
      
      // Check response status
      const status = response ? response.status() : 0;
      if (status >= 400) {
        return {
          site: siteName,
          url: siteUrl,
          success: false,
          error: `HTTP ${status} error`,
          loadTime
        };
      }
      
      // Check for Docusaurus elements
      const pageInfo = await page.evaluate(() => {
        return {
          hasNavbar: !!document.querySelector('nav, .navbar, header nav'),
          hasContent: !!document.querySelector('main, .main-wrapper, article, .container'),
          hasFooter: !!document.querySelector('footer, .footer'),
          title: document.title || '',
          hasDocusaurusData: !!(window.__DOCUSAURUS_DATA__ || window.docusaurus)
        };
      });
      
      // Validate critical elements
      if (!pageInfo.hasContent) {
        return {
          site: siteName,
          url: siteUrl,
          success: false,
          error: 'Page missing main content area',
          loadTime,
          pageInfo
        };
      }
      
      if (!pageInfo.title) {
        return {
          site: siteName,
          url: siteUrl,
          success: false,
          error: 'Page has no title',
          loadTime,
          pageInfo
        };
      }
      
      // Check for critical JS errors
      const criticalErrors = consoleErrors.filter(err => 
        err.includes('Cannot read') ||
        err.includes('is not defined') ||
        err.includes('Uncaught')
      );
      
      return {
        site: siteName,
        url: siteUrl,
        success: true,
        loadTime,
        title: pageInfo.title,
        pageInfo,
        consoleErrors: criticalErrors.length > 0 ? criticalErrors : undefined
      };
      
    } catch (error) {
      return {
        site: siteName,
        url: siteUrl,
        success: false,
        error: error.message
      };
    } finally {
      await browser.close();
    }
  }

  /**
   * Check broken links for a deployed site
   */
  async checkBrokenLinks(siteName, siteUrl) {
    // Only check sites that have onBrokenLinks: 'ignore'
    if (!SITES_WITH_IGNORED_LINKS.includes(siteName.toLowerCase())) {
      return null;
    }

    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto(siteUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Extract all navigation links
      const links = await page.evaluate(() => {
        const navLinks = [];
        const selectors = [
          'nav a[href]',
          'header a[href]',
          'footer a[href]',
          '[class*="navbar"] a[href]',
          '[class*="menu"] a[href]'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const href = el.getAttribute('href');
            if (href && !navLinks.some(l => l.href === href)) {
              navLinks.push({
                href,
                text: el.textContent?.trim() || '',
                absoluteUrl: el.href // Browser's computed absolute URL
              });
            }
          });
        });
        
        return navLinks;
      });
      
      // Filter for internal links
      const baseUrl = new URL(siteUrl).origin;
      const internalLinks = links.filter(link => {
        try {
          const url = new URL(link.absoluteUrl);
          return url.origin === baseUrl && !url.hash; // Same origin, no hash links
        } catch {
          return false;
        }
      });
      
      // Check each internal link
      const brokenLinks = [];
      console.log(`  🔗 Checking ${internalLinks.length} internal navigation links...`);
      
      for (const link of internalLinks) {
        try {
          const response = await page.goto(link.absoluteUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });
          
          if (!response || response.status() >= 400) {
            brokenLinks.push({
              href: link.href,
              text: link.text,
              status: response ? response.status() : 0,
              absoluteUrl: link.absoluteUrl
            });
          }
        } catch (error) {
          brokenLinks.push({
            href: link.href,
            text: link.text,
            error: error.message,
            absoluteUrl: link.absoluteUrl
          });
        }
        
        // Navigate back to original page for next check
        await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });
      }
      
      return {
        site: siteName,
        url: siteUrl,
        totalChecked: internalLinks.length,
        brokenLinks
      };
      
    } catch (error) {
      return {
        site: siteName,
        url: siteUrl,
        error: error.message,
        brokenLinks: []
      };
    } finally {
      await browser.close();
    }
  }

  /**
   * Check all sites
   */
  async checkAllSites() {
    console.log(`🌐 Checking deployed sites on ${this.environment} (${this.config.baseUrl})\n`);
    
    const results = {
      environment: this.environment,
      baseUrl: this.config.baseUrl,
      timestamp: new Date().toISOString(),
      smokeTests: [],
      brokenLinks: []
    };
    
    // Run smoke tests for all sites
    console.log('🔥 Running smoke tests...\n');
    for (const [siteName, sitePath] of Object.entries(this.config.sites)) {
      const siteUrl = this.config.baseUrl + sitePath;
      console.log(`Testing ${siteName}...`);
      
      const result = await this.runSmokeTest(siteName, siteUrl);
      results.smokeTests.push(result);
      
      if (result.success) {
        console.log(`  ✅ Passed (${result.loadTime}ms) - "${result.title}"`);
        if (result.consoleErrors) {
          console.log(`  ⚠️  ${result.consoleErrors.length} console errors`);
        }
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }
    
    // Run broken link checks for sites that need them
    const passedSites = results.smokeTests.filter(r => r.success);
    if (passedSites.length > 0) {
      console.log('\n🔗 Checking broken links...\n');
      
      for (const smokeResult of passedSites) {
        const linkResult = await this.checkBrokenLinks(smokeResult.site, smokeResult.url);
        if (linkResult) {
          console.log(`Checking ${smokeResult.site}...`);
          if (linkResult.error) {
            console.log(`  ❌ Error: ${linkResult.error}`);
          } else if (linkResult.brokenLinks.length > 0) {
            console.log(`  ❌ Found ${linkResult.brokenLinks.length} broken links`);
            linkResult.brokenLinks.forEach(link => {
              console.log(`     - "${link.text}" → ${link.href}`);
            });
          } else {
            console.log(`  ✅ All ${linkResult.totalChecked} links working`);
          }
          results.brokenLinks.push(linkResult);
        }
      }
    }
    
    // Summary
    console.log('\n📊 Summary');
    console.log('==========');
    const smokePass = results.smokeTests.filter(r => r.success).length;
    const smokeFail = results.smokeTests.filter(r => !r.success).length;
    console.log(`Smoke Tests: ${smokePass} passed, ${smokeFail} failed`);
    
    if (results.brokenLinks.length > 0) {
      const totalBroken = results.brokenLinks.reduce((sum, r) => sum + (r.brokenLinks?.length || 0), 0);
      console.log(`Broken Links: ${totalBroken} found across ${results.brokenLinks.length} sites`);
    }
    
    return results;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const environment = args[0] || 'preview';
  
  const checker = new DeployedSiteChecker(environment);
  
  checker.checkAllSites()
    .then(results => {
      const fs = require('fs');
      const path = require('path');
      
      // Save results
      const reportsDir = path.join(process.cwd(), 'output', '_reports');
      fs.mkdirSync(reportsDir, { recursive: true });
      
      const reportPath = path.join(reportsDir, `deployed-sites-check-${environment}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      console.log(`\n📄 Report saved to: ${reportPath}`);
      
      // Exit with error if any failures
      const hasFailures = results.smokeTests.some(r => !r.success) || 
                         results.brokenLinks.some(r => r.brokenLinks?.length > 0);
      if (hasFailures) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

module.exports = DeployedSiteChecker;