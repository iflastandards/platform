/**
 * On-Demand Server Manager for Tests
 * 
 * This module provides intelligent server management that:
 * 1. Starts servers only when needed by specific tests
 * 2. Reuses already-running servers instead of starting duplicates
 * 3. Leaves servers running for subsequent tests
 * 4. Only kills servers on explicit demand or comprehensive test runs
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';

interface ServerState {
  site: string;
  port: number;
  pid?: number;
  startedAt: string;
  mode: 'headless' | 'headed';
}

interface ServerStateFile {
  servers: ServerState[];
  lastUpdated: string;
}

const STATE_FILE = join(process.cwd(), '.test-servers.json');

// Port mapping for each site
const SITE_PORTS: Record<string, number> = {
  portal: 3000,
  isbdm: 3001,
  lrm: 3002,
  frbr: 3003,
  isbd: 3004,
  muldicat: 3005,
  unimarc: 3006,
  admin: 3007,
};

/**
 * Check if a port is in use
 */
async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

/**
 * Read the current server state from disk
 */
function readServerState(): ServerStateFile | null {
  if (!existsSync(STATE_FILE)) {
    return null;
  }
  
  try {
    const content = readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to read server state file:', error);
    return null;
  }
}

/**
 * Write the server state to disk
 */
function writeServerState(state: ServerStateFile): void {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn('Failed to write server state file:', error);
  }
}

/**
 * Check if a server is already running
 */
async function isServerRunning(site: string): Promise<boolean> {
  const port = SITE_PORTS[site];
  if (!port) {
    console.warn(`Unknown site: ${site}`);
    return false;
  }
  
  // First check if port is in use
  const portInUse = await isPortInUse(port);
  
  if (!portInUse) {
    return false;
  }
  
  // Port is in use, check if it's tracked in our state file
  const state = readServerState();
  if (state?.servers) {
    const server = state.servers.find(s => s.site === site);
    if (server) {
      console.log(`✅ ${site} server already running on port ${port} (PID: ${server.pid || 'unknown'})`);
      return true;
    }
  }
  
  // Port is in use but not tracked - likely started manually
  console.log(`✅ ${site} server detected on port ${port} (externally started)`);
  return true;
}

/**
 * Start a single server if not already running
 */
async function startServer(site: string, mode: 'headless' | 'headed' = 'headless'): Promise<void> {
  // Check if already running
  if (await isServerRunning(site)) {
    console.log(`♻️  Reusing existing ${site} server`);
    return;
  }
  
  const port = SITE_PORTS[site];
  console.log(`🚀 Starting ${site} server on port ${port}...`);
  
  // Start the server using pnpm nx
  const command = 'pnpm';
  const args = ['nx', 'start', site];
  
  const serverProcess = spawn(command, args, {
    detached: true,
    stdio: mode === 'headless' ? 'ignore' : 'inherit',
    env: {
      ...process.env,
      PORT: port.toString(),
    }
  });
  
  // Update state file
  const state = readServerState() || { servers: [], lastUpdated: new Date().toISOString() };
  
  // Remove old entry if exists
  state.servers = state.servers.filter(s => s.site !== site);
  
  // Add new entry
  state.servers.push({
    site,
    port,
    pid: serverProcess.pid,
    startedAt: new Date().toISOString(),
    mode,
  });
  
  state.lastUpdated = new Date().toISOString();
  writeServerState(state);
  
  // Detach from the process so it continues running
  serverProcess.unref();
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verify it started
  if (await isPortInUse(port)) {
    console.log(`✅ ${site} server started successfully`);
  } else {
    console.warn(`⚠️  ${site} server may not have started correctly`);
  }
}

/**
 * Start multiple servers based on test requirements
 */
export async function ensureServersRunning(sites: string[]): Promise<void> {
  console.log(`📋 Ensuring servers are running for: ${sites.join(', ')}`);
  
  for (const site of sites) {
    await startServer(site);
  }
  
  console.log('✅ All required servers are running');
}

/**
 * Get the list of sites that need servers based on the test file or project
 */
export function getRequiredServersForTest(testPath: string): string[] {
  const servers: Set<string> = new Set();
  
  // Portal tests
  if (testPath.includes('portal') || testPath.includes('standards/portal')) {
    servers.add('portal');
  }
  
  // Admin tests
  if (testPath.includes('admin') || testPath.includes('apps/admin')) {
    servers.add('admin');
    servers.add('portal'); // Admin often needs portal too
  }
  
  // Individual standard sites
  for (const site of ['isbdm', 'lrm', 'frbr', 'isbd', 'muldicat', 'unimarc']) {
    if (testPath.includes(site) || testPath.includes(`standards/${site}`)) {
      servers.add(site);
    }
  }
  
  // Integration tests might need multiple servers
  if (testPath.includes('integration')) {
    // Integration tests often test cross-site functionality
    if (testPath.includes('cross-site') || testPath.includes('navigation')) {
      servers.add('portal');
      servers.add('isbdm');
      servers.add('lrm');
    }
    
    if (testPath.includes('rbac') || testPath.includes('auth')) {
      servers.add('admin');
      servers.add('portal');
    }
  }
  
  // E2E tests
  if (testPath.includes('e2e')) {
    // E2E tests are usually more focused
    // The specific server will be determined by the path
    // Default to portal if not specific
    if (servers.size === 0) {
      servers.add('portal');
    }
  }
  
  return Array.from(servers);
}

/**
 * Stop all test servers
 */
export async function stopAllServers(): Promise<void> {
  const state = readServerState();
  if (!state?.servers || state.servers.length === 0) {
    console.log('No servers to stop');
    return;
  }
  
  console.log(`Stopping ${state.servers.length} servers...`);
  
  for (const server of state.servers) {
    if (server.pid) {
      try {
        process.kill(server.pid, 'SIGTERM');
        console.log(`Stopped ${server.site} (PID: ${server.pid})`);
      } catch (error: any) {
        if (error.code === 'ESRCH') {
          console.log(`${server.site} already stopped`);
        } else {
          console.warn(`Failed to stop ${server.site}:`, error.message);
        }
      }
    }
  }
  
  // Clear the state file
  writeServerState({ servers: [], lastUpdated: new Date().toISOString() });
}

/**
 * Get status of all servers
 */
export async function getServerStatus(): Promise<void> {
  const state = readServerState();
  
  if (!state?.servers || state.servers.length === 0) {
    console.log('No servers tracked');
    return;
  }
  
  console.log('Server Status:');
  console.log('─'.repeat(50));
  
  for (const server of state.servers) {
    const running = await isPortInUse(server.port);
    const status = running ? '🟢 Running' : '🔴 Stopped';
    console.log(`${status} ${server.site} (port ${server.port}, PID: ${server.pid || 'unknown'})`);
  }
}