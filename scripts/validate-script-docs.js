#!/usr/bin/env node

/**
 * Script Documentation Validator
 * Pre-commit hook to ensure scripts have proper documentation
 * Documentation: scripts/script-inventory/README.md
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ScriptDocValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.scriptExtensions = [
      '.js',
      '.ts',
      '.mjs',
      '.cjs',
      '.py',
      '.sh',
      '.bash',
    ];
  }

  /**
   * Get staged files from git
   */
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', {
        encoding: 'utf8',
      });
      return output
        .split('\n')
        .filter(Boolean)
        .filter((file) => {
          const ext = path.extname(file);
          return this.scriptExtensions.includes(ext);
        })
        .filter((file) => {
          // Include files in scripts/ and tools/ directories
          return file.startsWith('scripts/') || file.startsWith('tools/');
        });
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if a script has documentation
   */
  checkScriptDocumentation(filePath) {
    if (!fs.existsSync(filePath)) {
      return { valid: true }; // File was deleted
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const issues = [];

    // Check for documentation comment at the top
    const hasDocComment =
      content.match(/^\/\*\*[\s\S]*?\*\//m) || // JSDoc style
      content.match(/^"""[\s\S]*?"""/m) || // Python docstring
      content.match(/^#\s*[A-Z].*$/m) || // Shell comment starting with capital
      content.match(/^\/\/\s*[A-Z].*$/m); // JS line comment starting with capital

    if (!hasDocComment) {
      issues.push('Missing documentation comment at the top of the file');
    }

    // Check for purpose/description
    const hasPurpose =
      content.match(/Purpose:|Description:|Summary:/i) ||
      content.match(/@description/i) ||
      content.match(/^#\s*\w+.*\w+.*\w+/m); // At least 3 words in a comment

    if (!hasPurpose) {
      issues.push('Missing purpose or description');
    }

    // Check for documentation reference
    const hasDocRef = content.match(/Documentation:\s*[\w\/.]+\.md/i);
    if (!hasDocRef && !content.includes('README')) {
      issues.push(
        'Missing documentation reference (Documentation: path/to/docs.md)',
      );
    }

    // Check CLI scripts for help option
    if (
      content.includes('process.argv') ||
      content.includes('commander') ||
      content.includes('yargs') ||
      content.includes('argparse')
    ) {
      const hasHelp =
        content.includes('--help') ||
        content.includes('-h') ||
        content.includes('.help(') ||
        content.includes('show_help');

      if (!hasHelp) {
        issues.push('CLI script missing --help option');
      }
    }

    // Check for deprecation notice if deprecated
    if (
      fileName.includes('deprecated') ||
      fileName.includes('old') ||
      fileName.includes('legacy')
    ) {
      const hasDeprecationNotice =
        content.match(/@deprecated/i) || content.match(/DEPRECATED/);

      if (!hasDeprecationNotice) {
        issues.push('Deprecated script missing deprecation notice');
      }
    }

    // Check test files for test tags
    if (fileName.includes('test') || fileName.includes('spec')) {
      const hasTestTags =
        content.match(/@(unit|integration|e2e|smoke)/i) ||
        content.includes('test.tag') ||
        content.includes('describe.tag');

      if (!hasTestTags) {
        issues.push(
          'Test file missing test tags (@unit, @integration, @e2e, etc.)',
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate all staged scripts
   */
  validate() {
    const stagedFiles = this.getStagedFiles();

    if (stagedFiles.length === 0) {
      return { valid: true, errors: [], warnings: [] };
    }

    console.log(
      `\n📝 Validating documentation for ${stagedFiles.length} script(s)...\n`,
    );

    for (const file of stagedFiles) {
      const result = this.checkScriptDocumentation(file);

      if (!result.valid) {
        console.log(`❌ ${file}`);
        result.issues.forEach((issue) => {
          console.log(`   • ${issue}`);
          this.errors.push(`${file}: ${issue}`);
        });
      } else {
        console.log(`✅ ${file}`);
      }
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Generate documentation template
   */
  static generateTemplate(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    const purpose = fileName.replace(ext, '').replace(/[-_]/g, ' ');

    if (ext === '.js' || ext === '.ts' || ext === '.mjs' || ext === '.cjs') {
      return `#!/usr/bin/env node

/**
 * ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}
 * TODO: Add detailed description
 * Documentation: developer_notes/scripts.md
 */

`;
    } else if (ext === '.py') {
      return `#!/usr/bin/env python3

"""
${purpose.charAt(0).toUpperCase() + purpose.slice(1)}
TODO: Add detailed description
Documentation: developer_notes/scripts.md
"""

`;
    } else if (ext === '.sh' || ext === '.bash') {
      return `#!/bin/bash

# ${purpose.charAt(0).toUpperCase() + purpose.slice(1)}
# TODO: Add detailed description
# Documentation: developer_notes/scripts.md

`;
    }
    return '';
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Script Documentation Validator
Pre-commit hook to ensure scripts have proper documentation

Usage: node validate-script-docs.js [options]

Options:
  --help, -h         Show this help message
  --fix              Add template documentation to undocumented files
  --verbose          Show detailed validation rules
  
Validation Rules:
  1. Scripts must have a documentation comment at the top
  2. Scripts must include a purpose or description
  3. Scripts should reference documentation (Documentation: path/to/docs.md)
  4. CLI scripts must have a --help option
  5. Deprecated scripts must have deprecation notices
  6. Test files must have test tags (@unit, @integration, @e2e, etc.)

Examples:
  # Run as pre-commit hook
  node validate-script-docs.js
  
  # Add template documentation
  node validate-script-docs.js --fix

Exit codes:
  0 - All scripts have proper documentation
  1 - One or more scripts lack documentation
    `);
    process.exit(0);
  }

  if (args.includes('--verbose')) {
    console.log(`
Validation Rules:
═══════════════════════════════════════
• Documentation comment at file top (JSDoc, docstring, or comment block)
• Purpose or description in the documentation
• Reference to external documentation file
• CLI scripts must have --help option
• Deprecated scripts must have @deprecated notice
• Test files must have test tags
    `);
  }

  const validator = new ScriptDocValidator();
  const result = validator.validate();

  if (!result.valid) {
    console.log(`\n❌ Documentation validation failed!`);
    console.log(`Found ${result.errors.length} issue(s)\n`);

    if (args.includes('--fix')) {
      console.log('💡 Tip: Add documentation templates with --fix flag');
    } else {
      console.log('💡 Tips:');
      console.log('  • Add a documentation comment at the top of each script');
      console.log('  • Include: Purpose, Usage, Documentation reference');
      console.log('  • For CLI scripts, implement --help option');
      console.log('  • For tests, add test tags (@unit, @integration, @e2e)');
    }

    process.exit(1);
  }

  console.log(`\n✅ All scripts have proper documentation!\n`);
  process.exit(0);
}

module.exports = ScriptDocValidator;
