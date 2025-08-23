#!/usr/bin/env node

/**
 * Fix common MDX parsing errors in markdown files
 * Documentation: docs/developer-guide/scripts.md#fix-mdx-errors
 *
 * This script:
 * 1. Escapes unescaped angle brackets that cause MDX parsing errors
 * 2. Fixes other common MDX syntax issues
 *
 * Usage:
 *   node scripts/fix-mdx-errors.js [path]
 *   pnpm fix:mdx
 *
 * Options:
 *   --dry-run    Show what would be changed without modifying files
 *   --verbose    Show detailed output
 *   path         Directory or file to process (default: entire repo)
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Get target path from command line or use default patterns
const targetPath = process.argv.find(
  (arg, index) => index > 1 && !arg.startsWith('--'),
);

// Patterns to find markdown files
const DEFAULT_PATTERNS = [
  'system-design-docs/**/*.md',
  'docs/**/*.md',
  'docs/**/*.mdx',
  'apps/*/docs/**/*.md',
  'apps/*/docs/**/*.mdx',
  'standards/*/docs/**/*.md',
  'standards/*/docs/**/*.mdx',
  'developer_notes/**/*.md',
  'PRPs/**/*.md',
  '*.md',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/CHANGELOG.md',
];

/**
 * Fix MDX parsing errors in content
 */
function fixMDXContent(content, filePath) {
  let fixed = content;
  const changes = [];

  // Fix unescaped angle brackets in text (not in code blocks)
  const lines = fixed.split('\n');
  let inCodeBlock = false;
  let inTable = false;

  const fixedLines = lines.map((line, index) => {
    // Check for code block boundaries
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    // Don't process lines inside code blocks
    if (inCodeBlock) {
      return line;
    }

    // Check if line is indented (likely code)
    if (line.match(/^(    |\t)/)) {
      return line;
    }

    // Check if we're in a table
    if (line.startsWith('|')) {
      inTable = true;
    } else if (inTable && !line.trim()) {
      inTable = false;
    }

    let fixedLine = line;

    // Fix unclosed <br> tags in tables and elsewhere
    if (inTable || line.includes('<br>')) {
      // Replace <br> with <br/> to make it self-closing
      const originalLine = fixedLine;
      fixedLine = fixedLine.replace(/<br>/g, '<br/>');
      if (originalLine !== fixedLine && VERBOSE) {
        changes.push({
          line: index + 1,
          before: originalLine.trim(),
          after: fixedLine.trim(),
        });
      }
    }

    // Fix problematic MDX patterns
    // Fix template placeholders that look like MDX expressions
    const originalLine = fixedLine;
    fixedLine = fixedLine.replace(/\{\{\s*([^}]+)\s*\}\}/g, '[$1]');
    if (originalLine !== fixedLine && VERBOSE) {
      changes.push({
        line: index + 1,
        before: originalLine.trim(),
        after: fixedLine.trim(),
      });
    }

    // Fix angle brackets not in inline code
    // Match patterns like "< 5 minutes" or ">90%" or "<5" but not HTML tags
    const anglePatterns = [
      // Less than with number (with or without space)
      {
        pattern: /(?<!&lt;)(?<!<\/)(<)(\s*\d+[\s\w%]*)/g,
        replacement: '&lt;$2',
      },
      // Greater than with number (with or without space)
      {
        pattern: /(?<!&gt;)(?<!>\/)(?<![a-zA-Z])>(\s*\d+%?)/g,
        replacement: '&gt;$1',
      },
      // Specific pattern for percentages after less than
      { pattern: /:\s*<(\d+%)/g, replacement: ': &lt;$1' },
      // Specific pattern for percentages after greater than
      { pattern: /:\s*>(\d+%)/g, replacement: ': &gt;$1' },
    ];

    anglePatterns.forEach(({ pattern, replacement }) => {
      const originalLine = fixedLine;
      fixedLine = fixedLine.replace(pattern, replacement);
      if (originalLine !== fixedLine && VERBOSE) {
        changes.push({
          line: index + 1,
          before: originalLine.trim(),
          after: fixedLine.trim(),
        });
      }
    });

    return fixedLine;
  });

  fixed = fixedLines.join('\n');

  // Additional MDX fixes can be added here
  // For example: escaping curly braces outside of JSX expressions
  // fixed = fixed.replace(/(?<!\\){(?!{)/g, '\\{');
  // fixed = fixed.replace(/(?<!\\)}(?!})/g, '\\}');

  return { content: fixed, changes };
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { content: fixed, changes } = fixMDXContent(content, filePath);

    if (content !== fixed) {
      if (DRY_RUN) {
        console.log(`Would fix: ${filePath}`);
        if (VERBOSE && changes.length > 0) {
          changes.forEach((change) => {
            console.log(`  Line ${change.line}:`);
            console.log(`    - ${change.before}`);
            console.log(`    + ${change.after}`);
          });
        }
      } else {
        await fs.writeFile(filePath, fixed, 'utf-8');
        console.log(`Fixed: ${filePath}`);
        if (VERBOSE && changes.length > 0) {
          console.log(`  ${changes.length} fixes applied`);
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Fixing MDX parsing errors in markdown files...');
  if (DRY_RUN) {
    console.log('Running in dry-run mode (no files will be modified)');
  }

  let patterns;

  if (targetPath) {
    // Check if target is a file or directory
    try {
      const stat = await fs.stat(targetPath);
      if (stat.isDirectory()) {
        patterns = [`${targetPath}/**/*.md`, `${targetPath}/**/*.mdx`];
      } else {
        patterns = [targetPath];
      }
    } catch {
      patterns = [targetPath];
    }
  } else {
    patterns = DEFAULT_PATTERNS;
  }

  let allFiles = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: EXCLUDE_PATTERNS,
      nodir: true,
    });
    allFiles = allFiles.concat(files);
  }

  // Remove duplicates
  allFiles = [...new Set(allFiles)];

  if (allFiles.length === 0) {
    console.log('No markdown files found to process');
    return;
  }

  console.log(`Processing ${allFiles.length} files...`);

  let fixedCount = 0;
  for (const file of allFiles) {
    const wasFixed = await processFile(file);
    if (wasFixed) {fixedCount++;}
  }

  console.log(
    `\nSummary: ${fixedCount} files ${DRY_RUN ? 'would be' : 'were'} fixed`,
  );

  if (fixedCount > 0 && !DRY_RUN) {
    console.log('\nYou may want to run "pnpm lint:mdx" to verify the fixes');
  }
}

// Run the script
main().catch(console.error);
