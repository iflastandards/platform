#!/usr/bin/env node

/**
 * Post-build broken link checker for Docusaurus sites
 * Runs after build to check links that couldn't be validated during build
 * (e.g., sites with onBrokenLinks: 'ignore')
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Site-specific ignore patterns for links that are expected to be broken
// or are external/third-party links we don't want to check
const SITE_IGNORE_PATTERNS = {
  isbdm: [
    // External links we don't check
    /^https?:\/\/(?!localhost)/,
    /^mailto:/,
    /^tel:/,
    // Hash links within pages
    /#[^/]+$/,
    // Known external domains
    /github\.com/,
    /google\.com/,
    /wikipedia\.org/
  ],
  // Default patterns for all sites
  default: [
    /^https?:\/\/(?!localhost)/,
    /^mailto:/,
    /^tel:/,
    /#[^/]+$/
  ]
};

// Critical selectors to always check (navigation, footer, etc.)
const CRITICAL_SELECTORS = [
  'nav a[href]',
  'footer a[href]',
  '[class*="navbar"] a[href]',
  '[class*="dropdown"] a[href]',
  '[class*="menu"] a[href]'
];

class PostBuildLinkChecker {
  constructor(site, options = {}) {
    this.site = site.toLowerCase();
    this.buildDir = path.join(process.cwd(), 'standards', site.toUpperCase(), 'build');
    
    // Check if it's a root-level site
    if (!fs.existsSync(this.buildDir)) {
      this.buildDir = path.join(process.cwd(), site, 'build');
    }
    
    this.baseUrl = options.baseUrl || `http://localhost:${options.port || 3000}`;
    this.timeout = options.timeout || 10000;
    this.maxLinks = options.maxLinks || 100;
    this.checkContentLinks = options.checkContentLinks !== false;
    this.ignorePatterns = SITE_IGNORE_PATTERNS[this.site] || SITE_IGNORE_PATTERNS.default;
  }

  async checkBuildDirectory() {
    if (!fs.existsSync(this.buildDir)) {
      throw new Error(`Build directory not found: ${this.buildDir}. Make sure the site is built first.`);
    }
    
    // Check if index.html exists
    const indexPath = path.join(this.buildDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`No index.html found in build directory: ${this.buildDir}`);
    }
    
    console.log(`✅ Build directory found: ${this.buildDir}`);
  }

  async checkLinks() {
    const results = {
      site: this.site,
      timestamp: new Date().toISOString(),
      totalLinks: 0,
      checkedLinks: 0,
      brokenLinks: [],
      warnings: []
    };

    if (!fs.existsSync(this.buildDir)) {
      results.warnings.push({
        type: 'BUILD_DIR_NOT_FOUND',
        message: `Build directory not found: ${this.buildDir}`
      });
      return results;
    }

    const browser = await chromium.launch({
      headless: true
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Load the homepage using file:// protocol
      const homepageUrl = `file://${path.join(this.buildDir, 'index.html')}`;
      console.log(`📄 Loading ${this.site} homepage from: ${homepageUrl}`);
      await page.goto(homepageUrl, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Extract all links
      const allLinks = await page.evaluate((selectors, checkContent) => {
        const links = new Map();
        
        // Get critical navigation links
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const href = el.getAttribute('href');
            if (href && !links.has(href)) {
              links.set(href, {
                href,
                text: el.textContent?.trim() || '',
                isCritical: true,
                selector
              });
            }
          });
        });
        
        // Optionally get content links
        if (checkContent) {
          document.querySelectorAll('main a[href], article a[href], [class*="content"] a[href]').forEach(el => {
            const href = el.getAttribute('href');
            if (href && !links.has(href)) {
              links.set(href, {
                href,
                text: el.textContent?.trim() || '',
                isCritical: false,
                selector: 'content'
              });
            }
          });
        }
        
        return Array.from(links.values());
      }, CRITICAL_SELECTORS, this.checkContentLinks);

      // Filter out ignored patterns
      const linksToCheck = allLinks.filter(link => {
        // Only check internal links
        if (!link.href.startsWith('/') && !link.href.includes(this.baseUrl)) {
          return false;
        }
        
        // Apply ignore patterns
        return !this.ignorePatterns.some(pattern => pattern.test(link.href));
      });

      results.totalLinks = allLinks.length;
      console.log(`🔗 Found ${allLinks.length} total links, checking ${linksToCheck.length} internal links`);

      // Limit links to check
      const finalLinks = linksToCheck.slice(0, this.maxLinks);
      
      // Check each link
      for (const link of finalLinks) {
        let testUrl;
        if (link.href.startsWith('http')) {
          // External link - skip
          continue;
        } else if (link.href.startsWith('/')) {
          // Internal link - convert to file path
          const filePath = path.join(this.buildDir, link.href, 'index.html');
          if (!fs.existsSync(filePath)) {
            // Try without index.html
            const altPath = path.join(this.buildDir, link.href);
            if (!fs.existsSync(altPath)) {
              // Broken link
              results.checkedLinks++;
              results.brokenLinks.push({
                ...link,
                error: 'File not found',
                expectedPath: filePath
              });
              continue;
            }
          }
          testUrl = `file://${filePath}`;
        } else {
          // Relative link - resolve from current page
          continue;
        }
        
        try {
          process.stdout.write(`  Checking: ${link.text || link.href}... `);
          
          const response = await page.goto(testUrl, {
            waitUntil: 'domcontentloaded',
            timeout: this.timeout
          });
          
          results.checkedLinks++;
          console.log('✅');
        } catch (error) {
          console.log('❌');
          results.checkedLinks++;
          results.brokenLinks.push({
            ...link,
            error: error.message,
            url: testUrl
          });
        }
      }

    } catch (error) {
      results.warnings.push({
        type: 'CHECK_ERROR',
        message: error.message
      });
    } finally {
      await browser.close();
    }

    return results;
  }

  async run() {
    try {
      // Check build directory exists
      await this.checkBuildDirectory();
      
      // Run link checks
      const results = await this.checkLinks();
      
      // Generate report
      this.generateReport(results);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      throw error;
    }
  }

  generateReport(results) {
    console.log(`\n📊 Post-Build Link Check Results for ${this.site.toUpperCase()}:`);
    console.log(`   📍 Total links found: ${results.totalLinks}`);
    console.log(`   🔍 Links checked: ${results.checkedLinks}`);
    console.log(`   ❌ Broken links: ${results.brokenLinks.length}`);
    
    if (results.brokenLinks.length > 0) {
      // Separate critical and non-critical
      const critical = results.brokenLinks.filter(l => l.isCritical);
      const nonCritical = results.brokenLinks.filter(l => !l.isCritical);
      
      if (critical.length > 0) {
        console.log('\n🚨 CRITICAL BROKEN LINKS (Navigation):');
        critical.forEach((link, i) => {
          console.log(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.status) console.log(`     Status: ${link.status}`);
          if (link.error) console.log(`     Error: ${link.error}`);
        });
      }
      
      if (nonCritical.length > 0) {
        console.log('\n⚠️  Content broken links:');
        nonCritical.forEach((link, i) => {
          console.log(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.status) console.log(`     Status: ${link.status}`);
          if (link.error) console.log(`     Error: ${link.error}`);
        });
      }
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(w => {
        console.log(`  - ${w.type}: ${w.message}`);
      });
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const site = args[0];
  
  if (!site) {
    console.error('Usage: node check-post-build-links.js <site> [options]');
    console.error('Example: node check-post-build-links.js isbdm');
    process.exit(1);
  }
  
  const options = {
    checkContentLinks: !args.includes('--critical-only'),
    maxLinks: parseInt(args.find(a => a.startsWith('--max-links='))?.split('=')[1] || '100'),
    timeout: parseInt(args.find(a => a.startsWith('--timeout='))?.split('=')[1] || '5000')
  };
  
  const checker = new PostBuildLinkChecker(site, options);
  
  checker.run()
    .then(results => {
      // Exit with error if critical broken links found
      const criticalBroken = results.brokenLinks.filter(l => l.isCritical);
      if (criticalBroken.length > 0) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Post-build link check failed:', error);
      process.exit(1);
    });
}

module.exports = PostBuildLinkChecker;