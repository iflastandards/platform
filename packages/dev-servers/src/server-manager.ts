import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { StartServerOptions, ServerInfo } from './types';
import { SITE_PORTS, killSitePort, waitForPortFree } from './port-manager';
import { getSiteConfig, getAdminPortalConfig, SiteKey } from '@ifla/theme/config/siteConfig';
import { 
  checkModeCompatibility, 
  updateServerState, 
  clearServerState
} from './state-manager';

// Fetch polyfill for Node.js environments
let fetch: typeof globalThis.fetch;
if (typeof globalThis.fetch === 'undefined') {
  // Dynamic import to avoid issues with bundling
  fetch = require('node-fetch');
} else {
  fetch = globalThis.fetch;
}

/**
 * Check if a server is responding by polling the health endpoint or root path
 * Uses siteConfig to determine proper base URLs and paths for each site
 * @param siteName - Name of the site to check
 * @param port - Port to check
 * @param timeout - Max time to wait in milliseconds (default: 30000)
 * @returns Promise<boolean> - True if server is ready
 */
async function waitForServerReady(siteName: string, port: number, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  let delay = 1000; // Start with 1 second
  
  while (Date.now() - startTime < timeout) {
    try {
      // Get base URL from siteConfig for proper health check paths
      let baseUrl = '/';
      try {
        if (siteName === 'admin') {
          const adminConfig = getAdminPortalConfig('local');
          baseUrl = '/admin/'; // Admin base URL
        } else {
          const siteConfig = getSiteConfig(siteName.toUpperCase() as SiteKey, 'local');
          baseUrl = siteConfig.baseUrl;
        }
      } catch {
        // Fallback to root if site not found in config
        baseUrl = '/';
      }
      
      // Construct health check URLs using proper base paths
      const healthUrls = [
        `http://localhost:${port}${baseUrl}api/health`,
        `http://localhost:${port}${baseUrl}health`,
        `http://localhost:${port}${baseUrl}`, // Base URL
        `http://localhost:${port}/api/health`, // Fallback to root
        `http://localhost:${port}/health`, // Fallback to root
        `http://localhost:${port}/` // Final fallback
      ];
      
      for (const url of healthUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'dev-servers-health-check' }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            return true;
          }
        } catch {
          // Try next URL
          continue;
        }
      }
    } catch {
      // Server not ready yet
    }
    
    // Exponential backoff with jitter
    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 5000); // Cap at 5 seconds
  }
  
  return false;
}

/**
 * Gracefully shutdown existing servers via shutdown endpoint or SIGTERM
 * @param existingServers - Array of existing server states
 */
async function shutdownExistingServers(existingServers: any[]): Promise<void> {
  console.log(`🔄 Gracefully shutting down ${existingServers.length} existing servers...`);
  
  for (const server of existingServers) {
    console.log(`🛑 Shutting down ${server.site} on port ${server.port} (PID: ${server.pid})`);
    
    // Try shutdown endpoint first
    let shutdownSuccess = false;
    try {
      const shutdownUrl = `http://localhost:${server.port}/__shutdown`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(shutdownUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'User-Agent': 'dev-servers-shutdown' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ ${server.site} shutdown via endpoint`);
        shutdownSuccess = true;
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch {
      // Shutdown endpoint not available or failed
    }
    
    // If shutdown endpoint failed, use SIGTERM
    if (!shutdownSuccess && server.pid > 0) {
      try {
        process.kill(server.pid, 'SIGTERM');
        console.log(`📡 Sent SIGTERM to ${server.site} (PID: ${server.pid})`);
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if process still exists, if so, force kill
        try {
          process.kill(server.pid, 0); // Check if process exists
          process.kill(server.pid, 'SIGKILL');
          console.log(`⚡ Force killed ${server.site} (PID: ${server.pid})`);
        } catch {
          // Process already dead
          console.log(`✅ ${server.site} shutdown gracefully`);
        }
      } catch (error) {
        console.error(`❌ Failed to shutdown ${server.site}: ${error}`);
      }
    }
    
    // Clean up the port
    await killSitePort(server.site, false);
  }
  
  console.log('🧹 Existing servers shutdown complete.');
}

/**
 * Start development servers for specified sites
 * @param opts - Options for starting servers
 * @returns Promise<ServerInfo[]> - Array of started server information
 */
export async function startServers(opts: StartServerOptions = {}): Promise<ServerInfo[]> {
  const { 
    sites = Object.keys(SITE_PORTS), 
    reuseExisting = false, 
    mode = 'headless',
    browser = 'auto'
  } = opts;
  const servers: ServerInfo[] = [];
  
  console.log(`🚀 Starting servers for sites: ${sites.join(', ')}`);
  console.log(`🎯 Mode: ${mode}${mode === 'headless' ? ' (implies --no-open)' : ''}`);
  console.log(`🌐 Browser: ${browser}`);
  console.log(`♻️  Reuse existing: ${reuseExisting}`);
  console.log('');
  
  // Check mode compatibility with existing servers
  const compatibility = checkModeCompatibility(mode);
  
  if (compatibility.existingServers.length > 0) {
    if (compatibility.compatible) {
      console.log(`✅ Found ${compatibility.existingServers.length} existing servers in compatible mode (${compatibility.existingMode})`);
      
      if (reuseExisting) {
        // Reuse existing servers
        console.log('🔄 Reusing existing servers and exiting...');
        
        for (const existingServer of compatibility.existingServers) {
          const isReady = await waitForServerReady(existingServer.site, existingServer.port, 5000);
          if (isReady) {
            console.log(`✅ Reusing ${existingServer.site} on port ${existingServer.port}`);
            // Create a mock process entry for consistency
            const mockProc = { 
              kill: () => {}, 
              pid: existingServer.pid 
            } as ChildProcess;
            servers.push({ 
              site: existingServer.site, 
              port: existingServer.port, 
              proc: mockProc, 
              mode: existingServer.mode 
            });
          }
        }
        
        if (servers.length > 0) {
          console.log(`🎉 Reusing ${servers.length} existing servers!`);
          return servers;
        }
      }
    } else {
      console.log(`⚠️  Found ${compatibility.existingServers.length} existing servers in incompatible mode (${compatibility.existingMode} vs ${mode})`);
      console.log('🔄 Shutting down existing servers before starting new ones...');
      
      // Gracefully shutdown existing servers
      await shutdownExistingServers(compatibility.existingServers);
      
      // Clear the state file
      clearServerState();
      
      console.log('✅ Ready to start servers in new mode');
      console.log('');
    }
  }

  for (const site of sites) {
    const port = SITE_PORTS[site.toLowerCase()];
    if (!port) {
      console.error(`❌ Unknown site: ${site}`);
      console.log(`Available sites: ${Object.keys(SITE_PORTS).join(', ')}`);
      continue;
    }

    console.log(`🔧 Processing site: ${site} (port ${port})`);

    // Check if server is already running and reuse if requested
    if (reuseExisting) {
      const isReady = await waitForServerReady(site, port, 5000);
      if (isReady) {
        console.log(`✅ Server for ${site} is already running on port ${port}`);
        // Create a mock process entry for consistency
        const mockProc = { kill: () => {} } as ChildProcess;
        servers.push({ site, port, proc: mockProc });
        continue;
      }
    }

    // If port is already in use and reuseExisting is false, attempt to free it
    let portCleared = false;
    const isPortInUse = await waitForServerReady(site, port, 1000); // Quick check
    
    if (isPortInUse && !reuseExisting) {
      console.log(`🧹 Port ${port} is in use, attempting to free it for ${site}...`);
      
      // First attempt to clear the port
      const firstAttempt = await killSitePort(site, false);
      if (firstAttempt) {
        await waitForPortFree(port, 5000, false);
        portCleared = true;
      }
      
      // If first attempt failed, retry once
      if (!portCleared) {
        console.log(`🔄 Retrying port cleanup for ${site}...`);
        const retryAttempt = await killSitePort(site, true); // verbose on retry
        if (retryAttempt) {
          await waitForPortFree(port, 5000, false);
          portCleared = true;
        }
      }
      
      if (!portCleared) {
        console.error(`❌ Failed to free port ${port} for ${site} after retry`);
        continue;
      }
    } else if (!isPortInUse) {
      // Port is free, just make sure it's clean
      console.log(`🧹 Ensuring port ${port} is clean for ${site}...`);
      await killSitePort(site, false);
      await waitForPortFree(port, 2000, false);
    }

    // Determine the command to run based on site type and mode
    let nxCommand: string[];
    if (site === 'admin') {
      // Admin uses Next.js dev server
      nxCommand = ['run', `${site}:dev`];
    } else {
      // For Docusaurus sites, choose target based on mode
      if (mode === 'interactive') {
        // Interactive mode: use start:interactive target (allows browser opening)
        nxCommand = ['run', `${site}:start:interactive`];
      } else {
        // Headless mode: use start:robust (with --no-open and port cleanup)
        nxCommand = ['run', `${site}:start:robust`];
      }
    }
    
    const commandStr = `nx ${nxCommand.join(' ')}`;
    console.log(`📡 Starting server: ${commandStr}`);

    // Create a prefixed output stream for this server
    const browserSetting = mode === 'headless' ? 'none' : (browser === 'chrome' ? 'chrome' : 'auto');
    
    const proc = spawn('nx', nxCommand, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true, // Allow process to run independently
      env: { 
        ...process.env, 
        DOCS_ENV: process.env.DOCS_ENV || 'local',
        BROWSER: browserSetting
      }
    });

    // Pipe stdout/stderr with prefixed output
    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            console.log(`[${site}] ${line}`);
          }
        });
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            console.error(`[${site}:ERROR] ${line}`);
          }
        });
      });
    }

    proc.on('error', (error) => {
      console.error(`❌ Failed to start ${site}: ${error.message}`);
    });

    servers.push({ site, port, proc });

    // Wait for the server to be ready
    console.log(`⏳ Waiting for ${site} to be ready on port ${port}...`);
    const isReady = await waitForServerReady(site, port, 30000);
    
    if (isReady) {
      console.log(`✅ Server for ${site} is ready on port ${port}`);
    } else {
      console.error(`❌ Time-out after 30 s if a server doesn't report ready → log site name and exit 1`);
      console.error(`Server for site '${site}' failed to become ready within 30 seconds`);
      
      // Kill the process that failed to start properly
      try {
        if (proc.pid) {
          await new Promise<void>((resolve) => {
            treeKill(proc.pid!, 'SIGTERM', (error?: Error) => {
              if (error) {
                console.error(`Failed to kill process tree for ${site}: ${error.message}`);
              }
              resolve();
            });
          });
        }
      } catch (error) {
        console.error(`Error killing failed process for ${site}: ${error}`);
      }
      
      // Exit with code 1 as required
      process.exit(1);
    }
    
    console.log('');
  }

  // Persist server state to help Playwright and other tools
  if (servers.length > 0) {
    const serverInfoWithMode = servers.map(server => ({
      ...server,
      mode: mode
    }));
    updateServerState(serverInfoWithMode, mode);
    console.log(`💾 Server state persisted to ${require('os').tmpdir()}/.ifla-server-state.json`);
  }
  
  console.log(`🎉 Started ${servers.length} servers successfully!`);
  return servers;
}

/**
 * Stop all provided servers and clean up their ports
 * @param servers - Array of server information to stop
 */
export async function stopServers(servers: ServerInfo[]): Promise<void> {
  console.log(`🛑 Stopping ${servers.length} servers...`);
  
  for (const { site, port, proc } of servers) {
    console.log(`🔄 Stopping server for ${site} on port ${port}`);
    
    try {
      // Use tree-kill to properly terminate all child processes
      if (proc.pid) {
        await new Promise<void>((resolve) => {
          // Send SIGTERM first for graceful shutdown
          treeKill(proc.pid!, 'SIGTERM', (error?: Error) => {
            if (error) {
              console.error(`Error sending SIGTERM to ${site}: ${error.message}`);
            }
            resolve();
          });
        });
        
        // Wait a moment for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Force kill if still running
        await new Promise<void>((resolve) => {
          treeKill(proc.pid!, 'SIGKILL', (error?: Error) => {
            if (error && error.message !== 'No such process') {
              console.error(`Error sending SIGKILL to ${site}: ${error.message}`);
            }
            resolve();
          });
        });
      } else {
        // Fallback for mock processes or processes without PID
        proc.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 1000));
        proc.kill('SIGKILL');
      }
      
      // Clean up the port
      await killSitePort(site, false);
      
      console.log(`✅ Stopped ${site}`);
    } catch (error) {
      console.error(`❌ Error stopping ${site}: ${error}`);
    }
  }
  
  // Clear the server state file after stopping all servers
  clearServerState();
  
  console.log('🧹 All servers stopped and ports cleaned up.');
  console.log('💾 Server state cleared.');
}
