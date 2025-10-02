#!/usr/bin/env node

/**
 * Test Tag Rule Validator
 * Ensures test files follow server dependency rules and have valid tag combinations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define invalid tag combinations that will break execution
const INVALID_COMBINATIONS = [
  {
    tags: ['@unit', '@server-dependent'],
    reason: 'Unit tests must never require servers'
  },
  {
    tags: ['@unit', '@live-api'],
    reason: 'Unit tests must use mocks only, not live APIs'
  },
  {
    tags: ['@unit', '@post-deploy'],
    reason: 'Unit tests run pre-commit, not post-deploy'
  },
  {
    tags: ['@server-dependent', '@ci-only'],
    reason: 'CI does not have local servers running'
  },
  {
    tags: ['@post-deploy', '@local-only'],
    reason: 'Post-deploy tests run in CI, not locally'
  },
  {
    tags: ['@smoke', '!@post-deploy'],
    reason: 'Smoke tests must run post-deployment only'
  },
  {
    tags: ['@local-only', '@ci-only'],
    reason: 'Test cannot be both local-only and CI-only'
  },
  {
    tags: ['@server-dependent', '!@local-only', '!@integration', '!@e2e', '!@api'],
    reason: 'Server-dependent tests must specify their type'
  }
];

// Define required tag combinations
const REQUIRED_COMBINATIONS = [
  {
    ifHas: '@smoke',
    mustHave: ['@post-deploy', '@critical'],
    reason: 'Smoke tests must be post-deploy and critical'
  },
  {
    ifHas: '@server-dependent',
    mustNotHave: ['@ci-only'],
    mustHaveOneOf: [['@local-only'], ['@integration', '@e2e', '@api']],
    reason: 'Server-dependent tests must be local-only or specify test type'
  },
  {
    ifHas: '@live-api',
    mustHaveOneOf: [['@server-dependent'], ['@post-deploy']],
    reason: 'Live API tests must specify where they run (local servers or deployed)'
  },
  {
    ifHas: '@post-deploy',
    mustNotHave: ['@server-dependent', '@local-only'],
    reason: 'Post-deploy tests cannot depend on local servers'
  }
];

class TestTagValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validFiles = 0;
    this.totalFiles = 0;
  }

  findTestFiles() {
    try {
      const command = `find . -type f \\( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.spec.js" -o -name "*.spec.jsx" \\) | grep -v node_modules | sort`;
      const output = execSync(command, { encoding: 'utf8' });
      return output.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('Error finding test files:', error.message);
      return [];
    }
  }

  extractTags(content) {
    const tags = new Set();
    
    // Extract from JSDoc comments
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//g);
    if (jsdocMatch) {
      jsdocMatch.forEach(comment => {
        const tagMatches = comment.match(/@[\w-]+/g);
        if (tagMatches) {
          tagMatches.forEach(tag => tags.add(tag));
        }
      });
    }

    // Extract from describe blocks
    const describeMatches = content.match(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (describeMatches) {
      describeMatches.forEach(match => {
        const tagMatches = match.match(/@[\w-]+/g);
        if (tagMatches) {
          tagMatches.forEach(tag => tags.add(tag));
        }
      });
    }

    return Array.from(tags);
  }

  validateTagCombinations(filePath, tags) {
    const errors = [];
    const warnings = [];

    // Check for invalid combinations
    for (const rule of INVALID_COMBINATIONS) {
      const hasAllTags = rule.tags.every(tag => {
        if (tag.startsWith('!')) {
          return !tags.includes(tag.substring(1));
        }
        return tags.includes(tag);
      });

      if (hasAllTags) {
        errors.push({
          file: filePath,
          tags: rule.tags.filter(t => !t.startsWith('!')),
          reason: rule.reason
        });
      }
    }

    // Check required combinations
    for (const rule of REQUIRED_COMBINATIONS) {
      if (!tags.includes(rule.ifHas)) {continue;}

      // Check must have tags
      if (rule.mustHave) {
        const missing = rule.mustHave.filter(tag => !tags.includes(tag));
        if (missing.length > 0) {
          errors.push({
            file: filePath,
            missing: missing,
            reason: `${rule.reason} (missing: ${missing.join(', ')})`
          });
        }
      }

      // Check must not have tags
      if (rule.mustNotHave) {
        const present = rule.mustNotHave.filter(tag => tags.includes(tag));
        if (present.length > 0) {
          errors.push({
            file: filePath,
            invalid: present,
            reason: `${rule.reason} (has: ${present.join(', ')})`
          });
        }
      }

      // Check must have one of
      if (rule.mustHaveOneOf) {
        const hasOne = rule.mustHaveOneOf.some(tagGroup => 
          tagGroup.every(tag => tags.includes(tag))
        );
        if (!hasOne) {
          warnings.push({
            file: filePath,
            reason: `${rule.reason} (needs one of: ${rule.mustHaveOneOf.map(g => g.join('+')).join(' OR ')})`
          });
        }
      }
    }

    // Additional validation rules
    
    // Check for server dependency clarity
    if (tags.includes('@integration') && !tags.includes('@server-dependent')) {
      // This is good - mock-based integration test
    } else if (tags.includes('@integration') && tags.includes('@server-dependent')) {
      if (!tags.includes('@local-only')) {
        warnings.push({
          file: filePath,
          reason: 'Server-dependent integration tests should be marked @local-only'
        });
      }
    }

    // Check API test categorization
    if (tags.includes('@api')) {
      if (tags.includes('@live-api')) {
        if (!tags.includes('@server-dependent') && !tags.includes('@post-deploy')) {
          errors.push({
            file: filePath,
            reason: 'Live API tests must specify execution environment (@server-dependent or @post-deploy)'
          });
        }
      }
    }

    // Check E2E test categorization
    if (tags.includes('@e2e')) {
      if (!tags.includes('@server-dependent') && !tags.includes('@post-deploy')) {
        errors.push({
          file: filePath,
          reason: 'E2E tests must specify execution environment (@server-dependent for local, @post-deploy for deployed)'
        });
      }
    }

    return { errors, warnings };
  }

  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tags = this.extractTags(content);
      
      if (tags.length === 0) {
        this.warnings.push({
          file: filePath,
          reason: 'No tags found in test file'
        });
        return;
      }

      const { errors, warnings } = this.validateTagCombinations(filePath, tags);
      
      if (errors.length === 0 && warnings.length === 0) {
        this.validFiles++;
      } else {
        this.errors.push(...errors);
        this.warnings.push(...warnings);
      }

    } catch (error) {
      this.errors.push({
        file: filePath,
        reason: `Failed to read file: ${error.message}`
      });
    }
  }

  async validate() {
    console.log('🔍 Validating test tag rules...\n');
    
    const files = this.findTestFiles();
    this.totalFiles = files.length;

    for (const file of files) {
      this.validateFile(file);
    }

    this.printReport();
    
    // Return exit code based on errors
    return this.errors.length === 0 ? 0 : 1;
  }

  printReport() {
    console.log('📊 VALIDATION REPORT');
    console.log('===================\n');
    
    console.log(`Total files checked: ${this.totalFiles}`);
    console.log(`Valid files: ${this.validFiles}`);
    console.log(`Files with errors: ${this.errors.length}`);
    console.log(`Files with warnings: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERRORS (Must Fix):');
      console.log('---------------------');
      this.errors.forEach(error => {
        console.log(`\n  ${error.file}`);
        if (error.tags) {
          console.log(`    Invalid combination: ${error.tags.join(' + ')}`);
        }
        if (error.invalid) {
          console.log(`    Invalid tags: ${error.invalid.join(', ')}`);
        }
        if (error.missing) {
          console.log(`    Missing tags: ${error.missing.join(', ')}`);
        }
        console.log(`    Reason: ${error.reason}`);
      });
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS (Should Fix):');
      console.log('------------------------');
      this.warnings.forEach(warning => {
        console.log(`\n  ${warning.file}`);
        console.log(`    ${warning.reason}`);
      });
      console.log();
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All test files have valid tag combinations!\n');
    } else if (this.errors.length > 0) {
      console.log('🚨 VALIDATION FAILED: Fix errors before tests can run correctly.\n');
      this.printGuidance();
    }
  }

  printGuidance() {
    console.log('📖 TAGGING GUIDANCE');
    console.log('==================\n');
    
    console.log('Tests that DON\'T need servers (can run in CI):');
    console.log('  • @unit - Fully mocked unit tests');
    console.log('  • @integration (without @server-dependent) - MSW mocked integration');
    console.log('  • @api (without @live-api) - MSW mocked API tests\n');
    
    console.log('Tests that NEED local servers (local only):');
    console.log('  • @integration @server-dependent @local-only');
    console.log('  • @api @live-api @server-dependent @local-only');
    console.log('  • @e2e @server-dependent @local-only\n');
    
    console.log('Tests that run AFTER deployment (CI only):');
    console.log('  • @smoke @post-deploy @critical');
    console.log('  • @e2e @post-deploy');
    console.log('  • @api @live-api @post-deploy\n');
    
    console.log('Common fixes:');
    console.log('  • Unit test calling API? → Add mocks, remove @server-dependent');
    console.log('  • Integration test needs server? → Add @server-dependent @local-only');
    console.log('  • Smoke test missing tags? → Add @post-deploy @critical');
    console.log('  • E2E without environment? → Add @server-dependent or @post-deploy\n');
  }
}

// CLI execution
async function main() {
  const validator = new TestTagValidator();
  const exitCode = await validator.validate();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { TestTagValidator };