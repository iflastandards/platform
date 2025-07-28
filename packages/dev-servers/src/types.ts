import { ChildProcess } from 'child_process';

/**
 * Options for starting development servers
 */
export interface StartServerOptions {
  /** Array of site names to start. If not provided, defaults to all available sites */
  sites?: string[];
  /** Whether to reuse existing servers if they're already running */
  reuseExisting?: boolean;
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
}

/**
 * Available sites and their default ports
 */
export interface SitePorts {
  [siteName: string]: number;
}
