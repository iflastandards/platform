#!/usr/bin/env node

/**
 * Dependency checker for Nx monorepo
 * Analyzes project dependencies and reports issues
 * Documentation: scripts/README.md#check-dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkDependencies() {
  console.log('🔍 Checking dependencies across the monorepo...\n');

  try {
    // Get all projects from Nx
    const projectsOutput = execSync('pnpm nx show projects', {
      encoding: 'utf-8',
    });
    const projects = projectsOutput
      .trim()
      .split('\n')
      .filter((p) => p);

    console.log(`Found ${projects.length} projects to check:\n`);

    const issues = [];

    for (const project of projects) {
      // Get project configuration
      const projectJsonPath = findProjectJson(project);
      if (!projectJsonPath) {
        console.log(`⚠️  ${project}: No project.json found`);
        continue;
      }

      const packageJsonPath = path.join(
        path.dirname(projectJsonPath),
        'package.json',
      );
      if (!fs.existsSync(packageJsonPath)) {
        console.log(
          `✓ ${project}: No package.json (likely a non-publishable app)`,
        );
        continue;
      }

      // Check the package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const projectIssues = analyzePackageJson(
        project,
        packageJson,
        packageJsonPath,
      );

      if (projectIssues.length > 0) {
        issues.push({ project, issues: projectIssues });
        console.log(`❌ ${project}: ${projectIssues.length} issue(s) found`);
      } else {
        console.log(`✓ ${project}: Dependencies OK`);
      }
    }

    // Report summary
    console.log('\n' + '='.repeat(60));
    if (issues.length === 0) {
      console.log('✅ All dependencies are properly configured!');
    } else {
      console.log(
        `\n⚠️  Found dependency issues in ${issues.length} project(s):\n`,
      );

      for (const { project, issues: projectIssues } of issues) {
        console.log(`\n${project}:`);
        for (const issue of projectIssues) {
          console.log(`  - ${issue}`);
        }
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking dependencies:', error.message);
    process.exit(1);
  }
}

function findProjectJson(projectName) {
  // Common locations for project.json files
  const possiblePaths = [
    `apps/${projectName}/project.json`,
    `packages/${projectName}/project.json`,
    `libs/${projectName}/project.json`,
    `${projectName}/project.json`,
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

function analyzePackageJson(project, packageJson, packageJsonPath) {
  const issues = [];
  const projectDir = path.dirname(packageJsonPath);

  // Check for missing dependencies based on imports
  const sourceFiles = getSourceFiles(projectDir);
  const imports = extractImports(sourceFiles);
  const declaredDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ]);

  // Check for commonly missing dependencies
  for (const imp of imports) {
    // Skip relative imports and node builtins
    if (imp.startsWith('.') || imp.startsWith('/') || isNodeBuiltin(imp)) {
      continue;
    }

    // Extract package name from import (handle scoped packages)
    const packageName = getPackageName(imp);

    // Skip workspace packages
    if (packageName.startsWith('@ifla/') || packageName === project) {
      continue;
    }

    if (!declaredDeps.has(packageName)) {
      issues.push(
        `Missing dependency: ${packageName} (imported but not in package.json)`,
      );
    }
  }

  return issues;
}

function getSourceFiles(dir) {
  const files = [];
  const srcDir = path.join(dir, 'src');

  if (!fs.existsSync(srcDir)) {
    return files;
  }

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(srcDir);
  return files;
}

function extractImports(files) {
  const imports = new Set();
  const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
  }

  return imports;
}

function getPackageName(importPath) {
  // Handle scoped packages
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    return parts.slice(0, 2).join('/');
  }

  // Handle regular packages
  return importPath.split('/')[0];
}

function isNodeBuiltin(packageName) {
  const builtins = [
    'fs',
    'path',
    'http',
    'https',
    'crypto',
    'os',
    'util',
    'stream',
    'child_process',
    'cluster',
    'events',
    'buffer',
    'querystring',
    'url',
    'assert',
    'process',
    'console',
    'module',
    'require',
  ];
  return builtins.includes(packageName);
}

// Run if called directly
if (require.main === module) {
  checkDependencies();
}

module.exports = { checkDependencies };
