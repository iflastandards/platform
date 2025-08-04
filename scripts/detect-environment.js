#!/usr/bin/env node

/**
 * Environment detection script for CI/local optimization
 * Automatically configures Nx settings based on environment capabilities
 */

const { execSync } = require('child_process');
const fs = require('fs');

function detectEnvironment() {
  const isCI = !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.BUILDKITE ||
    process.env.JENKINS_URL
  );

  const isGitHubActions = !!process.env.GITHUB_ACTIONS;
  const isLocal = !isCI;

  return { isCI, isGitHubActions, isLocal };
}

function detectSystemSpecs() {
  try {
    let cpuInfo, memInfo;
    
    if (process.platform === 'darwin') {
      // macOS
      cpuInfo = execSync('sysctl -n hw.ncpu', { encoding: 'utf8' }).trim();
      memInfo = execSync('sysctl -n hw.memsize', { encoding: 'utf8' }).trim();
      const memGB = Math.round(parseInt(memInfo) / (1024 * 1024 * 1024));
      return { cores: parseInt(cpuInfo), memoryGB: memGB };
    } else if (process.platform === 'linux') {
      // Linux (including CI)
      cpuInfo = execSync('nproc', { encoding: 'utf8' }).trim();
      memInfo = execSync("free -b | awk '/^Mem:/{print $2}'", { encoding: 'utf8' }).trim();
      const memGB = Math.round(parseInt(memInfo) / (1024 * 1024 * 1024));
      return { cores: parseInt(cpuInfo), memoryGB: memGB };
    } else {
      // Windows or unknown
      const os = require('os');
      return { cores: os.cpus().length, memoryGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)) };
    }
  } catch (error) {
    console.log('⚠️  Could not detect system specs, using safe defaults');
    return { cores: 2, memoryGB: 4 }; // Safe defaults for CI
  }
}

function calculateOptimalSettings(specs, env) {
  let parallel, nodeMemoryMB, nxDaemonMemoryGB;

  if (env.isCI) {
    // Conservative settings for CI environments
    parallel = Math.min(Math.floor(specs.cores * 0.5), 4); // Use 50% of cores, max 4
    nodeMemoryMB = Math.min(Math.floor(specs.memoryGB * 1024 * 0.2), 2048); // 20% of RAM per process, max 2GB
    nxDaemonMemoryGB = Math.min(Math.floor(specs.memoryGB * 0.3), 4); // 30% of RAM for daemon, max 4GB
  } else {
    // Aggressive settings for local high-performance machines
    parallel = Math.min(Math.floor(specs.cores * 0.75), 12); // Use 75% of cores, max 12
    nodeMemoryMB = Math.min(Math.floor(specs.memoryGB * 1024 * 0.125), 8192); // 12.5% of RAM per process, max 8GB
    nxDaemonMemoryGB = Math.min(Math.floor(specs.memoryGB * 0.25), 16); // 25% of RAM for daemon, max 16GB
  }

  // Ensure minimum viable settings
  parallel = Math.max(parallel, 1);
  nodeMemoryMB = Math.max(nodeMemoryMB, 512);
  nxDaemonMemoryGB = Math.max(nxDaemonMemoryGB, 1);

  return { parallel, nodeMemoryMB, nxDaemonMemoryGB };
}

function main() {
  console.log('🔍 Detecting environment and system capabilities...\n');

  const env = detectEnvironment();
  const specs = detectSystemSpecs();
  const settings = calculateOptimalSettings(specs, env);

  console.log(`🌍 Environment: ${env.isCI ? 'CI' : 'Local'} ${env.isGitHubActions ? '(GitHub Actions)' : ''}`);
  console.log(`💻 System specs: ${specs.cores} cores, ${specs.memoryGB}GB RAM`);
  console.log(`⚙️  Optimal settings: ${settings.parallel} parallel, ${settings.nodeMemoryMB}MB node memory, ${settings.nxDaemonMemoryGB}GB daemon memory\n`);

  // Output settings for use by other scripts
  const output = {
    environment: env,
    specs,
    settings,
    timestamp: new Date().toISOString()
  };

  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) {
  main();
}

module.exports = { detectEnvironment, detectSystemSpecs, calculateOptimalSettings };