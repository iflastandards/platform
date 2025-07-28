#!/usr/bin/env node

import { execSync } from 'child_process';
import { startServers, stopServers, StartServerOptions, ServerInfo } from '@ifla/dev-servers';
import { SITE_CONFIG, ADMIN_PORTAL_CONFIG, SiteKey } from '../packages/theme/src/config/siteConfig';

// Generate site ports from siteConfig for CLI status checks
function getSitePorts() {
  const ports: Record<string, number> = {};
  
  // Add all Docusaurus sites
  for (const siteKey of Object.keys(SITE_CONFIG) as SiteKey[]) {
    const config = SITE_CONFIG[siteKey].local;
    if (config.port) {
      ports[siteKey.toLowerCase()] = config.port;
    }
  }
  
  // Add admin portal
  const adminConfig = ADMIN_PORTAL_CONFIG.local;
  if (adminConfig.port) {
    ports.admin = adminConfig.port;
  }
  
  return ports;
}

const SITE_PORTS = getSitePorts();

/**
 * Parse environment variables and CLI flags to determine which sites to start
 * @param args - Command line arguments
 * @returns Array of site names
 */
function parseSitesFromArgs(args: string[]): string[] {
  // Check for --sites flag
  const sitesIndex = args.findIndex(arg => arg === '--sites');
  if (sitesIndex !== -1 && args[sitesIndex + 1]) {
    return args[sitesIndex + 1].split(',').map(s => s.trim());
  }
  
  // Check for --sites=value format
  const sitesArg = args.find(arg => arg.startsWith('--sites='));
  if (sitesArg) {
    return sitesArg.split('=')[1].split(',').map(s => s.trim());
  }
  
  // Check DOCS_SITES environment variable
  const docsSites = process.env.DOCS_SITES;
  if (docsSites) {
    return docsSites.split(',').map(s => s.trim());
  }
  
  // Default to all sites
  return Object.keys(SITE_PORTS);
}

/**
 * Check if reuse existing servers option is enabled
 * @param args - Command line arguments
 * @returns boolean
 */
function parseReuseExisting(args: string[]): boolean {
  return args.includes('--reuse-existing') || args.includes('--reuseExisting');
}

// Note: startServers and stopServers are imported from @ifla/dev-servers package

// CLI interface when run directly
if (require.main === module || process.argv.includes('--cli')) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Dev Servers Manager for IFLA Standards

Usage:
  tsx scripts/dev-servers.ts [options]

Options:
  --sites=site1,site2    Specify which sites to start (comma-separated)
  --reuse-existing       Skip starting if server is already running
  --no-kill              Leave servers running on exit
  --status               Report which required ports are currently alive
  --cli                  Force CLI mode
  --help, -h             Show this help

Environment Variables:
  DOCS_SITES=site1,site2  Specify sites via environment variable

Examples:
  tsx scripts/dev-servers.ts --sites=portal,isbd
  tsx scripts/dev-servers.ts --sites=portal,isbd --no-kill
  tsx scripts/dev-servers.ts --status
  DOCS_SITES=portal,isbd tsx scripts/dev-servers.ts
  tsx scripts/dev-servers.ts --sites=portal --reuse-existing

Available sites: ${Object.keys(SITE_PORTS).join(', ')}
`);
    process.exit(0);
  }
  
  // Handle --status flag
  if (args.includes('--status')) {
    console.log('\nPort Status:');
    for (const [site, port] of Object.entries(SITE_PORTS)) {
      try {
        execSync(`lsof -i:${port}`, { stdio: 'pipe' });
        console.log(`  ${site}: Port ${port} is ✅ active`);
      } catch {
        console.log(`  ${site}: Port ${port} is ❌ inactive`);
      }
    }
    process.exit(0);
  }
  
  const sites = parseSitesFromArgs(args);
  const reuseExisting = parseReuseExisting(args);
  const noKill = args.includes('--no-kill');
  
  startServers({ sites, reuseExisting })
    .then((servers) => {
      console.log(`\n🎯 Development servers running:`);
      servers.forEach(({ site, port }) => {
        console.log(`  ${site}: http://localhost:${port}`);
      });
      
      if (noKill) {
        console.log('\n🛑 Servers are left running due to --no-kill flag\n');
        process.exit(0);
        return;
      }
      
      console.log('\n🔄 Press Ctrl+C to stop all servers\n');
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down servers...');
        stopServers(servers).then(() => {
          process.exit(0);
        });
      });
      
      process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down servers...');
        stopServers(servers).then(() => {
          process.exit(0);
        });
      });
    })
    .catch((error) => {
      console.error(`❌ Failed to start servers: ${error.message}`);
      process.exit(1);
    });
}

