#!/usr/bin/env node

/**
 * IFLA Standards Platform - Quarterly Testing Infrastructure Audit
 * 
 * This comprehensive audit script analyzes the current state of the testing
 * infrastructure and provides actionable recommendations for keeping the
 * testing guide synchronized with evolving practices.
 * 
 * Schedule: Run quarterly (every 3 months)
 * Purpose: Ensure testing guide remains current and effective
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test directories to analyze
const TEST_DIRECTORIES = [
  'apps/admin/src/test',
  'apps/admin/src/__tests__',
  'e2e',
  'packages/theme/src/tests',
  'packages/dev-servers/src',
  'scripts',
  'examples/tests',
  'tools'
];

// Expected tags from the current guide
const EXPECTED_TAGS = {
  testType: ['@unit', '@integration', '@e2e', '@smoke', '@env'],
  priority: ['@critical', '@high-priority', '@low-priority'],
  featureArea: [
    '@auth', '@rbac', '@api', '@ui', '@dashboard', '@admin', '@docs',
    '@navigation', '@search', '@vocabulary', '@sites', '@validation', 
    '@accessibility'
  ],
  optional: [
    '@local-only', '@ci-only', '@preview-only', '@production-only',
    '@slow', '@fast', '@flaky', '@performance', '@visual',
    '@chromium-only', '@firefox-only', '@webkit-only', '@mobile-only',
    '@skip', '@portal'
  ]
};

class TestingAudit {
  constructor() {
    this.auditResults = {
      totalFiles: 0,
      filesByType: {},
      tagUsage: {},
      newTags: [],
      missingTags: [],
      namingPatterns: {},
      coverage: {},
      recommendations: []
    };
  }

  /**
   * Recursively find all test files
   */
  findTestFiles(dir, files = []) {
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!item.startsWith('.') && item !== 'node_modules') {
          this.findTestFiles(fullPath, files);
        }
      } else if (this.isTestFile(fullPath)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Check if a file is a test file
   */
  isTestFile(filePath) {
    const fileName = path.basename(filePath);
    const testPatterns = [
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
    
    return testPatterns.some(pattern => pattern.test(fileName)) ||
           filePath.includes('/__tests__/') ||
           filePath.includes('/test/') ||
           filePath.includes('/e2e/');
  }

  /**
   * Extract tags from file content
   */
  extractTags(content) {
    const tagPattern = /@[\\w-]+/g;
    const matches = content.match(tagPattern) || [];
    return [...new Set(matches)];
  }

  /**
   * Analyze a single test file
   */
  analyzeTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tags = this.extractTags(content);
      const fileName = path.basename(filePath);
      
      // Count file types
      const fileType = this.categorizeFileType(fileName);
      this.auditResults.filesByType[fileType] = (this.auditResults.filesByType[fileType] || 0) + 1;
      
      // Count tag usage
      tags.forEach(tag => {
        this.auditResults.tagUsage[tag] = (this.auditResults.tagUsage[tag] || 0) + 1;
      });
      
      // Check for new tags not in expected list
      const allExpectedTags = [
        ...EXPECTED_TAGS.testType,
        ...EXPECTED_TAGS.priority,
        ...EXPECTED_TAGS.featureArea,
        ...EXPECTED_TAGS.optional
      ];
      
      tags.forEach(tag => {
        if (!allExpectedTags.includes(tag) && !this.auditResults.newTags.includes(tag)) {
          this.auditResults.newTags.push(tag);
        }
      });
      
      return {
        filePath,
        tags,
        fileType,
        hasTestCode: this.hasTestCode(content),
        lineCount: content.split('\\n').length
      };
      
    } catch (error) {
      log(`Error analyzing ${filePath}: ${error.message}`, 'red');
      return null;
    }
  }

  /**
   * Check if file contains actual test code
   */
  hasTestCode(content) {
    const testIndicators = [
      'describe(',
      'test(',
      'it(',
      'smokeTest(',
      'integrationTest(',
      'e2eTest(',
      'expect('
    ];
    
    return testIndicators.some(indicator => content.includes(indicator));
  }

  /**
   * Categorize file type based on naming pattern
   */
  categorizeFileType(fileName) {
    if (fileName.includes('.unit.test.')) return 'unit';
    if (fileName.includes('.integration.')) return 'integration';
    if (fileName.includes('.e2e.spec.')) return 'e2e';
    if (fileName.includes('.smoke.spec.')) return 'smoke';
    if (fileName.includes('.env.spec.')) return 'env';
    if (fileName.includes('.visual.spec.')) return 'visual';
    if (fileName.includes('.performance.spec.')) return 'performance';
    if (fileName.includes('.test.')) return 'test';
    if (fileName.includes('.spec.')) return 'spec';
    return 'other';
  }

  /**
   * Analyze test execution patterns
   */
  analyzeTestExecution() {
    try {
      // Get test command statistics from package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const testScripts = Object.keys(packageJson.scripts || {})
        .filter(key => key.startsWith('test'));
      
      log(`\\n📊 Test Script Analysis:`, 'blue');
      log(`Total test scripts in package.json: ${testScripts.length}`, 'cyan');
      
      // Analyze script patterns
      const scriptPatterns = {};
      testScripts.forEach(script => {
        const parts = script.split(':');
        const category = parts.length > 1 ? parts[1] : 'general';
        scriptPatterns[category] = (scriptPatterns[category] || 0) + 1;
      });
      
      console.table(scriptPatterns);
      
    } catch (error) {
      log(`Error analyzing test execution: ${error.message}`, 'yellow');
    }
  }

  /**
   * Check test infrastructure health
   */
  checkInfrastructureHealth() {
    const healthChecks = [];
    
    // Check for required configuration files
    const requiredFiles = [
      'vitest.config.ts',
      'playwright.config.ts',
      '.husky/pre-commit',
      'e2e/utils/tagged-test.ts',
      'e2e/utils/test-tags.ts'
    ];
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        healthChecks.push({ file, status: '✅', note: 'Present' });
      } else {
        healthChecks.push({ file, status: '❌', note: 'Missing' });
      }
    });
    
    log(`\\n🏥 Infrastructure Health Check:`, 'blue');
    console.table(healthChecks);
  }

  /**
   * Generate recommendations based on audit findings
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check for new tags that should be documented
    if (this.auditResults.newTags.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Documentation',
        issue: `Found ${this.auditResults.newTags.length} new tags not in the official guide`,
        tags: this.auditResults.newTags.join(', '),
        action: 'Review and add valid tags to IFLA-Standards-Testing-Guide.md'
      });
    }
    
    // Check for underused required tags
    const requiredTags = [...EXPECTED_TAGS.testType, ...EXPECTED_TAGS.priority];
    const underusedTags = requiredTags.filter(tag => 
      !this.auditResults.tagUsage[tag] || this.auditResults.tagUsage[tag] < 3
    );
    
    if (underusedTags.length > 0) {
      recommendations.push({
        priority: 'Medium',
        category: 'Tag Usage',
        issue: `Required tags with low usage: ${underusedTags.join(', ')}`,
        action: 'Verify if these tags are still needed or if tests are missing proper tagging'
      });
    }
    
    // Check file type distribution
    const totalFiles = this.auditResults.totalFiles;
    const unitPercentage = (this.auditResults.filesByType.unit || 0) / totalFiles * 100;
    
    if (unitPercentage < 60) {
      recommendations.push({
        priority: 'Medium',
        category: 'Test Distribution',
        issue: `Unit tests represent only ${unitPercentage.toFixed(1)}% of total tests`,
        action: 'Consider increasing unit test coverage for better development feedback'
      });
    }
    
    // Check for files without proper test indicators
    const filesWithoutTests = Object.values(this.auditResults.filesByType).reduce((a, b) => a + b, 0) - 
                              this.auditResults.totalFiles;
    
    if (filesWithoutTests > 0) {
      recommendations.push({
        priority: 'Low',
        category: 'File Organization',
        issue: `${filesWithoutTests} test files don't contain recognizable test code`,
        action: 'Review and clean up or properly categorize these files'
      });
    }
    
    this.auditResults.recommendations = recommendations;
  }

  /**
   * Run the complete audit
   */
  async runAudit() {
    log(`${colors.bold}🔍 IFLA Standards Platform - Quarterly Testing Audit${colors.reset}`);
    log(`Started: ${new Date().toISOString()}\\n`);
    
    // Find all test files
    let allTestFiles = [];
    TEST_DIRECTORIES.forEach(dir => {
      const files = this.findTestFiles(dir);
      allTestFiles = allTestFiles.concat(files);
    });
    
    this.auditResults.totalFiles = allTestFiles.length;
    log(`Found ${allTestFiles.length} test files to analyze\\n`, 'cyan');
    
    // Analyze each file
    const analysisResults = [];
    for (const filePath of allTestFiles) {
      const result = this.analyzeTestFile(filePath);
      if (result) {
        analysisResults.push(result);
      }
    }
    
    // Generate summary reports
    this.printTagUsageSummary();
    this.printFileTypeSummary();
    this.analyzeTestExecution();
    this.checkInfrastructureHealth();
    this.generateRecommendations();
    this.printRecommendations();
    
    // Save detailed results
    this.saveAuditResults();
    
    log(`\\n${colors.green}${colors.bold}🎉 Quarterly audit completed successfully!${colors.reset}`);
    log(`Results saved to: audit-results-${new Date().toISOString().split('T')[0]}.json`);
  }

  /**
   * Print tag usage summary
   */
  printTagUsageSummary() {
    log(`\\n🏷️  Tag Usage Summary:`, 'blue');
    
    // Sort tags by usage
    const sortedTags = Object.entries(this.auditResults.tagUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15); // Top 15 most used tags
    
    console.table(sortedTags.map(([tag, count]) => ({ tag, count })));
    
    if (this.auditResults.newTags.length > 0) {
      log(`\\n🆕 New tags discovered: ${this.auditResults.newTags.join(', ')}`, 'yellow');
    }
  }

  /**
   * Print file type summary
   */
  printFileTypeSummary() {
    log(`\\n📁 File Type Distribution:`, 'blue');
    console.table(this.auditResults.filesByType);
  }

  /**
   * Print recommendations
   */
  printRecommendations() {
    log(`\\n💡 Recommendations for Testing Guide Updates:`, 'magenta');
    
    if (this.auditResults.recommendations.length === 0) {
      log('No recommendations - testing infrastructure is well-maintained! 🎉', 'green');
      return;
    }
    
    this.auditResults.recommendations.forEach((rec, index) => {
      log(`\\n${index + 1}. [${rec.priority}] ${rec.category}:`, 'yellow');
      log(`   Issue: ${rec.issue}`);
      log(`   Action: ${rec.action}`, 'cyan');
      if (rec.tags) {
        log(`   Tags: ${rec.tags}`, 'blue');
      }
    });
  }

  /**
   * Save audit results to file
   */
  saveAuditResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `output/audit-results-${timestamp}.json`;
    
    // Ensure output directory exists
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output', { recursive: true });
    }
    
    const auditReport = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        totalFiles: this.auditResults.totalFiles
      },
      ...this.auditResults
    };
    
    fs.writeFileSync(fileName, JSON.stringify(auditReport, null, 2));
    log(`\\n💾 Audit results saved to: ${fileName}`, 'green');
  }
}

/**
 * CLI execution
 */
if (require.main === module) {
  const audit = new TestingAudit();
  audit.runAudit().catch(error => {
    log(`Audit failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = TestingAudit;
