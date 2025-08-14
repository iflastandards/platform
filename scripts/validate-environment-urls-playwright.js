#!/usr/bin/env node

/**
 * IFLA Standards Link Validation Tool - Playwright Version
 * 
 * Full documentation: developer_notes/link-validation.md
 * Run with --man to see documentation location
 */

const { program } = require('commander');
const inquirer = require('inquirer').default;
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
const { sites, DocsEnv } = createSiteConfigFromEnv();

const validSites = Object.keys(sites).filter(site => site !== 'github');
const validEnvironments = Object.values(DocsEnv);

program
  .option('--env <env>', 'Environment to validate (local, preview, production)')
  .option('--site <site>', 'Site to validate (specific site or "all")')
  .option('--type <type>', 'Type of validation: "static" (nav/footer), "generated" (all links), "sitemap", "comprehensive", or "both"', 'both')
  .option('--depth <number>', 'Crawl depth: 0=homepage only, 1=homepage+direct links, 2=2 levels deep, etc. (default: all links from sitemap)', undefined)
  .option('--sample-size <number>', 'Number of generated links to test (for non-local)', '10')
  .option('--timeout <ms>', 'Timeout per link in milliseconds', '15000')
  .option('--man', 'Show documentation location and exit')
  .parse();

// Handle --man option
if (program.opts().man) {
  console.log(`
📚 IFLA Standards Link Validation Documentation

Full documentation is available at:
  developer_notes/link-validation.md

This includes:
  • Detailed usage examples
  • Environment configuration
  • Troubleshooting guide
  • CI/CD integration examples
`);
  process.exit(0);
}

// Normalize and validate type option
const validTypes = ['static', 'generated', 'sitemap', 'comprehensive', 'both'];
const rawType = program.opts().type;
let normalizedType = rawType;

// Handle common typos
if (rawType === 'comprehensivet') {
  console.log(`⚠️  Detected typo in type 'comprehensivet', treating as 'comprehensive'`);
  normalizedType = 'comprehensive';
}

if (!validTypes.includes(normalizedType)) {
  console.error(`❌ Invalid validation type: ${rawType}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Update program options
program.opts().type = normalizedType;

// Check if an anchor exists on a page using Playwright
async function checkAnchorExists(page, pageUrl, anchorId) {
  try {
    // Navigate to the page with timeout protection
    await Promise.race([
      page.goto(pageUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 8000 
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Anchor page load timeout')), 10000)
      )
    ]).catch(() => {
      console.log(`⚠️  Page load timeout for anchor check: ${pageUrl}`);
      return false;
    });
    
    // Quick wait for content without blocking
    await Promise.race([
      page.waitForSelector('main, article, .markdown, [role="main"]', {
        state: 'attached',
        timeout: 2000
      }),
      page.waitForTimeout(2000)
    ]).catch(() => {
      // Continue anyway
    });
    
    // Minimal hydration wait
    await page.waitForTimeout(500);
    
    // Check for anchor using multiple strategies
    const anchorExists = await page.evaluate((id) => {
      const decodedId = decodeURIComponent(id);
      
      // Check for element with matching id
      if (document.getElementById(id) || document.getElementById(decodedId)) return true;
      
      // Check for element with matching name attribute
      if (document.querySelector(`[name="${id}"]`) || document.querySelector(`[name="${decodedId}"]`)) return true;
      
      // Check for any element with the id
      if (document.querySelector(`[id="${id}"]`) || document.querySelector(`[id="${decodedId}"]`)) return true;
      
      // Check for Docusaurus-generated heading anchors
      const possibleIds = [
        id,
        decodedId,
        `user-content-${id}`,
        `user-content-${decodedId}`,
        id.toLowerCase(),
        decodedId.toLowerCase(),
        id.replace(/[^\w-]/g, '-'),
        decodedId.replace(/[^\w-]/g, '-')
      ];
      
      for (const possibleId of possibleIds) {
        if (document.getElementById(possibleId)) return true;
        if (document.querySelector(`[id="${possibleId}"]`)) return true;
      }
      
      // Check if there's a heading with text that would generate this anchor
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const heading of headings) {
        const headingId = heading.id;
        if (headingId && (headingId === id || headingId === decodedId)) return true;
        
        const headingText = heading.textContent || '';
        const generatedId = headingText.toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (generatedId === id || generatedId === decodedId) return true;
      }
      
      return false;
    }, anchorId);
    
    // Alternative: Use Playwright's locator API for a more robust check
    if (!anchorExists) {
      // Try using Playwright's built-in locator
      const locator = page.locator(`#${CSS.escape(anchorId)}, [name="${anchorId}"]`);
      const count = await locator.count();
      if (count > 0) return true;
    }
    
    return anchorExists;
  } catch (error) {
    console.warn(`⚠️  Error checking anchor #${anchorId} on ${pageUrl}: ${error.message}`);
    return false;
  }
}

// Extract all links from a page using Playwright
async function extractLinksFromPage(page, baseUrl) {
  // First get the count for logging
  const linkCount = await page.locator('a[href]').count();
  console.log(`📄 Found ${linkCount} total anchor elements`);
  
  // Extract link details
  return await page.evaluate((baseUrl) => {
    const links = [];
    
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (href && href !== '#' && href.trim() !== '') {
        try {
          const fullUrl = href.startsWith('http') ? href :
                         href.startsWith('/') ? new URL(href, baseUrl).href :
                         new URL(href, window.location.href).href;
          
          const url = new URL(fullUrl);
          const anchorId = url.hash ? url.hash.substring(1) : null;
          const urlWithoutAnchor = `${url.origin}${url.pathname}${url.search}`;
          
          links.push({
            href,
            fullUrl,
            urlWithoutAnchor,
            anchorId,
            text: el.textContent?.trim() || '',
            isNavigation: el.closest('nav, footer, [class*="dropdown"]') !== null,
            isExternal: href.startsWith('http') && !href.includes(window.location.hostname),
            isSameSite: fullUrl.startsWith(baseUrl),
            hasAnchor: !!anchorId
          });
        } catch (error) {
          // Skip malformed URLs
        }
      }
    });
    
    return links;
  }, baseUrl);
}

// Extract pages from build directory
function extractPagesFromBuild(siteKey, baseUrl) {
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir, 'build');
  
  if (!fs.existsSync(buildPath)) {
    console.warn(`⚠️  Build directory not found: ${buildPath}`);
    return [];
  }
  
  const pages = [];
  const glob = require('glob');
  const htmlFiles = glob.sync('**/*.html', { cwd: buildPath });
  
  htmlFiles.forEach(file => {
    if (!file.includes('404.html')) {
      const urlPath = file.replace(/index\.html$/, '').replace(/\.html$/, '/');
      const fullUrl = `${baseUrl}${urlPath}`;
      pages.push(fullUrl);
    }
  });
  
  return pages;
}

// Main validation function using Playwright
async function validateEnvironmentUrls(siteKey, environment, options = {}) {
  const { type = 'both', depth = undefined, sampleSize = 10, timeout = 15000 } = options;
  
  console.log(`\n🔍 Validating URLs for ${siteKey.toUpperCase()} in ${environment.toUpperCase()} environment`);
  
  const siteConfig = sites[siteKey]?.[environment];
  
  if (!siteConfig) {
    console.error(`❌ No configuration found for ${siteKey} in ${environment} environment`);
    return false;
  }
  
  const baseUrl = `${siteConfig.url}${siteConfig.baseUrl}`;
  const testUrl = baseUrl;
  const isLocalhost = environment === 'local';
  
  console.log(`🌐 Expected base URL: ${baseUrl}`);
  console.log(`📋 Testing: ${type}`);
  console.log(`🕳️  Crawl depth: ${depth !== undefined ? depth : 'all links from sitemap'}`);
  
  if (isLocalhost) {
    console.log(`🏠 Testing local build served at: ${testUrl}`);
  } else {
    console.log(`🌍 Testing remote site at: ${testUrl}`);
  }
  
  // Launch Playwright browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'IFLA-Standards-Link-Validator/1.0'
  });
  
  const page = await context.newPage();
  
  try {
    const allLinks = [];
    let pagesToCheck = [];
    
    // Determine which pages to check based on type
    if (type === 'sitemap' || type === 'comprehensive' || type === 'both') {
      console.log(`📄 Extracting all valid pages from build directory...`);
      pagesToCheck = extractPagesFromBuild(siteKey, baseUrl);
      console.log(`📁 Found ${pagesToCheck.length} pages in build directory`);
    } else {
      pagesToCheck = [testUrl];
    }
    
    // Limit pages for comprehensive testing
    if (type === 'comprehensive' && pagesToCheck.length > 20) {
      pagesToCheck = pagesToCheck.slice(0, 20);
      console.log(`📄 Limited to first 20 pages for comprehensive testing`);
    }
    
    console.log(`📄 Checking links on ${pagesToCheck.length} page(s)...`);
    
    // Process pages (could be parallelized with multiple contexts)
    for (const pageUrl of pagesToCheck) {
      // Wrap entire page processing in timeout to prevent hanging
      await Promise.race([
        (async () => {
          try {
            console.log(`📄 Loading: ${pageUrl}`);
        
        // Use Playwright's improved navigation with timeout protection
        await Promise.race([
          page.goto(pageUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Page load timeout')), 15000)
          )
        ]).catch(async (error) => {
          console.log(`⚠️  Initial page load failed, trying networkidle...`);
          await page.goto(pageUrl, { 
            waitUntil: 'networkidle',
            timeout: 5000 
          }).catch(() => {
            console.log(`⚠️  Page load failed, continuing anyway...`);
          });
        });
        
        // Try to wait for content, but don't let it block
        await Promise.race([
          page.waitForSelector('nav a, .navbar a, [class*="navbar"] a, main a, .main a, [role="main"] a, .markdown a', {
            state: 'attached', // Use 'attached' instead of 'visible' - faster
            timeout: 3000
          }),
          page.waitForTimeout(3000) // Maximum wait time
        ]).catch(() => {
          console.log('📄 No navigation or content links found yet, checking anyway...');
        });
        
        // Shorter hydration wait
        await page.waitForTimeout(500);
        
        // Debug info
        const title = await page.title();
        console.log(`📄 Page title: "${title}"`);
        
        // Get selector counts
        const selectorCounts = await page.evaluate(() => {
          return {
            totalAnchors: document.querySelectorAll('a').length,
            anchorsWithHref: document.querySelectorAll('a[href]').length,
            navLinks: document.querySelectorAll('nav a, .navbar a').length,
            mainLinks: document.querySelectorAll('main a, .main a, [role="main"] a').length,
            markdownLinks: document.querySelectorAll('.markdown a, .theme-doc-markdown a').length
          };
        });
        console.log(`📄 Link counts:`, selectorCounts);
        
        // Extract links with timeout protection
        const pageLinks = await Promise.race([
          extractLinksFromPage(page, baseUrl),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Link extraction timeout')), 10000)
          )
        ]).catch(error => {
          console.warn(`⚠️  Failed to extract links: ${error.message}`);
          return [];
        });
        
        if (pageLinks.length > 0) {
          console.log(`📄 Found ${pageLinks.length} links on this page`);
          allLinks.push(...pageLinks);
        }
          } catch (error) {
            console.warn(`⚠️  Skipped ${pageUrl}: ${error.message}`);
          }
        })(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Page processing timeout: ${pageUrl}`)), 20000)
        )
      ]).catch(error => {
        console.warn(`⚠️  Page processing failed for ${pageUrl}: ${error.message}`);
      });
    }
    
    // Deduplicate links
    const uniqueLinks = Array.from(
      new Map(allLinks.map(link => [link.fullUrl, link])).values()
    );
    
    console.log(`🔄 Deduplicated to ${uniqueLinks.length} unique links`);
    
    const results = {
      tested: 0,
      passed: 0,
      failed: 0,
      issues: []
    };
    
    // Categorize links
    const navigationLinks = uniqueLinks.filter(link => link.isNavigation && !link.isExternal);
    const contentLinks = uniqueLinks.filter(link => !link.isNavigation && !link.isExternal);
    
    console.log(`   📋 Navigation/Static links: ${navigationLinks.length}`);
    console.log(`   📄 Content/Generated links: ${contentLinks.length}`);
    
    // Test static navigation links
    if (type === 'static' || type === 'both') {
      console.log('\n🧭 Testing static navigation links...');
      
      for (const link of navigationLinks) {
        results.tested++;
        const pageUrl = link.urlWithoutAnchor;
        
        // Check if page exists
        try {
          const response = await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });
          
          if (!response || !response.ok()) {
            results.failed++;
            results.issues.push({
              type: 'BROKEN_LINK',
              priority: 'HIGH',
              link: link.href,
              text: link.text,
              page: pageUrl,
              status: response ? response.status() : 'unknown',
              category: 'navigation'
            });
            continue;
          }
        } catch (error) {
          results.failed++;
          results.issues.push({
            type: 'UNREACHABLE',
            priority: 'HIGH',
            link: link.href,
            text: link.text,
            error: error.message,
            category: 'navigation'
          });
          continue;
        }
        
        // Check anchor if present
        if (link.hasAnchor && link.isSameSite && isLocalhost) {
          try {
            const anchorExists = await checkAnchorExists(page, pageUrl, link.anchorId);
            if (!anchorExists) {
              // Get available anchors for debugging
              const availableAnchors = await page.evaluate(() => {
                const anchors = new Set();
                document.querySelectorAll('[id]').forEach(el => {
                  if (el.id) anchors.add(el.id);
                });
                return Array.from(anchors).slice(0, 10);
              });
              
              console.log(`   ❌ Anchor not found: #${link.anchorId} on ${pageUrl}`);
              console.log(`      Available anchors: ${availableAnchors.join(', ')}${availableAnchors.length >= 10 ? '...' : ''}`);
              
              results.failed++;
              results.issues.push({
                type: 'BROKEN_ANCHOR',
                priority: 'MEDIUM',
                link: link.href,
                text: link.text,
                anchor: link.anchorId,
                page: pageUrl,
                category: 'navigation',
                availableAnchors: availableAnchors.slice(0, 5)
              });
            } else {
              results.passed++;
            }
          } catch (error) {
            results.failed++;
            results.issues.push({
              type: 'ANCHOR_CHECK_ERROR',
              priority: 'LOW',
              link: link.href,
              text: link.text,
              anchor: link.anchorId,
              error: error.message,
              category: 'navigation'
            });
          }
        } else {
          results.passed++;
        }
      }
    }
    
    // Test generated content links (sample for non-local)
    if ((type === 'generated' || type === 'both') && contentLinks.length > 0) {
      console.log('\n📄 Testing generated content links...');
      
      const linksToTest = isLocalhost ? contentLinks : contentLinks.slice(0, parseInt(sampleSize));
      
      if (!isLocalhost && contentLinks.length > linksToTest.length) {
        console.log(`   📊 Sampling ${linksToTest.length} of ${contentLinks.length} content links`);
      }
      
      for (const link of linksToTest) {
        results.tested++;
        const pageUrl = link.urlWithoutAnchor;
        
        // Check if page exists
        try {
          const response = await page.goto(pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });
          
          if (!response || !response.ok()) {
            results.failed++;
            results.issues.push({
              type: 'BROKEN_LINK',
              priority: 'MEDIUM',
              link: link.href,
              text: link.text,
              page: pageUrl,
              status: response ? response.status() : 'unknown',
              category: 'generated'
            });
            continue;
          }
        } catch (error) {
          results.failed++;
          results.issues.push({
            type: 'UNREACHABLE',
            priority: 'MEDIUM',
            link: link.href,
            text: link.text,
            error: error.message,
            category: 'generated'
          });
          continue;
        }
        
        // Check anchor if present
        if (link.hasAnchor && link.isSameSite && isLocalhost) {
          try {
            const anchorExists = await checkAnchorExists(page, pageUrl, link.anchorId);
            if (!anchorExists) {
              // Get available anchors for debugging
              const availableAnchors = await page.evaluate(() => {
                const anchors = new Set();
                document.querySelectorAll('[id]').forEach(el => {
                  if (el.id) anchors.add(el.id);
                });
                return Array.from(anchors).slice(0, 10);
              });
              
              console.log(`   ❌ Anchor not found: #${link.anchorId} on ${pageUrl}`);
              console.log(`      Available anchors: ${availableAnchors.join(', ')}${availableAnchors.length >= 10 ? '...' : ''}`);
              
              results.failed++;
              results.issues.push({
                type: 'BROKEN_ANCHOR',
                priority: 'MEDIUM',
                link: link.href,
                text: link.text,
                anchor: link.anchorId,
                page: pageUrl,
                category: 'generated',
                availableAnchors: availableAnchors.slice(0, 5)
              });
            } else {
              results.passed++;
            }
          } catch (error) {
            results.failed++;
            results.issues.push({
              type: 'ANCHOR_CHECK_ERROR',
              priority: 'LOW',
              link: link.href,
              text: link.text,
              anchor: link.anchorId,
              error: error.message,
              category: 'generated'
            });
          }
        } else {
          results.passed++;
        }
      }
    }
    
    // Display results
    console.log(`\n📊 URL Validation Results for ${siteKey.toUpperCase()} (${environment}):`);
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Total: ${results.tested}`);
    
    if (results.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      
      // Group by priority
      const high = results.issues.filter(i => i.priority === 'HIGH');
      const medium = results.issues.filter(i => i.priority === 'MEDIUM');
      const low = results.issues.filter(i => i.priority === 'LOW');
      
      if (high.length > 0) {
        console.log(`\n❌ HIGH PRIORITY (${high.length}):`);
        high.forEach((issue, idx) => {
          console.log(`  ${idx + 1}. ${issue.type}: "${issue.text}" -> ${issue.link}`);
          if (issue.error) console.log(`     Error: ${issue.error}`);
        });
      }
      
      if (medium.length > 0) {
        console.log(`\n⚠️  MEDIUM PRIORITY (${medium.length}):`);
        medium.forEach((issue, idx) => {
          console.log(`  ${idx + 1}. ${issue.type}: "${issue.text}" -> ${issue.link}`);
          if (issue.anchor) console.log(`     Missing anchor: #${issue.anchor}`);
          if (issue.availableAnchors && issue.availableAnchors.length > 0) {
            console.log(`     Available: ${issue.availableAnchors.join(', ')}`);
          }
        });
      }
      
      if (low.length > 0) {
        console.log(`\nℹ️  LOW PRIORITY (${low.length}):`);
        low.forEach((issue, idx) => {
          console.log(`  ${idx + 1}. ${issue.type}: ${issue.link}`);
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

// Main execution
async function main() {
  const options = program.opts();
  
  // Interactive mode if no options provided
  if (!options.env && !options.site) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'env',
        message: 'Which environment do you want to validate?',
        choices: validEnvironments,
        default: 'local'
      },
      {
        type: 'checkbox',
        name: 'sites',
        message: 'Which site(s) do you want to validate?',
        choices: [...validSites, { name: 'All Sites', value: 'all' }],
        default: ['all']
      },
      {
        type: 'list',
        name: 'type',
        message: 'What type of validation?',
        choices: [
          { name: 'Static (Navigation/Footer only)', value: 'static' },
          { name: 'Sitemap (Comprehensive from sitemap)', value: 'sitemap' },
          { name: 'Comprehensive (Deep validation)', value: 'comprehensive' },
          { name: 'Both Static and Generated', value: 'both' }
        ],
        default: 'both'
      }
    ]);
    
    options.env = answers.env;
    options.site = answers.sites.includes('all') ? 'all' : answers.sites.join(',');
    options.type = answers.type;
  }
  
  const environment = options.env || 'local';
  const sitesToValidate = options.site === 'all' ? validSites : 
                          options.site ? options.site.split(',') : validSites;
  
  console.log(`\n🎯 Validating ${sitesToValidate.length} site(s) for ${environment} environment`);
  
  if (environment === 'local') {
    console.log(`💡 For local testing, make sure sites are built and served first:`);
    console.log(`   pnpm build-env --env local --site ${options.site || 'all'}`);
    
    for (const site of sitesToValidate) {
      const siteConfig = sites[site]?.[environment];
      if (siteConfig) {
        const siteDir = site.toLowerCase() === 'portal' ? 'portal' : `standards/${site}`;
        console.log(`   cd ${siteDir} && pnpm run serve --port ${siteConfig.port}`);
      }
    }
    console.log('');
  }
  
  const overallResults = {
    passed: [],
    failed: []
  };
  
  for (const site of sitesToValidate) {
    const result = await validateEnvironmentUrls(site, environment, {
      type: options.type,
      depth: options.depth ? parseInt(options.depth) : undefined,
      sampleSize: parseInt(options.sampleSize || '10'),
      timeout: parseInt(options.timeout || '15000')
    });
    
    if (result && result.failed === 0) {
      overallResults.passed.push(site);
    } else {
      overallResults.failed.push(site);
    }
  }
  
  // Summary
  console.log('\n============================================================');
  console.log(`📊 OVERALL RESULTS (${environment} environment)`);
  console.log('============================================================');
  console.log(`✅ Sites passed: ${overallResults.passed.length}`);
  console.log(`❌ Sites failed: ${overallResults.failed.length}`);
  
  if (overallResults.failed.length > 0) {
    console.log(`\nFailed sites: ${overallResults.failed.join(', ')}`);
    process.exit(1);
  }
}

// Run the validator
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});