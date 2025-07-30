#!/usr/bin/env node

/**
 * Site-oriented E2E testing with nx affected
 * Only starts servers for sites that need testing
 * 
 * Usage:
 *   node scripts/e2e-site-oriented.js              # Test affected sites only
 *   node scripts/e2e-site-oriented.js --all        # Test all sites
 *   node scripts/e2e-site-oriented.js --site admin # Test specific site
 *   node scripts/e2e-site-oriented.js --browser chrome,firefox
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Site configuration
const SITE_CONFIG = {
  portal: { port: 3000, project: 'portal', startCmd: 'portal:start:robust' },
  isbdm: { port: 3001, project: 'isbdm', startCmd: 'isbdm:start:robust' },
  lrm: { port: 3002, project: 'lrm', startCmd: 'lrm:start:robust' },
  frbr: { port: 3003, project: 'frbr', startCmd: 'frbr:start:robust' },
  isbd: { port: 3004, project: 'isbd', startCmd: 'isbd:start:robust' },
  muldicat: { port: 3005, project: 'muldicat', startCmd: 'muldicat:start:robust' },
  unimarc: { port: 3006, project: 'unimarc', startCmd: 'unimarc:start:robust' },
  newtest: { port: 3008, project: 'newtest', startCmd: 'newtest:start:robust' },
  admin: { port: 3007, project: 'admin', startCmd: 'admin:dev' }
};

const DEFAULT_BROWSERS = ['chromium', 'firefox'];

// Get affected projects using NX
function getAffectedProjects() {
  try {
    const output = execSync('npx nx print-affected --select=projects', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (!output || output.trim() === '') {
      return [];
    }
    
    return output.trim().split(',').map(p => p.trim()).filter(Boolean);
  } catch (error) {
    console.log('⚠️  Could not detect affected projects, falling back to all sites');
    return Object.keys(SITE_CONFIG);
  }
}

// Determine which sites need testing based on affected projects
function determineAffectedSites(affectedProjects) {
  const affectedSites = new Set();
  
  // Check if theme package is affected (affects all sites except admin)
  if (affectedProjects.includes('@ifla/theme')) {
    console.log('🎯 Theme package affected - all documentation sites need testing');
    Object.keys(SITE_CONFIG).filter(site => site !== 'admin').forEach(site => affectedSites.add(site));
  }
  
  // Check for directly affected sites
  affectedProjects.forEach(project => {
    const siteName = Object.keys(SITE_CONFIG).find(site => 
      SITE_CONFIG[site].project === project || site === project.toLowerCase()
    );
    if (siteName) {
      affectedSites.add(siteName);
    }
  });
  
  return Array.from(affectedSites);
}

// Start a single site server
async function startSiteServer(siteName) {
  const config = SITE_CONFIG[siteName];
  if (!config) {
    throw new Error(`Unknown site: ${siteName}`);
  }
  
  console.log(`🚀 Starting ${siteName} server on port ${config.port}`);
  
  // Kill any existing process on this port
  try {
    execSync(`lsof -ti:${config.port} | xargs kill -9`, { stdio: 'ignore' });
  } catch (e) {
    // Port might not be in use, that's fine
  }
  
  // Start the server
  const serverProcess = spawn('pnpm', ['nx', 'run', config.startCmd], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  // Wait for server to be ready
  await waitForServer(config.port, siteName);
  
  return serverProcess;
}

// Wait for server to be ready
function waitForServer(port, siteName, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkServer = () => {
      const { execSync } = require('child_process');
      try {
        execSync(`curl -f http://localhost:${port} > /dev/null 2>&1`);
        console.log(`✅ Server for ${siteName} is ready on port ${port}`);
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for ${siteName} server on port ${port}`));
        } else {
          setTimeout(checkServer, 1000);
        }
      }
    };
    
    setTimeout(checkServer, 2000); // Initial delay
  });
}

// Run e2e tests for specific sites
async function runSiteTests(sites, browsers = DEFAULT_BROWSERS) {
  const serverProcesses = [];
  
  try {
    // Start servers for affected sites
    for (const site of sites) {
      const serverProcess = await startSiteServer(site);
      serverProcesses.push({ site, process: serverProcess });
      
      // Small delay between starting servers
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Run tests for each browser
    let allTestsPassed = true;
    
    for (const browser of browsers) {
      console.log(`\n🧪 Running ${browser} tests for sites: ${sites.join(', ')}`);
      
      // Set environment variables for the test run
      const env = {
        ...process.env,
        SITES: sites.join(' '),
        BROWSER: browser
      };
      
      try {
        // Run site-specific tests
        execSync(`npx playwright test --project=${browser} e2e/site-validation-affected.spec.ts`, {
          stdio: 'inherit',
          env
        });
        
        console.log(`✅ ${browser} tests passed for sites: ${sites.join(', ')}`);
      } catch (error) {
        console.error(`❌ ${browser} tests failed for sites: ${sites.join(', ')}`);
        allTestsPassed = false;
      }
    }
    
    return allTestsPassed;
    
  } finally {
    // Clean up servers
    console.log('\n🧹 Cleaning up servers...');
    serverProcesses.forEach(({ site, process }) => {
      try {
        process.kill('SIGTERM');
        console.log(`🛑 Stopped ${site} server`);
      } catch (error) {
        console.warn(`Warning: Could not stop ${site} server:`, error.message);
      }
    });
    
    // Kill any remaining processes on the ports
    const ports = sites.map(site => SITE_CONFIG[site]?.port).filter(Boolean);
    if (ports.length > 0) {
      try {
        execSync(`lsof -ti:${ports.join(',')} | xargs kill -9`, { stdio: 'ignore' });
      } catch (e) {
        // Ports might already be clean
      }
    }
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const forceAll = args.includes('--all');
  const siteIndex = args.indexOf('--site');
  const specificSite = siteIndex !== -1 ? args[siteIndex + 1] : null;
  const browserIndex = args.indexOf('--browser');
  const browsers = browserIndex !== -1 
    ? args[browserIndex + 1].split(',').map(b => b.trim())
    : DEFAULT_BROWSERS;
  
  let sitesToTest = [];
  
  if (specificSite) {
    // Test specific site
    if (!SITE_CONFIG[specificSite]) {
      console.error(`❌ Unknown site: ${specificSite}`);
      console.log(`Available sites: ${Object.keys(SITE_CONFIG).join(', ')}`);
      process.exit(1);
    }
    sitesToTest = [specificSite];
    console.log(`🎯 Testing specific site: ${specificSite}`);
  } else if (forceAll) {
    // Test all sites
    sitesToTest = Object.keys(SITE_CONFIG);
    console.log('🏗️  Testing all sites');
  } else {
    // Test affected sites only
    console.log('🎯 Detecting affected projects using NX...');
    const affectedProjects = getAffectedProjects();
    
    if (!affectedProjects || affectedProjects.length === 0) {
      console.log('✅ No affected projects detected - no sites need testing');
      process.exit(0);
    }
    
    console.log(`📦 Affected projects: ${affectedProjects.join(', ')}`);
    sitesToTest = determineAffectedSites(affectedProjects);
    
    if (sitesToTest.length === 0) {
      console.log('✅ No site projects affected - skipping site tests');
      process.exit(0);
    }
    
    console.log(`🎯 Testing affected sites: ${sitesToTest.join(', ')}`);
  }
  
  // Run the tests
  const success = await runSiteTests(sitesToTest, browsers);
  
  if (success) {
    console.log('\n🎉 All e2e tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some e2e tests failed!');
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  execSync('pnpm ports:kill', { stdio: 'ignore' });
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  execSync('pnpm ports:kill', { stdio: 'ignore' });
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ E2E testing failed:', error);
    execSync('pnpm ports:kill', { stdio: 'ignore' });
    process.exit(1);
  });
}

module.exports = {
  getAffectedProjects,
  determineAffectedSites,
  runSiteTests,
  SITE_CONFIG
};
