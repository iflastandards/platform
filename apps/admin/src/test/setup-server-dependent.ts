// Import node-fetch for server-dependent tests
import fetch from 'node-fetch';

// Make fetch available globally
global.fetch = fetch as any;

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args: any[]) => {
  // Only show server startup/shutdown messages
  const firstArg = args[0];
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('Starting') ||
      firstArg.includes('Server') ||
      firstArg.includes('ready'))
  ) {
    originalConsoleLog(...args);
  }
};

console.error = (...args: any[]) => {
  // Always show errors
  originalConsoleError(...args);
};

// Restore console on cleanup
process.on('exit', () => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
