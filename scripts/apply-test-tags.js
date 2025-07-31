#!/usr/bin/env node

/**
 * Test Tag Updater - Task 1.3 & 1.4
 * Applies missing tags to test files based on analysis results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the analyzer to get current state
const { TestTaggingAnalyzer } = require('./test-tagging-analyzer.js');

class TestTagUpdater {
  constructor() {
    this.updatedFiles = [];
    this.errors = [];
    this.dryRun = false;
  }

  async updateAllTags(options = {}) {
    this.dryRun = options.dryRun || false;
    
    console.log(`🚀 Starting test tag updates ${this.dryRun ? '(DRY RUN)' : ''}...\n`);

    // Get current analysis
    const analyzer = new TestTaggingAnalyzer();
    await analyzer.analyzeAllTests();
    
    const results = analyzer.results;

    // Apply updates in priority order
    await this.applyCategoryTags(results.missingCategoryTags);
    await this.applyPriorityTags(results.missingPriorityTags);
    await this.applyFunctionalTags(results.missingFunctionalTags);

    this.printSummary();
  }

  async applyCategoryTags(missingCategoryTags) {
    console.log(`📁 Applying category tags to ${missingCategoryTags.length} files...\n`);

    for (const item of missingCategoryTags) {
      try {
        await this.updateFileWithCategoryTag(item.file, item.suggestedTag);
        console.log(`✅ ${item.file} → ${item.suggestedTag}`);
      } catch (error) {
        console.error(`❌ ${item.file} → Error: ${error.message}`);
        this.errors.push({ file: item.file, error: error.message });
      }
    }
    console.log();
  }

  async applyPriorityTags(missingPriorityTags) {
    console.log(`⚡ Applying priority tags to ${missingPriorityTags.length} files...\n`);

    for (const item of missingPriorityTags) {
      try {
        await this.updateFileWithPriorityTag(item.file, item.suggestedTag);
        console.log(`✅ ${item.file} → ${item.suggestedTag}`);
      } catch (error) {
        console.error(`❌ ${item.file} → Error: ${error.message}`);
        this.errors.push({ file: item.file, error: error.message });
      }
    }
    console.log();
  }

  async applyFunctionalTags(missingFunctionalTags) {
    console.log(`🔧 Applying functional tags to ${missingFunctionalTags.length} files...\n`);

    for (const item of missingFunctionalTags) {
      try {
        await this.updateFileWithFunctionalTags(item.file, item.missing);
        console.log(`✅ ${item.file} → ${item.missing.join(', ')}`);
      } catch (error) {
        console.error(`❌ ${item.file} → Error: ${error.message}`);
        this.errors.push({ file: item.file, error: error.message });
      }
    }
    console.log();
  }

  async updateFileWithCategoryTag(filePath, categoryTag) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;

    // Find the main describe block and add category tag
    const describePatterns = [
      /describe\s*\(\s*['"`]([^'"`]+)['"`]/,
      /test\.describe\s*\(\s*['"`]([^'"`]+)['"`]/,
      /smokeTest\.describe\s*\(\s*['"`]([^'"`]+)['"`]/,
      /e2eTest\.describe\s*\(\s*['"`]([^'"`]+)['"`]/,
      /integrationTest\.describe\s*\(\s*['"`]([^'"`]+)['"`]/
    ];

    let updated = false;
    for (const pattern of describePatterns) {
      const match = content.match(pattern);
      if (match) {
        const originalDescribe = match[0];
        const testName = match[1];
        
        // Check if tags already exist
        if (testName.includes('@')) {
          // Add to existing tags
          const newDescribe = originalDescribe.replace(
            testName,
            `${testName} ${categoryTag}`
          );
          updatedContent = updatedContent.replace(originalDescribe, newDescribe);
        } else {
          // Add new tags
          const newDescribe = originalDescribe.replace(
            testName,
            `${testName} ${categoryTag}`
          );
          updatedContent = updatedContent.replace(originalDescribe, newDescribe);
        }
        updated = true;
        break;
      }
    }

    if (!updated) {
      throw new Error('Could not find describe block to update');
    }

    if (!this.dryRun) {
      fs.writeFileSync(filePath, updatedContent);
    }
    
    this.updatedFiles.push(filePath);
  }

  async updateFileWithPriorityTag(filePath, priorityTag) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;

    // Find the main describe block and add priority tag
    const describePattern = /describe\s*\(\s*['"`]([^'"`]+)['"`]/;
    const match = content.match(describePattern);
    
    if (match) {
      const originalDescribe = match[0];
      const testName = match[1];
      
      // Add priority tag
      const newDescribe = originalDescribe.replace(
        testName,
        testName.includes('@') ? `${testName} ${priorityTag}` : `${testName} ${priorityTag}`
      );
      updatedContent = updatedContent.replace(originalDescribe, newDescribe);

      if (!this.dryRun) {
        fs.writeFileSync(filePath, updatedContent);
      }
      
      this.updatedFiles.push(filePath);
    } else {
      throw new Error('Could not find describe block to update');
    }
  }

  async updateFileWithFunctionalTags(filePath, functionalTags) {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;

    // Find the main describe block and add functional tags
    const describePattern = /describe\s*\(\s*['"`]([^'"`]+)['"`]/;
    const match = content.match(describePattern);
    
    if (match) {
      const originalDescribe = match[0];
      const testName = match[1];
      
      // Add functional tags
      const tagsToAdd = functionalTags.join(' ');
      const newDescribe = originalDescribe.replace(
        testName,
        testName.includes('@') ? `${testName} ${tagsToAdd}` : `${testName} ${tagsToAdd}`
      );
      updatedContent = updatedContent.replace(originalDescribe, newDescribe);

      if (!this.dryRun) {
        fs.writeFileSync(filePath, updatedContent);
      }
      
      this.updatedFiles.push(filePath);
    } else {
      throw new Error('Could not find describe block to update');
    }
  }

  printSummary() {
    console.log('📊 UPDATE SUMMARY');
    console.log('================\n');
    
    console.log(`✅ Successfully updated: ${this.updatedFiles.length} files`);
    console.log(`❌ Errors encountered: ${this.errors.length} files\n`);

    if (this.errors.length > 0) {
      console.log('🚨 ERRORS:');
      this.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
      console.log();
    }

    if (this.dryRun) {
      console.log('🔍 This was a dry run - no files were actually modified');
      console.log('Run without --dry-run to apply changes\n');
    } else {
      console.log('💾 Changes have been written to files');
      console.log('🧪 Run tests to validate the updates\n');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Test Tag Updater - Apply missing tags to test files

Usage:
  node scripts/apply-test-tags.js [options]

Options:
  --dry-run    Show what would be updated without making changes
  --help, -h   Show this help message

Examples:
  node scripts/apply-test-tags.js --dry-run    # Preview changes
  node scripts/apply-test-tags.js             # Apply all updates
`);
    return;
  }

  const updater = new TestTagUpdater();
  await updater.updateAllTags({ dryRun });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestTagUpdater };
