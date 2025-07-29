import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ServerState, ServerStateFile, ServerMode, ServerInfo } from './types';

/**
 * Path to the server state file in system temp directory
 */
const STATE_FILE_PATH = join(tmpdir(), '.ifla-server-state.json');

/**
 * Read the current server state from disk
 * @returns ServerStateFile or null if file doesn't exist or is invalid
 */
export function readServerState(): ServerStateFile | null {
  try {
    if (!existsSync(STATE_FILE_PATH)) {
      return null;
    }

    const content = readFileSync(STATE_FILE_PATH, 'utf-8');
    const state: ServerStateFile = JSON.parse(content);

    // Validate the structure
    if (!state.servers || !Array.isArray(state.servers) || !state.mode) {
      return null;
    }

    return state;
  } catch (error) {
    console.warn(`Warning: Could not read server state file: ${error}`);
    return null;
  }
}

/**
 * Write server state to disk
 * @param state - Server state to persist
 */
export function writeServerState(state: ServerStateFile): void {
  try {
    writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error(`Failed to write server state file: ${error}`);
  }
}

/**
 * Clear the server state file
 */
export function clearServerState(): void {
  try {
    if (existsSync(STATE_FILE_PATH)) {
      writeFileSync(STATE_FILE_PATH, JSON.stringify({
        servers: [],
        lastUpdated: Date.now(),
        mode: 'headless'
      }, null, 2));
    }
  } catch (error) {
    console.error(`Failed to clear server state file: ${error}`);
  }
}

/**
 * Update server state with current running servers
 * @param servers - Array of running server info
 * @param mode - Current server mode
 */
export function updateServerState(servers: ServerInfo[], mode: ServerMode): void {
  const serverStates: ServerState[] = servers.map(server => ({
    pid: server.proc.pid || 0,
    port: server.port,
    site: server.site,
    mode: server.mode || mode,
    startedAt: Date.now()
  }));

  const state: ServerStateFile = {
    servers: serverStates,
    lastUpdated: Date.now(),
    mode
  };

  writeServerState(state);
}

/**
 * Check if existing servers match the requested mode
 * @param requestedMode - The mode being requested
 * @returns Object with match status and existing server info
 */
export function checkModeCompatibility(requestedMode: ServerMode): {
  compatible: boolean;
  existingMode?: ServerMode;
  existingServers: ServerState[];
} {
  const state = readServerState();

  if (!state || state.servers.length === 0) {
    return {
      compatible: true,
      existingServers: []
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

  if (activeServers.length === 0) {
    return {
      compatible: true,
      existingServers: []
    };
  }

  return {
    compatible: state.mode === requestedMode,
    existingMode: state.mode,
    existingServers: activeServers
  };
}

/**
 * Get the path to the state file (useful for tests)
 */
export function getStateFilePath(): string {
  return STATE_FILE_PATH;
}
