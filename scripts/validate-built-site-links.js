#!/usr/bin/env node

// const { execSync } = require('child_process'); // Unused for now
const { program } = require('commander');
const inquirer = require('inquirer').default;
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Get valid sites from the theme configuration
const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
const { sites, DocsEnv } = createSiteConfigFromEnv();
const validSites = Object.keys(sites).filter(site => site !== 'github');

program
  .option('--site <site>', 'Site to validate links for (e.g., ISBDM, portal, or "all")')
  .option('--port <port>', 'Starting port number for testing sites', '3000')
  .option('--timeout <ms>', 'Timeout per link in milliseconds', '10000')
  .option('--max-links <number>', 'Maximum number of links to test per site', '100')
  .option('--build-dir <dir>', 'Build directory path (relative to site dir)', 'build')
  .option('--include-generated', 'Include generated element/vocab links in testing', false)
  .option('--continue-on-error', 'Continue testing other sites even if one fails', false)
  .parse();

// Common ignore patterns for all sites
const GLOBAL_IGNORE_PATTERNS = [
  /^mailto:/,
  /^tel:/,
  /^#/,
  /javascript:/,
  /^https?:\/\/(?!localhost)/,  // External links
];

// Site-specific patterns for generated content (only applied if --include-generated is false)
const GENERATED_CONTENT_PATTERNS = {
  isbdm: [
    /\/docs\/elements\/\d+/,
    /\/docs\/attributes\/\d+/,
    /\/docs\/statements\/\d+/,
    /\/docs\/notes\/\d+/,
    /\/docs\/relationships\/\d+/,
    /\/vocabulary\/\d+/,
  ],
  lrm: [
    /\/docs\/elements\/\d+/,
    /\/vocabulary\/\d+/
  ]
};

async function validateBuiltSiteLinks(siteKey, options = {}) {
  const {
    port = null, // Will use site config if not provided
    timeout = 10000,
    maxLinks = 100,
    buildDir = 'build',
    includeGenerated = false
  } = options;
  
  // Get site configuration for local environment
  const siteConfig = sites[siteKey]?.[DocsEnv.Local];
  if (!siteConfig) {
    console.error(`❌ No configuration found for site '${siteKey}' in local environment`);
    process.exit(1);
  }
  
  // Use configured port if not overridden
  const actualPort = port || siteConfig.port || '3000';
  const baseUrl = siteConfig.url; // Use full URL from config
  
  const siteDir = siteKey.toLowerCase() === 'portal' ? 'portal' : `standards/${siteKey}`;
  const buildPath = path.join(process.cwd(), siteDir, buildDir);
  
  console.log(`\n🔍 Validating BUILT site links for ${siteKey.toUpperCase()}...`);
  console.log(`📁 Build directory: ${buildPath}`);
  console.log(`🌐 Testing against: ${baseUrl} (port ${actualPort})`);
  console.log(`🔗 Base URL: ${siteConfig.baseUrl}`);
  console.log(`⏱️  Timeout: ${timeout}ms per link`);
  console.log(`🔢 Max links: ${maxLinks}`);
  console.log(`🔗 Include generated links: ${includeGenerated ? 'YES' : 'NO'}`);
  
  // Check if build directory exists
  if (!fs.existsSync(buildPath)) {
    console.error(`❌ Build directory not found: ${buildPath}`);
    console.error(`💡 Run: pnpm run build:${siteKey.toLowerCase()} first`);
    process.exit(1);
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up request interception to catch 404s
    await page.setRequestInterception(true);
    const failedRequests = new Set();
    
    page.on('request', request => {
      request.continue();
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.add({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    console.log('📄 Loading built site homepage...');
    
    // Construct the full homepage URL including baseUrl path
    const homepageUrl = `${baseUrl}${siteConfig.baseUrl}`.replace(/\/+$/, '/');
    
    try {
      await page.goto(homepageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
     
    } catch (_error) {
      console.error(`❌ Failed to load ${homepageUrl}`);
      console.error(`💡 Make sure you're serving the built site on port ${actualPort}`);
      console.error(`   For built sites, use: pnpm run serve`);
      console.error(`   For specific site: cd ${siteDir} && pnpm run serve`);
      process.exit(1);
    }
    
    // Extract all internal links
    const allLinks = await page.evaluate((siteBaseUrl) => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && (
          href.startsWith('/') || 
          href.includes(window.location.hostname) ||
          href.startsWith(siteBaseUrl) ||
          href.startsWith('.') ||
          !href.includes('://')  // Relative links without protocol
        )) {
          links.push({
            href,
            text: el.textContent?.trim() || '',
            tagName: el.tagName,
            className: el.className,
            isNavigation: el.closest('nav, footer, [class*="dropdown"]') !== null
          });
        }
      });
      return links;
    }, siteConfig.baseUrl);
    
    // Apply ignore patterns
    let ignorePatterns = [...GLOBAL_IGNORE_PATTERNS];
    
    // Add generated content patterns if not including generated links
    if (!includeGenerated) {
      const siteGeneratedPatterns = GENERATED_CONTENT_PATTERNS[siteKey.toLowerCase()] || [];
      ignorePatterns = [...ignorePatterns, ...siteGeneratedPatterns];
    }
    
    const linksToTest = allLinks.filter(link => 
      !ignorePatterns.some(pattern => pattern.test(link.href))
    );
    
    // Prioritize navigation links and limit total
    const navigationLinks = linksToTest.filter(link => link.isNavigation);
    const contentLinks = linksToTest.filter(link => !link.isNavigation);
    const finalLinks = [...navigationLinks, ...contentLinks].slice(0, maxLinks);
    
    console.log(`🔗 Found ${allLinks.length} total links, testing ${finalLinks.length} (${navigationLinks.length} navigation + ${contentLinks.length} content)`);
    
    if (includeGenerated) {
      console.log(`⚡ Including generated content links in testing`);
    }
    
    // Test links
    const results = {
      tested: 0,
      passed: 0,
      failed: 0,
      broken: []
    };
    
    for (const link of finalLinks) {
      try {
        // Handle relative vs absolute URLs
        let testUrl;
        if (link.href.startsWith('http')) {
          testUrl = link.href;
        } else if (link.href.startsWith('/')) {
          // For links starting with /, they should be relative to domain root
          testUrl = `${baseUrl}${link.href}`;
        } else {
          // For relative links, append to current baseUrl
          testUrl = `${baseUrl}${siteConfig.baseUrl}${link.href}`.replace(/\/+/g, '/');
        }
        
        console.log(`  [${results.tested + 1}/${finalLinks.length}] Testing: "${link.text.substring(0, 30)}..." -> ${link.href}`);
        
        const response = await page.goto(testUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: parseInt(timeout)
        });
        
        results.tested++;
        
        if (!response || response.status() >= 400) {
          results.failed++;
          results.broken.push({ 
            ...link, 
            testUrl,
            status: response?.status(),
            statusText: response?.statusText(),
            priority: link.isNavigation ? 'HIGH' : 'LOW'
          });
        } else {
          results.passed++;
        }
        
      } catch (error) {
        results.tested++;
        results.failed++;
        results.broken.push({ 
          ...link, 
          testUrl: link.href,
          error: error.message,
          priority: link.isNavigation ? 'HIGH' : 'LOW'
        });
      }
    }
    
    // Report results
    console.log(`\n📊 Built Site Link Validation Results for ${siteKey.toUpperCase()}:`);
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Total: ${results.tested}`);
    
    if (results.broken.length > 0) {
      console.error(`\n❌ Broken Links Found in Built Site:`);
      
      // Show high priority (navigation) issues first
      const highPriority = results.broken.filter(link => link.priority === 'HIGH');
      const lowPriority = results.broken.filter(link => link.priority === 'LOW');
      
      if (highPriority.length > 0) {
        console.error(`\n🚨 HIGH PRIORITY (Navigation Issues):`);
        highPriority.forEach((link, i) => {
          console.error(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.testUrl && link.testUrl !== link.href) {
            console.error(`     Tested: ${link.testUrl}`);
          }
          if (link.error) {console.error(`     Error: ${link.error}`);}
          if (link.status) {console.error(`     Status: ${link.status} ${link.statusText || ''}`);}
        });
      }
      
      if (lowPriority.length > 0) {
        console.error(`\n⚠️  LOW PRIORITY (Content Issues):`);
        lowPriority.forEach((link, i) => {
          console.error(`  ${i + 1}. "${link.text}" -> ${link.href}`);
          if (link.testUrl && link.testUrl !== link.href) {
            console.error(`     Tested: ${link.testUrl}`);
          }
          if (link.error) {console.error(`     Error: ${link.error}`);}
          if (link.status) {console.error(`     Status: ${link.status} ${link.statusText || ''}`);}
        });
      }
      
      // Exit with error if high priority issues found
      if (highPriority.length > 0) {
        console.error(`\n💥 Found ${highPriority.length} critical navigation issues in built site`);
        process.exit(1);
      } else {
        console.warn(`\n⚠️  Warning: ${lowPriority.length} content link issues found in built site`);
      }
    } else {
      console.log('\n✅ All tested links in the built site are working!');
    }
    
    // Report any requests that failed during page loads
    if (failedRequests.size > 0) {
      console.warn(`\n⚠️  Additional failed requests detected:`);
      Array.from(failedRequests).forEach((req, i) => {
        console.warn(`  ${i + 1}. ${req.status} ${req.statusText} -> ${req.url}`);
      });
    }
    
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = program.opts();
  let { site, port, continueOnError, timeout, maxLinks, includeGenerated } = options;

  // Interactive prompts for missing options
  if (!site) {
    const siteChoices = [
      { name: 'All sites', value: 'all' },
      ...validSites.map(s => ({ name: s, value: s }))
    ];
    
    const { site: siteValue } = await inquirer.prompt([
      {
        type: 'list',
        name: 'site',
        message: 'Select site(s) to test:',
        choices: siteChoices,
        default: 'ISBDM'
      }
    ]);
    site = siteValue;
  }

  if (!port) {
    const { port: portValue } = await inquirer.prompt([
      {
        type: 'number',
        name: 'port',
        message: 'Starting port number for testing (sites will use sequential ports):',
        default: 3000,
        validate: (input) => (input >= 3000 && input <= 9999) || 'Port must be between 3000-9999'
      }
    ]);
    port = portValue;
  }

  // Ask about additional options if not provided
  if (includeGenerated === undefined) {
    const { includeGenerated: includeGeneratedValue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeGenerated',
        message: 'Include generated element/vocabulary links in testing? (may find more issues)',
        default: false
      }
    ]);
    includeGenerated = includeGeneratedValue;
  }

  if (site === 'all' && continueOnError === undefined) {
    const { continueOnError: continueOnErrorValue } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueOnError',
        message: 'Continue testing other sites if one fails?',
        default: true
      }
    ]);
    continueOnError = continueOnErrorValue;
  }

  // Update options with prompted values
  const finalOptions = {
    ...options,
    port: port.toString(),
    continueOnError,
    includeGenerated,
    timeout: timeout || options.timeout,
    maxLinks: maxLinks || options.maxLinks
  };

  // Determine which sites to test
  let sitesToTest = [];
  
  if (site.toLowerCase() === 'all') {
    sitesToTest = validSites;
  } else if (site.includes(',')) {
    // Multiple sites specified
    sitesToTest = site.split(',').map(s => s.trim());
    
    // Validate all specified sites exist
    const invalidSites = sitesToTest.filter(s => !validSites.map(v => v.toLowerCase()).includes(s.toLowerCase()));
    if (invalidSites.length > 0) {
      console.error(`❌ Invalid sites: ${invalidSites.join(', ')}`);
      console.error(`Available sites: ${validSites.join(', ')}`);
      process.exit(1);
    }
  } else {
    // Single site
    if (!validSites.map(v => v.toLowerCase()).includes(site.toLowerCase())) {
      console.error(`❌ Invalid site: ${site}`);
      console.error(`Available sites: ${validSites.join(', ')}`);
      process.exit(1);
    }
    sitesToTest = [site];
  }

  console.log(`\n🎯 Testing ${sitesToTest.length} site(s): ${sitesToTest.join(', ')}`);
  
  const results = {
    total: sitesToTest.length,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Test each site
  for (let i = 0; i < sitesToTest.length; i++) {
    const siteKey = sitesToTest[i];
    const sitePort = parseInt(finalOptions.port) + i; // Increment port for each site
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${siteKey} (${i + 1}/${sitesToTest.length}) on port ${sitePort}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Update options with current port
      await validateBuiltSiteLinks(siteKey, { ...finalOptions, port: sitePort });
      results.passed++;
    } catch (error) {
      results.failed++;
      results.errors.push({ site: siteKey, error: error.message });
      
      if (!finalOptions.continueOnError) {
        console.error(`\n❌ Stopping due to errors in ${siteKey}`);
        console.log('💡 Use --continue-on-error to test remaining sites');
        process.exit(1);
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 OVERALL RESULTS');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total sites tested: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.error('\n❌ Failed sites:');
    results.errors.forEach(({ site, error }) => {
      console.error(`  - ${site}: ${error}`);
    });
  }
  
  if (results.failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Built site link validation failed:', error);
    process.exit(1);
  });
}

module.exports = { validateBuiltSiteLinks };