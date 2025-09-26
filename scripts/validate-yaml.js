#!/usr/bin/env node

/**
 * Validate YAML files in the project
 * Usage: node scripts/validate-yaml.js [--fix]
 */

const yamlLint = require('yaml-lint');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
};

async function validateYamlFiles() {
  console.log(colors.blue('🔍 Validating YAML files...'));

  // Find all YAML files in the project
  const yamlFiles = await glob(['**/*.yml', '**/*.yaml'], {
    ignore: [
      'node_modules/**',
      '**/node_modules/**',
      '.nx/**',
      'dist/**',
      'build/**',
      '.docusaurus/**',
      'coverage/**',
      '*.cache/**',
    ],
  });

  if (yamlFiles.length === 0) {
    console.log(colors.yellow('⚠️  No YAML files found to validate'));
    return 0;
  }

  console.log(
    colors.gray(`Found ${yamlFiles.length} YAML file(s) to validate`),
  );

  let hasErrors = false;
  const errors = [];

  for (const file of yamlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Skip empty files
      if (!content.trim()) {
        continue;
      }

      // Validate the YAML content
      await yamlLint.lint(content);
      console.log(colors.green(`✅ ${file}`));
    } catch (error) {
      hasErrors = true;
      console.log(colors.red(`❌ ${file}`));

      // Parse the error message for better formatting
      const errorMessage = error.message || error.toString();
      const lines = errorMessage.split('\n');

      // Store error details for summary
      errors.push({
        file,
        message: errorMessage,
      });

      // Display the error details
      lines.forEach((line) => {
        if (line.trim()) {
          console.log(colors.gray(`   ${line}`));
        }
      });
    }
  }

  console.log();

  if (hasErrors) {
    console.log(
      colors.red(`❌ YAML validation failed with ${errors.length} error(s)`),
    );
    console.log();
    console.log(colors.yellow('💡 Common YAML issues:'));
    console.log(
      colors.gray('   • Incorrect indentation (use spaces, not tabs)'),
    );
    console.log(colors.gray('   • Missing colons after keys'));
    console.log(colors.gray('   • Unclosed quotes'));
    console.log(colors.gray('   • Invalid special characters'));
    console.log();
    console.log(
      colors.blue('📚 Reference: https://yaml.org/spec/1.2/spec.html'),
    );
    return 1;
  }

  console.log(
    colors.green(`✅ All ${yamlFiles.length} YAML file(s) are valid`),
  );
  return 0;
}

// Run the validation
validateYamlFiles()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error(colors.red('💥 Unexpected error:'), error);
    process.exit(1);
  });
