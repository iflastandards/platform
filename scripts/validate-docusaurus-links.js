#!/usr/bin/env node

/**
 * DEPRECATED: This script has been replaced by validate-environment-urls.js
 * 
 * The new script provides:
 * - Sitemap-based validation (finds ALL links, not just homepage)
 * - Multi-environment support (local, preview, production)
 * - Better caching and performance
 * - More comprehensive validation modes
 * 
 * Usage:
 *   pnpm check:links                     # Simple wrapper
 *   node scripts/check-links.js          # Wrapper with shortcuts
 *   node scripts/validate-environment-urls.js  # Direct usage
 * 
 * See developer_notes/link-validation.md for documentation
 */

console.log(`
⚠️  DEPRECATED: This script has been replaced!

Please use one of these instead:

  pnpm check:links                    # Check all sites
  pnpm check:links:portal             # Check specific site
  node scripts/check-links.js --help  # See all options

The new script finds ALL links via sitemap (hundreds of links)
instead of just checking the homepage.

See developer_notes/link-validation.md for full documentation.
`);

process.exit(1);

// Original code follows (no longer executed)
const { execSync } = require('child_process');
const { program } = require('commander');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getCurrentEnv } = require('../packages/theme/dist/config/siteConfig.server');
const { createSiteConfigFromEnv, loadSiteConfig } = require('./utils/site-config-utils.js');
const { sites } = createSiteConfigFromEnv();

// Get valid sites from central configuration (excluding github)
const validSites = Object.keys(sites).filter(site => site !== 'github').map(site => site.toLowerCase());

// Add portal as a valid site
if (!validSites.includes('portal')) {
  validSites.push('portal');
}

// Site-specific ignore patterns
const SITE_SPECIFIC_IGNORE_PATTERNS = {
  // Portal doesn't need special patterns - broken links show as build warnings
  portal: [],
  isbdm: [
    /\/docs\/elements\/\d+/,
    /\/docs\/attributes\/\d+/,
    /\/docs\/statements\/\d+/,
    /\/docs\/notes\/\d+/,
    /\/docs\/relationships\/\d+/,
    /\/vocabulary\/\d+/,
    /\.mdx#\w+/,
    /\/csv\/\w+/,
    /\/rdf\/\w+/
  ],
  lrm: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ],
  frbr: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ],
  isbd: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ],
  unimarc: [
    /\/docs\/fields\/\d+/,
    /\/vocabulary\/\d+/
  ],
  muldicat: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ]
  // Other sites default to checking all links (empty array)
};

program
  .option('--site <site>', 'Site to validate links for (or "all" to check all sites)')
  .option('--timeout <ms>', 'Timeout per link in milliseconds', '10000')
  .option('--max-links <number>', 'Maximum number of links to test per site', '100')
  .option('--output-html', 'Generate HTML report interface', false)
  .option('--ci', 'CI mode - fail on any broken navigation links', false)
  .parse(process.argv);

function getSiteConfig(siteKey, env) {
  // Handle portal specially since it's in the root
  if (siteKey === 'portal') {
    const baseUrl = '/';  // Portal runs at root, not /portal/
    const url = env === 'production' ? 'https://www.ifla.org' : 
                env === 'preview' ? 'https://preview.ifla.org' : 
                'http://localhost:3000';
    
    return {
      title: 'IFLA Standards Portal',
      url,
      baseUrl,
      favicon: 'img/favicon.ico'
    };
  }
  
  // For standard sites, use the centralized config
  // Handle case sensitivity - some sites are uppercase (ISBDM, LRM, FRBR), others lowercase (isbd, muldicat, unimarc)
  const siteKeyMap = {
    'isbdm': 'ISBDM',
    'lrm': 'LRM',
    'frbr': 'FRBR',
    'isbd': 'isbd',
    'muldicat': 'muldicat',
    'unimarc': 'unimarc',
    'newtest': 'newtest'
  };
  
  const configKey = siteKeyMap[siteKey.toLowerCase()];
  if (!configKey) {
    throw new Error(`Unknown site: ${siteKey}`);
  }
  
  return loadSiteConfig(configKey, env);
}

async function validateSiteLinks(siteKey, options = {}) {
  const startTime = Date.now();
  const timeout = parseInt(options.timeout) || 10000;
  const maxLinks = parseInt(options.maxLinks) || 100;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Validating links for ${siteKey.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  
  const env = getCurrentEnv();
  const config = getSiteConfig(siteKey.toLowerCase(), env);
  const baseUrl = `${config.url}${config.baseUrl}`;
  
  console.log(`📍 Environment: ${env}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log(`⏱️  Timeout: ${timeout}ms per link`);
  console.log(`🔢 Max links: ${maxLinks}`);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    site: siteKey,
    environment: env,
    baseUrl,
    timestamp: new Date().toISOString(),
    summary: {
      totalLinks: 0,
      testedLinks: 0,
      passedLinks: 0,
      failedLinks: 0,
      ignoredLinks: 0,
      duration: 0
    },
    brokenLinks: [],
    navigationIssues: [],
    contentIssues: []
  };
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📄 Loading site homepage...');
    
    // For local development, use the local server
    const loadUrl = env === 'development' && siteKey === 'portal' 
      ? 'http://localhost:3000/portal/' 
      : baseUrl;
      
    try {
      await page.goto(loadUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    } catch (error) {
      console.error(`❌ Failed to load homepage: ${error.message}`);
      results.summary.error = `Failed to load homepage: ${error.message}`;
      return results;
    }
    
    // Extract all internal links
    const allLinks = await page.evaluate(() => {
      const links = new Map(); // Use Map to deduplicate by href
      document.querySelectorAll('a[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
          // Only add internal links or relative links
          if (href.startsWith('/') || href.includes(window.location.hostname) || !href.startsWith('http')) {
            const normalizedHref = href.split('#')[0]; // Remove anchors for deduplication
            if (!links.has(normalizedHref)) {
              links.set(normalizedHref, {
                href,
                text: el.textContent?.trim() || '',
                tagName: el.tagName,
                className: el.className,
                isNavigation: el.closest('nav, header, footer, [class*="dropdown"], [class*="navbar"]') !== null,
                isSidebar: el.closest('[class*="sidebar"], [class*="menu"], [class*="toc"]') !== null
              });
            }
          }
        }
      });
      return Array.from(links.values());
    });
    
    results.summary.totalLinks = allLinks.length;
    
    // Apply site-specific ignore patterns
    const ignorePatterns = SITE_SPECIFIC_IGNORE_PATTERNS[siteKey.toLowerCase()] || [];
    const linksToTest = allLinks.filter(link => 
      !ignorePatterns.some(pattern => pattern.test(link.href))
    );
    
    results.summary.ignoredLinks = allLinks.length - linksToTest.length;
    
    // Prioritize navigation and sidebar links
    const navigationLinks = linksToTest.filter(link => link.isNavigation);
    const sidebarLinks = linksToTest.filter(link => link.isSidebar && !link.isNavigation);
    const otherLinks = linksToTest.filter(link => !link.isNavigation && !link.isSidebar);
    
    // Create final list with prioritization
    const finalLinks = [...navigationLinks, ...sidebarLinks, ...otherLinks].slice(0, maxLinks);
    
    console.log(`🔗 Found ${allLinks.length} total links`);
    console.log(`   - ${navigationLinks.length} navigation links`);
    console.log(`   - ${sidebarLinks.length} sidebar links`);
    console.log(`   - ${otherLinks.length} content links`);
    console.log(`   - ${results.summary.ignoredLinks} ignored (generated content)`);
    console.log(`   → Testing ${finalLinks.length} links`);
    
    // Test links
    const testedUrls = new Set(); // Track tested URLs to avoid duplicates
    
    for (let i = 0; i < finalLinks.length; i++) {
      const link = finalLinks[i];
      
      // Construct the full URL for testing
      let testUrl;
      if (link.href.startsWith('http')) {
        testUrl = link.href;
      } else if (link.href.startsWith('/')) {
        testUrl = `${config.url}${link.href}`;
      } else {
        testUrl = `${config.url}${config.baseUrl}${link.href}`;
      }
      
      // Skip if already tested
      if (testedUrls.has(testUrl)) {
        continue;
      }
      testedUrls.add(testUrl);
      
      try {
        const displayText = link.text.substring(0, 40) + (link.text.length > 40 ? '...' : '');
        process.stdout.write(`  [${results.summary.testedLinks + 1}/${finalLinks.length}] Testing: "${displayText}" -> ${link.href}`);
        
        const response = await page.goto(testUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout 
        });
        
        results.summary.testedLinks++;
        
        if (!response || response.status() >= 400) {
          const brokenLink = {
            href: link.href,
            text: link.text,
            status: response?.status(),
            testUrl,
            isNavigation: link.isNavigation,
            isSidebar: link.isSidebar,
            priority: link.isNavigation ? 'HIGH' : (link.isSidebar ? 'MEDIUM' : 'LOW')
          };
          
          results.summary.failedLinks++;
          results.brokenLinks.push(brokenLink);
          
          if (link.isNavigation) {
            results.navigationIssues.push(brokenLink);
          } else {
            results.contentIssues.push(brokenLink);
          }
          
          process.stdout.write(` ❌ (${response?.status() || 'no response'})\n`);
        } else {
          results.summary.passedLinks++;
          process.stdout.write(' ✅\n');
        }
        
      } catch (error) {
        const brokenLink = {
          href: link.href,
          text: link.text,
          error: error.message,
          testUrl,
          isNavigation: link.isNavigation,
          isSidebar: link.isSidebar,
          priority: link.isNavigation ? 'HIGH' : (link.isSidebar ? 'MEDIUM' : 'LOW')
        };
        
        results.summary.testedLinks++;
        results.summary.failedLinks++;
        results.brokenLinks.push(brokenLink);
        
        if (link.isNavigation) {
          results.navigationIssues.push(brokenLink);
        } else {
          results.contentIssues.push(brokenLink);
        }
        
        process.stdout.write(` ❌ (${error.message})\n`);
      }
    }
    
    results.summary.duration = Math.round((Date.now() - startTime) / 1000);
    
    // Print summary
    console.log(`\n📊 Results for ${siteKey.toUpperCase()}:`);
    console.log(`   ✅ Passed: ${results.summary.passedLinks}/${results.summary.testedLinks}`);
    console.log(`   ❌ Failed: ${results.summary.failedLinks}/${results.summary.testedLinks}`);
    console.log(`   ⏱️  Duration: ${results.summary.duration}s`);
    
    if (results.navigationIssues.length > 0) {
      console.error(`\n🚨 CRITICAL: ${results.navigationIssues.length} navigation issues found!`);
    }
    
    if (results.contentIssues.length > 0) {
      console.warn(`\n⚠️  WARNING: ${results.contentIssues.length} content link issues found`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error validating ${siteKey}: ${error.message}`);
    results.summary.error = error.message;
  } finally {
    await browser.close();
  }
  
  return results;
}

async function validateAllSites(options) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 Starting validation for all Docusaurus sites');
  console.log(`${'='.repeat(60)}`);
  
  const allResults = {
    timestamp: new Date().toISOString(),
    environment: getCurrentEnv(),
    sites: {},
    summary: {
      totalSites: validSites.length,
      sitesWithIssues: 0,
      totalBrokenLinks: 0,
      totalNavigationIssues: 0,
      totalContentIssues: 0
    }
  };
  
  for (const site of validSites) {
    try {
      const results = await validateSiteLinks(site, options);
      allResults.sites[site] = results;
      
      if (results.summary.failedLinks > 0) {
        allResults.summary.sitesWithIssues++;
        allResults.summary.totalBrokenLinks += results.summary.failedLinks;
        allResults.summary.totalNavigationIssues += results.navigationIssues.length;
        allResults.summary.totalContentIssues += results.contentIssues.length;
      }
    } catch (error) {
      console.error(`Failed to validate ${site}: ${error.message}`);
      allResults.sites[site] = {
        error: error.message,
        summary: { error: error.message }
      };
    }
  }
  
  return allResults;
}

function saveResults(results, isSingleSite = false) {
  const outputDir = path.join(process.cwd(), 'output', 'link-validation');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const siteName = isSingleSite ? results.site : 'all-sites';
  
  // Save JSON report
  const jsonFile = path.join(outputDir, `${siteName}-${timestamp}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 JSON report saved to: ${jsonFile}`);
  
  // Save summary text file
  const summaryFile = path.join(outputDir, `${siteName}-${timestamp}-summary.txt`);
  let summaryContent = '';
  
  if (isSingleSite) {
    summaryContent = generateSingleSiteSummary(results);
  } else {
    summaryContent = generateAllSitesSummary(results);
  }
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`📝 Summary saved to: ${summaryFile}`);
  
  return { jsonFile, summaryFile };
}

function generateSingleSiteSummary(results) {
  let summary = `Link Validation Report for ${results.site.toUpperCase()}\n`;
  summary += `${'='.repeat(50)}\n\n`;
  summary += `Environment: ${results.environment}\n`;
  summary += `Base URL: ${results.baseUrl}\n`;
  summary += `Timestamp: ${results.timestamp}\n`;
  summary += `Duration: ${results.summary.duration}s\n\n`;
  
  summary += `Summary:\n`;
  summary += `--------\n`;
  summary += `Total Links Found: ${results.summary.totalLinks}\n`;
  summary += `Links Tested: ${results.summary.testedLinks}\n`;
  summary += `Links Passed: ${results.summary.passedLinks}\n`;
  summary += `Links Failed: ${results.summary.failedLinks}\n`;
  summary += `Links Ignored: ${results.summary.ignoredLinks}\n\n`;
  
  if (results.navigationIssues.length > 0) {
    summary += `CRITICAL Navigation Issues (${results.navigationIssues.length}):\n`;
    summary += `${'='.repeat(40)}\n`;
    results.navigationIssues.forEach((link, i) => {
      summary += `${i + 1}. "${link.text}"\n`;
      summary += `   URL: ${link.href}\n`;
      if (link.status) summary += `   Status: ${link.status}\n`;
      if (link.error) summary += `   Error: ${link.error}\n`;
      summary += '\n';
    });
  }
  
  if (results.contentIssues.length > 0) {
    summary += `Content Link Issues (${results.contentIssues.length}):\n`;
    summary += `${'='.repeat(40)}\n`;
    results.contentIssues.forEach((link, i) => {
      summary += `${i + 1}. "${link.text}"\n`;
      summary += `   URL: ${link.href}\n`;
      if (link.status) summary += `   Status: ${link.status}\n`;
      if (link.error) summary += `   Error: ${link.error}\n`;
      summary += '\n';
    });
  }
  
  return summary;
}

function generateAllSitesSummary(results) {
  let summary = `Link Validation Report for All Sites\n`;
  summary += `${'='.repeat(50)}\n\n`;
  summary += `Environment: ${results.environment}\n`;
  summary += `Timestamp: ${results.timestamp}\n\n`;
  
  summary += `Overall Summary:\n`;
  summary += `---------------\n`;
  summary += `Total Sites: ${results.summary.totalSites}\n`;
  summary += `Sites with Issues: ${results.summary.sitesWithIssues}\n`;
  summary += `Total Broken Links: ${results.summary.totalBrokenLinks}\n`;
  summary += `Total Navigation Issues: ${results.summary.totalNavigationIssues}\n`;
  summary += `Total Content Issues: ${results.summary.totalContentIssues}\n\n`;
  
  Object.entries(results.sites).forEach(([site, siteResults]) => {
    summary += `\n${site.toUpperCase()}\n`;
    summary += `${'-'.repeat(site.length)}\n`;
    
    if (siteResults.error) {
      summary += `ERROR: ${siteResults.error}\n`;
    } else {
      summary += `Tested: ${siteResults.summary.testedLinks} | `;
      summary += `Passed: ${siteResults.summary.passedLinks} | `;
      summary += `Failed: ${siteResults.summary.failedLinks}\n`;
      
      if (siteResults.navigationIssues?.length > 0) {
        summary += `⚠️  ${siteResults.navigationIssues.length} navigation issues\n`;
      }
      if (siteResults.contentIssues?.length > 0) {
        summary += `⚠️  ${siteResults.contentIssues.length} content issues\n`;
      }
    }
  });
  
  return summary;
}

function generateHTMLReport(results, outputFiles) {
  const outputDir = path.join(process.cwd(), 'output', 'link-validation');
  const htmlFile = path.join(outputDir, 'index.html');
  
  const isSingleSite = results.site !== undefined;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Validation Report${isSingleSite ? ` - ${results.site.toUpperCase()}` : ' - All Sites'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f7f9fc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            transition: transform 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.5em;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .site-card {
            background: #f7f9fc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .site-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .site-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
        }
        .site-stats {
            display: flex;
            gap: 15px;
        }
        .site-stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .badge-success {
            background: #10b981;
            color: white;
        }
        .badge-error {
            background: #ef4444;
            color: white;
        }
        .badge-warning {
            background: #f59e0b;
            color: white;
        }
        .issues-list {
            margin-top: 15px;
        }
        .issue-item {
            background: white;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid #ef4444;
        }
        .issue-item.warning {
            border-left-color: #f59e0b;
        }
        .issue-text {
            font-weight: 500;
            color: #333;
            margin-bottom: 5px;
        }
        .issue-url {
            color: #666;
            font-size: 0.9em;
            word-break: break-all;
        }
        .issue-status {
            color: #ef4444;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .download-links {
            background: #f7f9fc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }
        .download-links a {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.2s;
        }
        .download-links a:hover {
            background: #764ba2;
        }
        .timestamp {
            text-align: center;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .no-issues {
            padding: 20px;
            background: #10b981;
            color: white;
            border-radius: 8px;
            text-align: center;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Link Validation Report</h1>
            <div class="subtitle">${isSingleSite ? results.site.toUpperCase() : 'All Docusaurus Sites'}</div>
        </div>
        
        <div class="content">`;
  
  if (isSingleSite) {
    // Single site report
    html += `
            <div class="summary-grid">
                <div class="stat-card">
                    <div class="stat-value">${results.summary.totalLinks}</div>
                    <div class="stat-label">Total Links</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.testedLinks}</div>
                    <div class="stat-label">Links Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.passedLinks}</div>
                    <div class="stat-label">Links Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.failedLinks}</div>
                    <div class="stat-label">Links Failed</div>
                </div>
            </div>`;
    
    if (results.navigationIssues.length > 0) {
      html += `
            <div class="section">
                <h2 class="section-title">🚨 Critical Navigation Issues</h2>
                <div class="issues-list">`;
      
      results.navigationIssues.forEach(issue => {
        html += `
                    <div class="issue-item">
                        <div class="issue-text">${issue.text || 'No text'}</div>
                        <div class="issue-url">${issue.href}</div>
                        ${issue.status ? `<div class="issue-status">Status: ${issue.status}</div>` : ''}
                        ${issue.error ? `<div class="issue-status">Error: ${issue.error}</div>` : ''}
                    </div>`;
      });
      
      html += `
                </div>
            </div>`;
    }
    
    if (results.contentIssues.length > 0) {
      html += `
            <div class="section">
                <h2 class="section-title">⚠️ Content Link Issues</h2>
                <div class="issues-list">`;
      
      results.contentIssues.forEach(issue => {
        html += `
                    <div class="issue-item warning">
                        <div class="issue-text">${issue.text || 'No text'}</div>
                        <div class="issue-url">${issue.href}</div>
                        ${issue.status ? `<div class="issue-status">Status: ${issue.status}</div>` : ''}
                        ${issue.error ? `<div class="issue-status">Error: ${issue.error}</div>` : ''}
                    </div>`;
      });
      
      html += `
                </div>
            </div>`;
    }
    
    if (results.summary.failedLinks === 0) {
      html += `
            <div class="no-issues">
                ✅ All tested links are working perfectly!
            </div>`;
    }
    
  } else {
    // All sites report
    html += `
            <div class="summary-grid">
                <div class="stat-card">
                    <div class="stat-value">${results.summary.totalSites}</div>
                    <div class="stat-label">Total Sites</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.sitesWithIssues}</div>
                    <div class="stat-label">Sites with Issues</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.totalBrokenLinks}</div>
                    <div class="stat-label">Total Broken Links</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${results.summary.totalNavigationIssues}</div>
                    <div class="stat-label">Navigation Issues</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">📊 Site-by-Site Results</h2>`;
    
    Object.entries(results.sites).forEach(([site, siteResults]) => {
      const hasIssues = siteResults.summary?.failedLinks > 0;
      
      html += `
                <div class="site-card">
                    <div class="site-header">
                        <div class="site-name">${site.toUpperCase()}</div>
                        <div class="site-stats">`;
      
      if (siteResults.error) {
        html += `<span class="badge badge-error">ERROR</span>`;
      } else {
        html += `
                            <div class="site-stat">
                                <span class="badge badge-success">${siteResults.summary.passedLinks}</span>
                                <span>passed</span>
                            </div>`;
        
        if (siteResults.summary.failedLinks > 0) {
          html += `
                            <div class="site-stat">
                                <span class="badge badge-error">${siteResults.summary.failedLinks}</span>
                                <span>failed</span>
                            </div>`;
        }
      }
      
      html += `
                        </div>
                    </div>`;
      
      if (siteResults.error) {
        html += `
                    <div class="issue-item">
                        <div class="issue-text">Error: ${siteResults.error}</div>
                    </div>`;
      } else if (hasIssues) {
        if (siteResults.navigationIssues?.length > 0) {
          html += `
                    <div class="issues-list">
                        <strong>Navigation Issues (${siteResults.navigationIssues.length}):</strong>`;
          
          siteResults.navigationIssues.slice(0, 3).forEach(issue => {
            html += `
                        <div class="issue-item">
                            <div class="issue-text">${issue.text || 'No text'}</div>
                            <div class="issue-url">${issue.href}</div>
                        </div>`;
          });
          
          if (siteResults.navigationIssues.length > 3) {
            html += `<div style="padding: 10px; color: #666;">...and ${siteResults.navigationIssues.length - 3} more</div>`;
          }
          
          html += `</div>`;
        }
        
        if (siteResults.contentIssues?.length > 0) {
          html += `
                    <div class="issues-list">
                        <strong>Content Issues (${siteResults.contentIssues.length}):</strong>`;
          
          siteResults.contentIssues.slice(0, 3).forEach(issue => {
            html += `
                        <div class="issue-item warning">
                            <div class="issue-text">${issue.text || 'No text'}</div>
                            <div class="issue-url">${issue.href}</div>
                        </div>`;
          });
          
          if (siteResults.contentIssues.length > 3) {
            html += `<div style="padding: 10px; color: #666;">...and ${siteResults.contentIssues.length - 3} more</div>`;
          }
          
          html += `</div>`;
        }
      } else if (!siteResults.error) {
        html += `<div style="color: #10b981; padding: 10px;">✅ All links working!</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  // Add download links
  html += `
            <div class="download-links">
                <strong>Download Reports:</strong><br>
                <a href="${path.basename(outputFiles.jsonFile)}" download>📄 JSON Report</a>
                <a href="${path.basename(outputFiles.summaryFile)}" download>📝 Text Summary</a>
            </div>
            
            <div class="timestamp">
                Generated on ${new Date(results.timestamp).toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(htmlFile, html);
  console.log(`🌐 HTML report saved to: ${htmlFile}`);
  
  // Create a simple server script to view the report
  const serverScript = path.join(outputDir, 'view-report.js');
  const serverContent = `#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.txt') contentType = 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(\`\\n🌐 Link Validation Report Server\\n\`);
  console.log(\`📍 Open in browser: http://localhost:\${PORT}\\n\`);
  console.log(\`Press Ctrl+C to stop the server\\n\`);
});
`;
  
  fs.writeFileSync(serverScript, serverContent);
  fs.chmodSync(serverScript, '755');
  
  console.log(`\n✨ To view the report in your browser, run:`);
  console.log(`   node ${serverScript}`);
}

async function main() {
  const options = program.opts();
  let { site } = options;
  
  // Handle the case where site is "all"
  if (site === 'all') {
    const results = await validateAllSites(options);
    const outputFiles = saveResults(results, false);
    
    if (options.outputHtml) {
      generateHTMLReport(results, outputFiles);
    }
    
    // Exit with error if CI mode and there are navigation issues
    if (options.ci && results.summary.totalNavigationIssues > 0) {
      console.error(`\n❌ CI check failed: ${results.summary.totalNavigationIssues} navigation issues found`);
      process.exit(1);
    }
    
    return;
  }
  
  // Validate single site
  if (site && !validSites.includes(site.toLowerCase())) {
    console.error(`Invalid site: ${site}. Must be one of: ${validSites.join(', ')} or "all"`);
    process.exit(1);
  }
  
  // If no site specified, default to checking all
  if (!site) {
    console.log('No site specified, checking all sites...');
    site = 'all';
    const results = await validateAllSites(options);
    const outputFiles = saveResults(results, false);
    
    if (options.outputHtml) {
      generateHTMLReport(results, outputFiles);
    }
    
    // Exit with error if CI mode and there are navigation issues
    if (options.ci && results.summary.totalNavigationIssues > 0) {
      console.error(`\n❌ CI check failed: ${results.summary.totalNavigationIssues} navigation issues found`);
      process.exit(1);
    }
    
    return;
  }
  
  // Single site validation
  const results = await validateSiteLinks(site.toLowerCase(), options);
  const outputFiles = saveResults(results, true);
  
  if (options.outputHtml) {
    generateHTMLReport(results, outputFiles);
  }
  
  // Exit with error if CI mode and there are navigation issues
  if (options.ci && results.navigationIssues.length > 0) {
    console.error(`\n❌ CI check failed: ${results.navigationIssues.length} navigation issues found`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Link validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateSiteLinks, validateAllSites };