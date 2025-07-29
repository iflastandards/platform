import { isPlaywrightManagedServers, clearServersRunningFlag } from '../utils/servers';

export default async () => {
  console.log('🎭 Playwright Global Teardown - Server Cleanup Check');
  
  // Check if IFLA_SERVERS_RUNNING environment variable is set
  const playwrightManagedServers = isPlaywrightManagedServers();
  
  if (!playwrightManagedServers) {
    // Servers were pre-existing (not started by Playwright) - do NOT shut anything down
    console.log('♻️  Servers were pre-existing - leaving them running');
    console.log('🎭 Global teardown complete - no server shutdown performed');
    return;
  }
  
  // If Playwright started the servers, leave them running per requirement
  console.log('🔄 Servers were started by Playwright - leaving them running as requested');
  console.log('💡 Servers will remain available for subsequent test runs');
  
  // Clear the environment variable for next test run
  clearServersRunningFlag();
  
  console.log('🎭 Global teardown complete - servers remain running');
  
  // Return early instead of killing servers
  // This satisfies the requirement to leave servers running
};
