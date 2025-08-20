#!/usr/bin/env node

/**
 * Fix dependency issues in pnpm workspace with Nx monorepo
 * 
 * Best practices:
 * 1. Dependencies should be hoisted to root package.json
 * 2. Sub-packages can use "*" version to reference root dependencies
 * 3. Internal packages should use "workspace:*" protocol
 * 4. peerDependencies are acceptable in library packages
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// Packages that should have their own package.json
const PACKAGE_LOCATIONS = [
  'apps/admin',
  'apps/docs',
  'packages/clients',
  'packages/contracts',
  'packages/dev-servers',
  'packages/eslint-config',
  'packages/fixtures',
  'packages/supabase-types',
  'packages/theme',
  'packages/unified-spreadsheet',
  'packages/standards-cli',
  'scripts',
  'tools/sheet-sync',
  'tools/typescript/rdf-converters',
];

// Read root package.json
const rootPkgPath = path.join(WORKSPACE_ROOT, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

// Get all dependencies from root
const rootDeps = {
  ...rootPkg.dependencies,
  ...rootPkg.devDependencies,
};

console.log('🔍 Analyzing dependencies in pnpm workspace...\n');

const issues = [];
const recommendations = [];

// Analyze each package
PACKAGE_LOCATIONS.forEach(location => {
  const pkgPath = path.join(WORKSPACE_ROOT, location, 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    console.log(`⚠️  Package.json not found: ${location}`);
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(`📦 ${pkg.name || location}`);
  
  // Check dependencies
  if (pkg.dependencies) {
    Object.entries(pkg.dependencies).forEach(([dep, version]) => {
      // Skip workspace dependencies
      if (version.startsWith('workspace:')) {
        console.log(`  ✅ Internal dependency: ${dep} -> ${version}`);
        return;
      }
      
      // Check if dependency exists in root
      if (rootDeps[dep]) {
        if (version !== '*' && version !== rootDeps[dep]) {
          issues.push({
            package: pkg.name || location,
            dependency: dep,
            localVersion: version,
            rootVersion: rootDeps[dep],
            type: 'version-mismatch'
          });
          console.log(`  ❌ Version mismatch: ${dep} (local: ${version}, root: ${rootDeps[dep]})`);
          recommendations.push(`In ${location}/package.json, change "${dep}": "${version}" to "${dep}": "*"`);
        } else if (version === '*') {
          console.log(`  ✅ Correctly hoisted: ${dep} -> *`);
        }
      } else {
        issues.push({
          package: pkg.name || location,
          dependency: dep,
          localVersion: version,
          type: 'not-hoisted'
        });
        console.log(`  ⚠️  Not in root: ${dep} -> ${version}`);
        recommendations.push(`Add "${dep}": "${version}" to root package.json dependencies`);
      }
    });
  }
  
  // Check devDependencies
  if (pkg.devDependencies) {
    Object.entries(pkg.devDependencies).forEach(([dep, version]) => {
      // Skip workspace dependencies
      if (version.startsWith('workspace:')) {
        console.log(`  ✅ Internal dev dependency: ${dep} -> ${version}`);
        return;
      }
      
      // Check if dependency exists in root
      if (rootDeps[dep]) {
        if (version !== '*' && version !== rootDeps[dep]) {
          issues.push({
            package: pkg.name || location,
            dependency: dep,
            localVersion: version,
            rootVersion: rootDeps[dep],
            type: 'version-mismatch-dev'
          });
          console.log(`  ❌ Dev version mismatch: ${dep} (local: ${version}, root: ${rootDeps[dep]})`);
          recommendations.push(`In ${location}/package.json, change devDependencies "${dep}": "${version}" to "${dep}": "*"`);
        }
      } else {
        // Some dev dependencies might be package-specific, that's ok
        console.log(`  ℹ️  Package-specific dev dep: ${dep} -> ${version}`);
      }
    });
  }
  
  console.log('');
});

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Total issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n🔧 Recommendations:');
  console.log('==================');
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
  
  console.log('\n💡 To fix automatically, run:');
  console.log('pnpm run fix:dependencies:auto');
  
  console.log('\n📝 Manual fixes needed:');
  console.log('1. For packages that truly need specific versions, add them to root package.json');
  console.log('2. For internal dependencies, use "workspace:*" protocol');
  console.log('3. For shared dependencies, use "*" version in sub-packages');
}

// Check for specific MUI icons issue
console.log('\n🔍 Checking MUI icons issue specifically...');
console.log('============================================');

// Check if @refinedev/mui needs special handling
if (rootPkg.dependencies['@refinedev/mui']) {
  console.log('Found @refinedev/mui in root dependencies');
  console.log('Version:', rootPkg.dependencies['@refinedev/mui']);
  
  // Check if MUI icons is properly installed
  if (rootPkg.dependencies['@mui/icons-material']) {
    console.log('✅ @mui/icons-material is in root dependencies');
    console.log('Version:', rootPkg.dependencies['@mui/icons-material']);
    
    console.log('\n⚠️  The issue with @mui/icons-material/esm/* imports is likely due to:');
    console.log('1. @refinedev/mui expecting a different version or structure');
    console.log('2. Missing ESM exports in the installed version');
    console.log('\nPossible solutions:');
    console.log('1. Check if @mui/icons-material version is compatible with @refinedev/mui');
    console.log('2. Try clearing node_modules and reinstalling: pnpm fresh');
    console.log('3. Add explicit overrides in root package.json pnpm section');
  }
}

process.exit(issues.length > 0 ? 1 : 0);