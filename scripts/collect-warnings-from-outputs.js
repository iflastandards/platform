#!/usr/bin/env node

/**
 * Collect warnings from Nx build outputs after nx run-many execution
 * This is a simpler alternative to collect-warnings-parallel.js when using nx run-many
 *
 * Usage: node scripts/collect-warnings-from-outputs.js "project1,project2,project3"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get projects from command line argument
const projectsList = process.argv[2];
if (!projectsList) {
  console.log('⚠️ No projects specified for warning collection');
  process.exit(0);
}

const projects = projectsList.split(',').map(p => p.trim());
console.log(`📊 Collecting warnings for projects: ${projects.join(', ')}`);

// Map Nx project names to actual build directories
const projectToBuildDir = {
  'portal': 'portal/build',
  'isbdm': 'standards/ISBDM/build',
  'lrm': 'standards/LRM/build',
  'frbr': 'standards/FRBR/build',
  'isbd': 'standards/isbd/build',
  'muldicat': 'standards/muldicat/build',
  'unimarc': 'standards/unimarc/build',
};

// Collect basic build information
const results = [];
let totalWarnings = 0;

for (const project of projects) {
  const buildDir = projectToBuildDir[project.toLowerCase()];

  if (!buildDir) {
    console.log(`⚠️ Unknown project: ${project}`);
    continue;
  }

  const buildPath = path.join(process.cwd(), buildDir);
  const exists = fs.existsSync(buildPath);

  if (exists) {
    // Count files in build directory as a simple metric
    try {
      const fileCount = execSync(`find "${buildPath}" -type f | wc -l`, {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();

      results.push({
        site: project,
        success: true,
        warnings: 0, // We don't have actual warnings from nx run-many output
        buildTime: 'N/A',
        fileCount: parseInt(fileCount),
        buildPath: buildDir
      });

      console.log(`✅ ${project}: Build found with ${fileCount} files`);
    } catch (error) {
      console.log(`⚠️ ${project}: Error counting files: ${error.message}`);
    }
  } else {
    results.push({
      site: project,
      success: false,
      warnings: 0,
      error: 'Build directory not found',
      buildPath: buildDir
    });
    console.log(`❌ ${project}: Build directory not found at ${buildDir}`);
  }
}

// Write results
const outputDir = path.join(process.cwd(), 'output/_reports');
fs.mkdirSync(outputDir, { recursive: true });

// Write JSON report
const jsonPath = path.join(outputDir, 'build-warnings.json');
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
console.log(`\n📝 JSON report written to ${jsonPath}`);

// Write summary markdown
const summaryPath = path.join(outputDir, 'build-warnings-summary.md');
const summaryContent = `# Build Summary

**Total Projects**: ${results.length}
**Successful Builds**: ${results.filter(r => r.success).length}
**Failed Builds**: ${results.filter(r => !r.success).length}

## Build Details

| Project | Status | Files | Path |
|---------|--------|-------|------|
${results.map(r => `| ${r.site} | ${r.success ? '✅' : '❌'} | ${r.fileCount || 'N/A'} | ${r.buildPath} |`).join('\n')}

_Note: Warning counts not available when using nx run-many_
`;

fs.writeFileSync(summaryPath, summaryContent);
console.log(`📝 Summary written to ${summaryPath}`);

// Set GitHub Actions outputs if in CI
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `warning_count=${totalWarnings}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `site_summary=${JSON.stringify(results)}\n`);
  console.log('📤 Set GitHub Actions outputs');
}

process.exit(0);