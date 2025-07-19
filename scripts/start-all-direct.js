#!/usr/bin/env node

/**
 * Direct start-all script that bypasses nx interception
 * This solves the recursive execution issue with pnpm start:all
 */

const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🚀 Starting all IFLA Standards services...\n');

// Step 1: Stop all running services
console.log('📍 Step 1: Stopping existing services...');
try {
  execSync('lsof -ti:3000,3001,3002,3003,3004,3005,3006,3007,3008 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
  execSync('pkill -f "docusaurus start" 2>/dev/null || true', { stdio: 'inherit' });
  console.log('✅ Existing services stopped\n');
} catch (error) {
  console.log('✅ No services to stop\n');
}

// Step 2: Build theme
console.log('📍 Step 2: Building @ifla/theme...');
try {
  execSync('nx build @ifla/theme', { stdio: 'inherit' });
  console.log('✅ Theme build completed\n');
} catch (error) {
  console.error('❌ Theme build failed:', error.message);
  process.exit(1);
}

// Step 3: Start all services with concurrently
console.log('📍 Step 3: Starting all services...\n');

const services = [
  'DOCS_ENV=local docusaurus start portal --port 3000',
  'DOCS_ENV=local docusaurus start standards/ISBDM --port 3001',
  'DOCS_ENV=local docusaurus start standards/LRM --port 3002',
  'DOCS_ENV=local docusaurus start standards/FRBR --port 3003',
  'DOCS_ENV=local docusaurus start standards/isbd --port 3004',
  'DOCS_ENV=local docusaurus start standards/muldicat --port 3005',
  'DOCS_ENV=local docusaurus start standards/unimarc --port 3006',
  'nx dev admin'
];

// Use npx to ensure we use the local concurrently
const concurrentlyCommand = `npx concurrently --prefix "[{index}]" --names "portal,isbdm,lrm,frbr,isbd,muldicat,unimarc,admin" ${services.map(s => `"${s}"`).join(' ')}`;

console.log('Running services:');
console.log('  - Portal (http://localhost:3000)');
console.log('  - ISBDM (http://localhost:3001)');
console.log('  - LRM (http://localhost:3002)');
console.log('  - FRBR (http://localhost:3003)');
console.log('  - ISBD (http://localhost:3004)');
console.log('  - Muldicat (http://localhost:3005)');
console.log('  - UNIMARC (http://localhost:3006)');
console.log('  - Admin (http://localhost:3007)\n');

// Execute concurrently
const child = spawn('sh', ['-c', concurrentlyCommand], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to start services:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n👋 All services stopped with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all services...');
  child.kill('SIGINT');
});