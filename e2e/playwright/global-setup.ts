import { startServers } from '@ifla/dev-servers';
import { 
  detectHeadlessServers, 
  shouldSkipServerStartup, 
  markServersAsRunning, 
  logServerDetection 
} from '../utils/servers';

let servers: any[] = [];

export default async () => {
  console.log('🎭 Playwright Global Setup - Server Management');
  
  // 1. Check .ifla-server-state.json for existing headless servers
  const detection = detectHeadlessServers();
  logServerDetection(detection);
  
  if (shouldSkipServerStartup()) {
    // Headless servers are already running - skip spawn and set environment variable
    console.log('♻️  Reusing existing headless servers');
    markServersAsRunning();
    
    return async () => {
      // Return a no-op teardown function since we didn't start these servers
      console.log('🎭 Playwright Global Teardown - No action needed (reused existing servers)');
    };
  }
  
  // 2. Otherwise call dev-servers --mode=headless
  console.log('🚀 Starting new headless servers...');
  
  try {
    servers = await startServers({ 
      mode: 'headless',
      reuseExisting: false // Force new servers since we checked compatibility above
    });
    
    // Mark that Playwright started these servers
    markServersAsRunning();
    
    console.log(`✅ Started ${servers.length} servers successfully`);
    
    // Return teardown function
    return async () => {
      console.log('🎭 Playwright Global Teardown - Servers will remain running as requested');
      // Per requirement: leave servers running instead of killing them
      // The servers will be left running for potential reuse by subsequent test runs
    };
    
  } catch (error) {
    console.error('❌ Failed to start servers:', error);
    throw error;
  }
};
