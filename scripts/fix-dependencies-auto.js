#!/usr/bin/env node

/**
 * Automatically fix dependency versions in pnpm workspace
 * Changes versioned dependencies to "*" when they exist in root
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

console.log('🔧 Automatically fixing dependency versions...\n');

let totalFixed = 0;
let packagesModified = [];

// Fix each package
PACKAGE_LOCATIONS.forEach(location => {
  const pkgPath = path.join(WORKSPACE_ROOT, location, 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let modified = false;
  let fixes = [];
  
  // Fix dependencies
  if (pkg.dependencies) {
    Object.entries(pkg.dependencies).forEach(([dep, version]) => {
      // Skip workspace dependencies
      if (version.startsWith('workspace:')) {
        return;
      }
      
      // If dependency exists in root and version is not "*", fix it
      if (rootDeps[dep] && version !== '*') {
        pkg.dependencies[dep] = '*';
        modified = true;
        totalFixed++;
        fixes.push(`  dependencies["${dep}"]: "${version}" → "*"`);
      }
    });
  }
  
  // Fix devDependencies
  if (pkg.devDependencies) {
    Object.entries(pkg.devDependencies).forEach(([dep, version]) => {
      // Skip workspace dependencies
      if (version.startsWith('workspace:')) {
        return;
      }
      
      // If dependency exists in root and version is not "*", fix it
      if (rootDeps[dep] && version !== '*') {
        pkg.devDependencies[dep] = '*';
        modified = true;
        totalFixed++;
        fixes.push(`  devDependencies["${dep}"]: "${version}" → "*"`);
      }
    });
  }
  
  if (modified) {
    // Write the fixed package.json
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    packagesModified.push(location);
    console.log(`✅ Fixed ${location}/package.json:`);
    fixes.forEach(fix => console.log(fix));
    console.log('');
  }
});

// Add missing dependencies to root
console.log('\n📝 Dependencies that should be added to root package.json:');
console.log('=========================================================\n');

const missingInRoot = new Set();

PACKAGE_LOCATIONS.forEach(location => {
  const pkgPath = path.join(WORKSPACE_ROOT, location, 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Check dependencies
  if (pkg.dependencies) {
    Object.entries(pkg.dependencies).forEach(([dep, version]) => {
      if (!version.startsWith('workspace:') && !rootDeps[dep]) {
        missingInRoot.add(`"${dep}": "${version}"`);
      }
    });
  }
});

if (missingInRoot.size > 0) {
  console.log('Add these to the root package.json dependencies section:');
  Array.from(missingInRoot).forEach(dep => {
    console.log(`  ${dep}`);
  });
}

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Total fixes applied: ${totalFixed}`);
console.log(`Packages modified: ${packagesModified.length}`);

if (packagesModified.length > 0) {
  console.log('\nModified packages:');
  packagesModified.forEach(pkg => console.log(`  - ${pkg}`));
  
  console.log('\n✅ Dependencies fixed! Now run:');
  console.log('1. pnpm install');
  console.log('2. pnpm nx reset');
  console.log('3. Test your builds');
}

process.exit(0);