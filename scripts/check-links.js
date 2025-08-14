#!/usr/bin/env node

/**
 * Simple wrapper for common link validation use cases
 * 
 * Full documentation: developer_notes/link-validation.md
 * 
 * Examples:
 *   check-links                    # Check all sites on local dev servers
 *   check-links isbdm              # Check ISBDM on local dev server
 *   check-links portal production  # Check portal on production
 *   check-links all preview        # Check all sites on preview
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
let site = args[0];
let env = args[1];
let type = args[2];

// Show help if requested
if (args[0] === '--help' || args[0] === '-h') {
  console.log(`
🔍 IFLA Standards Link Checker

Usage:
  check-links [site] [environment] [type]

Arguments:
  site         Site to check (default: all)
               Options: all, portal, isbdm, lrm, frbr, isbd, muldicat, unimarc
               Can also use comma-separated: "isbdm,lrm,portal"
               
  environment  Environment to check (default: local)
               Options: local, preview, production
               
  type         Type of validation (default: sitemap)
               Options: 
                 - static: Just navigation/footer links
                 - sitemap: Comprehensive sitemap-based (recommended)
                 - comprehensive: Deep validation with all pages
                 - both: Both static and generated links

Advanced Options:
  For depth control and other options, use the underlying script directly:
  node scripts/validate-environment-urls.js --depth 1 --site isbdm
  
  --depth controls crawl depth:
    - Default: All links from sitemap (no depth limit)
    - --depth 0: Homepage only
    - --depth 1: Homepage + direct links
    - --depth 2: Two levels deep

Examples:
  check-links                         # Check all sites locally with sitemap
  check-links isbdm                   # Check ISBDM locally with sitemap
  check-links portal production       # Check portal on production
  check-links all preview static      # Quick nav check on preview
  check-links "isbdm,lrm" local       # Check multiple specific sites
  
Quick Commands:
  check-links quick                   # Quick homepage check for all sites
  check-links full                    # Full comprehensive check for all sites

Documentation:
  Full documentation: developer_notes/link-validation.md

After running, view reports with:
  node output/link-validation/view-report.js
  `);
  process.exit(0);
}

// Handle special shortcuts
if (site === 'quick') {
  site = 'all';
  type = 'static';
  console.log('🚀 Running quick navigation check for all sites...');
} else if (site === 'full') {
  site = 'all';
  type = 'comprehensive';
  console.log('🔍 Running full comprehensive check for all sites...');
}

// Build the command
const scriptPath = path.join(__dirname, 'validate-environment-urls.js');
let command;

// If no arguments provided, run in interactive mode
if (!site && !env && !type) {
  console.log('🔍 Starting interactive link checker...\n');
  command = `node "${scriptPath}"`;
} else {
  // Build command with provided arguments
  command = `node "${scriptPath}"`;
  if (env) command += ` --env ${env}`;
  if (site) command += ` --site "${site}"`;
  if (type) command += ` --type ${type}`;
  
  console.log(`\n🔍 IFLA Standards Link Checker`);
  console.log(`${'='.repeat(50)}`);
  if (site) console.log(`📍 Site(s): ${site}`);
  if (env) console.log(`🌍 Environment: ${env}`);
  if (type) console.log(`🔎 Validation type: ${type}`);
  console.log(`${'='.repeat(50)}\n`);
}

// Show helpful tips for local environment (only if we have enough info)
if (env === 'local' && site && type) {
  console.log('💡 Tip: For local testing, make sure your dev servers are running:');
  if (site === 'all') {
    console.log('   pnpm start:all\n');
  } else if (!site.includes(',')) {
    console.log(`   pnpm start:${site.toLowerCase()}\n`);
  }
  
  // Only show build tip if using sitemap validation
  if (type === 'sitemap' || type === 'comprehensive' || type === 'both') {
    console.log('💡 Also ensure sites are built for sitemap validation:');
    if (site === 'all') {
      console.log('   pnpm build:all\n');
    } else if (!site.includes(',')) {
      console.log(`   pnpm build:${site.toLowerCase()}\n`);
    }
  }
}

// Execute the validation
try {
  execSync(command, { stdio: 'inherit' });
  
  console.log(`\n✨ Validation complete!`);
  console.log(`\n📊 View the reports:`);
  console.log(`   node output/link-validation/view-report.js`);
  console.log(`   Then open http://localhost:8080 in your browser\n`);
  
} catch (error) {
  // Error already shown by inherited stdio
  process.exit(1);
}