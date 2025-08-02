#!/usr/bin/env node

/**
 * Fix typecheck configuration in nx.json to prevent flaky results
 * Updates the typecheck target configuration for reliability
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript Configuration for Reliability\n');

// Read nx.json
const nxJsonPath = path.join(process.cwd(), 'nx.json');
if (!fs.existsSync(nxJsonPath)) {
  console.error('❌ nx.json not found');
  process.exit(1);
}

let nxConfig;
try {
  const content = fs.readFileSync(nxJsonPath, 'utf8');
  nxConfig = JSON.parse(content);
} catch (error) {
  console.error('❌ Failed to parse nx.json:', error.message);
  process.exit(1);
}

// Backup original
const backupPath = path.join(process.cwd(), 'nx.json.backup');
fs.writeFileSync(backupPath, JSON.stringify(nxConfig, null, 2));
console.log(`📄 Backup saved to: ${backupPath}`);

// Update typecheck configuration
console.log('\n🔧 Updating typecheck configuration...');

// Ensure targetDefaults exists
if (!nxConfig.targetDefaults) {
  nxConfig.targetDefaults = {};
}

// Update typecheck target
nxConfig.targetDefaults.typecheck = {
  dependsOn: ["^build"],
  cache: false, // Disable caching for reliability
  inputs: [
    "default",
    "{projectRoot}/tsconfig.json",
    "{projectRoot}/tsconfig.*.json",
    "{workspaceRoot}/tsconfig.json",
    "{workspaceRoot}/tsconfig.base.json"
  ],
  outputs: [
    // TypeScript doesn't produce outputs for --noEmit
    // But we need to specify something for Nx
    "{workspaceRoot}/tmp/typecheck-{projectName}.done"
  ]
};

console.log('  ✅ Disabled cache for typecheck target');
console.log('  ✅ Updated inputs to include all tsconfig files');
console.log('  ✅ Added placeholder outputs for Nx tracking');

// Save updated config
try {
  fs.writeFileSync(nxJsonPath, JSON.stringify(nxConfig, null, 2) + '\n');
  console.log('\n✅ nx.json updated successfully');
} catch (error) {
  console.error('\n❌ Failed to save nx.json:', error.message);
  console.log('Restoring backup...');
  fs.copyFileSync(backupPath, nxJsonPath);
  process.exit(1);
}

// Create a marker script for typecheck completion
const markerScriptPath = path.join(process.cwd(), 'scripts', 'mark-typecheck-complete.js');
const markerScript = `#!/usr/bin/env node
// Marker script to create output file for Nx tracking
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];
if (!projectName) {
  console.error('Project name required');
  process.exit(1);
}

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const markerFile = path.join(tmpDir, \`typecheck-\${projectName}.done\`);
fs.writeFileSync(markerFile, new Date().toISOString());
`;

if (!fs.existsSync(markerScriptPath)) {
  fs.writeFileSync(markerScriptPath, markerScript);
  fs.chmodSync(markerScriptPath, '755');
  console.log(`\n📄 Created marker script: ${markerScriptPath}`);
}

console.log('\n📋 Next Steps:');
console.log('1. Update project.json files to call the marker script after typecheck');
console.log('2. Add tmp/ to .gitignore if not already present');
console.log('3. Run: pnpm typecheck:clean to test the new configuration');
console.log('4. Consider running: pnpm typecheck:diagnose to verify setup');

// Check if tmp is in .gitignore
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignore.includes('tmp/') && !gitignore.includes('/tmp')) {
    console.log('\n⚠️  Warning: tmp/ is not in .gitignore - you should add it');
  }
}

console.log('\n✅ Configuration update complete!');