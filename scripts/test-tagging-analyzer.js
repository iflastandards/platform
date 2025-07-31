#!/usr/bin/env node

/**
 * Test Tagging Analyzer - Task 1.2
 * Scans all test files and identifies missing required tags
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required category tags
const REQUIRED_CATEGORY_TAGS = ['@unit', '@integration', '@e2e', '@smoke'];

// Expected functional tags by file pattern
const FUNCTIONAL_TAG_PATTERNS = {
  'rbac': ['@rbac', '@security'],
  'auth': ['@authentication', '@security'],
  'api': ['@api'],
  'validation': ['@validation'],
  'import': ['@api', '@validation'],
  'vocabulary': ['@api', '@validation'],
  'deployment': ['@deployment'],
  'navigation': ['@navigation'],
  'dashboard': ['@navigation'],
  'port-manager': ['@utility'],
};

// Priority tag expectations
const CRITICAL_FILE_PATTERNS = [
  'smoke',
  'auth',
  'rbac',
  'api-health',
  'build-validation',
  'dashboard',
];

class TestTaggingAnalyzer {
  constructor() {
    this.results = {
      total: 0,
      wellTagged: 0,
      missingCategoryTags: [],
      missingFunctionalTags: [],
      missingPriorityTags: [],
      summary: {}
    };
  }

  async analyzeAllTests() {
    console.log('🔍 Analyzing test file tagging...\n');

    // Get all test files
    const testFiles = this.findAllTestFiles();
    this.results.total = testFiles.length;

    console.log(`Found ${testFiles.length} test files to analyze\n`);

    // Analyze each file
    for (const file of testFiles) {
      await this.analyzeFile(file);
    }

    this.generateSummary();
    this.printResults();
    this.generateUpdatePlan();
  }

  findAllTestFiles() {
    try {
      const findCommand = `find . -type f \\( -name "*.test.ts" -o -name "*.test.js" -o -name "*.spec.ts" -o -name "*.spec.js" \\) | grep -v node_modules | sort`;
      const output = execSync(findCommand, { encoding: 'utf8' });
      return output.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('Error finding test files:', error.message);
      return [];
    }
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = this.analyzeFileContent(filePath, content);
      
      if (analysis.isWellTagged) {
        this.results.wellTagged++;
      }

      // Track missing tags
      if (analysis.missingCategoryTag) {
        this.results.missingCategoryTags.push({
          file: filePath,
          suggestedTag: analysis.suggestedCategoryTag,
          reason: analysis.categoryReason
        });
      }

      if (analysis.missingFunctionalTags.length > 0) {
        this.results.missingFunctionalTags.push({
          file: filePath,
          missing: analysis.missingFunctionalTags
        });
      }

      if (analysis.missingPriorityTag) {
        this.results.missingPriorityTags.push({
          file: filePath,
          suggestedTag: '@critical',
          reason: analysis.priorityReason
        });
      }

    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  analyzeFileContent(filePath, content) {
    const fileName = path.basename(filePath).toLowerCase();
    const analysis = {
      isWellTagged: false,
      missingCategoryTag: false,
      suggestedCategoryTag: null,
      categoryReason: '',
      missingFunctionalTags: [],
      missingPriorityTag: false,
      priorityReason: ''
    };

    // Check for category tags
    const hasCategoryTag = REQUIRED_CATEGORY_TAGS.some(tag => content.includes(tag));
    
    if (!hasCategoryTag) {
      analysis.missingCategoryTag = true;
      analysis.suggestedCategoryTag = this.suggestCategoryTag(filePath, content);
      analysis.categoryReason = this.getCategoryReason(filePath, content);
    }

    // Check for functional tags
    const expectedFunctionalTags = this.getExpectedFunctionalTags(filePath);
    analysis.missingFunctionalTags = expectedFunctionalTags.filter(tag => !content.includes(tag));

    // Check for priority tags (critical files)
    const shouldHavePriorityTag = CRITICAL_FILE_PATTERNS.some(pattern => fileName.includes(pattern));
    if (shouldHavePriorityTag && !content.includes('@critical')) {
      analysis.missingPriorityTag = true;
      analysis.priorityReason = `File matches critical pattern: ${CRITICAL_FILE_PATTERNS.find(p => fileName.includes(p))}`;
    }

    // Determine if well-tagged
    analysis.isWellTagged = !analysis.missingCategoryTag && 
                          analysis.missingFunctionalTags.length === 0 && 
                          !analysis.missingPriorityTag;

    return analysis;
  }

  suggestCategoryTag(filePath, content) {
    const fileName = path.basename(filePath).toLowerCase();
    
    // Check file naming patterns
    if (fileName.includes('.e2e.') || fileName.includes('/e2e/')) {
      return '@e2e';
    }
    if (fileName.includes('.smoke.') || fileName.includes('/smoke/')) {
      return '@smoke';
    }
    if (fileName.includes('.integration.') || fileName.includes('/integration/')) {
      return '@integration';
    }
    if (fileName.includes('.unit.') || filePath.includes('/__tests__/') || fileName.includes('.test.')) {
      return '@unit';
    }

    // Check content patterns
    if (content.includes('smokeTest') || content.includes('@smoke')) {
      return '@smoke';
    }
    if (content.includes('e2eTest') || content.includes('({ page })')) {
      return '@e2e';
    }
    if (content.includes('integrationTest') || content.includes('mockFetch')) {
      return '@integration';
    }

    // Default to unit if unclear
    return '@unit';
  }

  getCategoryReason(filePath, content) {
    const suggested = this.suggestCategoryTag(filePath, content);
    const fileName = path.basename(filePath);
    
    if (suggested === '@e2e') {
      return `File path or content suggests E2E testing (${fileName})`;
    }
    if (suggested === '@smoke') {
      return `File path or content suggests smoke testing (${fileName})`;
    }
    if (suggested === '@integration') {
      return `File path or content suggests integration testing (${fileName})`;
    }
    return `Default unit test categorization (${fileName})`;
  }

  getExpectedFunctionalTags(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const tags = [];

    for (const [pattern, expectedTags] of Object.entries(FUNCTIONAL_TAG_PATTERNS)) {
      if (fileName.includes(pattern) || filePath.includes(pattern)) {
        tags.push(...expectedTags);
      }
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  generateSummary() {
    this.results.summary = {
      categoryTagsCoverage: ((this.results.total - this.results.missingCategoryTags.length) / this.results.total * 100).toFixed(1),
      functionalTagsCoverage: ((this.results.total - this.results.missingFunctionalTags.length) / this.results.total * 100).toFixed(1),
      priorityTagsCoverage: ((this.results.total - this.results.missingPriorityTags.length) / this.results.total * 100).toFixed(1),
      overallWellTagged: (this.results.wellTagged / this.results.total * 100).toFixed(1)
    };
  }

  printResults() {
    console.log('📊 TEST TAGGING ANALYSIS RESULTS');
    console.log('================================\n');

    console.log(`📁 Total test files analyzed: ${this.results.total}`);
    console.log(`✅ Well-tagged files: ${this.results.wellTagged} (${this.results.summary.overallWellTagged}%)`);
    console.log(`❌ Files needing updates: ${this.results.total - this.results.wellTagged}\n`);

    console.log('📋 COVERAGE BREAKDOWN:');
    console.log(`   Category tags: ${this.results.summary.categoryTagsCoverage}%`);
    console.log(`   Functional tags: ${this.results.summary.functionalTagsCoverage}%`);
    console.log(`   Priority tags: ${this.results.summary.priorityTagsCoverage}%\n`);

    if (this.results.missingCategoryTags.length > 0) {
      console.log('🚨 FILES MISSING CATEGORY TAGS:');
      this.results.missingCategoryTags.forEach(item => {
        console.log(`   ${item.file}`);
        console.log(`      → Suggested: ${item.suggestedTag} (${item.reason})`);
      });
      console.log();
    }

    if (this.results.missingFunctionalTags.length > 0) {
      console.log('🔧 FILES MISSING FUNCTIONAL TAGS:');
      this.results.missingFunctionalTags.slice(0, 10).forEach(item => {
        console.log(`   ${item.file}`);
        console.log(`      → Missing: ${item.missing.join(', ')}`);
      });
      if (this.results.missingFunctionalTags.length > 10) {
        console.log(`   ... and ${this.results.missingFunctionalTags.length - 10} more files`);
      }
      console.log();
    }

    if (this.results.missingPriorityTags.length > 0) {
      console.log('⚡ FILES MISSING PRIORITY TAGS:');
      this.results.missingPriorityTags.forEach(item => {
        console.log(`   ${item.file}`);
        console.log(`      → Suggested: ${item.suggestedTag} (${item.reason})`);
      });
      console.log();
    }
  }

  generateUpdatePlan() {
    const planPath = './docs/testing/tag-update-plan.md';
    const plan = this.createUpdatePlan();
    
    fs.writeFileSync(planPath, plan);
    console.log(`📄 Update plan generated: ${planPath}\n`);
  }

  createUpdatePlan() {
    return `# Test Tagging Update Plan - Generated ${new Date().toISOString()}

## Summary
- **Total files**: ${this.results.total}
- **Well-tagged**: ${this.results.wellTagged} (${this.results.summary.overallWellTagged}%)
- **Need updates**: ${this.results.total - this.results.wellTagged}

## Priority 1: Missing Category Tags (${this.results.missingCategoryTags.length} files)

${this.results.missingCategoryTags.map(item => 
  `### ${item.file}
- **Add**: \`${item.suggestedTag}\`
- **Reason**: ${item.reason}
`).join('\n')}

## Priority 2: Missing Priority Tags (${this.results.missingPriorityTags.length} files)

${this.results.missingPriorityTags.map(item => 
  `### ${item.file}
- **Add**: \`${item.suggestedTag}\`
- **Reason**: ${item.reason}
`).join('\n')}

## Priority 3: Missing Functional Tags (${this.results.missingFunctionalTags.length} files)

${this.results.missingFunctionalTags.slice(0, 20).map(item => 
  `### ${item.file}
- **Add**: ${item.missing.map(tag => `\`${tag}\``).join(', ')}
`).join('\n')}

${this.results.missingFunctionalTags.length > 20 ? `\n*... and ${this.results.missingFunctionalTags.length - 20} more files*\n` : ''}

## Coverage Metrics
- Category tags coverage: ${this.results.summary.categoryTagsCoverage}%
- Functional tags coverage: ${this.results.summary.functionalTagsCoverage}%  
- Priority tags coverage: ${this.results.summary.priorityTagsCoverage}%

## Next Steps
1. Run batch update script for category tags
2. Apply priority tags to critical files
3. Add functional tags based on file patterns
4. Validate all changes with test runs
`;
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new TestTaggingAnalyzer();
  analyzer.analyzeAllTests().catch(console.error);
}

module.exports = { TestTaggingAnalyzer };
