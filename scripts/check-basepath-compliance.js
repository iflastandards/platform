#!/usr/bin/env node

/**
 * BasePath Compliance Checker
 * 
 * Checks for violations against CLAUDE.md basePath rules in the admin app.
 * This script is designed to fail CI/CD if new violations are introduced.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ADMIN_SRC_PATH = 'apps/admin/src';
const EXIT_ON_VIOLATIONS = process.env.CI === 'true' || process.argv.includes('--strict');

// Violation patterns to check
const VIOLATION_PATTERNS = [
  {
    name: 'API calls missing addBasePath',
    pattern: /fetch\s*\(\s*['"`]\/api/g,
    description: 'Use fetch(addBasePath(\'/api/...\')) for API calls',
    severity: 'error',
    exclude: ['test', 'spec', '__tests__'] // Exclude test files (lower priority)
  },
  {
    name: 'Hardcoded /admin paths',
    pattern: /['"`]\/admin\//g,
    description: 'Never hardcode /admin - Next.js adds basePath automatically',
    severity: 'error',
    exclude: []
  },
  {
    name: 'Static assets missing addBasePath',
    pattern: /(?:src)\s*=\s*['"`]\/[^\/]/g,
    description: 'Use addBasePath(\'/asset.png\') for static assets',
    severity: 'warning',
    exclude: ['test', 'spec', '__tests__']
  },
  {
    name: 'Link href hardcoded paths',
    pattern: /href\s*=\s*['"`]\/admin/g,
    description: 'Use relative paths in Link components - Next.js adds basePath',
    severity: 'error',
    exclude: []
  }
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Get all TypeScript/JavaScript files in the admin src directory
 */
function getSourceFiles() {
  try {
    const output = execSync(`find ${ADMIN_SRC_PATH} -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) 2>/dev/null || true`, 
      { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error(`Error finding source files: ${error.message}`);
    return [];
  }
}

/**
 * Check if file should be excluded based on pattern exclusions
 */
function shouldExcludeFile(filePath, excludePatterns) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

/**
 * Check a single file for violations
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    for (const { name, pattern, description, severity, exclude } of VIOLATION_PATTERNS) {
      if (shouldExcludeFile(filePath, exclude)) {
        continue;
      }

      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          // Check if addBasePath is already used in the line (avoid false positives)
          if (name.includes('addBasePath') && line.includes('addBasePath')) {
            continue;
          }

          violations.push({
            file: filePath,
            line: index + 1,
            column: match.index + 1,
            rule: name,
            description,
            severity,
            code: line.trim(),
            match: match[0]
          });
        }
      });
    }

    return violations;
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Format and display violations
 */
function displayViolations(violations) {
  if (violations.length === 0) {
    console.log(`${colors.green}✓ No basePath violations found!${colors.reset}`);
    return;
  }

  console.log(`${colors.bold}BasePath Compliance Violations Found:${colors.reset}\n`);

  const groupedViolations = violations.reduce((acc, violation) => {
    if (!acc[violation.rule]) {
      acc[violation.rule] = [];
    }
    acc[violation.rule].push(violation);
    return acc;
  }, {});

  let errorCount = 0;
  let warningCount = 0;

  for (const [rule, ruleViolations] of Object.entries(groupedViolations)) {
    const firstViolation = ruleViolations[0];
    const color = firstViolation.severity === 'error' ? colors.red : colors.yellow;
    const icon = firstViolation.severity === 'error' ? '✗' : '⚠';
    
    console.log(`${color}${icon} ${rule} (${ruleViolations.length} violations)${colors.reset}`);
    console.log(`   ${firstViolation.description}\n`);

    ruleViolations.forEach(violation => {
      if (violation.severity === 'error') errorCount++;
      else warningCount++;

      console.log(`   ${violation.file}:${violation.line}:${violation.column}`);
      console.log(`   ${colors.blue}${violation.code}${colors.reset}`);
      console.log(`   ${colors.yellow}Found: ${violation.match}${colors.reset}\n`);
    });
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  if (errorCount > 0) {
    console.log(`${colors.red}  ${errorCount} error${errorCount > 1 ? 's' : ''}${colors.reset}`);
  }
  if (warningCount > 0) {
    console.log(`${colors.yellow}  ${warningCount} warning${warningCount > 1 ? 's' : ''}${colors.reset}`);
  }
  console.log(`  ${violations.length} total violations\n`);

  // Guidance
  console.log(`${colors.bold}Fix Guidance:${colors.reset}`);
  console.log(`1. Import addBasePath: ${colors.blue}import { addBasePath } from '@ifla/theme/utils';${colors.reset}`);
  console.log(`2. Wrap API calls: ${colors.blue}fetch(addBasePath('/api/...'))${colors.reset}`);
  console.log(`3. Use relative paths in Links: ${colors.blue}<Link href="/dashboard">${colors.reset}`);
  console.log(`4. Wrap static assets: ${colors.blue}src={addBasePath('/favicon.ico')}${colors.reset}`);
  console.log(`\nSee CLAUDE.md for complete basePath rules.`);
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bold}Checking basePath compliance in ${ADMIN_SRC_PATH}...${colors.reset}\n`);

  const sourceFiles = getSourceFiles();
  if (sourceFiles.length === 0) {
    console.log(`${colors.yellow}No source files found in ${ADMIN_SRC_PATH}${colors.reset}`);
    return;
  }

  console.log(`Scanning ${sourceFiles.length} files...`);

  let allViolations = [];
  for (const file of sourceFiles) {
    const violations = checkFile(file);
    allViolations = allViolations.concat(violations);
  }

  displayViolations(allViolations);

  // Exit with error code if violations found and in strict mode
  const errorViolations = allViolations.filter(v => v.severity === 'error');
  if (errorViolations.length > 0 && EXIT_ON_VIOLATIONS) {
    console.log(`${colors.red}${colors.bold}FAIL: ${errorViolations.length} error-level basePath violations found${colors.reset}`);
    process.exit(1);
  }

  if (allViolations.length === 0) {
    console.log(`${colors.green}${colors.bold}PASS: All basePath compliance checks passed${colors.reset}`);
  }
}

// Run the checker
if (require.main === module) {
  main();
}

module.exports = { checkFile, VIOLATION_PATTERNS };
