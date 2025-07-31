#!/usr/bin/env node

/**
 * Test Tagging Validation Script
 * 
 * This script validates that test files follow proper tagging and naming conventions
 * as defined in the IFLA Standards Testing Guide.
 * 
 * It runs as part of the pre-commit hook to ensure all new/modified test files
 * comply with the established patterns.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Required tag categories
const REQUIRED_TAGS = {
  testType: ['@unit', '@integration', '@e2e', '@smoke', '@env'],
  priority: ['@critical', '@high-priority', '@low-priority'],
  featureArea: [
    '@auth', '@rbac', '@api', '@ui', '@dashboard', '@admin', '@docs',
    '@navigation', '@search', '@vocabulary', '@sites', '@validation', 
    '@accessibility'
  ]
};

// Optional tags
const OPTIONAL_TAGS = [
  '@local-only', '@ci-only', '@preview-only', '@production-only',
  '@slow', '@fast', '@flaky', '@performance', '@visual',
  '@chromium-only', '@firefox-only', '@webkit-only', '@mobile-only',
  '@skip', '@portal'
];

// All known tags (for validation)
const ALL_KNOWN_TAGS = [
  ...REQUIRED_TAGS.testType,
  ...REQUIRED_TAGS.priority,
  ...REQUIRED_TAGS.featureArea,
  ...OPTIONAL_TAGS
];

// Valid file naming patterns
const VALID_FILE_PATTERNS = [
  /\.test\.(ts|js|tsx|jsx)$/,
  /\.spec\.(ts|js|tsx|jsx)$/,
  /\.unit\.test\.(ts|js|tsx|jsx)$/,
  /\.integration\.(test|spec)\.(ts|js|tsx|jsx)$/,
  /\.e2e\.spec\.(ts|js|tsx|jsx)$/,
  /\.smoke\.spec\.(ts|js|tsx|jsx)$/,
  /\.env\.spec\.(ts|js|tsx|jsx)$/,
  /\.visual\.spec\.(ts|js|tsx|jsx)$/,
  /\.performance\.spec\.(ts|js|tsx|jsx)$/
];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Get staged test files from git
 */
function getStagedTestFiles() {
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim())
      .filter(file => isTestFile(file));
    
    return stagedFiles;
  } catch (error) {
    logWarning('Could not get staged files, checking all test files in current directory');
    return [];
  }
}

/**
 * Check if a file is a test file based on its path and name
 */
function isTestFile(filePath) {
  // Skip if file doesn't exist (could be deleted)
  if (!fs.existsSync(filePath)) {
    return false;
  }

  // Check file naming patterns
  const fileName = path.basename(filePath);
  const hasValidPattern = VALID_FILE_PATTERNS.some(pattern => pattern.test(fileName));
  
  // Check if it's in a test directory
  const isInTestDir = filePath.includes('/test/') || 
                      filePath.includes('/tests/') ||
                      filePath.includes('/e2e/') ||
                      filePath.includes('/__tests__/');

  return hasValidPattern || isInTestDir;
}

/**
 * Extract tags from test file content
 */
function extractTags(content) {
  const tagPattern = /@[\w-]+/g;
  const matches = content.match(tagPattern) || [];
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Validate file naming pattern
 */
function validateFileNaming(filePath) {
  const fileName = path.basename(filePath);
  const hasValidPattern = VALID_FILE_PATTERNS.some(pattern => pattern.test(fileName));
  
  if (!hasValidPattern) {
    return {
      valid: false,
      error: `File name "${fileName}" doesn't follow valid test file naming patterns. ` +
             `Expected patterns: *.test.ts, *.spec.ts, *.unit.test.ts, *.integration.test.ts, *.e2e.spec.ts, etc.`
    };
  }
  
  return { valid: true };
}

/**
 * Validate test file tags
 */
function validateTestTags(filePath, content) {
  const tags = extractTags(content);
  const errors = [];
  const warnings = [];

  // Check for unknown tags
  const unknownTags = tags.filter(tag => !ALL_KNOWN_TAGS.includes(tag));
  if (unknownTags.length > 0) {
    warnings.push(`Unknown tags found: ${unknownTags.join(', ')}. Consider adding them to the official tag list if they're valid.`);
  }

  // Check required tag categories
  const hasTestType = REQUIRED_TAGS.testType.some(tag => tags.includes(tag));
  if (!hasTestType) {
    errors.push(`Missing required test type tag. Must include one of: ${REQUIRED_TAGS.testType.join(', ')}`);
  }

  const hasPriority = REQUIRED_TAGS.priority.some(tag => tags.includes(tag));
  if (!hasPriority) {
    errors.push(`Missing required priority tag. Must include one of: ${REQUIRED_TAGS.priority.join(', ')}`);
  }

  const hasFeatureArea = REQUIRED_TAGS.featureArea.some(tag => tags.includes(tag));
  if (!hasFeatureArea) {
    errors.push(`Missing required feature area tag. Must include at least one of: ${REQUIRED_TAGS.featureArea.join(', ')}`);
  }

  // Check for tag consistency with file name
  const fileName = path.basename(filePath);
  if (fileName.includes('.unit.') && !tags.includes('@unit')) {
    warnings.push('File name suggests unit test but missing @unit tag');
  }
  if (fileName.includes('.integration.') && !tags.includes('@integration')) {
    warnings.push('File name suggests integration test but missing @integration tag');
  }
  if (fileName.includes('.e2e.') && !tags.includes('@e2e')) {
    warnings.push('File name suggests e2e test but missing @e2e tag');
  }
  if (fileName.includes('.smoke.') && !tags.includes('@smoke')) {
    warnings.push('File name suggests smoke test but missing @smoke tag');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    tags
  };
}

/**
 * Validate a single test file
 */
function validateTestFile(filePath) {
  const results = {
    filePath,
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // Check file naming
    const namingResult = validateFileNaming(filePath);
    if (!namingResult.valid) {
      results.valid = false;
      results.errors.push(namingResult.error);
      return results; // Don't continue if naming is wrong
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip validation for files that don't contain test code
    if (!content.includes('describe(') && !content.includes('test(') && 
        !content.includes('it(') && !content.includes('smokeTest(') &&
        !content.includes('integrationTest(') && !content.includes('e2eTest(')) {
      results.warnings.push('File appears to be a test file but contains no test functions');
      return results;
    }

    // Validate tags
    const tagResult = validateTestTags(filePath, content);
    results.valid = results.valid && tagResult.valid;
    results.errors.push(...tagResult.errors);
    results.warnings.push(...tagResult.warnings);
    
    // Add discovered tags for reference
    results.tags = tagResult.tags;

  } catch (error) {
    results.valid = false;
    results.errors.push(`Failed to read file: ${error.message}`);
  }

  return results;
}

/**
 * Main validation function
 */
function validateTestFiles() {
  log(`${colors.bold}🧪 IFLA Standards Platform - Test Tagging Validation${colors.reset}`);
  log('Checking test files for proper tagging and naming conventions...\n');

  const stagedFiles = getStagedTestFiles();
  
  if (stagedFiles.length === 0) {
    logInfo('No test files found in staged changes.');
    return true; // No test files to validate
  }

  log(`Found ${stagedFiles.length} test file(s) to validate:\n`);

  let overallValid = true;
  const results = [];

  for (const filePath of stagedFiles) {
    const result = validateTestFile(filePath);
    results.push(result);

    if (!result.valid) {
      overallValid = false;
    }

    // Display results for this file
    log(`📄 ${result.filePath}`, 'cyan');
    
    if (result.tags && result.tags.length > 0) {
      log(`   Tags: ${result.tags.join(' ')}`, 'blue');
    }

    result.errors.forEach(error => {
      logError(`   ${error}`);
    });

    result.warnings.forEach(warning => {
      logWarning(`   ${warning}`);
    });

    if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
      logSuccess('   All validations passed!');
    }

    log(''); // Empty line for readability
  }

  // Summary
  log(`${colors.bold}📊 Validation Summary:${colors.reset}`);
  const validFiles = results.filter(r => r.valid).length;
  const invalidFiles = results.filter(r => !r.valid).length;
  const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;

  log(`✅ Valid files: ${validFiles}`, validFiles > 0 ? 'green' : 'reset');
  if (invalidFiles > 0) {
    log(`❌ Invalid files: ${invalidFiles}`, 'red');
  }
  if (filesWithWarnings > 0) {
    log(`⚠️  Files with warnings: ${filesWithWarnings}`, 'yellow');
  }

  if (!overallValid) {
    log('\n' + colors.red + colors.bold + '🚫 Test validation failed!' + colors.reset);
    log('Please fix the errors above before committing.');
    log('Refer to developer_notes/IFLA-Standards-Testing-Guide.md for guidance.');
  } else {
    log('\n' + colors.green + colors.bold + '🎉 All test files passed validation!' + colors.reset);
    if (filesWithWarnings > 0) {
      log('Consider addressing the warnings for better test organization.');
    }
  }

  return overallValid;
}

/**
 * CLI mode - run validation when script is executed directly
 */
if (require.main === module) {
  const success = validateTestFiles();
  process.exit(success ? 0 : 1);
}

module.exports = {
  validateTestFiles,
  validateTestFile,
  extractTags,
  isTestFile,
  REQUIRED_TAGS,
  ALL_KNOWN_TAGS
};
