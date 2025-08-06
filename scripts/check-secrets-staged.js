#!/usr/bin/env node

/**
 * Check secrets in staged files only
 * This script gets the list of staged files and runs secretlint on them
 */

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Get list of staged files
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf8'
  }).trim();

  if (!stagedFiles) {
    console.log('No staged files to check for secrets.');
    process.exit(0);
  }

  const files = stagedFiles.split('\n').filter(file => {
    // Filter out files that shouldn't be checked for secrets
    const skipPatterns = [
      /node_modules\//,
      /\.git\//,
      /dist\//,
      /build\//,
      /\.docusaurus\//,
      /coverage\//,
      /\.min\.js$/,
      /pnpm-lock\.yaml$/,
      /\.nx\//,
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/,
      /\/tests?\//,
      /\/e2e\//,
      /\/fixtures\//,
      /\/examples\//,
      /\.env\.example$/,
      /\.env\.template$/,
      /\.md\.template$/,
      /developer_notes\//,
      /docs\/.*\.md$/,
      /README\.md$/,
      /CHANGELOG\.md$/
    ];

    return !skipPatterns.some(pattern => pattern.test(file)) && fs.existsSync(file);
  });

  if (files.length === 0) {
    console.log('No relevant staged files to check for secrets.');
    process.exit(0);
  }

  console.log(`Checking ${files.length} staged file(s) for secrets...`);
  
  // Run secretlint on the filtered staged files
  execSync(`npx secretlint ${files.map(f => `"${f}"`).join(' ')}`, {
    stdio: 'inherit',
    encoding: 'utf8'
  });

  console.log('✅ No secrets detected in staged files.');
  process.exit(0);

} catch (error) {
  if (error.status === 1) {
    // secretlint found secrets
    console.log('\n❌ Secrets detected in staged files!');
    console.log('Please remove sensitive information before committing.');
    console.log('You can use: pnpm check:secrets:fix to attempt automatic fixes.');
  } else {
    // Other error
    console.error('Error checking secrets:', error.message);
  }
  process.exit(1);
}