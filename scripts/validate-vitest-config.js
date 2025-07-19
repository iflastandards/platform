#!/usr/bin/env node

/**
 * Validates that all project.json files use the correct vitest configuration
 * to prevent hanging issues in CI/NX environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating vitest configuration in project.json files...\n');

// Find all project.json files
const projectFiles = execSync('find . -name "project.json" -not -path "*/node_modules/*" -not -path "*/.nx/*"', {
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);

let issues = [];
let validated = 0;

projectFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const projectJson = JSON.parse(content);
    
    // Check all targets for vitest executor
    Object.entries(projectJson.targets || {}).forEach(([targetName, target]) => {
      if (target.executor === '@nx/vite:test') {
        validated++;
        const config = target.options?.config;
        
        // Check for problematic vite.config.ts usage
        if (config && config.includes('vite.config.ts')) {
          // Exception for projects with their own configs
          const projectDir = path.dirname(file);
          const localViteConfig = path.join(projectDir, 'vite.config.ts');
          
          if (!fs.existsSync(localViteConfig) || config.includes('{workspaceRoot}')) {
            issues.push({
              file,
              target: targetName,
              config,
              issue: 'Using vite.config.ts instead of vitest.config.nx.ts'
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error reading ${file}: ${error.message}`);
  }
});

// Report results
console.log(`✅ Validated ${validated} test targets across ${projectFiles.length} projects\n`);

if (issues.length > 0) {
  console.log('⚠️  Found configuration issues:\n');
  issues.forEach(issue => {
    console.log(`📁 ${issue.file}`);
    console.log(`   Target: ${issue.target}`);
    console.log(`   Config: ${issue.config}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Fix: Change to "{workspaceRoot}/vitest.config.nx.ts"\n`);
  });
  
  console.log(`\n💡 To fix all issues, run:`);
  console.log(`   find . -name "project.json" -exec sed -i '' 's/"vite.config.ts"/"vitest.config.nx.ts"/g' {} \\;`);
  
  process.exit(1);
} else {
  console.log('🎉 All projects are using the correct vitest configuration!');
}