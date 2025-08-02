#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const siteIndex = args.findIndex(arg => arg === '--site');
const envIndex = args.findIndex(arg => arg === '--env');
const strictMode = args.includes('--strict');

const site = siteIndex !== -1 ? args[siteIndex + 1] : null;
const env = envIndex !== -1 ? args[envIndex + 1] : 'preview';

if (!site) {
  console.error('❌ Please specify a site with --site <sitename>');
  process.exit(1);
}

console.log(`🔍 Validating Docusaurus config for ${site} (${env} environment)...`);

// Environment-specific configurations
const ENV_CONFIGS = {
  preview: {
    portal: { baseUrl: '/platform/', url: 'https://iflastandards.github.io' },
    default: { baseUrl: '/platform/{site}/', url: 'https://iflastandards.github.io' }
  },
  production: {
    portal: { baseUrl: '/', url: 'https://www.iflastandards.info' },
    default: { baseUrl: '/{site}/', url: 'https://www.iflastandards.info' }
  }
};

// Determine config file path
const configPaths = [
  path.join(process.cwd(), 'portal', 'docusaurus.config.ts'),
  path.join(process.cwd(), 'portal', 'docusaurus.config.js'),
  path.join(process.cwd(), 'standards', site, 'docusaurus.config.ts'),
  path.join(process.cwd(), 'standards', site, 'docusaurus.config.js')
];

const configPath = configPaths.find(p => fs.existsSync(p));

if (!configPath) {
  console.error(`❌ Could not find docusaurus.config file for ${site}`);
  process.exit(1);
}

console.log(`📄 Found config: ${path.relative(process.cwd(), configPath)}`);

// Read config file
const configContent = fs.readFileSync(configPath, 'utf8');

// Get expected values
const isPortal = site.toLowerCase() === 'portal';
const expected = isPortal 
  ? ENV_CONFIGS[env].portal 
  : { 
      ...ENV_CONFIGS[env].default,
      baseUrl: ENV_CONFIGS[env].default.baseUrl.replace('{site}', site)
    };

console.log(`📋 Expected configuration:`);
console.log(`   URL: ${expected.url}`);
console.log(`   Base URL: ${expected.baseUrl}`);

// Check URL configuration
const urlMatches = configContent.match(/url:\s*['"`]([^'"`]+)['"`]/);
const baseUrlMatches = configContent.match(/baseUrl:\s*['"`]([^'"`]+)['"`]/);

let errors = 0;
let warnings = 0;

if (urlMatches) {
  const actualUrl = urlMatches[1];
  if (actualUrl !== expected.url) {
    if (strictMode) {
      console.error(`❌ URL mismatch: expected "${expected.url}", found "${actualUrl}"`);
      errors++;
    } else {
      console.warn(`⚠️  URL mismatch: expected "${expected.url}", found "${actualUrl}"`);
      warnings++;
    }
  } else {
    console.log(`✅ URL correct: ${actualUrl}`);
  }
} else {
  console.error(`❌ URL configuration not found`);
  errors++;
}

if (baseUrlMatches) {
  const actualBaseUrl = baseUrlMatches[1];
  if (actualBaseUrl !== expected.baseUrl) {
    console.error(`❌ Base URL mismatch: expected "${expected.baseUrl}", found "${actualBaseUrl}"`);
    errors++;
  } else {
    console.log(`✅ Base URL correct: ${actualBaseUrl}`);
  }
} else {
  console.error(`❌ Base URL configuration not found`);
  errors++;
}

// Check for environment-specific overrides
if (configContent.includes('process.env.DOCS_ENV')) {
  console.log(`✅ Environment-aware configuration detected`);
} else if (env === 'production' && !strictMode) {
  console.warn(`⚠️  No environment-specific configuration found`);
  warnings++;
}

// Check trailing slashes configuration
if (configContent.includes('trailingSlash:')) {
  const trailingSlashMatch = configContent.match(/trailingSlash:\s*(true|false)/);
  if (trailingSlashMatch) {
    console.log(`ℹ️  Trailing slash setting: ${trailingSlashMatch[1]}`);
  }
} else {
  console.warn(`⚠️  No explicit trailing slash configuration`);
  warnings++;
}

// Check for common misconfigurations
const commonIssues = [
  {
    pattern: /baseUrl:\s*['"`]\/platform\/[^/]+\/['"`]/,
    message: 'Double platform prefix detected'
  },
  {
    pattern: /url:\s*['"`]https?:\/\/localhost/,
    message: 'Localhost URL in production config'
  },
  {
    pattern: /baseUrl:\s*['"`]\/admin/,
    message: 'Admin baseUrl in Docusaurus config'
  }
];

for (const issue of commonIssues) {
  if (issue.pattern.test(configContent)) {
    console.error(`❌ ${issue.message}`);
    errors++;
  }
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`   Site: ${site}`);
console.log(`   Environment: ${env}`);
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors > 0) {
  console.error('\n❌ Validation failed!');
  
  // Provide fix suggestions
  console.log('\n💡 To fix:');
  console.log(`1. Edit ${path.relative(process.cwd(), configPath)}`);
  console.log(`2. Set url: '${expected.url}'`);
  console.log(`3. Set baseUrl: '${expected.baseUrl}'`);
  
  process.exit(1);
} else if (warnings > 0 && strictMode) {
  console.error('\n❌ Validation failed in strict mode due to warnings');
  process.exit(1);
} else {
  console.log('\n✅ Validation passed!');
}