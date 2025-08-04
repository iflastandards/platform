#!/usr/bin/env node

/**
 * Optimize parallelism settings across the codebase
 * Environment-aware: Conservative in CI, optimized for local development
 */

const fs = require('fs');
const path = require('path');

// Detect CI environment
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Optimal parallelism settings for different operations
const PARALLELISM_CONFIG = isCI ? {
  // CI settings - Conservative for GitHub Actions (2 vCPUs, 7GB RAM)
  build: 3,
  test: 4,
  lint: 4,
  typecheck: 3,
  comprehensive: 3,
  ci: 3,
  affected: 3,
} : {
  // Local settings - Optimized for 16-core machine (12 performance + 4 efficiency)
  build: 8,
  test: 10,
  lint: 10,
  typecheck: 8,
  comprehensive: 8,
  ci: 8,
  affected: 8,
};

console.log(`🚀 Optimizing parallelism settings for ${isCI ? 'CI environment' : '16-core machine'}...\n`);

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let updates = 0;

// Update scripts
Object.entries(packageJson.scripts).forEach(([name, script]) => {
  let updatedScript = script;
  
  // Match --parallel=N patterns
  const parallelMatches = script.match(/--parallel=(\d+)/g);
  
  if (parallelMatches) {
    parallelMatches.forEach(match => {
      const currentValue = parseInt(match.split('=')[1]);
      let optimalValue = PARALLELISM_CONFIG.affected; // default
      
      // Determine optimal value based on operation type
      if (name.includes('build')) {
        optimalValue = PARALLELISM_CONFIG.build;
      } else if (name.includes('test')) {
        optimalValue = PARALLELISM_CONFIG.test;
      } else if (name.includes('lint')) {
        optimalValue = PARALLELISM_CONFIG.lint;
      } else if (name.includes('typecheck')) {
        optimalValue = PARALLELISM_CONFIG.typecheck;
      } else if (name.includes('comprehensive')) {
        optimalValue = PARALLELISM_CONFIG.comprehensive;
      } else if (name.includes('ci')) {
        optimalValue = PARALLELISM_CONFIG.ci;
      }
      
      // Special cases
      if (name.includes('sequential') || name.includes('e2e:full')) {
        optimalValue = 1; // Keep sequential operations as is
      }
      if (name.includes('e2e:integration')) {
        optimalValue = isCI ? 2 : 4; // E2E tests are resource heavy
      }
      if (name.includes('watch') || name.includes('dev')) {
        optimalValue = Math.min(optimalValue, isCI ? 3 : 6); // Leave room for dev tools
      }
      
      if (currentValue !== optimalValue) {
        updatedScript = updatedScript.replace(
          `--parallel=${currentValue}`,
          `--parallel=${optimalValue}`
        );
        updates++;
        console.log(`📝 ${name}: ${currentValue} → ${optimalValue}`);
      }
    });
    
    packageJson.scripts[name] = updatedScript;
  }
  
  // Also check for maxParallel
  if (script.includes('--maxParallel=')) {
    const maxParallelMatch = script.match(/--maxParallel=(\d+)/);
    if (maxParallelMatch) {
      const currentValue = parseInt(maxParallelMatch[1]);
      const optimalValue = PARALLELISM_CONFIG.ci;
      
      if (currentValue !== optimalValue) {
        updatedScript = updatedScript.replace(
          `--maxParallel=${currentValue}`,
          `--maxParallel=${optimalValue}`
        );
        updates++;
        console.log(`📝 ${name}: maxParallel ${currentValue} → ${optimalValue}`);
        packageJson.scripts[name] = updatedScript;
      }
    }
  }
});

// Write updated package.json
if (updates > 0) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`\n✅ Updated ${updates} parallelism settings in package.json`);
} else {
  console.log('✅ All parallelism settings are already optimal!');
}

// Update nx.json if it exists
const nxJsonPath = path.join(process.cwd(), 'nx.json');
if (fs.existsSync(nxJsonPath)) {
  const nxJson = JSON.parse(fs.readFileSync(nxJsonPath, 'utf8'));
  
  // Update default parallel setting
  if (!nxJson.tasksRunnerOptions) {
    nxJson.tasksRunnerOptions = {};
  }
  if (!nxJson.tasksRunnerOptions.default) {
    nxJson.tasksRunnerOptions.default = {};
  }
  if (!nxJson.tasksRunnerOptions.default.options) {
    nxJson.tasksRunnerOptions.default.options = {};
  }
  
  const currentParallel = nxJson.tasksRunnerOptions.default.options.parallel || 3;
  if (currentParallel !== PARALLELISM_CONFIG.affected) {
    nxJson.tasksRunnerOptions.default.options.parallel = PARALLELISM_CONFIG.affected;
    fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2) + '\n');
    console.log(`\n📝 Updated nx.json default parallel: ${currentParallel} → ${PARALLELISM_CONFIG.affected}`);
  }
}

// Create or update environment-specific file
const envFileName = isCI ? '.env.ci' : '.env.local';
const envPath = path.join(process.cwd(), envFileName);
const envContent = `# Nx Performance Configuration
# ${isCI ? 'CI Environment (GitHub Actions)' : 'Local Development (16-core machine)'}

# Parallel execution
NX_PARALLEL=${PARALLELISM_CONFIG.affected}
NX_TASKS_RUNNER_DEFAULT_OPTIONS_MAX_PARALLEL=${PARALLELISM_CONFIG.affected}

# Nx Cloud distributed execution
NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT=${PARALLELISM_CONFIG.ci}

# Daemon process (improves command startup time)
NX_DAEMON=${isCI ? 'false' : 'true'}

# Cache settings
NX_CACHE_DIRECTORY=.nx/cache
NX_CACHE_DEFAULT_TIMEOUT=3600

# Performance optimizations
NX_PERF_LOGGING=false
NX_VERBOSE_LOGGING=false

# Environment marker
NX_ENVIRONMENT=${isCI ? 'ci' : 'local'}
`;

fs.writeFileSync(envPath, envContent);
console.log(`\n📝 Created/updated ${envFileName} with optimal settings`);

console.log('\n🎯 Optimization complete!');
console.log('\nRecommended next steps:');
if (!isCI) {
  console.log(`1. Run "source ${envFileName}" to apply environment variables`);
  console.log('2. Restart Nx daemon: "pnpm nx:daemon:stop && pnpm nx:daemon:start"');
  console.log('3. Test builds with: "pnpm build:all"');
} else {
  console.log('1. Environment variables are optimized for CI');
  console.log('2. No daemon restart needed in CI');
}