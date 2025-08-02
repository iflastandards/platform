#!/usr/bin/env node

/**
 * TypeScript diagnostics script to identify flaky typecheck issues
 * Helps identify configuration problems and environmental factors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TypeScript Diagnostics - Identifying Configuration Issues\n');

const diagnostics = {
  environment: {},
  configuration: {},
  cache: {},
  dependencies: {},
  issues: []
};

// Check environment
console.log('📋 Checking environment...');
diagnostics.environment = {
  nodeVersion: process.version,
  platform: process.platform,
  ci: process.env.CI === 'true',
  nxDaemon: false,
  pnpmVersion: 'unknown',
  typescriptVersion: 'unknown'
};

try {
  diagnostics.environment.pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
} catch (e) {
  diagnostics.issues.push('Unable to determine pnpm version');
}

try {
  diagnostics.environment.typescriptVersion = execSync('pnpm tsc --version', { encoding: 'utf8' }).trim();
} catch (e) {
  diagnostics.issues.push('Unable to determine TypeScript version');
}

try {
  const daemonStatus = execSync('pnpm nx daemon --status', { encoding: 'utf8' });
  diagnostics.environment.nxDaemon = daemonStatus.includes('running');
} catch (e) {
  diagnostics.issues.push('Unable to check Nx daemon status');
}

// Check for build artifacts
console.log('📦 Checking build artifacts...');
diagnostics.cache = {
  tsBuildInfo: [],
  nxCache: false,
  nodeModulesCache: false,
  distFolders: []
};

try {
  const buildInfoFiles = execSync('find . -name "tsconfig.tsbuildinfo" -type f -not -path "./node_modules/*" 2>/dev/null', {
    encoding: 'utf8'
  }).trim().split('\n').filter(Boolean);
  diagnostics.cache.tsBuildInfo = buildInfoFiles;
  if (buildInfoFiles.length > 0) {
    diagnostics.issues.push(`Found ${buildInfoFiles.length} .tsbuildinfo files that may cause cache issues`);
  }
} catch (e) {
  // No build info files found
}

diagnostics.cache.nodeModulesCache = fs.existsSync(path.join(process.cwd(), 'node_modules', '.cache'));
if (diagnostics.cache.nodeModulesCache) {
  diagnostics.issues.push('node_modules/.cache exists and may contain stale data');
}

diagnostics.cache.nxCache = fs.existsSync(path.join(process.cwd(), '.nx', 'cache'));

try {
  const distFolders = execSync('find . -name "dist" -type d -not -path "./node_modules/*" 2>/dev/null | head -20', {
    encoding: 'utf8'
  }).trim().split('\n').filter(Boolean);
  diagnostics.cache.distFolders = distFolders;
} catch (e) {
  // No dist folders found
}

// Check TypeScript configurations
console.log('⚙️  Checking TypeScript configurations...');
diagnostics.configuration = {
  rootTsConfig: false,
  projectTsConfigs: [],
  inconsistentVersions: false,
  projectReferences: false
};

const rootTsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(rootTsConfigPath)) {
  diagnostics.configuration.rootTsConfig = true;
  try {
    const rootConfig = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf8'));
    diagnostics.configuration.projectReferences = !!rootConfig.references;
  } catch (e) {
    diagnostics.issues.push('Unable to parse root tsconfig.json');
  }
}

// Check for multiple TypeScript versions
try {
  const tsVersions = execSync('find . -path "*/node_modules/typescript/package.json" -exec grep \'"version":\' {} \\; 2>/dev/null | sort | uniq', {
    encoding: 'utf8'
  }).trim().split('\n').filter(Boolean);
  
  if (tsVersions.length > 1) {
    diagnostics.configuration.inconsistentVersions = true;
    diagnostics.issues.push('Multiple TypeScript versions detected in node_modules');
  }
} catch (e) {
  // Unable to check TypeScript versions
}

// Check Nx configuration
console.log('🔧 Checking Nx configuration...');
const nxJsonPath = path.join(process.cwd(), 'nx.json');
if (fs.existsSync(nxJsonPath)) {
  try {
    const nxConfig = JSON.parse(fs.readFileSync(nxJsonPath, 'utf8'));
    const typecheckTarget = nxConfig.targetDefaults?.typecheck;
    
    if (typecheckTarget) {
      if (typecheckTarget.cache !== false) {
        diagnostics.issues.push('typecheck target has caching enabled in nx.json - consider disabling for reliability');
      }
      if (!typecheckTarget.outputs || typecheckTarget.outputs.length === 0) {
        diagnostics.issues.push('typecheck target has no outputs defined - Nx cannot properly cache');
      }
    }
  } catch (e) {
    diagnostics.issues.push('Unable to parse nx.json');
  }
}

// Check for common issues
console.log('🔎 Checking for common issues...');

// Check for cyclic dependencies
try {
  console.log('  - Checking for circular dependencies...');
  const graphOutput = execSync('pnpm nx graph --file=output.json 2>&1', { encoding: 'utf8' });
  if (fs.existsSync('output.json')) {
    fs.unlinkSync('output.json'); // Clean up
  }
  if (graphOutput.includes('circular')) {
    diagnostics.issues.push('Possible circular dependencies detected');
  }
} catch (e) {
  // Graph generation failed, skip
}

// Output diagnostics
console.log('\n📊 Diagnostic Report\n');
console.log('Environment:');
Object.entries(diagnostics.environment).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\nCache Status:');
console.log(`  Nx cache exists: ${diagnostics.cache.nxCache}`);
console.log(`  node_modules/.cache exists: ${diagnostics.cache.nodeModulesCache}`);
console.log(`  .tsbuildinfo files: ${diagnostics.cache.tsBuildInfo.length}`);
console.log(`  dist folders: ${diagnostics.cache.distFolders.length}`);

console.log('\nConfiguration:');
console.log(`  Root tsconfig.json: ${diagnostics.configuration.rootTsConfig}`);
console.log(`  Project references: ${diagnostics.configuration.projectReferences}`);
console.log(`  Inconsistent TS versions: ${diagnostics.configuration.inconsistentVersions}`);

if (diagnostics.issues.length > 0) {
  console.log('\n⚠️  Issues Found:');
  diagnostics.issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  console.log('  1. Run: pnpm typecheck:clean');
  console.log('  2. Add --skip-nx-cache to all typecheck commands');
  console.log('  3. Configure typecheck outputs in nx.json');
  console.log('  4. Ensure consistent TypeScript versions');
  console.log('  5. Consider disabling cache for typecheck in nx.json');
} else {
  console.log('\n✅ No major issues detected');
  console.log('\n💡 For flaky issues, try:');
  console.log('  - pnpm typecheck:clean');
  console.log('  - pnpm typecheck --skip-nx-cache');
}

// Save detailed report
const reportPath = path.join(process.cwd(), 'typecheck-diagnostic-report.json');
fs.writeFileSync(reportPath, JSON.stringify(diagnostics, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);