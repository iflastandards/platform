#!/usr/bin/env node

/**
 * Extract build warnings from nx build output log
 * Usage: node extract-build-warnings.js <build-output.log>
 */

const fs = require('fs');
const path = require('path');

function extractWarnings(logFile) {
  if (!fs.existsSync(logFile)) {
    console.error(`Log file not found: ${logFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n');

  const warnings = [];
  const siteWarnings = {};
  let currentSite = null;
  let currentWarnings = [];

  // Patterns to identify site builds and warnings
  const sitePattern = /nx run ([^:]+):build/;
  const buildingPattern = /Building.*?(?:for|site|project)[:\s]+([^\s]+)/i;
  const warningPattern = /\[WARNING\]|\[WARN\]|Warning:/i;
  const docusaurusWarningPattern = /Broken link|Duplicate route|deprecated|unsafe lifecycle|componentWillMount/i;

  lines.forEach((line, index) => {
    // Check for site/project being built
    const siteMatch = line.match(sitePattern);
    if (siteMatch) {
      // Save previous site's warnings if any
      if (currentSite && currentWarnings.length > 0) {
        if (!siteWarnings[currentSite]) {
          siteWarnings[currentSite] = [];
        }
        siteWarnings[currentSite].push(...currentWarnings);
      }

      currentSite = siteMatch[1];
      currentWarnings = [];
      return;
    }

    // Alternative pattern for detecting site
    const buildMatch = line.match(buildingPattern);
    if (buildMatch && !currentSite) {
      currentSite = buildMatch[1];
    }

    // Check for warnings
    if (warningPattern.test(line) || docusaurusWarningPattern.test(line)) {
      const warning = {
        line: index + 1,
        message: line.trim(),
        context: []
      };

      // Add context lines (2 before, 2 after if available)
      for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 3); i++) {
        if (i !== index) {
          warning.context.push(lines[i]);
        }
      }

      currentWarnings.push(warning);
      warnings.push({
        site: currentSite || 'unknown',
        ...warning
      });
    }
  });

  // Save last site's warnings
  if (currentSite && currentWarnings.length > 0) {
    if (!siteWarnings[currentSite]) {
      siteWarnings[currentSite] = [];
    }
    siteWarnings[currentSite].push(...currentWarnings);
  }

  // Format output
  const output = Object.entries(siteWarnings).map(([site, warnings]) => ({
    site,
    warnings: warnings.map(w => ({
      message: w.message,
      line: w.line
    })),
    warningCount: warnings.length,
    success: warnings.length === 0
  }));

  // Add sites that built successfully without warnings
  const builtSites = new Set();
  lines.forEach(line => {
    const match = line.match(/nx run ([^:]+):build/);
    if (match) {
      builtSites.add(match[1]);
    }
  });

  builtSites.forEach(site => {
    if (!siteWarnings[site]) {
      output.push({
        site,
        warnings: [],
        warningCount: 0,
        success: true
      });
    }
  });

  return output;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node extract-build-warnings.js <build-output.log>');
  process.exit(1);
}

try {
  const warnings = extractWarnings(process.argv[2]);
  console.log(JSON.stringify(warnings, null, 2));
} catch (error) {
  console.error('Error extracting warnings:', error.message);
  process.exit(1);
}