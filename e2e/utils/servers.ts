import { readServerState, getStateFilePath } from '@ifla/dev-servers';
import { existsSync } from 'fs';

/**
 * Check if the server state file exists and contains running headless servers
 * @returns Object containing detection results
 */
export function detectHeadlessServers(): {
  stateFileExists: boolean;
  hasRunningServers: boolean;
  isHeadlessMode: boolean;
  serverCount: number;
  statePath: string;
} {
  const statePath = getStateFilePath();
  const stateFileExists = existsSync(statePath);
  
  if (!stateFileExists) {
    return {
      stateFileExists: false,
      hasRunningServers: false,
      isHeadlessMode: false,
      serverCount: 0,
      statePath
    };
  }

  const state = readServerState();
  
  if (!state || !state.servers || state.servers.length === 0) {
    return {
      stateFileExists: true,
      hasRunningServers: false,
      isHeadlessMode: false,
      serverCount: 0,
      statePath
    };
  }

  // Filter out stale processes (servers that no longer exist)
  const activeServers = state.servers.filter(server => {
    try {
      if (server.pid === 0) return false;
      // Check if process still exists (doesn't throw if process exists)
      process.kill(server.pid, 0);
      return true;
    } catch {
      // Process doesn't exist
      return false;
    }
  });

  const isHeadlessMode = state.mode === 'headless';
  const hasRunningServers = activeServers.length > 0;

  return {
    stateFileExists: true,
    hasRunningServers,
    isHeadlessMode,
    serverCount: activeServers.length,
    statePath
  };
}

/**
 * Check if we should skip server startup because servers are already running
 * @returns boolean indicating whether to skip startup
 */
export function shouldSkipServerStartup(): boolean {
  const detection = detectHeadlessServers();
  return detection.hasRunningServers && detection.isHeadlessMode;
}

/**
 * Check if the IFLA_SERVERS_RUNNING environment variable is set
 * @returns boolean indicating if servers were started by Playwright
 */
export function isPlaywrightManagedServers(): boolean {
  return process.env.IFLA_SERVERS_RUNNING === '1';
}

/**
 * Set the environment variable to indicate servers are running
 */
export function markServersAsRunning(): void {
  process.env.IFLA_SERVERS_RUNNING = '1';
}

/**
 * Clear the environment variable
 */
export function clearServersRunningFlag(): void {
  delete process.env.IFLA_SERVERS_RUNNING;
}

/**
 * Log server detection results for debugging
 * @param detection - Detection results to log
 */
export function logServerDetection(detection: ReturnType<typeof detectHeadlessServers>): void {
  console.log('🔍 Server Detection Results:');
  console.log(`  State file exists: ${detection.stateFileExists}`);
  console.log(`  Has running servers: ${detection.hasRunningServers}`);
  console.log(`  Is headless mode: ${detection.isHeadlessMode}`);
  console.log(`  Server count: ${detection.serverCount}`);
  console.log(`  State file path: ${detection.statePath}`);
  
  if (detection.hasRunningServers && detection.isHeadlessMode) {
    console.log('✅ Existing headless servers detected - will skip startup');
  } else if (detection.hasRunningServers && !detection.isHeadlessMode) {
    console.log('⚠️  Existing non-headless servers detected - will restart in headless mode');
  } else {
    console.log('🚀 No compatible servers detected - will start new headless servers');
  }
}
