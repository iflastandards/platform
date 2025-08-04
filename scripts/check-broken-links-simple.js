#!/usr/bin/env node

/**
 * Simple broken link checker for post-build validation
 * Designed to integrate with the warning collection system
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Sites that have onBrokenLinks: 'ignore' and need post-build checking
const SITES_WITH_IGNORED_LINKS = ['isbdm'];

// Patterns to ignore for each site
const SITE_IGNORE_PATTERNS = {
  isbdm: [
    // External links
    /^https?:\/\//,
    /^mailto:/,
    /^tel:/,
    // Hash links
    /#[^/]+$/
  ]
};

class BrokenLinkChecker {
  constructor() {
    this.results = [];
  }

  /**
   * Check if a site needs post-build link checking
   */
  needsPostBuildCheck(site) {
    return SITES_WITH_IGNORED_LINKS.includes(site.toLowerCase());
  }

  /**
   * Check broken links for a built site
   */
  async checkSite(site) {
    const siteKey = site.toLowerCase();
    const buildDir = this.findBuildDir(site);
    
    if (!buildDir) {
      return {
        site,
        success: false,
        brokenLinks: [],
        error: `Build directory not found for ${site}`
      };
    }

    const browser = await chromium.launch({ headless: true });
    const result = {
      site,
      success: true,
      brokenLinks: [],
      totalChecked: 0
    };

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Load the homepage
      const indexPath = path.join(buildDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        throw new Error(`No index.html found in ${buildDir}`);
      }

      await page.goto(`file://${indexPath}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Extract navigation links
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
                isNavigation: true
              });
            }
          });
        });
        
        return navLinks;
      });

      // Filter out external and ignored links
      const ignorePatterns = SITE_IGNORE_PATTERNS[siteKey] || [];
      const internalLinks = links.filter(link => {
        if (!link.href.startsWith('/')) return false;
        return !ignorePatterns.some(pattern => pattern.test(link.href));
      });

      // Check each internal link
      for (const link of internalLinks) {
        result.totalChecked++;
        
        // Remove site prefix if present (e.g., /ISBDM/ -> /)
        let normalizedHref = link.href;
        const sitePrefix = `/${site.toUpperCase()}/`;
        if (normalizedHref.startsWith(sitePrefix)) {
          normalizedHref = normalizedHref.substring(sitePrefix.length - 1);
        }
        
        // Check if the target file exists
        const possiblePaths = [
          path.join(buildDir, normalizedHref, 'index.html'),
          path.join(buildDir, normalizedHref.replace(/\/$/, '') + '.html'),
          path.join(buildDir, normalizedHref.replace(/\/$/, ''), 'index.html'),
          path.join(buildDir, normalizedHref)
        ];
        
        const exists = possiblePaths.some(p => fs.existsSync(p));
        
        if (!exists) {
          result.brokenLinks.push({
            href: link.href,
            text: link.text,
            type: 'broken_link',
            message: `Broken link: "${link.text}" -> ${link.href}`
          });
        }
      }

    } catch (error) {
      result.success = false;
      result.error = error.message;
    } finally {
      await browser.close();
    }

    return result;
  }

  /**
   * Find the build directory for a site
   */
  findBuildDir(site) {
    const possiblePaths = [
      path.join(process.cwd(), 'standards', site.toUpperCase(), 'build'),
      path.join(process.cwd(), site.toLowerCase(), 'build'),
      path.join(process.cwd(), site, 'build')
    ];

    for (const buildPath of possiblePaths) {
      if (fs.existsSync(buildPath)) {
        return buildPath;
      }
    }

    return null;
  }

  /**
   * Check all sites that need post-build link checking
   */
  async checkAllSites(sites) {
    const results = [];
    
    for (const site of sites) {
      if (this.needsPostBuildCheck(site)) {
        console.log(`\n🔍 Checking broken links for ${site}...`);
        const result = await this.checkSite(site);
        results.push(result);
        
        if (result.brokenLinks.length > 0) {
          console.log(`  ❌ Found ${result.brokenLinks.length} broken links`);
        } else if (result.error) {
          console.log(`  ❌ Error: ${result.error}`);
        } else {
          console.log(`  ✅ No broken links found (checked ${result.totalChecked} links)`);
        }
      }
    }
    
    return results;
  }
}

// Export for use in other scripts
module.exports = BrokenLinkChecker;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const site = args[0];
  
  if (!site) {
    console.error('Usage: node check-broken-links-simple.js <site>');
    console.error('Example: node check-broken-links-simple.js isbdm');
    process.exit(1);
  }
  
  const checker = new BrokenLinkChecker();
  
  checker.checkSite(site)
    .then(result => {
      if (result.brokenLinks.length > 0) {
        console.error('\n❌ Broken links found:');
        result.brokenLinks.forEach((link, i) => {
          console.error(`  ${i + 1}. "${link.text}" -> ${link.href}`);
        });
        process.exit(1);
      } else if (result.error) {
        console.error(`\n❌ Error: ${result.error}`);
        process.exit(1);
      } else {
        console.log('\n✅ All links are working!');
      }
    })
    .catch(error => {
      console.error('❌ Link check failed:', error);
      process.exit(1);
    });
}