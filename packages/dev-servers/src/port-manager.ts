import { execSync } from 'child_process';
import { SitePorts } from './types';
import { SITE_CONFIG, ADMIN_PORTAL_CONFIG, SiteKey } from '@ifla/theme/config/siteConfig';

/**
 * Generate port mappings dynamically from siteConfig (single source of truth)
 */
function generateSitePorts(): SitePorts {
  const ports: SitePorts = {};
  
  // Add all Docusaurus sites from SITE_CONFIG
  for (const siteKey of Object.keys(SITE_CONFIG) as SiteKey[]) {
    const config = SITE_CONFIG[siteKey].local;
    if (config.port) {
      ports[siteKey.toLowerCase()] = config.port;
    }
  }
  
  // Add admin portal from ADMIN_PORTAL_CONFIG
  const adminConfig = ADMIN_PORTAL_CONFIG.local;
  if (adminConfig.port) {
    ports.admin = adminConfig.port;
  }
  
  return ports;
}

/**
 * Port mappings for all sites in the IFLA Standards platform
 * Dynamically generated from siteConfig to maintain single source of truth
 */
export const SITE_PORTS: SitePorts = generateSitePorts();

/**
 * All ports used by the project
 */
export const ALL_PORTS = Object.values(SITE_PORTS);

/**
 * Kill processes on a specific port
 * @param port - Port number to clear
 * @param verbose - Whether to show detailed output
 * @returns True if successful, false otherwise
 */
export async function killPort(port: number, verbose: boolean = false): Promise<boolean> {
  try {
    if (verbose) {
      console.log(`🔍 Checking for processes on port ${port}...`);
    }

    // First, try to find processes using the port
    const findCommand = `lsof -ti:${port}`;
    let pids: string;

    try {
      pids = execSync(findCommand, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch {
      // No processes found on this port
      if (verbose) {
        console.log(`✅ Port ${port} is already free`);
      }
      return true;
    }

    if (pids) {
      if (verbose) {
        console.log(`🔄 Killing processes on port ${port}: ${pids.replace(/\n/g, ', ')}`);
      }

      // Kill the processes
      execSync(`kill -9 ${pids.replace(/\n/g, ' ')}`, { stdio: 'pipe' });

      // Wait a moment for processes to die
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (verbose) {
        console.log(`✅ Successfully cleared port ${port}`);
      }
    }

    return true;
  } catch (error) {
    if (verbose) {
      console.error(`❌ Failed to clear port ${port}: ${(error as Error).message}`);
    }
    return false;
  }
}

/**
 * Kill processes on multiple ports
 * @param ports - Array of port numbers to clear
 * @param verbose - Whether to show detailed output
 * @returns True if all successful, false otherwise
 */
export async function killPorts(ports: number[], verbose: boolean = false): Promise<boolean> {
  if (verbose) {
    console.log(`🧹 Clearing ports: ${ports.join(', ')}`);
  }

  const results = await Promise.all(
    ports.map(port => killPort(port, verbose))
  );

  const success = results.every(result => result);

  if (verbose) {
    if (success) {
      console.log(`✅ All ports cleared successfully`);
    } else {
      console.log(`⚠️  Some ports could not be cleared`);
    }
  }

  return success;
}

/**
 * Kill all project-related processes
 * @param verbose - Whether to show detailed output
 * @returns True if successful, false otherwise
 */
export async function killAllPorts(verbose: boolean = false): Promise<boolean> {
  if (verbose) {
    console.log(`🧹 Clearing all IFLA Standards ports...`);
  }

  // Kill all ports
  const portsResult = await killPorts(ALL_PORTS, verbose);

  // Also kill any docusaurus processes that might be lingering
  try {
    if (verbose) {
      console.log(`🔄 Killing any remaining docusaurus processes...`);
    }
    execSync('pkill -f "docusaurus start" 2>/dev/null || true', { stdio: 'pipe' });
    execSync('pkill -f "docusaurus serve" 2>/dev/null || true', { stdio: 'pipe' });
  } catch {
    // Ignore errors - these commands are best effort
  }

  return portsResult;
}

/**
 * Kill ports for a specific site
 * @param siteName - Name of the site (e.g., 'isbd', 'portal')
 * @param verbose - Whether to show detailed output
 * @returns True if successful, false otherwise
 */
export async function killSitePort(siteName: string, verbose: boolean = false): Promise<boolean> {
  const port = SITE_PORTS[siteName.toLowerCase()];

  if (!port) {
    if (verbose) {
      console.error(`❌ Unknown site: ${siteName}`);
      console.log(`Available sites: ${Object.keys(SITE_PORTS).join(', ')}`);
    }
    return false;
  }

  return await killPort(port, verbose);
}

/**
 * Wait for a port to become available
 * @param port - Port to check
 * @param timeout - Timeout in milliseconds
 * @param verbose - Whether to show detailed output
 * @returns True if port becomes available, false if timeout
 */
export async function waitForPortFree(port: number, timeout: number = 10000, verbose: boolean = false): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
      // If we get here, port is still in use
      if (verbose) {
        console.log(`⏳ Port ${port} still in use, waiting...`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Port is free
      if (verbose) {
        console.log(`✅ Port ${port} is now free`);
      }
      return true;
    }
  }

  if (verbose) {
    console.error(`❌ Timeout waiting for port ${port} to become free`);
  }
  return false;
}
