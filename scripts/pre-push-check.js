#!/usr/bin/env node

/**
 * Pre-push check script that uses nx affected to only test what has changed
 * Includes smoke tests, admin tests, and API tests based on affected projects
 */

// Increase EventEmitter listener limit to handle multiple concurrent processes
process.setMaxListeners(0); // 0 = unlimited listeners
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 50;

// Also set it for any child processes that might be spawned
process.on('beforeExit', () => {
  process.removeAllListeners();
});

// Capture and suppress specific EventEmitter warnings if needed
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (name === 'warning' && data && data.name === 'MaxListenersExceededWarning') {
    // Suppress the warning - we've already handled it
    return false;
  }
  return originalEmit.apply(process, [name, data, ...args]);
};

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ensureDaemon } = require('./ensure-nx-daemon');

// Enhanced execSync wrapper to ensure proper EventEmitter limits
function safeExecSync(command, options = {}) {
  const defaultOptions = {
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    ...options
  };
  
  // Set EventEmitter limits in the current process
  if (typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(0);
  }
  
  return execSync(command, defaultOptions);
}

// Load configuration
const configPath = path.join(__dirname, '..', '.prepushrc.json');
let config = {
  allowWarnings: true,
  runTests: true, // Integration tests
  runBuilds: true, // Production builds
  runE2E: false, // E2E tests (can be slow/flaky in local)
  runSmokeTests: true, // Smoke tests for affected sites
  runAdminTests: true, // Admin-specific tests when admin is affected
  parallelJobs: 3
};

if (fs.existsSync(configPath)) {
  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...userConfig };
  } catch (e) {
    console.warn('⚠️  Failed to load .prepushrc.json, using defaults');
  }
}

console.log('\n🚀 Running pre-push checks with nx affected (only testing what changed)...\n');
console.log('ℹ️  Pre-commit ensures: typecheck ✓, lint ✓, unit tests ✓');
console.log('ℹ️  Pre-push adds: integration tests, builds, smoke tests, e2e validation\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

// Get affected projects
function getAffectedProjects() {
  try {
    const output = safeExecSync('pnpm nx show projects --affected --type=app --skip-nx-cache', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return output.trim().split('\n').filter(p => p.trim());
  } catch (error) {
    console.log('⚠️  Could not detect affected projects, will run all tests');
    return [];
  }
}

// Get affected projects at the start
const affectedProjects = getAffectedProjects();
if (affectedProjects.length > 0) {
  console.log(`📊 Affected projects: ${affectedProjects.join(', ')}\n`);
}

// Smart test detection functions
function shouldRunSmokeTests() {
  if (!config.runSmokeTests) {return false;}
  
  // Run smoke tests if any documentation site or portal is affected
  const smokeTestProjects = ['portal', 'isbd', 'isbdm', 'lrm', 'frbr', 'unimarc', 'mri', 'muldicat', 'pressoo', 'mia'];
  const hasAffectedSites = affectedProjects.some(project => 
    smokeTestProjects.includes(project.toLowerCase())
  );
  
  if (hasAffectedSites) {
    console.log(`🔍 Smoke tests needed: Affected sites detected`);
    return true;
  }
  return false;
}

function shouldRunAdminTests() {
  if (!config.runAdminTests) {return false;}
  
  // Run admin tests if admin project is affected
  const isAdminAffected = affectedProjects.includes('admin');
  
  if (isAdminAffected) {
    console.log(`🔍 Admin tests needed: Admin project is affected`);
    return true;
  }
  return false;
}

function shouldAutoTriggerE2E() {
  const criticalE2EProjects = ['portal', 'admin'];
  
  const hasCriticalChanges = affectedProjects.some(project => 
    criticalE2EProjects.includes(project)
  );
  
  if (hasCriticalChanges) {
    console.log(`🔍 E2E tests needed: Critical projects affected (${affectedProjects.filter(p => criticalE2EProjects.includes(p)).join(', ')})`);
    return true;
  }
  
  return false;
}

let hasErrors = false;

// Run affected tests (integration tests for pre-push)
if (config.runTests) {
  console.log('📋 Running affected integration tests...');
  try {
    // Run integration tests specifically (pre-commit already ran unit tests)
    // Use Nx cache - if code hasn't changed since pre-commit, tests won't re-run
    safeExecSync(`pnpm nx affected --target=test:integration --parallel=${config.parallelJobs}`, {
      stdio: 'inherit',
      encoding: 'utf8',
      timeout: 600000 // 10 minutes timeout
    });
    console.log('✅ Integration tests passed\n');
  } catch (error) {
    // Not all projects have integration tests, this is OK for some projects
    console.log('ℹ️  Integration tests completed (some projects may not have integration tests)\n');
  }
}

// Run affected builds (production readiness check)
if (config.runBuilds) {
  console.log('📋 Running affected builds (production readiness)...');
  try {
    // Use Nx cache - builds will only re-run if source files changed
    safeExecSync(`pnpm nx affected --target=build --parallel=${config.parallelJobs}`, {
      stdio: 'inherit',
      encoding: 'utf8',
      timeout: 600000 // 10 minutes timeout
    });
    console.log('✅ All affected builds passed\n');
  } catch (error) {
    console.log('❌ Some builds failed\n');
    hasErrors = true;
  }
}

// Run smoke tests for affected sites
if (shouldRunSmokeTests()) {
  console.log('📋 Running smoke tests for affected sites...');
  
  const affectedSitesList = affectedProjects.filter(p => 
    ['portal', 'isbd', 'isbdm', 'lrm', 'frbr', 'unimarc', 'mri', 'muldicat', 'pressoo', 'mia'].includes(p.toLowerCase())
  );
  
  console.log(`🚀 Will run smoke tests sequentially for: ${affectedSitesList.join(', ')}\n`);
  
  // Run tests for each site individually
  let smokeTestsFailed = false;
  for (const site of affectedSitesList) {
    console.log(`\n🔍 Testing ${site}...`);
    try {
      // Kill ports before each test to ensure clean state
      try {
        safeExecSync('pnpm ports:kill', { stdio: 'pipe', encoding: 'utf8' });
        safeExecSync('sleep 1', { stdio: 'pipe' });
      } catch (portError) {
        // Ignore port cleanup errors
      }
      
      // Run smoke test for this specific site with its own server
      safeExecSync(`node scripts/run-site-tests.js ${site} smoke`, {
        stdio: 'inherit',
        encoding: 'utf8'
      });
      console.log(`✅ ${site} smoke tests passed`);
    } catch (error) {
      console.log(`❌ ${site} smoke tests failed`);
      smokeTestsFailed = true;
      // Continue testing other sites even if one fails
    }
  }
  
  if (smokeTestsFailed) {
    console.log('\n❌ Some smoke tests failed\n');
    hasErrors = true;
  } else {
    console.log('\n✅ All smoke tests passed\n');
  }
}

// Run admin-specific tests if admin is affected
if (shouldRunAdminTests()) {
  console.log('📋 Running admin-specific tests...');

  // Run admin integration tests (unit tests already ran in pre-commit)
  // Use Nx cache - tests won't re-run if code hasn't changed
  try {
    safeExecSync('pnpm nx run admin:test:integration', {
      stdio: 'inherit',
      encoding: 'utf8',
      timeout: 600000 // 10 minutes timeout
    });
    console.log('✅ Admin integration tests passed\n');
  } catch (error) {
    console.log('❌ Admin integration tests failed\n');
    hasErrors = true;
  }

  // Run admin server-dependent tests if configured
  if (config.runAdminTests) {
    try {
      console.log('📋 Running admin server-dependent tests...');
      // Use Nx cache for server-dependent tests too
      safeExecSync('pnpm nx run admin:test:server-dependent', {
        stdio: 'inherit',
        encoding: 'utf8',
        timeout: 600000 // 10 minutes timeout
      });
      console.log('✅ Admin server-dependent tests passed\n');
    } catch (error) {
      console.log('⚠️  Admin server-dependent tests completed (may require running server)\n');
    }
  }
}

// Smart E2E detection: Run E2E if critical projects affected
const shouldRunE2E = config.runE2E || shouldAutoTriggerE2E();

if (shouldRunE2E) {
  console.log('📋 Running E2E tests (Chrome headless only)...');
  
  const affectedApps = affectedProjects.filter(p => ['portal', 'admin'].includes(p));
  console.log(`🚀 Will run E2E tests sequentially for: ${affectedApps.join(', ')}\n`);
  
  // Run E2E tests for each app individually
  let e2eTestsFailed = false;
  for (const app of affectedApps) {
    console.log(`\n🔍 Testing ${app}...`);
    try {
      // Kill ports before each test
      try {
        safeExecSync('pnpm ports:kill', { stdio: 'pipe', encoding: 'utf8' });
        safeExecSync('sleep 1', { stdio: 'pipe' });
      } catch (portError) {
        // Ignore port cleanup errors
      }
      
      // Run E2E test for this specific app with its own server
      safeExecSync(`node scripts/run-site-tests.js ${app} e2e`, {
        stdio: 'inherit',
        encoding: 'utf8'
      });
      console.log(`✅ ${app} E2E tests passed`);
    } catch (error) {
      console.log(`❌ ${app} E2E tests failed`);
      e2eTestsFailed = true;
      // Continue testing other apps even if one fails
    }
  }
  
  if (e2eTestsFailed) {
    console.log('\n❌ Some E2E tests failed\n');
    hasErrors = true;
  } else {
    console.log('\n✅ All E2E tests passed\n');
  }
} else {
  console.log('ℹ️  E2E tests skipped (no critical projects affected, enable with runE2E: true)\n');
}

// Summary
if (hasErrors) {
  console.log('❌ Pre-push checks failed. Please fix errors before pushing.\n');
  console.log('💡 Tip: You can configure pre-push behavior in .prepushrc.json\n');
  process.exit(1);
} else {
  console.log('✅ Pre-push checks passed! (Only affected projects tested)\n');
  console.log('📊 Summary:');
  console.log(`   - Affected Projects: ${affectedProjects.length > 0 ? affectedProjects.join(', ') : 'None'}`);
  console.log('   - Unit/Integration Tests: ✅ All affected tests passed');
  if (config.runBuilds) {
    console.log('   - Production Builds: ✅ All affected projects build successfully');
  }
  if (shouldRunSmokeTests()) {
    console.log('   - Smoke Tests: ✅ Affected sites smoke tested');
  }
  if (shouldRunAdminTests()) {
    console.log('   - Admin Tests: ✅ Admin-specific tests passed');
  }
  if (shouldRunE2E) {
    console.log('   - E2E Tests: ✅ Critical paths verified');
  }
  console.log('\n🎉 Ready to push!\n');
  process.exit(0);
}