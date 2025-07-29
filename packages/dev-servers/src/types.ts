import { ChildProcess } from 'child_process';

/**
 * Server mode types
 */
export type ServerMode = 'headless' | 'interactive';

/**
 * Browser types for server startup
 */
export type BrowserType = 'chrome' | 'auto';

/**
 * Options for starting development servers
 */
export interface StartServerOptions {
  /** Array of site names to start. If not provided, defaults to all available sites */
  sites?: string[];
  /** Whether to reuse existing servers if they're already running */
  reuseExisting?: boolean;
  /** Server mode - headless implies --no-open, interactive allows browser opening */
  mode?: ServerMode;
  /** Browser type to use when opening pages */
  browser?: BrowserType;
}

/**
 * Information about a running server
 */
export interface ServerInfo {
  /** Name of the site/server */
  site: string;
  /** Port number the server is running on */
  port: number;
  /** The child process handle */
  proc: ChildProcess;
  /** The mode the server is running in */
  mode?: ServerMode;
}

/**
 * Available sites and their default ports
 */
export interface SitePorts {
  [siteName: string]: number;
}

/**
 * Server state information for persistence
 */
export interface ServerState {
  /** Process ID of the server */
  pid: number;
  /** Port the server is running on */
  port: number;
  /** Site name */
  site: string;
  /** Server mode */
  mode: ServerMode;
  /** Timestamp when server was started */
  startedAt: number;
}

/**
 * Complete state file structure
 */
export interface ServerStateFile {
  /** List of running servers */
  servers: ServerState[];
  /** When this state was last updated */
  lastUpdated: number;
  /** Mode of the server session */
  mode: ServerMode;
}
