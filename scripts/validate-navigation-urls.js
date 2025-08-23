#!/usr/bin/env node

const { createSiteConfigFromEnv } = require('./utils/site-config-utils.js');
// Navigation validation script uses site config from utils
const { sites, DocsEnv } = createSiteConfigFromEnv();

/**
 * Validates that navigation URLs are correctly configured for the current environment.
 * For non-localhost environments, URLs will appear "broken" locally but should match
 * the expected deployment URLs.
 * 
 * Automatically future-proofed by using the central site configuration.
 */

// Generate expected patterns dynamically from the central site configuration
function generateExpectedPatterns() {
  const patterns = {};
  
  Object.values(DocsEnv).forEach(env => {
    patterns[env] = {};
    
    Object.entries(sites).forEach(([siteKey, siteConfigs]) => {
      if (siteKey === 'github') {return;} // Skip github as it's not a user-facing site
      
      const config = siteConfigs[env];
      if (config) {
        // Escape special regex characters and create pattern
        const escapedUrl = config.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedBaseUrl = config.baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        patterns[env][siteKey] = new RegExp(`^${escapedUrl}${escapedBaseUrl}`);
      }
    });
  });
  
  return patterns;
}

const EXPECTED_PATTERNS = generateExpectedPatterns();

function validateNavigationUrls() {
  console.log('\n🧭 Validating Navigation URL Configuration...');
  
  const env = process.env.DOCS_ENV || 'local';
  console.log(`📍 Current Environment: ${env}`);
  
  const expectedPatterns = EXPECTED_PATTERNS[env];
  if (!expectedPatterns) {
    console.error(`❌ No URL patterns defined for environment: ${env}`);
    process.exit(1);
  }
  
  console.log(`🎯 Expected URL patterns for ${env}:`);
  Object.entries(expectedPatterns).forEach(([site, pattern]) => {
    console.log(`   ${site}: ${pattern.source}`);
  });
  
  const issues = [];
  
  // Note: Standards dropdown navigation testing skipped - now using SiteLink component
  console.log('\n🔍 Skipping Standards Dropdown URLs (now using centralized SiteLink component)...');
  
  // Note: Footer site links validation removed as all sites now use Resources footer pattern
  
  // Test individual getSiteUrl calls
  console.log('\n🔍 Testing getSiteUrl Function...');
  Object.keys(expectedPatterns).forEach(site => {
    const testPaths = ['/', '/docs/intro', '/blog'];
    testPaths.forEach(path => {
      const url = getSiteUrl(site, path, env);
      const pattern = expectedPatterns[site];
      
      console.log(`  Testing: getSiteUrl('${site}', '${path}', '${env}') -> ${url}`);
      
      if (!pattern.test(url)) {
        issues.push({
          type: 'getSiteUrl Function',
          label: `${site}${path}`,
          url,
          expected: pattern.source,
          site
        });
      }
    });
  });
  
  // Report results
  if (issues.length > 0) {
    console.error(`\n❌ Found ${issues.length} navigation URL configuration issues:`);
    
    issues.forEach((issue, i) => {
      console.error(`\n  ${i + 1}. ${issue.type}: "${issue.label}"`);
      console.error(`     Generated URL: ${issue.url}`);
      console.error(`     Expected pattern: ${issue.expected}`);
      console.error(`     Site: ${issue.site}`);
    });
    
    console.error(`\n💡 These URLs may work when deployed to ${env} environment`);
    console.error(`   but indicate configuration issues that should be fixed.`);
    
    process.exit(1);
  } else {
    console.log(`\n✅ All navigation URLs are correctly configured for ${env} environment!`);
    
    if (env !== 'localhost') {
      console.log(`\n📝 Note: URLs point to ${env} environment and will appear broken`);
      console.log(`    when tested locally, but should work when deployed.`);
    }
  }
}

// Test function for manual verification
function showNavigationUrls() {
  const env = process.env.DOCS_ENV || 'local';
  console.log(`\n📋 Navigation URLs for ${env} environment:\n`);
  
  console.log('🔗 Standards Dropdown: (Skipped - now using SiteLink component)');
  
  console.log('\n🔗 Footer Site Links: (Removed - all sites now use Resources footer pattern)');
  
  console.log('\n🔗 Sample getSiteUrl calls:');
  // Get first 3 sites (excluding github) from central configuration
  const sampleSites = Object.keys(sites).filter(site => site !== 'github').slice(0, 3);
  sampleSites.forEach(site => {
    console.log(`   ${site}/: ${getSiteUrl(site, '/', env)}`);
    console.log(`   ${site}/docs/intro: ${getSiteUrl(site, '/docs/intro', env)}`);
  });
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'show') {
    showNavigationUrls();
  } else {
    validateNavigationUrls();
  }
}

module.exports = { validateNavigationUrls, showNavigationUrls };