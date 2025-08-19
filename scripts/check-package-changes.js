#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Check if package.json changes are only in scripts section
 */
function checkPackageJsonChanges() {
  try {
    // Get the diff for package.json
    const diff = execSync('git diff --cached package.json', {
      encoding: 'utf-8',
    });

    if (!diff) {
      return { hasPackageJson: false, onlyScripts: false };
    }

    // Parse the diff to see what sections changed
    const lines = diff.split('\n');
    const addedLines = lines.filter(
      (line) => line.startsWith('+') && !line.startsWith('+++'),
    );
    const removedLines = lines.filter(
      (line) => line.startsWith('-') && !line.startsWith('---'),
    );

    // Check if all changes are within the scripts section
    // This is a simplified check - looks for script-related changes
    const scriptRelatedPatterns = [
      /"scripts":/,
      /^\+\s+"[^"]+": "(tsx |pnpm |node |npm |yarn |nx |jest |vitest |eslint |prettier |tsc |webpack |vite |rollup |turbo |playwright )/,
      /^\+\s+\}/, // Closing brace
    ];

    const nonScriptChanges = [...addedLines, ...removedLines].filter((line) => {
      // Skip the closing brace if it's the only change
      if (line.match(/^\[+-]\s*\}$/)) return false;

      // Check if this line matches any script-related pattern
      const isScriptRelated = scriptRelatedPatterns.some((pattern) =>
        line.match(pattern),
      );

      // If it's not script-related and it's not just whitespace, it's a non-script change
      return !isScriptRelated && line.trim().length > 1;
    });

    return {
      hasPackageJson: true,
      onlyScripts: nonScriptChanges.length === 0,
    };
  } catch (error) {
    console.error('Error checking package.json changes:', error.message);
    return { hasPackageJson: false, onlyScripts: false };
  }
}

// Run if called directly
if (require.main === module) {
  const result = checkPackageJsonChanges();

  if (result.hasPackageJson) {
    if (result.onlyScripts) {
      console.log('✅ package.json changes are only in scripts section');
      process.exit(0);
    } else {
      console.log('⚠️ package.json has non-script changes');
      process.exit(1);
    }
  } else {
    console.log('No package.json changes detected');
    process.exit(0);
  }
}

module.exports = { checkPackageJsonChanges };
