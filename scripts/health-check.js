#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 IFLA Standards Platform Health Check\n');

const checks = [];

// Check Node version
try {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));
  checks.push({
    name: 'Node.js Version',
    status: major >= 18 ? '✅' : '❌',
    message: `${nodeVersion} (requires >= 18)`
  });
} catch (e) {
  checks.push({ name: 'Node.js Version', status: '❌', message: e.message });
}

// Check pnpm version
try {
  const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  const major = parseInt(pnpmVersion.split('.')[0]);
  checks.push({
    name: 'pnpm Version',
    status: major >= 9 ? '✅' : '❌',
    message: `${pnpmVersion} (requires >= 9)`
  });
} catch (e) {
  checks.push({ name: 'pnpm Version', status: '❌', message: 'Not installed' });
}

// Check Nx installation
try {
  const nxVersion = execSync('npx nx --version', { encoding: 'utf8' }).trim();
  checks.push({
    name: 'Nx Version',
    status: '✅',
    message: nxVersion
  });
} catch (e) {
  checks.push({ name: 'Nx Version', status: '❌', message: 'Not installed' });
}

// Check Nx daemon
try {
  execSync('npx nx daemon --status', { stdio: 'pipe' });
  checks.push({
    name: 'Nx Daemon',
    status: '✅',
    message: 'Running'
  });
} catch (e) {
  checks.push({ name: 'Nx Daemon', status: '⚠️', message: 'Not running (run: pnpm nx:daemon:start)' });
}

// Check Nx Cloud connection
try {
  execSync('npx nx-cloud status', { stdio: 'pipe' });
  checks.push({
    name: 'Nx Cloud',
    status: '✅',
    message: 'Connected'
  });
} catch (e) {
  checks.push({ name: 'Nx Cloud', status: '⚠️', message: 'Not connected' });
}

// Check workspace integrity
try {
  const packageJson = require('../package.json');
  const hasWorkspaces = packageJson.workspaces || fs.existsSync('pnpm-workspace.yaml');
  checks.push({
    name: 'Workspace Configuration',
    status: hasWorkspaces ? '✅' : '❌',
    message: hasWorkspaces ? 'Valid' : 'Missing workspace configuration'
  });
} catch (e) {
  checks.push({ name: 'Workspace Configuration', status: '❌', message: e.message });
}

// Check critical directories
const criticalDirs = [
  'apps/admin',
  'packages/theme',
  'standards/ISBDM',
  'portal',
  '.nx/cache'
];

criticalDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  checks.push({
    name: `Directory: ${dir}`,
    status: exists ? '✅' : '❌',
    message: exists ? 'Exists' : 'Missing'
  });
});

// Check environment files
const envFiles = ['.npmrc', 'nx.json', 'pnpm-workspace.yaml'];
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  checks.push({
    name: `Config: ${file}`,
    status: exists ? '✅' : '❌',
    message: exists ? 'Found' : 'Missing'
  });
});

// Check disk space
try {
  const diskSpace = execSync('df -h . | tail -1 | awk \'{print $4}\'', { encoding: 'utf8' }).trim();
  checks.push({
    name: 'Disk Space',
    status: '✅',
    message: `${diskSpace} available`
  });
} catch (e) {
  checks.push({ name: 'Disk Space', status: '⚠️', message: 'Could not check' });
}

// Display results
console.log('📋 System Checks:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});

// Summary
const errors = checks.filter(c => c.status === '❌').length;
const warnings = checks.filter(c => c.status === '⚠️').length;

console.log('\n📊 Summary:');
console.log(`   Total checks: ${checks.length}`);
console.log(`   ✅ Passed: ${checks.filter(c => c.status === '✅').length}`);
console.log(`   ⚠️  Warnings: ${warnings}`);
console.log(`   ❌ Failed: ${errors}`);

if (errors > 0) {
  console.log('\n❌ Health check failed! Please fix the errors above.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  Health check passed with warnings.');
} else {
  console.log('\n✅ All systems operational!');
}

// Recommendations
console.log('\n💡 Quick Commands:');
console.log('   pnpm nx:optimize     - Optimize Nx performance');
console.log('   pnpm nx:daemon:start - Start Nx daemon');
console.log('   pnpm install         - Install dependencies');
console.log('   pnpm build:all       - Build all projects');
console.log('   pnpm nx:cloud:connect - Connect to Nx Cloud');