#!/usr/bin/env tsx
/**
 * Test-aware Server Manager
 * Starts only the servers required for specific test types
 */

import { program } from 'commander';
import { startServers, shutdownServers } from '@ifla/dev-servers';
import { ServerMode, SiteKey } from '@ifla/dev-servers/src/types';

// Define test types and their required servers
const TEST_SERVER_REQUIREMENTS: Record<string, SiteKey[]> = {
  // Smoke tests
  'smoke:portal': ['portal'],
  'smoke:standards': ['isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'],
  'smoke:dashboard': ['portal'],
  'smoke:all': ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc'],
  
  // Integration tests
  'integration:admin': ['portal', 'admin'],
  'integration:cross-service': ['portal', 'isbdm', 'lrm', 'admin'],
  'integration:site-validation': ['portal', 'isbdm', 'lrm', 'frbr'],
  'integration:rbac': ['portal', 'admin'],
  'integration:all': ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc', 'admin'],
  
  // E2E tests
  'e2e:portal': ['portal'],
  'e2e:isbdm': ['isbdm'],
  'e2e:lrm': ['lrm'],
  'e2e:frbr': ['frbr'],
  'e2e:isbd': ['isbd'],
  'e2e:muldicat': ['muldicat'],
  'e2e:unimarc': ['unimarc'],
  'e2e:admin': ['admin'],
  'e2e:all': ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc', 'admin'],
  
  // Performance tests
  'performance': ['portal', 'isbdm', 'lrm'],
  
  // Visual regression tests
  'visual': ['portal', 'isbdm', 'lrm', 'frbr'],
  
  // Build validation tests
  'build-validation': ['portal', 'isbdm', 'lrm'],
  
  // Critical path tests
  'critical': ['portal', 'isbdm'],
  
  // Default fallback
  'default': ['portal', 'isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc', 'admin'],
};

interface StartOptions {
  testType: string;
  mode: ServerMode;
  reuseExisting: boolean;
  sites?: string;
  verbose: boolean;
}

interface StopOptions {
  testType?: string;
  sites?: string;
  verbose: boolean;
}

/**
 * Get required sites for a test type
 */
function getRequiredSites(testType: string): SiteKey[] {
  const sites = TEST_SERVER_REQUIREMENTS[testType];
  if (!sites) {
    console.warn(`Unknown test type "${testType}", using default server set`);
    return TEST_SERVER_REQUIREMENTS.default;
  }
  return sites;
}

/**
 * Start servers for specific test type
 */
async function startTestServers(options: StartOptions): Promise<void> {
  console.log(`🚀 Starting servers for test type: ${options.testType}`);
  
  let sites: SiteKey[];
  
  if (options.sites) {
    // Manual site specification overrides test type
    sites = options.sites.split(',').map(s => s.trim() as SiteKey);
    console.log(`📝 Using manually specified sites: ${sites.join(', ')}`);
  } else {
    // Use test type to determine required sites
    sites = getRequiredSites(options.testType);
    console.log(`🎯 Required sites for ${options.testType}: ${sites.join(', ')}`);
  }
  
  try {
    const serverInfo = await startServers({
      sites,
      mode: options.mode,
      reuseExisting: options.reuseExisting,
    });
    
    console.log(`✅ Successfully started ${Object.keys(serverInfo).length} servers`);
    
    if (options.verbose) {
      serverInfo.forEach((info) => {
        console.log(`  ${info.site}: http://localhost:${info.port} (PID: ${info.proc?.pid})`);
      });
    }
    
    // Detach from spawned processes so they can run independently
    serverInfo.forEach((info) => {
      if (info.proc && info.proc.pid) {
        // Only detach real processes, not mock ones
        if (typeof info.proc.unref === 'function') {
          // Unref the process so it doesn't keep the parent alive
          info.proc.unref();
          
          // Remove event listeners to prevent memory leaks
          info.proc.removeAllListeners();
          
          // Close stdio streams to fully detach
          if (info.proc.stdout) info.proc.stdout.destroy();
          if (info.proc.stderr) info.proc.stderr.destroy();
          if (info.proc.stdin) info.proc.stdin.destroy();
        }
        
        console.log(`🔄 Detached from ${info.site} (PID: ${info.proc.pid})`);
      }
    });
    
    console.log('🎉 Servers are running in the background!');
    console.log('💡 Use "pnpm test:servers stop" to stop them when done.');
    console.log('💡 Use "pnpm test:servers status" to check their status.');
    
    // Exit the parent process cleanly
    process.nextTick(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start servers:', error);
    process.exit(1);
  }
}

/**
 * Stop servers for specific test type
 */
async function stopTestServers(options: StopOptions): Promise<void> {
  let sites: SiteKey[] | undefined;
  
  if (options.sites) {
    // Manual site specification
    sites = options.sites.split(',').map(s => s.trim() as SiteKey);
    console.log(`🛑 Stopping manually specified sites: ${sites.join(', ')}`);
  } else if (options.testType) {
    // Use test type to determine sites to stop
    sites = getRequiredSites(options.testType);
    console.log(`🛑 Stopping servers for test type: ${options.testType}`);
    console.log(`📝 Sites to stop: ${sites.join(', ')}`);
  } else {
    console.log('🛑 Stopping all servers');
  }
  
  try {
    await shutdownServers({ sites });
    console.log('✅ Successfully stopped servers');
  } catch (error) {
    console.error('❌ Failed to stop servers:', error);
    process.exit(1);
  }
}

/**
 * List available test types and their requirements
 */
function listTestTypes(): void {
  console.log('📋 Available test types and their server requirements:\n');
  
  Object.entries(TEST_SERVER_REQUIREMENTS).forEach(([testType, sites]) => {
    console.log(`  ${testType.padEnd(25)} → ${sites.join(', ')}`);
  });
  
  console.log('\n💡 Usage examples:');
  console.log('  # Start servers for smoke tests');
  console.log('  pnpm test:servers start --test-type smoke:all');
  console.log('');
  console.log('  # Start only portal server for portal smoke tests');
  console.log('  pnpm test:servers start --test-type smoke:portal');
  console.log('');
  console.log('  # Start specific sites manually');
  console.log('  pnpm test:servers start --sites portal,isbdm');
  console.log('');
  console.log('  # Stop servers for specific test type');
  console.log('  pnpm test:servers stop --test-type smoke:all');
}

// CLI Configuration
program
  .name('test-server-manager')
  .description('Start and stop servers based on test requirements')
  .version('1.0.0');

program
  .command('start')
  .description('Start servers for specific test type')
  .option('-t, --test-type <type>', 'Test type (e.g., smoke:portal, e2e:all)', 'default')
  .option('-m, --mode <mode>', 'Server mode (headless|interactive)', 'headless')
  .option('--no-reuse', 'Don\'t reuse existing servers')
  .option('-s, --sites <sites>', 'Comma-separated list of sites to start (overrides test-type)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    await startTestServers({
      testType: options.testType,
      mode: options.mode as ServerMode,
      reuseExisting: !options.noReuse,
      sites: options.sites,
      verbose: options.verbose || false,
    });
  });

program
  .command('stop')
  .description('Stop servers for specific test type')
  .option('-t, --test-type <type>', 'Test type to stop servers for')
  .option('-s, --sites <sites>', 'Comma-separated list of sites to stop (overrides test-type)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    await stopTestServers({
      testType: options.testType,
      sites: options.sites,
      verbose: options.verbose || false,
    });
  });

program
  .command('list')
  .description('List available test types and their server requirements')
  .action(listTestTypes);

program
  .command('status')
  .description('Show status of running servers')
  .action(async () => {
    // Import the dev-servers CLI status command
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync('tsx scripts/dev-servers.ts status');
      console.log(stdout);
    } catch (error) {
      console.error('Failed to get server status:', error);
    }
  });

// Handle CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { getRequiredSites, TEST_SERVER_REQUIREMENTS };
