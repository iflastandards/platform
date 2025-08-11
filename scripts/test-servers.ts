#!/usr/bin/env tsx
/**
 * Test Server Management CLI
 * 
 * Commands:
 *   pnpm test:servers status      - Show status of all test servers
 *   pnpm test:servers stop        - Stop all test servers
 *   pnpm test:servers start <site> - Start a specific server
 */

import { program } from 'commander';
import { 
  getServerStatus, 
  stopAllServers, 
  ensureServersRunning 
} from '../e2e/utils/server-manager';

program
  .name('test-servers')
  .description('Manage test servers for Playwright tests')
  .version('1.0.0');

program
  .command('status')
  .description('Show status of all test servers')
  .action(async () => {
    await getServerStatus();
  });

program
  .command('stop')
  .description('Stop all test servers')
  .action(async () => {
    await stopAllServers();
    console.log('✅ All servers stopped');
  });

program
  .command('start <sites...>')
  .description('Start specific test servers')
  .option('-m, --mode <mode>', 'Server mode (headless/headed)', 'headless')
  .action(async (sites: string[]) => {
    console.log(`Starting servers: ${sites.join(', ')}`);
    await ensureServersRunning(sites);
  });

program.parse(process.argv);