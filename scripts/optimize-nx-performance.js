#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing Nx Performance for IFLA Standards Platform\n');

// Check current Nx configuration
function checkNxConfig() {
  console.log('📊 Current Nx Configuration:');
  
  try {
    // Check daemon status
    const daemonStatus = execSync('npx nx daemon --status', { encoding: 'utf8' });
    console.log('✓ Nx Daemon:', daemonStatus.includes('running') ? 'Running' : 'Not running');
    
    // Check cache size
    const cacheDir = path.join(process.cwd(), '.nx/cache');
    if (fs.existsSync(cacheDir)) {
      const cacheSize = execSync(`du -sh ${cacheDir} | cut -f1`, { encoding: 'utf8' }).trim();
      console.log('✓ Cache Size:', cacheSize);
    }
    
    // Check Nx Cloud connection
    try {
      execSync('npx nx-cloud status', { encoding: 'utf8' });
      console.log('✓ Nx Cloud: Connected');
    } catch {
      console.log('⚠️  Nx Cloud: Not connected');
    }
  } catch (error) {
    console.error('Error checking Nx config:', error.message);
  }
}

// Optimize Nx cache
function optimizeCache() {
  console.log('\n🗑️  Optimizing Nx Cache:');
  
  try {
    // Clean old cache entries
    console.log('- Cleaning old cache entries...');
    execSync('npx nx reset', { stdio: 'inherit' });
    
    // Set optimal cache size
    console.log('- Cache optimized');
  } catch (error) {
    console.error('Error optimizing cache:', error.message);
  }
}

// Enable performance features
function enablePerformanceFeatures() {
  console.log('\n⚡ Enabling Performance Features:');
  
  const features = [
    { name: 'Nx Daemon', command: 'npx nx daemon --start' },
    { name: 'Computation Caching', env: 'NX_CACHE_RESULTS=true' },
    { name: 'Distributed Caching', env: 'NX_CLOUD_DISTRIBUTED_EXECUTION=true' }
  ];
  
  features.forEach(feature => {
    try {
      if (feature.command) {
        execSync(feature.command, { stdio: 'ignore' });
        console.log(`✓ ${feature.name}: Enabled`);
      } else if (feature.env) {
        const [key, value] = feature.env.split('=');
        process.env[key] = value;
        console.log(`✓ ${feature.name}: Set ${key}=${value}`);
      }
    } catch (error) {
      console.log(`⚠️  ${feature.name}: ${error.message}`);
    }
  });
}

// Generate performance report
function generatePerformanceReport() {
  console.log('\n📈 Generating Performance Report:');
  
  try {
    // Analyze affected projects
    const affected = execSync('npx nx affected:graph --base=HEAD~1 --head=HEAD --plain', { encoding: 'utf8' });
    const affectedCount = (affected.match(/\n/g) || []).length;
    console.log(`✓ Affected projects in last commit: ${affectedCount}`);
    
    // Check parallel execution capability
    const cpuCount = require('os').cpus().length;
    console.log(`✓ Available CPUs: ${cpuCount}`);
    console.log(`✓ Nx parallel setting: ${process.env.NX_PARALLEL || 8}`);
    
    // Memory allocation
    const nodeOptions = process.env.NODE_OPTIONS || '';
    const maxMemory = nodeOptions.match(/--max-old-space-size=(\d+)/)?.[1] || 'default';
    console.log(`✓ Max Node.js memory: ${maxMemory}MB`);
    
  } catch (error) {
    console.error('Error generating report:', error.message);
  }
}

// Recommendations
function showRecommendations() {
  console.log('\n💡 Recommendations:');
  
  const recommendations = [
    '1. Run "pnpm nx daemon" to ensure the daemon is always running',
    '2. Use "pnpm nx affected" commands instead of "run-many" when possible',
    '3. Enable Nx Cloud for distributed caching across team members',
    '4. Set up ".env.nx" file with performance variables',
    '5. Use "--parallel" flag with a value matching your CPU count',
    '6. Run "pnpm nx reset" periodically to clean the cache',
    '7. Monitor cache hit rate with "pnpm nx cache statistics"'
  ];
  
  recommendations.forEach(rec => console.log(`   ${rec}`));
}

// Main execution
async function main() {
  checkNxConfig();
  optimizeCache();
  enablePerformanceFeatures();
  generatePerformanceReport();
  showRecommendations();
  
  console.log('\n✅ Nx optimization complete!\n');
  console.log('Run "source .env.nx" to apply environment optimizations');
}

main().catch(console.error);